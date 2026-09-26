"""
Kerala Environmental Telemetry & Rainfall Dataset Generator
Generates realistic multi-station hourly observations across Kerala's 14 districts,
simulating typical monsoon precipitation patterns, extreme events, and corresponding
soil moisture, humidity, and temperature variations.
"""
import csv
import math
import random
from datetime import datetime, timedelta
from pathlib import Path

# Robust path handling
CURRENT_DIR = Path(__file__).resolve().parent
OUTPUT_CSV = CURRENT_DIR / "rainfall.csv"

# Kerala 14 Districts with typical geographic & climatic profiles
DISTRICTS = [
    {"district": "Wayanad", "station_id": "KL-WYD-01", "terrain": "Highland/Ghats", "lat": 11.6854, "lon": 76.1320, "base_slope": 35.0},
    {"district": "Idukki", "station_id": "KL-IDK-02", "terrain": "Highland/Ghats", "lat": 9.8500, "lon": 76.9700, "base_slope": 42.0},
    {"district": "Ernakulam", "station_id": "KL-EKM-03", "terrain": "Lowland/Coastal/Riverine", "lat": 9.9816, "lon": 76.2999, "base_slope": 5.0},
    {"district": "Pathanamthitta", "station_id": "KL-PTA-04", "terrain": "Midland/Riverine", "lat": 9.2648, "lon": 76.7870, "base_slope": 22.0},
    {"district": "Alappuzha", "station_id": "KL-ALP-05", "terrain": "Lowland/Backwaters", "lat": 9.4981, "lon": 76.3388, "base_slope": 2.0},
    {"district": "Malappuram", "station_id": "KL-MLP-06", "terrain": "Midland/Hills", "lat": 11.0510, "lon": 76.0711, "base_slope": 28.0},
    {"district": "Kozhikode", "station_id": "KL-KKD-07", "terrain": "Coastal/Hills", "lat": 11.2588, "lon": 75.7804, "base_slope": 18.0},
    {"district": "Thrissur", "station_id": "KL-TSR-08", "terrain": "Midland/Wetland", "lat": 10.5276, "lon": 76.2144, "base_slope": 8.0},
    {"district": "Palakkad", "station_id": "KL-PKD-09", "terrain": "Gap/Plains/Forest", "lat": 10.7867, "lon": 76.6548, "base_slope": 12.0},
    {"district": "Kottayam", "station_id": "KL-KTM-10", "terrain": "Midland/Basin", "lat": 9.5916, "lon": 76.5222, "base_slope": 14.0},
    {"district": "Kollam", "station_id": "KL-KLM-11", "terrain": "Coastal/Midland", "lat": 8.8932, "lon": 76.6141, "base_slope": 10.0},
    {"district": "Thiruvananthapuram", "station_id": "KL-TVM-12", "terrain": "Coastal/Urban", "lat": 8.5241, "lon": 76.9366, "base_slope": 9.0},
    {"district": "Kannur", "station_id": "KL-KNR-13", "terrain": "Coastal/Midland", "lat": 11.8745, "lon": 75.3704, "base_slope": 15.0},
    {"district": "Kasaragod", "station_id": "KL-KSD-14", "terrain": "Coastal/Laterite Hills", "lat": 12.4996, "lon": 74.9869, "base_slope": 16.0},
]

def generate_telemetry():
    random.seed(42)  # Deterministic for reproducibility
    start_date = datetime(2024, 7, 15, 0, 0, 0)
    total_hours = 24 * 14  # 14 days of hourly readings = 336 hours per station (4,704 total rows)
    
    rows = []
    
    for dist in DISTRICTS:
        is_mountain = dist["district"] in ["Wayanad", "Idukki", "Malappuram"]
        is_flood_prone = dist["district"] in ["Alappuzha", "Ernakulam", "Pathanamthitta", "Thrissur"]
        is_dry_prone = dist["district"] in ["Palakkad", "Kasaragod"]
        
        # State trackers for realistic sequential accumulation
        soil_moisture = 45.0 + random.uniform(5, 15)
        
        for h in range(total_hours):
            current_time = start_date + timedelta(hours=h)
            day_of_sim = h / 24.0
            
            # Weather wave: Simulate two distinct monsoon surge episodes
            # Surge 1 around day 4-6, Surge 2 (intense) around day 10-12
            surge1 = math.exp(-((day_of_sim - 5.0) ** 2) / 1.5)
            surge2 = math.exp(-((day_of_sim - 11.0) ** 2) / 1.8)
            diurnal = 0.5 + 0.5 * math.sin((h % 24) / 24.0 * 2 * math.pi - math.pi / 2)
            
            # Base probability of precipitation
            rain_chance = 0.35 + 0.45 * (surge1 + surge2)
            
            if random.random() < rain_chance:
                # Intensity depends on surge
                multiplier = 1.0 + 4.5 * surge1 + 7.5 * surge2
                if is_mountain:
                    multiplier *= 1.4  # Orographic enhancement in Western Ghats
                elif is_flood_prone:
                    multiplier *= 1.2
                
                # Base rain between 2mm and 20mm, multiplied by surge
                rain = round(random.uniform(1.5, 12.0) * multiplier, 1)
                # Occasional localized cloudburst spike in surge 2
                if surge2 > 0.6 and random.random() < 0.15:
                    rain = round(rain + random.uniform(25.0, 55.0), 1)
            else:
                rain = 0.0
            
            # Temperature inversely correlates with rain and has diurnal cycle
            temp_base = 28.0 - 5.0 * (1 if is_mountain else 0)
            if is_dry_prone and surge1 < 0.2 and surge2 < 0.2:
                temp_base += 4.0
            temperature = round(temp_base + 4.0 * diurnal - (rain * 0.15) + random.uniform(-0.8, 0.8), 1)
            temperature = max(18.0, min(42.0, temperature))
            
            # Humidity correlates positively with rain
            humidity = round(72.0 + (rain * 0.8) + (10.0 if is_mountain else 0.0) + random.uniform(-3, 3), 1)
            humidity = max(35.0, min(99.0, humidity))
            
            # Wind speed
            wind_speed = round(12.0 + (rain * 0.5) + (8.0 if surge2 > 0.4 else 0.0) + random.uniform(-2, 4), 1)
            wind_speed = max(3.0, wind_speed)
            
            # Soil moisture increases with rain, slowly dries out without rain
            if rain > 0:
                soil_moisture = min(98.0, soil_moisture + rain * 0.35)
            else:
                soil_moisture = max(25.0, soil_moisture - 0.25)
            
            rows.append({
                "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                "station_id": dist["station_id"],
                "district": dist["district"],
                "terrain_type": dist["terrain"],
                "latitude": dist["lat"],
                "longitude": dist["lon"],
                "precipitation_mm": rain,
                "temperature_c": temperature,
                "humidity_pct": humidity,
                "soil_moisture_pct": round(soil_moisture, 1),
                "wind_speed_kmh": wind_speed
            })
            
    # Write to CSV
    fieldnames = [
        "timestamp", "station_id", "district", "terrain_type",
        "latitude", "longitude", "precipitation_mm", "temperature_c",
        "humidity_pct", "soil_moisture_pct", "wind_speed_kmh"
    ]
    
    with open(OUTPUT_CSV, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Generated {len(rows)} records in {OUTPUT_CSV}")

if __name__ == "__main__":
    generate_telemetry()
