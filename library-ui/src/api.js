import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Grab the CSRF token from the cookie for Django session auth
api.interceptors.request.use((config) => {
  const csrfMatch = document.cookie.match(/csrftoken=([^;]+)/);
  if (csrfMatch) {
    config.headers['X-CSRFToken'] = csrfMatch[1];
  }
  return config;
});

export default api;
