import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  MdPerson, MdEmail, MdLocationOn, MdSecurity, MdQrCode2,
  MdPublic, MdShare, MdVerified, MdContentCopy, MdCheck,
} from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

// ── 2FA Section ───────────────────────────────────────────────────────────────
const TwoFactorSection = ({ user }) => {
  const [step, setStep]       = useState('idle'); // idle | setup | verify | disable
  const [qrCode, setQrCode]   = useState('');
  const [secret, setSecret]   = useState('');
  const [token, setToken]     = useState('');
  const [loading, setLoading] = useState(false);
  const is2FAEnabled = user?.twoFactorEnabled;

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/2fa/setup');
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('setup');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token.trim()) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      await api.post('/auth/2fa/verify', { token });
      toast.success('2FA enabled successfully! 🔐');
      setStep('idle');
      setToken('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!token.trim()) { toast.error('Enter your current 2FA code to disable'); return; }
    setLoading(true);
    try {
      await api.post('/auth/2fa/disable', { token });
      toast.success('2FA disabled');
      setStep('idle');
      setToken('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <h3 className="profile-section__title">
        <MdSecurity /> Two-Factor Authentication
        {is2FAEnabled && <span className="profile-section__badge profile-section__badge--on">Enabled</span>}
      </h3>

      {step === 'idle' && (
        <>
          <p className="profile-section__desc">
            {is2FAEnabled
              ? 'Your account is protected with TOTP-based 2FA.'
              : 'Add an extra layer of security with a Time-based One-Time Password (TOTP) app.'}
          </p>
          {!is2FAEnabled
            ? <button id="enable-2fa-btn" className="btn btn--primary btn--sm" onClick={handleSetup} disabled={loading}>
                {loading ? <span className="spinner" /> : <MdQrCode2 />} Enable 2FA
              </button>
            : <button id="disable-2fa-btn" className="btn btn--danger btn--sm" onClick={() => setStep('disable')}>
                Disable 2FA
              </button>
          }
        </>
      )}

      {step === 'setup' && (
        <div className="twofa-setup">
          <ol className="twofa-setup__steps">
            <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
            <li>Scan this QR code:</li>
          </ol>
          {qrCode && <img src={qrCode} alt="2FA QR Code" className="twofa-setup__qr" />}
          <details className="twofa-setup__manual">
            <summary>Can't scan? Enter manually</summary>
            <code className="twofa-setup__secret">{secret}</code>
          </details>
          <div className="twofa-setup__verify">
            <input
              id="twofa-token-input"
              className="twofa-setup__input"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
            <button className="btn btn--primary btn--sm" onClick={handleVerify} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Verify & Activate'}
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => setStep('idle')}>Cancel</button>
          </div>
        </div>
      )}

      {step === 'disable' && (
        <div className="twofa-setup__verify">
          <p>Enter your current 2FA code to disable:</p>
          <input
            id="twofa-disable-input"
            className="twofa-setup__input"
            placeholder="6-digit code"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <button className="btn btn--danger btn--sm" onClick={handleDisable} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Confirm Disable'}
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => setStep('idle')}>Cancel</button>
        </div>
      )}
    </div>
  );
};

// ── Public Profile Section ────────────────────────────────────────────────────
const PublicProfileSection = ({ user, onUpdate }) => {
  const [username, setUsername]   = useState(user?.username || '');
  const [isPublic, setIsPublic]   = useState(user?.isPublic || false);
  const [saving, setSaving]       = useState(false);
  const [copied, setCopied]       = useState(false);

  const shareUrl = `${window.location.origin}/profile/${username}`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/public-settings', { username, isPublic });
      toast.success('Public profile updated!');
      onUpdate && onUpdate(data.user, data.token);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="profile-section">
      <h3 className="profile-section__title">
        <MdPublic /> Public Profile
      </h3>
      <p className="profile-section__desc">
        Share a public resume-style page with recruiters. Your skills, location, and resume link will be visible.
      </p>

      <div className="pub-settings">
        <div className="pub-settings__toggle-row">
          <label className="pub-settings__toggle-label" htmlFor="public-toggle">
            Make profile public
          </label>
          <button
            id="public-toggle"
            className={`toggle-btn ${isPublic ? 'toggle-btn--on' : ''}`}
            onClick={() => setIsPublic((p) => !p)}
            role="switch"
            aria-checked={isPublic}
          >
            <span className="toggle-btn__thumb" />
          </button>
        </div>

        <div className="pub-settings__username-row">
          <label className="alert-form__label">Username (profile URL)</label>
          <div className="pub-settings__username-input-wrap">
            <span className="pub-settings__prefix">{window.location.host}/profile/</span>
            <input
              id="username-input"
              className="alert-form__input pub-settings__username-input"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              maxLength={40}
            />
          </div>
        </div>

        {isPublic && username.length >= 3 && (
          <div className="pub-settings__share-row">
            <span className="pub-settings__share-url">{shareUrl}</span>
            <button className="pub-settings__copy-btn" onClick={handleCopy} title="Copy link">
              {copied ? <MdCheck style={{ color: '#22c55e' }} /> : <MdContentCopy />}
            </button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="pub-settings__preview-btn">
              <MdShare /> Preview
            </a>
          </div>
        )}

        <button id="save-public-settings-btn" className="btn btn--primary btn--sm" onClick={handleSave} disabled={saving}>
          {saving ? <span className="spinner" /> : <MdVerified />} Save Settings
        </button>
      </div>
    </div>
  );
};

