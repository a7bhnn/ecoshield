export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RiskTrend = 'INCREASING' | 'STABLE' | 'DECREASING';
export type HazardType = 'Flood' | 'Landslide' | 'Wildfire';

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface RiskItem {
  hazard: HazardType;
  score: number;
  level: RiskLevel;
  trend: RiskTrend;
  confidence?: number;
  factors: string[];
  location?: string;
  timestamp: string;
}

export interface TopRisks {
  flood: RiskItem;
  landslide: RiskItem;
  wildfire: RiskItem;
}

export interface DashboardSummary {
  system_status: string;
  last_updated: string;
  data_source_status: string;
  mode: string;
  top_risks: TopRisks;
  alert_metrics: {
    total_active: number;
    critical: number;
    high: number;
    moderate: number;
  };
  environmental_summary: {
    avg_temperature_c: number;
    max_24h_rainfall_mm: number;
    state_soil_saturation_avg: number;
    monitored_stations: number;
  };
}

export interface StationReading {
  precipitation_current_mm: number;
  precipitation_3h_mm: number;
  precipitation_6h_mm: number;
  precipitation_12h_mm: number;
  precipitation_24h_mm: number;
  temperature_c: number;
  humidity_pct: number;
  soil_moisture_pct: number;
  wind_speed_kmh: number;
  river_level_m?: number;
  river_danger_level_m?: number;
}

export interface Station {
  station_id: string;
  name: string;
  district: string;
  coordinates: Coordinates;
  terrain: string;
  elevation_m: number;
  status: string;
  sensor_health: number;
  readings: StationReading;
}

export interface DistrictRisk {
  district: string;
  station_id: string;
  station_name: string;
  coordinates: Coordinates;
  terrain: string;
  composite_score: number;
  composite_level: RiskLevel;
  hazards: {
    flood: RiskItem;
    landslide: RiskItem;
    wildfire: RiskItem;
  };
  readings: StationReading;
}

export interface Alert {
  id: string;
  hazard: HazardType;
  location: string;
  station_name: string;
  coordinates: Coordinates;
  severity: RiskLevel;
  score: number;
  trend: RiskTrend;
  timestamp: string;
  status: string;
  data_class: string;
  reason: string;
  all_factors: string[];
  recommended_action: string;
}

export interface HistoricalEvent {
  id: string;
  event_name: string;
  hazard: HazardType;
  location: string;
  district: string;
  coordinates: Coordinates;
  date: string;
  severity: RiskLevel;
  data_class: string;
  environmental_conditions: Record<string, any>;
  impact_summary: string;
  key_takeaways: string;
  source: string;
}

export interface MLFeature {
  name: string;
  description: string;
  importance: number;
}

export interface MLInsights {
  model_name: string;
  version: string;
  training_dataset: string;
  model_status: string;
  algorithm: string;
  features: MLFeature[];
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  };
  proxy_label_methodology: {
    description: string;
    formula: string;
    rationale: string;
  };
  disclaimer: string;
  ethical_notes: string[];
}

export interface CascadeNode {
  id: string;
  label: string;
  value: string;
  status: string;
  description: string;
}

export interface SimulationResult {
  district: string;
  inputs: {
    rain_24h: number;
    rain_6h: number;
    rain_current: number;
    temperature_c: number;
    humidity_pct: number;
    wind_speed_kmh: number;
    soil_moisture_pct: number;
    slope_degrees: number;
  };
  cascade: {
    timestamp: string;
    nodes: CascadeNode[];
    compound_insights: string[];
    primary_hazards: {
      flood: RiskItem;
      landslide: RiskItem;
      wildfire: RiskItem;
    };
  };
}
