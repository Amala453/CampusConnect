import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        <div style={styles.top}>
          <div style={styles.brandCol}>
            <div style={styles.brandTitle}>
              Campus<span style={{ color: 'var(--primary)' }}>Connect</span>
            </div>
            <p style={styles.desc}>
              A modern, transparent College Event and Club Management platform.
              Empowering students to discover campus experiences and organizers to manage registrations with ease.
            </p>
          </div>

          <div style={styles.linksCol}>
            <h4 style={styles.colTitle}>Navigation</h4>
            <ul style={styles.list}>
              <li><Link to="/" style={styles.link}>Home</Link></li>
              <li><Link to="/events" style={styles.link}>Browse Events</Link></li>
              <li><Link to="/login" style={styles.link}>Student & Staff Login</Link></li>
              <li><Link to="/register" style={styles.link}>Create Account</Link></li>
            </ul>
          </div>

          <div style={styles.linksCol}>
            <h4 style={styles.colTitle}>Academic Information</h4>
            <p style={styles.infoText}>
              Developed as a <strong>MERN Capstone Project</strong> following the <strong>ICT Academy of Kerala (ICTAK)</strong> Full Stack Curriculum Guidelines.
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <span className="badge badge-primary">MERN Stack</span>
              <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>Production Ready</span>
            </div>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={styles.copyright}>
            &copy; {new Date().getFullYear()} CampusConnect. Built with React, Node.js, Express & MongoDB.
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#ffffff',
    borderTop: '1px solid var(--border)',
    padding: '3rem 0 1.5rem 0',
    marginTop: 'auto',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  top: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1.5fr',
    gap: '3rem',
  },
  brandCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  brandTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-main)',
  },
  desc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    maxWidth: '420px',
  },
  linksCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  colTitle: {
    fontSize: '0.95rem',
    color: 'var(--text-main)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  link: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  infoText: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  bottom: {
    borderTop: '1px solid var(--border)',
    paddingTop: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyright: {
    fontSize: '0.85rem',
    color: 'var(--text-light)',
  },
};

export default Footer;
