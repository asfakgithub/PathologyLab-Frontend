import { useState, useEffect, useCallback } from 'react';
import invoiceService from '../../services/invoiceService';

const useInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAllInvoices();
      if (response) {
        // response shape may vary depending on backend; try common shapes
        const data = response.data?.data || response.data || response;
        // try common nested property
        setInvoices(data.invoices || data || []);
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const addInvoice = async (invoiceData) => {
    try {
      await invoiceService.createInvoice(invoiceData);
      setSuccess('Invoice created successfully');
      fetchInvoices();
    } catch (error) {
      setError('Failed to create invoice: ' + error.message);
    }
  };

  const updateInvoice = async (invoiceId, invoiceData) => {
    try {
      await invoiceService.updateInvoice(invoiceId, invoiceData);
      setSuccess('Invoice updated successfully');
      fetchInvoices();
    } catch (error) {
      setError('Failed to update invoice: ' + error.message);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    try {
      await invoiceService.deleteInvoice(invoiceId);
      setSuccess('Invoice deleted successfully');
      fetchInvoices();
    } catch (error) {
      setError('Failed to delete invoice: ' + error.message);
    }
  };

  const addPayment = async (invoiceId, paymentData) => {
    try {
      await invoiceService.addPayment(invoiceId, paymentData);
      setSuccess('Payment added successfully');
      fetchInvoices();
    } catch (error) {
      setError('Failed to process payment: ' + error.message);
    }
  };

  return {
    invoices,
    loading,
    error,
    success,
    fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addPayment,
    setError,
    setSuccess
  };
};

export default useInvoices;
