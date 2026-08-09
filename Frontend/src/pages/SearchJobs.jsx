import { useState, useEffect, useRef } from 'react';
import { MdSearch, MdLocationOn, MdAttachMoney, MdWork, MdTune, MdInsights } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

const SearchJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [workType, setWorkType] = useState('all');
  const [remote, setRemote] = useState(false);
  const [sort, setSort] = useState('latest');

  // Insights
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const debounceRef = useRef(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (location) params.append('location', location);
      if (salaryMin) params.append('salaryMin', salaryMin);
      if (workType !== 'all') params.append('workType', workType);
      if (remote) params.append('remote', 'true');
      params.append('sort', sort);

      const { data } = await api.get(`/jobs/search?${params.toString()}`);
      setJobs(data.jobs);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to search jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('role', q);
      if (location) params.append('location', location);
      
      const { data } = await api.get(`/jobs/salary-insights?${params.toString()}`);
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchJobs();
      fetchInsights();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, location, salaryMin, workType, remote, sort]);

  return (
    <div className="search-page">
      <div className="page-header">
        <h1>Discover Jobs</h1>
        <p>Search global jobs, track salaries, and find your next role.</p>
      </div>

      <div className="search-container" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* ── Filters Sidebar ──────────────────────────────────────────────── */}
        <aside className="search-sidebar" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', position: 'sticky', top: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: 'bold' }}>
            <MdTune /> Filters
          </div>

          <div className="form-group">
            <label>Keyword / Title</label>
            <div className="input-wrapper">
              <MdSearch className="input-icon" />
              <input type="text" placeholder="e.g. React Developer" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <div className="input-wrapper">
              <MdLocationOn className="input-icon" />
              <input type="text" placeholder="e.g. Mumbai" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Min Salary (₹)</label>
            <div className="input-wrapper">
              <MdAttachMoney className="input-icon" />
              <input type="number" placeholder="e.g. 50000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Work Type</label>
            <select value={workType} onChange={(e) => setWorkType(e.target.value)} className="alert-form__input">
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <input type="checkbox" id="remote" checked={remote} onChange={(e) => setRemote(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <label htmlFor="remote" style={{ margin: 0, cursor: 'pointer' }}>Remote Only</label>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="search-main" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Salary Insights Widget */}
          {insights && (insights.byRole?.length > 0 || insights.overall?.avgSalary) && (
            <div className="insights-widget" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.05))', padding: '20px', borderRadius: '14px', border: '1px solid rgba(124,58,237,0.2)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px', fontSize: '15px' }}>
                <MdInsights style={{ color: 'var(--accent)' }} /> Salary Insights {q ? `for "${q}"` : ''}
              </h3>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-secondary)' }}>Average Salary</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-light)' }}>
                    ₹{Math.round(insights.overall?.avgSalary || 0).toLocaleString()}
                  </p>
                </div>
                {insights.byRole?.slice(0, 2).map((role, idx) => (
                  <div key={idx} style={{ flex: 1, minWidth: '150px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {role.role} Avg
                    </p>
                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                      ₹{Math.round(role.avgSalary).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Found {total} jobs</h2>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
              <option value="latest">Latest</option>
              {q && <option value="relevance">Relevance</option>}
              <option value="salary-high">Salary: High to Low</option>
              <option value="salary-low">Salary: Low to High</option>
            </select>
          </div>

          {loading ? (
            <div className="spinner spinner--lg" style={{ alignSelf: 'center', margin: '40px 0' }} />
          ) : jobs.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <div className="empty-state__icon">🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="search-results-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {jobs.map(job => (
                <div key={job._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }} className="hover-card">
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--text-primary)' }}>{job.position}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{job.company}</p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MdLocationOn /> {job.workLocation} {job.isRemote && '(Remote)'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MdWork /> {job.workType}</span>
                      {job.salary && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-light)' }}><MdAttachMoney /> ₹{job.salary.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchJobs;
