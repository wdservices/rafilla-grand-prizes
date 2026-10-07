# One-command Namecheap release: stamp -> build -> package.
# Usage:  powershell -ExecutionPolicy Bypass -File scripts/build-namecheap.ps1
# Output: deploy/namecheap/backend.zip + frontend.zip, same build ID in both.
#
# The build ID is baked into the frontend (VITE_BUILD_ID) AND stamped into
# both zips (build-info.json, surfaced by /api/health). If the uploaded sides
# ever drift apart, the site shows a "Site update in progress" banner instead
# of silently breaking.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

$sha = ""
try {
  $sha = (git -C $Root rev-parse --short HEAD 2>$null).Trim()
} catch {}
if (-not $sha) { $sha = "nogit" }
$env:BUILD_ID = "$sha-$((Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmm'))"
$env:VITE_BUILD_ID = $env:BUILD_ID
$env:NITRO_PRESET = "node-server"

Write-Host "Building $env:BUILD_ID ..."
Set-Location -LiteralPath $Root
# Fresh, deterministic release: wipe previous build outputs first. A stale
# dist/server bundle hijacks the prerenderer (it renders pages with the OLD
# build's asset URLs, producing HTML that 404s every script/link). Both dirs
# are gitignored regenerable artifacts — safe to delete. (vite.config.ts
# excludes them from the dev watcher, so this is safe even with `npm run dev`
# running alongside.)
foreach ($dir in @((Join-Path $Root "dist"), (Join-Path $Root ".output"))) {
  if (-not (Test-Path -LiteralPath $dir)) { continue }
  Write-Host "Cleaning $(Split-Path -Leaf $dir)/ ..."
  $cleared = $false
  # Bulk deletes trip transient AV/indexer locks: cmd first, PS fallback, retry.
  for ($i = 1; $i -le 6 -and -not $cleared; $i++) {
    cmd /c rmdir /s /q "$dir" 2>$null
    if (-not (Test-Path -LiteralPath $dir)) { $cleared = $true; break }
    try {
      Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction Stop
      $cleared = $true
    } catch {
      if ($i -eq 6) { throw "Could not clear $dir (locked?): $($_.Exception.Message)" }
      Start-Sleep -Seconds 2
    }
  }
}
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed (exit $LASTEXITCODE)" }

# Prerender public pages against the FRESH nitro server (writes
# .output/public/<route>/index.html). See scripts/prerender-namecheap.mjs.
Write-Host "Prerendering public pages ..."
node (Join-Path $Root "scripts/prerender-namecheap.mjs")
if ($LASTEXITCODE -ne 0) { throw "Prerender failed (exit $LASTEXITCODE)" }

& powershell -ExecutionPolicy Bypass -File (Join-Path $Root "scripts/package-namecheap.ps1")
if ($LASTEXITCODE -ne 0) { throw "Packaging failed (exit $LASTEXITCODE)" }
Write-Host ""
Write-Host "Release ready: $env:BUILD_ID"
Write-Output "Two zips in deploy/namecheap/:"
Write-Output "  backend.zip  -> extract CONTENTS into ~/backend (Node app, mounted at /api)"
Write-Output "  frontend.zip -> extract CONTENTS into public_html (static site + .htaccess)"
