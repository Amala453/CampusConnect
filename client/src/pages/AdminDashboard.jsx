import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'events'

  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, eventsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers({ search: userSearch, role: userRoleFilter !== 'All' ? userRoleFilter : '' }),
        api.admin.getAllEvents(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (eventsRes.success) setEvents(eventsRes.events || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userRoleFilter]);

  const handleSearchUsers = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    if (targetUserId === user?.id && newRole !== 'admin') {
      setError('Self-lockout protection: You cannot demote your own admin account.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.admin.updateUserRole(targetUserId, newRole);
      if (res.success) {
        setSuccess(res.message || 'User role updated.');
        await fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Role update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedUserForStatus) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.admin.toggleUserStatus(selectedUserForStatus._id);
      if (res.success) {
        setSuccess(res.message || 'User status updated.');
        setSelectedUserForStatus(null);
        await fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Status toggle failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModerateEvent = async (eventId, newStatus) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.admin.moderateEvent(eventId, { status: newStatus });
      if (res.success) {
        setSuccess(`Event status changed to ${newStatus}.`);
        await fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Moderation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Admin Header */}
      <div style={styles.headerCard}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem' }}>Campus Administration Console</h1>
            <span className="badge badge-danger">Super Admin</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {user?.name} • Platform Oversight • {user?.email}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
            ↻ Refresh Data
          </button>
        </div>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{ ...styles.tabBtn, ...(activeTab === 'overview' ? styles.tabBtnActive : {}) }}
        >
          Platform Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{ ...styles.tabBtn, ...(activeTab === 'users' ? styles.tabBtnActive : {}) }}
        >
          User Accounts & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          style={{ ...styles.tabBtn, ...(activeTab === 'events' ? styles.tabBtnActive : {}) }}
        >
          All Events Oversight ({events.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching campus intelligence..." />
      ) : activeTab === 'overview' ? (
        <div>
          {/* Key Stat Counters */}
          <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={styles.statLabel}>Total Platform Users</div>
              <div style={{ ...styles.statNum, color: 'var(--primary)' }}>
                {stats?.users?.total || 0}
              </div>
              <div style={styles.statSub}>
                {stats?.users?.students || 0} Students • {stats?.users?.organizers || 0} Organizers
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={styles.statLabel}>Total Campus Events</div>
              <div style={{ ...styles.statNum, color: 'var(--text-main)' }}>
                {stats?.events?.total || 0}
              </div>
              <div style={styles.statSub}>
                {stats?.events?.published || 0} Published • {stats?.events?.cancelled || 0} Cancelled
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={styles.statLabel}>Active Registrations</div>
              <div style={{ ...styles.statNum, color: 'var(--secondary)' }}>
                {stats?.registrations?.active || 0}
              </div>
              <div style={styles.statSub}>
                {stats?.registrations?.cancelled || 0} Voluntary Cancellations
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={styles.statLabel}>Overall Attendance Rate</div>
              <div style={{ ...styles.statNum, color: 'var(--success)' }}>
                {stats?.registrations?.attendanceRate || 0}%
              </div>
              <div style={styles.statSub}>
                {stats?.registrations?.attended || 0} Students Verified Present
              </div>
            </div>
          </div>

          {/* Quick summaries */}
          <div className="grid grid-cols-2">
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>User Role Distribution</h3>
              <div style={styles.infoRow}>
                <span>Students:</span>
                <strong>{stats?.users?.students || 0}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Club / Faculty Organizers:</span>
                <strong>{stats?.users?.organizers || 0}</strong>
              </div>
              <div style={styles.infoRow}>
                <span>System Administrators:</span>
                <strong>{stats?.users?.admins || 0}</strong>
              </div>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Security & Governance Safeguards</h3>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                <div>✓ <strong>Self-Lockout Protection:</strong> Administrators cannot demote or deactivate their own active credentials.</div>
                <div>✓ <strong>Public Route Restriction:</strong> Public registration is hard-locked to Student or Organizer roles only.</div>
                <div>✓ <strong>Database Unique Constraints:</strong> Enforces one active seat registration per student-event pair.</div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <div>
          {/* User Filter Bar */}
          <div style={styles.filterBar}>
            <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: '0.65rem', flex: 1, maxWidth: '400px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Role Filter:</span>
              {['All', 'student', 'organizer', 'admin'].map((role) => (
                <button
                  key={role}
                  className={`btn btn-sm ${userRoleFilter === role ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUserRoleFilter(role)}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Department / ID</th>
                  <th>Current Role</th>
                  <th>Account Status</th>
                  <th>Promote / Change Role</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrentAdmin = u._id === user?.id;

                  return (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <div>{u.department || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.studentId || 'N/A'}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'organizer' ? 'badge-warning' : 'badge-primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.isActive ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-danger">Deactivated</span>
                        )}
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={isCurrentAdmin || actionLoading}
                        >
                          <option value="student">Student</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-primary'}`}
                          onClick={() => setSelectedUserForStatus(u)}
                          disabled={isCurrentAdmin || actionLoading}
                          title={isCurrentAdmin ? 'Cannot deactivate self' : ''}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Organizer</th>
                  <th>Date & Time</th>
                  <th>Registrations</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Moderation</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id}>
                    <td>
                      <strong>{ev.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.category} • {ev.venue}</div>
                    </td>
                    <td>
                      <div>{ev.organizer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.organizer?.email}</div>
                    </td>
                    <td>
                      <div>{new Date(ev.date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.time}</div>
                    </td>
                    <td>
                      <strong>{ev.registeredCount || 0}</strong> / {ev.capacity}
                    </td>
                    <td>
                      <span className={`badge ${ev.status === 'published' ? 'badge-success' : ev.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                        {ev.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {ev.status !== 'published' && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleModerateEvent(ev._id, 'published')}
                            disabled={actionLoading}
                          >
                            Publish
                          </button>
                        )}
                        {ev.status !== 'cancelled' && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleModerateEvent(ev._id, 'cancelled')}
                            disabled={actionLoading}
                          >
                            Cancel Event
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deactivating / Activating User */}
      <ConfirmModal
        isOpen={!!selectedUserForStatus}
        title={selectedUserForStatus?.isActive ? 'Deactivate User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${selectedUserForStatus?.isActive ? 'deactivate' : 'activate'} the account for "${selectedUserForStatus?.name}"?`}
        confirmText={selectedUserForStatus?.isActive ? 'Deactivate' : 'Activate'}
        confirmVariant={selectedUserForStatus?.isActive ? 'danger' : 'primary'}
        loading={actionLoading}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setSelectedUserForStatus(null)}
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
    marginBottom: '2rem',
  },
  statLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  statNum: {
    fontSize: '2.25rem',
    fontWeight: '800',
    margin: '0.35rem 0',
  },
  statSub: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
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
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.6rem 0',
    borderBottom: '1px solid var(--border)',
    fontSize: '0.925rem',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
};

export default AdminDashboard;
