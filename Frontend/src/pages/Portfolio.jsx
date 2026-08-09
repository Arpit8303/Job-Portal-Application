import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import authService from '../services/authService';
import { MdLocationOn, MdEmail, MdWork } from 'react-icons/md';

const Portfolio = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await authService.getPortfolio(id);
        if (data.success) {
          setUser(data.user);
        }
      } catch (err) {
        setError('Portfolio not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [id]);

  if (loading) return <div className="page-loading"><div className="spinner spinner--lg"></div></div>;
  if (error || !user) return <div className="empty-state"><h3>{error}</h3></div>;

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <div className="portfolio-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h1>{user.name}</h1>
        <p className="portfolio-location"><MdLocationOn /> {user.location}</p>
        <div className="portfolio-contact">
          <a href={`mailto:${user.email}`}><MdEmail /> Contact Me</a>
        </div>
      </div>

      <div className="portfolio-content">
        <div className="portfolio-section">
          <h2>Skills</h2>
          {user.skills && user.skills.length > 0 ? (
            <div className="skills-list">
              {user.skills.map(skill => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="text-muted">No skills listed yet.</p>
          )}
        </div>

        {user.resumeUrl && (
          <div className="portfolio-section">
            <h2>Resume</h2>
            <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              <MdWork /> View Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
