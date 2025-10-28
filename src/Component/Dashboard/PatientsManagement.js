import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Alert,
  InputAdornment,
  Fab,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  Wc as GenderIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getPatients, createPatient, updatePatient, deletePatient } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const PatientForm = ({ open, onClose, onSubmit, patient, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        age: patient.age || '',
        gender: patient.gender || '',
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || ''
      });
    } else {
      setFormData({
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        emergencyContact: ''
      });
    }
    setErrors({});
  }, [patient, open]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age < 0 || formData.age > 150) {
      newErrors.age = 'Please enter a valid age';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {patient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={formData.age}
                onChange={handleChange('age')}
                error={!!errors.age}
                helperText={errors.age}
                required
                inputProps={{ min: 0, max: 150 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={formData.gender}
                onChange={handleChange('gender')}
                error={!!errors.gender}
                helperText={errors.gender}
                required
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange('phone')}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange('address')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={handleChange('emergencyContact')}
                placeholder="Name and phone number"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (patient ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const PatientCard = ({ patient, onEdit, onDelete }) => (
  <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {patient.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {patient._id?.slice(-6) || 'N/A'}
          </Typography>
        </Box>
      </Box>
      
      <Box display="flex" alignItems="center" mb={1}>
        <CakeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2">
          {patient.age} years old
        </Typography>
        <GenderIcon sx={{ fontSize: 16, ml: 2, mr: 1, color: 'text.secondary' }} />
        <Chip 
          label={patient.gender} 
          size="small" 
          variant="outlined"
          sx={{ textTransform: 'capitalize' }}
        />
      </Box>
      
      <Box display="flex" alignItems="center" mb={1}>
        <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2">
          {patient.phone}
        </Typography>
      </Box>
      
      {patient.email && (
        <Box display="flex" alignItems="center" mb={1}>
          <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {patient.email}
          </Typography>
        </Box>
      )}
      
      {patient.address && (
        <Box display="flex" alignItems="flex-start" mb={2}>
          <LocationIcon sx={{ fontSize: 16, mr: 1, mt: 0.2, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
            {patient.address}
          </Typography>
        </Box>
      )}
      
      <Box display="flex" justifyContent="flex-end" gap={1}>
        <IconButton size="small" onClick={() => onEdit(patient)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(patient)} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </CardContent>
  </Card>
);

const PatientsManagement = () => {
  const { hasAnyRole } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPatients();
      if (response.data.success) {
        setPatients(response.data.data);
      }
    } catch (err) {
      console.error('Fetch patients error:', err);
      setError('Failed to load patients');
      // Set dummy data for demonstration
      setPatients([
        {
          _id: '1',
          name: 'John Smith',
          age: 35,
          gender: 'male',
          phone: '+1-555-0123',
          email: 'john.smith@email.com',
          address: '123 Main St, City, State 12345',
          emergencyContact: 'Jane Smith - +1-555-0124'
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          age: 28,
          gender: 'female',
          phone: '+1-555-0125',
          email: 'sarah.j@email.com',
          address: '456 Oak Ave, City, State 12345',
          emergencyContact: 'Mike Johnson - +1-555-0126'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (formData) => {
    try {
      setFormLoading(true);
      const response = await createPatient(formData);
      
      if (response.data.success) {
        setPatients(prev => [response.data.data, ...prev]);
        setDialogOpen(false);
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error('Create patient error:', err);
      setError('Failed to create patient');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdatePatient = async (formData) => {
    try {
      setFormLoading(true);
      const response = await updatePatient(selectedPatient._id, formData);
      
      if (response.data.success) {
        setPatients(prev => 
          prev.map(p => p._id === selectedPatient._id ? response.data.data : p)
        );
        setDialogOpen(false);
        setSelectedPatient(null);
      }
    } catch (err) {
      console.error('Update patient error:', err);
      setError('Failed to update patient');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePatient = async (patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.name}?`)) {
      try {
        await deletePatient(patient._id);
        setPatients(prev => prev.filter(p => p._id !== patient._id));
      } catch (err) {
        console.error('Delete patient error:', err);
        setError('Failed to delete patient');
      }
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedPatients = filteredPatients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const canManage = hasAnyRole(['master', 'admin', 'receptionist']);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Patient Management
        </Typography>
        
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('cards')}
            size="small"
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            size="small"
          >
            Table
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search patients by name, phone, or email..."
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
      </Box>

      {/* Content */}
      {viewMode === 'cards' ? (
        <Grid container spacing={2}>
          {filteredPatients.map((patient) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={patient._id}>
              <PatientCard
                patient={patient}
                onEdit={canManage ? (patient) => {
                  setSelectedPatient(patient);
                  setDialogOpen(true);
                } : null}
                onDelete={canManage ? handleDeletePatient : null}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  {canManage && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPatients.map((patient) => (
                  <TableRow key={patient._id} hover>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.gender} 
                        size="small" 
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    {canManage && (
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedPatient(patient);
                            setDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePatient(patient)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredPatients.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {/* Add Patient FAB */}
      {canManage && (
        <Fab
          color="primary"
          aria-label="add patient"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {
            setSelectedPatient(null);
            setDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Patient Form Dialog */}
      <PatientForm
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedPatient(null);
        }}
        onSubmit={selectedPatient ? handleUpdatePatient : handleCreatePatient}
        patient={selectedPatient}
        loading={formLoading}
      />
    </Box>
  );
};

export default PatientsManagement;
