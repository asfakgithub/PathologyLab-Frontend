import apiClient from './apiClient';
import { endpoints } from './api';

console.log('🔧 REPORT SERVICE DEBUG:');
console.log('  API client baseURL:', apiClient.defaults.baseURL);

// Report API functions
export const reportService = {
  // Get all reports with filtering and pagination
  getAllReports: async (params = {}) => {
    try {
      const endpoint = endpoints.reports.list;
      console.log('📡 GET ALL REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint, { params });
      return response;
    } catch (error) {
      console.error('❌ GET ALL REPORTS ERROR:', error);
      throw error;
    }
  },

  // Get report by ID
  getReportById: async (reportId) => {
    try {
      const endpoint = endpoints.reports.getById(reportId);
      console.log('📡 GET REPORT BY ID REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET REPORT BY ID ERROR:', error);
      throw error;
    }
  },

  // Create new report
  createReport: async (reportData) => {
    try {
      const endpoint = endpoints.reports.create;
      console.log('📡 CREATE REPORT REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      console.log('📊 Report Data:', reportData);
      const response = await apiClient.post(endpoint, reportData);
      return response;
    } catch (error) {
      console.error('❌ CREATE REPORT ERROR:', error);
      throw error;
    }
  },

  // Update report
  updateReport: async (reportId, updateData) => {
    try {
      const endpoint = endpoints.reports.update(reportId);
      console.log('📡 UPDATE REPORT REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.put(endpoint, updateData);
      return response;
    } catch (error) {
      console.error('❌ UPDATE REPORT ERROR:', error);
      throw error;
    }
  },

  // Delete report
  deleteReport: async (reportId) => {
    try {
      const endpoint = endpoints.reports.delete(reportId);
      console.log('📡 DELETE REPORT REQUEST:', `[DELETE]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.delete(endpoint);
      return response;
    } catch (error) {
      console.error('❌ DELETE REPORT ERROR:', error);
      throw error;
    }
  },

  // Get reports by patient ID
  getReportsByPatient: async (patientId) => {
    try {
      const endpoint = endpoints.reports.byPatient(patientId);
      console.log('📡 GET REPORTS BY PATIENT REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
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
      console.log('📡 CHECK PATIENT REPORT REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ CHECK PATIENT REPORT ERROR:', error);
      throw error;
    }
  },

  // Search reports
  searchReports: async (searchQuery) => {
    try {
      const endpoint = endpoints.reports.search;
      console.log('📡 SEARCH REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint, { params: { q: searchQuery } });
      return response;
    } catch (error) {
      console.error('❌ SEARCH REPORTS ERROR:', error);
      throw error;
    }
  },

  // Get report statistics
  getReportStats: async () => {
    try {
      const endpoint = endpoints.reports.stats;
      console.log('📡 GET REPORT STATS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET REPORT STATS ERROR:', error);
      throw error;
    }
  },

  // Get pending reports
  getPendingReports: async () => {
    try {
      const endpoint = endpoints.reports.pending;
      console.log('📡 GET PENDING REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
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
      console.log('📡 GET COMPLETED REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET COMPLETED REPORTS ERROR:', error);
      throw error;
    }
  },

  // Update report status
  updateReportStatus: async (reportId, status) => {
    try {
      const endpoint = endpoints.reports.update(reportId);
      console.log('📡 UPDATE REPORT STATUS REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.put(endpoint, { status });
      return response;
    } catch (error) {
      console.error('❌ UPDATE REPORT STATUS ERROR:', error);
      throw error;
    }
  },

  // Generate report PDF
  generateReportPDF: async (reportId) => {
    try {
      const endpoint = endpoints.reports.pdf(reportId);
      console.log('📡 GENERATE REPORT PDF REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint, {
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
      const endpoint = endpoints.reports.sendEmail(reportId);
      console.log('📡 SEND REPORT EMAIL REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.post(endpoint, emailData);
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
      const endpoint = endpoints.reports.export;
      console.log('📡 EXPORT REPORTS DATA REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint, {
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
      const endpoint = endpoints.reports.approve(reportId);
      console.log('📡 APPROVE REPORT REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.post(endpoint, approvalData);
      return response;
    } catch (error) {
      console.error('❌ APPROVE REPORT ERROR:', error);
      throw error;
    }
  },

  // Bulk approve reports
  bulkApproveReports: async (reportIds) => {
    try {
      const endpoint = endpoints.reports.bulkApprove;
      console.log('📡 BULK APPROVE REPORTS REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.post(endpoint, { reportIds });
      return response;
    } catch (error) {
      console.error('❌ BULK APPROVE REPORTS ERROR:', error);
      throw error;
    }
  }
};

export default reportService;