// ── Google OAuth hint ─────────────────────────────────────────────────────────
const GoogleAuthSection = ({ user }) => {
  const hasGoogle = !!user?.googleId;
  const handleGoogleLink = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/google`;
  };

  return (
    <div className="profile-section">
      <h3 className="profile-section__title">
        <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google Account
        {hasGoogle && <span className="profile-section__badge profile-section__badge--on">Linked</span>}
      </h3>
      {hasGoogle
        ? <p className="profile-section__desc">✅ Your Google account is linked. You can sign in with Google.</p>
        : <>
            <p className="profile-section__desc">Link your Google account for one-click sign-in.</p>
            <button id="link-google-btn" className="btn btn--ghost btn--sm" onClick={handleGoogleLink}>
              Link Google Account
            </button>
          </>
      }
    </div>
  );
};

// ── Main Profile Page ─────────────────────────────────────────────────────────
const Profile = () => {
  const { auth, updateProfile } = useAppContext();
  const [formData, setFormData] = useState({
    name:        auth.user?.name || '',
    email:       auth.user?.email || '',
    location:    auth.user?.location || '',
    skills:      auth.user?.skills ? auth.user.skills.join(', ') : '',
    resumeUrl:   auth.user?.resumeUrl || '',
    monthlyGoal: auth.user?.monthlyGoal || 20,
  });
  const [errors, setErrors]   = useState({});
  const [isLoading, setLoad]  = useState(false);

  const validate = () => {
    const e = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim())     e.name     = 'Name is required';
    if (!formData.email)           e.email    = 'Email is required';
    else if (!emailRx.test(formData.email)) e.email = 'Invalid email';
    if (!formData.location.trim()) e.location = 'Location is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoad(true);
    const submitData = { ...formData };
    submitData.skills      = submitData.skills.split(',').map((s) => s.trim()).filter(Boolean);
    submitData.monthlyGoal = Number(submitData.monthlyGoal);
    await updateProfile(submitData);
    setLoad(false);
  };

  const handlePublicUpdate = (updatedUser, token) => {
    if (token) localStorage.setItem(
      auth?.tokenKey || 'jobPortalToken', token
    );
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account details and security settings</p>
      </div>

      {/* ── Basic Info ───────────────────────────────────────────────────── */}
      <div className="profile-card">
        <div className="profile-card__avatar">
          <div className="profile-avatar">
            {auth.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h3>{auth.user?.name}</h3>
          <p>{auth.user?.email}</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group" style={{ flex: '1 1 100%' }}>
              <label htmlFor="name">Full Name *</label>
              <div className="input-wrapper">
                <MdPerson className="input-icon" />
                <input id="name" name="name" type="text" value={formData.name}
                  onChange={handleChange} placeholder="Full name"
                  className={errors.name ? 'input--error' : ''} />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <div className="input-wrapper">
              <MdEmail className="input-icon" />
              <input id="email" name="email" type="email" value={formData.email}
                onChange={handleChange} placeholder="Email address"
                className={errors.email ? 'input--error' : ''} />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <div className="input-wrapper">
              <MdLocationOn className="input-icon" />
              <input id="location" name="location" type="text" value={formData.location}
                onChange={handleChange} placeholder="Your location"
                className={errors.location ? 'input--error' : ''} />
            </div>
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="skills">Skills (comma separated)</label>
            <div className="input-wrapper">
              <input id="skills" name="skills" type="text" value={formData.skills}
                onChange={handleChange} placeholder="React, Node.js, Python…" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="resumeUrl">Resume URL</label>
              <div className="input-wrapper">
                <input id="resumeUrl" name="resumeUrl" type="url" value={formData.resumeUrl}
                  onChange={handleChange} placeholder="https://link-to-resume.com" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="monthlyGoal">Monthly Goal</label>
              <div className="input-wrapper">
                <input id="monthlyGoal" name="monthlyGoal" type="number"
                  value={formData.monthlyGoal} onChange={handleChange} min="1" />
              </div>
            </div>
          </div>
          <button type="submit" id="save-profile-btn" className="btn btn--primary btn--full" disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : null}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* ── Phase 6 Sections ─────────────────────────────────────────────── */}
      <div className="profile-extras">
        <GoogleAuthSection user={auth.user} />
        <TwoFactorSection user={auth.user} />
        <PublicProfileSection user={auth.user} onUpdate={handlePublicUpdate} />
      </div>
    </div>
  );
};

export default Profile;
