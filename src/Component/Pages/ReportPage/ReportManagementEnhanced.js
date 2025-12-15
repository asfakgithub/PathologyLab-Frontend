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
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Visibility,
  Refresh,
  Download
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import patientService from '../../../services/patientService';

const formatDate = (date) => new Date(date).toLocaleDateString();

const ReportManagementEnhanced = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

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

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await patientService.getAllPatients();
      const patients = res?.data?.patients || [];

      const mapped = patients.map(p => ({
        ...p,
        reportId: p._id.slice(-6).toUpperCase(),
        patient: { name: p.name, patientId: p._id },
        reportDate: p.updatedAt || p.createdAt,
        status: p.status || 'pending',
        priority: p.priority || 'normal',
        tests: p.tests || []
      }));

      setReports(mapped);
    } catch (e) {
      showSnackbar('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const filtered = reports.filter(r => {
      const matchSearch =
        r.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      const matchType =
        filterType === 'all' ||
        (filterType === 'critical' && r.priority === 'critical') ||
        (filterType === 'normal' && r.priority !== 'critical');

      return matchSearch && matchStatus && matchType;
    });

    setFilteredReports(filtered);
    setPage(0);
  }, [reports, searchTerm, filterStatus, filterType]);

  const getStatusColor = (status) =>
    status === 'completed' ? 'success' :
    status === 'in-progress' ? 'warning' : 'default';

  const getPriorityColor = (p) =>
    p === 'critical' ? 'error' : 'info';

  const handleDownload = async (report) => {
    try {
      const res = await patientService.downloadPatientReportPDF(report._id);
      const blob = res.data || res;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.patient?.name}_${report.reportId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showSnackbar('Download failed', 'error');
    }
  };

  if (loading) {
    return (
      <Box minHeight="60vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Report Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage patient reports and test results
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchReports}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/report/create')}>
            Create Report
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* MOBILE VIEW */}
      {isMobile ? (
        <Grid container spacing={2}>
          {filteredReports.map(r => (
            <Grid item xs={12} key={r._id}>
              <Card>
                <CardContent>
                  <Typography fontWeight={600}>{r.patient?.name}</Typography>
                  <Typography variant="body2">Report ID: {r.reportId}</Typography>

                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip size="small" label={r.status} color={getStatusColor(r.status)} />
                    <Chip size="small" label={r.priority} color={getPriorityColor(r.priority)} />
                  </Stack>

                  <Stack direction="row" spacing={1} mt={2}>
                    <IconButton onClick={() => { setSelectedReport(r); setOpenViewDialog(true); }}>
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => navigate(`/view/${r._id}`)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDownload(r)}>
                      <Download />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        /* DESKTOP TABLE */
        <Paper>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(r => (
                    <TableRow key={r._id} hover>
                      <TableCell>{r.reportId}</TableCell>
                      <TableCell>{r.patient?.name}</TableCell>
                      <TableCell>{formatDate(r.reportDate)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.status} color={getStatusColor(r.status)} />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={r.priority} color={getPriorityColor(r.priority)} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => { setSelectedReport(r); setOpenViewDialog(true); }}>
                          <Visibility />
                        </IconButton>
                        <IconButton onClick={() => navigate(`/view/${r._id}`)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDownload(r)}>
                          <Download />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredReports.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(+e.target.value);
              setPage(0);
            }}
          />
        </Paper>
      )}

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Report Details</DialogTitle>
        <DialogContent>
          <Typography>{selectedReport?.patient?.name}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportManagementEnhanced;
