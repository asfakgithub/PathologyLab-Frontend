// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Typography,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TablePagination,
//   TextField,
//   InputAdornment,
//   Chip,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   Card,
//   CardContent,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemSecondaryAction,
//   Avatar,
//   Tooltip,
//   CircularProgress,
//   Snackbar,
//   Menu,
//   Stepper,
//   Step,
//   StepLabel
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Add as AddIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Visibility as ViewIcon,
//   Print as PrintIcon,
//   Download as DownloadIcon,
//   Assignment as ReportIcon,
//   Science as TestIcon,
//   Person as PersonIcon,
//   AttachMoney as MoneyIcon,
//   CalendarToday as CalendarIcon,
//   CheckCircle as CompleteIcon,
//   HourglassEmpty as PendingIcon,
//   Warning as CriticalIcon,
//   FileDownload as ExportIcon,
//   Email as EmailIcon,
//   MoreVert as MoreIcon,
//   Refresh as RefreshIcon,
//   FilterList as FilterIcon,
//   Check as ApproveIcon,
//   Close as RejectIcon
// } from '@mui/icons-material';
// import reportService from '../../../services/reportService';
// import patientService from '../../../services/patientService';
// import settingsService from '../../../services/settingsService';

// const ReportManagementProfessional = () => {
//   const [reports, setReports] = useState([]);
//   const [filteredReports, setFilteredReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [filterPriority, setFilterPriority] = useState('all');
//   const [openDialog, setOpenDialog] = useState(false);
//   const [openViewDialog, setOpenViewDialog] = useState(false);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [dialogMode, setDialogMode] = useState('create');
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [menuReportId, setMenuReportId] = useState(null);
//   const [stats, setStats] = useState({});
//   const [organizationSettings, setOrganizationSettings] = useState(null);
  
//   // Form data for create/edit report
//   const [formData, setFormData] = useState({
//     patientId: '',
//     tests: [],
//     status: 'pending',
//     priority: 'normal',
//     remarks: '',
//     header: {
//       includeBanner: true,
//       bannerImageUrl: '',
//       labName: '',
//       labAddress: '',
//       labContact: '',
//       labEmail: ''
//     },
//     footer: {
//       includeBanner: true,
//       bannerImageUrl: '',
//       footerText: '',
//       signature: ''
//     }
//   });

//   useEffect(() => {
//     fetchReports();
//     fetchStats();
//     fetchOrganizationSettings();
//   }, []);

//   useEffect(() => {
//     filterReports();
//   }, [reports, searchTerm, filterStatus, filterPriority]);

//   const fetchReports = async () => {
//     try {
//       setLoading(true);
//       const response = await reportService.getAllReports({
//         page: page + 1,
//         limit: 100, // Get all for client-side filtering
//         sortBy: 'createdAt',
//         sortOrder: 'desc'
//       });
      
//       console.log('📊 Fetched reports:', response);
//       setReports(response.data || []);
//     } catch (error) {
//       console.error('❌ Error fetching reports:', error);
//       showSnackbar('Error fetching reports', 'error');
//       setReports([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await reportService.getReportStats();
//       setStats(response.data || {});
//     } catch (error) {
//       console.error('❌ Error fetching stats:', error);
//     }
//   };

//   const fetchOrganizationSettings = async () => {
//     try {
//       const response = await settingsService.getOrganizationSettings();
//       setOrganizationSettings(response.data);
//     } catch (error) {
//       console.error('❌ Error fetching organization settings:', error);
//     }
//   };

//   const filterReports = () => {
//     let filtered = reports;

//     // Search filter
//     if (searchTerm) {
//       filtered = filtered.filter(report => 
//         report.reportId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         report.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         report.patient?.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Status filter
//     if (filterStatus !== 'all') {
//       filtered = filtered.filter(report => report.status === filterStatus);
//     }

//     // Priority filter
//     if (filterPriority !== 'all') {
//       filtered = filtered.filter(report => report.priority === filterPriority);
//     }

