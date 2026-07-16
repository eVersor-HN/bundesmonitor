# Build-Context: Repository-Wurzel (docker compose baut mit context: .)
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Zuerst die geteilte Domaenenlogik, dann die API.
COPY packages/core /app/packages/core
COPY apps/api /app/apps/api

RUN pip install --upgrade pip \
    && pip install -e /app/packages/core \
    && pip install -e /app/apps/api

EXPOSE 8000

# Healthcheck nutzt den Liveness-Endpunkt.
HEALTHCHECK --interval=10s --timeout=3s --retries=12 \
    CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

CMD ["uvicorn", "bundesmonitor_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
