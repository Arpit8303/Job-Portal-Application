import { useState, useEffect } from 'react';
import { MdLocationOn, MdWork, MdStars, MdRefresh, MdBusinessCenter } from 'react-icons/md';
import recommendationService from '../services/recommendationService';

// ─── Match score badge colours ────────────────────────────────────────────────
const getScoreStyle = (score) => {
  if (score >= 70) return { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', label: 'Great match' };
  if (score >= 40) return { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', label: 'Good match'  };
  return             { bg: 'rgba(245,158,11,0.12)',   color: '#f59e0b', label: 'Partial match' };
};

const workTypeLabels = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  'internship': 'Internship',
  'contract': 'Contract',
};

// ─── Single recommendation card ───────────────────────────────────────────────
const RecommendedCard = ({ job }) => {
  const score = job._matchScore || 0;
  const scoreStyle = getScoreStyle(score);

  return (
    <div className="rec-card">
      <div className="rec-card__header">
        <div className="rec-card__avatar">
          {job.company?.charAt(0)?.toUpperCase() || 'C'}
        </div>
        <div className="rec-card__title-group">
          <h4 className="rec-card__position">{job.position}</h4>
          <p className="rec-card__company">{job.company}</p>
        </div>
        <span
          className="rec-card__score-badge"
          style={{ background: scoreStyle.bg, color: scoreStyle.color }}
          title={`${score}% skill match`}
        >
          <MdStars style={{ fontSize: '13px' }} />
          {scoreStyle.label}
        </span>
      </div>

      <div className="rec-card__details">
        <span className="rec-card__detail">
          <MdLocationOn /> {job.workLocation}
        </span>
        <span className="rec-card__detail">
          <MdBusinessCenter /> {workTypeLabels[job.workType] || job.workType}
        </span>
        <span className="rec-card__detail">
          <MdWork /> {job.status}
        </span>
      </div>

      {/* Match score bar */}
      <div className="rec-card__match-bar-container" title={`${score}% match`}>
        <div
          className="rec-card__match-bar-fill"
          style={{ width: `${score}%`, background: scoreStyle.color }}
        />
      </div>
      <p className="rec-card__match-pct" style={{ color: scoreStyle.color }}>
        {score}% match
      </p>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const RecommendedJobs = () => {
  const [jobs, setJobs]         = useState([]);
  const [userSkills, setSkills] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchRecommended = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recommendationService.getRecommendedJobs();
      setJobs(data.jobs || []);
      setSkills(data.userSkills || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecommended(); }, []);

  return (
    <section className="rec-section">
      <div className="rec-section__header">
        <div>
          <h2 className="rec-section__title">
            <MdStars className="rec-section__icon" /> Recommended for You
          </h2>
          <p className="rec-section__subtitle">
            Based on your skills:{' '}
            {userSkills.length > 0
              ? userSkills.slice(0, 5).map((s) => (
                  <span key={s} className="rec-section__skill-chip">{s}</span>
                ))
              : <span className="rec-section__no-skills">Add skills to your profile for better matches</span>
            }
            {userSkills.length > 5 && <span className="rec-section__skill-more">+{userSkills.length - 5}</span>}
          </p>
        </div>
        <button
          id="refresh-recommendations-btn"
          className="btn btn--ghost rec-section__refresh"
          onClick={fetchRecommended}
          disabled={loading}
          title="Refresh recommendations"
        >
          <MdRefresh className={loading ? 'rec-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="rec-section__loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rec-skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="rec-section__error">
          <p>{error}</p>
          <button className="btn btn--primary" onClick={fetchRecommended}>Try Again</button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rec-section__empty">
          <MdStars style={{ fontSize: '40px', opacity: 0.2 }} />
          <p>No matching recommendations yet.</p>
          <small>Update your profile skills or apply to more jobs to unlock personalised picks.</small>
        </div>
      ) : (
        <div className="rec-section__grid">
          {jobs.map((job) => (
            <RecommendedCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
};

export default RecommendedJobs;
