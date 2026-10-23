import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';

const CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Club Activity',
  'Other',
];

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [selectedEventForCancel, setSelectedEventForCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state for Create / Edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    date: '',
    time: '',
    venue: '',
    capacity: 50,
    status: 'published',
  });
  const [editingEventId, setEditingEventId] = useState(null);

  // Participants roster state
  const [activeEventRoster, setActiveEventRoster] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const fetchOrganizerEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.events.getMyOrganized();
      if (res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch your organized events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Technical',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
      time: '10:00 AM - 01:00 PM',
      venue: 'Seminar Hall 1',
      capacity: 50,
      status: 'published',
    });
    setEditingEventId(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEventId(event._id);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time,
      venue: event.venue,
      capacity: event.capacity,
      status: event.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingEventId) {
        const res = await api.events.update(editingEventId, formData);
        if (res.success) {
          setSuccess('Event updated successfully.');
          setIsEditModalOpen(false);
          await fetchOrganizerEvents();
        }
      } else {
        const res = await api.events.create(formData);
        if (res.success) {
          setSuccess('New event created and published successfully.');
          setIsCreateModalOpen(false);
          await fetchOrganizerEvents();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancelEvent = async () => {
    if (!selectedEventForCancel) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.events.cancel(selectedEventForCancel._id);
      if (res.success) {
        setSuccess(`Event "${selectedEventForCancel.title}" has been marked as cancelled.`);
        setSelectedEventForCancel(null);
        await fetchOrganizerEvents();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel event.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenParticipantsModal = async (event) => {
    setActiveEventRoster(event);
    setIsParticipantsModalOpen(true);
    setRosterLoading(true);

    try {
      const res = await api.registrations.getParticipants(event._id);
      if (res.success) {
        setParticipants(res.participants || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load participant list.');
    } finally {
      setRosterLoading(false);
    }
  };

  const handleToggleAttendance = async (registrationId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await api.registrations.markAttendance(registrationId, newStatus);
      if (res.success) {
        // Update local roster list
        setParticipants((prev) =>
          prev.map((p) => (p._id === registrationId ? { ...p, attended: newStatus } : p))
        );
        // Refresh event card metrics
        await fetchOrganizerEvents();
      }
    } catch (err) {
      alert(`Attendance error: ${err.message}`);
    }
  };

  // Metrics summary
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0);
  const totalAttended = events.reduce((acc, curr) => acc + (curr.attendedCount || 0), 0);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Organizer Header */}
      <div style={styles.headerCard}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem' }}>Organizer Studio</h1>
            <span className="badge badge-warning">Authorized Organizer</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {user?.name} • {user?.department || 'Faculty / Club Coordinator'} • {user?.email}
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          + Create New Event
        </button>
      </div>

      {/* Organizer Stats Cards */}
      <div className="grid grid-cols-3" style={{ margin: '2rem 0' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            My Created Events
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>
            {totalEvents}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Published and draft events</div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Total Registrations
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {totalRegistrations}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Students reserved across all events</div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Attendance Verified
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', marginTop: '0.25rem' }}>
            {totalAttended}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Marked present on-site</div>
        </div>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Events Table */}
      <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Manage Your Events</h2>

      {loading ? (
        <LoadingSpinner message="Loading your events roster..." />
      ) : events.length > 0 ? (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Capacity & Roster</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => {
                const isCancelled = ev.status === 'cancelled';
                const percent = Math.min(100, Math.round(((ev.registeredCount || 0) / ev.capacity) * 100));

                return (
                  <tr key={ev._id}>
                    <td>
                      <strong>{ev.title}</strong>
                    </td>
                    <td>
                      <span className="badge badge-primary">{ev.category}</span>
                    </td>
                    <td>
                      <div>{new Date(ev.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.time}</div>
                    </td>
                    <td>{ev.venue}</td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                        {ev.registeredCount || 0} / {ev.capacity} ({percent}%)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                        {ev.attendedCount || 0} Attended
                      </div>
                    </td>
                    <td>
                      {isCancelled ? (
                        <span className="badge badge-danger">Cancelled</span>
                      ) : ev.status === 'draft' ? (
                        <span className="badge badge-warning">Draft</span>
                      ) : (
                        <span className="badge badge-success">Published</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenParticipantsModal(ev)}
                          title="View participants & mark attendance"
                        >
                          👥 Roster ({ev.registeredCount || 0})
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEditModal(ev)}
                          disabled={isCancelled}
                          title="Edit event details"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setSelectedEventForCancel(ev)}
                          disabled={isCancelled}
                          title="Cancel event"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No Events Created Yet"
          description="You haven't created any events yet. Click below to publish your first college event or workshop."
          actionLabel="+ Create Event Now"
          onAction={handleOpenCreateModal}
        />
      )}

      {/* Create / Edit Event Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="modal-overlay" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.4rem' }}>
              {editingEventId ? 'Edit Event Details' : 'Create New Campus Event'}
            </h3>

            <form onSubmit={handleSaveEvent}>
              <div className="form-group">
                <label className="form-label" htmlFor="ev-title">Event Title *</label>
                <input
                  id="ev-title"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Annual Autonomous Robotics Hackathon"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="ev-cat">Category *</label>
                  <select
                    id="ev-cat"
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ev-cap">Max Seat Capacity *</label>
                  <input
                    id="ev-cap"
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="ev-date">Date *</label>
                  <input
                    id="ev-date"
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ev-time">Time Schedule *</label>
                  <input
                    id="ev-time"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 10:00 AM - 01:00 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ev-venue">Venue / Room *</label>
                <input
                  id="ev-venue"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mechanical Seminar Hall 2, Ground Floor"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ev-desc">Description & Instructions *</label>
                <textarea
                  id="ev-desc"
                  className="form-control"
                  placeholder="Provide an overview, guidelines, prerequisites, and what students will gain."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ev-status">Publication Status</label>
                <select
                  id="ev-status"
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="published">Published (Visible to students immediately)</option>
                  <option value="draft">Draft (Private, not open for registration)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : editingEventId ? 'Update Event' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants & Attendance Modal */}
      {isParticipantsModalOpen && activeEventRoster && (
        <div className="modal-overlay" onClick={() => setIsParticipantsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem' }}>Participant Roster & Attendance</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Event: <strong>{activeEventRoster.title}</strong>
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsParticipantsModalOpen(false)}
              >
                &times; Close
              </button>
            </div>

            {rosterLoading ? (
              <LoadingSpinner message="Loading participant list..." />
            ) : participants.length > 0 ? (
              <div>
                <div style={styles.rosterSummaryBar}>
                  <span>Total Registered: <strong>{participants.filter(p => p.status === 'registered').length}</strong></span>
                  <span>Marked Present: <strong style={{ color: 'var(--success)' }}>{participants.filter(p => p.status === 'registered' && p.attended).length}</strong></span>
                </div>

                <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Student ID</th>
                        <th>Email / Dept</th>
                        <th>Registration Status</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((reg) => {
                        const student = reg.student;
                        const isCancelled = reg.status === 'cancelled';

                        return (
                          <tr key={reg._id}>
                            <td>
                              <strong>{student ? student.name : 'Unknown Student'}</strong>
                            </td>
                            <td>{student?.studentId || 'N/A'}</td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>{student?.email}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student?.department || 'Department N/A'}</div>
                            </td>
                            <td>
                              {isCancelled ? (
                                <span className="badge badge-danger">Cancelled</span>
                              ) : (
                                <span className="badge badge-success">Active</span>
                              )}
                            </td>
                            <td>
                              {isCancelled ? (
                                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Not Applicable</span>
                              ) : (
                                <button
                                  type="button"
                                  className={`btn btn-sm ${reg.attended ? 'btn-primary' : 'btn-secondary'}`}
                                  onClick={() => handleToggleAttendance(reg._id, reg.attended)}
                                  title="Click to toggle attendance"
                                >
                                  {reg.attended ? '✓ Present' : 'Mark Present'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Registrations Yet"
                description="No students have registered for this event yet. As students sign up, they will appear here with full attendance controls."
              />
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Event Cancellation */}
      <ConfirmModal
        isOpen={!!selectedEventForCancel}
        title="Confirm Event Cancellation"
        message={`Are you sure you want to cancel "${selectedEventForCancel?.title}"? The event will be marked as cancelled and students will be notified.`}
        confirmText="Yes, Cancel Event"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleConfirmCancel}
        onCancel={() => setSelectedEventForCancel(null)}
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
  rosterSummaryBar: {
    display: 'flex',
    gap: '2rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
};

export default OrganizerDashboard;
