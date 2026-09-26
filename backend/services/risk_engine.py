"""
ECO SHIELD - Explainable Multi-Hazard Risk Engine

Evaluates Flood, Landslide, and Wildfire risks with deterministic explainability,
empirical physics thresholds, and systemic cascade modeling.
"""

from datetime import datetime
from typing import Dict, List, Any

import numpy as np

# Import flood predictor
from ml.predict import flood_predictor


class RiskEngine:

    def __init__(self):
        pass

    # ============================================================
    # FLOOD RISK
    # ============================================================

    def evaluate_flood_risk(
        self,
        rain_current: float,
        rain_3h: float,
        rain_6h: float,
        rain_12h: float,
        rain_24h: float,
        river_level: float = 0.0,
        river_danger_level: float = 0.0,
        river_signal: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Calculates flood risk using the XGBoost model augmented
        with hydrological river basin factors.

        river_signal:
            Optional river telemetry intelligence.

            Historical fallback telemetry is used for context only.
            Only LIVE telemetry is allowed to modify the flood score.
        """

        # --------------------------------------------------------
        # Call ML flood predictor
        # --------------------------------------------------------

        pred = flood_predictor.predict(
            rain_current=rain_current,
            rain_3h=rain_3h,
            rain_6h=rain_6h,
            rain_12h=rain_12h,
            rain_24h=rain_24h
        )

        score = pred["risk_score"]
        factors = list(pred["reasons"])

        # --------------------------------------------------------
        # Existing river gauge factor
        # --------------------------------------------------------

        if river_danger_level > 0 and river_level > 0:

            river_ratio = river_level / river_danger_level

            if river_ratio >= 1.0:

                score = min(
                    1.0,
                    score + 0.15
                )

                factors.insert(
                    0,
                    f"River gauge ({river_level:.1f}m) "
                    f"has breached critical danger mark "
                    f"({river_danger_level:.1f}m)"
                )

            elif river_ratio >= 0.85:

                score = min(
                    1.0,
                    score + 0.08
                )

                factors.insert(
                    0,
                    f"River level ({river_level:.1f}m) "
                    f"approaching bankfull warning threshold "
                    f"({river_danger_level:.1f}m)"
                )

        # --------------------------------------------------------
        # NEW: Kerala river telemetry intelligence
        # --------------------------------------------------------
        #
        # IMPORTANT:
        # Historical fallback data must NOT modify today's
        # flood score.
        #
        # Only LIVE telemetry can modify the score.
        # --------------------------------------------------------

        river_signal_applied = False
        river_signal_status = "UNAVAILABLE"

        if river_signal:

            river_signal_status = river_signal.get(
                "data_status",
                "UNAVAILABLE"
            )

            # Only LIVE telemetry is allowed to affect score
            if river_signal_status == "LIVE":

                anomaly = float(
                    river_signal.get(
                        "anomaly_zscore",
                        0.0
                    )
                )

                signal = river_signal.get(
                    "signal",
                    "NORMAL"
                )

                # Severe anomaly
                if signal == "SEVERE_ANOMALY":

                    score = min(
                        1.0,
                        score + 0.15
                    )

                    factors.insert(
                        0,
                        "Live river telemetry shows a severe "
                        f"water-level anomaly ({anomaly:+.2f}σ)"
                    )

                    river_signal_applied = True

                # High anomaly
                elif signal == "HIGH_ANOMALY":

                    score = min(
                        1.0,
                        score + 0.10
                    )

                    factors.insert(
                        0,
                        "Live river telemetry shows a high "
                        f"water-level anomaly ({anomaly:+.2f}σ)"
                    )

                    river_signal_applied = True

                # Elevated anomaly
                elif signal == "ELEVATED":

                    score = min(
                        1.0,
                        score + 0.05
                    )

                    factors.insert(
                        0,
                        "Live river telemetry shows an elevated "
                        f"water-level anomaly ({anomaly:+.2f}σ)"
                    )

                    river_signal_applied = True

        # --------------------------------------------------------
        # Determine trend
        # --------------------------------------------------------

        rain_trend_rate = (
            rain_3h
            - max(
                0.0,
                rain_6h - rain_3h
            )
        )

        if rain_trend_rate > 10.0:
            trend = "INCREASING"

        elif rain_trend_rate < -8.0:
            trend = "DECREASING"

        else:
            trend = "STABLE"

        # --------------------------------------------------------
        # Determine risk level
        # --------------------------------------------------------

        level = self._classify_level(score)

        # --------------------------------------------------------
        # Return flood result
        # --------------------------------------------------------

        return {
            "hazard": "Flood",
            "score": float(
                round(score, 2)
            ),
            "level": level,
            "trend": trend,
            "confidence": float(
                pred.get(
                    "confidence",
                    0.88
                )
            ),
            "factors": [
                str(f)
                for f in factors
            ],

            # NEW: transparent river intelligence
            "river_intelligence": {
                "status": river_signal_status,
                "score_adjustment_applied": river_signal_applied,

                "station": (
                    river_signal.get("station")
                    if river_signal
                    else None
                ),

                "anomaly_zscore": (
                    river_signal.get(
                        "anomaly_zscore"
                    )
                    if river_signal
                    else None
                ),

                "signal": (
                    river_signal.get("signal")
                    if river_signal
                    else None
                )
            },

            "timestamp": datetime.now().isoformat()
        }

    # ============================================================
    # LANDSLIDE RISK
    # ============================================================

    def evaluate_landslide_risk(
        self,
        rain_24h: float,
        soil_moisture_pct: float,
        slope_degrees: float = 30.0,
        antecedent_rain_3d: float = None
    ) -> Dict[str, Any]:
        """
        Calculates landslide risk in Western Ghats terrain based on
        pore-water pressure accumulation, soil saturation,
        and slope gradient.
        """

        if antecedent_rain_3d is None:
            antecedent_rain_3d = rain_24h * 1.85

        factors = []
        score = 0.05

        # --------------------------------------------------------
        # Factor 1: Soil Moisture Saturation
        # --------------------------------------------------------

        if soil_moisture_pct >= 90.0:

            score += 0.40

            factors.append(
                f"Extreme soil saturation "
                f"({soil_moisture_pct:.1f}%) significantly "
                f"degrades shear resistance"
            )

        elif soil_moisture_pct >= 75.0:

            score += 0.25

            factors.append(
                f"Elevated soil moisture "
                f"({soil_moisture_pct:.1f}%) weakens "
                f"upper soil cohesion"
            )

        elif soil_moisture_pct >= 60.0:

            score += 0.10

            factors.append(
                f"Moderate soil moisture "
                f"({soil_moisture_pct:.1f}%)"
            )

        else:

            factors.append(
                f"Soil moisture "
                f"({soil_moisture_pct:.1f}%) remains "
                f"well below critical liquefaction threshold"
            )

        # --------------------------------------------------------
        # Factor 2: Antecedent 3-Day Cumulative Rainfall
        # --------------------------------------------------------

        if antecedent_rain_3d >= 250.0:

            score += 0.35

            factors.append(
                f"Severe 72h antecedent rainfall "
                f"({antecedent_rain_3d:.1f} mm) exceeds "
                f"GSI landslide trigger threshold (>200 mm)"
            )

        elif antecedent_rain_3d >= 140.0:

            score += 0.20

            factors.append(
                f"Substantial 72h rainfall accumulation "
                f"({antecedent_rain_3d:.1f} mm) "
                f"pre-conditioning slopes"
            )

        elif antecedent_rain_3d >= 70.0:

            score += 0.10

        # --------------------------------------------------------
        # Factor 3: 24h Rainfall Intensity
        # --------------------------------------------------------

        if rain_24h >= 140.0:

            score += 0.15

            factors.append(
                f"Intense short-term precipitation "
                f"({rain_24h:.1f} mm in 24h) drives rapid infiltration"
            )

        # --------------------------------------------------------
        # Factor 4: Topographic Slope Multiplier
        # --------------------------------------------------------

        if slope_degrees >= 35.0:

            score *= 1.25

            factors.append(
                f"Steep Ghats terrain gradient "
                f"({slope_degrees:.0f}°) creates high "
                f"gravitational shear stress"
            )

        elif slope_degrees <= 10.0:

            score *= 0.35

            factors.append(
                f"Gentle terrain slope "
                f"({slope_degrees:.0f}°) provides "
                f"natural slope stability"
            )

        # --------------------------------------------------------
        # Clamp score
        # --------------------------------------------------------

        score = float(
            min(
                1.0,
                max(
                    0.02,
                    round(score, 2)
                )
            )
        )

        level = self._classify_level(score)

        # --------------------------------------------------------
        # Trend
        # --------------------------------------------------------

        if rain_24h > 100 or soil_moisture_pct > 85:

            trend = "INCREASING"

        elif rain_24h < 25 and soil_moisture_pct < 65:

            trend = "DECREASING"

        else:

            trend = "STABLE"

        return {
            "hazard": "Landslide",
            "score": float(score),
            "level": level,
            "trend": trend,
            "confidence": 0.84,
            "factors": [
                str(f)
                for f in factors
            ],
            "timestamp": datetime.now().isoformat()
        }

    # ============================================================
    # WILDFIRE RISK
    # ============================================================

    def evaluate_wildfire_risk(
        self,
        temperature_c: float,
        humidity_pct: float,
        wind_speed_kmh: float,
        rain_24h: float = 0.0,
        dry_days: int = 5
    ) -> Dict[str, Any]:
        """
        Calculates wildfire risk based on fuel moisture dryness,
        thermal index, and wind propagation.
        """

        factors = []
        score = 0.04

        # --------------------------------------------------------
        # Suppressor: Recent rainfall
        # --------------------------------------------------------

        if rain_24h > 15.0:

            score = 0.05

            factors.append(
                f"Recent precipitation "
                f"({rain_24h:.1f} mm) fully dampens vegetation "
                f"and forest fuel"
            )

            return {
                "hazard": "Wildfire",
                "score": score,
                "level": "LOW",
                "trend": "DECREASING",
                "confidence": 0.92,
                "factors": factors,
                "timestamp": datetime.now().isoformat()
            }

        # --------------------------------------------------------
        # Factor 1: High Temperature
        # --------------------------------------------------------

        if temperature_c >= 38.0:

            score += 0.30

            factors.append(
                f"Extreme ambient heat "
                f"({temperature_c:.1f}°C) accelerating "
                f"evapotranspiration"
            )

        elif temperature_c >= 33.0:

            score += 0.20

            factors.append(
                f"Elevated temperatures "
                f"({temperature_c:.1f}°C) drying canopy foliage"
            )

        elif temperature_c >= 28.0:

            score += 0.10

        else:

            factors.append(
                f"Cool ambient temperature "
                f"({temperature_c:.1f}°C)"
            )

        # --------------------------------------------------------
        # Factor 2: Low Relative Humidity
        # --------------------------------------------------------

        if humidity_pct <= 25.0:

            score += 0.35

            factors.append(
                f"Critically dry atmospheric humidity "
                f"({humidity_pct:.1f}%) primes dry fine fuels "
                f"for ignition"
            )

        elif humidity_pct <= 40.0:

            score += 0.22

            factors.append(
                f"Low relative humidity "
                f"({humidity_pct:.1f}%) reduces leaf fuel moisture"
            )

        elif humidity_pct <= 60.0:

            score += 0.08

        else:

            factors.append(
                f"High atmospheric humidity "
                f"({humidity_pct:.1f}%) inhibits ignition"
            )

        # --------------------------------------------------------
        # Factor 3: Wind Velocity
        # --------------------------------------------------------

        if wind_speed_kmh >= 35.0:

            score += 0.25

            factors.append(
                f"Strong sustained winds "
                f"({wind_speed_kmh:.1f} km/h) capable of rapid "
                f"fire spread and spotting"
            )

        elif wind_speed_kmh >= 20.0:

            score += 0.12

            factors.append(
                f"Moderate breeze "
                f"({wind_speed_kmh:.1f} km/h) providing "
                f"convective oxygenation"
            )

        else:

            factors.append(
                f"Light winds "
                f"({wind_speed_kmh:.1f} km/h)"
            )

        # --------------------------------------------------------
        # Factor 4: Dry spell duration
        # --------------------------------------------------------

        if dry_days >= 15:

            score += 0.10

            factors.append(
                f"Extended dry spell "
                f"({dry_days} days without rain) "
                f"desiccating undergrowth"
            )

        # --------------------------------------------------------
        # Clamp score
        # --------------------------------------------------------

        score = float(
            min(
                1.0,
                max(
                    0.01,
                    round(score, 2)
                )
            )
        )

        level = self._classify_level(score)

        # --------------------------------------------------------
        # Trend
        # --------------------------------------------------------

        if (
            temperature_c > 34
            and humidity_pct < 35
            and wind_speed_kmh > 25
        ):

            trend = "INCREASING"

        elif rain_24h > 5 or humidity_pct > 70:

            trend = "DECREASING"

        else:

            trend = "STABLE"

        return {
            "hazard": "Wildfire",
            "score": float(score),
            "level": level,
            "trend": trend,
            "confidence": 0.86,
            "factors": [
                str(f)
                for f in factors
            ],
            "timestamp": datetime.now().isoformat()
        }

    # ============================================================
    # MULTI-HAZARD RISK CASCADE
    # ============================================================

    def evaluate_risk_cascade(
        self,
        rain_24h: float,
        rain_6h: float,
        soil_moisture_pct: float,
        temperature_c: float,
        humidity_pct: float,
        wind_speed_kmh: float,
        slope_degrees: float = 30.0
    ) -> Dict[str, Any]:
        """
        Models deterministic multi-hazard compounding risk cascade.

        Example:
        Heavy Precipitation
            ->
        Soil Saturation
            ->
        Lowland Inundation
            ->
        Highland Slope Failure
        """

        flood_eval = self.evaluate_flood_risk(
            rain_current=rain_6h / 6.0,
            rain_3h=rain_6h * 0.55,
            rain_6h=rain_6h,
            rain_12h=rain_24h * 0.65,
            rain_24h=rain_24h
        )

        landslide_eval = self.evaluate_landslide_risk(
            rain_24h=rain_24h,
            soil_moisture_pct=soil_moisture_pct,
            slope_degrees=slope_degrees
        )

        wildfire_eval = self.evaluate_wildfire_risk(
            temperature_c=temperature_c,
            humidity_pct=humidity_pct,
            wind_speed_kmh=wind_speed_kmh,
            rain_24h=rain_24h
        )

        # --------------------------------------------------------
        # Build cascade nodes
        # --------------------------------------------------------

        nodes = [

            {
                "id": "node_precip",
                "label": "Atmospheric Precipitation",
                "value": f"{rain_24h:.1f} mm / 24h",
                "status": (
                    "CRITICAL"
                    if rain_24h >= 150
                    else (
                        "ELEVATED"
                        if rain_24h >= 60
                        else "NORMAL"
                    )
                ),
                "description":
                    "Primary trigger of hydrometeorological stress"
            },

            {
                "id": "node_saturation",
                "label": "Soil Saturation & Runoff",
                "value": f"{soil_moisture_pct:.1f}% Moisture",
                "status": (
                    "CRITICAL"
                    if soil_moisture_pct >= 90
                    else (
                        "ELEVATED"
                        if soil_moisture_pct >= 75
                        else "NORMAL"
                    )
                ),
                "description":
                    "Ground infiltration capacity reached; "
                    "surface runoff increases"
            },

            {
                "id": "node_flood",
                "label": "Lowland Flood Inundation",
                "value":
                    f"Risk: {flood_eval['level']} "
                    f"({int(flood_eval['score'] * 100)}%)",
                "status": flood_eval["level"],
                "description":
                    "River channels and urban stormwater "
                    "basins overwhelmed"
            },

            {
                "id": "node_landslide",
                "label": "Highland Slope Destabilization",
                "value":
                    f"Risk: {landslide_eval['level']} "
                    f"({int(landslide_eval['score'] * 100)}%)",
                "status": landslide_eval["level"],
                "description":
                    "Liquefaction and loss of shear strength "
                    "on Ghats slopes"
            },

            {
                "id": "node_wildfire",
                "label": "Forest Dry Fuel Ignition",
                "value":
                    f"Risk: {wildfire_eval['level']} "
                    f"({int(wildfire_eval['score'] * 100)}%)",
                "status": wildfire_eval["level"],
                "description":
                    "Thermal desiccation and wind-driven spread "
                    "in forest corridors"
            }

        ]

        # --------------------------------------------------------
        # Systemic interaction insights
        # --------------------------------------------------------

        compound_insights = []

        if (
            flood_eval["level"] in ["HIGH", "CRITICAL"]
            and landslide_eval["level"] in ["HIGH", "CRITICAL"]
        ):

            compound_insights.append(
                "COMPOUND CRISIS: Simultaneous river valley "
                "flooding and highland slope failures cut off "
                "evacuation routes and bridge crossings."
            )

        elif flood_eval["level"] in ["HIGH", "CRITICAL"]:

            compound_insights.append(
                "HYDRAULIC SURGE: Downstream river catchments "
                "receiving heavy runoff from upstream Western "
                "Ghats basins."
            )

        elif wildfire_eval["level"] in ["HIGH", "CRITICAL"]:

            compound_insights.append(
                "THERMAL ARIDITY: Extended lack of moisture "
                "combined with gusty winds elevates ember "
                "transport across forest reserves."
            )

        else:

            compound_insights.append(
                "STABLE EQUILIBRIUM: Environmental parameters "
                "are currently within baseline regional "
                "absorption limits."
            )

        return {
            "timestamp": datetime.now().isoformat(),
            "nodes": nodes,
            "compound_insights": compound_insights,
            "primary_hazards": {
                "flood": flood_eval,
                "landslide": landslide_eval,
                "wildfire": wildfire_eval
            }
        }

    # ============================================================
    # RISK LEVEL CLASSIFICATION
    # ============================================================

    def _classify_level(
        self,
        score: float
    ) -> str:

        if score >= 0.75:
            return "CRITICAL"

        elif score >= 0.50:
            return "HIGH"

        elif score >= 0.25:
            return "MODERATE"

        else:
            return "LOW"


# Global risk engine instance
risk_engine = RiskEngine()