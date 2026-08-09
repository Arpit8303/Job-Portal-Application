import { useState, useEffect } from 'react';
import {
  MdNotifications, MdAdd, MdDelete, MdEdit, MdClose,
  MdToggleOn, MdToggleOff, MdSearch, MdLocationOn, MdWork,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import recommendationService from '../services/recommendationService';

// ─── Work type options ─────────────────────────────────────────────────────────
const WORK_TYPES = ['all', 'full-time', 'part-time', 'internship', 'contract'];

// ─── Alert Form (create / edit) ───────────────────────────────────────────────
const AlertForm = ({ initial, onSave, onCancel }) => {
  const [name, setName]         = useState(initial?.name || '');
  const [keywords, setKeywords] = useState((initial?.filters?.keywords || []).join(', '));
  const [location, setLocation] = useState(initial?.filters?.location || '');
  const [workType, setWorkType] = useState(initial?.filters?.workType || 'all');
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const kwList = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (!kwList.length && !location && workType === 'all') {
      toast.error('Add at least one filter (keywords, location, or work type)');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name || 'My Job Alert',
        filters: { keywords: kwList, location, workType },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="alert-form" onSubmit={handleSubmit}>
      <div className="alert-form__field">
        <label className="alert-form__label">Alert Name</label>
        <input
          id="alert-name-input"
          className="alert-form__input"
          placeholder="e.g. React Developer Jobs"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
        />
      </div>
      <div className="alert-form__field">
        <label className="alert-form__label">
          <MdSearch /> Keywords <small>(comma-separated)</small>
        </label>
        <input
          id="alert-keywords-input"
          className="alert-form__input"
          placeholder="react, frontend, javascript"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
      </div>
      <div className="alert-form__row">
        <div className="alert-form__field alert-form__field--half">
          <label className="alert-form__label">
            <MdLocationOn /> Location
          </label>
          <input
            id="alert-location-input"
            className="alert-form__input"
            placeholder="Mumbai, Remote…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="alert-form__field alert-form__field--half">
          <label className="alert-form__label">
            <MdWork /> Work Type
          </label>
          <select
            id="alert-worktype-select"
            className="alert-form__input"
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
          >
            {WORK_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="alert-form__actions">
        <button type="submit" id="alert-save-btn" className="btn btn--primary" disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Update Alert' : 'Create Alert'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ─── Single alert card ─────────────────────────────────────────────────────────
const AlertCard = ({ alert, onEdit, onDelete, onToggle }) => (
  <div className={`alert-card ${alert.active ? '' : 'alert-card--inactive'}`}>
    <div className="alert-card__header">
      <div className="alert-card__title-row">
        <MdNotifications className="alert-card__icon" />
        <h4 className="alert-card__name">{alert.name}</h4>
        {!alert.active && <span className="alert-card__paused-badge">Paused</span>}
      </div>
      <div className="alert-card__actions">
        <button
          className="alert-card__icon-btn"
          onClick={() => onToggle(alert)}
          title={alert.active ? 'Pause alert' : 'Resume alert'}
        >
          {alert.active ? <MdToggleOn style={{ color: '#7c3aed', fontSize: '22px' }} />
                        : <MdToggleOff style={{ fontSize: '22px' }} />}
        </button>
        <button className="alert-card__icon-btn" onClick={() => onEdit(alert)} title="Edit">
          <MdEdit />
        </button>
        <button className="alert-card__icon-btn alert-card__icon-btn--delete" onClick={() => onDelete(alert._id)} title="Delete">
          <MdDelete />
        </button>
      </div>
    </div>
    <div className="alert-card__filters">
      {alert.filters?.keywords?.length > 0 && (
        <span className="alert-card__filter-chip">
          <MdSearch /> {alert.filters.keywords.join(', ')}
        </span>
      )}
      {alert.filters?.location && (
        <span className="alert-card__filter-chip">
          <MdLocationOn /> {alert.filters.location}
        </span>
      )}
      {alert.filters?.workType && alert.filters.workType !== 'all' && (
        <span className="alert-card__filter-chip">
          <MdWork /> {alert.filters.workType}
        </span>
      )}
    </div>
  </div>
);

// ─── Main JobAlerts panel ──────────────────────────────────────────────────────
const JobAlerts = () => {
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEdit]   = useState(null); // alert being edited

  const load = async () => {
    setLoading(true);
    try {
      const data = await recommendationService.getJobAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      toast.error('Failed to load job alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload) => {
    try {
      const data = await recommendationService.createJobAlert(payload);
      setAlerts((prev) => [data.alert, ...prev]);
      setShowForm(false);
      toast.success('Job alert created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create alert');
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const data = await recommendationService.updateJobAlert(editTarget._id, payload);
      setAlerts((prev) => prev.map((a) => (a._id === editTarget._id ? data.alert : a)));
      setEdit(null);
      toast.success('Alert updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update alert');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job alert?')) return;
    try {
      await recommendationService.deleteJobAlert(id);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      toast.success('Alert deleted');
    } catch (err) {
      toast.error('Failed to delete alert');
    }
  };

  const handleToggle = async (alert) => {
    try {
      const data = await recommendationService.updateJobAlert(alert._id, { active: !alert.active });
      setAlerts((prev) => prev.map((a) => (a._id === alert._id ? data.alert : a)));
      toast.success(data.alert.active ? 'Alert resumed' : 'Alert paused');
    } catch (err) {
      toast.error('Failed to update alert');
    }
  };

  return (
    <section className="job-alerts-section">
      <div className="job-alerts-section__header">
        <div>
          <h2 className="job-alerts-section__title">
            <MdNotifications className="job-alerts-section__icon" /> Job Alerts
          </h2>
          <p className="job-alerts-section__subtitle">
            Get notified by email &amp; in-app when new matching jobs are posted.
          </p>
        </div>
        {!showForm && !editTarget && (
          <button
            id="create-alert-btn"
            className="btn btn--primary"
            onClick={() => setShowForm(true)}
            disabled={alerts.length >= 5}
            title={alerts.length >= 5 ? 'Max 5 alerts allowed' : 'Create new alert'}
          >
            <MdAdd /> New Alert
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="alert-form-wrapper">
          <h3 className="alert-form__heading">New Job Alert</h3>
          <AlertForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Edit form */}
      {editTarget && (
        <div className="alert-form-wrapper">
          <h3 className="alert-form__heading">Edit Alert</h3>
          <AlertForm
            initial={editTarget}
            onSave={handleUpdate}
            onCancel={() => setEdit(null)}
          />
        </div>
      )}

      {/* Alert list */}
      {loading ? (
        <div className="job-alerts-section__loading">
          {[1, 2].map((i) => <div key={i} className="rec-skeleton" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="rec-section__empty">
          <MdNotifications style={{ fontSize: '40px', opacity: 0.2 }} />
          <p>No job alerts yet.</p>
          <small>Create an alert and we'll notify you when matching jobs are posted.</small>
        </div>
      ) : (
        <div className="job-alerts-section__list">
          {alerts.map((alert) => (
            <AlertCard
              key={alert._id}
              alert={alert}
              onEdit={(a) => { setEdit(a); setShowForm(false); }}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
          {alerts.length >= 5 && (
            <p className="job-alerts-section__limit">
              Maximum 5 alerts reached. Pause or delete one to add more.
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default JobAlerts;
