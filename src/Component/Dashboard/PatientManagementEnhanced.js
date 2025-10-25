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
  Alert,
  InputAdornment,
  Avatar,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Receipt as InvoiceIcon,
  Save as SaveIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getPatients, createPatient, updatePatient, deletePatient, getTests } from '../../services/api';
import { invoiceService } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const PatientManagementEnhanced = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [invoiceMode, setInvoiceMode] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      setPatients(response.data || []);
    } catch (error) {
      setError('Failed to fetch patients: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = () => {
    setEditingPatient(null);
    setInvoiceMode(false);
    setOpenDialog(true);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setInvoiceMode(false);
    setOpenDialog(true);
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await deletePatient(patientId);
        setSuccess('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        setError('Failed to delete patient: ' + error.message);
      }
    }
  };

  const handleCreateInvoice = (patient) => {
    // Open dialog for patient editing but with invoice creation enabled
    setEditingPatient(patient);
    setInvoiceMode(true);
    setOpenDialog(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
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
          Patient Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreatePatient}
          sx={{ borderRadius: 2 }}
        >
          Add Patient
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

      {/* Search and Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search patients..."
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
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary">
              {filteredPatients.length}
            </Typography>
            <Typography variant="body2">Total Patients</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Patients Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Patient</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Age/Gender</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Registered</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {patient.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {patient._id?.slice(-8)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{patient.phone}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {patient.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {patient.age} years, {patient.gender}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View">
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPatient(patient)}
                          color="secondary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Create Invoice">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleCreateInvoice(patient)}
                        >
                          <InvoiceIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePatient(patient._id)}
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

      {/* Patient Form Dialog */}
      <PatientFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        patient={editingPatient}
        invoiceMode={invoiceMode}
        onSuccess={() => {
          setOpenDialog(false);
          fetchPatients();
          if (invoiceMode) {
            setSuccess('Invoice created successfully for patient');
          } else {
            setSuccess(editingPatient ? 'Patient updated successfully' : 'Patient created successfully');
          }
        }}
        onError={(error) => setError(error)}
      />
    </Box>
  );
};

// Enhanced Patient Form Dialog with Invoice Creation
const PatientFormDialog = ({ open, onClose, patient, invoiceMode = false, onSuccess, onError }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [createInvoice, setCreateInvoice] = useState(true);
  const [formData, setFormData] = useState({
    // Patient Information
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    
    // Medical Information
    bloodGroup: '',
    allergies: '',
    medicalHistory: '',
    
    // Invoice Information (if creating invoice)
    doctorName: '',
    referredBy: '',
    selectedTests: [],
    discountAmount: 0,
    gstPercentage: 18,
    additionalCharges: 0,
    notes: ''
  });

  const steps = createInvoice 
    ? (invoiceMode ? ['Patient Details', 'Test Selection', 'Review & Submit'] : ['Patient Details', 'Medical Info', 'Test Selection', 'Review & Submit'])
    : ['Patient Details', 'Medical Info', 'Review & Submit'];

  useEffect(() => {
    if (open) {
      fetchTests();
      if (patient) {
        setFormData({
          ...patient,
          selectedTests: [],
          doctorName: '',
          referredBy: '',
          discountAmount: 0,
          gstPercentage: 18,
          additionalCharges: 0,
          notes: ''
        });
        setCreateInvoice(invoiceMode); // Enable invoice creation if in invoice mode
      } else {
        resetForm();
      }
    }
  }, [open, patient, invoiceMode]);

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
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      bloodGroup: '',
      allergies: '',
      medicalHistory: '',
      doctorName: '',
      referredBy: '',
      selectedTests: [],
      discountAmount: 0,
      gstPercentage: 18,
      additionalCharges: 0,
      notes: ''
    });
    setActiveStep(0);
    setCreateInvoice(true);
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
      // Prepare patient data
      const patientData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          country: formData.address.country
        },
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        medicalHistory: formData.medicalHistory
      };
