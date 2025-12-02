import axios from 'axios';

// API configuration — read from environment with sensible fallbacks
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/${process.env.REACT_APP_API_VERSION || 'v1'}`;

console.log('📋 MAIN API SERVICE DEBUG:');
console.log('  REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('  REACT_APP_API_VERSION:', process.env.REACT_APP_API_VERSION);
console.log('  API_BASE_URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // allow httpOnly refresh cookie to be sent
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Attempt token refresh on 401 once
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        return api.post(endpoints.auth.refreshToken, {}, { withCredentials: true })
          .then(res => {
            const newToken = res?.data?.token || res?.token || res?.data?.accessToken || null;
            if (newToken) {
              localStorage.setItem('authToken', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }

            // If refresh failed to return token, clear and redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          })
          .catch(err => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            return Promise.reject(err);
          });
      }

      if (status === 401) {
        // Token expired or invalid and retry not possible
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Return structured error
      return Promise.reject({
        message: data?.message || 'An error occurred',
        error: data?.error || 'UNKNOWN_ERROR',
        status: status,
        details: data
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        error: 'NETWORK_ERROR',
        status: 0
      });
    } else {
      // Other error
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        error: 'UNKNOWN_ERROR',
        status: 0
      });
    }
  }
);

// API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    profile: '/auth/profile',
    refreshToken: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: (token) => `/auth/reset-password/${token}`,
    changePassword: '/auth/change-password',
    verify: '/auth/verify',
    setupMaster: '/auth/setup-master',
    checkSetup: '/auth/check-setup'
  },

  // Patients - Fixed to match backend routes
  patients: {
    list: '/patients',
    create: '/patients/post',
    getById: (id) => `/patients/get/${id}`,
    update: (id) => `/patients/${id}`,
    delete: (id) => `/patients/${id}`,
    search: '/patients/search',
    stats: '/patients/stats',
    reports: (id) => `/patients/${id}/reports`,
    testHistory: (id) => `/patients/${id}/test-history`,
    medicalHistory: (id) => `/patients/${id}/medical-history`,
    export: '/patients/export',
    ageRange: (min, max) => `/patients/age-range/${min}/${max}`,
    bloodGroup: (group) => `/patients/blood-group/${group}`
  },

  // Tests - Fixed to match backend routes
  tests: {
    list: '/tests/get',
    create: '/tests/post',
    getById: (id) => `/tests/getTest/${id}`,
    update: (id) => `/tests/${id}`,
    delete: (id) => `/tests/${id}`,
    search: '/tests/search',
    stats: '/tests/stats',
    category: (category) => `/tests/category/${category}`,
    priceRange: (min, max) => `/tests/price-range/${min}/${max}`,
    popular: '/tests/popular',
    export: '/tests/export',
    addSubtest: (testId) => `/tests/subtest/${testId}`,
    updateSubtest: (testId, subtestId) => `/tests/subtest/${testId}/${subtestId}`,
    deleteSubtest: (testId, subtestId) => `/tests/subtest/${testId}/${subtestId}`
  },

  // Reports
  reports: {
    list: '/reports',
    create: '/reports',
    getById: (id) => `/reports/${id}`,
    update: (id) => `/reports/${id}`,
    delete: (id) => `/reports/${id}`,
    search: '/reports/search',
    stats: '/reports/stats',
    byPatient: (patientId) => `/reports/patient/${patientId}`,
    byTest: (testId) => `/reports/test/${testId}`,
    pending: '/reports/status/pending',
    approve: (id) => `/reports/${id}/approve`,
    bulkApprove: '/reports/bulk/approve',
    pdf: (id) => `/reports/${id}/pdf`,
    sendEmail: (id) => `/reports/${id}/send-email`,
    export: '/reports/export/data',
    dateRange: (start, end) => `/reports/date-range/${start}/${end}`
  },

  // Invoices
          invoices: {
    list: '/invoices',
    create: '/invoices',
    getById: (id) => `/invoices/${id}`,
    update: (id) => `/invoices/${id}`,
    delete: (id) => `/invoices/${id}`,
      // backend uses PATCH /invoices/status/:id to add payment
      addPayment: (id) => `/invoices/status/${id}`,
      // fetch invoice to get payment history
      paymentHistory: (id) => `/invoices/${id}`,
    stats: '/invoices/stats',
    outstanding: '/invoices/outstanding',
    pdf: (id) => `/invoices/${id}/pdf`,
    sendEmail: (id) => `/invoices/${id}/send-email`,
    export: '/invoices/export'
  },

  // Users
  users: {
    list: '/users',
    create: '/users',
    getById: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    stats: '/users/stats',
    resetPassword: (id) => `/users/${id}/reset-password`,
    profile: '/users/profile',
    activity: (id) => `/users/activity/${id}`,
    activate: (id) => `/users/${id}/activate`,
    deactivate: (id) => `/users/${id}/deactivate`,
    roles: '/users/roles',
    updateRole: (id) => `/users/${id}/role`
  },

  // Settings
  settings: {
    get: '/settings',
    update: '/settings',
    uploadHeader: '/settings/images/header',
    uploadFooter: '/settings/images/footer',
    uploadLogo: '/settings/images/logo',
    getImage: (type) => `/settings/images/${type}`,
    getImageBase64: (type) => `/settings/images/${type}/base64`,
    deleteImage: (type) => `/settings/images/${type}`,
    systemInfo: '/settings/system',
    category: (category) => `/settings/category/${category}`,
    key: (key) => `/settings/key/${key}`,
    updateKey: (key) => `/settings/key/${key}`,
    bulkUpdate: '/settings/bulk',
    lab: '/settings/lab',
    userSettings: (userId) => `/settings/user/${userId}`,
    export: '/settings/export',
    import: '/settings/import',
    resetCategory: (category) => `/settings/reset/category/${category}`,
    validate: '/settings/validate',
    history: '/settings/history'
  }
};

// Auth endpoints
export const login = (credentials) => api.post(endpoints.auth.login, credentials);
export const register = (userData) => api.post(endpoints.auth.register, userData);
export const refreshToken = () => api.post(endpoints.auth.refreshToken);
export const logout = () => api.post(endpoints.auth.logout);
export const getProfile = () => api.get(endpoints.auth.profile);
export const updateProfile = (data) => api.put(endpoints.auth.profile, data);

// Dashboard endpoints
// (Add dashboard endpoints if needed)

// Patient endpoints
export const getPatients = (params) => api.get(endpoints.patients.list, { params });
export const getPatient = (id) => api.get(endpoints.patients.getById(id));
export const createPatient = (data) => api.post(endpoints.patients.create, data);
export const updatePatient = (id, data) => api.put(endpoints.patients.update(id), data);
export const deletePatient = (id) => api.delete(endpoints.patients.delete(id));
export const searchPatients = (query) => api.get(endpoints.patients.search, { params: { query } });
export const getPatientStats = () => api.get(endpoints.patients.stats);
export const getPatientReports = (id) => api.get(endpoints.patients.reports(id));
export const getPatientTestHistory = (id) => api.get(endpoints.patients.testHistory(id));
export const updatePatientMedicalHistory = (id, data) => api.put(endpoints.patients.medicalHistory(id), data);
export const exportPatients = () => api.get(endpoints.patients.export);

// Test endpoints
export const getTests = (params) => api.get(endpoints.tests.list, { params });
export const getTest = (id) => api.get(endpoints.tests.getById(id));
export const createTest = (data) => api.post(endpoints.tests.create, data);
export const updateTest = (id, data) => api.put(endpoints.tests.update(id), data);
export const deleteTest = (id) => api.delete(endpoints.tests.delete(id));
export const searchTests = (query) => api.get(endpoints.tests.search, { params: { query } });
export const getTestStats = () => api.get(endpoints.tests.stats);
export const getTestsByCategory = (category) => api.get(endpoints.tests.category(category));
export const getTestsByPriceRange = (min, max) => api.get(endpoints.tests.priceRange(min, max));
export const getPopularTests = () => api.get(endpoints.tests.popular);
export const exportTests = () => api.get(endpoints.tests.export);

// Report endpoints
export const getReports = (params) => api.get(endpoints.reports.list, { params });
export const getReport = (id) => api.get(endpoints.reports.getById(id));
export const createReport = (data) => api.post(endpoints.reports.create, data);
export const updateReport = (id, data) => api.put(endpoints.reports.update(id), data);
export const deleteReport = (id) => api.delete(endpoints.reports.delete(id));
export const searchReports = (query) => api.get(endpoints.reports.search, { params: { query } });
export const getReportStats = () => api.get(endpoints.reports.stats);
export const getReportsByPatient = (patientId) => api.get(endpoints.reports.byPatient(patientId));
export const getReportsByTest = (testId) => api.get(endpoints.reports.byTest(testId));
export const getPendingReports = () => api.get(endpoints.reports.pending);
export const approveReport = (id, data) => api.put(endpoints.reports.approve(id), data);
export const bulkApproveReports = (reportIds) => api.put(endpoints.reports.bulkApprove, { reportIds });
export const generateReportPDF = (id) => api.get(endpoints.reports.pdf(id));
export const sendReportEmail = (id, data) => api.post(endpoints.reports.sendEmail(id), data);
export const exportReports = () => api.get(endpoints.reports.export);
export const getReportsByDateRange = (start, end) => api.get(endpoints.reports.dateRange(start, end));

// Invoice endpoints
export const getInvoices = (params) => api.get(endpoints.invoices.list, { params });
export const getInvoice = (id) => api.get(endpoints.invoices.getById(id));
export const createInvoice = (data) => api.post(endpoints.invoices.create, data);
export const updateInvoice = (id, data) => api.put(endpoints.invoices.update(id), data);
export const deleteInvoice = (id) => api.delete(endpoints.invoices.delete(id));
export const processPayment = (id, data) => api.patch(endpoints.invoices.addPayment(id), data);
export const getInvoicePaymentHistory = (id) => api.get(endpoints.invoices.paymentHistory(id));
export const getInvoiceStats = () => api.get(endpoints.invoices.stats);
export const getOutstandingInvoices = () => api.get(endpoints.invoices.outstanding);
export const generateInvoicePDF = (id) => api.get(endpoints.invoices.pdf(id));
export const sendInvoiceEmail = (id, data) => api.post(endpoints.invoices.sendEmail(id), data);
export const exportInvoices = () => api.get(endpoints.invoices.export);

// User endpoints
export const getUsers = (params) => api.get(endpoints.users.list, { params });
export const getUser = (id) => api.get(endpoints.users.getById(id));
export const createUser = (data) => api.post(endpoints.users.create, data);
export const updateUser = (id, data) => api.put(endpoints.users.update(id), data);
export const deleteUser = (id) => api.delete(endpoints.users.delete(id));
export const getUserStats = () => api.get(endpoints.users.stats);
export const resetUserPassword = (id, data) => api.post(endpoints.users.resetPassword(id), data);
export const getUserProfile = () => api.get(endpoints.users.profile);
export const getUserActivity = (id) => api.get(endpoints.users.activity(id));
export const activateUser = (id) => api.post(endpoints.users.activate(id));
export const deactivateUser = (id) => api.post(endpoints.users.deactivate(id));
export const getUserRoles = () => api.get(endpoints.users.roles);
export const updateUserRole = (id, role) => api.put(endpoints.users.updateRole(id), { role });

// Settings endpoints
export const getSettings = () => api.get(endpoints.settings.get);
export const updateSettings = (data) => api.put(endpoints.settings.update, data);
export const uploadHeaderImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post(endpoints.settings.uploadHeader, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export default api;
