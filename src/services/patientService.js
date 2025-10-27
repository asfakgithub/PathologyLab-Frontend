import axios from 'axios';

// Patient API configuration
const PATIENT_API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1`;

// Create axios instance for patient API
const patientApi = axios.create({
  baseURL: PATIENT_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
patientApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for patient API
patientApi.interceptors.response.use(
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

// Patient API functions
export const patientService = {
  // Get all patients with filtering and pagination
  getAllPatients: async (params = {}) => {
    try {
      const endpoint = '/patients';
      console.log('📡 GET ALL PATIENTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint, { params });
      return response;
    } catch (error) {
      console.error('❌ GET ALL PATIENTS ERROR:', error);
      throw error;
    }
  },

  // Get patient by ID
  getPatientById: async (patientId) => {
    try {
      const endpoint = `/patients/get/${patientId}`;
      console.log('📡 GET PATIENT BY ID REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT BY ID ERROR:', error);
      throw error;
    }
  },

  // Create new patient
  createPatient: async (patientData) => {
    try {
      const endpoint = '/patients/post';
      console.log('📡 CREATE PATIENT REQUEST:', `[POST]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      console.log('👤 Patient Data:', patientData);
      const response = await patientApi.post(endpoint, patientData);
      return response;
    } catch (error) {
      console.error('❌ CREATE PATIENT ERROR:', error);
      throw error;
    }
  },

  // Update patient
  updatePatient: async (patientId, updateData) => {
    try {
      const endpoint = `/patients/${patientId}`;
      console.log('📡 UPDATE PATIENT REQUEST:', `[PUT]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.put(endpoint, updateData);
      return response;
    } catch (error) {
      console.error('❌ UPDATE PATIENT ERROR:', error);
      throw error;
    }
  },

  // Delete patient
  deletePatient: async (patientId) => {
    try {
      const endpoint = `/patients/${patientId}`;
      console.log('📡 DELETE PATIENT REQUEST:', `[DELETE]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.delete(endpoint);
      return response;
    } catch (error) {
      console.error('❌ DELETE PATIENT ERROR:', error);
      throw error;
    }
  },

  // Search patients
  searchPatients: async (searchQuery) => {
    try {
      const endpoint = '/patients/search';
      console.log('📡 SEARCH PATIENTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint, { params: { q: searchQuery } });
      return response;
    } catch (error) {
      console.error('❌ SEARCH PATIENTS ERROR:', error);
      throw error;
    }
  },

  // Get patient statistics
  getPatientStats: async () => {
    try {
      const endpoint = '/patients/stats';
      console.log('📡 GET PATIENT STATS REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT STATS ERROR:', error);
      throw error;
    }
  },

  // Get patient reports
  getPatientReports: async (patientId) => {
    try {
      const endpoint = `/patients/${patientId}/reports`;
      console.log('📡 GET PATIENT REPORTS REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
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
      console.log('📡 ADD TEST RESULTS REQUEST:', `[POST]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.post(endpoint, testResults);
      return response;
    } catch (error) {
      console.error('❌ ADD TEST RESULTS ERROR:', error);
      throw error;
    }
  },

  // Get patient test history
  getPatientTestHistory: async (patientId) => {
    try {
      const endpoint = `/patients/${patientId}/test-history`;
      console.log('📡 GET PATIENT TEST HISTORY REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
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
      console.log('📡 GET PATIENT INVOICES REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET PATIENT INVOICES ERROR:', error);
      throw error;
    }
  },

  // Export patient data
  exportPatientData: async (patientId, format = 'pdf') => {
    try {
      const endpoint = `/patients/${patientId}/export`;
      console.log('📡 EXPORT PATIENT DATA REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint, {
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
      console.log('📡 GET PATIENTS BY STATUS REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
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
      console.log('📡 GET PATIENT TEST DETAILS REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
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
      console.log('📡 GET PATIENTS BY AGE RANGE REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
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
      console.log('📡 GET PATIENTS BY BLOOD GROUP REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
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
      console.log('📡 GET PATIENT MEDICAL HISTORY REQUEST:', `[GET]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.get(endpoint);
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
      console.log('📡 UPDATE PATIENT MEDICAL HISTORY REQUEST:', `[PUT]`, endpoint, 'BaseURL:', patientApi.defaults.baseURL);
      const response = await patientApi.put(endpoint, medicalHistory);
      return response;
    } catch (error) {
      console.error('❌ UPDATE PATIENT MEDICAL HISTORY ERROR:', error);
      throw error;
    }
  }
};

export default patientService;