console.log("Patient adress is ",patientData?.address);

      let savedPatient;
      if (invoiceMode) {
        // In invoice mode, just use existing patient data
        savedPatient = patient;
      } else if (patient) {
        // Update existing patient
        await updatePatient(patient._id, patientData);
        savedPatient = { ...patient, ...patientData };
      } else {
        // Create new patient
        const response = await createPatient(patientData);
        savedPatient = response.data;
      }

      // Create invoice if requested and tests are selected
      if (createInvoice && formData.selectedTests.length > 0) {
        const invoiceData = {
          patientName: formData.name,
          patientAge: parseInt(formData.age),
          patientGender: formData.gender,
          patientPhone: formData.phone,
          patientEmail: formData.email,
        patientAddress: formData.address,
        //.map((addr) => `${addr?.street}, ${addr?.city}, ${addr?.state}, ${addr?.zipCode}, ${addr?.country}`).join(' | '),
          doctorName: formData.doctorName,
          referredBy: formData.referredBy,
          testDetails: formData.selectedTests.map(test => ({
            testName: test.name,
            testCode: test.code,
            testPrice: test.price || 0,
            category: test.category || 'General'
          })),
          discountAmount: formData.discountAmount,
          gstPercentage: formData.gstPercentage,
          additionalCharges: formData.additionalCharges,
          notes: formData.notes
        };

        await invoiceService.createInvoice(invoiceData);
      }

      onSuccess();
    } catch (error) {
      onError('Failed to save patient: ' + error.message);
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
    if (!formData.selectedTests.find(t => t._id === test._id)) {
      setFormData(prev => ({
        ...prev,
        selectedTests: [...prev.selectedTests, test]
      }));
    }
  };

  const handleTestRemove = (testId) => {
    setFormData(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.filter(t => t._id !== testId)
    }));
  };

  // Handler for nested address fields
  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.selectedTests.reduce((sum, test) => sum + (test.price || 0), 0);
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
        {invoiceMode ? 'Create Invoice for Patient' : patient ? 'Edit Patient' : 'Add New Patient'}
        {(!patient || invoiceMode) && (
          <FormControlLabel
            control={
              <Switch
                checked={createInvoice}
                onChange={(e) => setCreateInvoice(e.target.checked)}
                color="primary"
              />
            }
            label="Create Invoice"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Patient Details */}
          <Step>
            <StepLabel>Patient Details</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    disabled={invoiceMode}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    required
                    disabled={invoiceMode}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      label="Gender"
                      disabled={invoiceMode}
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
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    disabled={invoiceMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={invoiceMode}
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
{/* Step 1.5: Patient Details */}
          <Step>
            <StepLabel>Patient's Adress</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Street/Vill"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    required
                    disabled={invoiceMode}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    required
                    disabled={invoiceMode}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>State</InputLabel>
                    <Select
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      label="State"
                      disabled={invoiceMode}
                    >
                      <MenuItem value="W.B">W.B</MenuItem>
                      <MenuItem value="T.S">T.S</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    value={formData.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    required
                    disabled={invoiceMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={formData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    disabled={invoiceMode}
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
          {/* Step 2: Medical Information */}
          <Step>
            <StepLabel>Medical Information</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      label="Blood Group"
                    >
                      <MenuItem value="A+">A+</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Known Allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    placeholder="Enter any known allergies"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Medical History"
                    multiline
                    rows={3}
                    value={formData.medicalHistory}
                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                    placeholder="Enter relevant medical history"
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button variant="contained" onClick={handleNext}>
                  {createInvoice ? 'Next' : 'Review'}
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Test Selection (only if creating invoice) */}
          {createInvoice && (
            <Step>
              <StepLabel>Test Selection</StepLabel>
              <StepContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
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
                          label="Add Tests"
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
                      {formData.selectedTests.map((test) => (
                        <ListItem key={test._id} divider>
                          <ListItemText
                            primary={`${test.name} (${test.code})`}
                            secondary={`Category: ${test.category} | Price: ₹${test.price}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleTestRemove(test._id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
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
                  <Button onClick={handleBack}>Back</Button>
                  <Button variant="contained" onClick={handleNext}>
                    Review
                  </Button>
                </Box>
              </StepContent>
            </Step>
          )}

          {/* Final Step: Review & Submit */}
          <Step>
            <StepLabel>Review & Submit</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Patient Information
                      </Typography>
                      <Typography variant="body2"><strong>Name:</strong> {formData.name}</Typography>
                      <Typography variant="body2"><strong>Age:</strong> {formData.age}</Typography>
                      <Typography variant="body2"><strong>Gender:</strong> {formData.gender}</Typography>
                      <Typography variant="body2"><strong>Phone:</strong> {formData.phone}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {formData.email}</Typography>
                      <Typography variant="body2"><strong>Blood Group:</strong> {formData.bloodGroup}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {createInvoice && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                          Invoice Summary
                        </Typography>
                        <Typography variant="body2">Tests: {formData.selectedTests.length} items</Typography>
                        <Typography variant="body2">Subtotal: ₹{totals.subtotal.toFixed(2)}</Typography>
                        <Typography variant="body2">Discount: -₹{totals.discountAmount.toFixed(2)}</Typography>
                        <Typography variant="body2">GST: ₹{totals.gstAmount.toFixed(2)}</Typography>
                        <Typography variant="body2">Additional: ₹{totals.additionalCharges.toFixed(2)}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" color="primary">
                          Total: ₹{totals.total.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <LoadingSpinner size={20} /> : <SaveIcon />}
                >
                  {loading ? 'Saving...' : (patient ? 'Update Patient' : 'Create Patient')}
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

export default PatientManagementEnhanced;
