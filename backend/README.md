# CarbonOS — Django Farmers AI & Credit Registry Backend

Core Django backend microservice powering the HarvestGuard rural agricultural risk engine, Alternate Wetting and Drying (AWD) rice methane credit verification, and direct farmer credit accrual for **CarbonOS Bangladesh**.

---

## 🏗️ Service Architecture

```
backend/
├── manage.py                  # Django administrative script
├── requirements.txt           # Python dependencies
├── db.sqlite3                 # Local SQLite database
│
├── farmers_ai/                # HarvestGuard Core Application
│   ├── models.py              # FarmerBatch, AWDMeasurement, CarbonPayout, RiskAlert
│   ├── views.py               # REST API endpoints & bKash/Nagad disbursement logic
│   ├── risk_engine.py         # Agro-climatic risk analysis & pest outbreak modeling
│   ├── tasks.py               # Asynchronous Celery tasks for satellite & weather sync
│   ├── consumers.py           # Django Channels WebSocket handlers for real-time alerts
│   └── urls.py                # URL routing declarations
│
├── farmers_ai_project/        # Django Project Configuration
│   ├── settings.py            # Database, CORS, and installed apps configuration
│   ├── asgi.py                # ASGI configuration for WebSockets
│   └── wsgi.py                # Standard WSGI web gateway
│
└── ml_pipeline/               # PyTorch Model Definitions & Training
    ├── model.py               # MultiHeadFarmerAIModel architecture (EfficientNet-B3)
    └── dataset.py             # Crop disease data loaders and augmentations
```

---

## 🌾 Domain Capabilities

### 1. Alternate Wetting & Drying (AWD) Methane Ledger
* Tracks water depth tube measurements submitted by smallholder farmers or agricultural field officers.
* Applies IPCC AR6 Guidelines for National Greenhouse Gas Inventories:
  * Baseline continuous flooding methane emission factor: $1.30\text{ kg CH}_4 / \text{ha} / \text{day}$.
  * Single aeration / AWD scaling factor ($SF_w$): $0.52$ (representing an estimated $48\%$ reduction in methane emissions).
  * 100-year Global Warming Potential multiplier: $27.9\text{ t CO}_2\text{e} / \text{t CH}_4$.
* Automatically mints verified carbon credits attributed directly to farmer batch records.

### 2. Agro-Climatic Risk Engine (`risk_engine.py`)
* Ingests localized weather data (temperature, humidity, precipitation forecast).
* Evaluates fungal disease vulnerability indices for high-risk seasons (e.g., late blight in potato during foggy winter periods, rice blast during high-humidity monsoons).
* Triggers localized SMS / push notification alerts to registered farmer clusters.

### 3. Mobile Money Payout Disbursals
* Integrates simulated bKash and Nagad mobile financial service (MFS) payout APIs.
* Allows smallholder farmers to convert earned carbon credits directly into Bangladeshi Taka (BDT) at transparent market rates.

---

## 🛠️ Installation & Running Locally

### 1. Setup Virtual Environment
```bash
cd backend

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

### 2. Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Start Django Server
```bash
python manage.py runserver 8001
```
The Farmers AI backend will be accessible at `http://localhost:8001/`.
