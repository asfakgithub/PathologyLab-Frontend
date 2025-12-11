/**
 * Base API Client Configuration
 * This handles the common axios setup and interceptors
 */
import axios from 'axios';

// Automatically detect production based on current hostname/URL
// If deployed on a remote server (not localhost), use PROD URL
const isProduction = !window.location.hostname.includes('localhost') && 
                     window.location.hostname !== '127.0.0.1' &&
                     window.location.hostname !== '[::1]';

const selectedApiUrl = isProduction 
  ? (process.env.REACT_APP_API_URL_PROD || 'https://pathologylab-backend-72yt.onrender.com')
  : (process.env.REACT_APP_API_URL || 'http://localhost:8000');

// Base API configuration — use environment API version when provided
const API_BASE_URL = `${selectedApiUrl}/api/${process.env.REACT_APP_API_VERSION || 'v1'}`;

console.log('🔧 API CLIENT DEBUG:');
console.log('  Current Hostname:', window.location.hostname);
console.log('  Is Production (auto-detected):', isProduction);
console.log('  REACT_APP_API_URL (dev):', process.env.REACT_APP_API_URL);
console.log('  REACT_APP_API_URL_PROD:', process.env.REACT_APP_API_URL_PROD);
console.log('  Selected API URL:', selectedApiUrl);
console.log('  API_BASE_URL:', API_BASE_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow cookies (refresh token) to be sent/received
  withCredentials: true
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;

    // If 401, attempt refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      return apiClient.post('/auth/refresh', {}, { withCredentials: true })
        .then(res => {
          // res is response.data due to interceptor; ensure token exists
          const newToken = res?.data?.token || res?.token || res?.data?.accessToken || null;
          if (newToken) {
            localStorage.setItem('authToken', newToken);
            // Update Authorization header and retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }

          // If refresh did not return token, clear and redirect
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        })
        .catch(err => {
          // Refresh failed - clear storage and redirect
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(err);
        });
    }
    
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject({
        message: data?.message || 'An error occurred',
        error: data?.error || 'UNKNOWN_ERROR',
        status: status,
        details: data
      });
    } else if (error.request) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        error: 'NETWORK_ERROR',
        status: 0
      });
    } else {
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        error: 'UNKNOWN_ERROR',
        status: 0
      });
    }
  }
);

export default apiClient;
