import React, { useState, useEffect, useContext, useCallback } from 'react';
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
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { invoiceService } from '../../services/invoiceService';
import { getPatients, getTests, getUsers } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import useSystemNotification from '../../core/hooks/useSystemNotification';
import { SettingsContext } from '../../context/SettingsContext';

const InvoiceManagementNew = () => {
  const { sendSystemNotification } = useSystemNotification();
  const { settings } = useContext(SettingsContext);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
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
  const [patients, setPatients] = useState([]);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
    fetchUsers();
    fetchPatients()
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

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      // Assuming the patient array is in response.data.data based on previous interactions
      setPatients(response.data?.patients || []);
    } catch (err) {
      setError('Failed to fetch patients: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };
  console.log('Patients:', patients);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      const usersData = (res?.data || res) || [];
      // prefer doctors/admins for recipient selection
      const filtered = usersData.filter(u => ['doctor', 'admin', 'master', 'compounder'].includes(u.role));
      setUsers(filtered);
    } catch (err) {
      console.error('Failed to fetch users for recipient selector:', err);
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setOpenDialog(true);
  };

  const handleEditInvoice = (patientId) => {
    const invoiceToView = patients.find(p => p._id === patientId);
    setEditingInvoice(invoiceToView);
    setOpenDialog(true);
  };

  const handleViewInvoice = (patientId) => {
    const patientToView = patients.find(p => p._id === patientId);
    setSelectedInvoice(patientToView);
    setViewDialog(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const invoiceToDelete = invoices.find(inv => inv.invoiceId === invoiceId);
        await invoiceService.deleteInvoice(invoiceId);
        if (invoiceToDelete) {
          try {
            await sendSystemNotification({
              message: `Invoice ${invoiceToDelete.invoiceNumber || invoiceToDelete.invoiceId} for patient ${invoiceToDelete.patientName || invoiceToDelete.patientId || 'Unknown'} has been deleted.`,
              recipient: selectedRecipient?._id,
              recipientEmail: selectedRecipient?.email
            });
          } catch (notificationError) {
            console.error('Failed to send invoice deletion notification:', notificationError);
          }
        }
        setSuccess('Invoice deleted successfully');
        fetchInvoices();
      } catch (error) {
        setError('Failed to delete invoice: ' + error.message);
      }
    }
  };

  const handlePayment = (patientId) => {
    const patientPaymentView = patients.find(p => p._id === patientId);
    setSelectedInvoice(patientPaymentView);
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

  const { billingEnabled, allowEdit, allowDelete } = settings.invoice || {};

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.billing?.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.mobileNo || '').includes(searchTerm)
  );

  const paginatedPatients = filteredPatients.slice(
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => option?.name || option?.email || option?.firstName || ''}
              value={selectedRecipient}
              onChange={(e, newVal) => setSelectedRecipient(newVal)}
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Notify Recipient (optional)" size="small" />
              )}
            />
            <Tooltip title="If no recipient is chosen, the message will be delivered to an admin/master user by default.">
              <IconButton size="small" aria-label="recipient-info">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {/* {billingEnabled &&
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateInvoice}
              sx={{ borderRadius: 2 }}
            >
              Create Invoice
            </Button>
          } */}
        </Box>
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
                  {filteredPatients.length}
                </Typography>
                <Typography variant="body2">Total</Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="success.main">
                  {filteredPatients.filter(p => p.billing?.paymentStatus === 'paid').length}
                </Typography>
                <Typography variant="body2">Paid</Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="warning.main">
                  {filteredPatients.filter(p => p.billing?.paymentStatus === 'pending').length}
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
              {patients.map((patient) => (
                <TableRow key={patient._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {patient.billing?.invoiceNumber || patient._id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {patient.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {patient.mobileNo}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(patient.examinedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{patient.billing?.totalAmount?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={patient.status?.toUpperCase()}
                      color={getStatusColor(patient.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => handleViewInvoice(patient._id)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {allowEdit &&
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditInvoice(patient._id)}
                            color="secondary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      }
                      {patient.status !== 'paid' && (
                        <Tooltip title="Payment">
                          <IconButton
                            size="small"
                            onClick={() => handlePayment(patient._id)}
                            color="success"
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {allowDelete &&
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            // onClick={() => handleDeleteInvoice(invoice.invoiceId)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      }
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
          count={filteredPatients.length}
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
        settings={settings.invoice}
        selectedRecipient={selectedRecipient}
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
        patient={selectedInvoice}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        invoice={selectedInvoice}
        selectedRecipient={selectedRecipient}
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
const InvoiceFormDialog = ({ open, onClose, invoice, onSuccess, onError, selectedRecipient, settings }) => {
  const { sendSystemNotification } = useSystemNotification();
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
    tests: [],
    discountPercentage: settings?.discountPercent || 0,
    gstPercentage: settings?.defaultGST || 18,
    additionalCharges: settings?.additionalCharges || 0,
    notes: '',
    paymentMethod: 'cash'
  });

  const resetForm = useCallback(() => {
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
      tests: [],
      discountPercentage: settings?.discountPercent || 0,
      gstPercentage: settings?.defaultGST || 18,
      additionalCharges: settings?.additionalCharges || 0,
      notes: '',
      paymentMethod: 'cash'
    });
    setActiveStep(0);
  }, [settings]);

  useEffect(() => {
    if (open) {
      fetchTests();
      if (invoice) {
        setFormData({
          ...invoice,
          gstPercentage: invoice.gstPercentage || settings?.defaultGST || 18,
          discountPercentage: invoice.discountPercentage || settings?.discountPercent || 0,
          additionalCharges: invoice.additionalCharges || settings?.additionalCharges || 0
        });
      } else {
        resetForm();
      }
    }
  }, [open, invoice, settings, resetForm]);

  const fetchTests = async () => {
    try {
      const response = await getTests();
      const testsData = response.data?.data || response.data || [];
      setTests(testsData);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    }
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
        try {
          await sendSystemNotification({
            message: `Invoice ${formData.invoiceNumber} for patient ${formData.patientName} has been updated.`,
            recipient: selectedRecipient?._id,
            recipientEmail: selectedRecipient?.email
          });
        } catch (notificationError) {
          console.error('Failed to send invoice update notification:', notificationError);
        }
      } else {
        await invoiceService.createInvoice(formData);
        try {
          await sendSystemNotification({
            message: `New invoice for patient ${formData.patientName} has been created.`,
            recipient: selectedRecipient?._id,
            recipientEmail: selectedRecipient?.email
          });
        } catch (notificationError) {
          console.error('Failed to send invoice creation notification:', notificationError);
        }
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
      tests: [...prev.tests, newTest]
    }));
  };

  const handleTestRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const testDetailsArray = formData.tests || [];
    const subtotal = testDetailsArray.reduce((sum, test) => sum + (test.testPrice || 0), 0);
    const discountAmount = (subtotal * (formData.discountPercentage || 0)) / 100;
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
          {/* <Step>
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
          </Step> */}

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
                    {(formData.tests || []).map((test, index) => (
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
                    label="Discount Percentage"
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
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
                        Tests: {(formData.tests || []).length} items
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
const InvoiceViewDialog = ({ open, onClose, patient }) => {
  if (!patient) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Invoice Details - {patient.billing?.invoiceNumber || patient._id.slice(-8)}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              {/* <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Patient Information
                </Typography>
                <Typography variant="body2"><strong>Name:</strong> {patient.name}</Typography>
                <Typography variant="body2"><strong>Age:</strong> {patient.age}</Typography>
                <Typography variant="body2"><strong>Gender:</strong> {patient.gender}</Typography>
                <Typography variant="body2"><strong>Phone:</strong> {patient.mobileNo}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {patient.email}</Typography>
                <Typography variant="body2"><strong>Address:</strong> {[patient.address?.street, patient.address?.city, patient.address?.state].filter(Boolean).join(', ')}</Typography>
              </CardContent> */}
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Invoice Information
                </Typography>
                <Typography variant="body2"><strong>Invoice ID:</strong> {patient.billing?.invoiceId || patient._id}</Typography>
                <Typography variant="body2"><strong>Invoice Number:</strong> {patient.billing?.invoiceNumber || patient._id.slice(-8)}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {new Date(patient.createdAt).toLocaleDateString()}</Typography>
                <Typography variant="body2"><strong>Status:</strong>
                  <Chip
                    label={patient.billing?.paymentStatus?.toUpperCase()}
                    color={patient.billing?.paymentStatus === 'paid' ? 'success' : 'warning'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
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
                        {/* <TableCell><strong>Code</strong></TableCell> */}
                        {/* <TableCell><strong>Category</strong></TableCell> */}
                        <TableCell align="right"><strong>Price</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {patient.tests?.map((item, index) => (
                        <React.Fragment key={index}>
                          <TableRow>
                            <TableCell><strong>{item.testName}</strong></TableCell>
                            <TableCell align="right"><strong>₹{item.price?.toFixed(2)}</strong></TableCell>
                          </TableRow>
                        </React.Fragment>
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
                    <Typography variant="body2">Subtotal: ₹{patient.billing?.totalAmount?.toFixed(2)}</Typography>
                    <Typography variant="body2">Discount: -₹{patient.billing?.discountAmount?.toFixed(2) || '0.00'}</Typography>
                    <Typography variant="body2">GST ({patient.billing?.gstPercentage || 18}%): ₹{patient.billing?.gstAmount?.toFixed(2) || '0.00'}</Typography>
                    <Typography variant="body2">Additional Charges: ₹{patient.billing?.additionalCharges?.toFixed(2) || '0.00'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="primary">
                      Total Amount: ₹{patient.billing?.totalAmount?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      Amount Paid: ₹{patient.billing?.paidAmount?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      Due Amount: ₹{patient.billing?.pendingAmount?.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                {patient.specialInstructions && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Notes:</strong> {patient.notes}
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
const PaymentDialog = ({ open, onClose, invoice, onSuccess, onError, selectedRecipient }) => {
  const { sendSystemNotification } = useSystemNotification();
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

      try {
        await sendSystemNotification({
          message: `A payment of ₹${amount} was added to invoice ${invoice.invoiceNumber || invoice.invoiceId || invoice._id} for patient ${invoice.patientName || invoice.patientId || 'Unknown'}.`,
          recipient: selectedRecipient?._id,
          recipientEmail: selectedRecipient?.email
        });
      } catch (notificationError) {
        console.error('Failed to send payment notification:', notificationError);
      }

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
      <DialogTitle>Add Payment - {invoice.invoiceNumber || invoice.invoiceId || invoice._id}</DialogTitle>
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
