import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'history'
  const [selectedRegToCancel, setSelectedRegToCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.registrations.getMy();
      if (res.success) {
        setRegistrations(res.registrations || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const handleCancelRegistration = async () => {
    if (!selectedRegToCancel) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.registrations.cancel(selectedRegToCancel._id);
      if (res.success) {
        setSuccess('Your registration has been successfully cancelled.');
        setSelectedRegToCancel(null);
        await fetchMyRegistrations();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel registration.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter registrations by status and date
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const activeRegistrations = registrations.filter(
    (r) => r.status === 'registered' && r.event && new Date(r.event.date) >= now
  );

  const pastAndCancelledRegistrations = registrations.filter(
    (r) =>
      r.status === 'cancelled' ||
      (r.status === 'registered' && r.event && new Date(r.event.date) < now)
  );

  const attendedCount = registrations.filter((r) => r.status === 'registered' && r.attended).length;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Student Welcome Header */}
      <div style={styles.headerCard}>
        <div style={styles.userProfile}>
          <div style={styles.avatar}>{user?.name?.charAt(0) || 'S'}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.75rem' }}>Welcome, {user?.name}</h1>
              <span className="badge badge-primary">Student</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {user?.department || 'Department Student'} • ID: {user?.studentId || 'N/A'} • {user?.email}
            </p>
          </div>
        </div>

        <Link to="/events" className="btn btn-primary">
          Discover More Events &rarr;
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3" style={{ margin: '2rem 0' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Active Registrations
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>
            {activeRegistrations.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confirmed upcoming seats</div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Verified Attendance
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', marginTop: '0.25rem' }}>
            {attendedCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recorded by event organizers</div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Total Registered
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {registrations.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lifetime registrations</div>
        </div>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'upcoming' ? styles.tabBtnActive : {}),
          }}
        >
          Upcoming Confirmed Events ({activeRegistrations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'history' ? styles.tabBtnActive : {}),
          }}
        >
          History & Past Events ({pastAndCancelledRegistrations.length})
        </button>
      </div>

      {/* Registrations List */}
      {loading ? (
        <LoadingSpinner message="Loading your event schedule..." />
      ) : activeTab === 'upcoming' ? (
        activeRegistrations.length > 0 ? (
          <div className="grid grid-cols-2">
            {activeRegistrations.map((reg) => {
              const ev = reg.event;
              if (!ev) return null;
              const evDate = new Date(ev.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={reg._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge badge-primary">{ev.category}</span>
                      <span className="badge badge-success">Seat Confirmed</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>
                      <Link to={`/events/${ev._id}`} style={{ color: 'var(--text-main)' }}>
                        {ev.title}
                      </Link>
                    </h3>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                      <div>📅 <strong>{evDate}</strong> • {ev.time}</div>
                      <div>📍 <strong>{ev.venue}</strong></div>
                      <div>👤 Organizer: {ev.organizer?.name || 'College Club'}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Registered on {new Date(reg.registeredAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => setSelectedRegToCancel(reg)}
                    >
                      Cancel Registration
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No Upcoming Registrations"
            description="You have not registered for any upcoming events yet. Discover events happening on campus and reserve your seat!"
            actionLabel="Explore Events Catalog"
            actionLink="/events"
          />
        )
      ) : (
        pastAndCancelledRegistrations.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Attendance</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {pastAndCancelledRegistrations.map((reg) => {
                  const ev = reg.event;
                  const isCancelled = reg.status === 'cancelled';
                  return (
                    <tr key={reg._id}>
                      <td>
                        <strong>{ev ? ev.title : 'Event details unavailable'}</strong>
                      </td>
                      <td>{ev?.category || 'N/A'}</td>
                      <td>
                        {ev ? `${new Date(ev.date).toLocaleDateString()} (${ev.time})` : 'N/A'}
                      </td>
                      <td>
                        {isCancelled ? (
                          <span className="badge badge-danger">Cancelled</span>
                        ) : (
                          <span className="badge badge-neutral">Completed</span>
                        )}
                      </td>
                      <td>
                        {isCancelled ? (
                          <span style={{ color: 'var(--text-light)' }}>-</span>
                        ) : reg.attended ? (
                          <span className="badge badge-success">Present</span>
                        ) : (
                          <span className="badge badge-warning">Absent</span>
                        )}
                      </td>
                      <td>{new Date(reg.registeredAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Past Event Records"
            description="You do not have any past or cancelled event records."
          />
        )
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!selectedRegToCancel}
        title="Confirm Registration Cancellation"
        message={`Are you sure you want to cancel your seat for "${selectedRegToCancel?.event?.title}"?`}
        confirmText="Yes, Cancel My Seat"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleCancelRegistration}
        onCancel={() => setSelectedRegToCancel(null)}
      />
    </div>
  );
};

const styles = {
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontWeight: '800',
    fontSize: '1.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    display: 'flex',
    gap: '1rem',
    borderBottom: '2px solid var(--border)',
    marginBottom: '2rem',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '0.75rem 0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    position: 'relative',
    marginBottom: '-2px',
  },
  tabBtnActive: {
    color: 'var(--primary)',
    borderBottom: '2px solid var(--primary)',
  },
};

export default StudentDashboard;
