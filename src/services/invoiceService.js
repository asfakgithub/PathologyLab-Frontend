import apiClient from './apiClient';
import { endpoints } from './api';

console.log('🔍 INVOICE SERVICE DEBUG:');
console.log('  API client baseURL:', apiClient.defaults.baseURL);

// Invoice API functions
export const invoiceService = {
  // Create new invoice
  createInvoice: async (invoiceData) => {
    try {
      const endpoint = endpoints.invoices.create; // '/invoices'
      console.log('📡 CREATE INVOICE REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.post(endpoint, invoiceData);
      return response;
    } catch (error) {
      console.error('❌ CREATE INVOICE ERROR:', error);
      throw error;
    }
  },

  // Get all invoices
  getAllInvoices: async (params = {}) => {
    try {
      console.log('📡 GET ALL INVOICES REQUEST:', `[GET]`, endpoints.invoices.list, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoints.invoices.list, { params });
      return response;
    } catch (error) {
      console.error('❌ GET ALL INVOICES ERROR:', error);
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const endpoint = endpoints.invoices.getById(invoiceId);
      console.log('📡 GET INVOICE BY ID REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update invoice
  updateInvoice: async (invoiceId, updateData) => {
    try {
      const endpoint = endpoints.invoices.update(invoiceId);
      console.log('📡 UPDATE INVOICE REQUEST:', `[PUT]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.put(endpoint, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update invoice status
  updateInvoiceStatus: async (invoiceId, status) => {
    try {
      const endpoint = `/invoices/status/${invoiceId}`;
      console.log('📡 UPDATE INVOICE STATUS REQUEST:', `[PATCH]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.patch(endpoint, { status });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add payment to invoice
  addPayment: async (invoiceId, paymentData) => {
    try {
      const endpoint = endpoints.invoices.addPayment(invoiceId);
      console.log('📡 ADD PAYMENT TO INVOICE REQUEST:', `[POST]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.post(endpoint, paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoices by patient ID
  getInvoicesByPatient: async (patientId) => {
    try {
      const endpoint = `/invoices/patient/${patientId}`;
      console.log('📡 GET INVOICES BY PATIENT REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete invoice
  deleteInvoice: async (invoiceId) => {
    try {
      const endpoint = endpoints.invoices.delete(invoiceId);
      console.log('📡 DELETE INVOICE REQUEST:', `[DELETE]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.delete(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice statistics
  getInvoiceStats: async () => {
    try {
      const endpoint = endpoints.invoices.stats;
      console.log('📡 GET INVOICE STATS REQUEST:', `[GET]`, endpoint, 'BaseURL:', apiClient.defaults.baseURL);
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default invoiceService;
