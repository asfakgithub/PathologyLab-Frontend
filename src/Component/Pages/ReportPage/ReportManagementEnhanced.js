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
import JSZip from 'jszip';
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
  const [selectedReports, setSelectedReports] = useState(new Set());
  const navigate = useNavigate();

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const patientsResponse = await patientService.getAllPatients();
      const patients = patientsResponse.data?.patients || []; // The API returns patient list in `data.patients`

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
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={async () => {
              // Export all reports as individual PDFs (client-side fallback)
              if (!reports || reports.length === 0) {
                showSnackbar('No reports to export', 'info');
                return;
              }
              setLoading(true);
              try {
                const promises = reports.map(rpt =>
                  patientService.exportPatientData(rpt._id, 'pdf')
                    .then(resp => ({ status: 'fulfilled', rpt, resp }))
                    .catch(err => ({ status: 'rejected', rpt, err }))
                );

                const results = await Promise.all(promises);

                let successCount = 0;
                for (const res of results) {
                  if (res.status === 'fulfilled') {
                    try {
                      const resp = res.resp;
                      const blobData = resp.data || resp;
                      const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      const filename = `${(res.rpt.patient && (res.rpt.patient.name || res.rpt.patient.patientName)) || res.rpt.reportId || res.rpt._id}.pdf`;
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                      successCount++;
                    } catch (e) {
                      console.error('Failed to save blob for', res.rpt, e);
                    }
                  } else {
                    console.error('Export rejected for', res.rpt, res.err);
                  }
                }

                showSnackbar(`Exported ${successCount}/${reports.length} reports (browser downloads).`, successCount === reports.length ? 'success' : 'warning');
              } catch (err) {
                console.error('Export all failed', err);
                showSnackbar('Failed to export all reports', 'error');
              } finally {
                setLoading(false);
              }
            }}
            sx={{ ml: 2 }}
          >
            Export All
          </Button>

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

  const handleDownload = async (report) => {
    try {
      const response = await patientService.downloadPatientReportPDF(report._id);
      
      const blob = response.data || response;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.patient?.name || report.name || 'report'}_${report._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Report downloaded successfully', 'success');
    } catch (error) {
      showSnackbar('Error downloading report: ' + error.message, 'error');
    }
  }

  const handleCreateReport = () => {
    setSelectedReport(null);
    // Navigate to the standalone report create page (no patient id)
    navigate('/report/create');
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
                          primary={test.testName || test.name || test.title || 'Unnamed Test'}
                          secondary={`Category: ${test.category || test.testCategory || test.type || 'N/A'}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={test.status || test.state || 'N/A'}
                            size="small"
                            color={getStatusColor(test.status || test.state)}
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
                      <Typography variant="body1">{selectedReport.examinedBy || selectedReport.doctorName || selectedReport.doctor?.name || selectedReport.referredBy || 'N/A'}</Typography>
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
                onClick={() => {
                  // Export UI action moved to per-selection control below
                  showSnackbar('Use the checkboxes to select reports and click Export Selected.', 'info');
                }}
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
                  <TableCell padding="checkbox">
                    <input
                      type="checkbox"
                      checked={filteredReports.length > 0 && selectedReports.size === filteredReports.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReports(new Set(filteredReports.map(r => r._id)));
                        } else {
                          setSelectedReports(new Set());
                        }
                      }}
                    />
                  </TableCell>
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
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedReports.has(report._id)}
                          onChange={(e) => {
                            const copy = new Set(selectedReports);
                            if (e.target.checked) copy.add(report._id); else copy.delete(report._id);
                            setSelectedReports(copy);
                          }}
                        />
                      </TableCell>
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
          <Box p={2} display="flex" gap={2} alignItems="center">
            <Button
              variant="contained"
              startIcon={<ExportIcon />}
              disabled={selectedReports.size === 0}
              onClick={async () => {
                // Export selected reports as a single ZIP of PDFs (client-side using JSZip)
                try {
                  setLoading(true);
                  const zip = new JSZip();
                  const ids = Array.from(selectedReports);
                  const promises = ids.map(id =>
                    patientService.exportPatientData(id, 'pdf')
                      .then(resp => ({ id, resp }))
                      .catch(err => ({ id, err }))
                  );
                  const results = await Promise.all(promises);
                  let added = 0;
                  for (const r of results) {
                    if (r.err) {
                      console.error('Failed export for', r.id, r.err);
                      continue;
                    }
                    const resp = r.resp;
                    const blobData = resp.data || resp;
                    const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'application/pdf' });
                    const filename = `${r.id}.pdf`;
                    zip.file(filename, blob);
                    added++;
                  }

                  if (added === 0) {
                    showSnackbar('No files could be exported.', 'error');
                    return;
                  }

                  const content = await zip.generateAsync({ type: 'blob' });
                  const url = window.URL.createObjectURL(content);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `reports_${Date.now()}.zip`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                  showSnackbar(`Exported ${added} reports as ZIP`, 'success');
                } catch (err) {
                  console.error('Export selected failed', err);
                  showSnackbar('Export failed', 'error');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Export Selected (ZIP)
            </Button>
            <Button variant="outlined" onClick={() => setSelectedReports(new Set())}>Clear Selection</Button>
          </Box>
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
