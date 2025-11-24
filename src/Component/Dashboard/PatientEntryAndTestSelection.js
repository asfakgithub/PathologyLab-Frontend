import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, MenuItem, Checkbox, ListItemText, Select, InputLabel, FormControl, OutlinedInput, Chip, Divider, Paper, Grid, CircularProgress } from '@mui/material';
import { getTests, createPatient, createReport } from '../../services/api';
import reportService from '../../services/reportService';
import patientService from '../../services/patientService';
import settingsService from '../../services/settingsService';

function PatientEntryAndTestSelection({ onReportGenerated }) {
  const [patient, setPatient] = useState({ 
    name: '', 
    age: '', 
    gender: '', 
    dateOfBirth: new Date().toISOString().split('T')[0], // default current date
    mobileNo: '', 
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    medicalHistory: {
      allergies: '',
      medications: '',
      chronicConditions: '',
      previousSurgeries: ''
    },
    status: 'pending',
    priority: 'normal',
    examinedBy: '507f1f77bcf86cd799439011', // will be auto-generated
    createdBy: '507f1f77bcf86cd799439011', // will be auto-generated  
    assignedAdmin: '507f1f77bcf86cd799439011', // will be auto-generated
    tests: [],
    results: [],
    billing: {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      paymentStatus: 'pending'
    },
    specialInstructions: '',
    appointmentDate: new Date().toISOString().split('T')[0], // default current date
    appointmentTime: '10:00'
  });
  const [tests, setTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedSubtests, setSelectedSubtests] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [organizationSettings, setOrganizationSettings] = useState(null);

  useEffect(() => {
    fetchTests();
    fetchOrganizationSettings();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await getTests();
      setTests(res.data.data || []);
    } catch {
      setTests([]);
    }
  };

  const fetchOrganizationSettings = async () => {
    try {
      const response = await settingsService.getOrganizationSettings();
      setOrganizationSettings(response.data);
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      // Set default values if settings are not available
      setOrganizationSettings({
        labInfo: {
          name: 'PathologyLab Medical Center',
          address: {
            street: '123 Medical Street',
            city: 'Healthcare City',
            state: 'Medical State',
            zipCode: '12345',
            country: 'India'
          },
          contact: {
            phone: '+1-234-567-8900',
            email: 'info@pathologylab.com'
          }
        }
      });
    }
  };

  useEffect(() => {
    // Calculate total price and update patient's billing
    let price = 0;
    const selectedTestsData = [];
    
    selectedTests.forEach(testId => {
      const test = tests.find(t => t._id === testId);
      if (test) {
        const testData = {
          testId: testId,
          name: test.name,
          subtests: []
        };
        
        if (test.parameters && test.parameters.length > 0 && selectedSubtests[testId]) {
          selectedSubtests[testId].forEach(subId => {
            const sub = test.parameters.find(p => p._id === subId);
            if (sub && sub.price) {
              price += Number(sub.price);
              testData.subtests.push({
                name: sub.name,
                price: sub.price
              });
            }
          });
        } else {
          price += Number(test.price || 0);
          testData.subtests.push({
            name: test.name,
            price: test.price || 0
          });
        }
        
        selectedTestsData.push(testData);
      }
    });
    
    setTotalPrice(price);
    
    // Update patient's tests and billing
    setPatient(prev => ({
      ...prev,
      tests: selectedTestsData,
      billing: {
        ...prev.billing,
        totalAmount: price
      }
    }));
  }, [selectedTests, selectedSubtests, tests]);

  const handlePatientChange = e => {
    const { name, value } = e.target;
    
    // Handle mobile number with +91 prefix
    if (name === 'mobileNo') {
      const cleanNumber = value.replace(/^\+91/, '').replace(/\D/g, '');
      const formattedValue = cleanNumber.length > 0 ? `+91${cleanNumber}` : '';
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setPatient({ ...patient, [parent]: { ...patient[parent], [child]: formattedValue } });
      } else {
        setPatient({ ...patient, [name]: formattedValue });
      }
      return;
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPatient({ ...patient, [parent]: { ...patient[parent], [child]: value } });
    } else {
      setPatient({ ...patient, [name]: value });
    }
  };

  const handleTestSelect = e => {
    setSelectedTests(e.target.value);
    // Reset subtests for deselected tests
    const newSelected = { ...selectedSubtests };
    Object.keys(newSelected).forEach(testId => {
      if (!e.target.value.includes(testId)) delete newSelected[testId];
    });
    setSelectedSubtests(newSelected);
  };

  const handleSubtestSelect = (testId, value) => {
    setSelectedSubtests({ ...selectedSubtests, [testId]: value });
  };

  const handleNext = async () => {
    if (step === 1) {
      // Create patient before moving to next step
      try {
        setLoading(true);
        
        // Validate required fields
        if (!patient.name || !patient.age || !patient.gender || !patient.mobileNo) {
          alert('Please fill in all required fields (Name, Age, Gender, Mobile Number)');
          setLoading(false);
          return;
        }

        console.log('📋 Creating patient with data:', patient);
        const response = await patientService.createPatient(patient);
        console.log('✅ Patient created successfully:', response);
        
        // Update patient with the created patient's ID
        if (response.data && response.data._id) {
          setPatient(prev => ({ ...prev, _id: response.data._id }));
        } else if (response._id) {
          setPatient(prev => ({ ...prev, _id: response._id }));
        }
        
        setStep(step + 1);
      } catch (error) {
        console.error('❌ Error creating patient:', error);
        
        let errorMessage = 'Error creating patient. Please try again.';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details?.message) {
          errorMessage = error.details.message;
        }
        
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => setStep(step - 1);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      
      // Update patient with selected tests before generating report
      await patientService.updatePatient(patient._id, { tests: patient.tests });

      // Check if patient has existing report
      const existingReportCheck = await reportService.checkPatientReport(patient._id);
      if (existingReportCheck.data.hasReport) {
        alert(`Patient already has a report (ID: ${existingReportCheck.data.reportId}). Each patient can have only one report.`);
        setLoading(false);
        return;
      }
      
      // Prepare tests data for the report
      const testsData = selectedTests.map(testId => {
        const test = tests.find(t => t._id === testId);
        const testData = {
          testId: testId,
          testName: test?.name || '',
          category: test?.category || '',
          price: test?.price || 0,
          subtests: []
        };

        if (selectedSubtests[testId] && selectedSubtests[testId].length > 0) {
          testData.subtests = selectedSubtests[testId].map(subId => {
            const param = test?.parameters?.find(p => p._id === subId);
            return {
              subtestId: subId,
              name: param?.name || '',
              normalRange: param?.normalRange || '',
              method: param?.method || '',
              unit: param?.unit || '',
              finding: '' // To be filled by lab technician
            };
          });
        } else {
          // If no subtests selected, add the main test as a subtest
          testData.subtests.push({
            subtestId: testId,
            name: test?.name || '',
            normalRange: '',
            method: '',
            unit: '',
            finding: ''
          });
        }

        return testData;
      });

      // Prepare header and footer from organization settings
      const header = organizationSettings ? {
        includeBanner: true,
        bannerImageUrl: organizationSettings.labInfo?.logo || '',
        labName: organizationSettings.labInfo?.name || 'PathologyLab Medical Center',
        labAddress: organizationSettings.labInfo?.address ? 
          `${organizationSettings.labInfo.address.street}, ${organizationSettings.labInfo.address.city}, ${organizationSettings.labInfo.address.state} ${organizationSettings.labInfo.address.zipCode}` :
          '123 Medical Street, Healthcare City',
        labContact: organizationSettings.labInfo?.contact?.phone || '+1-234-567-8900',
        labEmail: organizationSettings.labInfo?.contact?.email || 'info@pathologylab.com'
      } : {
        includeBanner: true,
        bannerImageUrl: '',
        labName: 'PathologyLab Medical Center',
        labAddress: '123 Medical Street, Healthcare City',
        labContact: '+1-234-567-8900',
        labEmail: 'info@pathologylab.com'
      };

      const footer = organizationSettings ? {
        includeBanner: true,
        bannerImageUrl: organizationSettings.labInfo?.seal || '',
        footerText: `© ${new Date().getFullYear()} ${organizationSettings.labInfo?.name || 'PathologyLab Medical Center'}. All rights reserved.`,
        signature: organizationSettings.labInfo?.signature || ''
      } : {
        includeBanner: true,
        bannerImageUrl: '',
        footerText: `© ${new Date().getFullYear()} PathologyLab Medical Center. All rights reserved.`,
        signature: ''
      };
      
      // Prepare report data for the new API structure
      const reportData = {
        patientId: patient._id,
        tests: testsData,
        header: header,
        footer: footer,
        status: 'pending',
        createdBy: 'Lab Technician',
        examinedBy: 'Dr. Lab Director',
        remarks: patient.specialInstructions || '',
        priority: patient.priority || 'normal'
      };

      console.log('📊 Prepared Report Data:', reportData);

      // Create report using the new report service
      const response = await reportService.createReport(reportData);
      console.log('✅ Report created successfully:', response);
      
      if (onReportGenerated) {
        onReportGenerated({ 
          ...response.data,
          patient, 
          selectedTests, 
          selectedSubtests, 
          totalPrice, 
          tests 
        });
      }
      
      setStep(3);
    } catch (error) {
      console.error('❌ Error creating report:', error);
      
      let errorMessage = 'Error creating report. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details?.message) {
        errorMessage = error.details.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>Patient Entry & Test Selection</Typography>
          <Divider sx={{ mb: 2 }} />
          {step === 1 && (
            <Box>
              <Typography variant="subtitle1" mb={2}>Patient Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="name"
                    label="Full Name"
                    value={patient.name || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="age"
                    label="Age"
                    type="number"
                    value={patient.age || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    value={patient.dateOfBirth || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    required
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={patient.gender || ''}
                      onChange={handlePatientChange}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="mobileNo"
                    label="Mobile Number"
                    value={patient.mobileNo || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    required
                    margin="normal"
                    placeholder="+91"
                    helperText="+91 will be auto-appended"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    value={patient.email || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Address</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="address.street"
                    label="Street Address"
                    value={patient.address?.street || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    name="address.city"
                    label="City"
                    value={patient.address?.city || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    name="address.state"
                    label="State"
                    value={patient.address?.state || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    name="address.zipCode"
                    label="Zip Code"
                    value={patient.address?.zipCode || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    name="address.country"
                    label="Country"
                    value={patient.address?.country || 'India'}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Emergency Contact</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="emergencyContact.name"
                    label="Emergency Contact Name"
                    value={patient.emergencyContact?.name || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="emergencyContact.relationship"
                    label="Relationship"
                    value={patient.emergencyContact?.relationship || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="emergencyContact.phone"
                    label="Emergency Contact Phone"
                    value={patient.emergencyContact?.phone || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Medical History (Optional)</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="medicalHistory.allergies"
                    label="Allergies"
                    value={patient.medicalHistory?.allergies || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    multiline
                    rows={2}
                    margin="normal"
                    placeholder="e.g., Penicillin, Peanuts"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="medicalHistory.medications"
                    label="Current Medications"
                    value={patient.medicalHistory?.medications || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    multiline
                    rows={2}
                    margin="normal"
                    placeholder="List current medications"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="medicalHistory.chronicConditions"
                    label="Chronic Conditions"
                    value={patient.medicalHistory?.chronicConditions || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    multiline
                    rows={2}
                    margin="normal"
                    placeholder="e.g., Diabetes, Hypertension"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="medicalHistory.previousSurgeries"
                    label="Previous Surgeries"
                    value={patient.medicalHistory?.previousSurgeries || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    multiline
                    rows={2}
                    margin="normal"
                    placeholder="List previous surgeries with dates"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Billing Information</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="billing.paidAmount"
                    label="Paid Amount"
                    type="number"
                    value={patient.billing?.paidAmount || 0}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                    InputProps={{ startAdornment: '₹' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="billing.pendingAmount"
                    label="Pending Amount"
                    type="number"
                    value={patient.billing?.pendingAmount || 0}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                    InputProps={{ startAdornment: '₹' }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Total Amount"
                    value={`₹${totalPrice}`}
                    fullWidth
                    margin="normal"
                    disabled
                    helperText="Calculated from selected tests"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Appointment Details</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="appointmentDate"
                    label="Appointment Date"
                    type="date"
                    value={patient.appointmentDate || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="appointmentTime"
                    label="Appointment Time"
                    type="time"
                    value={patient.appointmentTime || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="specialInstructions"
                    label="Special Instructions"
                    value={patient.specialInstructions || ''}
                    onChange={handlePatientChange}
                    fullWidth
                    multiline
                    rows={2}
                    margin="normal"
                    placeholder="Any special instructions for handling"
                  />
                </Grid>
              </Grid>
              
              <Button 
                variant="contained" 
                onClick={handleNext} 
                sx={{ mt: 3 }}
                disabled={loading || !patient.name || !patient.age || !patient.dateOfBirth || !patient.gender || !patient.mobileNo}
              >
                {loading ? <CircularProgress size={20} /> : 'Next: Select Tests'}
              </Button>
            </Box>
          )}
          {step === 2 && (
            <Box>
              <Typography variant="subtitle1" mb={1}>Select Tests</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tests</InputLabel>
                <Select
                  multiple
                  value={selectedTests}
                  onChange={handleTestSelect}
                  input={<OutlinedInput label="Tests" />}
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(value => {
                        const test = tests.find(t => t._id === value);
                        return <Chip key={value} label={test ? test.name : value} />;
                      })}
                    </Box>
                  )}
                >
                  {tests.map(test => (
                    <MenuItem key={test._id} value={test._id}>
                      <Checkbox checked={selectedTests.indexOf(test._id) > -1} />
                      <ListItemText primary={test.name} secondary={test.category} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedTests.map(testId => {
                const test = tests.find(t => t._id === testId);
                if (test && test.parameters && test.parameters.length > 0) {
                  return (
                    <FormControl key={testId} fullWidth sx={{ mb: 2 }}>
                      <InputLabel>{test.name} Subtests/Parameters</InputLabel>
                      <Select
                        multiple
                        value={selectedSubtests[testId] || []}
                        onChange={e => handleSubtestSelect(testId, e.target.value)}
                        input={<OutlinedInput label={`${test.name} Subtests/Parameters`} />}
                        renderValue={selected => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map(value => {
                              const sub = test.parameters.find(p => p._id === value);
                              return <Chip key={value} label={sub ? sub.name : value} />;
                            })}
                          </Box>
                        )}
                      >
                        {test.parameters.map(sub => (
                          <MenuItem key={sub._id} value={sub._id}>
                            <Checkbox checked={(selectedSubtests[testId] || []).indexOf(sub._id) > -1} />
                            <ListItemText primary={sub.name} secondary={sub.unit} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }
                return null;
              })}
              <Typography variant="h6" mt={2}>Total Price: ₹{totalPrice}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={handleBack} disabled={loading}>Back</Button>
                <Button 
                  variant="contained" 
                  onClick={handleGenerateReport}
                  disabled={loading || selectedTests.length === 0}
                >
                  {loading ? <CircularProgress size={20} /> : 'Generate Report'}
                </Button>
              </Box>
            </Box>
          )}
          {step === 3 && (
            <Box>
              <Typography variant="h6" mb={2}>Report Preview</Typography>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2">Patient Details</Typography>
                <Typography>Name: {patient.name}</Typography>
                <Typography>Age: {patient.age}</Typography>
                <Typography>Date of Birth: {patient.dateOfBirth}</Typography>
                <Typography>Gender: {patient.gender}</Typography>
                <Typography>Mobile: {patient.mobileNo}</Typography>
                {patient.email && <Typography>Email: {patient.email}</Typography>}
                {patient.address?.street && (
                  <Typography>
                    Address: {patient.address.street}, {patient.address.city}, {patient.address.state} - {patient.address.zipCode}, {patient.address.country}
                  </Typography>
                )}
                <Typography>Appointment: {patient.appointmentDate} at {patient.appointmentTime}</Typography>
                {patient.specialInstructions && (
                  <Typography>Special Instructions: {patient.specialInstructions}</Typography>
                )}
              </Paper>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Selected Tests & Subtests</Typography>
                {selectedTests.map(testId => {
                  const test = tests.find(t => t._id === testId);
                  return (
                    <Box key={testId} sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight={600}>{test ? test.name : testId}</Typography>
                      {test && test.parameters && test.parameters.length > 0 ? (
                        <Box sx={{ ml: 2 }}>
                          {(selectedSubtests[testId] || []).map(subId => {
                            const sub = test.parameters.find(p => p._id === subId);
                            return (
                              <Typography key={subId} variant="body2">- {sub ? sub.name : subId} (Result: ______)</Typography>
                            );
                          })}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ ml: 2 }}>Result: ______</Typography>
                      )}
                    </Box>
                  );
                })}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Total Price: ₹{totalPrice}</Typography>
              </Paper>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setStep(1)}>New Entry</Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default PatientEntryAndTestSelection;
