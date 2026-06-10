import { Link } from 'react-router-dom';
import { MdWork, MdTrendingUp, MdSecurity, MdSpeed } from 'react-icons/md';
import logoSvg from '../assets/jobLedger-logo.svg';

const Landing = () => {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing__hero">
        <div className="landing__hero-bg">
          <div className="landing__orb landing__orb--1" />
          <div className="landing__orb landing__orb--2" />
          <div className="landing__orb landing__orb--3" />
        </div>
        <nav className="landing__nav">
          <h1 className="landing__brand">
            <img src={logoSvg} alt="JobLedger" className="logo-image" /> JobLedger
          </h1>
          <div className="landing__nav-links">
            <Link to="/login" className="btn btn--ghost">Login</Link>
            <Link to="/register" className="btn btn--primary">Get Started</Link>
          </div>
        </nav>
        <div className="landing__hero-content">
          <div className="landing__badge">🚀 Track Your Career Journey</div>
          <h2 className="landing__title">
            Manage Your <span className="gradient-text">Job Applications</span> with Ease
          </h2>
          <p className="landing__subtitle">
            Stay organized, track every application, and land your dream job. The smartest way to manage your job search journey.
          </p>
          <div className="landing__cta">
            <Link to="/register" className="btn btn--primary btn--lg">Start Tracking — It's Free</Link>
            <Link to="/login" className="btn btn--outline btn--lg">I have an account</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing__features">
        <h3 className="landing__section-title">Why JobLedger?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED' }}>
              <MdWork />
            </div>
            <h4>Job Management</h4>
            <p>Create, edit, and organize all your job applications in one dashboard.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
              <MdTrendingUp />
            </div>
            <h4>Analytics & Insights</h4>
            <p>Visualize your progress with beautiful charts and statistics.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
              <MdSpeed />
            </div>
            <h4>Fast & Intuitive</h4>
            <p>Lightning-fast interface with search, filters, and sorting capabilities.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon" style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#F97316' }}>
              <MdSecurity />
            </div>
            <h4>Secure & Private</h4>
            <p>Your data is protected with JWT authentication and encrypted storage.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <p>© 2026 JobLedger. Modern recruitment platform for job seekers and recruiters.</p>
      </footer>
    </div>
  );
};

export default Landing;
