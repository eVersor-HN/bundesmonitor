"""FastAPI-Anwendung: Einstiegspunkt und Router-Montage."""

from __future__ import annotations

from bundesmonitor_core.config import get_settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from bundesmonitor_api.routers import (
    appversion,
    catalog,
    feed,
    health,
    kennzahlen,
    local,
    matters,
    votes,
)

settings = get_settings()

app = FastAPI(
    title="Bundesmonitor API",
    version="0.1.0",
    description=(
        "Quellenbasierter, chronologischer Monitor des Bundes. "
        "Rechtlich massgeblich sind ausschliesslich die verlinkten Originalquellen."
    ),
)

# Oeffentliche Lese-API ohne Anmeldung/Cookies: jede Herkunft darf lesen.
# Das entkoppelt die statische App/APK (eigene Origin) vom Server. Keine
# Credentials, daher ist eine Wildcard unbedenklich.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(feed.router)
app.include_router(matters.router)
app.include_router(catalog.router)
app.include_router(local.router)
app.include_router(votes.router)
app.include_router(kennzahlen.router)
app.include_router(appversion.router)


@app.get("/", tags=["meta"])
def root() -> dict[str, str]:
    return {
        "name": "Bundesmonitor API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
    }