//     setFilteredReports(filtered);
//   };

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   const handleMenuClick = (event, reportId) => {
//     setAnchorEl(event.currentTarget);
//     setMenuReportId(reportId);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//     setMenuReportId(null);
//   };

//   const handleCreateReport = () => {
//     setDialogMode('create');
//     setFormData({
//       patientId: '',
//       tests: [],
//       status: 'pending',
//       priority: 'normal',
//       remarks: '',
//       header: organizationSettings ? {
//         includeBanner: true,
//         bannerImageUrl: organizationSettings.labInfo?.logo || '',
//         labName: organizationSettings.labInfo?.name || 'PathologyLab Medical Center',
//         labAddress: organizationSettings.labInfo?.address ? 
//           `${organizationSettings.labInfo.address.street}, ${organizationSettings.labInfo.address.city}` : '',
//         labContact: organizationSettings.labInfo?.contact?.phone || '',
//         labEmail: organizationSettings.labInfo?.contact?.email || ''
//       } : {
//         includeBanner: true,
//         bannerImageUrl: '',
//         labName: 'PathologyLab Medical Center',
//         labAddress: '',
//         labContact: '',
//         labEmail: ''
//       },
//       footer: organizationSettings ? {
//         includeBanner: true,
//         bannerImageUrl: organizationSettings.labInfo?.seal || '',
//         footerText: `© ${new Date().getFullYear()} ${organizationSettings.labInfo?.name || 'PathologyLab Medical Center'}`,
//         signature: organizationSettings.labInfo?.signature || ''
//       } : {
//         includeBanner: true,
//         bannerImageUrl: '',
//         footerText: `© ${new Date().getFullYear()} PathologyLab Medical Center`,
//         signature: ''
//       }
//     });
//     setOpenDialog(true);
//   };

//   const handleEditReport = (report) => {
//     setDialogMode('edit');
//     setSelectedReport(report);
//     setFormData({
//       patientId: report.patient?.patientId || '',
//       tests: report.tests || [],
//       status: report.status || 'pending',
//       priority: report.priority || 'normal',
//       remarks: report.remarks || '',
//       header: report.header || formData.header,
//       footer: report.footer || formData.footer
//     });
//     setOpenDialog(true);
//     handleMenuClose();
//   };

//   const handleViewReport = async (report) => {
//     try {
//       const response = await reportService.getReportById(report._id || report.reportId);
//       setSelectedReport(response.data);
//       setOpenViewDialog(true);
//       handleMenuClose();
//     } catch (error) {
//       console.error('❌ Error fetching report details:', error);
//       showSnackbar('Error fetching report details', 'error');
//     }
//   };

//   const handleDeleteReport = async (reportId) => {
//     if (window.confirm('Are you sure you want to delete this report?')) {
//       try {
//         await reportService.deleteReport(reportId);
//         showSnackbar('Report deleted successfully');
//         fetchReports();
//         handleMenuClose();
//       } catch (error) {
//         console.error('❌ Error deleting report:', error);
//         showSnackbar('Error deleting report', 'error');
//       }
//     }
//   };

//   const handleApproveReport = async (reportId) => {
//     try {
//       await reportService.updateReportStatus(reportId, 'completed');
//       showSnackbar('Report approved successfully');
//       fetchReports();
//       handleMenuClose();
//     } catch (error) {
//       console.error('❌ Error approving report:', error);
//       showSnackbar('Error approving report', 'error');
//     }
//   };

//   const handleGeneratePDF = async (reportId) => {
//     try {
//       const response = await reportService.generateReportPDF(reportId);
      
//       // Create blob and download
//       const blob = new Blob([response], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `report-${reportId}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       window.URL.revokeObjectURL(url);
//       document.body.removeChild(a);
      
//       showSnackbar('PDF generated successfully');
//       handleMenuClose();
//     } catch (error) {
//       console.error('❌ Error generating PDF:', error);
//       showSnackbar('Error generating PDF', 'error');
//     }
//   };

//   const handleSendEmail = async (reportId) => {
//     try {
//       const report = reports.find(r => r._id === reportId);
//       if (report && report.patient?.email) {
//         await reportService.sendReportEmail(reportId, {
//           email: report.patient.email,
//           subject: `Lab Report - ${report.reportId}`,
//           message: 'Please find your lab report attached.'
//         });
//         showSnackbar('Email sent successfully');
//       } else {
//         showSnackbar('Patient email not found', 'warning');
//       }
//       handleMenuClose();
//     } catch (error) {
//       console.error('❌ Error sending email:', error);
//       showSnackbar('Error sending email', 'error');
//     }
//   };

//   const handleSubmitForm = async () => {
//     try {
//       if (dialogMode === 'create') {
//         await reportService.createReport(formData);
//         showSnackbar('Report created successfully');
//       } else {
//         await reportService.updateReport(selectedReport._id, formData);
//         showSnackbar('Report updated successfully');
//       }
      
//       setOpenDialog(false);
//       fetchReports();
//     } catch (error) {
//       console.error('❌ Error submitting form:', error);
//       showSnackbar('Error saving report', 'error');
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'completed': return 'success';
//       case 'pending': return 'warning';
//       case 'in-progress': return 'info';
//       default: return 'default';
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'critical': return 'error';
//       case 'high': return 'warning';
//       case 'normal': return 'default';
//       case 'low': return 'info';
//       default: return 'default';
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header with Stats */}
//       <Grid container spacing={3} sx={{ mb: 3 }}>
//         <Grid item xs={12}>
//           <Typography variant="h4" gutterBottom>
//             Report Management
//           </Typography>
//         </Grid>
        
