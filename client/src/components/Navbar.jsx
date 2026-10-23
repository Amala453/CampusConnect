import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isOrganizer, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.navContainer}>
        {/* Brand Logo */}
        <Link to="/" style={styles.brand} onClick={closeMenu}>
          <div style={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
            </svg>
          </div>
          <span style={styles.brandText}>Campus<span style={{ color: 'var(--primary)' }}>Connect</span></span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          style={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>

        {/* Navigation Links */}
        <div style={{ ...styles.navLinks, ...(mobileMenuOpen ? styles.navLinksMobile : {}) }}>
          <NavLink
            to="/"
            style={({ isActive }) => (isActive ? { ...styles.link, ...styles.activeLink } : styles.link)}
            onClick={closeMenu}
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            style={({ isActive }) => (isActive ? { ...styles.link, ...styles.activeLink } : styles.link)}
            onClick={closeMenu}
          >
            Explore Events
          </NavLink>

          {/* Role specific links */}
          {isAuthenticated && isStudent && (
            <NavLink
              to="/student"
              style={({ isActive }) => (isActive ? { ...styles.link, ...styles.activeLink } : styles.link)}
              onClick={closeMenu}
            >
              My Registrations
            </NavLink>
          )}

          {isAuthenticated && (isOrganizer || isAdmin) && (
            <NavLink
              to="/organizer"
              style={({ isActive }) => (isActive ? { ...styles.link, ...styles.activeLink } : styles.link)}
              onClick={closeMenu}
            >
              Organizer Studio
            </NavLink>
          )}

          {isAuthenticated && isAdmin && (
            <NavLink
              to="/admin"
              style={({ isActive }) => (isActive ? { ...styles.link, ...styles.activeLink } : styles.link)}
              onClick={closeMenu}
            >
              Admin Center
            </NavLink>
          )}

          {/* User Section */}
          <div style={styles.authSection}>
            {isAuthenticated ? (
              <div style={styles.userBadgeWrapper}>
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{user.name}</span>
                  <span className={`badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'organizer' ? 'badge-warning' : 'badge-primary'}`}>
                    {user.role}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ marginLeft: '0.5rem' }}>
                  Logout
                </button>
              </div>
            ) : (
              <div style={styles.guestButtons}>
                <Link to="/login" className="btn btn-secondary btn-sm" onClick={closeMenu}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: 'var(--shadow-sm)',
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '4.25rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    textDecoration: 'none',
  },
  logoIcon: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
  },
  mobileToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    fontSize: '0.925rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    padding: '0.5rem 0.25rem',
    transition: 'color 0.15s ease',
  },
  activeLink: {
    color: 'var(--primary)',
    borderBottom: '2px solid var(--primary)',
  },
  authSection: {
    display: 'flex',
    alignItems: 'center',
    borderLeft: '1px solid var(--border)',
    paddingLeft: '1.25rem',
    marginLeft: '0.5rem',
  },
  userBadgeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.15rem',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    maxWidth: '140px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  guestButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
};

export default Navbar;
