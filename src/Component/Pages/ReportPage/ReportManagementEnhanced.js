import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  Snackbar, 
  Alert, 
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Assignment as ReportIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CompleteIcon,
  HourglassEmpty as PendingIcon,
  Warning as WarningIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import patientService from '../../../services/patientService';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

const ReportManagementEnhanced = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const patientsResponse = await patientService.getAllPatients();
      const patients = patientsResponse.data || []; // The API returns patient list in `data`

      // The component treats each patient as a "report". We need to map the patient data
      // to a structure the component can use.
      const allReports = patients.map(patient => ({
        ...patient,
        reportId: patient._id.slice(-6).toUpperCase(), // Create a display ID
        patient: { name: patient.name, patientId: patient._id },
        reportDate: patient.updatedAt || patient.createdAt,
      }));
      setReports(allReports);
    } catch (error) {
      showSnackbar('Error fetching reports: ' + (error.message || 'Unknown error'), 'error');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filter reports
  useEffect(() => {
    let filtered = reports.filter(report => {
      const matchesSearch = 
        (report.reportId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.patient?.patientId || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesType = filterType === 'all' || 
        (filterType === 'critical' && report.priority === 'critical') ||
        (filterType === 'normal' && report.priority !== 'critical');
      
      return matchesSearch && matchesStatus && matchesType;
    });
    
    setFilteredReports(filtered);
    setPage(0);
  }, [searchTerm, filterStatus, filterType, reports]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CompleteIcon />;
      case 'in-progress': return <PendingIcon />;
      case 'pending': return <CalendarIcon />;
      default: return <CalendarIcon />;
    }
  };

  const handleView = async (report) => {
    setSelectedReport(report);
    setOpenViewDialog(true);
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    navigate(`/view/${report._id}`);
  };

  const handleDownload = (report) => {
    // This will navigate to the printable report page for the patient.
    navigate(`/patient-report/${report._id}`);
  }

  const handleCreateReport = () => {
    setSelectedReport(null);
    navigate('/dashboard/reports/create');
  };

  const ReportViewDialog = () => (
    <Dialog 
      open={openViewDialog} 
      onClose={() => setOpenViewDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <ReportIcon color="primary" />
          <Box>
            <Typography variant="h6">
              Report Details - {selectedReport?.reportId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generated on {selectedReport?.reportDate ? formatDate(selectedReport.reportDate) : 'N/A'}
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <Chip
            icon={getStatusIcon(selectedReport?.status)}
            label={selectedReport?.status?.toUpperCase()}
            color={getStatusColor(selectedReport?.status)}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedReport && (
          <Grid container spacing={3}>
            {/* Patient Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Patient Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">{selectedReport.patient?.name || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">Age</Typography>
                      <Typography variant="body1">{selectedReport.patient?.age || 'N/A'} years</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1">{selectedReport.patient?.gender || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Tests and Results */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Tests & Results
                  </Typography>
                  <List dense>
                    {selectedReport.tests.map((test, index) => (
                      <ListItem key={test.testId || index}>
                        <ListItemText
                          primary={test.testName}
                          secondary={`Category: ${test.category}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={test.status}
                            size="small"
                            color={getStatusColor(test.status)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Clinical Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Findings
                  </Typography>
                  <Typography variant="body2">
                    {selectedReport.remarks || 'No findings recorded'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Conclusion
                  </Typography>
                  <Typography variant="body2">
                    {selectedReport.conclusion || 'No conclusion recorded'} 
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Recommendations
                  </Typography>
                  <Typography variant="body2">
                    {selectedReport.recommendations || 'No recommendations provided'} 
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Doctor</Typography>
                      <Typography variant="body1">{selectedReport.examinedBy || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Critical Values</Typography>
                      <Chip
                        label={selectedReport.priority === 'critical' ? 'Yes' : 'No'}
                        size="small"
                        color={selectedReport.priority === 'critical' ? 'error' : 'success'}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenViewDialog(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
        {/* Header */ }
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Report Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage patient reports and test results
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchReports}
              sx={{ mr: 2 }}
            >
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateReport}>
              Create Report
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */ }
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <ReportIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{reports.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Reports</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CompleteIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {reports.filter(r => r.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Completed</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <PendingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {reports.filter(r => r.status === 'in-progress').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Processing</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {reports.filter(r => r.priority === 'critical').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Critical Values</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Search */ }
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search reports..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="normal">Normal Values</MenuItem>
                  <MenuItem value="critical">Critical Values</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ExportIcon />}
              >
                Export All
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Reports Table */ }
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Tests</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((report) => (
                    <TableRow key={report._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <ReportIcon color="primary" sx={{ mr: 1 }} />
                          {report.reportId || report._id.slice(-6)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {report.patient?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {report.patient?.patientId || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {report.tests?.length || 0} test(s)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.tests?.map(t => t.testName).join(', ').slice(0, 30)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{report.reportDate ? formatDate(report.reportDate) : formatDate(report.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(report.status)}
                          label={report.status?.toUpperCase()}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{report.examinedBy || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.priority?.toUpperCase() || 'NORMAL'}
                          color={getPriorityColor(report.priority)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Report">
                          <IconButton onClick={() => handleView(report)} size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Report">
                          <IconButton onClick={() => handleEdit(report)} size="small" color="secondary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Report">
                          <IconButton onClick={() => handleDownload(report)} size="small" color="success">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredReports.length} 
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* View Dialog */ }
        {openViewDialog && <ReportViewDialog />}

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
            </Alert>
        </Snackbar>
      </Box>
  );
};

export default ReportManagementEnhanced;
