import React, { useEffect, useState } from 'react';
import "./App.css";

import { Header } from './components/Header';
import { Homepage } from './components/Homepage';

import { RiskOverviewCards } from './components/RiskOverviewCards';
import { RiskCascadeVisualizer } from './components/RiskCascadeVisualizer';
import { ActiveAlertsList } from './components/ActiveAlertsList';
import { InteractiveMap } from './components/InteractiveMap';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { EnvironmentalCharts } from './components/EnvironmentalCharts';
import { MLInsightsModal } from './components/MLInsightsModal';
import { HistoricalEventsView } from './components/HistoricalEventsView';

import {
  fetchDashboardSummary,
  fetchAllRisks,
  fetchAlerts,
  fetchHistoricalEvents,
  fetchEnvironment,
  fetchMLInsights
} from './services/api';

import {
  DashboardSummary,
  DistrictRisk,
  Alert,
  HistoricalEvent,
  MLInsights,
  Station
} from './types';

import {
  Shield,
  AlertCircle,
  Radio,
  ArrowUpRight
} from 'lucide-react';


/* ============================================================
   DASHBOARD
   ============================================================ */

interface DashboardProps {
  onGoHome: () => void;
}


const Dashboard: React.FC<DashboardProps> = ({ onGoHome }) => {

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [districtRisks, setDistrictRisks] =
    useState<DistrictRisk[]>([]);

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [historicalEvents, setHistoricalEvents] =
    useState<HistoricalEvent[]>([]);

  const [stations, setStations] =
    useState<Station[]>([]);

  const [timeseries, setTimeseries] =
    useState<any[]>([]);

  const [mlInsights, setMlInsights] =
    useState<MLInsights | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);


  /* ==========================================================
     LOAD ALL DATA
     ========================================================== */

  const loadAllData = async () => {

    setLoading(true);
    setError(null);

    try {

      const [
        sumRes,
        riskRes,
        alertRes,
        histRes,
        envRes,
        mlRes
      ] = await Promise.allSettled([

        fetchDashboardSummary(),
        fetchAllRisks(),
        fetchAlerts(),
        fetchHistoricalEvents(),
        fetchEnvironment(),
        fetchMLInsights()

      ]);


      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value);
      }


      if (riskRes.status === 'fulfilled') {
        setDistrictRisks(
          riskRes.value.district_risks || []
        );
      }


      if (alertRes.status === 'fulfilled') {
        setAlerts(
          alertRes.value.alerts || []
        );
      }


      if (histRes.status === 'fulfilled') {
        setHistoricalEvents(
          histRes.value.events || []
        );
      }


      if (envRes.status === 'fulfilled') {

        setStations(
          envRes.value.stations || []
        );

        setTimeseries(
          envRes.value.timeseries || []
        );

      }


      if (mlRes.status === 'fulfilled') {
        setMlInsights(mlRes.value);
      }


      const failedRequests = [
        sumRes,
        riskRes,
        alertRes,
        histRes,
        envRes,
        mlRes
      ].filter(
        result => result.status === 'rejected'
      );


      if (failedRequests.length > 0) {

        setError(
          'Some intelligence services are temporarily unavailable. Showing available data.'
        );

      }


    } catch (err) {

      console.error('Data sync failed:', err);

      setError(
        'Backend communication delay. Displaying available telemetry.'
      );

    } finally {

      setLoading(false);

    }

  };


  /* ==========================================================
     INITIAL LOAD + AUTO REFRESH
     ========================================================== */

  useEffect(() => {

    loadAllData();

    const interval = setInterval(
      loadAllData,
      30000
    );

    return () => clearInterval(interval);

  }, []);


  /* ============================================================
     DASHBOARD
     ============================================================ */

  return (

    <div className="ds-dashboard-app min-h-screen flex flex-col">


      {/* ======================================================
          HEADER
          ====================================================== */}

      <Header
        summary={summary}
        onRefresh={loadAllData}
        loading={loading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />


      {/* ======================================================
          MAIN
          ====================================================== */}

      <main className="ds-dashboard-main flex-1 w-full px-4 lg:px-8 py-8">


        {/* ====================================================
            OVERVIEW HERO
            ==================================================== */}

        {activeTab === 'dashboard' && (

          <section className="ds-dashboard-intro">

            <div className="ds-dashboard-intro-copy">

              <div className="ds-dashboard-kicker">

                <span className="ds-kicker-line" />

                KERALA / ENVIRONMENTAL INTELLIGENCE

              </div>


              <h1 className="ds-dashboard-title">

                Risk intelligence

                <br />

                at a glance.

              </h1>


              <p className="ds-dashboard-description">

                Monitor environmental conditions, compare hazard
                signals, inspect telemetry and explore potential
                risk scenarios across Kerala.

              </p>

            </div>


            <div className="ds-dashboard-intro-side">

              <div className="ds-live-indicator">

                <span className="ds-live-dot" />

                <span>SYSTEM OPERATIONAL</span>

              </div>


              <button
                type="button"
                className="ds-back-home-link"
                onClick={onGoHome}
              >

                Back to ECO SHIELD

                <ArrowUpRight size={16} />

              </button>

            </div>

          </section>

        )}


        {/* ====================================================
            ERROR / CONNECTION NOTICE
            ==================================================== */}

        {error && (

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between mb-6">

            <div className="flex items-center gap-2">

              <AlertCircle
                className="h-4 w-4 shrink-0 text-amber-400"
              />

              <span>
                {error}
              </span>

            </div>


            <button
              onClick={loadAllData}
              className="underline text-amber-200 hover:text-white font-semibold cursor-pointer"
            >

              Retry Sync

            </button>

          </div>

        )}


        {/* ====================================================
            OVERVIEW
            ==================================================== */}

        {activeTab === 'dashboard' && (

          <div className="space-y-8">


            {/* ==================================================
                01 / HAZARD OVERVIEW
                ================================================== */}

            <section className="ds-dashboard-section">

              <div className="ds-section-heading">

                <div>

                  <div className="ds-section-kicker">

                    01 / HAZARD OVERVIEW

                  </div>


                  <h2>
                    Current risk landscape
                  </h2>

                </div>


                <div className="ds-section-note">

                  Flood · Landslide · Wildfire

                </div>

              </div>


              <RiskOverviewCards

                risks={summary?.top_risks || null}

                onSelectHazard={(hazard) => {

                  if (hazard === 'flood') {

                    setActiveTab('telemetry');

                  } else if (hazard === 'landslide') {

                    setActiveTab('map');

                  } else {

                    setActiveTab('simulator');

                  }

                }}

              />

            </section>


            {/* ==================================================
                02 / RISK CASCADE
                ================================================== */}

            <section className="ds-dashboard-section">

              <div className="ds-section-heading">

                <div>

                  <div className="ds-section-kicker">

                    02 / MULTI-HAZARD ANALYSIS

                  </div>


                  <h2>
                    Risk cascade
                  </h2>

                </div>

              </div>


              <RiskCascadeVisualizer />

            </section>


            {/* ==================================================
                03 / ACTIVE SIGNALS
                ================================================== */}

            <section className="ds-dashboard-section">

              <div className="ds-section-heading">

                <div>

                  <div className="ds-section-kicker">

                    03 / ACTIVE SIGNALS

                  </div>


                  <h2>
                    Alerts & telemetry
                  </h2>

                </div>

              </div>


              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">


                {/* ALERTS */}

                <div className="lg:col-span-7">

                  <ActiveAlertsList

                    alerts={alerts}

                    onSelectAlert={() =>
                      setActiveTab('map')
                    }

                  />

                </div>


                {/* TELEMETRY */}

                <div className="lg:col-span-5 flex flex-col gap-4">

                  <div className="ds-editorial-panel flex-1">

                    <div className="ds-panel-header">

                      <div className="ds-panel-title">

                        <Radio className="h-4 w-4" />

                        Telemetry Station Vitals

                      </div>


                      <button
                        onClick={() =>
                          setActiveTab('map')
                        }
                        className="ds-panel-link"
                      >

                        Open Full Map →

                      </button>

                    </div>


                    <div className="ds-telemetry-list">

                      {districtRisks
                        .slice(0, 7)
                        .map((d) => (

                          <div
                            key={d.station_id}
                            onClick={() =>
                              setActiveTab('map')
                            }
                            className="ds-telemetry-row cursor-pointer"
                          >

                            <div className="ds-telemetry-location">

                              <div className="font-semibold">

                                {d.district}

                              </div>


                              <div className="text-[11px] text-slate-400">

                                {d.readings.precipitation_24h_mm}

                                {' '}mm (24h)

                                {' • '}

                                {d.terrain}

                              </div>

                            </div>


                            <div className="text-right">

                              <span

                                className={`

                                  ds-risk-badge

                                  ${
                                    d.composite_level === 'CRITICAL'

                                      ? 'ds-risk-critical'

                                      : d.composite_level === 'HIGH'

                                      ? 'ds-risk-high'

                                      : d.composite_level === 'MODERATE'

                                      ? 'ds-risk-moderate'

                                      : 'ds-risk-low'
                                  }

                                `}

                              >

                                {d.composite_level}

                                {' '}

                                (

                                {Math.round(
                                  d.composite_score * 100
                                )}

                                %)

                              </span>

                            </div>

                          </div>

                        ))}

                    </div>

                  </div>

                </div>

              </div>

            </section>

          </div>

        )}


        {/* ====================================================
            TAB — RISK MAP
            ==================================================== */}

        {activeTab === 'map' && (

          <section className="ds-full-tab">

            <div className="ds-section-heading">

              <div>

                <div className="ds-section-kicker">

                  01 / GEOSPATIAL INTELLIGENCE

                </div>


                <h2>
                  Risk map
                </h2>

              </div>


              <div className="ds-section-note">

                Kerala hazard landscape

              </div>

            </div>


            <InteractiveMap

              districtRisks={districtRisks}

              historicalEvents={historicalEvents}

            />

          </section>

        )}


        {/* ====================================================
            TAB — SIMULATOR
            ==================================================== */}

        {activeTab === 'simulator' && (

          <section className="ds-full-tab">

            <div className="ds-section-heading">

              <div>

                <div className="ds-section-kicker">

                  01 / SCENARIO ENGINE

                </div>


                <h2>
                  What-if simulator
                </h2>

              </div>


              <div className="ds-section-note">

                Multi-hazard scenario analysis

              </div>

            </div>


            <WhatIfSimulator />

          </section>

        )}


        {/* ====================================================
            TAB — TELEMETRY
            ==================================================== */}

        {activeTab === 'telemetry' && (

          <section className="ds-full-tab">

            <div className="ds-section-heading">

              <div>

                <div className="ds-section-kicker">

                  01 / ENVIRONMENTAL TELEMETRY

                </div>


                <h2>
                  Environmental telemetry
                </h2>

              </div>


              <div className="ds-section-note">

                Station observations & trends

              </div>

            </div>


            <EnvironmentalCharts

              stations={stations}

              timeseries={timeseries}

            />

          </section>

        )}


        {/* ====================================================
            TAB — ML INSIGHTS
            ==================================================== */}

        {activeTab === 'ml-insights' && (

          <section className="ds-full-tab">

            <div className="ds-section-heading">

              <div>

                <div className="ds-section-kicker">

                  01 / MACHINE LEARNING

                </div>


                <h2>
                  Model insights
                </h2>

              </div>


              <div className="ds-section-note">

                Prediction intelligence

              </div>

            </div>


            <MLInsightsModal
              insights={mlInsights}
            />

          </section>

        )}


        {/* ====================================================
            TAB — HISTORY
            ==================================================== */}

        {activeTab === 'history' && (

          <section className="ds-full-tab">

            <div className="ds-section-heading">

              <div>

                <div className="ds-section-kicker">

                  01 / HISTORICAL BENCHMARKS

                </div>


                <h2>
                  Historical events
                </h2>

              </div>


              <div className="ds-section-note">

                Historical risk context

              </div>

            </div>


            <HistoricalEventsView
              events={historicalEvents}
            />

          </section>

        )}

      </main>


      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer className="ds-dashboard-footer">

        <div className="ds-dashboard-footer-inner">


          <div className="ds-footer-brand">

            <div className="ds-footer-mark">

              <Shield size={16} />

            </div>


            <span>
              ECO SHIELD
            </span>


            <span>
              • Kerala Environmental Risk Intelligence Platform
            </span>

          </div>


          <div className="ds-footer-meta">

            <span>
              Model: XGBoost Classifier 2.0
            </span>


            <span>•</span>


            <span>
              Data: Kerala environmental telemetry
            </span>


            <span>•</span>


            <span>
              Prototype for Decision Support
            </span>

          </div>

        </div>

      </footer>

    </div>

  );

};


