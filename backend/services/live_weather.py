import time
from typing import Dict, Any

import httpx


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# Refresh live weather at most once every 5 minutes.
CACHE_SECONDS = 300


class LiveWeatherService:

    def __init__(self):
        self._cache = None
        self._cache_time = 0

    def get_weather(self, stations: list) -> Dict[str, Any]:

        now = time.time()

        # Use cached data if it is still fresh.
        if self._cache is not None and (now - self._cache_time) < CACHE_SECONDS:
            return self._cache

        if not stations:
            return {}

        try:
            latitudes = ",".join(
                str(st["coordinates"]["lat"])
                for st in stations
            )

            longitudes = ",".join(
                str(st["coordinates"]["lon"])
                for st in stations
            )

            params = {
                "latitude": latitudes,
                "longitude": longitudes,

                "hourly": ",".join([
                    "temperature_2m",
                    "relative_humidity_2m",
                    "precipitation",
                    "wind_speed_10m",
                    "soil_moisture_0_to_7cm"
                ]),

                "current": ",".join([
                    "temperature_2m",
                    "relative_humidity_2m",
                    "precipitation",
                    "wind_speed_10m"
                ]),

                "past_hours": 24,
                "forecast_hours": 1,

                "timezone": "Asia/Kolkata",

                "temperature_unit": "celsius",
                "wind_speed_unit": "kmh",
                "precipitation_unit": "mm"
            }

            response = httpx.get(
                OPEN_METEO_URL,
                params=params,
                timeout=20
            )

            response.raise_for_status()

            raw = response.json()

            # Multiple coordinates return a list.
            if isinstance(raw, dict):
                raw = [raw]

            result = {}

            for index, station in enumerate(stations):

                if index >= len(raw):
                    continue

                weather = raw[index]

                current = weather.get("current", {})
                hourly = weather.get("hourly", {})

                precipitation = hourly.get(
                    "precipitation",
                    []
                )

                # Remove missing values.
                precipitation = [
                    float(x)
                    for x in precipitation
                    if x is not None
                ]

                # Last 24 hourly precipitation values.
                rain_24h_values = precipitation[-24:]
                rain_12h_values = precipitation[-12:]
                rain_6h_values = precipitation[-6:]
                rain_3h_values = precipitation[-3:]

                rain_24h = sum(rain_24h_values)
                rain_12h = sum(rain_12h_values)
                rain_6h = sum(rain_6h_values)
                rain_3h = sum(rain_3h_values)

                soil_values = hourly.get(
                    "soil_moisture_0_to_7cm",
                    []
                )

                soil_values = [
                    float(x)
                    for x in soil_values
                    if x is not None
                ]

                soil_moisture = (
                    soil_values[-1] * 100
                    if soil_values
                    else 70.0
                )

                result[station["station_id"]] = {
                    "temperature_c": float(
                        current.get("temperature_2m", 0)
                    ),

                    "humidity_pct": float(
                        current.get(
                            "relative_humidity_2m",
                            0
                        )
                    ),

                    "wind_speed_kmh": float(
                        current.get(
                            "wind_speed_10m",
                            0
                        )
                    ),

                    "precipitation_current_mm": float(
                        current.get(
                            "precipitation",
                            0
                        )
                    ),

                    "precipitation_3h_mm": round(
                        rain_3h,
                        2
                    ),

                    "precipitation_6h_mm": round(
                        rain_6h,
                        2
                    ),

                    "precipitation_12h_mm": round(
                        rain_12h,
                        2
                    ),

                    "precipitation_24h_mm": round(
                        rain_24h,
                        2
                    ),

                    "soil_moisture_pct": round(
                        soil_moisture,
                        2
                    )
                }

            self._cache = result
            self._cache_time = now

            return result

        except Exception as e:

            print(
                f"[LIVE WEATHER] "
                f"Unable to fetch Open-Meteo data: {e}"
            )

            # Return the previous successful cache if available.
            return self._cache or {}


live_weather_service = LiveWeatherService()