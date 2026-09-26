"""
ECO SHIELD - Flood Predictor & Inference Service
Loads serialized XGBoost model, runs inference on incoming telemetry or simulation inputs,
and derives explainable contributing factors and confidence metrics.
"""

from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd

CURRENT_DIR = Path(__file__).resolve().parent
MODEL_PATH = CURRENT_DIR / "flood_model.pkl"
METADATA_PATH = CURRENT_DIR / "model_metadata.json"

class FloodPredictor:
    def __init__(self):
        self.model = None
        self.feature_cols = None
        self.thresholds = None
        self.metrics = None
        self.feature_importances = None
        self.metadata = {}
        self._load()

    def _load(self):
        try:
            if MODEL_PATH.exists():
                artifact = joblib.load(MODEL_PATH)
                self.model = artifact["model"]
                self.feature_cols = artifact["feature_cols"]
                self.thresholds = artifact["thresholds"]
                self.metrics = artifact["metrics"]
                self.feature_importances = artifact.get("feature_importances", {})
                
            if METADATA_PATH.exists():
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
        except Exception as e:
            print(f"Warning loading flood model: {e}")
            self.model = None

    def is_ready(self) -> bool:
        return self.model is not None

    def predict(self, rain_current: float, rain_3h: float, rain_6h: float, rain_12h: float, rain_24h: float) -> dict:
        """
        Runs XGBoost inference if available, otherwise falls back to calibrated hydrologic rules.
        Returns risk_level, risk_score, confidence, and reasons.
        """
        # Derived features
        rain_prev = max(0.0, rain_3h - rain_current) / 2.0
        # Rate of change: current 3h vs prior period
        rain_trend = rain_3h - max(0.0, rain_6h - rain_3h)
        
        feature_vals = {
            "rain_current": float(rain_current),
            "rain_prev": float(rain_prev),
            "rain_3h": float(rain_3h),
            "rain_6h": float(rain_6h),
            "rain_12h": float(rain_12h),
            "rain_24h": float(rain_24h),
            "rain_trend": float(rain_trend)
        }
        
        reasons = []
        
        # Explainable factor inspection
        if rain_24h >= 150.0:
            reasons.append(f"Extremely high 24-hour rainfall accumulation ({rain_24h:.1f} mm) exceeds catchment holding threshold")
        elif rain_24h >= 100.0:
            reasons.append(f"Elevated 24-hour rainfall accumulation ({rain_24h:.1f} mm) saturating regional drainage basins")
        elif rain_24h >= 60.0:
            reasons.append(f"Moderate 24-hour rainfall ({rain_24h:.1f} mm) causing steady runoff accumulation")
            
        if rain_6h >= 70.0:
            reasons.append(f"High 6-hour rainfall volume ({rain_6h:.1f} mm) triggers rapid surface runoff surge")
        elif rain_6h >= 45.0:
            reasons.append(f"Noticeable 6-hour rainfall influx ({rain_6h:.1f} mm)")
            
        if rain_current >= 20.0:
            reasons.append(f"Severe cloudburst/high-intensity rainfall ({rain_current:.1f} mm/h) actively overwhelming storm drains")
        elif rain_trend > 15.0:
            reasons.append("Recent rainfall intensity is rapidly increasing compared to previous intervals")
            
        if not reasons:
            reasons.append("Precipitation levels remain within normal regional absorption thresholds")
            
        # Model Inference
        if self.model is not None and self.feature_cols:
            x_input = pd.DataFrame([[feature_vals[col] for col in self.feature_cols]], columns=self.feature_cols)
            probs = self.model.predict_proba(x_input)[0]
            # Prob of class 1 (high flood risk)
            raw_score = float(probs[1])
            
            # Confidence score
            confidence = float(round(float(max(probs[0], probs[1])), 2))
            
            # Calibrate continuous risk score: combine probability with accumulation gradient
            norm_24h = min(1.0, rain_24h / 200.0)
            norm_6h = min(1.0, rain_6h / 100.0)
            calc_score = 0.65 * raw_score + 0.25 * norm_24h + 0.10 * norm_6h
            risk_score = float(round(min(1.0, max(0.02, calc_score)), 2))
        else:
            # Deterministic hydrologic heuristic fallback
            score_24 = min(1.0, rain_24h / 180.0) * 0.55
            score_6 = min(1.0, rain_6h / 80.0) * 0.30
            score_curr = min(1.0, rain_current / 30.0) * 0.15
            risk_score = float(round(score_24 + score_6 + score_curr, 2))
            confidence = 0.85
            
        # Assign risk level
        if risk_score >= 0.75:
            risk_level = "CRITICAL" if (rain_24h >= 180 or rain_6h >= 90) else "HIGH"
        elif risk_score >= 0.45:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"
            
        return {
            "hazard": "Flood",
            "risk_level": risk_level,
            "risk_score": float(risk_score),
            "confidence": float(confidence),
            "reasons": reasons,
            "features_used": feature_vals
        }

# Global singleton
flood_predictor = FloodPredictor()
