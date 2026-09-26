import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Activity,
  Database,
  Radio,
  Waves,
} from 'lucide-react';

interface RiskItem {
  score?: number;
  level?: string;
  trend?: string;
  location?: string;
  factors?: string[];
}

interface TopRisks {
  flood?: RiskItem;
  landslide?: RiskItem;
  wildfire?: RiskItem;
}

interface RiverSignal {
  station: string;
  water_level_m: number;
  historical_mean_m: number;
  historical_std_m: number;
  anomaly_zscore: number;
  signal: string;
  historical_records: number;
  data_status: string;
  data_time: string;
}

interface RiverRiskResponse {
  timestamp: string;
  source: string;
  portal: string;
  data_status: string;
  signals: RiverSignal[];
}

interface RiskOverviewCardsProps {
  risks: TopRisks | null;
  onSelectHazard?: (hazard: 'flood' | 'landslide' | 'wildfire') => void;
}

const riskConfig = {
  flood: {
    title: 'Flood Risk',
    icon: Waves,
    accent: 'cyan',
  },
  landslide: {
    title: 'Landslide Risk',
    icon: Activity,
    accent: 'amber',
  },
  wildfire: {
    title: 'Wildfire Risk',
    icon: Radio,
    accent: 'red',
  },
};

function getRiskClass(level?: string) {
  switch ((level || '').toUpperCase()) {
    case 'CRITICAL':
      return 'ds-risk-critical';

    case 'HIGH':
      return 'ds-risk-high';

    case 'MODERATE':
      return 'ds-risk-moderate';

    default:
      return 'ds-risk-low';
  }
}

function getSignalClass(signal?: string) {
  switch ((signal || '').toUpperCase()) {
    case 'SEVERE_ANOMALY':
      return 'ds-risk-critical';

    case 'HIGH_ANOMALY':
      return 'ds-risk-high';

    case 'ELEVATED':
      return 'ds-risk-moderate';

    default:
      return 'ds-risk-low';
  }
}

