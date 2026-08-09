import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import './Auth.css';

const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')}/api/v1/auth/google`;

const Login = () => {
  const { loginUser } = useAppContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) e.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) e.email = 'Invalid email format';
    if (!formData.password) e.password = 'Password is required';
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (ev) => {
    setFormData({ ...formData, [ev.target.name]: ev.target.value });
    if (errors[ev.target.name]) setErrors({ ...errors, [ev.target.name]: '' });
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError('');
    const result = await loginUser(formData.email, formData.password);
    setIsLoading(false);
    if (result?.success) navigate('/dashboard');
    else setApiError(result?.message || 'Login failed');
  };

  return (
    <div className="auth-page">
      <div className="auth-split">

        {/* ── Left purple panel ── */}
        <div className="auth-left">
          <div className="auth-left__content">
            <div className="auth-left__logo">
              <div className="auth-left__logo-icon">💼</div>
              <span className="auth-left__logo-text">JobLedger</span>
            </div>
            <h2 className="auth-left__heading">Welcome<br />Back!</h2>
            <p className="auth-left__sub">
              Track your job applications, get AI-powered career advice, and land your dream job.
            </p>
          </div>
        </div>

        {/* ── Right dark form panel ── */}
        <div className="auth-right">
          <h1>Sign In</h1>

          {apiError && <div className="auth-alert">{apiError}</div>}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="auth-field">
              <div className="auth-input-wrap">
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  className={`auth-input${errors.email ? ' auth-input--error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  autoComplete="email"
                />
                <MdEmail />
              </div>
              {errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  className={`auth-input${errors.password ? ' auth-input--error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
                <MdLock style={{ right: '40px' }} />
              </div>
              {errors.password && <span className="auth-field-error">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading} id="login-submit">
              {isLoading && <span className="auth-spinner" />}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider"><span>or continue with</span></div>

          {/* Google OAuth */}
          <button
            type="button"
            className="auth-google-btn"
            id="login-google"
            onClick={() => window.location.href = GOOGLE_AUTH_URL}
          >
            <svg className="auth-google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="auth-footer">
            Don't have an account?<Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
