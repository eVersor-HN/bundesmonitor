#!/usr/bin/env bash
set -euo pipefail

echo "Bundesmonitor bootstrap"

for cmd in git docker node; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Fehlendes Werkzeug: $cmd" >&2
    exit 1
  fi
done

if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env wurde erstellt. DIP_API_KEY und Kontaktadresse eintragen."
fi

docker compose up -d --build
echo "Umgebung gestartet: Web http://localhost:3000, API http://localhost:8000"
