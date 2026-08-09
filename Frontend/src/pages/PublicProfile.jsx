import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MdLocationOn, MdWork, MdOpenInNew, MdVerified,
  MdCode, MdArrowBack,
} from 'react-icons/md';
import api from '../services/api';

const PublicProfile = () => {
  const { username } = useParams();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get(`/auth/public/${username}`);
        setUser(data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="pub-profile pub-profile--loading">
        <div className="spinner spinner--lg" />
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="pub-profile pub-profile--error">
        <h2>Profile Not Found</h2>
        <p>{error || 'This profile is private or does not exist.'}</p>
        <Link to="/" className="btn btn--primary" style={{ marginTop: '16px' }}>
          <MdArrowBack /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="pub-profile">
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="pub-profile__topbar">
        <Link to="/" className="pub-profile__back-link">
          <MdArrowBack /> JobLedger
        </Link>
        <span className="pub-profile__badge">
          <MdVerified /> Public Profile
        </span>
      </div>

      {/* ── Hero card ────────────────────────────────────────────────── */}
      <div className="pub-profile__hero">
        <div className="pub-profile__avatar">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="pub-profile__hero-info">
          <h1 className="pub-profile__name">
            {user.name} {user.lastName || ''}
          </h1>
          {user.username && (
            <p className="pub-profile__username">@{user.username}</p>
          )}
          <div className="pub-profile__meta">
            {user.location && (
              <span className="pub-profile__meta-item">
                <MdLocationOn /> {user.location}
              </span>
            )}
            <span className="pub-profile__meta-item">
              <MdWork /> Job Seeker
            </span>
          </div>
        </div>
      </div>

      {/* ── Skills section ───────────────────────────────────────────── */}
      {user.skills && user.skills.length > 0 && (
        <section className="pub-profile__section">
          <h2 className="pub-profile__section-title">
            <MdCode /> Skills
          </h2>
          <div className="pub-profile__skills-grid">
            {user.skills.map((skill) => (
              <span key={skill} className="pub-profile__skill-chip">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {/* ── Resume link ──────────────────────────────────────────────── */}
      {user.resumeUrl && (
        <section className="pub-profile__section">
          <h2 className="pub-profile__section-title">Resume</h2>
          <a
            href={user.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pub-profile__resume-btn"
          >
            <MdOpenInNew /> View Resume
          </a>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="pub-profile__footer">
        <p>Powered by <strong>JobLedger</strong></p>
        <Link to="/register" className="btn btn--primary btn--sm">
          Create Your Profile
        </Link>
      </div>
    </div>
  );
};

export default PublicProfile;
