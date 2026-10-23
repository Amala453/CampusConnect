import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ maxWidth: '460px', margin: '0 auto 2rem auto', color: 'var(--text-muted)' }}>
        The campus page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        Return to Home Page
      </Link>
    </div>
  );
};

export default NotFoundPage;
