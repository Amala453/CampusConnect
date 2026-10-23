import React from 'react';

const LoadingSpinner = ({ message = 'Loading campus details...' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3.5rem 1rem',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--primary-border)',
    borderTop: '3px solid var(--primary)',
    borderRadius: '50%',
    animation: 'cc-spin 0.8s linear infinite',
  },
  message: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-muted)',
  },
};

export default LoadingSpinner;
