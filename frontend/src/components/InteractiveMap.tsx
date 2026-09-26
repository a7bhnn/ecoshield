import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Waves, Mountain, Flame, Eye, Layers, History, Radio } from 'lucide-react';
import { DistrictRisk, Station, HistoricalEvent } from '../types';

interface InteractiveMapProps {
  districtRisks: DistrictRisk[];
  historicalEvents?: HistoricalEvent[];
  selectedDistrict?: string | null;
  onSelectDistrict?: (district: string) => void;
}

// Fix Leaflet marker icon asset resolution in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Leaflet DivIcon helpers
const createHazardIcon = (type: 'Flood' | 'Landslide' | 'Wildfire' | 'History', level: string = 'HIGH') => {
  let bgColor = '#06b6d4'; // cyan
  let symbol = '💧';
  
  if (type === 'Landslide') {
    bgColor = '#f59e0b'; // amber
    symbol = '⛰️';
  } else if (type === 'Wildfire') {
    bgColor = '#ef4444'; // red
    symbol = '🔥';
  } else if (type === 'History') {
    bgColor = '#a855f7'; // purple
    symbol = '📜';
  }

  const pulseClass = level === 'CRITICAL' ? 'animate-ping' : '';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${bgColor}; opacity: 0.25;" class="${pulseClass}"></div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #0f172a; border: 2px solid ${bgColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${bgColor}80; font-size: 13px;">
          ${symbol}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  districtRisks,
  historicalEvents = [],
  selectedDistrict: _selectedDistrict,
  onSelectDistrict
}) => {
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'FLOOD' | 'LANDSLIDE' | 'WILDFIRE' | 'HISTORY'>('ALL');

  // Filter markers according to activeLayer
  const filteredDistricts = districtRisks.filter((d) => {
    if (activeLayer === 'ALL') return true;
    if (activeLayer === 'FLOOD') return d.hazards.flood.level !== 'LOW' || d.terrain.includes('Lowland') || d.terrain.includes('Riverine');
    if (activeLayer === 'LANDSLIDE') return d.hazards.landslide.level !== 'LOW' || d.terrain.includes('Ghats') || d.terrain.includes('Hills');
    if (activeLayer === 'WILDFIRE') return d.hazards.wildfire.level !== 'LOW' || d.district === 'Palakkad';
    return false;
  });

  const showHistory = activeLayer === 'ALL' || activeLayer === 'HISTORY';

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
      {/* Map Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              Kerala Multi-Hazard Geospatial Observatory
              <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                14 Telemetry Stations
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time spatial distribution of environmental risks and historic inundation zones
            </p>
          </div>
        </div>

        {/* Layer Toggle Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveLayer('ALL')}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeLayer === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            All Stations
          </button>
          <button
            onClick={() => setActiveLayer('FLOOD')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              activeLayer === 'FLOOD'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Waves className="h-3 w-3" /> Flood Zones
          </button>
          <button
            onClick={() => setActiveLayer('LANDSLIDE')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              activeLayer === 'LANDSLIDE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Mountain className="h-3 w-3" /> Landslide Slopes
          </button>
          <button
            onClick={() => setActiveLayer('WILDFIRE')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              activeLayer === 'WILDFIRE'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Flame className="h-3 w-3" /> Fire Prone
          </button>
          <button
            onClick={() => setActiveLayer('HISTORY')}
            className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              activeLayer === 'HISTORY'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <History className="h-3 w-3" /> Historical Events
          </button>
        </div>
      </div>

      {/* Map Container with explicit min-height */}
      <div className="w-full rounded-xl overflow-hidden border border-slate-800 relative z-0" style={{ height: '520px', minHeight: '520px' }}>
        <MapContainer
          center={[10.5, 76.2]}
          zoom={7.6}
          scrollWheelZoom={true}
          style={{ height: '520px', minHeight: '520px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* District Telemetry Station Markers */}
          {activeLayer !== 'HISTORY' &&
            filteredDistricts.map((d) => {
              // Determine dominant hazard type for marker
              let dominant: 'Flood' | 'Landslide' | 'Wildfire' = 'Flood';
              if (d.hazards.landslide.score > d.hazards.flood.score && d.hazards.landslide.score > d.hazards.wildfire.score) {
                dominant = 'Landslide';
              } else if (d.hazards.wildfire.score > d.hazards.flood.score) {
                dominant = 'Wildfire';
              }

              const icon = createHazardIcon(dominant, d.composite_level);

              return (
                <Marker
                  key={d.station_id}
                  position={[d.coordinates.lat, d.coordinates.lon]}
                  icon={icon}
                  eventHandlers={{
                    click: () => onSelectDistrict && onSelectDistrict(d.district)
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-2 min-w-[220px]">
                      <div className="border-b border-slate-700 pb-1.5">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-cyan-300">{d.district} District</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {d.composite_level}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{d.station_name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Terrain: {d.terrain}</p>
                      </div>

                      {/* Readings Snapshot */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="bg-slate-900/80 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">24h Rainfall</span>
                          <span className="font-mono font-bold text-cyan-300">
                            {d.readings.precipitation_24h_mm} mm
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">Soil Moisture</span>
                          <span className="font-mono font-bold text-amber-300">
                            {d.readings.soil_moisture_pct}%
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">Temperature</span>
                          <span className="font-mono font-bold text-rose-300">
                            {d.readings.temperature_c}°C
                          </span>
                        </div>
                        <div className="bg-slate-900/80 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">Wind Velocity</span>
                          <span className="font-mono font-bold text-indigo-300">
                            {d.readings.wind_speed_kmh} km/h
                          </span>
                        </div>
                      </div>

                      {/* Hazard Breakdown */}
                      <div className="border-t border-slate-800 pt-1.5 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-300">
                          <span>Flood Risk:</span>
                          <span className="font-bold text-cyan-400">
                            {d.hazards.flood.level} ({Math.round(d.hazards.flood.score * 100)}%)
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Landslide Risk:</span>
                          <span className="font-bold text-amber-400">
                            {d.hazards.landslide.level} ({Math.round(d.hazards.landslide.score * 100)}%)
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Wildfire Risk:</span>
                          <span className="font-bold text-rose-400">
                            {d.hazards.wildfire.level} ({Math.round(d.hazards.wildfire.score * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {/* Historical Disaster Pins */}
          {showHistory &&
            historicalEvents.map((evt) => {
              const histIcon = createHazardIcon('History', evt.severity);
              return (
                <Marker
                  key={evt.id}
                  position={[evt.coordinates.lat, evt.coordinates.lon]}
                  icon={histIcon}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 min-w-[240px]">
                      <div className="border-b border-slate-700 pb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                          HISTORICAL BENCHMARK
                        </span>
                        <h4 className="font-bold text-sm text-purple-200 mt-1">{evt.event_name}</h4>
                        <p className="text-[10px] text-slate-400">{evt.date} • {evt.location}</p>
                      </div>

                      <p className="text-xs text-slate-300">{evt.impact_summary}</p>

                      <div className="bg-slate-900/80 p-2 rounded text-[11px] text-slate-300 border border-slate-800">
                        <span className="font-semibold text-purple-300">Key Lesson: </span>
                        {evt.key_takeaways}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/85 backdrop-blur-md p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 shadow-xl">
          <div className="font-bold text-slate-200 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" /> Hazard Legend
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-sm"></span>
            <span>Flood Telemetry Station</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm"></span>
            <span>Landslide Hill Observatory</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm"></span>
            <span>Wildfire Prone Corridor</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shadow-sm"></span>
            <span>Historical Ground Benchmark</span>
          </div>
        </div>
      </div>
    </div>
  );
};
