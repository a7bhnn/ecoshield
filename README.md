# 🛡️ ECO SHIELD
### AI-Powered Environmental Risk Intelligence & Early Warning Platform
*Focused on Multi-Hazard Dynamics in Kerala, India (Flood • Landslide • Wildfire)*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![XGBoost](https://img.shields.io/badge/ML%20Model-XGBoost%202.x-EB5424?style=flat-square)](https://xgboost.readthedocs.io)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TS-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Leaflet](https://img.shields.io/badge/Geospatial-Leaflet-199900?style=flat-square&logo=leaflet)](https://leafletjs.com)
[![License](https://img.shields.io/badge/Status-Hackathon%20Ready-success?style=flat-square)](#)

---

## 1. Project Overview

**ECO SHIELD** is an AI-powered environmental monitoring and multi-hazard early warning prototype tailored to the unique Western Ghats-to-coastal topography of **Kerala, India**. 

Rather than merely displaying raw weather charts, ECO SHIELD answers critical tactical questions:
- **What is happening?** Multi-hazard status across 14 Kerala districts.
- **Where is it happening?** Interactive geospatial mapping of river basins, landslide-prone ghat slopes, and fire corridors.
- **How serious is the risk?** Continuous calibrated hazard scores (0–100%) and severity classifications (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
- **Why is the risk increasing?** Fully explainable causal drivers based on physics thresholds, pore-water pressure, and XGBoost feature gains.
- **What could happen if conditions worsen?** Real-time **What-If simulation** with systemic **Risk Cascade** propagation (Atmospheric Precipitation &rarr; Soil Saturation &rarr; Lowland Inundation &rarr; Slope Instability).

---

## 2. System Architecture

```
                                  ┌───────────────────────────────┐
                                  │   KERALA TELEMETRY SOURCES    │
                                  │ (CWC / IMD Telemetry Network) │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BACKEND ENGINE                                      │
│                                                                                        │
│   ┌─────────────────────┐    ┌───────────────────────────┐    ┌────────────────────┐   │
│   │  XGBoost Classifier │    │  Explainable Risk Engine  │    │   Alert Service    │   │
│   │ (Flood Risk Model)  │    │(Flood, Landslide, Wildfire│    │ (Threshold Action  │   │
│   │                     │    │   & Multi-Hazard Cascade) │    │    Advisories)     │   │
│   └──────────┬──────────┘    └─────────────┬─────────────┘    └─────────┬──────────┘   │
│              │                             │                            │              │
│              └──────────────────────┬──────┴────────────────────────────┘              │
│                                     ▼                                                  │
│                         FastAPI High-Speed REST API                                    │
│       GET /api/dashboard  •  GET /api/risks  •  POST /api/predict/flood  •  ...        │
└─────────────────────────────────────┬──────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              MISSION CONTROL FRONTEND                                  │
│                                                                                        │
│   ┌───────────────────┐    ┌────────────────────┐    ┌─────────────────────────────┐   │
│   │ Top Risk Gauges   │    │ Leaflet Geospatial │    │ Interactive What-If         │   │
│   │ (Trends & Drivers)│    │ Interactive Map    │    │ Parameter Simulator         │   │
│   └───────────────────┘    └────────────────────┘    └─────────────────────────────┘   │
│   ┌───────────────────┐    ┌────────────────────┐    ┌─────────────────────────────┐   │
│   │ Systemic Risk     │    │ Recharts Sensor    │    │ ML Insights & Ethical       │   │
│   │ Cascade Flow      │    │ Hyetographs        │    │ Benchmark Transparency      │   │
│   └───────────────────┘    └────────────────────┘    └─────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Features

1. **Multi-Hazard Risk Engine**:
   - **Flood Risk**: ML XGBoost classifier trained on multi-station cumulative precipitation.
   - **Landslide Risk**: Slope shear stress, antecedent 72h moisture, and soil pore saturation modeling.
   - **Wildfire Risk**: Atmospheric vapor pressure deficit, dry spell duration, temperature, and wind speed.
2. **Systemic Risk Cascade Visualizer**:
   - Dynamic 4-stage cause-and-effect flow tracking how atmospheric cloudbursts propagate through soil saturation to dual lowland floods and highland landslides.
3. **Interactive What-If Scenario Simulator**:
   - Live perturbation sliders (24h Rain, 6h Rain, Temp, Humidity, Wind, Slope) with 4 regional presets (*Extreme Monsoon Wayanad*, *Riverine Flood Ernakulam*, *Dry Heat Palakkad*, *Normal*).
4. **Kerala Geospatial Observatory (Leaflet)**:
   - Visualizing all 14 Kerala telemetry stations, risk polygons, and historical disaster ground benchmarks with custom animated markers.
5. **Actionable Early Warning Advisories**:
   - Practical safety guidance calibrated to local terrain (ghat roads, riverbanks, forest corridors).
6. **ML Insights & Transparency Panel**:
   - Transparent feature importance gain chart, cross-validation metrics (Accuracy: 96.2%, ROC-AUC: 0.985), and ethical proxy target explanation.
   - **Live Endpoint Playground**: Test `POST /api/predict/flood` with custom inputs directly in the UI.
7. **Curated Historical Benchmarks**:
   - Case studies of major Kerala disasters (2018 Great Floods, 2024 Wayanad Chooralmala, 2019 Kavalappara, 2020 Pettimudi, 2019 Marayoor Forest Fire).

---

## 4. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Recharts, Leaflet, React-Leaflet, Lucide React icons.
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, XGBoost 2.x, Joblib, HTTPX.
- **Storage / Data**: Local high-fidelity CSV and JSON fallback datasets (works 100% offline without external API keys or cloud dependencies).

---

## 5. Folder Structure

```
disaster-shield/
├── backend/
│   ├── main.py                     # FastAPI REST API & routes
│   ├── requirements.txt            # Python dependencies
│   ├── test_backend.py             # Automated end-to-end backend test suite
│   ├── data/
│   │   ├── generate_dataset.py     # Deterministic telemetry generator
│   │   ├── rainfall.csv            # 4,704 hourly records across 14 Kerala districts
│   │   ├── historical_events.json  # Curated historical disaster ground truths
│   │   └── demo_environment.json  # Baseline telemetry station snapshot
│   ├── ml/
│   │   ├── train_flood_model.py    # Robust column-detecting XGBoost training script
│   │   ├── predict.py              # Flood predictor & feature engineering
│   │   ├── flood_model.pkl         # Serialized model artifact
│   │   └── model_metadata.json     # Feature importances & training metrics
│   └── services/
│       ├── risk_engine.py          # Explainable Flood, Landslide, Fire & Cascade logic
│       ├── data_service.py         # Telemetry data provider & CSV cache
│       └── alert_service.py        # Severity-graded alert generator
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx                  # Status bar, mode badges & nav tabs
│   │   │   ├── RiskOverviewCards.tsx       # Top 3 hazard hero cards with trends
│   │   │   ├── RiskCascadeVisualizer.tsx   # Systemic multi-stage cascade visualizer
│   │   │   ├── WhatIfSimulator.tsx         # Live parameter simulator with sliders
│   │   │   ├── ActiveAlertsList.tsx        # Filterable advisory feed
│   │   │   ├── InteractiveMap.tsx          # Leaflet map of Kerala with custom markers
│   │   │   ├── EnvironmentalCharts.tsx     # Recharts hyetographs & sensor charts
│   │   │   ├── MLInsightsModal.tsx         # XGBoost metrics & interactive playground
│   │   │   └── HistoricalEventsView.tsx    # Historical Kerala disaster archive
│   │   ├── services/
│   │   │   └── api.ts                      # Frontend-to-backend API client
│   │   ├── types/
│   │   │   └── index.ts                    # Shared TypeScript interfaces
│   │   ├── App.tsx                         # Main integrated layout
│   │   ├── main.tsx
│   │   └── index.css                       # Tailwind v4 & Leaflet styling
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── README.md
└── .gitignore
```

---

## 6. Quick Start & Installation

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ (tested on Node v24)
- Git

### A. Backend Setup

```bash
# 1. Navigate to backend directory
cd disaster-shield/backend

# 2. (Optional) Create and activate virtual environment
python -m venv venv

# Windows PowerShell:
venv\Scripts\Activate.ps1
# Windows Command Prompt:
venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Generate telemetry data & train XGBoost model
python ml/train_flood_model.py

# 5. Run automated backend test suite
python test_backend.py

# 6. Start the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be active at: `http://127.0.0.1:8000` (Interactive Swagger docs: `http://127.0.0.1:8000/docs`).

---

### B. Frontend Setup

```bash
# 1. In a new terminal, navigate to frontend directory
cd disaster-shield/frontend

# 2. Install npm dependencies
npm install

# 3. Verify TypeScript build
npm run build

# 4. Start Vite development server
npm run dev
```

Frontend dashboard will open at: `http://localhost:5173`.

---

## 7. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Platform metadata, region, and version info |
| `GET` | `/health` | Health check, model status, and station counts |
| `GET` | `/api/dashboard` | High-level summary, top 3 risks, alert counters |
| `GET` | `/api/risks` | Comprehensive risk assessments for all 14 Kerala districts |
| `GET` | `/api/alerts` | Filterable active warning and advisory feed |
| `GET` | `/api/environment` | Live station telemetry and 36-hour hourly timeseries |
| `GET` | `/api/historical-events`| Curated historical Kerala disaster ground benchmarks |
| `GET` | `/api/ml-insights` | XGBoost metrics, feature weights, and proxy methodology |
| `POST`| `/api/predict/flood` | Real-time ML inference for arbitrary rainfall parameters |
| `POST`| `/api/simulate` | Multi-hazard What-If simulation with dynamic cascade output |

### Sample ML Prediction Request:
```json
POST /api/predict/flood
{
  "rain_current": 20.0,
  "rain_3h": 40.0,
  "rain_6h": 70.0,
  "rain_12h": 100.0,
  "rain_24h": 150.0
}
```

### Sample ML Prediction Response:
```json
{
  "risk_level": "HIGH",
  "risk_score": 0.91,
  "confidence": 0.91,
  "reasons": [
    "Extremely high 24-hour rainfall accumulation (150.0 mm) exceeds catchment holding threshold",
    "High 6-hour rainfall volume (70.0 mm) triggers rapid surface runoff surge",
    "Severe cloudburst/high-intensity rainfall (20.0 mm/h) actively overwhelming storm drains"
  ]
}
```

---

## 8. Dataset Information & Preprocessing

- **Dataset**: `backend/data/rainfall.csv`
- **Coverage**: 4,704 hourly records spanning all 14 administrative districts of Kerala.
- **Dynamic Preprocessing**: `train_flood_model.py` dynamically inspects column names using regex patterns rather than assuming rigid headers, converts numeric types, handles missing values, and sorts chronologically per station.
- **Engineered Features**:
  1. `rain_current`: Current hourly rainfall intensity (mm/h)
  2. `rain_prev`: Prior 1-hour rainfall (mm)
  3. `rain_3h`: 3-hour cumulative accumulation (mm)
  4. `rain_6h`: 6-hour cumulative accumulation (mm)
  5. `rain_12h`: 12-hour cumulative accumulation (mm)
  6. `rain_24h`: 24-hour cumulative accumulation (mm)
  7. `rain_trend`: Rate-of-change delta (current 3h vs prior period)

---

## 9. Machine Learning Limitations & Hackathon Transparency

1. **Proxy Risk Target**:
   Because automated rainfall gauges measure precipitation depth rather than direct downstream floodplain inundation, a calibrated hydrometeorological proxy target was utilized during training:
   ```
   HIGH_RISK = (rain_24h >= 120mm) OR (rain_6h >= 60mm) OR (rain_current >= 25mm AND rain_3h >= 40mm)
   ```
2. **Decision Support, Not Official Warnings**:
   This prototype is engineered for rapid situational awareness, risk visualization, and emergency scenario simulation. It does not replace official meteorological bulletins issued by the India Meteorological Department (IMD) or Kerala State Disaster Management Authority (KSDMA).
3. **Data Provenance**:
   All benchmark records and simulated sensor telemetry are explicitly tagged with `"DEMO MODE"` and `"HISTORICAL / DEMONSTRATION DATA"`.

---

## 10. Judge Demonstration Walkthrough Script

When presenting to hackathon judges:

1. **Mission Overview Dashboard**:
   - Point out the top header status badges (**DEMO MODE**, **SYS: OPERATIONAL**, **CWC Telemetry Benchmark**).
   - Walk through the **Top Risk Cards** (Flood in Ernakulam at 82%, Landslide in Wayanad at 94%, Wildfire in Palakkad at 25%).
   - Highlight the **Explainable Drivers**: Show that every score has a plain-language reason with exact numbers.
2. **Systemic Risk Cascade**:
   - Explain how stage 1 (Atmospheric Precipitation) triggers stage 2 (Soil Moisture Saturation) which bifurcates into lowland flood inundation and highland slope destabilization.
3. **Interactive Geospatial Map**:
   - Click on the **Geospatial Map** tab. Filter by "Flood Zones" or "Landslide Slopes".
   - Click a marker in Wayanad or Ernakulam to demonstrate the live telemetry popup.
   - Toggle "Historical Events" to show ground-truth markers for the 2018 Floods and 2024 Wayanad Landslide.
4. **Interactive What-If Simulator (The "Wow" Feature)**:
   - Click the **What-If Simulator** tab.
   - Click the preset button **"Extreme Monsoon (Wayanad)"**: Watch the sliders jump, the risk gauges re-evaluate in real time, and the cascade shift to CRITICAL.
   - Click **"Dry Heat & Gale (Palakkad)"**: Watch Flood & Landslide collapse to LOW while Wildfire spikes to CRITICAL with desiccating winds.
5. **ML Insights & Live Inference**:
   - Switch to **ML Model Insights**.
   - Show the **Feature Importance** chart demonstrating that 24h & 12h rainfall account for >95% of flood risk.
   - Scroll down to the **Live Inference Playground**, change 24h rainfall to 220mm, and hit **"Execute Model Inference"** to show instant model inference via FastAPI.
