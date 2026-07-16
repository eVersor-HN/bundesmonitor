# Build-Context: Repository-Wurzel. Ein Image, per Command als Worker ODER Beat gestartet.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY packages/core /app/packages/core
COPY apps/worker /app/apps/worker

RUN pip install --upgrade pip \
    && pip install -e /app/packages/core \
    && pip install -e /app/apps/worker

# Standard: Worker. Beat wird in docker-compose per abweichendem command gestartet.
CMD ["celery", "-A", "bundesmonitor_worker.celery_app.celery_app", "worker", "--loglevel=info"]
