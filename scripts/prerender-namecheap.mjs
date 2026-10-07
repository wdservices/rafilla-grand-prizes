// Post-build prerender for the Namecheap release.
//
// Boots the freshly built nitro node-server locally, fetches each public
// route, and writes the SSR HTML to .output/public/<route>/index.html
// (root "/" -> .output/public/index.html). That is the exact layout Apache
// (public_html) and Nitro's static handler expect.
//
// Why not the plugin's prerender step? Its preview shim imports nitro's
// node-server entry, whose default export has no .fetch (and importing it
// starts a rogue listener that hangs the build), so every route 500s and
// zero pages are emitted. Crawling the real production server is
// deterministic: real bundle, real asset URLs, VITE_BUILD_ID baked in.
//
// Route list mirrors PRERENDER_PATHS in vite.config.ts — keep in sync.
// Usage: node scripts/prerender-namecheap.mjs (called by build-namecheap.ps1).

import { spawn, execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = join(ROOT, ".output", "public");
const SERVER_ENTRY = join(ROOT, ".output", "server", "index.mjs");
const PORT = 32173;
const BASE = `http://127.0.0.1:${PORT}`;

// Keep in sync with PRERENDER_PATHS in vite.config.ts.
const ROUTES = [
  "/",
  "/competitions",
  "/winners",
  "/about",
  "/how-it-works",
  "/faq",
  "/contact",
  "/competition-rules",
  "/terms-and-conditions",
  "/privacy-policy",
  "/trust-safety",
  "/become-a-partner",
];

function outPath(route) {
  if (route === "/") return join(PUBLIC_DIR, "index.html");
  return join(PUBLIC_DIR, route.replace(/^\/+/, ""), "index.html");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(5000) });
      // 200 = fully configured, 503 = up but missing secrets — either way it serves.
      if (res.status === 200 || res.status === 503) return;
      lastError = `HTTP ${res.status}`;
    } catch (error) {
      lastError = String((error && error.message) || error);
    }
    await sleep(1000);
  }
  throw new Error(`server did not become ready: ${lastError}`);
}

function killTree(child) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    child.once("exit", finish);
    try {
      child.kill("SIGTERM");
    } catch {
      finish();
    }
    setTimeout(() => {
      if (done) return;
      try {
        if (process.platform === "win32") {
          execFile("taskkill", ["/PID", String(child.pid), "/T", "/F"], () => finish());
          setTimeout(finish, 3000);
        } else {
          try {
            child.kill("SIGKILL");
          } catch {
            finish();
          }
        }
      } catch {
        finish();
      }
    }, 5000).unref?.();
  });
}

async function main() {
  const child = spawn(process.execPath, [SERVER_ENTRY], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      NITRO_PORT: String(PORT),
      HOST: "127.0.0.1",
      NITRO_HOST: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  let stderrTail = "";
  child.stderr.on("data", (chunk) => {
    stderrTail = (stderrTail + String(chunk)).slice(-4000);
  });
  child.on("error", (error) => {
    stderrTail += `\n[spawn error] ${String((error && error.message) || error)}`;
  });
  try {
    await waitForServer(90000);
    for (const route of ROUTES) {
      const res = await fetch(`${BASE}${route}`, {
        headers: { accept: "text/html" },
        signal: AbortSignal.timeout(30000),
      });
      if (res.status !== 200) {
        throw new Error(
          `prerender ${route}: HTTP ${res.status} (refusing to ship an error page as static HTML)`,
        );
      }
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        throw new Error(`prerender ${route}: unexpected content-type ${contentType}`);
      }
      const html = await res.text();
      if (html.length < 5000 || !html.includes("/assets/")) {
        throw new Error(
          `prerender ${route}: suspicious output (${html.length} chars, no asset refs) — refusing to ship it`,
        );
      }
      const dest = outPath(route);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, html);
      console.log(`prerendered ${route} (${html.length} chars)`);
    }
    console.log(`Prerender OK: ${ROUTES.length} pages`);
  } catch (error) {
    if (stderrTail) console.error(`--- server stderr (tail) ---\n${stderrTail}`);
    throw error;
  } finally {
    await killTree(child);
  }
}

main().catch((error) => {
  console.error(`prerender-namecheap FAILED: ${String((error && error.message) || error)}`);
  process.exit(1);
});
