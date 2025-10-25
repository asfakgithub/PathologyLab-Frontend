import React, { useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Assignment as ReportIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CompleteIcon,
  HourglassEmpty as PendingIcon,
  Warning as CriticalIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
// Date picker dependencies removed for now - can be added later if needed

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

  // Sample data
  useEffect(() => {
    const sampleReports = [
      {
        id: 1,
        reportId: 'RPT-2024-001',
        patientId: 'PAT-001',
        patientName: 'John Doe',
        patientAge: 35,
        patientGender: 'Male',
        tests: [
          { name: 'Complete Blood Count', result: 'Normal', status: 'completed' },
          { name: 'Lipid Profile', result: 'High Cholesterol', status: 'completed' }
        ],
        reportDate: '2024-01-15',
        status: 'completed',
        findings: 'Elevated cholesterol levels observed',
        conclusion: 'Hypercholesterolemia',
        recommendations: 'Dietary changes and follow-up in 3 months',
        doctorName: 'Dr. Smith',
        criticalValues: false,
        totalAmount: 1500
      },
      {
        id: 2,
        reportId: 'RPT-2024-002',
        patientId: 'PAT-002',
        patientName: 'Jane Smith',
        patientAge: 28,
        patientGender: 'Female',
        tests: [
          { name: 'Thyroid Function', result: 'Pending', status: 'processing' },
          { name: 'Vitamin D', result: 'Deficient', status: 'completed' }
        ],
        reportDate: '2024-01-16',
        status: 'processing',
        findings: 'Vitamin D deficiency noted',
        conclusion: 'Partial results available',
        recommendations: 'Vitamin D supplementation',
        doctorName: 'Dr. Johnson',
        criticalValues: true,
        totalAmount: 1200
      },
      {
        id: 3,
        reportId: 'RPT-2024-003',
        patientId: 'PAT-003',
        patientName: 'Mike Wilson',
        patientAge: 45,
        patientGender: 'Male',
        tests: [
          { name: 'Diabetes Panel', result: 'Normal', status: 'completed' },
          { name: 'Liver Function', result: 'Normal', status: 'completed' }
        ],
        reportDate: '2024-01-17',
        status: 'completed',
        findings: 'All parameters within normal limits',
        conclusion: 'Normal results',
        recommendations: 'Continue regular monitoring',
        doctorName: 'Dr. Brown',
        criticalValues: false,
        totalAmount: 1800
      }
    ];
    
    setTimeout(() => {
      setReports(sampleReports);
      setFilteredReports(sampleReports);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter reports
  useEffect(() => {
    let filtered = reports.filter(report => {
      const matchesSearch = 
        report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesType = filterType === 'all' || 
        (filterType === 'critical' && report.criticalValues) ||
        (filterType === 'normal' && !report.criticalValues);
      
      return matchesSearch && matchesStatus && matchesType;
    });
    
    setFilteredReports(filtered);
    setPage(0);
  }, [searchTerm, filterStatus, filterType, reports]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'pending': return 'default';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CompleteIcon />;
      case 'processing': return <PendingIcon />;
      case 'pending': return <CalendarIcon />;
      case 'critical': return <CriticalIcon />;
      default: return <CalendarIcon />;
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setOpenViewDialog(true);
  };

  const handleEdit = (report) => {
    setSelectedReport(report);
    // setOpenDialog(true); // This would open an edit dialog, which seems to be removed.
  };

  const handlePrint = (report) => {
    console.log('Printing report:', report.reportId);
    // Implement print functionality
  };

  const handleExport = (report) => {
    console.log('Exporting report:', report.reportId);
    // Implement export functionality
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
              Generated on {selectedReport?.reportDate}
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
                      <Typography variant="body1">{selectedReport.patientName}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">Age</Typography>
                      <Typography variant="body1">{selectedReport.patientAge} years</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="body2" color="text.secondary">Gender</Typography>
                      <Typography variant="body1">{selectedReport.patientGender}</Typography>
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
                      <ListItem key={index}>
                        <ListItemText
                          primary={test.name}
                          secondary={`Result: ${test.result}`}
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
                    {selectedReport.findings || 'No findings recorded'}
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
                      <Typography variant="body1">{selectedReport.doctorName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Critical Values</Typography>
                      <Chip
                        label={selectedReport.criticalValues ? 'Yes' : 'No'}
                        size="small"
                        color={selectedReport.criticalValues ? 'error' : 'success'}
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
        <Button onClick={handlePrint} startIcon={<PrintIcon />} variant="outlined">
          Print Report
        </Button>
        <Button onClick={handleExport} startIcon={<DownloadIcon />} variant="outlined">
          Export PDF
        </Button>
        <Button onClick={() => setOpenViewDialog(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading reports...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
        {/* Header */}
        <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Report Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage patient reports and test results
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            // onClick={() => setOpenDialog(true)} // This would open a create dialog.
          >
            Create Report
          </Button>
        </Box>

        {/* Statistics Cards */}
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
                      {reports.filter(r => r.status === 'processing').length}
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
                    <CriticalIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {reports.filter(r => r.criticalValues).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Critical Values</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Search */}
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
                  <MenuItem value="processing">Processing</MenuItem>
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

        {/* Reports Table */}
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
                  <TableCell>Critical</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((report) => (
                    <TableRow key={report.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <ReportIcon color="primary" sx={{ mr: 1 }} />
                          {report.reportId}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {report.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.patientAge}y, {report.patientGender}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {report.tests.length} test(s)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.tests.map(t => t.name).join(', ').slice(0, 30)}...
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{report.reportDate}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(report.status)}
                          label={report.status.toUpperCase()}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{report.doctorName}</TableCell>
                      <TableCell>
                        {report.criticalValues && (
                          <Chip
                            icon={<CriticalIcon />}
                            label="Critical"
                            color="error"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Report">
                          <IconButton onClick={() => handleView(report)} size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Report">
                          <IconButton onClick={() => handleEdit(report)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Report">
                          <IconButton onClick={() => handlePrint(report)} size="small">
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Export PDF">
                          <IconButton onClick={() => handleExport(report)} size="small">
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

        {/* View Dialog */}
        <ReportViewDialog />
      </Box>
  );
};

export default ReportManagementEnhanced;
