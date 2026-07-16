# Entwicklung

## Voraussetzungen

- Git, Docker + Docker Compose
- Python 3.12+ (fuer lokale Checks ohne Container)
- Node 20+ / npm 10+

## Schnellstart (ein Befehl)

```bash
cp .env.example .env   # DIP_API_KEY eintragen (siehe unten)
docker compose up
```

Danach:

- Web:   http://localhost:3000
- API:   http://localhost:8000  (Health: `/health`, Docs: `/docs`)
- MinIO: http://localhost:9001

`migrate` laeuft einmalig (`alembic upgrade head`), bevor `api` und `worker`
starten.

## Schnellstart ohne Docker (Testgeraet / Handy)

Fuer einen schnellen Test auf einem Handy im gleichen WLAN - ohne Postgres,
Redis oder MinIO. Nutzt SQLite und importiert DIP einmalig:

```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts\quickstart_local.ps1
```

Das Skript legt eine lokale `bundesmonitor.db` an, importiert echte DIP-Daten
und zeigt danach die zwei Startbefehle (API auf `0.0.0.0:8000`, Web auf
`0.0.0.0:3000`) sowie die LAN-Adresse fuers Handy. Alle Daten werden
serverseitig geladen - das Handy muss nur den Web-Server (Port 3000) erreichen.
Im mobilen Browser dann "Zum Startbildschirm hinzufuegen" (installierbare PWA).

Manuell ist der Seed:

```bash
DATABASE_URL="sqlite:///./bundesmonitor.db" python -m bundesmonitor_core.seed --limit 200
```

## Android-APK (Capacitor)

Die App laesst sich als native Android-APK verpacken. Die Oberflaeche wird
statisch exportiert und in die APK gebundelt; die Daten holt sie zur Laufzeit
von der in den **Einstellungen** konfigurierten API-Adresse (Standard = LAN-IP
des PCs). Voraussetzung: Android SDK (Android Studio), JDK 21, Node.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build_apk.ps1
```

Das Skript baut den statischen Export, legt bei Bedarf das Android-Projekt an
(`npx cap add android`), baut die Debug-APK (`gradlew :app:assembleDebug`) und
installiert sie auf ein per USB verbundenes, autorisiertes Geraet (`adb`).

- APK-Pfad: `android/app/build/outputs/apk/debug/app-debug.apk`
- Vor dem Installieren am Handy die USB-Debugging-Anfrage bestaetigen.
- Zum Testen muss der API-Server laufen (`SELF_HOST`-Schnellstart, Port 8000)
  und im gleichen WLAN erreichbar sein. Adresse notfalls in der App unter
  Einstellungen anpassen.

Das `android/`-Verzeichnis ist generiert und nicht eingecheckt.

## DIP-API-Key

Bis der personalisierte, unbefristete Key vorliegt (beantragt bei
`parlamentsdokumentation@bundestag.de`), wird der oeffentliche DIP-Sammelschluessel
genutzt. Eintrag in `.env` unter `DIP_API_KEY`. Niemals committen (steht in
`.gitignore`).

## Lokale Checks ohne Docker

Python (pro Paket, wie in CI):

```bash
python -m venv .venv && . .venv/Scripts/activate   # Windows: .venv\Scripts\Activate.ps1
pip install -e "packages/core[dev]" -e "apps/api[dev]" -e "apps/worker[dev]"

for pkg in packages/core apps/api apps/worker; do
  (cd $pkg && ruff check src tests && mypy src && pytest)
done
```

Web:

```bash
npm install
npm run lint --workspace @bundesmonitor/web
npm run typecheck --workspace @bundesmonitor/web
npm run build --workspace @bundesmonitor/web
```

## Struktur

```
apps/
  api/      FastAPI-Lese-API (+ Alembic-Migrationen)
  worker/   Celery-Worker + Beat
  web/      Next.js (App Router, Tailwind v4)
packages/
  core/     Geteilte Domaene: Modelle, Config, Storage, DIP-Ingestion
  contracts/ TS-Typen (ab Phase 1 aus OpenAPI generiert)
  ui/       Geteilte UI-Komponenten/Tokens
```

Siehe `docs/adr/0001-architektur-grundlagen.md` fuer die Begruendungen.
