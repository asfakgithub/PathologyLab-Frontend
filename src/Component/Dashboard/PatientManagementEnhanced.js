import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
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
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Receipt,
  Visibility
} from '@mui/icons-material';
import { getPatients, deletePatient } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import CreateOrEditPatient from './CreateOrEditPatient';
import PatientDetectiveBoard from './PatientDetectiveBoard';

const PatientManagementEnhanced = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [invoiceMode] = useState(false);
  const [isDetectiveBoardOpen, setIsDetectiveBoardOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await getPatients();
      setPatients(res.data.patients || []);
    } catch (e) {
      setError('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mobileNo?.includes(searchTerm)
  );

  const paginatedPatients = filteredPatients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          Patient Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          fullWidth={isMobile}
        >
          Add Patient
        </Button>
      </Stack>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search + Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search patients"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {filteredPatients.length}
              </Typography>
              <Typography variant="body2">Total Patients</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MOBILE VIEW */}
      {isMobile ? (
        <Stack spacing={2}>
          {paginatedPatients.map(patient => (
            <Card key={patient._id}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{patient.name?.charAt(0)}</Avatar>
                  <Box>
                    <Typography fontWeight={600}>{patient.name}</Typography>
                    <Typography variant="caption">{patient.mobileNo}</Typography>
                  </Box>
                </Stack>

                <Typography mt={1} variant="body2">
                  Age: {patient.age} | Gender: {patient.gender}
                </Typography>

                <Stack direction="row" spacing={1} mt={2}>
                  <IconButton onClick={() => setSelectedPatientId(patient._id)}>
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => setEditingPatient(patient)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => setEditingPatient(patient)}>
                    <Receipt />
                  </IconButton>
                  <IconButton color="error" onClick={() => deletePatient(patient._id)}>
                    <Delete />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        /* DESKTOP TABLE */
        <Paper>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Age / Gender</TableCell>
                  <TableCell>Registered</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedPatients.map(patient => (
                  <TableRow key={patient._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar>{patient.name?.charAt(0)}</Avatar>
                        <Box>
                          <Typography fontWeight={600}>{patient.name}</Typography>
                          <Typography variant="caption">
                            ID: {patient._id?.slice(-6)}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography>{patient.mobileNo}</Typography>
                      <Typography variant="caption">{patient.email}</Typography>
                    </TableCell>

                    <TableCell>
                      {patient.age} / {patient.gender}
                    </TableCell>

                    <TableCell>
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row">
                        <Tooltip title="View">
                          <IconButton>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Invoice">
                          <IconButton>
                            <Receipt />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredPatients.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => {
              setRowsPerPage(+e.target.value);
              setPage(0);
            }}
          />
        </Paper>
      )}

      <CreateOrEditPatient
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        patient={editingPatient}
        invoiceMode={invoiceMode}
        onSuccess={() => {
          setOpenDialog(false);
          fetchPatients();
        }}
      />

      {isDetectiveBoardOpen && (
        <PatientDetectiveBoard
          isOpen
          patientId={selectedPatientId}
          onClose={() => setIsDetectiveBoardOpen(false)}
        />
      )}
    </Box>
  );
};

export default PatientManagementEnhanced;
