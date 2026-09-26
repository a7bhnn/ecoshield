import React from "react";
import {
  ArrowRight,
  Activity,
  Waves,
  Mountain,
  Flame,
  Radio,
  Shield,
  ChevronDown,
  Map,
} from "lucide-react";

interface HomepageProps {
  onLaunchDashboard: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  onLaunchDashboard,
}) => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="ds-homepage">

      {/* =========================================
          NAVBAR
      ========================================= */}
      <header className="ds-nav">
        <div className="ds-brand">
          <div className="ds-brand-mark">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span>ECO SHIELD</span>
        </div>

        <nav className="ds-nav-links">
          <button onClick={() => scrollToSection("intelligence")}>
            Intelligence
          </button>

          <button onClick={() => scrollToSection("hazards")}>
            Hazards
          </button>

          <button onClick={() => scrollToSection("about")}>
            About
          </button>

          <button
            className="ds-nav-cta"
            onClick={onLaunchDashboard}
          >
            Launch Dashboard
          </button>
        </nav>

        <div className="ds-language">
          EN <span>/</span> ML
        </div>
      </header>


      {/* =========================================
          HERO
      ========================================= */}
      <main>

        <section className="ds-hero">

          <div className="ds-hero-content">

            <div className="ds-eyebrow">
              <span className="ds-live-dot"></span>
              ENVIRONMENTAL RISK INTELLIGENCE
            </div>

            <p className="ds-hero-small">
              Protect what matters.
            </p>

            <h1>
              Before
              <br />
              disaster
              <br />
              strikes.
            </h1>

            <p className="ds-hero-description">
              AI-powered environmental intelligence that turns
              rainfall, terrain, river and weather signals into
              actionable disaster risk insights for Kerala.
            </p>

            <div className="ds-hero-actions">

              <button
                className="ds-primary-button"
                onClick={onLaunchDashboard}
              >
                Explore Live Intelligence
                <ArrowRight size={18} />
              </button>

              <button
                className="ds-secondary-button"
                onClick={() => scrollToSection("intelligence")}
              >
                Discover how it works
                <ChevronDown size={17} />
              </button>

            </div>

          </div>


          {/* Ambient gradient */}
          <div className="ds-gradient-orb ds-orb-blue"></div>
          <div className="ds-gradient-orb ds-orb-cyan"></div>
          <div className="ds-gradient-orb ds-orb-violet"></div>
          <div className="ds-gradient-orb ds-orb-orange"></div>


          {/* Bottom telemetry strip */}
          <div className="ds-hero-status">

            <div>
              <span className="ds-status-dot"></span>
              SYSTEM OPERATIONAL
            </div>

            <div>
              KERALA · INDIA
            </div>

            <div>
              MULTI-HAZARD INTELLIGENCE
            </div>

          </div>

        </section>


        {/* =========================================
            INTRO
        ========================================= */}
        <section
          id="intelligence"
          className="ds-intelligence-section"
        >

          <div className="ds-section-label">
            01 / ENVIRONMENTAL INTELLIGENCE
          </div>

          <div className="ds-intelligence-grid">

            <div>
              <h2>
                One platform.
                <br />
                Multiple hazards.
                <br />
                <span>One clear picture.</span>
              </h2>
            </div>

            <div className="ds-intelligence-copy">
              <p>
                ECO SHIELD brings environmental signals together
                into a unified risk intelligence platform.
              </p>

              <p>
                Instead of looking at rainfall, river levels,
                terrain and weather independently, the system
                combines them into a single operational view.
              </p>

              <button
                onClick={onLaunchDashboard}
                className="ds-text-button"
              >
                Open the intelligence dashboard
                <ArrowRight size={17} />
              </button>
            </div>

          </div>


          {/* Data signal cards */}
          <div className="ds-signal-grid">

            <div className="ds-signal-card">
              <Activity size={21} />
              <span>WEATHER SIGNALS</span>
              <strong>Continuous environmental context</strong>
            </div>

            <div className="ds-signal-card">
              <Radio size={21} />
              <span>RIVER TELEMETRY</span>
              <strong>Water-level intelligence</strong>
            </div>

            <div className="ds-signal-card">
              <Map size={21} />
              <span>GEOSPATIAL DATA</span>
              <strong>Location-aware risk analysis</strong>
            </div>

          </div>

        </section>


        {/* =========================================
            HAZARDS
        ========================================= */}
        <section
          id="hazards"
          className="ds-hazards-section"
        >

          <div className="ds-section-label">
            02 / MULTI-HAZARD INTELLIGENCE
          </div>

          <div className="ds-hazards-heading">
            <h2>
              Three threats.
              <br />
              <span>One shield.</span>
            </h2>

            <p>
              A unified intelligence layer for monitoring
              the environmental conditions that can contribute
              to major hazards.
            </p>
          </div>


          <div className="ds-hazard-grid">

            {/* Flood */}
            <article className="ds-hazard-card ds-flood">

              <div className="ds-hazard-top">
                <span>01</span>
                <Waves size={28} />
              </div>

              <div className="ds-hazard-icon">
                <Waves size={48} strokeWidth={1.4} />
              </div>

              <div>
                <h3>Flood</h3>

                <p>
                  Rainfall patterns, accumulated precipitation
                  and river-level signals combined into flood
                  risk intelligence.
                </p>
              </div>

              <div className="ds-hazard-footer">
                RAINFALL · RIVERS · BASINS
              </div>

            </article>


            {/* Landslide */}
            <article className="ds-hazard-card ds-landslide">

              <div className="ds-hazard-top">
                <span>02</span>
                <Mountain size={28} />
              </div>

              <div className="ds-hazard-icon">
                <Mountain size={48} strokeWidth={1.4} />
              </div>

              <div>
                <h3>Landslide</h3>

                <p>
                  Rainfall, slope conditions and environmental
                  signals used to identify areas where
                  instability may increase.
                </p>
              </div>

              <div className="ds-hazard-footer">
                TERRAIN · SLOPE · SOIL
              </div>

            </article>


            {/* Wildfire */}
            <article className="ds-hazard-card ds-wildfire">

              <div className="ds-hazard-top">
                <span>03</span>
                <Flame size={28} />
              </div>

              <div className="ds-hazard-icon">
                <Flame size={48} strokeWidth={1.4} />
              </div>

              <div>
                <h3>Wildfire</h3>

                <p>
                  Temperature, humidity and environmental
                  conditions used to surface wildfire-related
                  risk signals.
                </p>
              </div>

              <div className="ds-hazard-footer">
                HEAT · HUMIDITY · FIRE
              </div>

            </article>

          </div>

        </section>


        {/* =========================================
            HOW IT WORKS
        ========================================= */}
        <section
          id="about"
          className="ds-process-section"
        >

          <div className="ds-section-label">
            03 / HOW IT WORKS
          </div>

          <div className="ds-process-heading">
            <h2>
              From signal
              <br />
              <span>to insight.</span>
            </h2>

            <p>
              ECO SHIELD transforms environmental data
              into a visual decision-support layer.
            </p>
          </div>


          <div className="ds-process-grid">

            <div className="ds-process-step">
              <div className="ds-process-number">01</div>

              <h3>Collect</h3>

              <p>
                Gather weather, rainfall, river and
                environmental signals.
              </p>
            </div>

            <div className="ds-process-line"></div>

            <div className="ds-process-step">
              <div className="ds-process-number">02</div>

              <h3>Analyse</h3>

              <p>
                Risk models evaluate environmental
                conditions and hazard indicators.
              </p>
            </div>

            <div className="ds-process-line"></div>

            <div className="ds-process-step">
              <div className="ds-process-number">03</div>

              <h3>Understand</h3>

              <p>
                Explainable risk factors reveal what is
                driving the current signal.
              </p>
            </div>

            <div className="ds-process-line"></div>

            <div className="ds-process-step">
              <div className="ds-process-number">04</div>

              <h3>Act</h3>

              <p>
                Explore the dashboard and use the
                intelligence for decision support.
              </p>
            </div>

          </div>

        </section>


        {/* =========================================
            DASHBOARD CTA
        ========================================= */}
        <section className="ds-dashboard-cta">

          <div className="ds-cta-glow"></div>

          <Shield
            className="ds-cta-shield"
            size={38}
            strokeWidth={1.3}
          />

          <p className="ds-cta-label">
            ECO SHIELD
          </p>

          <h2>
            Know the risk.
            <br />
            <span>Act before it becomes a disaster.</span>
          </h2>

          <button
            className="ds-primary-button ds-large-button"
            onClick={onLaunchDashboard}
          >
            Launch Dashboard
            <ArrowRight size={19} />
          </button>

        </section>

      </main>


      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="ds-footer">

        <div className="ds-footer-brand">
          <div className="ds-brand-mark">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div>
            <strong>ECO SHIELD</strong>
            <small>
              AI-Powered Environmental Risk Intelligence
            </small>
          </div>
        </div>

        <div className="ds-footer-right">
          <span>KERALA · INDIA</span>
          <span>PROTOTYPE / DECISION SUPPORT</span>
          <span>© 2026 ECO SHIELD</span>
        </div>

      </footer>

    </div>
  );
};

export default Homepage;