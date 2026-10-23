import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

const CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Club Activity',
  'Other',
];

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.events.getAll({
        search,
        category: category !== 'All' ? category : '',
        upcoming: upcomingOnly ? 'true' : 'false',
        page: currentPage,
        limit: 9,
      });

      if (res.success) {
        setEvents(res.events || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch events from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, upcomingOnly, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setUpcomingOnly(true);
    setCurrentPage(1);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Page Title & Search Bar */}
      <div style={styles.header}>
        <div>
          <h1 style={{ marginBottom: '0.4rem' }}>Campus Events Catalog</h1>
          <p>Browse and register for workshops, technical symposiums, and cultural fests.</p>
        </div>

        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, description or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
            Search
          </button>
        </form>
      </div>

      {/* Filter Toolbar */}
      <div style={styles.filterBar}>
        <div style={styles.categoryPills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setCurrentPage(1);
              }}
              style={{
                ...styles.filterBtn,
                ...(category === cat ? styles.filterBtnActive : {}),
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <label style={styles.upcomingToggle}>
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => {
              setUpcomingOnly(e.target.checked);
              setCurrentPage(1);
            }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Upcoming Events Only</span>
        </label>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Events Results */}
      {loading ? (
        <LoadingSpinner message="Searching published events..." />
      ) : events.length > 0 ? (
        <>
          <div style={styles.metaResults}>
            <span>Showing <strong>{events.length}</strong> of <strong>{totalCount}</strong> published events</span>
            {category !== 'All' && <span> • Category: <strong>{category}</strong></span>}
          </div>

          <div className="grid grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &larr; Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No events found"
          description={
            search || category !== 'All'
              ? 'No campus events match your current search criteria or category filter.'
              : 'There are currently no events published. Please check back later.'
          }
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  searchForm: {
    display: 'flex',
    gap: '0.65rem',
    width: '100%',
    maxWidth: '480px',
  },
  searchInput: {
    width: '100%',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid var(--border)',
  },
  categoryPills: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.4rem 0.85rem',
    fontSize: '0.825rem',
    fontWeight: '600',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border)',
    backgroundColor: '#ffffff',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  filterBtnActive: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    borderColor: 'var(--primary)',
  },
  upcomingToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
  metaResults: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginBottom: '1.25rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '3rem',
  },
};

export default EventsPage;