/* ============================================================
   ROOT APP / HOMEPAGE + DASHBOARD ROUTING
   ============================================================ */

export const App: React.FC = () => {


  const getCurrentPage = () => {

    if (
      window.location.pathname === '/dashboard'
    ) {

      return 'dashboard';

    }

    return 'home';

  };


  const [page, setPage] = useState(
    getCurrentPage()
  );


  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const goToDashboard = () => {

    window.history.pushState(
      {},
      '',
      '/dashboard'
    );

    setPage('dashboard');

    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });

  };


  const goToHome = () => {

    window.history.pushState(
      {},
      '',
      '/'
    );

    setPage('home');

    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });

  };


  /* ==========================================================
     BROWSER BACK / FORWARD
     ========================================================== */

  useEffect(() => {

    const handlePopState = () => {

      setPage(

        window.location.pathname === '/dashboard'

          ? 'dashboard'

          : 'home'

      );


      window.scrollTo({

        top: 0,

        behavior: 'instant'

      });

    };


    window.addEventListener(
      'popstate',
      handlePopState
    );


    return () => {

      window.removeEventListener(
        'popstate',
        handlePopState
      );

    };

  }, []);


  /* ==========================================================
     HOMEPAGE
     ========================================================== */

  if (page === 'home') {

    return (

      <div className="eco-homepage-shell">

        <Homepage
          onLaunchDashboard={goToDashboard}
        />

      </div>

    );

  }


  /* ==========================================================
     DASHBOARD
     ========================================================== */

  return (

    <Dashboard
      onGoHome={goToHome}
    />

  );

};


export default App;