import { Link } from 'react-router-dom';
import { TbBriefcase, TbRocket, TbBolt, TbLogin, TbFilter } from 'react-icons/tb';
import './Landing.css';

const Landing = () => {
  return (
    <div className="jl">
      <nav className="jl-nav">
        <div className="jl-logo">
          <div className="jl-logo-box">
            <TbBriefcase style={{ color: '#fff', fontSize: '17px' }} />
          </div>
          JobLedger
        </div>
        <div className="jl-nav-links">
          <a href="#features" className="jl-nav-link" style={{ textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" className="jl-nav-link" style={{ textDecoration: 'none' }}>How it works</a>
          <a href="#pricing" className="jl-nav-link" style={{ textDecoration: 'none' }}>Pricing</a>
        </div>
        <div className="jl-nav-right">
          <Link to="/login" className="jl-login">Login</Link>
          <Link to="/register" className="jl-get-started">Get Started</Link>
        </div>
      </nav>

      <div className="jl-hero">
        <div className="jl-hero-left">
          <div className="jl-badge">
            <TbRocket style={{ fontSize: '12px' }} />
            Track Your Career Journey
          </div>
          <h1 className="jl-h1">
            Manage Your<br />
            <span className="hl">Job Applications</span><br />
            with Ease
          </h1>
          <p className="jl-sub">
            Stay organized, track every application, and land your dream job. The smartest way to manage your job search.
          </p>
          <div className="jl-ctas">
            <Link to="/register" className="jl-cta1">
              <TbBolt style={{ fontSize: '15px' }} />
              Start Tracking — It's Free
            </Link>
            <Link to="/login" className="jl-cta2">
              <TbLogin style={{ fontSize: '15px' }} />
              I have an account
            </Link>
          </div>
          <div className="jl-trust">
            <div className="jl-avatars">
              <div className="jl-av" style={{ background: '#4F46E5' }}>AK</div>
              <div className="jl-av" style={{ background: '#7C3AED' }}>SR</div>
              <div className="jl-av" style={{ background: '#0891B2' }}>MN</div>
              <div className="jl-av" style={{ background: '#059669' }}>PV</div>
            </div>
            <div className="jl-trust-text"><strong>12,000+</strong> job seekers trust JobLedger</div>
          </div>
        </div>

        <div className="jl-hero-right">
          <div className="jl-card">
            <div className="jl-card-header">
              <div>
                <div className="jl-card-title">My Applications</div>
                <div className="jl-card-sub">6 active this week</div>
              </div>
              <TbFilter style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', cursor: 'pointer' }} />
            </div>
            <div className="jl-card-body">
              <div className="jl-app-row">
                <div className="jl-app-dot" style={{ background: '#4F46E5' }}></div>
                <div className="jl-app-info">
                  <div className="jl-app-name">Google</div>
                  <div className="jl-app-role">SWE Intern</div>
                </div>
                <span className="jl-app-badge badge-interview">Interview</span>
              </div>
              <div className="jl-app-row">
                <div className="jl-app-dot" style={{ background: '#059669' }}></div>
                <div className="jl-app-info">
                  <div className="jl-app-name">Razorpay</div>
                  <div className="jl-app-role">Backend Dev</div>
                </div>
                <span className="jl-app-badge badge-offer">Offer</span>
              </div>
              <div className="jl-app-row">
                <div className="jl-app-dot" style={{ background: '#9CA3AF' }}></div>
                <div className="jl-app-info">
                  <div className="jl-app-name">Zepto</div>
                  <div className="jl-app-role">Full Stack</div>
                </div>
                <span className="jl-app-badge badge-applied">Applied</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="jl-stats">
        <div className="jl-stat">
          <div className="jl-stat-num">12k+</div>
          <div className="jl-stat-lbl">Job seekers</div>
        </div>
        <div className="jl-stat">
          <div className="jl-stat-num">98%</div>
          <div className="jl-stat-lbl">Stay organized</div>
        </div>
        <div className="jl-stat">
          <div className="jl-stat-num">3x</div>
          <div className="jl-stat-lbl">Faster callbacks</div>
        </div>
        <div className="jl-stat">
          <div className="jl-stat-num">4.9★</div>
          <div className="jl-stat-lbl">User rating</div>
        </div>
      </div>

      <div id="features" className="jl-section" style={{ padding: '80px 40px', textAlign: 'center', background: '#fff' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#111827' }}>Powerful Features</h2>
        <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>Everything you need to manage your job search efficiently.</p>
      </div>
      
      <div id="how-it-works" className="jl-section" style={{ padding: '80px 40px', textAlign: 'center', background: '#F9FAFB' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#111827' }}>How It Works</h2>
        <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>Simple steps to land your dream job faster.</p>
      </div>

      <div id="pricing" className="jl-section" style={{ padding: '80px 40px', textAlign: 'center', background: '#fff' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#111827' }}>Simple Pricing</h2>
        <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>Free forever for standard users.</p>
      </div>
    </div>
  );
};

export default Landing;
