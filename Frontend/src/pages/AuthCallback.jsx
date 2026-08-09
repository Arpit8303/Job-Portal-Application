/**
 * AuthCallback.jsx — Phase 6
 * Handles redirect from Google OAuth callback.
 * Backend redirects to /auth/callback?token=...&user=...
 * This component picks up those params, stores them, and navigates to dashboard.
 */
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TOKEN_KEY } from '../services/api';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { loginUser }  = useAppContext();

  useEffect(() => {
    const token  = searchParams.get('token');
    const userRaw = searchParams.get('user');
    const error  = searchParams.get('error');

    if (error) {
      toast.error(`Google login failed: ${decodeURIComponent(error)}`);
      navigate('/login');
      return;
    }

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem('jobPortalUser', JSON.stringify(user));
        // Trigger context update without a network call
        window.dispatchEvent(new Event('storage'));
        toast.success(`Welcome, ${user.name}!`);
        navigate('/dashboard', { replace: true });
      } catch {
        toast.error('Login error. Please try again.');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, loginUser]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: '16px',
      background: 'var(--bg-primary)', color: 'var(--text-primary)',
    }}>
      <div className="spinner spinner--lg" />
      <p>Completing Google sign-in…</p>
    </div>
  );
};

export default AuthCallback;