export const RiskOverviewCards: React.FC<RiskOverviewCardsProps> = ({
  risks,
  onSelectHazard,
}) => {
  const [riverData, setRiverData] = useState<RiverRiskResponse | null>(null);
  const [riverLoading, setRiverLoading] = useState(true);
  const [riverError, setRiverError] = useState(false);

  const loadRiverRisk = async () => {
    try {
      setRiverLoading(true);
      setRiverError(false);

      const response = await fetch(
        'https://ecoshield-backend-gcuw.onrender.com/api/river-risk',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(`River API returned ${response.status}`);
      }

      const data: RiverRiskResponse = await response.json();

      console.log('River Intelligence:', data);

      setRiverData(data);
    } catch (error) {
      console.error('River Intelligence failed:', error);
      setRiverError(true);
      setRiverData(null);
    } finally {
      setRiverLoading(false);
    }
  };

  useEffect(() => {
    loadRiverRisk();

    const interval = window.setInterval(() => {
      loadRiverRisk();
    }, 300000);

    return () => window.clearInterval(interval);
  }, []);

  const signals = riverData?.signals || [];

  const elevatedSignals = signals.filter(
    (item) =>
      item.signal === 'ELEVATED' ||
      item.signal === 'HIGH_ANOMALY' ||
      item.signal === 'SEVERE_ANOMALY'
  );

  const highestSignal =
    signals.length > 0
      ? [...signals].sort(
          (a, b) => b.anomaly_zscore - a.anomaly_zscore
        )[0]
      : null;

  const dataStatus = riverData?.data_status || 'UNAVAILABLE';

  const statusLabel =
    dataStatus === 'LIVE'
      ? 'LIVE TELEMETRY'
      : dataStatus === 'HISTORICAL_FALLBACK'
        ? 'HISTORICAL BASELINE'
        : 'UNAVAILABLE';

  return (
    <div className="space-y-6">

      {/* =====================================================
          TOP RISK CARDS
          ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {(['flood', 'landslide', 'wildfire'] as const).map((hazard) => {
          const risk = risks?.[hazard];
          const config = riskConfig[hazard];
          const Icon = config.icon;

          const score = Number(risk?.score || 0);
          const level = risk?.level || 'LOW';

          return (
            <button
              key={hazard}
              type="button"
              onClick={() => onSelectHazard?.(hazard)}
              className="glass-card glass-card-hover text-left overflow-hidden"
            >
              <div className="p-5">

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-[#111b24] border border-[#293746] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div>
                      <h3 className="text-white font-semibold">
                        {config.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        Environmental hazard assessment
                      </p>
                    </div>

                  </div>

                  <span className={`ds-risk-badge ${getRiskClass(level)}`}>
                    {level}
                  </span>

                </div>

                <div className="mt-7 flex items-end justify-between">

                  <div>
                    <div className="text-4xl font-bold text-white tracking-tight">
                      {Math.round(score * 100)}
                      <span className="text-lg text-slate-400 ml-1">
                        %
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      Risk score
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">
                      Trend
                    </div>

                    <div className="text-sm font-semibold text-white mt-1">
                      {risk?.trend || 'STABLE'}
                    </div>
                  </div>

                </div>

                <div className="mt-5 h-1.5 bg-[#252d37] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{
                      width: `${Math.max(
                        3,
                        Math.min(100, score * 100)
                      )}%`,
                    }}
                  />
                </div>

                {risk?.location && (
                  <div className="mt-4 text-xs text-slate-400">
                    {risk.location}
                  </div>
                )}

                {risk?.factors?.[0] && (
                  <div className="mt-4 pt-4 border-t border-[#29323d] flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />

                    <p className="text-xs leading-5 text-slate-300">
                      <span className="text-slate-400">
                        Key Driver:
                      </span>{' '}
                      {risk.factors[0]}
                    </p>
                  </div>
                )}

              </div>
            </button>
          );
        })}

      </div>


      {/* =====================================================
          RIVER INTELLIGENCE
          ===================================================== */}

      <section className="ds-editorial-panel overflow-hidden">

        {/* Header */}

        <div className="ds-panel-header">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-[#102733] border border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>

            <div>
              <h3 className="ds-panel-title">
                River Intelligence
              </h3>

              <p className="text-sm text-slate-400 mt-0.5">
                Kerala Surface Water Department telemetry
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            {riverLoading && (
              <span className="px-3 py-1.5 rounded-lg border border-[#303946] bg-[#0e131a] text-xs font-semibold text-slate-300">
                LOADING
              </span>
            )}

            {!riverLoading && riverError && (
              <span className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-300">
                UNAVAILABLE
              </span>
            )}

            {!riverLoading && !riverError && (
              <span
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  dataStatus === 'LIVE'
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                    : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                }`}
              >
                {statusLabel}
              </span>
            )}

          </div>

        </div>


        {/* Loading */}

        {riverLoading && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 rounded-xl border border-[#29323d] bg-[#10151c] animate-pulse"
              />
            ))}

          </div>
        )}


        {/* Error */}

        {!riverLoading && riverError && (
          <div className="p-6">

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">

              <div className="flex items-center gap-3">

                <AlertTriangle className="w-5 h-5 text-red-400" />

                <div>
                  <div className="text-white font-semibold">
                    River telemetry unavailable
                  </div>

                  <div className="text-sm text-slate-400 mt-1">
                    The backend endpoint could not be reached.
                  </div>
                </div>

              </div>

              <button
                type="button"
                onClick={loadRiverRisk}
                className="mt-4 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-slate-200"
              >
                Retry
              </button>

            </div>

          </div>
        )}


        {/* Data */}

        {!riverLoading && !riverError && riverData && (
          <div className="p-6">

            {/* Summary metrics */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="rounded-xl border border-[#29323d] bg-[#10151c] p-5">

                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Stations Monitored
                </div>

                <div className="mt-4 text-3xl font-bold text-white">
                  {signals.length}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  River telemetry stations
                </div>

              </div>


              <div className="rounded-xl border border-[#29323d] bg-[#10151c] p-5">

                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Elevated Stations
                </div>

                <div className="mt-4 text-3xl font-bold text-white">
                  {elevatedSignals.length}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Above anomaly baseline
                </div>

              </div>


              <div className="rounded-xl border border-[#29323d] bg-[#10151c] p-5">

                <div className="text-slate-400 text-sm">
                  Highest Current Anomaly
                </div>

                <div className="mt-4 text-3xl font-bold text-cyan-400">
                  {highestSignal
                    ? `${highestSignal.anomaly_zscore >= 0 ? '+' : ''}${highestSignal.anomaly_zscore.toFixed(2)}σ`
                    : '—'}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Station-normalized deviation
                </div>

              </div>

            </div>


            {/* Highest anomaly */}

            {highestSignal && (
              <div className="mt-5 rounded-xl border border-[#29323d] bg-[#10151c] p-5">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Highest anomaly station
                    </div>

                    <div className="mt-2 text-xl font-bold text-white">
                      {highestSignal.station}
                    </div>

                  </div>

                  <span
                    className={`ds-risk-badge ${getSignalClass(
                      highestSignal.signal
                    )}`}
                  >
                    {highestSignal.signal}
                  </span>

                </div>


                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">

                  <div>
                    <div className="text-xs text-slate-500">
                      Water Level
                    </div>

                    <div className="mt-1 text-lg font-semibold text-white">
                      {highestSignal.water_level_m.toFixed(3)} m
                    </div>
                  </div>


                  <div>
                    <div className="text-xs text-slate-500">
                      Historical Mean
                    </div>

                    <div className="mt-1 text-lg font-semibold text-white">
                      {highestSignal.historical_mean_m.toFixed(3)} m
                    </div>
                  </div>


                  <div>
                    <div className="text-xs text-slate-500">
                      Anomaly
                    </div>

                    <div className="mt-1 text-lg font-semibold text-cyan-400">
                      {highestSignal.anomaly_zscore >= 0
                        ? '+'
                        : ''}
                      {highestSignal.anomaly_zscore.toFixed(2)}σ
                    </div>
                  </div>


                  <div>
                    <div className="text-xs text-slate-500">
                      Observations
                    </div>

                    <div className="mt-1 text-lg font-semibold text-white">
                      {highestSignal.historical_records.toLocaleString()}
                    </div>
                  </div>

                </div>


                <div className="mt-5 pt-4 border-t border-[#29323d] text-xs text-slate-400">
                  Data status:{' '}
                  <span className="text-slate-300">
                    {dataStatus === 'HISTORICAL_FALLBACK'
                      ? 'Historical fallback — supporting baseline only'
                      : dataStatus}
                  </span>
                </div>

              </div>
            )}

          </div>
        )}

      </section>

    </div>
  );
};

export default RiskOverviewCards;