import React from 'react';
import { History, Waves, Mountain, Flame, AlertCircle, Calendar, MapPin, Database, Award } from 'lucide-react';
import { HistoricalEvent } from '../types';

interface HistoricalEventsViewProps {
  events: HistoricalEvent[];
}

export const HistoricalEventsView: React.FC<HistoricalEventsViewProps> = ({ events }) => {
  const getHazardBadge = (hazard: string) => {
    switch (hazard) {
      case 'Flood':
        return {
          icon: Waves,
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          border: 'border-l-4 border-l-cyan-500'
        };
      case 'Landslide':
        return {
          icon: Mountain,
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          border: 'border-l-4 border-l-amber-500'
        };
      case 'Wildfire':
        return {
          icon: Flame,
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          border: 'border-l-4 border-l-rose-500'
        };
      default:
        return {
          icon: AlertCircle,
          badge: 'bg-slate-700 text-slate-300',
          border: 'border-l-4 border-l-slate-600'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Kerala Historical Disaster Benchmarks
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  GROUND TRUTH ARCHIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calibrated reference events used for validating hydrometeorological risk thresholds
              </p>
            </div>
          </div>
        </div>

        {/* Data Provenance Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs font-mono">
          <Database className="h-4 w-4" />
          <span>HISTORICAL / DEMONSTRATION DATA</span>
        </div>
      </div>

      {/* Grid of Historical Case Studies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {events.map((evt) => {
          const style = getHazardBadge(evt.hazard);
          const Icon = style.icon;

          return (
            <div
              key={evt.id}
              className={`glass-card rounded-xl p-5 border border-slate-800 ${style.border} flex flex-col justify-between space-y-4 shadow-lg`}
            >
              <div>
                {/* Header: Hazard, Severity, Date */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${style.badge}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {evt.hazard}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {evt.id}
                    </span>
                  </div>

                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {evt.severity}
                  </span>
                </div>

                {/* Title and Location */}
                <h3 className="font-bold text-base text-white mt-3">{evt.event_name}</h3>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400" /> {evt.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {evt.location}
                  </span>
                </div>

                {/* Impact Summary */}
                <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {evt.impact_summary}
                </p>

                {/* Environmental Telemetry Metrics */}
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block mb-1.5">
                    Recorded Hydro-Meteorological Metrics:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(evt.environmental_conditions).map(([key, val]) => (
                      <div key={key} className="bg-slate-950 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-400 block text-[10px] capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-cyan-300 font-bold">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Takeaway Box & Source */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200">
                  <span className="font-bold text-cyan-300">Systemic Takeaway: </span>
                  {evt.key_takeaways}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Source: {evt.source}</span>
                  <span className="text-purple-400 font-semibold">{evt.data_class}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
