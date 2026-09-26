"""
ECO SHIELD - Flood Risk ML Pipeline
XGBoost-based prototype model trained on Kerala rainfall telemetry.
Uses dynamic column detection, feature engineering, and configurable proxy labeling.
"""

import sys
import re
import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report
import xgboost as xgb

# ---------------------------------------------------------
# Robust Path Handling via pathlib
# ---------------------------------------------------------
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

DATA_CSV_PATH = BACKEND_DIR / "data" / "rainfall.csv"
MODEL_SAVE_PATH = CURRENT_DIR / "flood_model.pkl"
METADATA_SAVE_PATH = CURRENT_DIR / "model_metadata.json"

# ---------------------------------------------------------
# Configurable Proxy Flood Risk Label Thresholds
# Note: As documented in design requirements, real flood occurrences
# depend on topography and catchment saturation. When direct binary flood
# sensors are absent, we derive a transparent hydrometeorological proxy.
# ---------------------------------------------------------
PROXY_THRESHOLDS = {
    "rain_24h_critical_mm": 120.0,   # CWC Heavy Rainfall Warning threshold (mm in 24h)
    "rain_6h_flash_mm": 60.0,        # Rapid runoff trigger threshold
    "rain_intensity_spike_mm": 25.0, # Cloudburst / localized high intensity (mm in 1h)
    "rain_3h_support_mm": 40.0       # Corroborating short-term intensity
}

def detect_columns(df: pd.DataFrame):
    """
    Dynamically detect relevant columns without hardcoding assumptions.
    Returns: dict of detected column names
    """
    detected = {
        "rainfall": None,
        "timestamp": None,
        "station": None,
        "district": None,
        "soil_moisture": None
    }
    
    # Precise rainfall patterns (prevent 'terrain' matching 'rain')
    rain_patterns = [r"^precipitation", r"precipitation_mm", r"^rainfall", r"rainfall_mm", r"rain_mm", r"^precip", r"^rain$"]
    time_patterns = [r"time", r"timestamp", r"date", r"datetime"]
    station_patterns = [r"station", r"sensor", r"station_id"]
    district_patterns = [r"district", r"region", r"location", r"city"]
    soil_patterns = [r"soil", r"moisture", r"saturation"]
    
    cols = list(df.columns)
    
    # 1. Detect rainfall (must be numeric or convertible, and not terrain)
    for col in cols:
        col_lower = col.lower().strip()
        if "terrain" in col_lower:
            continue
        if any(re.search(pat, col_lower) for pat in rain_patterns):
            detected["rainfall"] = col
            break
            
    # Fallback for rainfall if not found by pattern
    if not detected["rainfall"]:
        for col in cols:
            col_lower = col.lower().strip()
            if "terrain" in col_lower:
                continue
            if "rain" in col_lower and pd.api.types.is_numeric_dtype(df[col]):
                detected["rainfall"] = col
                break
                
    # 2. Detect other columns
    for col in cols:
        col_lower = col.lower().strip()
        if not detected["timestamp"] and any(re.search(pat, col_lower) for pat in time_patterns):
            detected["timestamp"] = col
        elif not detected["station"] and any(re.search(pat, col_lower) for pat in station_patterns):
            detected["station"] = col
        elif not detected["district"] and any(re.search(pat, col_lower) for pat in district_patterns):
            detected["district"] = col
        elif not detected["soil_moisture"] and any(re.search(pat, col_lower) for pat in soil_patterns):
            detected["soil_moisture"] = col
                
    return detected

def build_features_and_target(df: pd.DataFrame, detected: dict):
    """
    Preprocess, sort chronologically, engineer rolling accumulation features,
    and generate the configurable proxy flood risk target.
    """
    rain_col = detected["rainfall"]
    time_col = detected["timestamp"]
    station_col = detected["station"]
    
    # 5. Convert rainfall values to numeric & 6. Handle missing values
    df[rain_col] = pd.to_numeric(df[rain_col], errors="coerce").fillna(0.0)
    
    # 7. Sort chronologically when timestamps exist
    if time_col and time_col in df.columns:
        df["_dt"] = pd.to_datetime(df[time_col], errors="coerce")
        if station_col and station_col in df.columns:
            df = df.sort_values(by=[station_col, "_dt"]).reset_index(drop=True)
        else:
            df = df.sort_values(by=["_dt"]).reset_index(drop=True)
            
    # 8. Generate features
    # If grouped by station, calculate rolling accumulations per station
    def compute_group_features(group):
        r = group[rain_col]
        # Current and previous
        group["rain_current"] = r
        group["rain_prev"] = r.shift(1).fillna(0.0)
        
        # Rolling accumulations
        group["rain_3h"] = r.rolling(window=3, min_periods=1).sum()
        group["rain_6h"] = r.rolling(window=6, min_periods=1).sum()
        group["rain_12h"] = r.rolling(window=12, min_periods=1).sum()
        group["rain_24h"] = r.rolling(window=24, min_periods=1).sum()
        
        # Rainfall trend: difference between current 3h rate and prior 3h rate
        prior_3h = r.shift(3).rolling(window=3, min_periods=1).sum().fillna(0.0)
        group["rain_trend"] = group["rain_3h"] - prior_3h
        
        if "_dt" in group.columns:
            group["hour"] = group["_dt"].dt.hour
            group["day"] = group["_dt"].dt.day
            group["month"] = group["_dt"].dt.month
        else:
            group["hour"] = 12
            group["day"] = 1
            group["month"] = 7
            
        return group
    
    if station_col and station_col in df.columns:
        df = df.groupby(station_col, group_keys=False).apply(compute_group_features)
    else:
        df = compute_group_features(df)
        
    # Clean any NaNs in generated features
    feature_cols = ["rain_current", "rain_prev", "rain_3h", "rain_6h", "rain_12h", "rain_24h", "rain_trend"]
    for f in feature_cols:
        df[f] = df[f].fillna(0.0)
        
    # Generate Configurable Proxy Flood Risk Label (Binary classification)
    # High risk (1) if 24h exceeds threshold OR 6h exceeds threshold OR intensity spike with 3h support
    c_24 = df["rain_24h"] >= PROXY_THRESHOLDS["rain_24h_critical_mm"]
    c_6 = df["rain_6h"] >= PROXY_THRESHOLDS["rain_6h_flash_mm"]
    c_spike = (df["rain_current"] >= PROXY_THRESHOLDS["rain_intensity_spike_mm"]) & (df["rain_3h"] >= PROXY_THRESHOLDS["rain_3h_support_mm"])
    
    df["flood_risk_target"] = (c_24 | c_6 | c_spike).astype(int)
    
    return df, feature_cols

