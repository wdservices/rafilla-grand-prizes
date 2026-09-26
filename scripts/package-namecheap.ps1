# Packages a fresh node-server .output build into Namecheap-ready upload folders.
# Run AFTER:  $env:NITRO_PRESET="node-server"; npm run build
# Usage:      powershell -ExecutionPolicy Bypass -File scripts/package-namecheap.ps1
# Output:     deploy/namecheap/ contains ONLY backend.zip + frontend.zip
#   backend.zip   -> extract to ~/backend      (Node SSR server, OUTSIDE web root)
#   frontend.zip  -> extract contents to ~/public_html (static frontend)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Out = Join-Path $Root ".output"
$Deploy = Join-Path $Root "deploy/namecheap"

# 1. Sanity: .output must be a node-server build (Cloudflare preset won't run on cPanel).
$nitroJson = Join-Path $Out "nitro.json"
if (-not (Test-Path -LiteralPath $nitroJson)) { throw ".output/nitro.json missing - run npm run build first." }
$preset = (Get-Content -LiteralPath $nitroJson -Raw | ConvertFrom-Json).preset
if ($preset -ne "node-server") {
  throw "Wrong preset '$preset'. Rebuild with: `$env:NITRO_PRESET='node-server'; npm run build"
}
Write-Host "Preset OK: node-server"

# 2. Fresh deploy dir. (Windows AV/indexer briefly locks freshly-written zips, and
#    PowerShell Remove-Item trips on it — cmd's del does not. So: PS first, del fallback.)
function Remove-DeployPath([string]$p) {
  for ($i = 1; $i -le 5; $i++) {
    try {
      if (Test-Path -LiteralPath $p) {
        if ((Get-Item -LiteralPath $p).PSIsContainer) {
          Remove-Item -LiteralPath $p -Recurse -Force
        } else {
          Remove-Item -LiteralPath $p -Force
        }
      }
      return
    } catch {
      $isDir = $false
      try { $isDir = (Get-Item -LiteralPath $p -ErrorAction Stop).PSIsContainer } catch {}
      if ($isDir) { cmd /c rmdir /s /q "$p" 2>$null } else { cmd /c del /f /q "$p" 2>$null }
      if (-not (Test-Path -LiteralPath $p)) { return }
      if ($i -eq 5) { throw "Could not clear $p (locked?): $($_.Exception.Message)" }
      Start-Sleep -Seconds 2
    }
  }
}
Remove-DeployPath (Join-Path $Deploy "backend")
Remove-DeployPath (Join-Path $Deploy "frontend")
Remove-DeployPath (Join-Path $Deploy "backend.zip")
Remove-DeployPath (Join-Path $Deploy "frontend.zip")
Remove-DeployPath (Join-Path $Deploy "README-DEPLOY.md")
if (-not (Test-Path -LiteralPath $Deploy)) { New-Item -ItemType Directory -Path $Deploy | Out-Null }
$AppDir = Join-Path $Deploy "backend"
$WebDir = Join-Path $Deploy "frontend"
New-Item -ItemType Directory -Path $AppDir | Out-Null
New-Item -ItemType Directory -Path $WebDir | Out-Null

# 3. Server folder: EVERYTHING the Node app needs (self-contained, no npm install).
Copy-Item -LiteralPath (Join-Path $Out "server") -Destination (Join-Path $AppDir "server") -Recurse
Copy-Item -LiteralPath (Join-Path $Out "nitro.json") -Destination (Join-Path $AppDir "nitro.json")
# node-server preset emits no package.json (zero runtime deps) - generate a minimal
# one so cPanel / process managers have an explicit entry point. No install needed.
$appPkg = @'
{
  "name": "rafilla-grand-prizes",
  "private": true,
  "type": "module",
  "main": "./server/index.mjs",
  "scripts": {
    "start": "node ./server/index.mjs"
  },
  "engines": {
    "node": ">=20"
  }
}
'@
Set-Content -LiteralPath (Join-Path $AppDir "package.json") -Value $appPkg -Encoding Ascii
# Mirror of public INSIDE backend: the Node process resolves static assets at
# ../public relative to server/ (same layout as .output). Apache serves its own
# copy from public_html; the Node copy keeps SSR + asset URLs working even if
# Apache/static serving is bypassed (cPanel proxies everything to the app).
Get-ChildItem -LiteralPath (Join-Path $Out "public") -Force | Copy-Item -Destination (Join-Path $AppDir "public") -Recurse -Force

# 4. Frontend folder: static browser assets for public_html.
Get-ChildItem -LiteralPath (Join-Path $Out "public") -Force | Copy-Item -Destination $WebDir -Recurse -Force

# 5. .htaccess for public_html: long-cache hashed assets + SPA fallback.
#    (When the cPanel Node app serves the domain, SSR handles routes and this is
#    a fallback; on static-only hosting it keeps client-side routes working
#    after the SSR shell loads. There is no static index.html - SSR renders it.)
$htaccess = @'
# Raffila - Apache config for public_html
# Never show a directory listing (what you see when index.html is missing).
Options -Indexes
DirectoryIndex index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  # Long-cache hashed build assets
  <IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
  </IfModule>
  # SPA fallback: route non-file requests to the SSR Node app entry.
  # If the Node app is bound to this domain in cPanel, requests already reach
  # it and this rule is a harmless fallback. Do NOT point this at a static
  # index.html - none exists; HTML is rendered by backend/server/index.mjs.
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ / [PT,L]
</IfModule>

# Security headers (mirrors vercel.json)
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
'@
Set-Content -LiteralPath (Join-Path $WebDir ".htaccess") -Value $htaccess -Encoding Ascii

# 6. (Setup guide is maintained in chat / BUILD-AND-DEPLOY.md - this folder ships
#    only the two zips, nothing else.)

# 7. Zips for cPanel File Manager upload+extract.
Compress-Archive -LiteralPath $AppDir -DestinationPath (Join-Path $Deploy "backend.zip") -Force
Get-ChildItem -LiteralPath $WebDir -Force | Compress-Archive -DestinationPath (Join-Path $Deploy "frontend.zip") -Force

# 8. Zips-only deploy folder: remove the loose staging dirs.
Remove-DeployPath $AppDir
Remove-DeployPath $WebDir

Write-Host ""
Write-Host "Packaged OK -> $Deploy (zips only)"
