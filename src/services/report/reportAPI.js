/**
 * Report Management API Service
 * Handles all report-related API calls
 */
import apiClient from '../apiClient';

export const reportAPI = {
  // Get all reports
  getAllReports: async (params = {}) => {
    try {
      const response = await apiClient.get('/reports/get', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get report by ID
  getReportById: async (reportId) => {
    try {
      const response = await apiClient.get(`/reports/getReport/${reportId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new report
  createReport: async (reportData) => {
    try {
      const response = await apiClient.post('/reports/post', reportData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update report
  updateReport: async (reportId, reportData) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}`, reportData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete report
  deleteReport: async (reportId) => {
    try {
      const response = await apiClient.delete(`/reports/${reportId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get reports by patient ID
  getReportsByPatient: async (patientId) => {
    try {
      const response = await apiClient.get(`/reports/patient/${patientId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search reports
  searchReports: async (searchQuery) => {
    try {
      const response = await apiClient.get('/reports/search', {
        params: { q: searchQuery }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update report status
  updateReportStatus: async (reportId, status) => {
    try {
      const response = await apiClient.patch(`/reports/${reportId}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generate report PDF
  generateReportPDF: async (reportId) => {
    try {
      const response = await apiClient.get(`/reports/${reportId}/pdf`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Send report via email
  sendReportEmail: async (reportId, emailData) => {
    try {
      const response = await apiClient.post(`/reports/${reportId}/send-email`, emailData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get pending reports
  getPendingReports: async () => {
    try {
      const response = await apiClient.get('/reports/pending');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get completed reports
  getCompletedReports: async () => {
    try {
      const response = await apiClient.get('/reports/completed');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get report statistics
  getReportStats: async () => {
    try {
      const response = await apiClient.get('/reports/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get reports by date range
  getReportsByDateRange: async (startDate, endDate) => {
    try {
      const response = await apiClient.get('/reports/date-range', {
        params: { startDate, endDate }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get reports by test type
  getReportsByTestType: async (testType) => {
    try {
      const response = await apiClient.get(`/reports/test-type/${testType}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add test results to report
  addTestResults: async (reportId, testResults) => {
    try {
      const response = await apiClient.post(`/reports/${reportId}/test-results`, testResults);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update test results
  updateTestResults: async (reportId, testResultId, testResults) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}/test-results/${testResultId}`, testResults);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete test results
  deleteTestResults: async (reportId, testResultId) => {
    try {
      const response = await apiClient.delete(`/reports/${reportId}/test-results/${testResultId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get report template
  getReportTemplate: async (templateId) => {
    try {
      const response = await apiClient.get(`/reports/template/${templateId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export reports data
  exportReportsData: async (format = 'csv', params = {}) => {
    try {
      const response = await apiClient.get('/reports/export', {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get report approval history
  getReportApprovalHistory: async (reportId) => {
    try {
      const response = await apiClient.get(`/reports/${reportId}/approval-history`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Approve report
  approveReport: async (reportId, approvalData) => {
    try {
      const response = await apiClient.post(`/reports/${reportId}/approve`, approvalData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reject report
  rejectReport: async (reportId, rejectionData) => {
    try {
      const response = await apiClient.post(`/reports/${reportId}/reject`, rejectionData);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default reportAPI;
