import React, { useState } from 'react';
import { AlertTriangle, Bell, Waves, Mountain, Flame, Clock, MapPin, CheckCircle, ShieldAlert, ChevronRight } from 'lucide-react';
import { Alert, RiskLevel } from '../types';

interface ActiveAlertsListProps {
  alerts: Alert[];
  onSelectAlert?: (alert: Alert) => void;
}

export const ActiveAlertsList: React.FC<ActiveAlertsListProps> = ({ alerts, onSelectAlert }) => {
  const [filterHazard, setFilterHazard] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterHazard !== 'ALL' && a.hazard !== filterHazard) return false;
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityStyle = (severity: RiskLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          card: 'border-rose-500/60 bg-rose-950/20 hover:border-rose-500',
          badge: 'bg-rose-500 text-white font-bold',
          iconColor: 'text-rose-400',
          accent: 'border-l-4 border-l-rose-500'
        };
      case 'HIGH':
        return {
          card: 'border-orange-500/60 bg-orange-950/20 hover:border-orange-500',
          badge: 'bg-orange-500 text-white font-bold',
          iconColor: 'text-orange-400',
          accent: 'border-l-4 border-l-orange-500'
        };
      case 'MODERATE':
        return {
          card: 'border-amber-500/50 bg-amber-950/15 hover:border-amber-500',
          badge: 'bg-amber-500 text-slate-900 font-bold',
          iconColor: 'text-amber-400',
          accent: 'border-l-4 border-l-amber-500'
        };
      default:
        return {
          card: 'border-slate-800 bg-slate-900/40 hover:border-slate-700',
          badge: 'bg-slate-700 text-slate-200',
          iconColor: 'text-slate-400',
          accent: 'border-l-4 border-l-slate-600'
        };
    }
  };

  const getHazardIcon = (hazard: string) => {
    switch (hazard) {
      case 'Flood':
        return Waves;
      case 'Landslide':
        return Mountain;
      case 'Wildfire':
        return Flame;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              Active Warning & Advisory Feed
              <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {alerts.length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic threshold breach advisories based on station telemetry
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterHazard}
            onChange={(e) => setFilterHazard(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Hazards</option>
            <option value="Flood">Flood Only</option>
            <option value="Landslide">Landslide Only</option>
            <option value="Wildfire">Wildfire Only</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MODERATE">Moderate / Advisory</option>
          </select>
        </div>
      </div>

      {/* Alert Cards Container */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500/50" />
            No active alerts matching the selected filters.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            const Icon = getHazardIcon(alert.hazard);

            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert && onSelectAlert(alert)}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${style.card} ${style.accent} flex flex-col justify-between space-y-2`}
              >
                {/* Top: Hazard, Location, Severity badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${style.iconColor} shrink-0`} />
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {alert.severity} {alert.hazard.toUpperCase()} RISK
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {alert.id}
                        </span>
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 text-cyan-300 font-medium">
                          <MapPin className="h-3 w-3" /> {alert.location}
                        </span>
                        <span>•</span>
                        <span>{alert.station_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono uppercase ${style.badge}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">
                      Score: {Math.round(alert.score * 100)}%
                    </span>
                  </div>
                </div>

                {/* Middle: Reason */}
                <p className="text-xs text-slate-300 font-medium bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  <span className="text-slate-400">Trigger: </span>
                  {alert.reason}
                </p>

                {/* Bottom: Action Guidance & Provenance */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 pt-1 gap-2">
                  <div className="flex items-center space-x-1.5 text-emerald-300">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-[11px]">{alert.recommended_action}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>Live Telemetry</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
