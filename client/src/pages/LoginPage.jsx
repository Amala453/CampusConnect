import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        // Redirect according to role if default route
        if (from === '/') {
          if (res.user.role === 'admin') navigate('/admin');
          else if (res.user.role === 'organizer') navigate('/organizer');
          else navigate('/student');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@campusconnect.edu');
      setPassword('AdminSecure123!');
    } else if (role === 'organizer') {
      setEmail('organizer@campusconnect.edu');
      setPassword('OrganizerSecure123!');
    } else {
      setEmail('student@campusconnect.edu');
      setPassword('StudentSecure123!');
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '520px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ fontSize: '0.95rem' }}>Sign in to manage your campus events or view registrations.</p>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="e.g. yourname@campusconnect.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Fill Section for Reviewers & Students */}
        <div style={styles.demoSection}>
          <span style={styles.demoLabel}>Demo Login Fast-Fill (for Evaluation):</span>
          <div style={styles.demoButtons}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillDemoAccount('student')}
            >
              Student
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillDemoAccount('organizer')}
            >
              Organizer
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillDemoAccount('admin')}
            >
              Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: '700' }}>
            Register as a Student or Organizer
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  demoSection: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border)',
    textAlign: 'center',
  },
  demoLabel: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.65rem',
  },
  demoButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
  },
};

export default LoginPage;
