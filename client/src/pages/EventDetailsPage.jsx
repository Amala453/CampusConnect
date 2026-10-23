import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRegistration, setUserRegistration] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchEventAndRegistration = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.events.getById(id);
      if (res.success && res.event) {
        setEvent(res.event);
      }

      // If user is a student, check if they are already registered
      if (isAuthenticated && isStudent) {
        try {
          const myRegsRes = await api.registrations.getMy();
          if (myRegsRes.success && myRegsRes.registrations) {
            const found = myRegsRes.registrations.find(
              (r) => r.event && r.event._id === id && r.status === 'registered'
            );
            setUserRegistration(found || null);
          }
        } catch (regErr) {
          console.warn('Could not check user registration status:', regErr.message);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventAndRegistration();
  }, [id, isAuthenticated, isStudent]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    if (!isStudent) {
      setError('Only student accounts are eligible to register for campus events.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.registrations.register(id);
      if (res.success) {
        setSuccess('Congratulations! You have successfully registered for this event.');
        setUserRegistration(res.registration);
        // Refresh event to get updated seat counter
        const eventRes = await api.events.getById(id);
        if (eventRes.success) {
          setEvent(eventRes.event);
        }
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!userRegistration) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.registrations.cancel(userRegistration._id);
      if (res.success) {
        setSuccess('Your registration has been cancelled successfully.');
        setUserRegistration(null);
        setIsCancelModalOpen(false);
        // Refresh event
        const eventRes = await api.events.getById(id);
        if (eventRes.success) {
          setEvent(eventRes.event);
        }
      }
    } catch (err) {
      setError(err.message || 'Cancellation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Event Not Found</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          The requested event may have been removed or does not exist.
        </p>
        <Link to="/events" className="btn btn-primary">
          Back to Events Catalog
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isPast = eventDate < new Date(new Date().setHours(0, 0, 0, 0));
  const isCancelled = event.status === 'cancelled';
  const isFull = event.availableSeats <= 0;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/events" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          &larr; Back to Events Catalog
        </Link>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div style={styles.grid}>
        {/* Main Event Content */}
        <div style={styles.mainCol}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={styles.headerTop}>
              <span className="badge badge-primary">{event.category}</span>
              {isCancelled ? (
                <span className="badge badge-danger">Cancelled</span>
              ) : isPast ? (
                <span className="badge badge-neutral">Past Event</span>
              ) : isFull ? (
                <span className="badge badge-warning">Capacity Reached</span>
              ) : (
                <span className="badge badge-success">Registration Open</span>
              )}
            </div>

            <h1 style={styles.eventTitle}>{event.title}</h1>

            <div style={styles.metaRow}>
              <div style={styles.metaBlock}>
                <span style={styles.metaLabel}>Date & Time</span>
                <span style={styles.metaValue}>{formattedDate}</span>
                <span style={styles.metaSubValue}>{event.time}</span>
              </div>

              <div style={styles.metaBlock}>
                <span style={styles.metaLabel}>Venue / Location</span>
                <span style={styles.metaValue}>{event.venue}</span>
                <span style={styles.metaSubValue}>Campus Premises</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>Event Overview</h3>
              <p style={styles.eventDesc}>{event.description}</p>
            </div>

            {/* Organizer Card snippet */}
            {event.organizer && (
              <div style={styles.organizerSection}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  Organized By
                </h4>
                <div style={styles.organizerCard}>
                  <div style={styles.orgAvatar}>
                    {event.organizer.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                      {event.organizer.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {event.organizer.department || 'Faculty / Club Coordinator'} • {event.organizer.email}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Registration Action Box */}
        <div style={styles.sideCol}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Registration Status</h3>

            {/* Capacity Meter */}
            <div style={styles.sideStats}>
              <div style={styles.statLine}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Capacity:</span>
                <span style={{ fontWeight: '700' }}>{event.capacity} seats</span>
              </div>
              <div style={styles.statLine}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registered:</span>
                <span style={{ fontWeight: '700' }}>{event.registeredCount || 0} students</span>
              </div>
              <div style={styles.statLine}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Available Seats:</span>
                <span style={{ fontWeight: '700', color: isFull ? 'var(--danger)' : 'var(--success)' }}>
                  {event.availableSeats || 0} remaining
                </span>
              </div>
            </div>

            <div style={{ margin: '1.5rem 0' }}>
              {userRegistration ? (
                <div>
                  <div style={styles.registeredBanner}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)' }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--success)' }}>You are registered!</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Registered on {new Date(userRegistration.registeredAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    style={{ width: '100%', marginTop: '1rem' }}
                    onClick={() => setIsCancelModalOpen(true)}
                    disabled={actionLoading}
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : isCancelled ? (
                <div style={{ textAlign: 'center', color: 'var(--danger)', fontWeight: '600' }}>
                  This event has been cancelled by the organizer.
                </div>
              ) : isPast ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>
                  This event took place in the past.
                </div>
              ) : isFull ? (
                <div style={{ textAlign: 'center', color: 'var(--warning)', fontWeight: '600' }}>
                  Event capacity is full. Check back for cancellations.
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={handleRegister}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? 'Processing...'
                    : isAuthenticated && isStudent
                    ? 'Confirm My Registration'
                    : 'Log In as Student to Register'}
                </button>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Registration is verified with your student profile. Attendance will be recorded by the event organizer on-site.
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Registration Cancellation */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Your Registration?"
        message="Are you sure you want to cancel your seat for this event? Your seat will be freed immediately for other students."
        confirmText="Yes, Cancel Seat"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  eventTitle: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    lineHeight: '1.25',
  },
  metaRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.25rem',
    padding: '1.25rem',
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: 'var(--radius-md)',
  },
  metaBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  metaLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  metaValue: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  metaSubValue: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  eventDesc: {
    fontSize: '1rem',
    lineHeight: '1.7',
    color: 'var(--text-main)',
    whiteSpace: 'pre-line',
  },
  organizerSection: {
    marginTop: '2.5rem',
    borderTop: '1px solid var(--border)',
    paddingTop: '1.5rem',
  },
  organizerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  orgAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontWeight: '800',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: 'var(--radius-md)',
  },
  statLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registeredBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'var(--success-light)',
    border: '1px solid var(--success-border)',
    borderRadius: 'var(--radius-md)',
  },
};

export default EventDetailsPage;
