import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Tabs, Tab, Snackbar, Alert } from '@mui/material';
import { Business as BusinessIcon, Payment as PaymentIcon, Notifications as NotificationIcon, Security as SecurityIcon, Storage as StorageIcon, Palette as ThemeIcon } from '@mui/icons-material';
import { useTheme } from '../../../context/ThemeContext';
import settingsService from '../../../services/settingsService';

const SettingsManagementEnhanced = () => {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchOrganizationSettings = useCallback(async () => {
    try {
      const response = await settingsService.getOrganizationSettings();
      if (response.data) {
        setSettings(prev => ({
          ...prev,
          organization: {
            ...prev.organization,
            ...response.data.labInfo
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      showSnackbar('Error loading organization settings', 'error');
    }
  }, []);

  useEffect(() => {
    fetchOrganizationSettings();
  }, [fetchOrganizationSettings]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Settings Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure system settings and preferences
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<BusinessIcon />} label="Organization" />
            <Tab icon={<PaymentIcon />} label="Billing" />
            <Tab icon={<NotificationIcon />} label="Notifications" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<StorageIcon />} label="System" />
            <Tab icon={<ThemeIcon />} label="Theme" />
          </Tabs>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsManagementEnhanced;


// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Typography,
//   Button,
//   Grid,
//   Card,
//   CardContent,
//   CardHeader,
//   TextField,
//   Switch,
//   FormControlLabel,
//   Divider,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   ListItemSecondaryAction,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Alert,
//   Chip,
//   Avatar,
//   Tabs,
//   Tab,
//   // Table,
//   // TableBody,
//   // TableCell,
//   // TableContainer,
//   // TableHead,
//   // TableRow,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   // Accordion,
//   // AccordionSummary,
//   // AccordionDetails,
//   Snackbar,
//   // organizationSettings,
//   CircularProgress,
//   // Badge
// } from '@mui/material';
// import {
//   Settings as SettingsIcon,
//   Business as BusinessIcon,
//   Security as SecurityIcon,
//   Notifications as NotificationIcon,
//   // Backup as BackupIcon,
//   Payment as PaymentIcon,
//   // Print as PrintIcon,
//   Email as EmailIcon,
//   Sms as SmsIcon,
//   Save as SaveIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   Add as AddIcon,
//   // ExpandMore as ExpandMoreIcon,
//   Check as CheckIcon,
//   // Warning as WarningIcon,
//   Info as InfoIcon,
//   Storage as StorageIcon,
//   // NetworkCheck as NetworkIcon,
//   Schedule as ScheduleIcon,
//   Group as UsersIcon,
//   Receipt as TaxIcon,
//   // Language as LanguageIcon,
//   Image as ImageIcon,
//   CloudUpload as UploadIcon,
//   Description as DocumentIcon,
//   Star as StarIcon,
//   Palette as ThemeIcon,
//   Analytics as ReportsIcon,
//   ContentCopy as CloneIcon,
//   Preview as PreviewIcon
// } from '@mui/icons-material';
// // import { useAuth } from '../../../context/AuthContext';
// import { useTheme } from '../../../context/ThemeContext';
// import ThemeSelector from '../../common/ThemeSelector/ThemeSelector';
// import themeService from '../../../services/themeService';
// import settingsService from '../../../services/settingsService';

// const SettingsManagementEnhanced = () => {
//   // const { user } = useAuth();
//   const { currentTheme, themes, changeTheme, theme } = useTheme();
//   const [activeTab, setActiveTab] = useState(0);
//   const [settings, setSettings] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   // const [openDialog, setOpenDialog] = useState(false);
//   // const [dialogType, setDialogType] = useState('');
//   // const [organizationSettings, setOrganizationSettings] = useState({});
//   const [imageUploadDialogs, setImageUploadDialogs] = useState({
//     header: false,
//     footer: false,
//     seal: false,
//     signature: false
//   });

//   // Initialize settings with default values
//   useEffect(() => {
//     fetchOrganizationSettings();
//     const defaultSettings = {
//       organization: {
//         name: 'PathologyLab Medical Center',
//         address: '123 Medical Street, Healthcare City',
//         phone: '+1-234-567-8900',
//         email: 'info@pathologylab.com',
//         website: 'www.pathologylab.com',
//         license: 'LAB-2024-001',
//         logo: null,
//         header: null,
//         footer: null,
//         seal: null,
//         signature: null
//       },
//       billing: {
//         taxRate: 18,
//         currency: 'USD',
//         invoicePrefix: 'INV-',
//         enableAutoInvoice: true,
//         paymentMethods: ['Cash', 'Card', 'Bank Transfer', 'Insurance'],
//         defaultPaymentTerms: 30
//       },
//       notifications: {
//         emailNotifications: true,
//         smsNotifications: false,
//         reportReady: true,
//         appointmentReminders: true,
//         paymentDue: true,
//         criticalResults: true,
//         systemAlerts: false
//       },
//       security: {
//         sessionTimeout: 30,
//         passwordExpiry: 90,
//         twoFactorAuth: false,
//         loginAttempts: 5,
//         auditLog: true,
//         dataEncryption: true
//       },
//       system: {
//         backupFrequency: 'daily',
//         retentionPeriod: 365,
//         autoUpdate: false,
//         maintenanceMode: false,
//         apiRateLimit: 1000,
//         maxFileSize: 10
//       },
//       theme: {
//         mode: 'light',
//         primaryColor: '#1976d2',
//         secondaryColor: '#dc004e',
//         fontSize: 'medium',
//         fontFamily: 'Roboto',
//         borderRadius: 8,
//         customLogo: null,
//         compactMode: false,
//         animations: true
//       },
//       reports: {
//         defaultFormat: 'PDF',
//         includeLogos: true,
//         watermark: false,
//         digitalSignature: true,
//         reportTemplate: 'standard',
//         autoArchive: true
//       }
//     };
//     setSettings(defaultSettings);
//   }, []);

//   const fetchOrganizationSettings = async () => {
//     try {
//       setLoading(true);
//       const response = await settingsService.getOrganizationSettings();
//       if (response.data) {
//         setOrganizationSettings(response.data);
//         // Update settings state with fetched data
//         setSettings(prev => ({
//           ...prev,
//           organization: {
//             ...prev.organization,
//             ...response.data.labInfo,
//             header: response.data.labInfo?.header || null,
//             footer: response.data.labInfo?.footer || null,
//             seal: response.data.labInfo?.seal || null,
//             signature: response.data.labInfo?.signature || null
//           }
//         }));
//       }
//     } catch (error) {
//       console.error('❌ Error fetching organization settings:', error);
//       showSnackbar('Error loading organization settings', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({
//       open: true,
//       message,
//       severity
//     });
//   };

//   const handleImageUpload = async (imageType, file) => {
//     try {
//       setLoading(true);
//       console.log(`📡 Uploading ${imageType} image:`, file.name);
      
//       const response = await settingsService.uploadOrganizationImage(imageType, file);
//       console.log('✅ Image uploaded successfully:', response);
      
//       // Update local state with new image URL
//       setSettings(prev => ({
//         ...prev,
//         organization: {
//           ...prev.organization,
//           [imageType]: response.data.imageUrl
//         }
//       }));
      
//       // Close upload dialog
//       setImageUploadDialogs(prev => ({
//         ...prev,
//         [imageType]: false
//       }));
      
//       showSnackbar(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} image uploaded successfully!`);
      
//       // Refresh organization settings
//       await fetchOrganizationSettings();
//     } catch (error) {
//       console.error(`❌ Error uploading ${imageType} image:`, error);
//       showSnackbar(`Error uploading ${imageType} image`, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveOrganizationSettings = async () => {
//     try {
//       setLoading(true);
      
//       const organizationData = {
//         labInfo: {
//           name: settings.organization.name,
//           tagline: settings.organization.tagline || '',
//           address: {
//             street: settings.organization.address || '',
//             city: settings.organization.city || '',
//             state: settings.organization.state || '',
//             zipCode: settings.organization.zipCode || '',
//             country: settings.organization.country || 'India'
//           },
//           contact: {
//             phone: settings.organization.phone,
//             email: settings.organization.email,
//             website: settings.organization.website || '',
//             fax: settings.organization.fax || ''
//           },
//           registration: {
//             licenseNumber: settings.organization.license || '',
//             gstNumber: settings.organization.gstNumber || '',
//             panNumber: settings.organization.panNumber || ''
//           },
//           logo: settings.organization.logo,
//           header: settings.organization.header,
//           footer: settings.organization.footer,
//           seal: settings.organization.seal,
//           signature: settings.organization.signature
//         }
//       };
      
//       await settingsService.updateOrganizationSettings(organizationData);
//       showSnackbar('Organization settings saved successfully!');
//       await fetchOrganizationSettings();
//     } catch (error) {
//       console.error('❌ Error saving organization settings:', error);
//       showSnackbar('Error saving organization settings', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const ImageUploadDialog = ({ open, onClose, imageType, onUpload }) => {
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [preview, setPreview] = useState(null);
    
//     const handleFileSelect = (event) => {
//       const file = event.target.files[0];
//       if (file) {
//         setSelectedFile(file);
//         const reader = new FileReader();
//         reader.onload = (e) => setPreview(e.target.result);
//         reader.readAsDataURL(file);
//       }
//     };
    
//     const handleUpload = () => {
//       if (selectedFile) {
//         onUpload(imageType, selectedFile);
//         setSelectedFile(null);
//         setPreview(null);
//       }
//     };
    
//     return (
//       <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//         <DialogTitle>Upload {imageType.charAt(0).toUpperCase() + imageType.slice(1)} Image</DialogTitle>
//         <DialogContent>
//           <Box sx={{ textAlign: 'center', p: 2 }}>
//             <input
//               accept="image/*"
//               style={{ display: 'none' }}
//               id={`${imageType}-upload`}
//               type="file"
//               onChange={handleFileSelect}
//             />
//             <label htmlFor={`${imageType}-upload`}>
//               <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
//                 Select Image
//               </Button>
//             </label>
            
//             {preview && (
//               <Box sx={{ mt: 2 }}>
//                 <img
//                   src={preview}
//                   alt="Preview"
//                   style={{ maxWidth: '100%', maxHeight: '200px' }}
//                 />
//               </Box>
//             )}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={onClose}>Cancel</Button>
//           <Button 
//             variant="contained" 
//             onClick={handleUpload}
//             disabled={!selectedFile}
//           >
//             Upload
//           </Button>
//         </DialogActions>
//       </Dialog>
//     );
//   };

//   const handleSave = async (section) => {
//     setLoading(true);
//     try {
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       setSnackbar({
//         open: true,
//         message: `${section} settings saved successfully!`,
//         severity: 'success'
//       });
//     } catch (error) {
//       setSnackbar({
//         open: true,
//         message: 'Failed to save settings',
//         severity: 'error'
//       });
//     }
//     setLoading(false);
//   };

//   const updateSetting = (section, key, value) => {
//     setSettings(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [key]: value
//       }
//     }));
//   };

//   const TabPanel = ({ children, value, index, ...other }) => (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`settings-tabpanel-${index}`}
//       aria-labelledby={`settings-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </div>
//   );

//   const OrganizationSettings = () => (
//     <Grid container spacing={3}>
//       <Grid item xs={12}>
//         <Card>
//           <CardHeader
//             avatar={<Avatar><BusinessIcon /></Avatar>}
//             title="Organization Information"
//             subheader="Basic organization details and contact information"
//           />
//           <CardContent>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Organization Name"
//                   value={settings.organization?.name || ''}
//                   onChange={(e) => updateSetting('organization', 'name', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="License Number"
//                   value={settings.organization?.license || ''}
//                   onChange={(e) => updateSetting('organization', 'license', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Address"
//                   multiline
//                   rows={2}
//                   value={settings.organization?.address || ''}
//                   onChange={(e) => updateSetting('organization', 'address', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <TextField
//                   fullWidth
//                   label="Phone"
//                   value={settings.organization?.phone || ''}
//                   onChange={(e) => updateSetting('organization', 'phone', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <TextField
//                   fullWidth
//                   label="Email"
//                   type="email"
//                   value={settings.organization?.email || ''}
//                   onChange={(e) => updateSetting('organization', 'email', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <TextField
//                   fullWidth
//                   label="Website"
//                   value={settings.organization?.website || ''}
//                   onChange={(e) => updateSetting('organization', 'website', e.target.value)}
//                 />
//               </Grid>
//             </Grid>
//             <Box mt={3}>
//               <Button
//                 variant="contained"
//                 startIcon={<SaveIcon />}
//                 onClick={handleSaveOrganizationSettings}
//                 disabled={loading}
//               >
//                 Save Organization Settings
//               </Button>
//             </Box>
//           </CardContent>
//         </Card>
//       </Grid>

//       {/* Image Upload Section */}
//       <Grid item xs={12}>
//         <Card>
//           <CardHeader
//             avatar={<Avatar><ImageIcon /></Avatar>}
//             title="Organization Images"
//             subheader="Upload header, footer, seal and signature images for reports"
//           />
//           <CardContent>
//             <Grid container spacing={3}>
//               {/* Header Image */}
//               <Grid item xs={12} sm={6} md={3}>
//                 <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
//                   <Typography variant="subtitle2" gutterBottom>Header Image</Typography>
//                   {settings.organization?.header ? (
//                     <img
//                       src={settings.organization.header}
//                       alt="Header"
//                       style={{ maxWidth: '100%', maxHeight: '100px', marginBottom: '8px' }}
//                     />
//                   ) : (
//                     <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', mb: 1 }}>
//                       <DocumentIcon />
//                     </Box>
//                   )}
//                   <Button
//                     size="small"
//                     variant="outlined"
//                     startIcon={<UploadIcon />}
//                     onClick={() => setImageUploadDialogs(prev => ({ ...prev, header: true }))}
//                   >
//                     Upload
//                   </Button>
//                 </Box>
//               </Grid>

//               {/* Footer Image */}
//               <Grid item xs={12} sm={6} md={3}>
//                 <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
//                   <Typography variant="subtitle2" gutterBottom>Footer Image</Typography>
//                   {settings.organization?.footer ? (
//                     <img
//                       src={settings.organization.footer}
//                       alt="Footer"
//                       style={{ maxWidth: '100%', maxHeight: '100px', marginBottom: '8px' }}
//                     />
//                   ) : (
//                     <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', mb: 1 }}>
//                       <DocumentIcon />
//                     </Box>
//                   )}
//                   <Button
//                     size="small"
//                     variant="outlined"
//                     startIcon={<UploadIcon />}
//                     onClick={() => setImageUploadDialogs(prev => ({ ...prev, footer: true }))}
//                   >
//                     Upload
//                   </Button>
//                 </Box>
//               </Grid>

//               {/* Seal Image */}
//               <Grid item xs={12} sm={6} md={3}>
//                 <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
//                   <Typography variant="subtitle2" gutterBottom>Seal Image</Typography>
//                   {settings.organization?.seal ? (
//                     <img
//                       src={settings.organization.seal}
//                       alt="Seal"
//                       style={{ maxWidth: '100%', maxHeight: '100px', marginBottom: '8px' }}
//                     />
//                   ) : (
//                     <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', mb: 1 }}>
//                       <StarIcon />
//                     </Box>
//                   )}
//                   <Button
//                     size="small"
//                     variant="outlined"
//                     startIcon={<UploadIcon />}
//                     onClick={() => setImageUploadDialogs(prev => ({ ...prev, seal: true }))}
//                   >
//                     Upload
//                   </Button>
//                 </Box>
//               </Grid>

//               {/* Signature Image */}
//               <Grid item xs={12} sm={6} md={3}>
//                 <Box sx={{ textAlign: 'center', p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
//                   <Typography variant="subtitle2" gutterBottom>Signature Image</Typography>
//                   {settings.organization?.signature ? (
//                     <img
//                       src={settings.organization.signature}
//                       alt="Signature"
//                       style={{ maxWidth: '100%', maxHeight: '100px', marginBottom: '8px' }}
//                     />
//                   ) : (
//                     <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', mb: 1 }}>
//                       <EditIcon />
//                     </Box>
//                   )}
//                   <Button
//                     size="small"
//                     variant="outlined"
//                     startIcon={<UploadIcon />}
//                     onClick={() => setImageUploadDialogs(prev => ({ ...prev, signature: true }))}
//                   >
//                     Upload
//                   </Button>
//                 </Box>
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>
//       </Grid>
//     </Grid>
//   );

//   const BillingSettings = () => (
//     <Grid container spacing={3}>
//       <Grid item xs={12} md={6}>
//         <Card>
//           <CardHeader
//             avatar={<Avatar><PaymentIcon /></Avatar>}
//             title="Billing Configuration"
//             subheader="Invoice and payment settings"
//           />
//           <CardContent>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Tax Rate (%)"
//                   type="number"
//                   value={settings.billing?.taxRate || 0}
//                   onChange={(e) => updateSetting('billing', 'taxRate', parseFloat(e.target.value))}
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth>
//                   <InputLabel>Currency</InputLabel>
//                   <Select
//                     value={settings.billing?.currency || 'USD'}
//                     onChange={(e) => updateSetting('billing', 'currency', e.target.value)}
//                     label="Currency"
//                   >
//                     <MenuItem value="USD">USD ($)</MenuItem>
//                     <MenuItem value="EUR">EUR (€)</MenuItem>
//                     <MenuItem value="GBP">GBP (£)</MenuItem>
//                     <MenuItem value="INR">INR (₹)</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Invoice Prefix"
//                   value={settings.billing?.invoicePrefix || ''}
//                   onChange={(e) => updateSetting('billing', 'invoicePrefix', e.target.value)}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Default Payment Terms (days)"
//                   type="number"
//                   value={settings.billing?.defaultPaymentTerms || 30}
//                   onChange={(e) => updateSetting('billing', 'defaultPaymentTerms', parseInt(e.target.value))}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={
//                     <Switch
//                       checked={settings.billing?.enableAutoInvoice || false}
//                       onChange={(e) => updateSetting('billing', 'enableAutoInvoice', e.target.checked)}
//                     />
//                   }
//                   label="Enable Automatic Invoice Generation"
//                 />
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12} md={6}>
//         <Card>
//           <CardHeader
//             avatar={<Avatar><TaxIcon /></Avatar>}
//             title="Payment Methods"
//             subheader="Configure accepted payment methods"
//           />
//           <CardContent>
//             <List>
//               {['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance', 'Check'].map((method) => (
//                 <ListItem key={method}>
//                   <ListItemText primary={method} />
//                   <ListItemSecondaryAction>
//                     <Switch
//                       checked={settings.billing?.paymentMethods?.includes(method) || false}
//                       onChange={(e) => {
//                         const methods = settings.billing?.paymentMethods || [];
//                         if (e.target.checked) {
//                           updateSetting('billing', 'paymentMethods', [...methods, method]);
//                         } else {
//                           updateSetting('billing', 'paymentMethods', methods.filter(m => m !== method));
//                         }
//                       }}
//                     />
//                   </ListItemSecondaryAction>
//                 </ListItem>
//               ))}
//             </List>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12}>
//         <Button
//           variant="contained"
//           startIcon={<SaveIcon />}
//           onClick={() => handleSave('Billing')}
//           disabled={loading}
//         >
//           Save Billing Settings
//         </Button>
//       </Grid>
//     </Grid>
//   );

//   const NotificationSettings = () => (
//     <Grid container spacing={3}>
//       <Grid item xs={12} md={6}>
//         <Card>
//           <CardHeader
//             avatar={<Avatar><NotificationIcon /></Avatar>}
//             title="Notification Preferences"
//             subheader="Configure notification settings"
//           />
//           <CardContent>
//             <List>
//               <ListItem>
//                 <ListItemIcon><EmailIcon /></ListItemIcon>
//                 <ListItemText 
//                   primary="Email Notifications" 
//                   secondary="Receive notifications via email"
//                 />
//                 <ListItemSecondaryAction>
//                   <Switch
//                     checked={settings.notifications?.emailNotifications || false}
//                     onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
//                   />
//                 </ListItemSecondaryAction>
//               </ListItem>
//               <ListItem>
//                 <ListItemIcon><SmsIcon /></ListItemIcon>
//                 <ListItemText 
//                   primary="SMS Notifications" 
//                   secondary="Receive notifications via SMS"
//                 />
//                 <ListItemSecondaryAction>
//                   <Switch
//                     checked={settings.notifications?.smsNotifications || false}
//                     onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
//                   />
//                 </ListItemSecondaryAction>
//               </ListItem>
//             </List>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12} md={6}>
//         <Card>
//           <CardHeader
//             title="Event Notifications"
//             subheader="Choose which events trigger notifications"
//           />
//           <CardContent>
//             <List>
//               {[
//                 { key: 'reportReady', label: 'Report Ready', desc: 'When test reports are completed' },
//                 { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Patient appointment notifications' },
//                 { key: 'paymentDue', label: 'Payment Due', desc: 'Payment reminder notifications' },
//                 { key: 'criticalResults', label: 'Critical Results', desc: 'Critical test result alerts' },
//                 { key: 'systemAlerts', label: 'System Alerts', desc: 'System maintenance and error alerts' }
//               ].map((item) => (
//                 <ListItem key={item.key}>
//                   <ListItemText 
//                     primary={item.label}
//                     secondary={item.desc}
//                   />
//                   <ListItemSecondaryAction>
//                     <Switch
//                       checked={settings.notifications?.[item.key] || false}
//                       onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
//                     />
//                   </ListItemSecondaryAction>
//                 </ListItem>
//               ))}
//             </List>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12}>
//         <Button
//           variant="contained"
//           startIcon={<SaveIcon />}
//           onClick={() => handleSave('Notifications')}
//           disabled={loading}
//         >
//           Save Notification Settings
//         </Button>
//       </Grid>
//     </Grid>
//   );

//   const SecuritySettings = () => (
//     <Grid container spacing={3}>
//       <Grid item xs={12} md={6}>
//         <Card>
//           <CardHeader
//             avatar={<Avatar><SecurityIcon /></Avatar>}
//             title="Security Configuration"
//             subheader="System security and access control"
//           />
//           <CardContent>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Session Timeout (minutes)"
//                   type="number"
//                   value={settings.security?.sessionTimeout || 30}
//                   onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Password Expiry (days)"
//                   type="number"
//                   value={settings.security?.passwordExpiry || 90}
//                   onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Max Login Attempts"
//                   type="number"
//                   value={settings.security?.loginAttempts || 5}
//                   onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
//                 />
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12} md={6}>
//         <Card>
//           <CardHeader
//             title="Security Features"
//             subheader="Enable additional security measures"
//           />
//           <CardContent>
//             <List>
//               <ListItem>
//                 <ListItemText 
//                   primary="Two-Factor Authentication" 
//                   secondary="Require 2FA for all users"
//                 />
//                 <ListItemSecondaryAction>
//                   <Switch
//                     checked={settings.security?.twoFactorAuth || false}
//                     onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
//                   />
//                 </ListItemSecondaryAction>
//               </ListItem>
//               <ListItem>
//                 <ListItemText 
//                   primary="Audit Logging" 
//                   secondary="Log all user activities"
//                 />
//                 <ListItemSecondaryAction>
//                   <Switch
//                     checked={settings.security?.auditLog || false}
//                     onChange={(e) => updateSetting('security', 'auditLog', e.target.checked)}
//                   />
//                 </ListItemSecondaryAction>
//               </ListItem>
//               <ListItem>
//                 <ListItemText 
//                   primary="Data Encryption" 
//                   secondary="Encrypt sensitive data at rest"
//                 />
//                 <ListItemSecondaryAction>
//                   <Switch
//                     checked={settings.security?.dataEncryption || false}
//                     onChange={(e) => updateSetting('security', 'dataEncryption', e.target.checked)}
//                   />
//                 </ListItemSecondaryAction>
//               </ListItem>
//             </List>
//           </CardContent>
//         </Card>
//       </Grid>

//       <Grid item xs={12}>
//         <Alert severity="warning" sx={{ mb: 2 }}>
//           <Typography variant="body2">
//             Security settings changes will require all users to log in again.
//           </Typography>
//         </Alert>
//         <Button
//           variant="contained"
//           startIcon={<SaveIcon />}
//           onClick={() => handleSave('Security')}
//           disabled={loading}
//         >
//           Save Security Settings
//         </Button>
//       </Grid>
//     </Grid>
//   );

//   const SystemSettings = () => (
//     <Grid container spacing={3}>
//       <Grid item xs={12}>
//         <Card>
//           <CardHeader
//             avatar={<Avatar><StorageIcon /></Avatar>}
//             title="System Configuration"
//             subheader="System behavior and maintenance settings"
//           />
//           <CardContent>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth>
//                   <InputLabel>Backup Frequency</InputLabel>
//                   <Select
//                     value={settings.system?.backupFrequency || 'daily'}
//                     onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
//                     label="Backup Frequency"
//                   >
//                     <MenuItem value="hourly">Hourly</MenuItem>
//                     <MenuItem value="daily">Daily</MenuItem>
//                     <MenuItem value="weekly">Weekly</MenuItem>
//                     <MenuItem value="monthly">Monthly</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Data Retention Period (days)"
//                   type="number"
//                   value={settings.system?.retentionPeriod || 365}
//                   onChange={(e) => updateSetting('system', 'retentionPeriod', parseInt(e.target.value))}
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="API Rate Limit (requests/hour)"
//                   type="number"
//                   value={settings.system?.apiRateLimit || 1000}
//                   onChange={(e) => updateSetting('system', 'apiRateLimit', parseInt(e.target.value))}
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Max File Size (MB)"
//                   type="number"
//                   value={settings.system?.maxFileSize || 10}
//                   onChange={(e) => updateSetting('system', 'maxFileSize', parseInt(e.target.value))}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={
//                     <Switch
//                       checked={settings.system?.autoUpdate || false}
//                       onChange={(e) => updateSetting('system', 'autoUpdate', e.target.checked)}
//                     />
//                   }
//                   label="Enable Automatic Updates"
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={
//                     <Switch
//                       checked={settings.system?.maintenanceMode || false}
//                       onChange={(e) => updateSetting('system', 'maintenanceMode', e.target.checked)}
//                     />
//                   }
//                   label="Maintenance Mode"
//                 />
//               </Grid>
//             </Grid>
//             <Box mt={3}>
//               <Button
//                 variant="contained"
//                 startIcon={<SaveIcon />}
//                 onClick={() => handleSave('System')}
//                 disabled={loading}
//               >
//                 Save System Settings
//               </Button>
//             </Box>
//           </CardContent>
//         </Card>
//       </Grid>
//     </Grid>
//   );

//   const ThemeSettings = () => {
//     const [backendThemes, setBackendThemes] = useState([]);
//     const [loadingThemes, setLoadingThemes] = useState(false);
//     const [customTheme, setCustomTheme] = useState({
//       name: 'Custom Theme',
//       description: 'My custom theme',
//       colors: {
//         primary: '#1976d2',
//         primaryLight: '#42a5f5',
//         primaryDark: '#1565c0',
//         secondary: '#dc004e',
//         secondaryLight: '#ff5983',
//         secondaryDark: '#9a0036',
//         background: '#ffffff',
//         backgroundSecondary: '#f5f5f5',
//         surface: '#ffffff',
//         text: '#212529',
//         textSecondary: '#6c757d',
//         success: '#28a745',
//         warning: '#ffc107',
//         error: '#dc3545',
//         info: '#17a2b8',
//         border: '#dee2e6',
//         borderLight: '#e9ecef',
//         borderDark: '#adb5bd'
//       },
//       typography: {
//         fontFamily: 'Roboto',
//         fontSize: {
//           xs: '0.75rem',
//           sm: '0.875rem',
//           md: '1rem',
//           lg: '1.125rem',
//           xl: '1.25rem',
//           xxl: '1.5rem'
//         }
//       },
//       spacing: {
//         sm: '8px',
//         md: '16px',
//         lg: '24px'
//       },
//       borderRadius: {
//         sm: '4px',
//         md: '8px',
//         lg: '12px',
//         xl: '16px'
//       },
//       shadows: {
//         sm: '0 1px 2px rgba(0,0,0,0.1)',
//         md: '0 4px 6px rgba(0,0,0,0.1)',
//         lg: '0 8px 16px rgba(0,0,0,0.1)'
//       },
//       assets: {
//         logo: null,
//         backgroundImage: null,
//         favicon: null
//       },
//       settings: {
//         animations: true,
//         compactMode: false
//       }
//     });
//     const [showCustomBuilder, setShowCustomBuilder] = useState(false);
//     const [selectedFiles, setSelectedFiles] = useState({});
//     const [editingTheme, setEditingTheme] = useState(null);
//     const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//     const [themeToDelete, setThemeToDelete] = useState(null);

//     // Load themes from backend
//     useEffect(() => {
//       loadBackendThemes();
//     }, []);

//     const loadBackendThemes = async () => {
//       setLoadingThemes(true);
//       try {
//         const response = await themeService.getThemes();
//         if (response.success) {
//           setBackendThemes(response.data.themes);
//         }
//       } catch (error) {
//         setSnackbar({
//           open: true,
//           message: 'Failed to load themes from server',
//           severity: 'error'
//         });
//       }
//       setLoadingThemes(false);
//     };

//     const themeDisplayNames = {
//       light: 'Light',
//       dark: 'Dark',
//       cyberpunk: 'Cyberpunk',
//       darkPink: 'Dark Pink'
//     };

//     const themeDescriptions = {
//       light: 'Clean and bright interface for daytime use',
//       dark: 'Dark interface that\'s easy on the eyes',
//       cyberpunk: 'Futuristic neon theme with cyberpunk aesthetics',
//       darkPink: 'Elegant dark theme with pink accents'
//     };

//     const themeIcons = {
//       light: '☀️',
//       dark: '🌙',
//       cyberpunk: '🤖',
//       darkPink: '💖'
//     };

//     const fontOptions = [
//       'Roboto',
//       'Inter',
//       'Arial',
//       'Helvetica',
//       'Times New Roman',
//       'Georgia',
//       'Courier New',
//       'Segoe UI',
//       'Open Sans',
//       'Lato',
//       'Montserrat',
//       'Poppins'
//     ];

//     const updateCustomTheme = (section, key, value) => {
//       setCustomTheme(prev => ({
//         ...prev,
//         [section]: {
//           ...prev[section],
//           [key]: value
//         }
//       }));
//     };

//     const handleFileChange = (field, file) => {
//       setSelectedFiles(prev => ({
//         ...prev,
//         [field]: file
//       }));
//     };

//     const handleSaveCustomTheme = async () => {
//       setLoading(true);
//       try {
//         const validation = themeService.validateTheme(customTheme);
//         if (!validation.isValid) {
//           setSnackbar({
//             open: true,
//             message: validation.errors.join(', '),
//             severity: 'error'
//           });
//           return;
//         }

//         const response = editingTheme 
//           ? await themeService.updateTheme(editingTheme._id, customTheme, selectedFiles)
//           : await themeService.createTheme(customTheme, selectedFiles);

//         if (response.success) {
//           setSnackbar({
//             open: true,
//             message: `Theme ${editingTheme ? 'updated' : 'created'} successfully!`,
//             severity: 'success'
//           });
//           setShowCustomBuilder(false);
//           setEditingTheme(null);
//           setSelectedFiles({});
//           loadBackendThemes();
//         }
//       } catch (error) {
//         setSnackbar({
//           open: true,
//           message: error.message || 'Failed to save theme',
//           severity: 'error'
//         });
//       }
//       setLoading(false);
//     };

//     const handleApplyTheme = async (theme) => {
//       try {
//         // Apply theme to UI
//         themeService.applyTheme(theme);
        
//         // Save user preference
//         await themeService.saveUserThemePreference(theme._id);
        
//         setSnackbar({
//           open: true,
//           message: 'Theme applied successfully!',
//           severity: 'success'
//         });
//       } catch (error) {
//         setSnackbar({
//           open: true,
//           message: 'Failed to apply theme',
//           severity: 'error'
//         });
//       }
//     };

//     const handleEditTheme = (theme) => {
//       setCustomTheme(theme);
//       setEditingTheme(theme);
//       setShowCustomBuilder(true);
//     };

//     const handleCloneTheme = async (theme) => {
//       try {
//         const response = await themeService.cloneTheme(
//           theme._id, 
//           `${theme.name} (Copy)`,
//           `Cloned from ${theme.name}`
//         );
        
//         if (response.success) {
//           setSnackbar({
//             open: true,
//             message: 'Theme cloned successfully!',
//             severity: 'success'
//           });
//           loadBackendThemes();
//         }
//       } catch (error) {
//         setSnackbar({
//           open: true,
//           message: 'Failed to clone theme',
//           severity: 'error'
//         });
//       }
//     };

//     const handleDeleteTheme = async () => {
//       if (!themeToDelete) return;
      
//       try {
//         const response = await themeService.deleteTheme(themeToDelete._id);
        
//         if (response.success) {
//           setSnackbar({
//             open: true,
//             message: 'Theme deleted successfully!',
//             severity: 'success'
//           });
//           loadBackendThemes();
//         }
//       } catch (error) {
//         setSnackbar({
//           open: true,
//           message: 'Failed to delete theme',
//           severity: 'error'
//         });
//       }
      
//       setDeleteDialogOpen(false);
//       setThemeToDelete(null);
//     };

//     return (
//       <Grid container spacing={3}>
//         {/* Header with Actions */}
//         <Grid item xs={12}>
//           <Card>
//             <CardHeader
//               avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><ThemeIcon /></Avatar>}
//               title="Theme Management"
//               subheader="Manage your application themes with full customization"
//               action={
//                 <Box sx={{ display: 'flex', gap: 2 }}>
//                   <Button
//                     variant="outlined"
//                     startIcon={<AddIcon />}
//                     onClick={() => {
//                       setEditingTheme(null);
//                       setCustomTheme({
//                         name: 'Custom Theme',
//                         description: 'My custom theme',
//                         colors: {
//                           primary: '#1976d2',
//                           primaryLight: '#42a5f5',
//                           primaryDark: '#1565c0',
//                           secondary: '#dc004e',
//                           secondaryLight: '#ff5983',
//                           secondaryDark: '#9a0036',
//                           background: '#ffffff',
//                           backgroundSecondary: '#f5f5f5',
//                           surface: '#ffffff',
//                           text: '#212529',
//                           textSecondary: '#6c757d',
//                           success: '#28a745',
//                           warning: '#ffc107',
//                           error: '#dc3545',
//                           info: '#17a2b8',
//                           border: '#dee2e6',
//                           borderLight: '#e9ecef',
//                           borderDark: '#adb5bd'
//                         },
//                         typography: {
//                           fontFamily: 'Roboto',
//                           fontSize: {
//                             xs: '0.75rem',
//                             sm: '0.875rem',
//                             md: '1rem',
//                             lg: '1.125rem',
//                             xl: '1.25rem',
//                             xxl: '1.5rem'
//                           }
//                         },
//                         spacing: {
//                           sm: '8px',
//                           md: '16px',
//                           lg: '24px'
//                         },
//                         borderRadius: {
//                           sm: '4px',
//                           md: '8px',
//                           lg: '12px',
//                           xl: '16px'
//                         },
//                         shadows: {
//                           sm: '0 1px 2px rgba(0,0,0,0.1)',
//                           md: '0 4px 6px rgba(0,0,0,0.1)',
//                           lg: '0 8px 16px rgba(0,0,0,0.1)'
//                         },
//                         assets: {
//                           logo: null,
//                           backgroundImage: null,
//                           favicon: null
//                         },
//                         settings: {
//                           animations: true,
//                           compactMode: false
//                         }
//                       });
//                       setShowCustomBuilder(!showCustomBuilder);
//                     }}
//                     sx={{ minWidth: 160 }}
//                   >
//                     {showCustomBuilder ? 'Hide Builder' : 'Create Theme'}
//                   </Button>
//                   <Button
//                     variant="text"
//                     startIcon={loadingThemes ? <CircularProgress size={16} /> : <SettingsIcon />}
//                     onClick={loadBackendThemes}
//                     disabled={loadingThemes}
//                   >
//                     Refresh
//                   </Button>
//                 </Box>
//               }
//             />
//             <CardContent>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//                 Current Theme: <Chip 
//                   label={themeDisplayNames[currentTheme] || 'Custom Theme'} 
//                   color="primary" 
//                   size="small" 
//                   icon={<span>{themeIcons[currentTheme] || '🎨'}</span>}
//                 />
//               </Typography>

//               {/* System Themes */}
//               <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
//                 System Themes
//               </Typography>
//               <Grid container spacing={3}>
//                 {themes.map((themeName) => (
//                   <Grid item xs={12} sm={6} md={3} key={themeName}>
//                     <Card 
//                       variant="outlined" 
//                       sx={{ 
//                         cursor: 'pointer',
//                         border: currentTheme === themeName ? 2 : 1,
//                         borderColor: currentTheme === themeName ? 'primary.main' : 'divider',
//                         position: 'relative',
//                         overflow: 'hidden',
//                         transition: 'all 0.3s ease',
//                         '&:hover': {
//                           borderColor: 'primary.light',
//                           boxShadow: 6,
//                           transform: 'translateY(-4px)'
//                         }
//                       }}
//                       onClick={() => changeTheme(themeName)}
//                     >
//                       {currentTheme === themeName && (
//                         <Box
//                           sx={{
//                             position: 'absolute',
//                             top: 8,
//                             right: 8,
//                             zIndex: 1
//                           }}
//                         >
//                           <CheckIcon 
//                             sx={{ 
//                               color: 'primary.main',
//                               backgroundColor: 'background.paper',
//                               borderRadius: '50%',
//                               fontSize: '1.5rem'
//                             }} 
//                           />
//                         </Box>
//                       )}
//                       <CardContent sx={{ textAlign: 'center', py: 3 }}>
//                         <Typography variant="h2" sx={{ fontSize: '3rem', mb: 1 }}>
//                           {themeIcons[themeName]}
//                         </Typography>
//                         <Typography variant="h6" gutterBottom>
//                           {themeDisplayNames[themeName]}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           {themeDescriptions[themeName]}
//                         </Typography>
//                       </CardContent>
//                     </Card>
//                   </Grid>
//                 ))}
//               </Grid>

//               {/* Backend Themes */}
//               {backendThemes.length > 0 && (
//                 <>
//                   <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
//                     Custom Themes ({backendThemes.length})
//                   </Typography>
//                   <Grid container spacing={3}>
//                     {backendThemes.map((theme) => (
//                       <Grid item xs={12} sm={6} md={4} key={theme._id}>
//                         <Card 
//                           variant="outlined" 
//                           sx={{ 
//                             position: 'relative',
//                             overflow: 'hidden',
//                             transition: 'all 0.3s ease',
//                             '&:hover': {
//                               boxShadow: 6,
//                               transform: 'translateY(-2px)'
//                             }
//                           }}
//                         >
//                           <CardHeader
//                             avatar={
//                               <Avatar sx={{ bgcolor: theme.colors?.primary || 'primary.main' }}>
//                                 🎨
//                               </Avatar>
//                             }
//                             title={theme.name}
//                             subheader={theme.description}
//                             action={
//                               <Box sx={{ display: 'flex', gap: 0.5 }}>
//                                 {theme.isDefault && (
//                                   <IconButton size="small" color="warning">
//                                     <StarIcon />
//                                   </IconButton>
//                                 )}
//                                 <IconButton 
//                                   size="small" 
//                                   onClick={() => handleEditTheme(theme)}
//                                   disabled={theme.isSystemTheme}
//                                 >
//                                   <EditIcon />
//                                 </IconButton>
//                                 <IconButton 
//                                   size="small" 
//                                   onClick={() => handleCloneTheme(theme)}
//                                 >
//                                   <CloneIcon />
//                                 </IconButton>
//                                 {!theme.isSystemTheme && (
//                                   <IconButton 
//                                     size="small" 
//                                     onClick={() => {
//                                       setThemeToDelete(theme);
//                                       setDeleteDialogOpen(true);
//                                     }}
//                                     color="error"
//                                   >
//                                     <DeleteIcon />
//                                   </IconButton>
//                                 )}
//                               </Box>
//                             }
//                           />
//                           <CardContent>
//                             {/* Color Preview */}
//                             <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//                               <Box 
//                                 sx={{ 
//                                   width: 24, 
//                                   height: 24, 
//                                   bgcolor: theme.colors?.primary || '#1976d2',
//                                   borderRadius: 1,
//                                   border: 1,
//                                   borderColor: 'divider'
//                                 }} 
//                               />
//                               <Box 
//                                 sx={{ 
//                                   width: 24, 
//                                   height: 24, 
//                                   bgcolor: theme.colors?.secondary || '#dc004e',
//                                   borderRadius: 1,
//                                   border: 1,
//                                   borderColor: 'divider'
//                                 }} 
//                               />
//                               <Box 
//                                 sx={{ 
//                                   width: 24, 
//                                   height: 24, 
//                                   bgcolor: theme.colors?.background || '#ffffff',
//                                   borderRadius: 1,
//                                   border: 1,
//                                   borderColor: 'divider'
//                                 }} 
//                               />
//                             </Box>
                            
//                             <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
//                               <Chip 
//                                 label={theme.typography?.fontFamily || 'Roboto'} 
//                                 size="small" 
//                                 variant="outlined"
//                               />
//                               {theme.isSystemTheme && (
//                                 <Chip 
//                                   label="System" 
//                                   size="small" 
//                                   color="info"
//                                 />
//                               )}
//                             </Box>

//                             <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
//                               <Button
//                                 variant="contained"
//                                 size="small"
//                                 startIcon={<CheckIcon />}
//                                 onClick={() => handleApplyTheme(theme)}
//                                 sx={{ flex: 1 }}
//                               >
//                                 Apply
//                               </Button>
//                               <Button
//                                 variant="outlined"
//                                 size="small"
//                                 startIcon={<PreviewIcon />}
//                                 onClick={async () => {
//                                   try {
//                                     const css = await themeService.getThemePreview(theme._id);
//                                     console.log('Theme CSS:', css);
//                                     setSnackbar({
//                                       open: true,
//                                       message: 'Theme preview in console',
//                                       severity: 'info'
//                                     });
//                                   } catch (error) {
//                                     setSnackbar({
//                                       open: true,
//                                       message: 'Failed to get preview',
//                                       severity: 'error'
//                                     });
//                                   }
//                                 }}
//                               >
//                                 Preview
//                               </Button>
//                             </Box>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </>
//               )}

//               {/* Legacy Theme Selector */}
//               <Box mt={4}>
//                 <Typography variant="subtitle1" gutterBottom>
//                   Quick Theme Switcher
//                 </Typography>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                   <ThemeSelector showLabel={false} />
//                   <Typography variant="body2" color="text.secondary">
//                     Switch between built-in themes
//                   </Typography>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Custom Theme Builder */}
//         {showCustomBuilder && (
//           <Grid item xs={12}>
//             <Card variant="outlined" sx={{ border: '2px dashed', borderColor: 'primary.main' }}>
//               <CardHeader
//                 avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><EditIcon /></Avatar>}
//                 title="Custom Theme Builder"
//                 subheader="Design your own unique theme with custom colors, fonts, and styling"
//               />
//               <CardContent>
//                 <Grid container spacing={4}>
//                   {/* Theme Name and Description */}
//                   <Grid item xs={12}>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={6}>
//                         <TextField
//                           fullWidth
//                           label="Theme Name"
//                           value={customTheme.name}
//                           onChange={(e) => setCustomTheme(prev => ({ ...prev, name: e.target.value }))}
//                         />
//                       </Grid>
//                       <Grid item xs={12} md={6}>
//                         <TextField
//                           fullWidth
//                           label="Description"
//                           value={customTheme.description}
//                           onChange={(e) => setCustomTheme(prev => ({ ...prev, description: e.target.value }))}
//                         />
//                       </Grid>
//                     </Grid>
//                   </Grid>

//                   {/* Colors Section */}
//                   <Grid item xs={12} md={6}>
//                     <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Avatar sx={{ width: 24, height: 24, bgcolor: 'info.main' }}>🎨</Avatar>
//                       Color Palette
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={6}>
//                         <TextField
//                           fullWidth
//                           label="Primary Color"
//                           type="color"
//                           value={customTheme.colors.primary}
//                           onChange={(e) => updateCustomTheme('colors', 'primary', e.target.value)}
//                         />
//                       </Grid>
//                       <Grid item xs={6}>
//                         <TextField
//                           fullWidth
//                           label="Secondary Color"
//                           type="color"
//                           value={customTheme.colors.secondary}
//                           onChange={(e) => updateCustomTheme('colors', 'secondary', e.target.value)}
//                         />
//                       </Grid>
//                       <Grid item xs={6}>
//                         <TextField
//                           fullWidth
//                           label="Background Color"
//                           type="color"
//                           value={customTheme.colors.background}
//                           onChange={(e) => updateCustomTheme('colors', 'background', e.target.value)}
//                         />
//                       </Grid>
//                       <Grid item xs={6}>
//                         <TextField
//                           fullWidth
//                           label="Surface Color"
//                           type="color"
//                           value={customTheme.colors.surface}
//                           onChange={(e) => updateCustomTheme('colors', 'surface', e.target.value)}
//                         />
//                       </Grid>
//                     </Grid>
//                   </Grid>

//                   {/* Typography and Assets */}
//                   <Grid item xs={12} md={6}>
//                     <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Avatar sx={{ width: 24, height: 24, bgcolor: 'warning.main' }}>📝</Avatar>
//                       Typography & Assets
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12}>
//                         <FormControl fullWidth>
//                           <InputLabel>Font Family</InputLabel>
//                           <Select
//                             value={customTheme.typography.fontFamily}
//                             onChange={(e) => updateCustomTheme('typography', 'fontFamily', e.target.value)}
//                             label="Font Family"
//                           >
//                             {fontOptions.map((font) => (
//                               <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
//                                 {font}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                       </Grid>
//                       <Grid item xs={12}>
//                         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                           <Typography variant="subtitle2">Upload Assets</Typography>
//                           <Button
//                             variant="outlined"
//                             component="label"
//                             startIcon={<UploadIcon />}
//                             fullWidth
//                           >
//                             Upload Logo
//                             <input
//                               type="file"
//                               accept="image/*"
//                               hidden
//                               onChange={(e) => handleFileChange('logo', e.target.files[0])}
//                             />
//                           </Button>
//                           <Button
//                             variant="outlined"
//                             component="label"
//                             startIcon={<UploadIcon />}
//                             fullWidth
//                           >
//                             Upload Background
//                             <input
//                               type="file"
//                               accept="image/*"
//                               hidden
//                               onChange={(e) => handleFileChange('backgroundImage', e.target.files[0])}
//                             />
//                           </Button>
//                         </Box>
//                       </Grid>
//                     </Grid>
//                   </Grid>

//                   {/* Actions */}
//                   <Grid item xs={12}>
//                     <Divider sx={{ my: 2 }} />
//                     <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
//                       <Button
//                         variant="contained"
//                         startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
//                         onClick={handleSaveCustomTheme}
//                         disabled={loading}
//                       >
//                         {editingTheme ? 'Update Theme' : 'Save Theme'}
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         startIcon={<PreviewIcon />}
//                         onClick={() => themeService.applyTheme(customTheme)}
//                       >
//                         Preview
//                       </Button>
//                       <Button
//                         variant="text"
//                         onClick={() => setShowCustomBuilder(false)}
//                       >
//                         Cancel
//                       </Button>
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>
//         )}

//         {/* Delete Confirmation Dialog */}
//         <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
//           <DialogTitle>Delete Theme</DialogTitle>
//           <DialogContent>
//             <Typography>
//               Are you sure you want to delete the theme "{themeToDelete?.name}"? This action cannot be undone.
//             </Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
//             <Button onClick={handleDeleteTheme} color="error" variant="contained">
//               Delete
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Theme Preview */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardHeader
//               avatar={<Avatar sx={{ bgcolor: 'info.main' }}><InfoIcon /></Avatar>}
//               title="Theme Preview"
//               subheader="Live preview of current theme"
//             />
//             <CardContent>
//               <Box
//                 sx={{
//                   p: 3,
//                   border: 2,
//                   borderColor: 'primary.main',
//                   borderRadius: theme?.borderRadius?.md || 2,
//                   backgroundColor: 'background.paper',
//                   mb: 3,
//                   background: `linear-gradient(135deg, ${theme?.colors?.primary}22 0%, ${theme?.colors?.secondary}22 100%)`
//                 }}
//               >
//                 <Typography variant="h4" color="primary" gutterBottom>
//                   🏥 PathologyLab
//                 </Typography>
//                 <Typography variant="h6" gutterBottom>
//                   Sample Dashboard Header
//                 </Typography>
//                 <Typography variant="body1" gutterBottom>
//                   This preview shows how your selected theme affects the interface appearance.
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" gutterBottom>
//                   Secondary text and descriptions will appear in this style.
//                 </Typography>
//                 <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                   <Button variant="contained" size="small">Primary Action</Button>
//                   <Button variant="outlined" size="small">Secondary Action</Button>
//                   <Button variant="text" size="small">Text Button</Button>
//                 </Box>
//               </Box>

//               <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Avatar sx={{ width: 20, height: 20, bgcolor: 'secondary.main' }}>🎯</Avatar>
//                 Current Theme Details
//               </Typography>
//               <List dense>
//                 {[
//                   { label: 'Primary Color', color: theme?.colors?.primary },
//                   { label: 'Secondary Color', color: theme?.colors?.secondary },
//                   { label: 'Background', color: theme?.colors?.background },
//                   { label: 'Surface', color: theme?.colors?.surface }
//                 ].map((item, index) => (
//                   <ListItem key={index} sx={{ py: 0.5 }}>
//                     <ListItemText 
//                       primary={item.label}
//                       secondary={item.color}
//                     />
//                     <Box 
//                       sx={{ 
//                         width: 24, 
//                         height: 24, 
//                         backgroundColor: item.color,
//                         border: 1,
//                         borderColor: 'divider',
//                         borderRadius: 1,
//                         ml: 2
//                       }} 
//                     />
//                   </ListItem>
//                 ))}
//               </List>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Theme Statistics */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardHeader
//               avatar={<Avatar sx={{ bgcolor: 'success.main' }}><ReportsIcon /></Avatar>}
//               title="Theme Statistics"
//               subheader="Usage and performance metrics"
//             />
//             <CardContent>
//               <List>
//                 <ListItem>
//                   <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
//                   <ListItemText 
//                     primary="Theme Status" 
//                     secondary="Active and optimized"
//                   />
//                 </ListItem>
//                 <ListItem>
//                   <ListItemIcon><ScheduleIcon color="info" /></ListItemIcon>
//                   <ListItemText 
//                     primary="Last Changed" 
//                     secondary="Today at 2:30 PM"
//                   />
//                 </ListItem>
//                 <ListItem>
//                   <ListItemIcon><UsersIcon color="primary" /></ListItemIcon>
//                   <ListItemText 
//                     primary="User Preference" 
//                     secondary={`Currently using ${themeDisplayNames[currentTheme]} theme`}
//                   />
//                 </ListItem>
//                 <ListItem>
//                   <ListItemIcon><StorageIcon color="warning" /></ListItemIcon>
//                   <ListItemText 
//                     primary="Performance Impact" 
//                     secondary="Minimal - optimized for speed"
//                   />
//                 </ListItem>
//               </List>

//               <Box mt={2}>
//                 <Alert severity="info" sx={{ mt: 2 }}>
//                   <Typography variant="body2">
//                     💡 <strong>Pro Tip:</strong> Custom themes will be saved to your profile and synced across all your devices.
//                   </Typography>
//                 </Alert>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Save Theme Settings */}
//         <Grid item xs={12}>
//           <Card variant="outlined">
//             <CardContent>
//               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
//                 <Box>
//                   <Typography variant="h6" gutterBottom>
//                     Theme Preferences
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Your theme selection is automatically saved and will be applied across all sessions.
//                   </Typography>
//                 </Box>
//                 <Button
//                   variant="contained"
//                   size="large"
//                   startIcon={<SaveIcon />}
//                   onClick={() => handleSave('Theme')}
//                   disabled={loading}
//                   sx={{ minWidth: 200 }}
//                 >
//                   Save All Settings
//                 </Button>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     );
//   };

//   return (
//     <Box p={3}>
//       {/* Header */}
//       <Box mb={3}>
//         <Typography variant="h4" gutterBottom>
//           Settings Management
//         </Typography>
//         <Typography variant="body1" color="text.secondary">
//           Configure system settings and preferences
//         </Typography>
//       </Box>

//       {/* Settings Tabs */}
//       <Paper sx={{ width: '100%' }}>
//         <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//           <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
//             <Tab icon={<BusinessIcon />} label="Organization" />
//             <Tab icon={<PaymentIcon />} label="Billing" />
//             <Tab icon={<NotificationIcon />} label="Notifications" />
//             <Tab icon={<SecurityIcon />} label="Security" />
//             <Tab icon={<StorageIcon />} label="System" />
//             <Tab icon={<ThemeIcon />} label="Theme" />
//           </Tabs>
//         </Box>

//         <TabPanel value={activeTab} index={0}>
//           <OrganizationSettings />
//         </TabPanel>
//         <TabPanel value={activeTab} index={1}>
//           <BillingSettings />
//         </TabPanel>
//         <TabPanel value={activeTab} index={2}>
//           <NotificationSettings />
//         </TabPanel>
//         <TabPanel value={activeTab} index={3}>
//           <SecuritySettings />
//         </TabPanel>
//         <TabPanel value={activeTab} index={4}>
//           <SystemSettings />
//         </TabPanel>
//         <TabPanel value={activeTab} index={5}>
//           <ThemeSettings />
//         </TabPanel>
//       </Paper>

//       {/* Image Upload Dialogs */}
//       {Object.entries(imageUploadDialogs).map(([imageType, open]) => (
//         <ImageUploadDialog
//           key={imageType}
//           open={open}
//           imageType={imageType}
//           onClose={() => setImageUploadDialogs(prev => ({ ...prev, [imageType]: false }))}
//           onUpload={handleImageUpload}
//         />
//       ))}

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//       >
//         <Alert 
//           onClose={() => setSnackbar({ ...snackbar, open: false })} 
//           severity={snackbar.severity}
//           sx={{ width: '100%' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default SettingsManagementEnhanced;
