/**
 * Invoice Management API Service
 * Handles all invoice-related API calls
 */
import apiClient from '../apiClient';

export const invoiceAPI = {
  // Create new invoice
  createInvoice: async (invoiceData) => {
    try {
      const response = await apiClient.post('/api/v1/invoices/create', invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all invoices
  getAllInvoices: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/invoice?${queryParams}` : '/invoice';
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoice/${invoiceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update invoice
  updateInvoice: async (invoiceId, invoiceData) => {
    try {
      const response = await apiClient.put(`/invoice/${invoiceId}`, invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete invoice
  deleteInvoice: async (invoiceId) => {
    try {
      const response = await apiClient.delete(`/invoice/${invoiceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add payment to invoice
  addPayment: async (invoiceId, paymentData) => {
    try {
      const response = await apiClient.post(`/invoice/payment/${invoiceId}`, paymentData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice payment history
  getPaymentHistory: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoice/payment/${invoiceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice statistics
  getInvoiceStats: async () => {
    try {
      const response = await apiClient.get('/invoice/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get outstanding invoices
  getOutstandingInvoices: async () => {
    try {
      const response = await apiClient.get('/invoice/outstanding');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generate invoice PDF
  generateInvoicePDF: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoice/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Send invoice via email
  sendInvoiceEmail: async (invoiceId, emailData) => {
    try {
      const response = await apiClient.post(`/invoice/${invoiceId}/send-email`, emailData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export invoices data
  exportInvoicesData: async (format = 'csv') => {
    try {
      const response = await apiClient.get('/invoice/export', {
        params: { format },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search invoices
  searchInvoices: async (searchQuery) => {
    try {
      const response = await apiClient.get('/invoice/search', {
        params: { q: searchQuery }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default invoiceAPI;
