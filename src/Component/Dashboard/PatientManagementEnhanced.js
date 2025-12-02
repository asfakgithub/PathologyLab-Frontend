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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as InvoiceIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getPatients, deletePatient } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import CreateOrEditPatient from './CreateOrEditPatient';
import PatientDetectiveBoard from './PatientDetectiveBoard';

const PatientManagementEnhanced = () => {
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
  const [isDetectiveBoardOpen, setIsDetectiveBoardOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      setPatients(response.data.patients || []);
    } catch (err) {
      setError('Failed to fetch patients: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = () => { setEditingPatient(null); setInvoiceMode(false); setOpenDialog(true); };
  const handleEditPatient = (patient) => { setEditingPatient(patient); setInvoiceMode(false); setOpenDialog(true); };
  const handleViewPatient = (patientId) => { setSelectedPatientId(patientId); setIsDetectiveBoardOpen(true); };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await deletePatient(patientId);
      setSuccess('Patient deleted successfully');
      fetchPatients();
    } catch (err) {
      setError('Failed to delete patient: ' + (err.message || err));
    }
  };

  const handleCreateInvoice = (patient) => { setEditingPatient(patient); setInvoiceMode(true); setOpenDialog(true); };

  const filteredPatients = patients?.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mobileNo?.includes(searchTerm)
  );

  const paginatedPatients = filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: 24 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Patient Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreatePatient} sx={{ borderRadius: 2 }}>Add Patient</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField fullWidth placeholder="Search patients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
        </Grid>
        <Grid item xs={12} md={4}><Card sx={{ textAlign: 'center', p: 2 }}><Typography variant="h4" color="primary">{filteredPatients.length}</Typography><Typography variant="body2">Total Patients</Typography></Card></Grid>
      </Grid>

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
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{patient.name?.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">{patient.name}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {patient._id?.slice(-8)}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{patient.mobileNo}</Typography>
                    <Typography variant="body2" color="text.secondary">{patient.email}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{patient.age} years, {patient.gender}</Typography></TableCell>
                  <TableCell>{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View"><IconButton size="small" color="primary" onClick={() => handleViewPatient(patient._id)}><ViewIcon /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEditPatient(patient)} color="secondary"><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Create Invoice"><IconButton size="small" color="success" onClick={() => handleCreateInvoice(patient)}><InvoiceIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeletePatient(patient._id)} color="error"><DeleteIcon /></IconButton></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={filteredPatients.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(event,newPage) => setPage(newPage)} onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value,10)); setPage(0); }} />
      </Paper>

      <CreateOrEditPatient
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        patient={editingPatient}
        invoiceMode={invoiceMode}
        onSuccess={() => { setOpenDialog(false); fetchPatients(); if (invoiceMode) setSuccess('Invoice created successfully for patient'); else setSuccess(editingPatient ? 'Patient updated successfully' : 'Patient created successfully'); }}
        onError={(error) => setError(error)}
      />

      {isDetectiveBoardOpen && (
        <PatientDetectiveBoard
          isOpen={isDetectiveBoardOpen}
          onClose={() => setIsDetectiveBoardOpen(false)}
          patientId={selectedPatientId}
        />
      )}
    </div>
  );
};

export default PatientManagementEnhanced;
