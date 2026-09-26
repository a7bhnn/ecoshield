"""
ECO SHIELD - Backend Automated Test Suite
Tests all endpoints, ML inference, error handling, and response schemas.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["platform"] == "ECO SHIELD"
    print("[PASS] GET / passed")

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    print("[PASS] GET /health passed")

def test_dashboard():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "top_risks" in data
    assert "flood" in data["top_risks"]
    assert "landslide" in data["top_risks"]
    assert "wildfire" in data["top_risks"]
    print("[PASS] GET /api/dashboard passed")

def test_risks():
    res = client.get("/api/risks")
    assert res.status_code == 200
    data = res.json()
    assert data["total_districts"] > 0
    assert len(data["district_risks"]) == 14
    print("[PASS] GET /api/risks passed (14 districts verified)")

def test_alerts():
    res = client.get("/api/alerts")
    assert res.status_code == 200
    data = res.json()
    assert "alerts" in data
    print(f"[PASS] GET /api/alerts passed ({data['count']} active alerts)")

def test_historical_events():
    res = client.get("/api/historical-events")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 5
    assert data["data_notice"] == "HISTORICAL / DEMONSTRATION DATA"
    print("[PASS] GET /api/historical-events passed")

def test_environment():
    res = client.get("/api/environment")
    assert res.status_code == 200
    data = res.json()
    assert len(data["stations"]) > 0
    print("[PASS] GET /api/environment passed")

def test_ml_insights():
    res = client.get("/api/ml-insights")
    assert res.status_code == 200
    data = res.json()
    assert data["model_name"] == "XGBoost Flood Risk Classifier"
    assert "accuracy" in data["metrics"]
    print("[PASS] GET /api/ml-insights passed")

def test_predict_flood():
    payload = {
        "rain_current": 20.0,
        "rain_3h": 40.0,
        "rain_6h": 70.0,
        "rain_12h": 100.0,
        "rain_24h": 150.0
    }
    res = client.post("/api/predict/flood", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "risk_level" in data
    assert "risk_score" in data
    assert "confidence" in data
    assert "reasons" in data
    assert len(data["reasons"]) > 0
    print(f"[PASS] POST /api/predict/flood passed -> Level: {data['risk_level']}, Score: {data['risk_score']}")

def test_simulate():
    payload = {
        "district": "Wayanad",
        "rain_24h": 180.0,
        "rain_6h": 85.0,
        "temperature_c": 24.0,
        "humidity_pct": 95.0,
        "wind_speed_kmh": 25.0,
        "soil_moisture_pct": 92.0,
        "slope_degrees": 38.0
    }
    res = client.post("/api/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "cascade" in data
    assert len(data["cascade"]["nodes"]) == 5
    print("[PASS] POST /api/simulate passed -> Cascade nodes & multi-hazard computed")

if __name__ == "__main__":
    test_root()
    test_health()
    test_dashboard()
    test_risks()
    test_alerts()
    test_historical_events()
    test_environment()
    test_ml_insights()
    test_predict_flood()
    test_simulate()
    print("\n==========================================")
    print("ALL BACKEND & ML TESTS PASSED PERFECTLY!")
    print("==========================================")