//         {/* Stats Cards */}
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Box display="flex" alignItems="center">
//                 <ReportIcon color="primary" sx={{ mr: 2 }} />
//                 <Box>
//                   <Typography variant="h6">{stats.total || 0}</Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Total Reports
//                   </Typography>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Box display="flex" alignItems="center">
//                 <PendingIcon color="warning" sx={{ mr: 2 }} />
//                 <Box>
//                   <Typography variant="h6">{stats.pending || 0}</Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Pending
//                   </Typography>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Box display="flex" alignItems="center">
//                 <CompleteIcon color="success" sx={{ mr: 2 }} />
//                 <Box>
//                   <Typography variant="h6">{stats.completed || 0}</Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Completed
//                   </Typography>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
        
//         <Grid item xs={12} sm={6} md={3}>
//           <Card>
//             <CardContent>
//               <Box display="flex" alignItems="center">
//                 <CalendarIcon color="info" sx={{ mr: 2 }} />
//                 <Box>
//                   <Typography variant="h6">{stats.today || 0}</Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Today
//                   </Typography>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Actions and Filters */}
//       <Paper sx={{ p: 2, mb: 3 }}>
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={12} sm={6} md={4}>
//             <TextField
//               fullWidth
//               placeholder="Search reports..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon />
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           </Grid>
          
//           <Grid item xs={12} sm={6} md={2}>
//             <FormControl fullWidth>
//               <InputLabel>Status</InputLabel>
//               <Select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 label="Status"
//               >
//                 <MenuItem value="all">All Status</MenuItem>
//                 <MenuItem value="pending">Pending</MenuItem>
//                 <MenuItem value="in-progress">In Progress</MenuItem>
//                 <MenuItem value="completed">Completed</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
          
//           <Grid item xs={12} sm={6} md={2}>
//             <FormControl fullWidth>
//               <InputLabel>Priority</InputLabel>
//               <Select
//                 value={filterPriority}
//                 onChange={(e) => setFilterPriority(e.target.value)}
//                 label="Priority"
//               >
//                 <MenuItem value="all">All Priority</MenuItem>
//                 <MenuItem value="critical">Critical</MenuItem>
//                 <MenuItem value="high">High</MenuItem>
//                 <MenuItem value="normal">Normal</MenuItem>
//                 <MenuItem value="low">Low</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>
          
