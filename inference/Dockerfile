# CarbonOS — Multi-stage Production Dockerfile for FastAPI Inference & RAG Engine
FROM python:3.11-slim-bookworm AS builder

WORKDIR /build
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final runtime image
FROM python:3.11-slim-bookworm AS runtime

WORKDIR /app
ENV PATH=/home/carbonos/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 --shell /bin/bash carbonos

COPY --from=builder /root/.local /home/carbonos/.local
COPY --chown=carbonos:carbonos inference/ /app/inference/
COPY --chown=carbonos:carbonos requirements.txt /app/

USER carbonos

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/api/esg/health || exit 1

CMD ["uvicorn", "inference.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers"]
