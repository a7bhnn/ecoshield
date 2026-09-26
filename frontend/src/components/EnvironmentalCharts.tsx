import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  AreaChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BarChart3, CloudRain, Thermometer, Droplets, Compass } from 'lucide-react';
import { Station } from '../types';

interface EnvironmentalChartsProps {
  stations: Station[];
  timeseries: any[];
  onSelectStation?: (stationId: string) => void;
}

export const EnvironmentalCharts: React.FC<EnvironmentalChartsProps> = ({
  stations,
  timeseries,
  onSelectStation
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(
    stations.length > 0 ? stations[0].station_id : 'KL-WYD-01'
  );

  const handleStationChange = (id: string) => {
    setSelectedStationId(id);
    if (onSelectStation) {
      onSelectStation(id);
    }
  };

  const selectedStation = stations.find((s) => s.station_id === selectedStationId) || stations[0];

  // Format timeseries data for Recharts
  const chartData = timeseries.map((item, idx) => {
    const timeLabel = item.timestamp
      ? item.timestamp.split(' ')[1]?.slice(0, 5) || `T-${timeseries.length - idx}h`
      : `T-${timeseries.length - idx}h`;

    return {
      time: timeLabel,
      rain: item.precipitation_mm ?? 0,
      temp: item.temperature_c ?? 25,
      humidity: item.humidity_pct ?? 80,
      soil: item.soil_moisture_pct ?? 70,
      wind: item.wind_speed_kmh ?? 15
    };
  });

  // Fallback demo data if timeseries is loading
  const displayData =
    chartData.length > 0
      ? chartData
      : Array.from({ length: 24 }).map((_, i) => ({
          time: `${String(i).padStart(2, '0')}:00`,
          rain: i > 12 ? Math.round(Math.random() * 25 + 5) : Math.round(Math.random() * 8),
          temp: 24 + Math.sin(i / 4) * 4,
          humidity: 85 + Math.random() * 10,
          soil: 75 + i * 0.8,
          wind: 16 + Math.random() * 8
        }));

  return (
    <div className="space-y-6">
      {/* Station Selector Bar */}
      <div className="glass-card rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Station Telemetry Hyetographs</h3>
            <p className="text-xs text-slate-400">
              Live automated meteorological telemetry across 14 Kerala river basins
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Select Station:</span>
          <select
            value={selectedStationId}
            onChange={(e) => handleStationChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {stations.map((st) => (
              <option key={st.station_id} value={st.station_id}>
                {st.district}: {st.name} ({st.station_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Station Vitals Bar */}
      {selectedStation && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="glass-card rounded-lg p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">24h Rainfall</span>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {selectedStation.readings.precipitation_24h_mm} mm
            </span>
          </div>
          <div className="glass-card rounded-lg p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">6h Runoff Influx</span>
            <span className="text-lg font-bold font-mono text-cyan-300">
              {selectedStation.readings.precipitation_6h_mm} mm
            </span>
          </div>
          <div className="glass-card rounded-lg p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Soil Moisture</span>
            <span className="text-lg font-bold font-mono text-amber-400">
              {selectedStation.readings.soil_moisture_pct}%
            </span>
          </div>
          <div className="glass-card rounded-lg p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Temperature</span>
            <span className="text-lg font-bold font-mono text-rose-400">
              {selectedStation.readings.temperature_c}°C
            </span>
          </div>
          <div className="glass-card rounded-lg p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Relative Humidity</span>
            <span className="text-lg font-bold font-mono text-blue-400">
              {selectedStation.readings.humidity_pct}%
            </span>
          </div>
          <div className="glass-card rounded-lg p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">River Gauge</span>
            <span className="text-lg font-bold font-mono text-teal-400">
              {selectedStation.readings.river_level_m ?? 3.4} m / {selectedStation.readings.river_danger_level_m ?? 5.0} m
            </span>
          </div>
        </div>
      )}

      {/* Chart 1: Precipitation Hyetograph */}
      <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <CloudRain className="h-4 w-4" />
            <h4 className="font-bold text-sm text-slate-200">
              Hourly Rainfall Hyetograph & Runoff Intensity (mm)
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            36-Hour Window
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'mm/h', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="rain" name="Hourly Precipitation (mm)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Temperature & Humidity (Left) and Soil Moisture (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Temp & Humidity */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-amber-400">
              <Thermometer className="h-4 w-4" />
              <h4 className="font-bold text-sm text-slate-200">Temperature (°C) & Humidity (%)</h4>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="humidity" name="Relative Humidity (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Soil Moisture Saturation */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-emerald-400">
              <Droplets className="h-4 w-4" />
              <h4 className="font-bold text-sm text-slate-200">Soil Moisture & Pore Saturation (%)</h4>
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-semibold">
              Critical Threshold: 85%
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData}>
                <defs>
                  <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="soil" name="Soil Moisture (%)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#soilGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
