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
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(function (resolve, reject) {
        apiClient.post('/auth/refresh', {}, { withCredentials: true })
          .then(res => {
            const newToken = res?.data?.token || res?.token || res?.data?.accessToken || null;
            if (newToken) {
              localStorage.setItem('authToken', newToken);
              apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
              originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
              processQueue(null, newToken);
              resolve(apiClient(originalRequest));
            } else {
              // If refresh did not return token, clear and redirect
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
              reject(new Error("Could not refresh token"));
            }
          })
          .catch(err => {
            processQueue(err, null);
            // Refresh failed - clear storage and redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
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
