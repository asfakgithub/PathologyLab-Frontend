/**
 * Invoice Management API Service
 * Handles all invoice-related API calls
 */
import apiClient from '../apiClient';

export const invoiceAPI = {
  // Create new invoice
  createInvoice: async (invoiceData) => {
    try {
      const response = await apiClient.post('/invoices', invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all invoices
  getAllInvoices: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `/invoices?${queryParams}` : '/invoices';
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update invoice
  updateInvoice: async (invoiceId, invoiceData) => {
    try {
      const response = await apiClient.put(`/invoices/${invoiceId}`, invoiceData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete invoice
  deleteInvoice: async (invoiceId) => {
    try {
      const response = await apiClient.delete(`/invoices/${invoiceId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add payment to invoice
  // Add payment to invoice (backend uses PATCH /invoices/status/:invoiceId)
  addPayment: async (invoiceId, paymentData) => {
    try {
      // backend expects { amountPaid, paymentMethod } in body
      const body = {
        amountPaid: paymentData.amount ?? paymentData.amountPaid ?? 0,
        paymentMethod: paymentData.paymentMethod || paymentData.method || 'cash'
      };
      const response = await apiClient.patch(`/invoices/status/${invoiceId}`, body);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice payment history
  // Get invoice payment history (fetch invoice and read payments)
  getPaymentHistory: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      // response should include invoice.payments — caller can read it
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice statistics
  getInvoiceStats: async () => {
    try {
      const response = await apiClient.get('/invoices/stats');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get outstanding invoices
  getOutstandingInvoices: async () => {
    try {
      const response = await apiClient.get('/invoices/outstanding');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generate invoice PDF
  generateInvoicePDF: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}/pdf`, {
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
      const response = await apiClient.post(`/invoices/${invoiceId}/send-email`, emailData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Export invoices data
  exportInvoicesData: async (format = 'csv') => {
    try {
      const response = await apiClient.get('/invoices/export', {
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
      const response = await apiClient.get('/invoices/search', {
        params: { q: searchQuery }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default invoiceAPI;
