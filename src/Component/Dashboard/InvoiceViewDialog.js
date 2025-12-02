import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box
} from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';

// Invoice View Dialog Component
const InvoiceViewDialog = ({ open, onClose, invoice }) => {
    if (!invoice) return null;
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Invoice Details - {invoice.invoiceNumber || invoice.invoiceId}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
  
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Invoice Information
                  </Typography>
                  <Typography variant="body2"><strong>Invoice ID:</strong> {invoice.invoiceId}</Typography>
                  <Typography variant="body2"><strong>Invoice Number:</strong> {invoice.invoiceNumber || invoice.invoiceId}</Typography>
                  <Typography variant="body2"><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> 
                    <Chip 
                      label={invoice.status?.toUpperCase()} 
                      color={invoice.status === 'paid' ? 'success' : 'warning'} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2"><strong>Doctor:</strong> {invoice.doctorName}</Typography>
                  <Typography variant="body2"><strong>Referred By:</strong> {invoice.referredBy}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Test Details
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Test Name</strong></TableCell>
                          <TableCell><strong>Code</strong></TableCell>
                          <TableCell><strong>Category</strong></TableCell>
                          <TableCell align="right"><strong>Price</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoice.testDetails?.map((test, index) => (
                          <TableRow key={index}>
                            <TableCell>{test.testName}</TableCell>
                            <TableCell>{test.testCode}</TableCell>
                            <TableCell>{test.category}</TableCell>
                            <TableCell align="right">₹{test.testPrice?.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Financial Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">Subtotal: ₹{invoice.subtotalAmount?.toFixed(2)}</Typography>
                      <Typography variant="body2">Discount: -₹{invoice.discountAmount?.toFixed(2)}</Typography>
                      <Typography variant="body2">GST ({invoice.gstPercentage}%): ₹{invoice.gstAmount?.toFixed(2)}</Typography>
                      <Typography variant="body2">Additional Charges: ₹{invoice.additionalCharges?.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary">
                        Total Amount: ₹{invoice.totalAmount?.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Amount Paid: ₹{invoice.amountPaid?.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        Due Amount: ₹{invoice.dueAmount?.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                  {invoice.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Notes:</strong> {invoice.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />}>
            Print
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  export default InvoiceViewDialog;
