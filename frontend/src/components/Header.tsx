import React from 'react';
import {
  Activity,
  Map,
  SlidersHorizontal,
  Radio,
  Brain,
  History,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

interface HeaderProps {
  summary?: any;
  onRefresh?: () => void;
  loading?: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  onRefresh,
  loading = false,
  activeTab,
  setActiveTab,
}) => {
  const navigation = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: Activity,
    },
    {
      id: 'map',
      label: 'Risk Map',
      icon: Map,
    },
    {
      id: 'simulator',
      label: 'Simulator',
      icon: SlidersHorizontal,
    },
    {
      id: 'telemetry',
      label: 'Telemetry',
      icon: Radio,
    },
    {
      id: 'ml-insights',
      label: 'ML Insights',
      icon: Brain,
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
    },
  ];

  const systemStatus =
    summary?.system_status ||
    summary?.status ||
    'OPERATIONAL';

  return (
    <header className="ds-dashboard-header">
      <div className="ds-dashboard-header-inner">

        {/* Brand */}
        <button
          className="ds-dashboard-brand"
          onClick={() => setActiveTab('dashboard')}
          type="button"
        >
          <span className="ds-logo-mark" aria-hidden="true">
            <span className="ds-logo-blue" />
            <span className="ds-logo-yellow" />
            <span className="ds-logo-red" />
          </span>

          <span className="ds-brand-copy">
            <span className="ds-brand-name">
              ECO SHIELD
            </span>

            <span className="ds-brand-subtitle">
              Environmental Risk Intelligence
            </span>
          </span>
        </button>

        {/* Navigation */}
        <nav className="ds-dashboard-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`ds-dashboard-nav-item ${
                  isActive ? 'ds-dashboard-nav-item-active' : ''
                }`}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ds-dashboard-header-actions">

          <div className="ds-system-status">
            <span className="ds-status-dot" />
            <span>{systemStatus}</span>
          </div>

          <button
            type="button"
            className="ds-refresh-button"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh intelligence"
          >
            <RefreshCw
              size={15}
              className={loading ? 'ds-refresh-spinning' : ''}
            />
            <span>{loading ? 'Syncing' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            className="ds-dashboard-exit"
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            <ArrowLeft size={15} />
            <span>Home</span>
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;