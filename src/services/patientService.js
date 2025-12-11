import apiClient from './apiClient';
import { endpoints } from './api';

console.log('🔧 PATIENT SERVICE DEBUG:');
console.log('  API client baseURL:', apiClient.defaults.baseURL);

// Patient API functions
export const patientService = {
  // Get all patients with filtering and pagination
  getAllPatients: async (params = {}) => {
    try {
      const endpoint = endpoints.patients.list;
      console.log('📡 GET ALL PATIENTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint, { params });
      return response;
    } catch (error) {
      console.error('❌ GET ALL PATIENTS ERROR:', error);
      throw error;
    }
  },

  // Get patient by ID
  getPatientById: async (patientId) => {
    try {
      const endpoint = endpoints.patients.getById(patientId);
      console.log('📡 GET PATIENT BY ID REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT BY ID ERROR:', error);
      throw error;
    }
  },

  // Create new patient
  createPatient: async (patientData) => {
    try {
      const endpoint = endpoints.patients.create;
      console.log('📡 CREATE PATIENT REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      console.log('👤 Patient Data:', patientData);
      const response = await apiClient.post(endpoint, patientData);
      return response;
    } catch (error) {
      console.error('❌ CREATE PATIENT ERROR:', error);
      throw error;
    }
  },

  // Update patient
  updatePatient: async (patientId, updateData) => {
    try {
      const endpoint = endpoints.patients.update(patientId);
      console.log('📡 UPDATE PATIENT REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      console.log('🔧 updatePatient payload:', updateData);
      const response = await apiClient.put(endpoint, updateData);
      return response;
    } catch (error) {
      console.error('❌ UPDATE PATIENT ERROR:', error);
      throw error;
    }
  },

  // Delete patient
  deletePatient: async (patientId) => {
    try {
      const endpoint = endpoints.patients.delete(patientId);
      console.log('📡 DELETE PATIENT REQUEST:', `[DELETE]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.delete(endpoint);
      return response;
    } catch (error) {
      console.error('❌ DELETE PATIENT ERROR:', error);
      throw error;
    }
  },

  // Search patients
  searchPatients: async (searchQuery) => {
    try {
      const endpoint = endpoints.patients.search;
      console.log('📡 SEARCH PATIENTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      // backend expects `query` param; support both `query` and `q` for compatibility
      const response = await apiClient.get(endpoint, { params: { query: searchQuery, q: searchQuery } });
      return response;
    } catch (error) {
      console.error('❌ SEARCH PATIENTS ERROR:', error);
      throw error;
    }
  },

  // Get patient statistics
  getPatientStats: async () => {
    try {
      const endpoint = endpoints.patients.stats;
      console.log('📡 GET PATIENT STATS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT STATS ERROR:', error);
      throw error;
    }
  },

  // Get patient reports
  getPatientReports: async (patientId) => {
    try {
      const endpoint = endpoints.patients.reports(patientId);
      console.log('📡 GET PATIENT REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT REPORTS ERROR:', error);
      throw error;
    }
  },

  // Add test results for patient
  addTestResults: async (patientId, testResults) => {
    try {
      const endpoint = `/patients/${patientId}/results`;
      console.log('📡 ADD TEST RESULTS REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      console.log('🔧 addTestResults payload:', testResults);
      const response = await apiClient.post(endpoint, testResults);
      return response;
    } catch (error) {
      console.error('❌ ADD TEST RESULTS ERROR:', error);
      throw error;
    }
  },

  // Get patient test history
  getPatientTestHistory: async (patientId) => {
    try {
      const endpoint = endpoints.patients.testHistory(patientId);
      console.log('📡 GET PATIENT TEST HISTORY REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT TEST HISTORY ERROR:', error);
      throw error;
    }
  },

  // Get patient invoices
  getPatientInvoices: async (patientId) => {
    try {
      const endpoint = `/patients/${patientId}/invoices`;
      console.log('📡 GET PATIENT INVOICES REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT INVOICES ERROR:', error);
      throw error;
    }
  },

  // Export patient data
  exportPatientData: async (patientId, format = 'pdf') => {
    try {
      const endpoint = endpoints.patients.export.replace('/patients', `/patients/${patientId}`) || `/patients/${patientId}/export`;
      console.log('📡 EXPORT PATIENT DATA REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(`/patients/${patientId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('❌ EXPORT PATIENT DATA ERROR:', error);
      throw error;
    }
  },

  // Get patients by status
  getPatientsByStatus: async (status) => {
    try {
      const endpoint = `/patients/getStatus/${status}`;
      console.log('📡 GET PATIENTS BY STATUS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENTS BY STATUS ERROR:', error);
      throw error;
    }
  },

  // Get patient test details
  getPatientTestDetails: async (patientId) => {
    try {
      const endpoint = `/patients/${patientId}/testDetails`;
      console.log('📡 GET PATIENT TEST DETAILS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT TEST DETAILS ERROR:', error);
      throw error;
    }
  },

  // Get patients by age range
  getPatientsByAgeRange: async (minAge, maxAge) => {
    try {
      const endpoint = `/patients/age-range/${minAge}/${maxAge}`;
      console.log('📡 GET PATIENTS BY AGE RANGE REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENTS BY AGE RANGE ERROR:', error);
      throw error;
    }
  },

  // Get patients by blood group
  getPatientsByBloodGroup: async (bloodGroup) => {
    try {
      const endpoint = `/patients/blood-group/${bloodGroup}`;
      console.log('📡 GET PATIENTS BY BLOOD GROUP REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENTS BY BLOOD GROUP ERROR:', error);
      throw error;
    }
  },

  // Get patient medical history
  getPatientMedicalHistory: async (patientId) => {
    try {
      const endpoint = `/patients/${patientId}/medical-history`;
      console.log('📡 GET PATIENT MEDICAL HISTORY REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT MEDICAL HISTORY ERROR:', error);
      throw error;
    }
  },

  // Update patient medical history
  updatePatientMedicalHistory: async (patientId, medicalHistory) => {
    try {
      const endpoint = `/patients/${patientId}/medical-history`;
      console.log('📡 UPDATE PATIENT MEDICAL HISTORY REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.put(endpoint, medicalHistory);
      return response;
    } catch (error) {
      console.error('❌ UPDATE PATIENT MEDICAL HISTORY ERROR:', error);
      throw error;
    }
  },

  // Download patient report as PDF
  downloadPatientReportPDF: async (patientId) => {
    try {
      const endpoint = `/patients/get/download/aspdf/${patientId}`;
      console.log('📡 DOWNLOAD PATIENT REPORT PDF REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('❌ DOWNLOAD PATIENT REPORT PDF ERROR:', error);
      throw error;
    }
  }
};

export default patientService;
