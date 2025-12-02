import React, { useState, useEffect, useContext } from 'react';
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
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { getUsers } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import useSystemNotification from '../../core/hooks/useSystemNotification';
import { SettingsContext } from '../../context/SettingsContext';
import InvoiceFormDialog from './InvoiceFormDialog';
import InvoiceViewDialog from './InvoiceViewDialog';
import PaymentDialog from './PaymentDialog';
import useInvoices from '../../core/hooks/useInvoices';

const InvoiceManagementNew = () => {
  const { sendSystemNotification } = useSystemNotification();
  const { settings } = useContext(SettingsContext);
  const { 
    invoices, 
    loading, 
    error, 
    success, 
    fetchInvoices, 
    deleteInvoice,
    setError,
    setSuccess 
  } = useInvoices();
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      const usersData = res?.users || [];
      // prefer doctors/admins for recipient selection
      const filtered = usersData.filter(u => ['doctor', 'admin', 'master', 'compounder'].includes(u.role));
      setUsers(filtered);
    } catch (err) {
      console.error('Failed to fetch users for recipient selector:', err);
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setOpenDialog(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setOpenDialog(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewDialog(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      const invoiceToDelete = invoices.find(inv => inv.invoiceId === invoiceId);
      await deleteInvoice(invoiceId);
      if (invoiceToDelete) {
        try {
          await sendSystemNotification({
            message: `Invoice ${invoiceToDelete.invoiceNumber || invoiceToDelete.invoiceId} for patient ${invoiceToDelete.patientName || invoiceToDelete.patientId || 'Unknown'} has been deleted.`,
            recipient: selectedRecipient?._id,
            recipientEmail: selectedRecipient?.email
          });
        } catch (notificationError) {
          console.error('Failed to send invoice deletion notification:', notificationError);
        }
      }
    }
  };

  const handlePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'partially_paid': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  const { billingEnabled, allowEdit, allowDelete } = settings.invoice || {};

  const filteredInvoices = invoices.filter(invoice =>
    invoice.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.invoiceNumber || invoice.invoiceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Invoice Management
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => option?.name || option?.email || option?.firstName || ''}
              value={selectedRecipient}
              onChange={(e, newVal) => setSelectedRecipient(newVal)}
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Notify Recipient (optional)" size="small" />
              )}
            />
            <Tooltip title="If no recipient is chosen, the message will be delivered to an admin/master user by default.">
              <IconButton size="small" aria-label="recipient-info">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {billingEnabled &&
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateInvoice}
              sx={{ borderRadius: 2 }}
            >
              Create Invoice
            </Button>
          }
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search and Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="primary">
                  {filteredInvoices.length}
                </Typography>
                <Typography variant="body2">Total</Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="success.main">
                  {filteredInvoices.filter(inv => inv.status === 'paid').length}
                </Typography>
                <Typography variant="body2">Paid</Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="h6" color="warning.main">
                  {filteredInvoices.filter(inv => inv.status === 'pending').length}
                </Typography>
                <Typography variant="body2">Pending</Typography>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Invoices Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Invoice #</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Patient</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {invoice.invoiceNumber || invoice.invoiceId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {invoice.invoiceId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {invoice.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.patientPhone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{invoice.totalAmount?.toFixed(2)}
                    </Typography>
                    {invoice.dueAmount > 0 && (
                      <Typography variant="caption" color="error">
                        Due: ₹{invoice.dueAmount?.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status?.toUpperCase()}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => handleViewInvoice(invoice)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {allowEdit &&
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditInvoice(invoice)}
                            color="secondary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      }
                      {invoice.status !== 'paid' && (
                        <Tooltip title="Payment">
                          <IconButton
                            size="small"
                            onClick={() => handlePayment(invoice)}
                            color="success"
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {allowDelete &&
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteInvoice(invoice.invoiceId)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Create/Edit Invoice Dialog */}
      <InvoiceFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        invoice={editingInvoice}
        settings={settings.invoice}
        selectedRecipient={selectedRecipient}
        onSuccess={() => {
          setOpenDialog(false);
          fetchInvoices();
          setSuccess(editingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully');
        }}
        onError={(error) => setError(error)}
      />

      {/* View Invoice Dialog */}
      <InvoiceViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        invoice={selectedInvoice}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        invoice={selectedInvoice}
        selectedRecipient={selectedRecipient}
        onSuccess={() => {
          setPaymentDialog(false);
          fetchInvoices();
          setSuccess('Payment added successfully');
        }}
        onError={(error) => setError(error)}
      />
    </Box>
  );
};


export default InvoiceManagementNew;
