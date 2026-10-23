import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon,
  title = 'No records found',
  description = 'There is currently no data to display matching your criteria.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        {icon || (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        )}
      </div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
      {actionLabel && (
        <div style={{ marginTop: '1rem' }}>
          {actionLink ? (
            <Link to={actionLink} className="btn btn-primary btn-sm">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn btn-primary btn-sm">
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3.5rem 1.5rem',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--border)',
    margin: '1.5rem 0',
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-subtle)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '0.4rem',
  },
  description: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    maxWidth: '420px',
  },
};

export default EmptyState;
