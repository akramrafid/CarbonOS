# CarbonOS — FastAPI Inference & AI Microservice

Microservice providing multi-corpus Retrieval-Augmented Generation (RAG), real-time IoT hardware telemetry streaming, satellite remote sensing calculations, and deep learning crop disease diagnostics for **CarbonOS Bangladesh**.

---

## 🏗️ Service Architecture

```
inference/
├── main.py                    # FastAPI gateway, PyTorch CNN loading, Grad-CAM hooks, CORS
├── requirements.txt           # Python dependencies
├── .env                       # Environment credentials (GEMINI_API_KEY, BLYNK_AUTH_TOKEN)
├── chroma_data/               # Persistent ChromaDB vector database index
│
├── esg_rag/                   # Multi-Corpus Regulatory & Footprint RAG Module
│   ├── router.py              # /api/esg/query & /api/esg/parse-bill endpoints
│   ├── database.py            # SQLite database initialization for audit logging
│   └── models.py              # ESGQueryLog and ESGDocument SQLAlchemy entities
│
└── carbon_monitoring/         # Industrial IoT Telemetry & Satellite MRV Module
    ├── router.py              # /api/carbon/telemetry & /api/carbon/satellite-biomass
    ├── database.py            # IoT telemetry time-series storage
    └── models.py              # TelemetryReading database entities
```

---

## ⚡ Core Capabilities

### 1. Multi-Corpus RAG & Citation Engine (`esg_rag`)
* **Vector Store**: ChromaDB with `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense semantic embeddings).
* **Corpus Segregation**:
  * `regulatory`: Bangladesh Updated NDC 2021, Environment Conservation Rules 2023 (S.R.O. 349).
  * `emission_factors`: Bangladesh Department of Environment (DoE) & SREDA Grid Gazette (`0.550 kg CO₂e / kWh`), IPCC AR6 constants.
  * `tenant_docs`: Private factory bills, diesel generator delivery slips, and previous audit statements isolated by `tenant_id`.
* **Dual Synthesis Mechanism**:
  * **Online**: Google Gemini 2.5 Flash with strict prompt engineering mandating verbatim clause citations and page numbers.
  * **Offline / Fallback**: Deterministic rule-based keyword & regular expression extraction engine for zero-cost, offline resilience.

### 2. Live Industrial IoT Telemetry Node (`carbon_monitoring`)
* Real-time polling of physical factory sensor nodes via Blynk Cloud REST & WebSocket interfaces.
* Measures industrial boiler and captive diesel generator exhaust parameters:
  * `V0`: Temperature (°C)
  * `V1`: Relative Humidity (%)
  * `V2`: Gas concentration / Air Quality Index (ppm from MQ-135 sensor)
  * `V3`: Calculated instantaneous CO₂ emission rate (kg/hr)

### 3. Multi-Head PyTorch Crop Diagnosis (`ml_pipeline`)
* **Backbone**: EfficientNet-B3 convolutional neural network.
* **Species & Disease Heads**: 41 disease classes across 8 key Bangladesh crops (`rice`, `potato`, `tomato`, `maize`, `mango`, `jackfruit`, `guava`, `citrus`).
* **Explainability**: Forward and gradient hooks registered on the final convolutional layer (`model.features[-1]`) generating class activation maps (Grad-CAM heatmaps) to visualize pathology lesions.

---

## 📡 API Endpoint Reference

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Microservice health check & API metadata |
| `POST` | `/api/esg/query` | Grounded multi-corpus query returning synthesis and verbatim citations |
| `POST` | `/api/esg/parse-bill` | Multipart file upload parsing factory utility statements into Scope 1 & 2 CO₂e |
| `GET` | `/api/esg/health` | RAG vector store health and corpus document counts |
| `GET` | `/api/carbon/telemetry` | Real-time IoT sensor readings from factory hardware nodes |
| `POST` | `/api/carbon/satellite-biomass` | Computes NDVI and aboveground biomass (AGB) from Sentinel-2 coordinates |
| `POST` | `/predict` | Multi-head crop disease classification with Grad-CAM heatmap visualization |

---

## 🛠️ Installation & Quick Start

### 1. Environment Requirements
* Python `3.10` to `3.13`
* Active C++ Build Tools (for PyTorch & ChromaDB compilation)

### 2. Setup Virtual Environment
```bash
cd inference

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create or verify `.env` in the `inference/` directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
BLYNK_AUTH_TOKEN=your_blynk_device_token_optional
```

### 4. Run Development Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at `http://localhost:8000/docs`.
