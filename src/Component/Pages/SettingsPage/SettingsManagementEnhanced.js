import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Palette as ThemeIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import settingsService from '../../../services/settingsService';

const SettingsManagementEnhanced = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  /** Fetch settings data */
  const fetchOrganizationSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settingsService.getOrganizationSettings();
      if (response?.data) {
        setSettings(prev => ({
          ...prev,
          organization: { ...response.data.labInfo },
        }));
      }
    } catch (error) {
      console.error('Error fetching organization settings:', error);
      showSnackbar('Failed to load organization settings', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizationSettings();
    setSettings({
      organization: {
        name: 'PathologyLab Medical Center',
        address: '123 Medical Street',
        phone: '+91 98765 43210',
        email: 'info@pathologylab.com',
        license: 'LAB-IND-2025',
      },
      billing: {
        taxRate: 18,
        currency: 'INR',
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
      },
      system: {
        backupFrequency: 'daily',
        maintenanceMode: false,
      },
      theme: {
        mode: 'light',
        primaryColor: '#1976d2',
      },
    });
  }, [fetchOrganizationSettings]);

  /** Snackbar handler */
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  /** Save settings by section */
  const handleSave = async section => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate save
      showSnackbar(`${section} settings saved successfully`, 'success');
    } catch {
      showSnackbar('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  /** Update settings locally */
  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  /** Each tab panel */
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  /** Organization Tab */
  const OrganizationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Organization Details
      </Typography>
      <TextField
        fullWidth
        label="Name"
        value={settings.organization?.name || ''}
        onChange={e => updateSetting('organization', 'name', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Address"
        value={settings.organization?.address || ''}
        onChange={e => updateSetting('organization', 'address', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Phone"
        value={settings.organization?.phone || ''}
        onChange={e => updateSetting('organization', 'phone', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Email"
        value={settings.organization?.email || ''}
        onChange={e => updateSetting('organization', 'email', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="License"
        value={settings.organization?.license || ''}
        onChange={e => updateSetting('organization', 'license', e.target.value)}
        sx={{ mb: 3 }}
      />
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => handleSave('Organization')}
      >
        Save
      </Button>
    </Box>
  );

  /** Billing Tab */
  const BillingSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Billing Settings
      </Typography>
      <TextField
        fullWidth
        label="Tax Rate (%)"
        type="number"
        value={settings.billing?.taxRate || ''}
        onChange={e => updateSetting('billing', 'taxRate', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Currency"
        value={settings.billing?.currency || ''}
        onChange={e => updateSetting('billing', 'currency', e.target.value)}
        sx={{ mb: 3 }}
      />
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => handleSave('Billing')}
      >
        Save
      </Button>
    </Box>
  );

  /** Notifications Tab */
  const NotificationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notification Preferences
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={settings.notifications?.emailNotifications || false}
            onChange={e =>
              updateSetting('notifications', 'emailNotifications', e.target.checked)
            }
          />
        }
        label="Email Notifications"
      />
      <FormControlLabel
        control={
          <Switch
            checked={settings.notifications?.smsNotifications || false}
            onChange={e =>
              updateSetting('notifications', 'smsNotifications', e.target.checked)
            }
          />
        }
        label="SMS Notifications"
      />
      <Divider sx={{ my: 2 }} />
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => handleSave('Notifications')}
      >
        Save
      </Button>
    </Box>
  );

  /** Security Tab */
  const SecuritySettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={settings.security?.twoFactorAuth || false}
            onChange={e =>
              updateSetting('security', 'twoFactorAuth', e.target.checked)
            }
          />
        }
        label="Two-Factor Authentication"
      />
      <TextField
        fullWidth
        type="number"
        label="Session Timeout (minutes)"
        value={settings.security?.sessionTimeout || ''}
        onChange={e => updateSetting('security', 'sessionTimeout', e.target.value)}
        sx={{ my: 2 }}
      />
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => handleSave('Security')}
      >
        Save
      </Button>
    </Box>
  );

  /** System Tab */
  const SystemSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Configuration
      </Typography>
      <TextField
        fullWidth
        label="Backup Frequency"
        value={settings.system?.backupFrequency || ''}
        onChange={e =>
          updateSetting('system', 'backupFrequency', e.target.value)
        }
        sx={{ mb: 2 }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={settings.system?.maintenanceMode || false}
            onChange={e =>
              updateSetting('system', 'maintenanceMode', e.target.checked)
            }
          />
        }
        label="Maintenance Mode"
      />
      <Divider sx={{ my: 2 }} />
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => handleSave('System')}
      >
        Save
      </Button>
    </Box>
  );

  /** Theme Tab */
  const ThemeSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Theme Customization
      </Typography>
      <TextField
        fullWidth
        label="Primary Color"
        value={settings.theme?.primaryColor || ''}
        onChange={e => updateSetting('theme', 'primaryColor', e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={settings.theme?.mode === 'dark'}
            onChange={e =>
              updateSetting('theme', 'mode', e.target.checked ? 'dark' : 'light')
            }
          />
        }
        label="Dark Mode"
      />
      <Divider sx={{ my: 2 }} />
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={() => handleSave('Theme')}
      >
        Save
      </Button>
    </Box>
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

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
            <Tab icon={<BusinessIcon />} label="Organization" />
            <Tab icon={<PaymentIcon />} label="Billing" />
            <Tab icon={<NotificationIcon />} label="Notifications" />
            <Tab icon={<SecurityIcon />} label="Security" />
            <Tab icon={<StorageIcon />} label="System" />
            <Tab icon={<ThemeIcon />} label="Theme" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <OrganizationSettings />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <BillingSettings />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <NotificationSettings />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <SecuritySettings />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <SystemSettings />
        </TabPanel>
        <TabPanel value={activeTab} index={5}>
          <ThemeSettings />
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
