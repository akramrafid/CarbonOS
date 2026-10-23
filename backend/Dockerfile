# CarbonOS — Multi-stage Production Dockerfile for Django Sovereign Backend
FROM python:3.11-slim-bookworm AS builder

WORKDIR /build
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final runtime image
FROM python:3.11-slim-bookworm AS runtime

WORKDIR /app
ENV PATH=/home/djangouser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=farmers_ai_project.settings

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10002 --shell /bin/bash djangouser

COPY --from=builder /root/.local /home/djangouser/.local
COPY --chown=djangouser:djangouser backend/ /app/backend/

USER djangouser
WORKDIR /app/backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/api/health/ || exit 1

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "farmers_ai_project.asgi:application"]
