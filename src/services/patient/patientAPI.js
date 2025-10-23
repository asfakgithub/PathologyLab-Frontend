/**
 * Patient Management API Service
 * Handles all patient-related API calls
 */
import apiClient from '../apiClient';

export const patientAPI = {
  // Get all patients
  getAllPatients: async (params = {}) => {
    try {
      const response = await apiClient.get('/patients', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get patient by ID
  getPatientById: async (patientId) => {
    try {
      const response = await apiClient.get(`/patients/get/${patientId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create new patient
  createPatient: async (patientData) => {
    try {
      const response = await apiClient.post('/patients/post', patientData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update patient
  updatePatient: async (patientId, patientData) => {
    try {
      const response = await apiClient.put(`/patients/${patientId}`, patientData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete patient
  deletePatient: async (patientId) => {
    try {
      const response = await apiClient.delete(`/patients/${patientId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search patients
  searchPatients: async (searchQuery) => {
    try {
      const response = await apiClient.get('/patients/search', {
        params: { q: searchQuery }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get patient statistics
  getPatientStats: async () => {
    try {
      const response = await apiClient.get('/patients/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get patients by age range
  getPatientsByAgeRange: async (minAge, maxAge) => {
    try {
      const response = await apiClient.get(`/patients/age-range/${minAge}/${maxAge}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get patients by blood group
  getPatientsByBloodGroup: async (bloodGroup) => {
    try {
      const response = await apiClient.get(`/patients/blood-group/${bloodGroup}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get patient reports
  getPatientReports: async (patientId) => {
    try {
      const response = await apiClient.get(`/patients/${patientId}/reports`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get patient test history
  getPatientTestHistory: async (patientId) => {
    try {
      const response = await apiClient.get(`/patients/${patientId}/test-history`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get patient medical history
  getPatientMedicalHistory: async (patientId) => {
    try {
      const response = await apiClient.get(`/patients/${patientId}/medical-history`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export patients data
  exportPatientsData: async (format = 'csv') => {
    try {
      const response = await apiClient.get('/patients/export', {
        params: { format },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default patientAPI;
