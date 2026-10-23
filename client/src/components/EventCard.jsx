import React from 'react';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const registered = event.registeredCount || 0;
  const capacity = event.capacity || 1;
  const percentFull = Math.min(100, Math.round((registered / capacity) * 100));
  const isFull = registered >= capacity;
  const isCancelled = event.status === 'cancelled';

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Technical': return 'badge-primary';
      case 'Cultural': return 'badge-warning';
      case 'Sports': return 'badge-success';
      case 'Workshop': return 'badge-primary';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="card card-hover" style={styles.card}>
      <div style={styles.header}>
        <span className={`badge ${getCategoryColor(event.category)}`}>
          {event.category}
        </span>
        {isCancelled ? (
          <span className="badge badge-danger">Cancelled</span>
        ) : isFull ? (
          <span className="badge badge-warning">Housefull</span>
        ) : (
          <span className="badge badge-success">Open</span>
        )}
      </div>

      <div className="card-body" style={styles.body}>
        <h3 style={styles.title} title={event.title}>
          <Link to={`/events/${event._id}`} style={styles.titleLink}>
            {event.title}
          </Link>
        </h3>

        <p style={styles.desc}>
          {event.description.length > 110
            ? `${event.description.substring(0, 110)}...`
            : event.description}
        </p>

        <div style={styles.metaContainer}>
          <div style={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{formattedDate} • {event.time}</span>
          </div>

          <div style={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div style={styles.capacitySection}>
          <div style={styles.capacityLabels}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Registration Capacity
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: isFull ? 'var(--danger)' : 'var(--text-main)' }}>
              {registered} / {capacity}
            </span>
          </div>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressBar,
                width: `${percentFull}%`,
                backgroundColor: isFull ? 'var(--danger)' : percentFull > 80 ? 'var(--warning)' : 'var(--primary)',
              }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '1.25rem' }}>
          <Link
            to={`/events/${event._id}`}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
          >
            View Event Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: '1.25rem 1.5rem 0.5rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: '1.2rem',
    marginBottom: '0.6rem',
    lineHeight: '1.35',
  },
  titleLink: {
    color: 'var(--text-main)',
    textDecoration: 'none',
  },
  desc: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginBottom: '1rem',
    flex: 1,
  },
  metaContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginBottom: '1.15rem',
    padding: '0.75rem',
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: 'var(--radius-md)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.825rem',
    color: 'var(--text-main)',
    fontWeight: '500',
  },
  capacitySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  capacityLabels: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.3s ease',
  },
};

export default EventCard;
