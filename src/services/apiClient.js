/**
 * Base API Client Configuration
 * This handles the common axios setup and interceptors
 */
import axios from 'axios';

// Base API configuration
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1`;

console.log('🔧 API CLIENT DEBUG:');
console.log('  REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
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
