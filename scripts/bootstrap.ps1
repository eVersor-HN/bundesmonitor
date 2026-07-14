$ErrorActionPreference = "Stop"

Write-Host "Bundesmonitor bootstrap"

$required = @("git", "docker", "node")
foreach ($cmd in $required) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        throw "Fehlendes Werkzeug: $cmd"
    }
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host ".env wurde erstellt. DIP_API_KEY und Kontaktadresse eintragen."
}

docker compose up -d --build
Write-Host "Umgebung gestartet: Web http://localhost:3000, API http://localhost:8000"