//           <Grid item xs={12} sm={6} md={4}>
//             <Box display="flex" gap={1}>
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={handleCreateReport}
//               >
//                 New Report
//               </Button>
//               <Button
//                 variant="outlined"
//                 startIcon={<RefreshIcon />}
//                 onClick={fetchReports}
//               >
//                 Refresh
//               </Button>
//               <Button
//                 variant="outlined"
//                 startIcon={<ExportIcon />}
//                 onClick={() => {/* Implement export */}}
//               >
//                 Export
//               </Button>
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Reports Table */}
//       <Paper>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Report ID</TableCell>
//                 <TableCell>Patient</TableCell>
//                 <TableCell>Tests</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell>Priority</TableCell>
//                 <TableCell>Created</TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredReports
//                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                 .map((report) => (
//                   <TableRow key={report._id} hover>
//                     <TableCell>
//                       <Box display="flex" alignItems="center">
//                         <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>
//                           <ReportIcon fontSize="small" />
//                         </Avatar>
//                         <Typography variant="body2" fontWeight="bold">
//                           {report.reportId}
//                         </Typography>
//                       </Box>
//                     </TableCell>
                    
//                     <TableCell>
//                       <Box>
//                         <Typography variant="body2" fontWeight="bold">
//                           {report.patient?.name || 'N/A'}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary">
//                           ID: {report.patient?.patientId || 'N/A'}
//                         </Typography>
//                       </Box>
//                     </TableCell>
                    
//                     <TableCell>
//                       <Box>
//                         <Typography variant="body2">
//                           {report.tests?.length || 0} test(s)
//                         </Typography>
//                         {report.tests?.slice(0, 2).map((test, index) => (
//                           <Chip
//                             key={index}
//                             label={test.testName || test.name}
//                             size="small"
//                             variant="outlined"
//                             sx={{ mr: 0.5, mb: 0.5 }}
//                           />
//                         ))}
//                         {report.tests?.length > 2 && (
//                           <Chip
//                             label={`+${report.tests.length - 2} more`}
//                             size="small"
//                             variant="outlined"
//                           />
//                         )}
//                       </Box>
//                     </TableCell>
                    
//                     <TableCell>
//                       <Chip
//                         label={report.status}
//                         color={getStatusColor(report.status)}
//                         size="small"
//                       />
//                     </TableCell>
                    
//                     <TableCell>
//                       <Chip
//                         label={report.priority}
//                         color={getPriorityColor(report.priority)}
//                         size="small"
//                         variant="outlined"
//                       />
//                     </TableCell>
                    
//                     <TableCell>
//                       <Typography variant="body2">
//                         {formatDate(report.createdAt)}
//                       </Typography>
//                     </TableCell>
                    
//                     <TableCell>
//                       <Box display="flex" gap={0.5}>
//                         <Tooltip title="View Report">
//                           <IconButton
//                             size="small"
//                             onClick={() => handleViewReport(report)}
//                           >
//                             <ViewIcon />
//                           </IconButton>
//                         </Tooltip>
                        
//                         <Tooltip title="Edit Report">
//                           <IconButton
//                             size="small"
//                             onClick={() => handleEditReport(report)}
//                           >
//                             <EditIcon />
//                           </IconButton>
//                         </Tooltip>
                        
//                         <Tooltip title="More Actions">
//                           <IconButton
//                             size="small"
//                             onClick={(e) => handleMenuClick(e, report._id)}
//                           >
//                             <MoreIcon />
//                           </IconButton>
//                         </Tooltip>
//                       </Box>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
        
//         <TablePagination
//           rowsPerPageOptions={[5, 10, 25]}
//           component="div"
//           count={filteredReports.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={(event, newPage) => setPage(newPage)}
//           onRowsPerPageChange={(event) => {
//             setRowsPerPage(parseInt(event.target.value, 10));
//             setPage(0);
//           }}
//         />
//       </Paper>

//       {/* Action Menu */}
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleMenuClose}
//       >
//         <MenuItem onClick={() => handleApproveReport(menuReportId)}>
//           <ApproveIcon sx={{ mr: 1 }} />
//           Approve Report
//         </MenuItem>
//         <MenuItem onClick={() => handleGeneratePDF(menuReportId)}>
//           <PrintIcon sx={{ mr: 1 }} />
//           Generate PDF
//         </MenuItem>
//         <MenuItem onClick={() => handleSendEmail(menuReportId)}>
//           <EmailIcon sx={{ mr: 1 }} />
//           Send Email
//         </MenuItem>
//         <Divider />
//         <MenuItem onClick={() => handleDeleteReport(menuReportId)} sx={{ color: 'error.main' }}>
//           <DeleteIcon sx={{ mr: 1 }} />
//           Delete Report
//         </MenuItem>
//       </Menu>

