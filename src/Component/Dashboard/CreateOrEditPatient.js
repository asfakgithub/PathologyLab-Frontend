import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Grid,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Card,
  CardContent,
  Typography,
  Divider,
  InputAdornment,
  Checkbox,
  FormGroup,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { searchTests, createPatient, updatePatient } from '../../services/api';
import { invoiceService } from '../../services/invoiceService';
import LoadingSpinner from '../common/LoadingSpinner';
import { debounce } from '@mui/material/utils';

const CreateOrEditPatient = ({ open, onClose, patient, invoiceMode = false, onSuccess, onError }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createInvoice, setCreateInvoice] = useState(true);

  // State for the new test search autocomplete
  const [testSearchInput, setTestSearchInput] = useState('');
  const [testOptions, setTestOptions] = useState([]);
  const [testSearchLoading, setTestSearchLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    mobileNo: '',
    email: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
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

  const fetchTestsForAutocomplete = useMemo(
    () =>
      debounce(async (request, callback) => {
        try {
          const response = await searchTests(request.input);
          const testsData = response.data || [];
          callback(testsData);
        } catch (error) {
          console.error('Failed to search tests:', error);
          callback([]);
        }
      }, 400),
    [],
  );

  useEffect(() => {
    let active = true;

    if (testSearchInput === '') {
      setTestOptions([]);
      return undefined;
    }

    setTestSearchLoading(true);
    fetchTestsForAutocomplete({ input: testSearchInput }, (results) => {
      if (active) {
        let newOptions = [];
        if (results) {
          // Flatten tests and subtests into a single list for autocomplete
          results.forEach(test => {
            // Add the main test
            newOptions.push({
              id: test._id,
              label: `${test.name} (${test.code})`,
              category: test.category,
              isTest: true,
              test: test
            });
            // Add subtests
            if (test.parameters && test.parameters.length > 0) {
              test.parameters.forEach(param => {
                newOptions.push({
                  id: `${test._id}-${param._id}`,
                  label: `${test.name} > ${param.name}`,
                  category: test.category,
                  isTest: false,
                  test: test,
                  subtest: param
                });
              });
            }
          });
        }
        setTestOptions(newOptions);
        setTestSearchLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [testSearchInput, fetchTestsForAutocomplete]);


  useEffect(() => {
    if (open) {
      if (patient) {
        const allergiesString = patient.allergies || (patient.medicalHistory && Array.isArray(patient.medicalHistory.allergies) ? patient.medicalHistory.allergies.join(', ') : '');
        let medicalHistoryString = '';
        if (patient.medicalHistory) {
          const parts = [];
          if (Array.isArray(patient.medicalHistory.chronicConditions) && patient.medicalHistory.chronicConditions.length) parts.push(`Conditions: ${patient.medicalHistory.chronicConditions.join(', ')}`);
          if (Array.isArray(patient.medicalHistory.medications) && patient.medicalHistory.medications.length) parts.push(`Meds: ${patient.medicalHistory.medications.map(m => m.name).join(', ')}`);
          if (Array.isArray(patient.medicalHistory.previousSurgeries) && patient.medicalHistory.previousSurgeries.length) parts.push(`Surgeries: ${patient.medicalHistory.previousSurgeries.map(s => s.surgery).join(', ')}`);
          medicalHistoryString = parts.join(' | ');
        }

        setFormData({
          name: patient.name || '',
          age: patient.age || '',
          gender: patient.gender || 'Male',
          mobileNo: patient.mobileNo || '',
          email: patient.email || '',
          address: patient.address || { street: '', city: '', state: '', zipCode: '', country: '' },
          bloodGroup: patient.bloodGroup || '',
          allergies: allergiesString,
          medicalHistory: medicalHistoryString,
          doctorName: patient.doctorName || patient.doctor || patient.examinedByName || '',
          referredBy: patient.referredBy || '',
          selectedTests: patient.tests ? patient.tests.map(t => ({...t, _id: t.testId, selectedSubtests: t.selectedSubtests || []})) : [],
          discountAmount: 0,
          gstPercentage: 18,
          additionalCharges: 0,
          notes: ''
        });
        setCreateInvoice(true);
      } else {
        resetForm();
      }
    }
  }, [open, patient, invoiceMode]);


  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      mobileNo: '',
      email: '',
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
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

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  const handleTestSelection = (option) => {
    if (!option) return;

    const { test, subtest, isTest } = option;

    setFormData(prev => {
        let updatedSelectedTests = [...prev.selectedTests];
        let testInSelection = updatedSelectedTests.find(t => t._id === test._id);

        // If the parent test is not already selected, add it.
        if (!testInSelection) {
            testInSelection = { ...test, selectedSubtests: [] };
            updatedSelectedTests.push(testInSelection);
        }

        // If a subtest was selected, ensure it's added to the parent test's subtest list.
        if (!isTest && subtest) {
            const subtestInSelection = testInSelection.selectedSubtests.some(st => st._id === subtest._id);
            if (!subtestInSelection) {
                testInSelection.selectedSubtests.push(subtest);
            }
        }
        
        // Return updated state
        return { ...prev, selectedTests: updatedSelectedTests };
    });

    // Clear the search input after selection
    setTestSearchInput('');
    setTestOptions([]);
  };

  const toggleSubtest = (testId, subtest) => {
    setFormData(prev => {
      const selectedTests = prev.selectedTests.map(t => {
        if (t._id !== testId) return t;
        const found = t.selectedSubtests?.some(s => s._id === subtest._id);
        let selectedSubtests = t.selectedSubtests || [];
        if (found) {
          selectedSubtests = selectedSubtests.filter(s => s._id !== subtest._id);
        } else {
          selectedSubtests = [...selectedSubtests, subtest];
        }
        return { ...t, selectedSubtests };
      });
      return { ...prev, selectedTests };
    });
  };

  const handleTestRemove = (testId) => {
    setFormData(prev => ({ ...prev, selectedTests: prev.selectedTests.filter(t => t._id !== testId) }));
  };

  const calculateTotals = () => {
    const subtotal = formData.selectedTests.reduce((sum, test) => {
      if (test.selectedSubtests && test.selectedSubtests.length) {
        return sum + test.selectedSubtests.reduce((s, st) => s + (st.price || 0), 0);
      }
      return sum + (test.price || 0);
    }, 0);
    const discountAmount = formData.discountAmount || 0;
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = (taxableAmount * (formData.gstPercentage || 0)) / 100;
    const additionalCharges = formData.additionalCharges || 0;
    const total = taxableAmount + gstAmount + additionalCharges;
    return { subtotal, discountAmount, gstAmount, additionalCharges, total };
  };

  const totals = calculateTotals();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const patientData = {
        name: formData.name,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        mobileNo: formData.mobileNo,
        email: formData.email,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          country: formData.address.country
        },
        bloodGroup: formData.bloodGroup
      };

      const medicalHistory = {
        allergies: (formData.allergies || '').split(',').map(s => s.trim()).filter(Boolean),
        medications: [],
        chronicConditions: [],
        previousSurgeries: []
      };
      if (formData.medicalHistory && formData.medicalHistory.trim()) {
        medicalHistory.notes = formData.medicalHistory;
      }
      patientData.medicalHistory = medicalHistory;

      if (formData.selectedTests && formData.selectedTests.length) {
        patientData.tests = formData.selectedTests.map(t => ({
          testId: t._id || t.testId,
          testName: t.name,
          selectedSubtests: (t.selectedSubtests || []).map(st => ({ subtestId: st._id, subtestName: st.name, price: st.price }))
        }));
      }

      if (!invoiceMode && patient) {
        await updatePatient(patient._id, patientData);
      } else if (!invoiceMode && !patient) {
        await createPatient(patientData);
      }

      if (createInvoice && formData.selectedTests.length > 0) {
        const invoiceData = {
          patientName: formData.name,
          patientAge: parseInt(formData.age) || 0,
          patientGender: formData.gender,
          patientPhone: formData.mobileNo,
          patientEmail: formData.email,
          patientAddress: [formData.address.street, formData.address.city, formData.address.state, formData.address.zipCode, formData.address.country].filter(Boolean).join(', '),
          doctorName: formData.doctorName,
          referredBy: formData.referredBy,
          testDetails: formData.selectedTests.map(test => {
            const subtests = test.selectedSubtests || [];
            const testPrice = subtests.length ? subtests.reduce((s, st) => s + (st.price || 0), 0) : (test.price || 0);
            return {
              testName: test.name,
              testCode: test.code,
              testPrice,
              category: test.category || 'General',
              subtests: subtests.map(st => ({ name: st.name, price: st.price }))
            };
          }),
          discountAmount: formData.discountAmount,
          gstPercentage: formData.gstPercentage,
          additionalCharges: formData.additionalCharges,
          notes: formData.notes
        };

        await invoiceService.createInvoice(invoiceData);
      }

      onSuccess && onSuccess();
    } catch (err) {
      onError && onError('Failed to save patient: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {invoiceMode ? 'Create Invoice for Patient' : patient ? 'Edit Patient' : 'Add New Patient'}
        {(!patient || invoiceMode) && (
          <FormControlLabel
            control={<Switch checked={createInvoice} onChange={(e) => setCreateInvoice(e.target.checked)} color="primary" />}
            label="Create Invoice"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>Patient Details</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required disabled={invoiceMode} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Age" type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} required disabled={invoiceMode} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} label="Gender" disabled={invoiceMode}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Mobile Number" value={formData.mobileNo} onChange={(e) => handleInputChange('mobileNo', e.target.value)} required disabled={invoiceMode} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email Address" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} disabled={invoiceMode} />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item>
                  <Button variant="contained" onClick={handleNext}>Next</Button>
                </Grid>
              </Grid>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>Patient's Address</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Street/Vill" value={formData.address.street} onChange={(e) => handleAddressChange('street', e.target.value)} required disabled={invoiceMode} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="City" value={formData.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} required disabled={invoiceMode} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>State</InputLabel>
                    <Select value={formData.address.state} onChange={(e) => handleAddressChange('state', e.target.value)} label="State" disabled={invoiceMode}>
                      <MenuItem value="W.B">W.B</MenuItem>
                      <MenuItem value="T.S">T.S</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Zip Code" value={formData.address.zipCode} onChange={(e) => handleAddressChange('zipCode', e.target.value)} required disabled={invoiceMode} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Country" value={formData.address.country} onChange={(e) => handleAddressChange('country', e.target.value)} disabled={invoiceMode} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" onClick={handleNext}>Next</Button>
              </Box>
            </StepContent>
          </Step>

          <Step>
            <StepLabel>Medical Information</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Blood Group</InputLabel>
                    <Select value={formData.bloodGroup} onChange={(e) => handleInputChange('bloodGroup', e.target.value)} label="Blood Group">
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
                  <TextField fullWidth label="Known Allergies" value={formData.allergies} onChange={(e) => handleInputChange('allergies', e.target.value)} placeholder="Enter any known allergies" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Medical History" multiline rows={3} value={formData.medicalHistory} onChange={(e) => handleInputChange('medicalHistory', e.target.value)} placeholder="Enter relevant medical history" />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button variant="contained" onClick={handleNext}>{createInvoice ? 'Next' : 'Review'}</Button>
              </Box>
            </StepContent>
          </Step>

          {createInvoice && (
            <Step>
              <StepLabel>Test Selection</StepLabel>
              <StepContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Doctor Name" value={formData.doctorName} onChange={(e) => handleInputChange('doctorName', e.target.value)} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Referred By" value={formData.referredBy} onChange={(e) => handleInputChange('referredBy', e.target.value)} /></Grid>
                  <Grid item xs={12}>
                  <Autocomplete
                      id="test-search-autocomplete"
                      options={testOptions}
                      getOptionLabel={(option) => option.label || ''}
                      filterOptions={(x) => x}
                      autoComplete
                      includeInputInList
                      filterSelectedOptions
                      value={null} // Controlled externally, cleared on select
                      onChange={(event, newValue) => {
                        handleTestSelection(newValue);
                      }}
                      onInputChange={(event, newInputValue) => {
                        setTestSearchInput(newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search and Add Tests"
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <React.Fragment>
                                {testSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </React.Fragment>
                            ),
                          }}
                        />
                      )}
                      renderOption={(props, option) => {
                        return (
                          <li {...props} key={option.id}>
                            <Grid container alignItems="center">
                              <Grid item xs>
                                <Typography variant="body1" color={option.isTest ? "primary" : "textSecondary"}>
                                  {option.label}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  Category: {option.category}
                                </Typography>
                              </Grid>
                            </Grid>
                          </li>
                        );
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Selected Tests</Typography>
                    <List>
                      {formData.selectedTests.map((test) => {
                        const subtests = test.parameters || test.subtests || [];
                        return (
                          <ListItem key={test._id} divider alignItems="flex-start">
                            <ListItemText
                              primary={`${test.name} (${test.code})`}
                              secondary={
                                <>
                                  <div>{`Category: ${test.category} | Price: ₹${test.price}`}</div>
                                  {subtests && subtests.length > 0 && (
                                      <Box sx={{ mt: 1 }}>
                                        <Typography variant="subtitle2">Subtests</Typography>
                                        <FormGroup>
                                          {subtests.map((st) => {
                                            const checked = (test.selectedSubtests || []).some(s => String(s._id) === String(st._id));
                                            return (
                                              <FormControlLabel key={st._id} control={<Checkbox checked={checked} onChange={() => toggleSubtest(test._id, st)} />} label={`${st.name} - ₹${st.price || 0}`} />
                                            );
                                          })}
                                        </FormGroup>
                                        <Box sx={{ mt: 1 }}>
                                          <Typography variant="body2" color="textSecondary">
                                            {(() => {
                                              const subSel = test.selectedSubtests || [];
                                              const testTotal = subSel.length > 0 ? subSel.reduce((s, st) => s + (st.price || 0), 0) : (test.price || 0);
                                              return `Test Total: ₹${Number(testTotal).toFixed(2)}`;
                                            })()}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    )}
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" onClick={() => handleTestRemove(test._id)} color="error"><DeleteIcon /></IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth label="Discount Amount" type="number" value={formData.discountAmount} onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth label="GST Percentage" type="number" value={formData.gstPercentage} onChange={(e) => handleInputChange('gstPercentage', parseFloat(e.target.value) || 0)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} /></Grid>
                  <Grid item xs={12} sm={4}><TextField fullWidth label="Additional Charges" type="number" value={formData.additionalCharges} onChange={(e) => handleInputChange('additionalCharges', parseFloat(e.target.value) || 0)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button variant="contained" onClick={handleNext}>Review</Button>
                </Box>
              </StepContent>
            </Step>
          )}

          <Step>
            <StepLabel>Review & Submit</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">Patient Information</Typography>
                      <Typography variant="body2"><strong>Name:</strong> {formData.name}</Typography>
                      <Typography variant="body2"><strong>Age:</strong> {formData.age}</Typography>
                      <Typography variant="body2"><strong>Gender:</strong> {formData.gender}</Typography>
                      <Typography variant="body2"><strong>Mobile:</strong> {formData.mobileNo}</Typography>
                      <Typography variant="body2"><strong>Email:</strong> {formData.email}</Typography>
                      <Typography variant="body2"><strong>Blood Group:</strong> {formData.bloodGroup}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {createInvoice && (
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">Invoice Summary</Typography>
                        <Typography variant="body2">Tests: {formData.selectedTests.length} items</Typography>
                        <Typography variant="body2">Subtotal: ₹{totals.subtotal.toFixed(2)}</Typography>
                        <Typography variant="body2">Discount: -₹{totals.discountAmount.toFixed(2)}</Typography>
                        <Typography variant="body2">GST: ₹{totals.gstAmount.toFixed(2)}</Typography>
                        <Typography variant="body2">Additional: ₹{totals.additionalCharges.toFixed(2)}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" color="primary">Total: ₹{totals.total.toFixed(2)}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack}>Back</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={loading ? <LoadingSpinner size={20} /> : <SaveIcon />}>
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

export default CreateOrEditPatient;