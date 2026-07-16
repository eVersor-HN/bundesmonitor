# Schnellstart OHNE Docker fuer ein Testgeraet (Windows/PowerShell).
# Legt eine lokale SQLite-DB an, importiert DIP einmalig und erklaert, wie API
# und Web im WLAN erreichbar gestartet werden.
$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

foreach ($cmd in @("python", "node")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) { throw "Fehlendes Werkzeug: $cmd" }
}
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env"; Write-Host ".env erstellt - DIP_API_KEY eintragen!" }

# Python-Umgebung
if (-not (Test-Path ".venv")) { python -m venv .venv }
& ".venv\Scripts\python.exe" -m pip install --quiet --upgrade pip
& ".venv\Scripts\python.exe" -m pip install --quiet -e "packages/core" -e "apps/api"

# Web-Abhaengigkeiten
if (-not (Test-Path "node_modules")) { npm install --no-audit --no-fund }

# Lokale SQLite-DB + einmaliger DIP-Import
$db = (Join-Path $repo "bundesmonitor.db") -replace '\\', '/'
$env:DATABASE_URL = "sqlite:///$db"
& ".venv\Scripts\python.exe" -m bundesmonitor_core.seed --limit 200

# LAN-IP ermitteln
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.PrefixOrigin -ne "WellKnown" -and $_.IPAddress -notlike "169.*" -and $_.IPAddress -ne "127.0.0.1" } |
    Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "==== Fertig. Jetzt in ZWEI Terminals starten ====" -ForegroundColor Green
Write-Host "1) API:" -ForegroundColor Cyan
Write-Host "   `$env:DATABASE_URL='sqlite:///$db'; .venv\Scripts\python -m uvicorn bundesmonitor_api.main:app --host 0.0.0.0 --port 8000"
Write-Host "2) Web:" -ForegroundColor Cyan
Write-Host "   `$env:API_BASE_URL='http://localhost:8000'; npm run dev --workspace `@bundesmonitor/web -- -H 0.0.0.0 -p 3000"
Write-Host ""
Write-Host "Auf dem Handy (gleiches WLAN) oeffnen:  http://${ip}:3000" -ForegroundColor Yellow
Write-Host "Dann im Browser-Menue 'Zum Startbildschirm hinzufuegen' (PWA)."
Write-Host "Hinweis: ggf. Windows-Firewall fuer Port 3000 erlauben."
