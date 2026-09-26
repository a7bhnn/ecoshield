import {
  DashboardSummary,
  DistrictRisk,
  Alert,
  HistoricalEvent,
  MLInsights,
  SimulationResult
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchHealth(): Promise<{ status: string; model_loaded: boolean }> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE_URL}/api/dashboard`);
  if (!res.ok) throw new Error(`Failed to fetch dashboard: ${res.statusText}`);
  return res.json();
}

export async function fetchAllRisks(): Promise<{ timestamp: string; total_districts: number; district_risks: DistrictRisk[] }> {
  const res = await fetch(`${API_BASE_URL}/api/risks`);
  if (!res.ok) throw new Error(`Failed to fetch risks: ${res.statusText}`);
  return res.json();
}

export async function fetchAlerts(): Promise<{ timestamp: string; count: number; alerts: Alert[] }> {
  const res = await fetch(`${API_BASE_URL}/api/alerts`);
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.statusText}`);
  return res.json();
}

export async function fetchHistoricalEvents(): Promise<{ count: number; data_notice: string; events: HistoricalEvent[] }> {
  const res = await fetch(`${API_BASE_URL}/api/historical-events`);
  if (!res.ok) throw new Error(`Failed to fetch historical events: ${res.statusText}`);
  return res.json();
}

export async function fetchEnvironment(stationId?: string): Promise<{
  data_source: string;
  stations: any[];
  timeseries: any[];
}> {
  const url = stationId 
    ? `${API_BASE_URL}/api/environment?station_id=${encodeURIComponent(stationId)}`
    : `${API_BASE_URL}/api/environment`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch environmental data: ${res.statusText}`);
  return res.json();
}

export async function fetchMLInsights(): Promise<MLInsights> {
  const res = await fetch(`${API_BASE_URL}/api/ml-insights`);
  if (!res.ok) throw new Error(`Failed to fetch ML insights: ${res.statusText}`);
  return res.json();
}

export async function predictFlood(params: {
  rain_current: number;
  rain_3h: number;
  rain_6h: number;
  rain_12h: number;
  rain_24h: number;
}): Promise<{
  risk_level: string;
  risk_score: number;
  confidence: number;
  reasons: string[];
}> {
  const res = await fetch(`${API_BASE_URL}/api/predict/flood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`Flood prediction request failed: ${res.statusText}`);
  return res.json();
}

export async function simulateScenario(params: {
  district?: string;
  rain_24h: number;
  rain_6h?: number;
  rain_current?: number;
  temperature_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  soil_moisture_pct?: number;
  slope_degrees?: number;
}): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE_URL}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`Simulation request failed: ${res.statusText}`);
  return res.json();
}
