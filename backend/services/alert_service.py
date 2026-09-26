"""
ECO SHIELD - Alert Generation & Early Warning Engine
Transforms multi-hazard risk evaluations into severity-graded, actionable advisories.
"""

from datetime import datetime
from typing import List, Dict, Any
from services.data_service import data_service
from services.risk_engine import risk_engine

class AlertService:
    def __init__(self):
        pass

    def generate_station_alerts(self) -> List[Dict[str, Any]]:
        """
        Evaluates current station readings across Kerala and generates active alerts.
        """
        stations = data_service.get_stations()
        alerts = []
        alert_counter = 1

        for st in stations:
            district = st.get("district", "Kerala")
            name = st.get("name", "Monitoring Station")
            r = st.get("readings", {})
            terrain = st.get("terrain", "Standard")
            coords = st.get("coordinates", {"lat": 10.0, "lon": 76.0})
            
            rain_curr = r.get("precipitation_current_mm", 0.0)
            rain_3h = r.get("precipitation_3h_mm", 0.0)
            rain_6h = r.get("precipitation_6h_mm", 0.0)
            rain_12h = r.get("precipitation_12h_mm", 0.0)
            rain_24h = r.get("precipitation_24h_mm", 0.0)
            temp = r.get("temperature_c", 28.0)
            hum = r.get("humidity_pct", 80.0)
            soil = r.get("soil_moisture_pct", 75.0)
            wind = r.get("wind_speed_kmh", 15.0)
            riv = r.get("river_level_m", 0.0)
            riv_danger = r.get("river_danger_level_m", 0.0)
            
            # Terrain slope approximation
            slope = 38.0 if "Ghats" in terrain or "Hills" in terrain else (5.0 if "Lowland" in terrain or "Polder" in terrain else 15.0)

            # 1. Flood check
            flood_eval = risk_engine.evaluate_flood_risk(
                rain_current=rain_curr,
                rain_3h=rain_3h,
                rain_6h=rain_6h,
                rain_12h=rain_12h,
                rain_24h=rain_24h,
                river_level=riv,
                river_danger_level=riv_danger
            )
            
            # 2. Landslide check
            landslide_eval = risk_engine.evaluate_landslide_risk(
                rain_24h=rain_24h,
                soil_moisture_pct=soil,
                slope_degrees=slope
            )
            
            # 3. Wildfire check
            wildfire_eval = risk_engine.evaluate_wildfire_risk(
                temperature_c=temp,
                humidity_pct=hum,
                wind_speed_kmh=wind,
                rain_24h=rain_24h
            )
            
            evals = [flood_eval, landslide_eval, wildfire_eval]
            
            for ev in evals:
                level = ev["level"]
                hazard = ev["hazard"]
                
                # Rule: LOW -> No alert, MODERATE -> Advisory, HIGH -> Warning, CRITICAL -> Urgent Warning
                if level in ["MODERATE", "HIGH", "CRITICAL"]:
                    action = self._get_recommended_action(hazard, level, terrain)
                    
                    alert = {
                        "id": f"ALT-KL-{alert_counter:04d}",
                        "hazard": hazard,
                        "location": district,
                        "station_name": name,
                        "coordinates": coords,
                        "severity": level,
                        "score": float(ev["score"]),
                        "trend": ev["trend"],
                        "timestamp": ev["timestamp"],
                        "status": "ACTIVE",
                        "data_class": "LIVE / TELEMETRY EVALUATION",
                        "reason": ev["factors"][0] if ev["factors"] else f"{hazard} risk parameter elevated",
                        "all_factors": ev["factors"],
                        "recommended_action": action
                    }
                    alerts.append(alert)
                    alert_counter += 1

        # Sort by severity descending (CRITICAL -> HIGH -> MODERATE)
        severity_order = {"CRITICAL": 3, "HIGH": 2, "MODERATE": 1, "LOW": 0}
        alerts.sort(key=lambda x: (severity_order.get(x["severity"], 0), x["score"]), reverse=True)
        return alerts

    def _get_recommended_action(self, hazard: str, severity: str, terrain: str) -> str:
        if hazard == "Flood":
            if severity == "CRITICAL":
                return "Urgent Warning: Inundation imminent in low-lying zones. Relocate electrical assets; avoid crossing causeways."
            elif severity == "HIGH":
                return "Warning: Clear local culverts; monitor water level gauges along tributary banks."
            else:
                return "Advisory: Continuous rainfall expected; monitor localized stormwater accumulation."
                
        elif hazard == "Landslide":
            if severity == "CRITICAL":
                return "Urgent Warning: Critical slope saturation. Avoid traveling along steep ghat passes; watch for springs/mud oozing."
            elif severity == "HIGH":
                return "Warning: High risk of slope creep. Restrict nocturnal travel on hill roads."
            else:
                return "Advisory: Antecedent moisture rising; inspect retaining walls and hillside drainage trenches."
                
        elif hazard == "Wildfire":
            if severity == "CRITICAL":
                return "Urgent Warning: High ignition susceptibility. Prohibit agricultural burning; patrol reserve forest fringes."
            elif severity == "HIGH":
                return "Warning: Maintain firebreaks around plantations; report unattended smoke columns."
            else:
                return "Advisory: Dry weather conditions; exercise standard fire safety vigilance."
                
        return "Advisory: Follow local disaster management bulletins."

alert_service = AlertService()
