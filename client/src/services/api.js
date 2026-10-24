const resolveApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    url = import.meta.env.PROD
      ? 'https://campusconnect-2j58.onrender.com/api'
      : 'http://localhost:5000/api';
  }
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_BASE_URL = resolveApiBaseUrl();

/**
 * Universal HTTP request wrapper handling Authorization tokens and JSON parsing
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('cc_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Auto-handle 401 Unauthorized (token expired or invalid)
      if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        // Let the caller handle or trigger logout state
      }

      const errorMessage = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const api = {
  // Auth API
  auth: {
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    getMe: () => request('/auth/me'),
    updateProfile: (profileData) =>
      request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),
  },

  // Events API
  events: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.append('search', params.search);
      if (params.category) searchParams.append('category', params.category);
      if (params.upcoming !== undefined) searchParams.append('upcoming', params.upcoming);
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);

      const qs = searchParams.toString();
      return request(`/events${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/events/${id}`),
    create: (eventData) =>
      request('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      }),
    update: (id, eventData) =>
      request(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      }),
    cancel: (id) =>
      request(`/events/${id}/cancel`, {
        method: 'PATCH',
      }),
    getMyOrganized: () => request('/events/organizer/my-events'),
  },

  // Registrations API
  registrations: {
    register: (eventId) =>
      request(`/registrations/${eventId}`, {
        method: 'POST',
      }),
    cancel: (registrationId) =>
      request(`/registrations/${registrationId}/cancel`, {
        method: 'PATCH',
      }),
    getMy: () => request('/registrations/my-registrations'),
    getParticipants: (eventId) =>
      request(`/registrations/events/${eventId}/participants`),
    markAttendance: (registrationId, attended) =>
      request(`/registrations/${registrationId}/attendance`, {
        method: 'PATCH',
        body: JSON.stringify({ attended }),
      }),
  },

  // Admin API
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: (params = {}) => {
      const sp = new URLSearchParams();
      if (params.role) sp.append('role', params.role);
      if (params.search) sp.append('search', params.search);
      const qs = sp.toString();
      return request(`/admin/users${qs ? `?${qs}` : ''}`);
    },
    updateUserRole: (userId, role) =>
      request(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    toggleUserStatus: (userId) =>
      request(`/admin/users/${userId}/status`, {
        method: 'PATCH',
      }),
    getAllEvents: () => request('/admin/events'),
    moderateEvent: (eventId, data) =>
      request(`/admin/events/${eventId}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
};

export default api;
