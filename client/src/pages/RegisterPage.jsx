import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    studentId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role, department, studentId } = formData;

    if (!name || !email || !password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await register({
        name,
        email,
        password,
        role,
        department,
        studentId,
      });

      if (res.success) {
        if (role === 'organizer') {
          navigate('/organizer');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '580px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Join CampusConnect</h1>
          <p style={{ fontSize: '0.95rem' }}>Create an account to attend campus events or coordinate student clubs.</p>
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          {/* Role selector */}
          <div className="form-group">
            <label className="form-label">I am registering as:</label>
            <div style={styles.roleSelector}>
              <label
                style={{
                  ...styles.roleOption,
                  ...(formData.role === 'student' ? styles.roleOptionActive : {}),
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <span style={{ fontWeight: '700' }}>Student</span>
                <span style={{ fontSize: '0.75rem', color: formData.role === 'student' ? 'inherit' : 'var(--text-muted)' }}>
                  Browse & Register for Events
                </span>
              </label>

              <label
                style={{
                  ...styles.roleOption,
                  ...(formData.role === 'organizer' ? styles.roleOptionActive : {}),
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="organizer"
                  checked={formData.role === 'organizer'}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <span style={{ fontWeight: '700' }}>Event Organizer</span>
                <span style={{ fontSize: '0.75rem', color: formData.role === 'organizer' ? 'inherit' : 'var(--text-muted)' }}>
                  Create Events & Record Attendance
                </span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="e.g. Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">College Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="e.g. alex@campusconnect.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                className="form-control"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studentId">
                {formData.role === 'student' ? 'Student ID / Roll No' : 'Staff / Club ID'}
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                className="form-control"
                placeholder="e.g. STU-2026-042"
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-control"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '700' }}>
            Log In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  roleSelector: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  roleOption: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.875rem 1rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    transition: 'all 0.15s ease',
  },
  roleOptionActive: {
    borderColor: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
  },
};

export default RegisterPage;
