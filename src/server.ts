import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

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
