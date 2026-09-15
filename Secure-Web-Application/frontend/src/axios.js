import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Axios interceptor to extract the CSRF token from a cookie and add it to headers.
// Note: Flask-JWT-Extended uses 'csrf_access_token' by default in the cookie.
api.interceptors.request.use((config) => {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };
  
  const csrfToken = getCookie('csrf_access_token');
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
