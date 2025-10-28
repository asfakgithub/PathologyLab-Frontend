import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Alert,
  InputAdornment,
  Fab,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { 
  getInvoices, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice,
  getPatients,
  getTests,
  processPayment
} from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const InvoiceForm = ({ open, onClose, onSubmit, invoice, loading }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    items: [],
    notes: '',
    dueDate: '',
    discount: 0,
    tax: 0
  });
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentItem, setCurrentItem] = useState({
    testId: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0
  });

  useEffect(() => {
    if (open) {
      fetchPatients();
      fetchTests();
    }
  }, [open]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        patientId: invoice.patientId || '',
        items: invoice.items || [],
        notes: invoice.notes || '',
        dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
        discount: invoice.discount || 0,
        tax: invoice.tax || 0
      });
    } else {
      setFormData({
        patientId: '',
        items: [],
        notes: '',
        dueDate: '',
        discount: 0,
        tax: 0
      });
    }
    setErrors({});
  }, [invoice, open]);

  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (err) {
      console.error('Fetch patients error:', err);
      // Demo data
      setPatients([
        { _id: '1', name: 'John Smith' },
        { _id: '2', name: 'Sarah Johnson' }
      ]);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await getTests();
      if (response.data.success) {
        setTests(response.data.data);
      }
    } catch (err) {
      console.error('Fetch tests error:', err);
      // Demo data
      setTests([
        { _id: '1', name: 'Blood Test', price: 50 },
        { _id: '2', name: 'X-Ray', price: 100 },
        { _id: '3', name: 'MRI Scan', price: 300 }
      ]);
    }
  };

  const addItem = () => {
    if (!currentItem.testId) return;
    
    const test = tests.find(t => t._id === currentItem.testId);
    const newItem = {
      ...currentItem,
      testName: test?.name,
      total: (currentItem.unitPrice * currentItem.quantity) - currentItem.discount
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    setCurrentItem({
      testId: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0
    });
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * formData.tax) / 100;
    return {
      subtotal,
      discountAmount,
      taxAmount,
      total: subtotal - discountAmount + taxAmount
    };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientId) newErrors.patientId = 'Patient is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const totals = calculateTotal();
      onSubmit({
        ...formData,
        ...totals
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {invoice ? 'Edit Invoice' : 'Create New Invoice'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Patient Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) => option.name || ''}
                value={patients.find(p => p._id === formData.patientId) || null}
                onChange={(_, value) => setFormData(prev => ({ ...prev, patientId: value?._id || '' }))}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Patient" 
                    required
                    error={!!errors.patientId}
                    helperText={errors.patientId}
                  />
                )}
              />
            </Grid>
            
            {/* Due Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.dueDate}
                helperText={errors.dueDate}
              />
            </Grid>

            {/* Add Item Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Add Items
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={tests}
                    getOptionLabel={(option) => option.name || ''}
                    value={tests.find(t => t._id === currentItem.testId) || null}
                    onChange={(_, value) => {
                      setCurrentItem(prev => ({
                        ...prev,
                        testId: value?._id || '',
                        unitPrice: value?.price || 0
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Test/Service" />
                    )}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    type="number"
                    value={currentItem.unitPrice}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    label="Discount"
                    type="number"
                    value={currentItem.discount}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={addItem}
                    disabled={!currentItem.testId}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Items List */}
            {formData.items.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Invoice Items
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Test/Service</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Discount</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.testName}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">${item.unitPrice}</TableCell>
                          <TableCell align="right">${item.discount}</TableCell>
                          <TableCell align="right">${item.total}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => removeItem(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {/* Discount and Tax */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Discount (%)"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax (%)"
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>

            {/* Total Display */}
            {formData.items.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Invoice Summary</Typography>
                    <Box display="flex" justifyContent="between" mb={1}>
                      <Typography>Subtotal:</Typography>
                      <Typography>${calculateTotal().subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="between" mb={1}>
                      <Typography>Discount ({formData.discount}%):</Typography>
                      <Typography>-${calculateTotal().discountAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="between" mb={1}>
                      <Typography>Tax ({formData.tax}%):</Typography>
                      <Typography>${calculateTotal().taxAmount.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="between">
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6">${calculateTotal().total.toFixed(2)}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or instructions..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || formData.items.length === 0}
          >
            {loading ? 'Saving...' : (invoice ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const InvoiceManagement = () => {
  const { hasAnyRole } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getInvoices();
      if (response.data.success) {
        setInvoices(response.data.data);
      }
    } catch (err) {
      console.error('Fetch invoices error:', err);
      setError('Failed to load invoices');
      // Demo data
      setInvoices([
        {
          _id: '1',
          invoiceNumber: 'INV-001',
          patientId: { name: 'John Smith' },
          total: 150.00,
          status: 'pending',
          dueDate: '2024-01-15',
          createdAt: '2024-01-01',
          items: [
            { testName: 'Blood Test', quantity: 1, unitPrice: 50, total: 50 },
            { testName: 'X-Ray', quantity: 1, unitPrice: 100, total: 100 }
          ]
        },
        {
          _id: '2',
          invoiceNumber: 'INV-002',
          patientId: { name: 'Sarah Johnson' },
          total: 300.00,
          status: 'paid',
          dueDate: '2024-01-10',
          createdAt: '2023-12-28',
          paidAt: '2024-01-05',
          items: [
            { testName: 'MRI Scan', quantity: 1, unitPrice: 300, total: 300 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (formData) => {
    try {
      setFormLoading(true);
      const response = await createInvoice(formData);
      
      if (response.data.success) {
        setInvoices(prev => [response.data.data, ...prev]);
        setDialogOpen(false);
        setSelectedInvoice(null);
      }
    } catch (err) {
      console.error('Create invoice error:', err);
      setError('Failed to create invoice');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateInvoice = async (formData) => {
    try {
      setFormLoading(true);
      const response = await updateInvoice(selectedInvoice._id, formData);
      
      if (response.data.success) {
        setInvoices(prev => 
          prev.map(inv => inv._id === selectedInvoice._id ? response.data.data : inv)
        );
        setDialogOpen(false);
        setSelectedInvoice(null);
      }
    } catch (err) {
      console.error('Update invoice error:', err);
      setError('Failed to update invoice');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      try {
        await deleteInvoice(invoice._id);
        setInvoices(prev => prev.filter(inv => inv._id !== invoice._id));
      } catch (err) {
        console.error('Delete invoice error:', err);
        setError('Failed to delete invoice');
      }
    }
  };

  const handlePayment = async (invoice) => {
    try {
      const response = await processPayment(invoice._id, {
        amount: invoice.total,
        method: 'card'
      });
      
      if (response.data.success) {
        setInvoices(prev =>
          prev.map(inv => inv._id === invoice._id ? { ...inv, status: 'paid', paidAt: new Date() } : inv)
        );
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const canManage = hasAnyRole(['master', 'admin', 'receptionist']);

  if (!canManage) {
    return (
      <Alert severity="warning">
        You don't have permission to access invoice management.
      </Alert>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Invoice Management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search invoices by number or patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Invoices Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {invoice.invoiceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{invoice.patientId?.name}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      ${invoice.total?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      size="small"
                      color={getStatusColor(invoice.status)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" title="View">
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setDialogOpen(true);
                      }}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    {invoice.status === 'pending' && (
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handlePayment(invoice)}
                        title="Process Payment"
                      >
                        <PaymentIcon />
                      </IconButton>
                    )}
                    <IconButton size="small" title="Print">
                      <PrintIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteInvoice(invoice)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredInvoices.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
        />
      </Paper>

      {/* Add Invoice FAB */}
      <Fab
        color="primary"
        aria-label="add invoice"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          setSelectedInvoice(null);
          setDialogOpen(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* Invoice Form Dialog */}
      <InvoiceForm
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={selectedInvoice ? handleUpdateInvoice : handleCreateInvoice}
        invoice={selectedInvoice}
        loading={formLoading}
      />
    </Box>
  );
};

export default InvoiceManagement;
