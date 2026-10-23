import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.events.getAll({ limit: 3, upcoming: 'true' });
        if (res.success && res.events) {
          setFeaturedEvents(res.events);
        }
      } catch (err) {
        console.warn('Could not load featured events:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <div style={styles.badgeTop}>
              <span className="badge badge-primary">Campus Event Ecosystem</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official College Portal</span>
            </div>
            <h1 style={styles.heroTitle}>
              Connect with Campus Life, Workshops & Celebrations
            </h1>
            <p style={styles.heroSubtitle}>
              CampusConnect bridges collegiate clubs, departments, and students. Discover hackathons, technical symposiums, cultural nights, and seminars with guaranteed seat reservations and instant attendance tracking.
            </p>
            <div style={styles.heroActions}>
              <Link to="/events" className="btn btn-primary btn-lg">
                Explore All Events &rarr;
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Student Account
              </Link>
            </div>
          </div>

          <div style={styles.heroCardPreview}>
            <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#ffffff' }}>
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93c5fd', fontWeight: '700' }}>
                LIVE PLATFORM METRICS
              </span>
              <h3 style={{ color: '#ffffff', margin: '0.75rem 0', fontSize: '1.6rem' }}>
                Zero Paperwork. 100% Real-Time.
              </h3>
              <p style={{ color: '#dbeafe', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Built on the MERN stack with strict database-level unique constraints preventing duplicate registrations, automated capacity controls, and role-based permissions.
              </p>
              <div style={styles.statGrid}>
                <div style={styles.statBox}>
                  <div style={styles.statVal}>3</div>
                  <div style={styles.statLabel}>User Roles</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statVal}>100%</div>
                  <div style={styles.statLabel}>Verified Auth</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statVal}>Atomic</div>
                  <div style={styles.statLabel}>Seat Counters</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Upcoming Highlights</span>
              <h2>Featured Campus Events</h2>
              <p>Top events happening this week across engineering, arts, and innovation clubs.</p>
            </div>
            <Link to="/events" className="btn btn-outline btn-sm">
              View All Events &rarr;
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching upcoming events..." />
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                No events currently scheduled. Check back soon or browse the full event catalog.
              </p>
              <Link to="/events" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Browse Catalog
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ ...styles.section, backgroundColor: '#ffffff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Simple & Reliable</span>
            <h2>How CampusConnect Works</h2>
            <p>Designed to be intuitive for students, powerful for organizers, and transparent for college administrators.</p>
          </div>

          <div className="grid grid-cols-3">
            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={styles.featureIcon}>1</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Browse & Discover</h4>
              <p style={{ fontSize: '0.9rem' }}>
                Students explore events categorized by technical, cultural, sports, and workshops with instant search and filters.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={styles.featureIcon}>2</div>
              <h4 style={{ marginBottom: '0.5rem' }}>One-Click Registration</h4>
              <p style={{ fontSize: '0.9rem' }}>
                Reserve your seat in seconds. CampusConnect guards against duplicate entries and overbooking automatically.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={styles.featureIcon}>3</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Real Attendance Tracking</h4>
              <p style={{ fontSize: '0.9rem' }}>
                Organizers track participant lists in their studio and record real-time attendance directly into MongoDB.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  hero: {
    padding: '4.5rem 0 3.5rem 0',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--border)',
  },
  heroContainer: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '3.5rem',
    alignItems: 'center',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  badgeTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  heroTitle: {
    fontSize: '2.75rem',
    fontWeight: '800',
    lineHeight: '1.18',
    letterSpacing: '-0.03em',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
  },
  heroActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap',
  },
  heroCardPreview: {
    width: '100%',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    paddingTop: '1.25rem',
  },
  statBox: {
    textAlign: 'center',
  },
  statVal: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#bfdbfe',
    textTransform: 'uppercase',
  },
  section: {
    padding: '4rem 0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  featureIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    fontWeight: '800',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.25rem auto',
  },
};

export default HomePage;
