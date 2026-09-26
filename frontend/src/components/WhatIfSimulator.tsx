import React, { useState, useEffect, useCallback } from 'react';
import { Sliders, RefreshCw, AlertCircle, Waves, Mountain, Flame, Zap, CheckCircle2 } from 'lucide-react';
import { simulateScenario } from '../services/api';
import { SimulationResult } from '../types';
import { RiskCascadeVisualizer } from './RiskCascadeVisualizer';

export const WhatIfSimulator: React.FC = () => {
  const [district, setDistrict] = useState('Wayanad');
  const [rain24h, setRain24h] = useState(145);
  const [rain6h, setRain6h] = useState(70);
  const [temperature, setTemperature] = useState(25);
  const [humidity, setHumidity] = useState(90);
  const [windSpeed, setWindSpeed] = useState(22);
  const [slope, setSlope] = useState(36);
  
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await simulateScenario({
        district,
        rain_24h: rain24h,
        rain_6h: rain6h,
        temperature_c: temperature,
        humidity_pct: humidity,
        wind_speed_kmh: windSpeed,
        slope_degrees: slope
      });
      setResult(res);
    } catch (err: any) {
      console.error('Simulation error:', err);
      setError(err.message || 'Failed to simulate scenario');
    } finally {
      setLoading(false);
    }
  }, [district, rain24h, rain6h, temperature, humidity, windSpeed, slope]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 250);
    return () => clearTimeout(timer);
  }, [runSimulation]);

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'cloudburst':
        setDistrict('Wayanad');
        setRain24h(240);
        setRain6h(110);
        setTemperature(22);
        setHumidity(98);
        setWindSpeed(30);
        setSlope(40);
        break;
      case 'flood':
        setDistrict('Ernakulam');
        setRain24h(210);
        setRain6h(95);
        setTemperature(26);
        setHumidity(96);
        setWindSpeed(25);
        setSlope(5);
        break;
      case 'wildfire':
        setDistrict('Palakkad');
        setRain24h(0);
        setRain6h(0);
        setTemperature(39);
        setHumidity(22);
        setWindSpeed(42);
        setSlope(15);
        break;
      case 'normal':
      default:
        setDistrict('Thiruvananthapuram');
        setRain24h(15);
        setRain6h(5);
        setTemperature(28);
        setHumidity(70);
        setWindSpeed(14);
        setSlope(10);
        break;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
      case 'MODERATE':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      default:
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    }
  };

  const hazards = result?.cascade?.primary_hazards;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Interactive Environmental What-If Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Perturb atmospheric and geographic variables to observe live multi-hazard re-evaluations and systemic cascade dynamics.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-400 self-center mr-1 font-medium">Quick Scenarios:</span>
          <button
            onClick={() => applyPreset('cloudburst')}
            className="px-2.5 py-1 rounded bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-medium transition-colors cursor-pointer"
          >
            Extreme Monsoon (Wayanad)
          </button>
          <button
            onClick={() => applyPreset('flood')}
            className="px-2.5 py-1 rounded bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-medium transition-colors cursor-pointer"
          >
            Riverine Flood (Ernakulam)
          </button>
          <button
            onClick={() => applyPreset('wildfire')}
            className="px-2.5 py-1 rounded bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-medium transition-colors cursor-pointer"
          >
            Dry Heat & Gale (Palakkad)
          </button>
          <button
            onClick={() => applyPreset('normal')}
            className="px-2.5 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-medium transition-colors cursor-pointer"
          >
            Normal Conditions
          </button>
        </div>
      </div>

      {/* Main Simulation Workspace: Sliders on left, Live Output on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 glass-card rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" /> Parameter Controls
            </h3>
            {loading && <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />}
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Simulated District Profile
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Wayanad">Wayanad (Ghats Highlands - Landslide Sensitive)</option>
              <option value="Idukki">Idukki (Ghats Catchment - Flash Flood/Landslide)</option>
              <option value="Ernakulam">Ernakulam (Periyar Riverine - Urban Flood Sensitive)</option>
              <option value="Alappuzha">Alappuzha (Kuttanad Backwaters - Inundation Sensitive)</option>
              <option value="Palakkad">Palakkad (Inland Gap - Aridity/Wildfire Sensitive)</option>
              <option value="Pathanamthitta">Pathanamthitta (Pamba River Basin)</option>
              <option value="Malappuram">Malappuram (Midland Hills)</option>
              <option value="Thrissur">Thrissur (Chalakudy River Basin)</option>
            </select>
          </div>

          {/* Slider 1: 24h Rainfall */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">24-Hour Rainfall</span>
              <span className="font-mono font-bold text-cyan-400">{rain24h} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="5"
              value={rain24h}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRain24h(val);
                if (rain6h > val) setRain6h(Math.round(val * 0.5));
              }}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0mm (Dry)</span>
              <span>120mm (Heavy)</span>
              <span>200mm+ (Extreme)</span>
            </div>
          </div>

          {/* Slider 2: 6h Rainfall */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">6-Hour Rainfall Intensity</span>
              <span className="font-mono font-bold text-cyan-400">{rain6h} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="2"
              value={rain6h}
              onChange={(e) => setRain6h(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0mm</span>
              <span>60mm (Flash Risk)</span>
              <span>100mm+</span>
            </div>
          </div>

          {/* Slider 3: Temperature */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">Ambient Temperature</span>
              <span className="font-mono font-bold text-amber-400">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Slider 4: Humidity */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">Relative Humidity</span>
              <span className="font-mono font-bold text-blue-400">{humidity}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer"
            />
          </div>

          {/* Slider 5: Wind Speed */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">Wind Velocity</span>
              <span className="font-mono font-bold text-indigo-400">{windSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="2"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
          </div>

          {/* Slider 6: Terrain Slope */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">Terrain Slope Gradient</span>
              <span className="font-mono font-bold text-orange-400">{slope}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="1"
              value={slope}
              onChange={(e) => setSlope(Number(e.target.value))}
              className="w-full accent-orange-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Live Simulation Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Hazard Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Flood Outcome */}
            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                <Waves className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Flood Risk
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {Math.round((hazards?.flood?.score || 0) * 100)}%
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono border ${getLevelColor(
                    hazards?.flood?.level || 'LOW'
                  )}`}
                >
                  {hazards?.flood?.level || 'LOW'}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                {hazards?.flood?.factors?.[0] || 'In normal range'}
              </p>
            </div>

            {/* Landslide Outcome */}
            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <div className="flex items-center space-x-2 text-amber-400 mb-2">
                <Mountain className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Landslide Risk
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {Math.round((hazards?.landslide?.score || 0) * 100)}%
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono border ${getLevelColor(
                    hazards?.landslide?.level || 'LOW'
                  )}`}
                >
                  {hazards?.landslide?.level || 'LOW'}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                {hazards?.landslide?.factors?.[0] || 'In normal range'}
              </p>
            </div>

            {/* Wildfire Outcome */}
            <div className="glass-card rounded-xl p-4 border border-slate-800">
              <div className="flex items-center space-x-2 text-rose-400 mb-2">
                <Flame className="h-5 w-5" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Wildfire Risk
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {Math.round((hazards?.wildfire?.score || 0) * 100)}%
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono border ${getLevelColor(
                    hazards?.wildfire?.level || 'LOW'
                  )}`}
                >
                  {hazards?.wildfire?.level || 'LOW'}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                {hazards?.wildfire?.factors?.[0] || 'In normal range'}
              </p>
            </div>
          </div>

          {/* Interactive Cascade for Simulated State */}
          <RiskCascadeVisualizer
            nodes={result?.cascade?.nodes}
            compoundInsights={result?.cascade?.compound_insights}
          />
        </div>
      </div>
    </div>
  );
};
