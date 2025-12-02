import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Typography,
  Divider,
  Box
} from '@mui/material';
import { Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import invoiceService from '../../services/invoiceService';
import { getTests } from '../../services/api';
import useSystemNotification from '../../core/hooks/useSystemNotification';
import LoadingSpinner from '../common/LoadingSpinner';

// Invoice Form Dialog Component
const InvoiceFormDialog = ({ open, onClose, invoice, onSuccess, onError, selectedRecipient, settings }) => {
    const { sendSystemNotification } = useSystemNotification();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tests, setTests] = useState([]);
    const [formData, setFormData] = useState({
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
        testDetails: [],
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
      const testDetailsArray = formData.testDetails || [];
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
                      {(formData.testDetails || []).map((test, index) => (
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
                          Tests: {(formData.testDetails || []).length} items
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

  export default InvoiceFormDialog;
