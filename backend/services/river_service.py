import io
import time
from datetime import datetime

import pandas as pd
import requests


CURRENT_URL = (
    "https://nwdp.nwic.gov.in/dataset/"
    "1a00209e-c864-4c1c-bc82-b5e2d8ecb66e/"
    "resource/d831cb57-13ad-4288-b6bf-0989fea91a44/"
    "download/rwl_tel_hr_kerala_sw_999_2026_2030.csv"
)

HISTORICAL_URL = (
    "https://nwdp.nwic.gov.in/dataset/"
    "1a00209e-c864-4c1c-bc82-b5e2d8ecb66e/"
    "resource/0af0acba-517c-4278-bf77-ff137eb3c2cf/"
    "download/rwl_tel_hr_kerala_sw_999_2021_2025.csv"
)

CACHE_SECONDS = 900


class RiverTelemetryService:

    def __init__(self):
        self._data = None
        self._source_type = None
        self._last_successful_fetch = None
        self._last_error = None
        self._last_attempt = 0

    def _download(self, url):
        response = requests.get(
            url,
            timeout=30,
            headers={
                "User-Agent": "DisasterShield/1.0"
            }
        )

        response.raise_for_status()

        if not response.content:
            return pd.DataFrame()

        return pd.read_csv(io.BytesIO(response.content))

    def _refresh(self):

        now = time.time()

        if (
            self._data is not None
            and now - self._last_attempt < CACHE_SECONDS
        ):
            return

        self._last_attempt = now
        self._last_error = None

        # -----------------------------------------
        # 1. Try current 2026-2030 telemetry
        # -----------------------------------------

        try:
            df = self._download(CURRENT_URL)

            if not df.empty:
                self._data = df
                self._source_type = "LIVE"
                self._last_successful_fetch = datetime.now().isoformat()

                print(
                    f"[RIVER] Live telemetry loaded: {len(df)} records"
                )

                return

            print("[RIVER] 2026-2030 dataset is empty")

        except Exception as e:
            print(f"[RIVER] Live dataset failed: {e}")
            self._last_error = str(e)

        # -----------------------------------------
        # 2. Fallback to 2021-2025 telemetry
        # -----------------------------------------

        try:
            df = self._download(HISTORICAL_URL)

            if not df.empty:
                self._data = df
                self._source_type = "HISTORICAL"
                self._last_successful_fetch = datetime.now().isoformat()

                print(
                    f"[RIVER] Historical telemetry loaded: {len(df)} records"
                )

                return

            self._data = pd.DataFrame()
            self._source_type = None
            self._last_error = "Both current and historical datasets are empty"

        except Exception as e:
            self._data = pd.DataFrame()
            self._source_type = None
            self._last_error = str(e)

    def _find_column(self, possible_names):

        if self._data is None:
            return None

        for column in self._data.columns:

            normalized = str(column).strip().lower()

            for name in possible_names:

                if name in normalized:
                    return column

        return None

    def _clean_record(self, row):

        result = {}

        for key, value in row.items():

            if pd.isna(value):
                continue

            if hasattr(value, "item"):
                value = value.item()

            result[str(key)] = value

        return result

    def get_latest_records(self, limit=50):

        self._refresh()

        if self._data is None or self._data.empty:
            return []

        df = self._data.copy()

        date_column = self._find_column([
            "data acquisition time",
            "date",
            "time"
        ])

        if date_column:

            try:
                df["_parsed_time"] = pd.to_datetime(
                    df[date_column],
                    errors="coerce"
                )

                df = df.sort_values(
                    "_parsed_time",
                    ascending=False
                )

            except Exception:
                pass

        return [
            self._clean_record(row)
            for _, row in df.head(limit).iterrows()
        ]

    def get_latest_by_station(self):

        self._refresh()

        if self._data is None or self._data.empty:
            return []

        df = self._data.copy()

        station_column = self._find_column([
            "station"
        ])

        date_column = self._find_column([
            "data acquisition time",
            "date",
            "time"
        ])

        if not station_column:
            return self.get_latest_records(50)

        if date_column:

            try:
                df["_parsed_time"] = pd.to_datetime(
                    df[date_column],
                    errors="coerce"
                )

                df = df.sort_values(
                    "_parsed_time",
                    ascending=False
                )

            except Exception:
                pass

        # Keep latest reading for each station
        df = df.drop_duplicates(
            subset=[station_column],
            keep="first"
        )

        return [
            self._clean_record(row)
            for _, row in df.iterrows()
        ]

    def get_latest_for_station(self, station_name):

        self._refresh()

        if self._data is None or self._data.empty:
            return None

        station_column = self._find_column([
            "station"
        ])

        if not station_column:
            return None

        matches = self._data[
            self._data[station_column]
            .astype(str)
            .str.contains(
                station_name,
                case=False,
                na=False
            )
        ]

        if matches.empty:
            return None

        date_column = self._find_column([
            "data acquisition time",
            "date",
            "time"
        ])

        if date_column:

            try:
                matches = matches.copy()

                matches["_parsed_time"] = pd.to_datetime(
                    matches[date_column],
                    errors="coerce"
                )

                matches = matches.sort_values(
                    "_parsed_time",
                    ascending=False
                )

            except Exception:
                pass

        return self._clean_record(
            matches.iloc[0]
        )

    def get_status(self):

        self._refresh()

        records = 0

        if self._data is not None:
            records = len(self._data)

        if self._source_type == "LIVE":

            status = "LIVE"

        elif self._source_type == "HISTORICAL":

            status = "HISTORICAL_FALLBACK"

        else:

            status = "UNAVAILABLE"

        return {
            "source": "Kerala Surface Water Department",
            "dataset": "River Water Level Telemetry - Hourly",
            "portal": "National Water Data Portal",
            "status": status,
            "records": records,
            "last_successful_fetch": self._last_successful_fetch,
            "last_error": self._last_error,
            "timestamp": datetime.now().isoformat()
        }
    def get_risk_signals(self, limit=50):

        self._refresh()

        if self._data is None or self._data.empty:
            return []

        df = self._data.copy()

        station_column = self._find_column([
            "station"
        ])

        level_column = self._find_column([
            "river water level telemetry hourly"
        ])

        date_column = self._find_column([
            "data acquisition time"
        ])

        if not station_column or not level_column:
            return []

        # Convert water level to numeric
        df["_level"] = pd.to_numeric(
            df[level_column],
            errors="coerce"
        )

        df = df.dropna(
            subset=[station_column, "_level"]
        )

        results = []

        # Calculate historical statistics for every station
        grouped = df.groupby(station_column)

        for station, group in grouped:

            # Need enough historical observations
            if len(group) < 20:
                continue

            levels = group["_level"]

            mean_level = float(levels.mean())
            std_level = float(levels.std())

            if std_level == 0 or pd.isna(std_level):
                continue

            # Get the latest available reading in the dataset
            station_rows = group.copy()

            if date_column:

                station_rows["_parsed_time"] = pd.to_datetime(
                    station_rows[date_column],
                    errors="coerce"
                )

                station_rows = station_rows.sort_values(
                    "_parsed_time",
                    ascending=False
                )

            latest = station_rows.iloc[0]

            current_level = float(
                latest["_level"]
            )

            anomaly = (
                current_level - mean_level
            ) / std_level

            # Prototype anomaly classification.
            # These are NOT official flood-warning thresholds.
            if anomaly >= 3:
                signal = "SEVERE_ANOMALY"
            elif anomaly >= 2:
                signal = "HIGH_ANOMALY"
            elif anomaly >= 1:
                signal = "ELEVATED"
            else:
                signal = "NORMAL"

            item = {
                "station": str(station),
                "water_level_m": round(
                    current_level,
                    3
                ),
                "historical_mean_m": round(
                    mean_level,
                    3
                ),
                "historical_std_m": round(
                    std_level,
                    3
                ),
                "anomaly_zscore": round(
                    float(anomaly),
                    2
                ),
                "signal": signal,
                "historical_records": int(
                    len(group)
                ),
                "data_status": self._source_type
            }

            if date_column:
                item["data_time"] = str(
                    latest[date_column]
                )

            results.append(item)

        # Highest anomalies first
        results.sort(
            key=lambda x: x["anomaly_zscore"],
            reverse=True
        )

        return results[:limit]

river_service = RiverTelemetryService()