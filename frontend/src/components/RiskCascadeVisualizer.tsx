import React from 'react';
import { ArrowDown, CloudRain, Droplets, Waves, Mountain, Flame, GitMerge, Info } from 'lucide-react';
import { CascadeNode } from '../types';

interface RiskCascadeVisualizerProps {
  nodes?: CascadeNode[];
  compoundInsights?: string[];
}

export const RiskCascadeVisualizer: React.FC<RiskCascadeVisualizerProps> = ({
  nodes,
  compoundInsights
}) => {
  const defaultNodes: CascadeNode[] = [
    {
      id: 'node_precip',
      label: 'Atmospheric Influx',
      value: '185.0 mm / 24h',
      status: 'CRITICAL',
      description: 'Orographic monsoonal cloudburst over Western Ghats ridge line'
    },
    {
      id: 'node_saturation',
      label: 'Pore-Water Saturation',
      value: '91.2% Moisture',
      status: 'CRITICAL',
      description: 'Topsoil infiltration exceeded; groundwater table reaches surface'
    },
    {
      id: 'node_flood',
      label: 'Lowland Inundation',
      value: 'Risk: HIGH (88%)',
      status: 'HIGH',
      description: 'Periyar & Pamba river channels exceed warning discharge gauge'
    },
    {
      id: 'node_landslide',
      label: 'Ghats Slope Shearing',
      value: 'Risk: CRITICAL (94%)',
      status: 'CRITICAL',
      description: 'Laterite mud failure on steep terrain (>35°) triggers debris torrents'
    }
  ];

  const activeNodes = nodes && nodes.length > 0 ? nodes : defaultNodes;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return {
          border: 'border-rose-500/80 shadow-rose-500/20',
          bg: 'bg-rose-950/40 text-rose-200',
          badge: 'bg-rose-500 text-white font-bold',
          line: 'border-rose-500'
        };
      case 'HIGH':
      case 'ELEVATED':
        return {
          border: 'border-orange-500/70 shadow-orange-500/20',
          bg: 'bg-orange-950/40 text-orange-200',
          badge: 'bg-orange-500 text-white font-bold',
          line: 'border-orange-500'
        };
      case 'MODERATE':
        return {
          border: 'border-amber-500/60',
          bg: 'bg-amber-950/30 text-amber-200',
          badge: 'bg-amber-500 text-slate-900 font-bold',
          line: 'border-amber-500'
        };
      default:
        return {
          border: 'border-slate-700',
          bg: 'bg-slate-900/60 text-slate-300',
          badge: 'bg-slate-700 text-slate-300',
          line: 'border-slate-700'
        };
    }
  };

  const getNodeIcon = (index: number, label: string) => {
    if (label.includes('Precipitation') || label.includes('Influx')) return CloudRain;
    if (label.includes('Saturation') || label.includes('Soil')) return Droplets;
    if (label.includes('Flood') || label.includes('Lowland')) return Waves;
    if (label.includes('Landslide') || label.includes('Slope')) return Mountain;
    if (label.includes('Wildfire') || label.includes('Fuel')) return Flame;
    return GitMerge;
  };

  return (
    <div className="glass-card rounded-xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <GitMerge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Compound Hazard Risk Cascade</h3>
            <p className="text-xs text-slate-400">
              Deterministic cause-and-effect modeling of cascading environmental stressors
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
          SYSTEMIC LINKAGE
        </span>
      </div>

      {/* Cascade Flow Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative py-2">
        {activeNodes.slice(0, 4).map((node, idx) => {
          const colors = getStatusColor(node.status);
          const Icon = getNodeIcon(idx, node.label);

          return (
            <div key={node.id || idx} className="relative flex flex-col justify-between">
              {/* Card */}
              <div
                className={`p-4 rounded-xl border ${colors.border} ${colors.bg} backdrop-blur shadow-lg transition-all duration-300 relative z-10 flex-1 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800/80 text-cyan-300 border border-slate-700">
                      Stage {idx + 1}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${colors.badge}`}
                    >
                      {node.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
                    <h4 className="font-semibold text-sm text-slate-100">{node.label}</h4>
                  </div>

                  <div className="mt-2 text-base font-bold font-mono text-white tracking-wide">
                    {node.value}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                  {node.description}
                </p>
              </div>

              {/* Connecting Arrow for desktop */}
              {idx < 3 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 items-center justify-center h-6 w-6 rounded-full bg-slate-900 border border-cyan-500/50 text-cyan-400 shadow-md">
                  <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                </div>
              )}

              {/* Connecting Arrow for mobile */}
              {idx < 3 && (
                <div className="md:hidden flex justify-center py-1.5 text-cyan-400">
                  <ArrowDown className="h-4 w-4 animate-bounce" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Synthesis Insight Callout */}
      <div className="mt-4 p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-start space-x-3 text-xs text-cyan-200">
        <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-300">Cascade Mechanism: </span>
          {compoundInsights && compoundInsights.length > 0
            ? compoundInsights[0]
            : 'Heavy monsoon precipitation rapidly saturates soil pore structures. In steep Western Ghats slopes, high pore-water pressure triggers catastrophic landslides, while excess runoff funnels into river basins causing lowland flood inundation.'}
        </div>
      </div>
    </div>
  );
};
