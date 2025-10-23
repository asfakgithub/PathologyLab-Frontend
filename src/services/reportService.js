import axios from 'axios';

// Report API configuration
const REPORT_API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1`;

// Create axios instance for report API
const reportApi = axios.create({
  baseURL: REPORT_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
reportApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for report API
reportApi.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
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

// Report API functions
export const reportService = {
  // Get all reports with filtering and pagination
  getAllReports: async (params = {}) => {
    try {
      const endpoint = '/reports';
      console.log('📡 GET ALL REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint, { params });
      return response;
    } catch (error) {
      console.error('❌ GET ALL REPORTS ERROR:', error);
      throw error;
    }
  },

  // Get report by ID
  getReportById: async (reportId) => {
    try {
      const endpoint = `/reports/${reportId}`;
      console.log('📡 GET REPORT BY ID REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET REPORT BY ID ERROR:', error);
      throw error;
    }
  },

  // Create new report
  createReport: async (reportData) => {
    try {
      const endpoint = '/reports';
      console.log('📡 CREATE REPORT REQUEST:', `[POST]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      console.log('📊 Report Data:', reportData);
      const response = await reportApi.post(endpoint, reportData);
      return response;
    } catch (error) {
      console.error('❌ CREATE REPORT ERROR:', error);
      throw error;
    }
  },

  // Update report
  updateReport: async (reportId, updateData) => {
    try {
      const endpoint = `/reports/${reportId}`;
      console.log('📡 UPDATE REPORT REQUEST:', `[PUT]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.put(endpoint, updateData);
      return response;
    } catch (error) {
      console.error('❌ UPDATE REPORT ERROR:', error);
      throw error;
    }
  },

  // Delete report
  deleteReport: async (reportId) => {
    try {
      const endpoint = `/reports/${reportId}`;
      console.log('📡 DELETE REPORT REQUEST:', `[DELETE]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.delete(endpoint);
      return response;
    } catch (error) {
      console.error('❌ DELETE REPORT ERROR:', error);
      throw error;
    }
  },

  // Get reports by patient ID
  getReportsByPatient: async (patientId) => {
    try {
      const endpoint = `/reports/patient/${patientId}`;
      console.log('📡 GET REPORTS BY PATIENT REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET REPORTS BY PATIENT ERROR:', error);
      throw error;
    }
  },

  // Check if patient has existing report
  checkPatientReport: async (patientId) => {
    try {
      const endpoint = `/reports/check/${patientId}`;
      console.log('📡 CHECK PATIENT REPORT REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ CHECK PATIENT REPORT ERROR:', error);
      throw error;
    }
  },

  // Search reports
  searchReports: async (searchQuery) => {
    try {
      const endpoint = '/reports/search';
      console.log('📡 SEARCH REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint, { params: { q: searchQuery } });
      return response;
    } catch (error) {
      console.error('❌ SEARCH REPORTS ERROR:', error);
      throw error;
    }
  },

  // Get report statistics
  getReportStats: async () => {
    try {
      const endpoint = '/reports/stats';
      console.log('📡 GET REPORT STATS REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET REPORT STATS ERROR:', error);
      throw error;
    }
  },

  // Get pending reports
  getPendingReports: async () => {
    try {
      const endpoint = '/reports/pending';
      console.log('📡 GET PENDING REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PENDING REPORTS ERROR:', error);
      throw error;
    }
  },

  // Get completed reports
  getCompletedReports: async () => {
    try {
      const endpoint = '/reports/completed';
      console.log('📡 GET COMPLETED REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET COMPLETED REPORTS ERROR:', error);
      throw error;
    }
  },

  // Update report status
  updateReportStatus: async (reportId, status) => {
    try {
      const endpoint = `/reports/${reportId}`;
      console.log('📡 UPDATE REPORT STATUS REQUEST:', `[PUT]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.put(endpoint, { status });
      return response;
    } catch (error) {
      console.error('❌ UPDATE REPORT STATUS ERROR:', error);
      throw error;
    }
  },

  // Generate report PDF
  generateReportPDF: async (reportId) => {
    try {
      const endpoint = `/reports/${reportId}/pdf`;
      console.log('📡 GENERATE REPORT PDF REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('❌ GENERATE REPORT PDF ERROR:', error);
      throw error;
    }
  },

  // Send report via email
  sendReportEmail: async (reportId, emailData) => {
    try {
      const endpoint = `/reports/${reportId}/send-email`;
      console.log('📡 SEND REPORT EMAIL REQUEST:', `[POST]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.post(endpoint, emailData);
      return response;
    } catch (error) {
      console.error('❌ SEND REPORT EMAIL ERROR:', error);
      throw error;
    }
  },

  // Get reports by date range
  getReportsByDateRange: async (startDate, endDate) => {
    try {
      const endpoint = '/reports';
      console.log('📡 GET REPORTS BY DATE RANGE REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint, {
        params: { startDate, endDate }
      });
      return response;
    } catch (error) {
      console.error('❌ GET REPORTS BY DATE RANGE ERROR:', error);
      throw error;
    }
  },

  // Export reports data
  exportReportsData: async (format = 'csv', params = {}) => {
    try {
      const endpoint = '/reports/export';
      console.log('📡 EXPORT REPORTS DATA REQUEST:', `[GET]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.get(endpoint, {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('❌ EXPORT REPORTS DATA ERROR:', error);
      throw error;
    }
  },

  // Approve report
  approveReport: async (reportId, approvalData) => {
    try {
      const endpoint = `/reports/${reportId}/approve`;
      console.log('📡 APPROVE REPORT REQUEST:', `[POST]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.post(endpoint, approvalData);
      return response;
    } catch (error) {
      console.error('❌ APPROVE REPORT ERROR:', error);
      throw error;
    }
  },

  // Bulk approve reports
  bulkApproveReports: async (reportIds) => {
    try {
      const endpoint = '/reports/bulk/approve';
      console.log('📡 BULK APPROVE REPORTS REQUEST:', `[POST]`, endpoint, 'BaseURL:', reportApi.defaults.baseURL);
      const response = await reportApi.post(endpoint, { reportIds });
      return response;
    } catch (error) {
      console.error('❌ BULK APPROVE REPORTS ERROR:', error);
      throw error;
    }
  }
};

export default reportService;
