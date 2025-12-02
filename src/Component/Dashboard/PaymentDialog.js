import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Box
} from '@mui/material';
import { Payment as PaymentIcon } from '@mui/icons-material';
import invoiceService from '../../services/invoiceService';
import useSystemNotification from '../../core/hooks/useSystemNotification';
import LoadingSpinner from '../common/LoadingSpinner';

// Payment Dialog Component
const PaymentDialog = ({ open, onClose, invoice, onSuccess, onError, selectedRecipient }) => {
    const { sendSystemNotification } = useSystemNotification();
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (invoice && open) {
        setPaymentAmount(invoice.dueAmount?.toString() || '');
      }
    }, [invoice, open]);
  
    const handlePayment = async () => {
        try {
        setLoading(true);
        const amount = parseFloat(paymentAmount);
        
        if (amount <= 0 || amount > invoice.dueAmount) {
          onError('Invalid payment amount');
          return;
        }
  
        await invoiceService.addPayment(invoice.invoiceId, {
          amount,
          method: paymentMethod
        });
  
        try {
          await sendSystemNotification({
            message: `A payment of ₹${amount} was added to invoice ${invoice.invoiceNumber || invoice.invoiceId || invoice._id} for patient ${invoice.patientName || invoice.patientId || 'Unknown'}.`,
            recipient: selectedRecipient?._id,
            recipientEmail: selectedRecipient?.email
          });
        } catch (notificationError) {
          console.error('Failed to send payment notification:', notificationError);
        }
  
        onSuccess();
      } catch (error) {
        onError('Failed to process payment: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
  
    if (!invoice) return null;
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Payment - {invoice.invoiceNumber || invoice.invoiceId || invoice._id}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="body2">Total Amount: ₹{invoice.totalAmount?.toFixed(2)}</Typography>
                    <Typography variant="body2">Amount Paid: ₹{invoice.amountPaid?.toFixed(2)}</Typography>
                    <Typography variant="h6" color="error">
                      Due Amount: ₹{invoice.dueAmount?.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Payment Amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  helperText={`Maximum: ₹${invoice.dueAmount?.toFixed(2)}`}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="Payment Method"
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="upi">UPI</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="cheque">Cheque</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handlePayment}
            disabled={loading || !paymentAmount}
            startIcon={loading ? <LoadingSpinner size={20} /> : <PaymentIcon />}
          >
            {loading ? 'Processing...' : 'Add Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default PaymentDialog;