def train():
    print(f"Loading dataset from: {DATA_CSV_PATH}")
    if not DATA_CSV_PATH.exists():
        raise FileNotFoundError(f"Rainfall CSV not found at: {DATA_CSV_PATH}")
        
    df = pd.read_csv(DATA_CSV_PATH)
    
    # 1. Load CSV & 2. Print all column names
    print("Dataset loaded")
    print(f"Total rows: {len(df)}")
    print(f"Columns in dataset: {list(df.columns)}")
    
    # 3. Detect rainfall column & 4. Detect timestamp column
    detected = detect_columns(df)
    print(f"Detected columns: {detected}")
    if not detected["rainfall"]:
        raise ValueError("Could not detect any rainfall/precipitation column in CSV!")
        
    # 5-8. Generate features & targets
    processed_df, feature_cols = build_features_and_target(df, detected)
    print("Features created")
    print(f"Engineered feature set: {feature_cols}")
    print(f"Target distribution:\n{processed_df['flood_risk_target'].value_counts(normalize=True)}")
    
    X = processed_df[feature_cols]
    y = processed_df["flood_risk_target"]
    
    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if y.nunique() > 1 else None
    )
    
    print("Training started")
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric="logloss"
    )
    model.fit(X_train, y_train)
    print("Training completed")
    
    # Evaluation
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_prob) if len(np.unique(y_test)) > 1 else 1.0
    
    print(f"Model accuracy: {acc:.4f} (Accuracy: {acc*100:.2f}%)")
    print(f"Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f}")
    
    # Extract feature importance
    importance_dict = dict(zip(feature_cols, [float(v) for v in model.feature_importances_]))
    sorted_importances = sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
    print(f"Feature Importances: {sorted_importances}")
    
    # Verify model is valid before saving
    test_sample = np.array([[20.0, 15.0, 45.0, 75.0, 110.0, 145.0, 15.0]])
    sample_pred = model.predict_proba(test_sample)
    if sample_pred is None or sample_pred.shape[1] != 2:
        raise ValueError("Model validation before saving failed: invalid output shape")
        
    # Save model and metadata
    MODEL_SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    artifact = {
        "model": model,
        "feature_cols": feature_cols,
        "detected_columns": detected,
        "thresholds": PROXY_THRESHOLDS,
        "metrics": {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc)
        },
        "feature_importances": importance_dict
    }
    
    joblib.dump(artifact, MODEL_SAVE_PATH)
    print("Model saved")
    
    metadata = {
        "model_type": "XGBoost Classifier (XGBClassifier)",
        "framework": "xgboost 2.x / scikit-learn",
        "dataset": "Kerala CWC & IMD Rainfall Telemetry (14 Districts)",
        "features": feature_cols,
        "feature_importances": sorted_importances,
        "metrics": artifact["metrics"],
        "proxy_thresholds": PROXY_THRESHOLDS,
        "disclaimer": "Prototype rainfall-based flood-risk model. Prediction is a risk estimate, not an official flood warning.",
        "verified": True
    }
    
    with open(METADATA_SAVE_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
        
    # Re-load immediately to verify pickle integrity
    loaded_artifact = joblib.load(MODEL_SAVE_PATH)
    loaded_model = loaded_artifact["model"]
    verification_check = loaded_model.predict_proba(test_sample)
    
    if verification_check is not None and len(verification_check) == 1:
        print("Model verification successful")
    else:
        raise RuntimeError("Model verification failed after reload!")
        
    return artifact

if __name__ == "__main__":
    train()
