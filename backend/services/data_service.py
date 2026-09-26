"""
ECO SHIELD - Data Service

Loads station metadata and historical events while replacing
synthetic environmental readings with live weather data.
"""

from pathlib import Path
import json
import pandas as pd
from datetime import datetime
from copy import deepcopy

from services.live_weather import live_weather_service


CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
DATA_DIR = BACKEND_DIR / "data"

DEMO_ENV_FILE = DATA_DIR / "demo_environment.json"
HISTORICAL_FILE = DATA_DIR / "historical_events.json"
RAINFALL_CSV = DATA_DIR / "rainfall.csv"


class DataService:

    def __init__(self):
        self._cached_demo = None
        self._cached_historical = None
        self._cached_rainfall_df = None

        self.reload_all()

    def reload_all(self):

        self._load_demo_env()
        self._load_historical()
        self._load_rainfall_csv()

    # ---------------------------------------------------------
    # LOCAL DATA
    # ---------------------------------------------------------

    def _load_demo_env(self):

        if DEMO_ENV_FILE.exists():

            try:

                with open(
                    DEMO_ENV_FILE,
                    "r",
                    encoding="utf-8"
                ) as f:

                    self._cached_demo = json.load(f)

            except Exception as e:

                print(
                    f"Error loading demo_environment.json: {e}"
                )

                self._cached_demo = {
                    "system_info": {},
                    "stations": []
                }

        else:

            self._cached_demo = {
                "system_info": {},
                "stations": []
            }

    def _load_historical(self):

        if HISTORICAL_FILE.exists():

            try:

                with open(
                    HISTORICAL_FILE,
                    "r",
                    encoding="utf-8"
                ) as f:

                    self._cached_historical = json.load(f)

            except Exception as e:

                print(
                    f"Error loading historical_events.json: {e}"
                )

                self._cached_historical = []

        else:

            self._cached_historical = []

    def _load_rainfall_csv(self):

        if RAINFALL_CSV.exists():

            try:

                self._cached_rainfall_df = pd.read_csv(
                    RAINFALL_CSV
                )

            except Exception as e:

                print(
                    f"Error loading rainfall.csv: {e}"
                )

                self._cached_rainfall_df = None

        else:

            self._cached_rainfall_df = None

    # ---------------------------------------------------------
    # SYSTEM
    # ---------------------------------------------------------

    def get_system_info(self) -> dict:

        return self._cached_demo.get(
            "system_info",
            {
                "platform": "ECO SHIELD",
                "version": "1.0.0",
                "mode": "LIVE WEATHER",
                "data_source": "Open-Meteo",
                "last_updated": datetime.now().isoformat()
            }
        )

    # ---------------------------------------------------------
    # STATIONS + LIVE WEATHER
    # ---------------------------------------------------------

    def get_stations(self) -> list:

        base_stations = deepcopy(
            self._cached_demo.get(
                "stations",
                []
            )
        )

        if not base_stations:
            return []

        # Fetch live weather for all 14 stations
        # in one Open-Meteo request.
        live_data = live_weather_service.get_weather(
            base_stations
        )

        for station in base_stations:

            station_id = station.get(
                "station_id"
            )

            live = live_data.get(
                station_id
            )

            if not live:
                continue

            # Preserve station metadata.
            # Replace environmental readings.
            station["readings"].update(live)

            station["status"] = "LIVE"

            station["data_source"] = (
                "Open-Meteo live weather"
            )

            station["last_updated"] = (
                datetime.now().isoformat()
            )

        return base_stations

    def get_station_by_id(
        self,
        station_id: str
    ) -> dict:

        for station in self.get_stations():

            if station.get(
                "station_id"
            ) == station_id:

                return station

        return None

    # ---------------------------------------------------------
    # HISTORICAL
    # ---------------------------------------------------------

    def get_historical_events(self) -> list:

        return self._cached_historical

    # ---------------------------------------------------------
    # RAINFALL TIMESERIES
    # ---------------------------------------------------------

    def get_rainfall_timeseries(
        self,
        station_id: str = None,
        limit: int = 48
    ) -> list:

        if (
            self._cached_rainfall_df is not None
            and not self._cached_rainfall_df.empty
        ):

            df = self._cached_rainfall_df

            if station_id:

                df = df[
                    df["station_id"] == station_id
                ]

            else:

                df = df[
                    df["station_id"] == "KL-WYD-01"
                ]

            return df.tail(
                limit
            ).to_dict(
                orient="records"
            )

        return []


data_service = DataService()