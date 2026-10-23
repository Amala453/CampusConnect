import React from 'react';

const Alert = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isInfo = type === 'info';
  const alertClass = isSuccess ? 'alert alert-success' : isInfo ? 'alert alert-info' : 'alert alert-danger';

  return (
    <div className={alertClass} role="alert">
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {isSuccess ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, fontSize: '0.92rem' }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '2px',
          }}
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
