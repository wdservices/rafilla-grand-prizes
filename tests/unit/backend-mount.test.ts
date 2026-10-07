import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  apiRootStatusResponse,
  ensureNodeGlobals,
  getPackagedBuildId,
  isApiRootRequest,
  loadLocalEnvFile,
  normalizeBackendMountPath,
  rewriteRequestPath,
} from "@/lib/backend-mount";

describe("ensureNodeGlobals", () => {
  it("seeds __dirname/__filename globals without overriding real ones", () => {
    const g = globalThis as Record<string, unknown>;
    const prevDir = g["__dirname"];
    const prevFile = g["__filename"];
    try {
      delete g["__dirname"];
      delete g["__filename"];
      ensureNodeGlobals("/fake/backend");
      expect(g["__dirname"]).toBe("/fake/backend");
      expect(g["__filename"]).toBe(join("/fake/backend", "server", "index.mjs"));
      // Second call never overrides, even with a different dir.
      ensureNodeGlobals("/other/root");
      expect(g["__dirname"]).toBe("/fake/backend");
    } finally {
      if (prevDir === undefined) delete g["__dirname"];
      else g["__dirname"] = prevDir;
      if (prevFile === undefined) delete g["__filename"];
      else g["__filename"] = prevFile;
    }
  });
});

describe("normalizeBackendMountPath", () => {
  it("leaves canonical in-app routes untouched", () => {
    expect(normalizeBackendMountPath("/")).toBe("/");
    expect(normalizeBackendMountPath("/auth")).toBe("/auth");
    expect(normalizeBackendMountPath("/competitions/some-slug")).toBe("/competitions/some-slug");
    expect(normalizeBackendMountPath("/_serverFn/abc123")).toBe("/_serverFn/abc123");
    expect(normalizeBackendMountPath("/sitemap.xml")).toBe("/sitemap.xml");
  });

  it("keeps the genuine /api/health route in both Passenger modes", () => {
    // Stripped mode: /api/health arrived with the mount prefix removed.
    expect(normalizeBackendMountPath("/health")).toBe("/api/health");
    // Unstripped mode: prefix intact.
    expect(normalizeBackendMountPath("/api/health")).toBe("/api/health");
  });

  it("strips one /api level from forwarded page/server-fn paths (unstripped host)", () => {
    expect(normalizeBackendMountPath("/api/auth")).toBe("/auth");
    expect(normalizeBackendMountPath("/api/")).toBe("/");
    expect(normalizeBackendMountPath("/api")).toBe("/");
    expect(normalizeBackendMountPath("/api/_serverFn/abc123")).toBe("/_serverFn/abc123");
    expect(normalizeBackendMountPath("/api/sitemap.xml")).toBe("/sitemap.xml");
    expect(normalizeBackendMountPath("/api/competitions/some-slug")).toBe(
      "/competitions/some-slug",
    );
  });

  it("never strips twice", () => {
    // A doubled prefix (e.g. rewrite applied on an already-prefixed path)
    // collapses to exactly one /api level, never to a bare route.
    expect(normalizeBackendMountPath("/api/api/health")).toBe("/api/health");
    expect(normalizeBackendMountPath("/api/api/auth")).toBe("/api/auth");
  });
});

describe("loadLocalEnvFile", () => {
  let dir = "";
  afterEach(() => {
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
      dir = "";
    }
    delete process.env["RAFFILA_TEST_A"];
    delete process.env["RAFFILA_TEST_B"];
    delete process.env["RAFFILA_TEST_C"];
  });

  it("parses KEY=VALUE lines, quotes, comments; never overrides existing env", () => {
    dir = mkdtempSync(join(tmpdir(), "raffila-env-"));
    writeFileSync(
      join(dir, ".env"),
      [
        "# comment line",
        "",
        "RAFFILA_TEST_A=hello",
        'RAFFILA_TEST_B="quoted value"',
        "RAFFILA_TEST_C='single quoted'",
        "NOT A KEY=oops",
        "NOEQUALS",
      ].join("\n"),
      "utf8",
    );
    process.env["RAFFILA_TEST_A"] = "keep-me";
    const filled = loadLocalEnvFile(dir);
    expect(process.env["RAFFILA_TEST_A"]).toBe("keep-me");
    expect(process.env["RAFFILA_TEST_B"]).toBe("quoted value");
    expect(process.env["RAFFILA_TEST_C"]).toBe("single quoted");
    expect(filled.sort()).toEqual(["RAFFILA_TEST_B", "RAFFILA_TEST_C"]);
  });

  it("is a silent no-op when no .env exists", () => {
    dir = mkdtempSync(join(tmpdir(), "raffila-env-"));
    expect(loadLocalEnvFile(dir)).toEqual([]);
  });
});

describe("rewriteRequestPath", () => {
  it("preserves method, headers and POST body", async () => {
    const payload = JSON.stringify({ data: { reference: "ref-123" } });
    const original = new Request("https://raffila.com/_serverFn/abc123", {
      method: "POST",
      headers: { "content-type": "application/json", "x-tsr-serverFn": "true" },
      body: payload,
    });
    const rewrapped = rewriteRequestPath(original, "/api/_serverFn/abc123");
    expect(new URL(rewrapped.url).pathname).toBe("/api/_serverFn/abc123");
    expect(rewrapped.method).toBe("POST");
    expect(rewrapped.headers.get("x-tsr-serverFn")).toBe("true");
    expect(await rewrapped.text()).toBe(payload);
  });

  it("returns the same request when the path is unchanged", () => {
    const original = new Request("https://raffila.com/auth");
    expect(rewriteRequestPath(original, "/auth")).toBe(original);
  });
});

describe("isApiRootRequest", () => {
  it("matches the exact mount path with any query", () => {
    expect(isApiRootRequest("/api", "")).toBe(true);
    expect(isApiRootRequest("/api", "?x=1")).toBe(true);
  });

  it("matches / only with the rewrite marker", () => {
    expect(isApiRootRequest("/", "?api-root=1")).toBe(true);
    expect(isApiRootRequest("/", "")).toBe(false);
    expect(isApiRootRequest("/", "?other=1")).toBe(false);
  });

  it("never matches real routes", () => {
    expect(isApiRootRequest("/api/", "")).toBe(false);
    expect(isApiRootRequest("/api/health", "")).toBe(false);
    expect(isApiRootRequest("/auth", "?api-root=1")).toBe(false);
    expect(isApiRootRequest("/_serverFn/x", "")).toBe(false);
  });
});

describe("getPackagedBuildId + apiRootStatusResponse", () => {
  it("reads the stamp from build-info.json", () => {
    const dir = mkdtempSync(join(tmpdir(), "raffila-bid-"));
    try {
      writeFileSync(join(dir, "build-info.json"), JSON.stringify({ buildId: "test-123" }), "utf8");
      expect(getPackagedBuildId(dir)).toBe("test-123");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("serves a JSON running document", async () => {
    const res = apiRootStatusResponse();
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["ok"]).toBe(true);
    expect(body["service"]).toBe("rafilla-grand-prizes");
    expect(body["mount"]).toBe("/api");
  });
});
