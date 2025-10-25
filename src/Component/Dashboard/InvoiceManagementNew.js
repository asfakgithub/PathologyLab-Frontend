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
  Select,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { invoiceService } from '../../services/invoiceService';
import { getTests } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const InvoiceManagementNew = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAllInvoices();
      if (response.success) {
        setInvoices(response.data.invoices || []);
      }
    } catch (error) {
      setError('Failed to fetch invoices: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setOpenDialog(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setOpenDialog(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewDialog(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.deleteInvoice(invoiceId);
        setSuccess('Invoice deleted successfully');
        fetchInvoices();
      } catch (error) {
        setError('Failed to delete invoice: ' + error.message);
      }
    }
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'partially_paid': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Invoice Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateInvoice}
          sx={{ borderRadius: 2 }}
        >
          Create Invoice
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search and Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="primary">
                  {filteredInvoices.length}
                </Typography>
                <Typography variant="body2">Total</Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="success.main">
                  {filteredInvoices.filter(inv => inv.status === 'paid').length}
                </Typography>
                <Typography variant="body2">Paid</Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="warning.main">
                  {filteredInvoices.filter(inv => inv.status === 'pending').length}
                </Typography>
                <Typography variant="body2">Pending</Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Invoices Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Invoice #</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Patient</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {invoice.invoiceNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {invoice.invoiceId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {invoice.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.patientPhone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{invoice.totalAmount?.toFixed(2)}
                    </Typography>
                    {invoice.dueAmount > 0 && (
                      <Typography variant="caption" color="error">
                        Due: ₹{invoice.dueAmount?.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status?.toUpperCase()}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => handleViewInvoice(invoice)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditInvoice(invoice)}
                          color="secondary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {invoice.status !== 'paid' && (
                        <Tooltip title="Payment">
                          <IconButton
                            size="small"
                            onClick={() => handlePayment(invoice)}
                            color="success"
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteInvoice(invoice.invoiceId)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Create/Edit Invoice Dialog */}
      <InvoiceFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        invoice={editingInvoice}
        onSuccess={() => {
          setOpenDialog(false);
          fetchInvoices();
          setSuccess(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully');
        }}
        onError={(error) => setError(error)}
      />

      {/* View Invoice Dialog */}
      <InvoiceViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        invoice={selectedInvoice}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        invoice={selectedInvoice}
        onSuccess={() => {
          setPaymentDialog(false);
          fetchInvoices();
          setSuccess('Payment added successfully');
        }}
        onError={(error) => setError(error)}
      />
    </Box>
  );
};

