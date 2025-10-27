import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Divider,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Person as PatientIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Preview as PreviewIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Import our services
import reportService from '../../../services/reportService';
import patientService from '../../../services/patientService';
import settingsService from '../../../services/settingsService';

const ReportDemoIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [organizationSettings, setOrganizationSettings] = useState({});
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportData, setReportData] = useState({
    patientId: '',
    testResults: '',
    diagnosis: '',
    recommendations: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [reportsData, patientsData, settingsData] = await Promise.all([
        reportService.getAllReports(),
        patientService.getAllPatients(),
        settingsService.getOrganizationSettings()
      ]);

      setReports(reportsData.data || []);
      setPatients(patientsData.data || []);
      setOrganizationSettings(settingsData.data || {});
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Create a new report with organization branding
  const handleCreateReport = async () => {
    if (!reportData.patientId) {
      setMessage({ type: 'error', text: 'Please select a patient' });
      return;
    }

    setLoading(true);
    try {
      // Create report with organization settings
      const newReport = {
        ...reportData,
        organizationHeader: organizationSettings.header,
        organizationFooter: organizationSettings.footer,
        organizationSeal: organizationSettings.seal,
        doctorSignature: organizationSettings.signature,
        labName: organizationSettings.name,
        labAddress: organizationSettings.address,
        labPhone: organizationSettings.phone,
        labEmail: organizationSettings.email
      };

      const response = await reportService.createReport(newReport);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Report created successfully!' });
        setReportData({ patientId: '', testResults: '', diagnosis: '', recommendations: '' });
        setSelectedPatient('');
        loadInitialData(); // Refresh the reports list
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create report: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Generate and download PDF
  const handleDownloadPDF = async (reportId) => {
    try {
      setLoading(true);
      await reportService.generateReportPDF(reportId);
      setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download PDF: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Send report via email
  const handleEmailReport = async (reportId) => {
    try {
      setLoading(true);
      await reportService.sendReportEmail(reportId);
      setMessage({ type: 'success', text: 'Report sent via email successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send email: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Demo function: Create patient and automatically generate report
  const handlePatientReportDemo = async () => {
    setLoading(true);
    try {
      // 1. Create a demo patient
      const demoPatient = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        address: '123 Demo Street'
      };

      const patientResponse = await patientService.createPatient(demoPatient);
      
      if (patientResponse.success) {
        const patientId = patientResponse.data._id;
        
        // 2. Check if patient already has a report
        const existingReport = await reportService.checkPatientReport(patientId);
        
        if (!existingReport.data) {
          // 3. Create report with organization branding
          const reportData = {
            patientId: patientId,
            testResults: 'Demo test results - Blood test: Normal, X-Ray: Clear',
            diagnosis: 'Patient is in good health',
            recommendations: 'Continue regular exercise and healthy diet',
            organizationHeader: organizationSettings.header,
            organizationFooter: organizationSettings.footer,
            organizationSeal: organizationSettings.seal,
            doctorSignature: organizationSettings.signature,
            labName: organizationSettings.name || 'PathologyLab Demo',
            labAddress: organizationSettings.address || '123 Lab Street',
            labPhone: organizationSettings.phone || '555-0123',
            labEmail: organizationSettings.email || 'demo@pathologylab.com'
          };

          await reportService.createReport(reportData);
          setMessage({ type: 'success', text: 'Demo patient and report created successfully!' });
        } else {
          setMessage({ type: 'info', text: 'Patient created, but already has an existing report' });
        }
        
        loadInitialData(); // Refresh all data
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Demo failed: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Professional Report Integration Demo
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        This demo shows the complete integration of reports with patient management and organization settings
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Organization Settings Preview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={<Avatar><SettingsIcon /></Avatar>}
              title="Organization Settings"
              subheader="Current branding configuration"
            />
            <CardContent>
              <Typography variant="body2" gutterBottom>
                <strong>Lab Name:</strong> {organizationSettings.name || 'Not configured'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Address:</strong> {organizationSettings.address || 'Not configured'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Phone:</strong> {organizationSettings.phone || 'Not configured'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {organizationSettings.email || 'Not configured'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" gutterBottom>
                <strong>Assets Configured:</strong>
              </Typography>
              <Typography variant="body2" color={organizationSettings.header ? 'success.main' : 'text.secondary'}>
                • Header Image: {organizationSettings.header ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color={organizationSettings.footer ? 'success.main' : 'text.secondary'}>
                • Footer Image: {organizationSettings.footer ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color={organizationSettings.seal ? 'success.main' : 'text.secondary'}>
                • Seal Image: {organizationSettings.seal ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="body2" color={organizationSettings.signature ? 'success.main' : 'text.secondary'}>
                • Signature: {organizationSettings.signature ? 'Yes' : 'No'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Create Report Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              avatar={<Avatar><AddIcon /></Avatar>}
              title="Create New Report"
              subheader="Create a report with organization branding"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Select Patient"
                    value={selectedPatient}
                    onChange={(e) => {
                      setSelectedPatient(e.target.value);
                      setReportData({ ...reportData, patientId: e.target.value });
                    }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} - {patient.email}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Test Results"
                    value={reportData.testResults}
                    onChange={(e) => setReportData({ ...reportData, testResults: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Diagnosis"
                    value={reportData.diagnosis}
                    onChange={(e) => setReportData({ ...reportData, diagnosis: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Recommendations"
                    value={reportData.recommendations}
                    onChange={(e) => setReportData({ ...reportData, recommendations: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateReport}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    Create Report
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PatientIcon />}
                    onClick={handlePatientReportDemo}
                    disabled={loading}
                  >
                    Demo: Create Patient + Report
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Reports List */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<Avatar><ReportIcon /></Avatar>}
              title="Recent Reports"
              subheader={`${reports.length} reports in system`}
            />
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : reports.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center">
                  No reports found. Create your first report above.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {reports.slice(0, 6).map((report) => (
                    <Grid item xs={12} sm={6} md={4} key={report._id}>
                      <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Report #{report._id.slice(-6)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Patient: {report.patientId?.firstName} {report.patientId?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Created: {new Date(report.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Status: {report.status || 'Draft'}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadPDF(report._id)}
                            sx={{ mr: 1 }}
                          >
                            PDF
                          </Button>
                          <Button
                            size="small"
                            startIcon={<EmailIcon />}
                            onClick={() => handleEmailReport(report._id)}
                          >
                            Email
                          </Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportDemoIntegration;
