import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  apiRootStatusResponse,
  ensureNodeGlobals,
  isApiRootRequest,
  loadLocalEnvFile,
  normalizeBackendMountPath,
  rewriteRequestPath,
} from "./lib/backend-mount";

// Node ESM has no __dirname/__filename, but bundled CJS (Firestore libs)
// references bare __dirname — seed globals before anything else evaluates.
ensureNodeGlobals();
// cPanel split deploy: secrets may live in ~/backend/.env next to the app
// instead of the process environment. Fill-only (real env vars always win),
// runs once at startup before any route module is evaluated.
loadLocalEnvFile();

type FetchHandler = (request: Request, ...args: Array<unknown>) => Promise<Response> | Response;

let fetchHandlerPromise: Promise<FetchHandler> | undefined;

async function getFetchHandler(): Promise<FetchHandler> {
  if (!fetchHandlerPromise) {
    fetchHandlerPromise = import("@tanstack/react-start/server-entry").then((m: any) => {
      // The server-entry export shape varies by bundler/preset (Vite SSR,
      // Nitro presets, preview): default {fetch}, named fetch export, bare
      // function, or nested default interop. Accept any of them instead of
      // assuming one shape (a wrong assumption 500s every prerender fetch).
      const candidates: Array<unknown> = [m?.default, m, m?.default?.default, m?.handler];
      for (const c of candidates) {
        if (typeof c === "function") return c as FetchHandler;
        const f = (c as Record<string, unknown> | null | undefined)?.["fetch"];
        if (typeof f === "function") return (f as FetchHandler).bind(c);
      }
      if (typeof m?.fetch === "function") return m.fetch as FetchHandler;
      throw new Error(
        `Unable to resolve a fetch handler from server entry (exports: ${Object.keys(m ?? {}).join(",") || "none"})`,
      );
    });
  }
  return fetchHandlerPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      // Mount-root status: opening /api in a browser shows a JSON success
      // document instead of SSR-ing the homepage (works unstripped; the
      // public_html rewrite adds ?api-root=1 so stripped arrivals match too).
      if (isApiRootRequest(url.pathname, url.search)) {
        return apiRootStatusResponse();
      }
      // Namecheap split deploy: the app is mounted at /api (public_html holds
      // the static frontend; Apache rewrites non-file paths to /api/<path>).
      // Passenger may or may not strip the mount prefix before the request
      // reaches Node — normalize both shapes to the canonical in-app route.
      const mountedPath = normalizeBackendMountPath(url.pathname);
      // Crawlers request /sitemap.xml, but file-based routing maps dots to
      // slashes (/sitemap/xml). Rewrite internally so the canonical path serves
      // the real content (no extra redirect hop). (/robots.txt is a static
      // file in public/ and needs no rewrite.)
      const routedPath = mountedPath === "/sitemap.xml" ? "/sitemap/xml" : mountedPath;
      if (routedPath !== url.pathname) {
        request = rewriteRequestPath(request, routedPath);
      }
      const handle = await getFetchHandler();
      const response = await handle(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