// Invoice Form Dialog Component
const InvoiceFormDialog = ({ open, onClose, invoice, onSuccess, onError }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [formData, setFormData] = useState({
    // Patient Information
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    patientPhone: '',
    patientEmail: '',
    patientAddress: '',
    
    // Doctor Information
    doctorName: '',
    referredBy: '',
    
    // Invoice Information
    invoiceNumber: '',
    testDetails: [],
    discountAmount: 0,
    gstPercentage: 18,
    additionalCharges: 0,
    notes: '',
    paymentMethod: 'cash'
  });

  useEffect(() => {
    if (open) {
      fetchTests();
      if (invoice) {
        setFormData({ ...invoice });
      } else {
        resetForm();
      }
    }
  }, [open, invoice]);

  const fetchTests = async () => {
    try {
      const response = await getTests();
      const testsData = response.data?.data || response.data || [];
      setTests(testsData);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      patientAge: '',
      patientGender: 'Male',
      patientPhone: '',
      patientEmail: '',
      patientAddress: '',
      doctorName: '',
      referredBy: '',
      invoiceNumber: '',
      testDetails: [],
      discountAmount: 0,
      gstPercentage: 18,
      additionalCharges: 0,
      notes: '',
      paymentMethod: 'cash'
    });
    setActiveStep(0);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (invoice) {
        await invoiceService.updateInvoice(invoice.invoiceId, formData);
      } else {
        await invoiceService.createInvoice(formData);
      }
      
      onSuccess();
    } catch (error) {
      onError('Failed to save invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestSelect = (test) => {
    const newTest = {
      testName: test.name,
      testCode: test.code,
      testPrice: test.price || 0,
      category: test.category || 'General'
    };
    
    setFormData(prev => ({
      ...prev,
      testDetails: [...prev.testDetails, newTest]
    }));
  };

  const handleTestRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      testDetails: prev.testDetails.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.testDetails.reduce((sum, test) => sum + (test.testPrice || 0), 0);
    const discountAmount = formData.discountAmount || 0;
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = (taxableAmount * (formData.gstPercentage || 0)) / 100;
    const additionalCharges = formData.additionalCharges || 0;
    const total = taxableAmount + gstAmount + additionalCharges;
    
    return {
      subtotal,
      discountAmount,
      gstAmount,
      additionalCharges,
      total
    };
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {invoice ? 'Edit Invoice' : 'Create New Invoice'}
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Patient Information */}
          <Step>
            <StepLabel>Patient Information</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Patient Name"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={formData.patientAge}
                    onChange={(e) => handleInputChange('patientAge', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.patientGender}
                      onChange={(e) => handleInputChange('patientGender', e.target.value)}
                      label="Gender"
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.patientPhone}
                    onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={formData.patientAddress}
                    onChange={(e) => handleInputChange('patientAddress', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Doctor Name"
                    value={formData.doctorName}
                    onChange={(e) => handleInputChange('doctorName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Referred By"
                    value={formData.referredBy}
                    onChange={(e) => handleInputChange('referredBy', e.target.value)}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Tests and Pricing */}
          <Step>
            <StepLabel>Tests & Pricing</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={tests}
                    getOptionLabel={(option) => `${option.name} (${option.code}) - ₹${option.price}`}
                    onChange={(event, value) => {
                      if (value) {
                        handleTestSelect(value);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Add Test"
                        placeholder="Search and select tests..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Selected Tests
                  </Typography>
                  <List>
                    {formData.testDetails.map((test, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={`${test.testName} (${test.testCode})`}
                          secondary={`Category: ${test.category} | Price: ₹${test.testPrice}`}
                        />
                        <IconButton
                          edge="end"
                          onClick={() => handleTestRemove(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Discount Amount"
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="GST Percentage"
                    type="number"
                    value={formData.gstPercentage}
                    onChange={(e) => handleInputChange('gstPercentage', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Additional Charges"
                    type="number"
                    value={formData.additionalCharges}
                    onChange={(e) => handleInputChange('additionalCharges', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Review and Submit */}
          <Step>
            <StepLabel>Review & Submit</StepLabel>
            <StepContent>
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Invoice Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Patient: {formData.patientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tests: {formData.testDetails.length} items
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2">
                          Subtotal: ₹{totals.subtotal.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Discount: -₹{totals.discountAmount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          GST ({formData.gstPercentage}%): ₹{totals.gstAmount.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Additional Charges: ₹{totals.additionalCharges.toFixed(2)}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" color="primary">
                          Total: ₹{totals.total.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </CardContent>
              </Card>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <LoadingSpinner size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

// Invoice View Dialog Component
const InvoiceViewDialog = ({ open, onClose, invoice }) => {
  if (!invoice) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Invoice Details - {invoice.invoiceNumber}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Patient Information
                </Typography>
                <Typography variant="body2"><strong>Name:</strong> {invoice.patientName}</Typography>
                <Typography variant="body2"><strong>Age:</strong> {invoice.patientAge}</Typography>
                <Typography variant="body2"><strong>Gender:</strong> {invoice.patientGender}</Typography>
                <Typography variant="body2"><strong>Phone:</strong> {invoice.patientPhone}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {invoice.patientEmail}</Typography>
                <Typography variant="body2"><strong>Address:</strong> {invoice.patientAddress}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Invoice Information
                </Typography>
                <Typography variant="body2"><strong>Invoice ID:</strong> {invoice.invoiceId}</Typography>
                <Typography variant="body2"><strong>Invoice Number:</strong> {invoice.invoiceNumber}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</Typography>
                <Typography variant="body2"><strong>Status:</strong> 
                  <Chip 
                    label={invoice.status?.toUpperCase()} 
                    color={invoice.status === 'paid' ? 'success' : 'warning'} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2"><strong>Doctor:</strong> {invoice.doctorName}</Typography>
                <Typography variant="body2"><strong>Referred By:</strong> {invoice.referredBy}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Test Details
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Test Name</strong></TableCell>
                        <TableCell><strong>Code</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell align="right"><strong>Price</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoice.testDetails?.map((test, index) => (
                        <TableRow key={index}>
                          <TableCell>{test.testName}</TableCell>
                          <TableCell>{test.testCode}</TableCell>
                          <TableCell>{test.category}</TableCell>
                          <TableCell align="right">₹{test.testPrice?.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Financial Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">Subtotal: ₹{invoice.subtotalAmount?.toFixed(2)}</Typography>
                    <Typography variant="body2">Discount: -₹{invoice.discountAmount?.toFixed(2)}</Typography>
                    <Typography variant="body2">GST ({invoice.gstPercentage}%): ₹{invoice.gstAmount?.toFixed(2)}</Typography>
                    <Typography variant="body2">Additional Charges: ₹{invoice.additionalCharges?.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="primary">
                      Total Amount: ₹{invoice.totalAmount?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      Amount Paid: ₹{invoice.amountPaid?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      Due Amount: ₹{invoice.dueAmount?.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                {invoice.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Notes:</strong> {invoice.notes}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained" startIcon={<PrintIcon />}>
          Print
        </Button>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Payment Dialog Component
const PaymentDialog = ({ open, onClose, invoice, onSuccess, onError }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice && open) {
      setPaymentAmount(invoice.dueAmount?.toString() || '');
    }
  }, [invoice, open]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const amount = parseFloat(paymentAmount);
      
      if (amount <= 0 || amount > invoice.dueAmount) {
        onError('Invalid payment amount');
        return;
      }

      await invoiceService.addPayment(invoice.invoiceId, {
        amount,
        method: paymentMethod
      });

      onSuccess();
    } catch (error) {
      onError('Failed to process payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Payment - {invoice.invoiceNumber}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body2">Total Amount: ₹{invoice.totalAmount?.toFixed(2)}</Typography>
                  <Typography variant="body2">Amount Paid: ₹{invoice.amountPaid?.toFixed(2)}</Typography>
                  <Typography variant="h6" color="error">
                    Due Amount: ₹{invoice.dueAmount?.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                helperText={`Maximum: ₹${invoice.dueAmount?.toFixed(2)}`}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cheque">Cheque</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handlePayment}
          disabled={loading || !paymentAmount}
          startIcon={loading ? <LoadingSpinner size={20} /> : <PaymentIcon />}
        >
          {loading ? 'Processing...' : 'Add Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceManagementNew;
