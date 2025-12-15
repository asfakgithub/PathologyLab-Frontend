import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
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
  Chip,
  Alert,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  Tooltip,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  Payment,
  Person,
  InfoOutlined
} from '@mui/icons-material';
import { getUsers } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import useSystemNotification from '../../core/hooks/useSystemNotification';
import { SettingsContext } from '../../context/SettingsContext';
import InvoiceFormDialog from './InvoiceFormDialog';
import InvoiceViewDialog from './InvoiceViewDialog';
import PaymentDialog from './PaymentDialog';
import useInvoices from '../../core/hooks/useInvoices';

const InvoiceManagementNew = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useSystemNotification();
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      const usersData = res?.users || [];
      setUsers(usersData.filter(u =>
        ['doctor', 'admin', 'master', 'compounder'].includes(u.role)
      ));
    } catch (e) {
      console.error(e);
    }
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

  const filteredInvoices = invoices.filter(inv =>
    inv.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedInvoices = filteredInvoices.slice(
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
        alignItems={{ sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          Invoice Management
        </Typography>

        {billingEnabled && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            fullWidth={isMobile}
          >
            Create Invoice
          </Button>
        )}
      </Stack>

      {/* Recipient Selector */}
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Autocomplete
          options={users}
          value={selectedRecipient}
          onChange={(_, v) => setSelectedRecipient(v)}
          getOptionLabel={(o) => o?.name || o?.email || ''}
          sx={{ width: isMobile ? '100%' : 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Notify Recipient (optional)" size="small" />
          )}
        />
        <Tooltip title="Notification will be sent to selected user">
          <InfoOutlined fontSize="small" />
        </Tooltip>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search & Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search invoices..."
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

        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {[
              { label: 'Total', value: filteredInvoices.length, color: 'primary.main' },
              { label: 'Paid', value: filteredInvoices.filter(i => i.status === 'paid').length, color: 'success.main' },
              { label: 'Pending', value: filteredInvoices.filter(i => i.status === 'pending').length, color: 'warning.main' }
            ].map((s, i) => (
              <Grid item xs={4} key={i}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color={s.color}>{s.value}</Typography>
                    <Typography variant="caption">{s.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* MOBILE VIEW */}
      {isMobile ? (
        <Grid container spacing={2}>
          {paginatedInvoices.map(inv => (
            <Grid item xs={12} key={inv._id}>
              <Card>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar><Person /></Avatar>
                      <Box>
                        <Typography fontWeight={600}>{inv.patientName}</Typography>
                        <Typography variant="caption">{inv.invoiceNumber}</Typography>
                      </Box>
                    </Stack>

                    <Typography>₹{inv.totalAmount}</Typography>
                    <Chip
                      label={inv.status}
                      size="small"
                      color={getStatusColor(inv.status)}
                    />

                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => { setSelectedInvoice(inv); setViewDialog(true); }}>
                        <Visibility />
                      </IconButton>
                      {allowEdit && (
                        <IconButton onClick={() => { setEditingInvoice(inv); setOpenDialog(true); }}>
                          <Edit />
                        </IconButton>
                      )}
                      {inv.status !== 'paid' && (
                        <IconButton onClick={() => { setSelectedInvoice(inv); setPaymentDialog(true); }}>
                          <Payment />
                        </IconButton>
                      )}
                      {allowDelete && (
                        <IconButton color="error" onClick={() => deleteInvoice(inv.invoiceId)}>
                          <Delete />
                        </IconButton>
                      )}
                    </Stack>
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
                  <TableCell>Invoice</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInvoices.map(inv => (
                  <TableRow key={inv._id} hover>
                    <TableCell>{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.patientName}</TableCell>
                    <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>₹{inv.totalAmount}</TableCell>
                    <TableCell>
                      <Chip size="small" label={inv.status} color={getStatusColor(inv.status)} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => { setSelectedInvoice(inv); setViewDialog(true); }}>
                        <Visibility />
                      </IconButton>
                      {allowEdit && (
                        <IconButton onClick={() => { setEditingInvoice(inv); setOpenDialog(true); }}>
                          <Edit />
                        </IconButton>
                      )}
                      {inv.status !== 'paid' && (
                        <IconButton onClick={() => { setSelectedInvoice(inv); setPaymentDialog(true); }}>
                          <Payment />
                        </IconButton>
                      )}
                      {allowDelete && (
                        <IconButton color="error" onClick={() => deleteInvoice(inv.invoiceId)}>
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredInvoices.length}
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

      {/* Dialogs */}
      <InvoiceFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        invoice={editingInvoice}
        settings={settings.invoice}
        selectedRecipient={selectedRecipient}
        onSuccess={() => {
          setOpenDialog(false);
          fetchInvoices();
        }}
        onError={setError}
      />

      <InvoiceViewDialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        invoice={selectedInvoice}
      />

      <PaymentDialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        invoice={selectedInvoice}
        selectedRecipient={selectedRecipient}
        onSuccess={() => {
          setPaymentDialog(false);
          fetchInvoices();
        }}
        onError={setError}
      />
    </Box>
  );
};

export default InvoiceManagementNew;
