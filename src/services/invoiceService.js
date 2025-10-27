import axios from 'axios';

// Invoice API configuration  
const INVOICE_API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}`;

console.log('🔍 INVOICE SERVICE DEBUG:');
console.log('  REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('  INVOICE_API_BASE_URL:', INVOICE_API_BASE_URL);

// Create axios instance for invoice API (no auth required)
const invoiceApi = axios.create({
  baseURL: INVOICE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for invoice API
invoiceApi.interceptors.response.use(
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

// Invoice API functions
export const invoiceService = {
  // Create new invoice
  createInvoice: async (invoiceData) => {
    try {
      const endpoint = '/invoice/create';
      console.log('📡 CREATE INVOICE REQUEST:', `[POST]`, endpoint, 'BaseURL:', invoiceApi.defaults.baseURL);
      const response = await invoiceApi.post(endpoint, invoiceData);
      return response;
    } catch (error) {
      console.error('❌ CREATE INVOICE ERROR:', error);
      throw error;
    }
  },

  // Get all invoices
  getAllInvoices: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const endpoint = queryParams ? `/invoice?${queryParams}` : '/invoice';
      console.log('📡 GET ALL INVOICES REQUEST:', `[GET]`, endpoint, 'BaseURL:', invoiceApi.defaults.baseURL);
      const response = await invoiceApi.get(endpoint);
      return response;
    } catch (error) {
      console.error('❌ GET ALL INVOICES ERROR:', error);
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const endpoint = `/invoice/${invoiceId}`;
      console.log('📡 GET INVOICE BY ID REQUEST:', `[GET]`, endpoint, 'BaseURL:', invoiceApi.defaults.baseURL);
      const response = await invoiceApi.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update invoice
  updateInvoice: async (invoiceId, updateData) => {
    try {
      const endpoint = `/invoice/update/${invoiceId}`;
      console.log('📡 UPDATE INVOICE REQUEST:', `[PUT]`, endpoint, 'BaseURL:', invoiceApi.defaults.baseURL);
      const response = await invoiceApi.put(endpoint, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update invoice status
  updateInvoiceStatus: async (invoiceId, status) => {
    try {
      const endpoint = `/invoice/status/${invoiceId}`;
      console.log('📡 UPDATE INVOICE STATUS REQUEST:', `[PATCH]`, endpoint, 'BaseURL:', invoiceApi.defaults.baseURL);
      const response = await invoiceApi.patch(endpoint, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add payment to invoice
  addPayment: async (invoiceId, paymentData) => {
    try {
      const endpoint = `/invoice/payment/${invoiceId}`;
      console.log('📡 ADD PAYMENT TO INVOICE REQUEST:', `[POST]`, endpoint, 'BaseURL:', invoiceApi.defaults.baseURL);
      const response = await invoiceApi.post(endpoint, paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoices by patient ID
  getInvoicesByPatient: async (patientId) => {
    try {
      const endpoint = `/invoice/patient/${patientId}`;
      console.log('📡 GET INVOICES BY PATIENT REQUEST:', `[GET]`, endpoint, 'BaseURL:', invoiceApi.defaults.baseURL);
      const response = await invoiceApi.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete invoice
  deleteInvoice: async (invoiceId) => {
    try {
      const endpoint = `/invoice/${invoiceId}`;
      console.log('📡 DELETE INVOICE REQUEST:', `[DELETE]`, endpoint, 'BaseURL:', invoiceApi.defaults.baseURL);
      const response = await invoiceApi.delete(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice statistics
  getInvoiceStats: async () => {
    try {
      const endpoint = '/invoice/stats/summary';
      console.log('📡 GET INVOICE STATS REQUEST:', `[GET]`, endpoint, 'BaseURL:', invoiceApi.defaults.baseURL);
      const response = await invoiceApi.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default invoiceService;