//       {/* Create/Edit Dialog */}
//       <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
//         <DialogTitle>
//           {dialogMode === 'create' ? 'Create New Report' : 'Edit Report'}
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Patient ID"
//                 value={formData.patientId}
//                 onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
//               />
//             </Grid>
            
//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Status</InputLabel>
//                 <Select
//                   value={formData.status}
//                   onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                   label="Status"
//                 >
//                   <MenuItem value="pending">Pending</MenuItem>
//                   <MenuItem value="in-progress">In Progress</MenuItem>
//                   <MenuItem value="completed">Completed</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
            
//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Priority</InputLabel>
//                 <Select
//                   value={formData.priority}
//                   onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
//                   label="Priority"
//                 >
//                   <MenuItem value="low">Low</MenuItem>
//                   <MenuItem value="normal">Normal</MenuItem>
//                   <MenuItem value="high">High</MenuItem>
//                   <MenuItem value="critical">Critical</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
            
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={4}
//                 label="Remarks"
//                 value={formData.remarks}
//                 onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleSubmitForm}>
//             {dialogMode === 'create' ? 'Create' : 'Update'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* View Report Dialog */}
//       <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="lg" fullWidth>
//         <DialogTitle>
//           Report Details - {selectedReport?.reportId}
//         </DialogTitle>
//         <DialogContent>
//           {selectedReport && (
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>Patient Information</Typography>
//                     <Typography><strong>Name:</strong> {selectedReport.patient?.name}</Typography>
//                     <Typography><strong>ID:</strong> {selectedReport.patient?.patientId}</Typography>
//                     <Typography><strong>Age:</strong> {selectedReport.patient?.age}</Typography>
//                     <Typography><strong>Gender:</strong> {selectedReport.patient?.gender}</Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
              
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>Report Information</Typography>
//                     <Typography><strong>Status:</strong> 
//                       <Chip 
//                         label={selectedReport.status} 
//                         color={getStatusColor(selectedReport.status)}
//                         size="small"
//                         sx={{ ml: 1 }}
//                       />
//                     </Typography>
//                     <Typography><strong>Priority:</strong> 
//                       <Chip 
//                         label={selectedReport.priority} 
//                         color={getPriorityColor(selectedReport.priority)}
//                         size="small"
//                         sx={{ ml: 1 }}
//                       />
//                     </Typography>
//                     <Typography><strong>Created:</strong> {formatDate(selectedReport.createdAt)}</Typography>
//                     <Typography><strong>Created By:</strong> {selectedReport.createdBy}</Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>Tests & Results</Typography>
//                     {selectedReport.tests?.map((test, index) => (
//                       <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
//                         <Typography variant="subtitle1" fontWeight="bold">{test.testName || test.name}</Typography>
//                         {test.subtests?.map((subtest, subIndex) => (
//                           <Box key={subIndex} sx={{ ml: 2, mt: 1 }}>
//                             <Typography variant="body2">
//                               <strong>{subtest.name}:</strong> {subtest.finding || 'Pending'}
//                               {subtest.unit && ` ${subtest.unit}`}
//                               {subtest.normalRange && ` (Normal: ${subtest.normalRange})`}
//                             </Typography>
//                           </Box>
//                         ))}
//                       </Box>
//                     ))}
//                   </CardContent>
//                 </Card>
//               </Grid>
              
//               {selectedReport.remarks && (
//                 <Grid item xs={12}>
//                   <Card>
//                     <CardContent>
//                       <Typography variant="h6" gutterBottom>Remarks</Typography>
//                       <Typography>{selectedReport.remarks}</Typography>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               )}
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
//           <Button variant="contained" onClick={() => handleGeneratePDF(selectedReport?._id)}>
//             Download PDF
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//       >
//         <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ReportManagementProfessional;
