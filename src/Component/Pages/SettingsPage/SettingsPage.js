import React, { useState, useEffect, useContext } from 'react';
import { SettingsContext } from '../../../context/SettingsContext';
import themeService from '../../../services/themeService';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
  FormControl
} from '@mui/material';

const SettingsPage = () => {
  const { settings: contextSettings, loading: contextLoading, updateSettings } = useContext(SettingsContext);
  
  const [localSettings, setLocalSettings] = useState(contextSettings);
  const [themes, setThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setLocalSettings(contextSettings);
  }, [contextSettings]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const themesData = await themeService.getThemes();
        if (themesData?.data?.themes) {
          setThemes(themesData.data.themes);
        }
      } catch (error) {
        console.error('Error fetching themes:', error);
      } finally {
        setThemesLoading(false);
      }
    };
    fetchThemes();
  }, []);

  const handleInputChange = (category, field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };
  
  const handleChannelChange = (channel, value) => {
    setLocalSettings(prev => ({
        ...prev,
        notifications: {
            ...prev.notifications,
            channels: {
                ...prev.notifications.channels,
                [channel]: value
            }
        }
    }));
  };

  const handleDashboardChange = (widgetKey, isVisible) => {
    const updatedDashboard = (localSettings.dashboard || []).map(widget =>
      widget.widgetKey === widgetKey ? { ...widget, isVisible } : widget
    );
    setLocalSettings(prev => ({ ...prev, dashboard: updatedDashboard }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save settings.', severity: 'error' });
      console.error('Error saving settings:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isLoading = contextLoading || themesLoading;
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const settings = localSettings;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Application Settings
      </Typography>
      <Grid container spacing={3}>
        {/* Organization Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Organization Details" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Organization Name" value={(settings.organization || {}).name || ''} onChange={(e) => handleInputChange('organization', 'name', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address" value={(settings.organization || {}).address || ''} onChange={(e) => handleInputChange('organization', 'address', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="License" value={(settings.organization || {}).license || ''} onChange={(e) => handleInputChange('organization', 'license', e.target.value)} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Theme" />
            <CardContent>
              <FormControl fullWidth>
                <Select value={(settings.theme || {}).themeName || 'default'} onChange={(e) => handleInputChange('theme', 'themeName', e.target.value)}>
                  {themes.map((theme) => (
                    <MenuItem key={theme._id} value={theme.name}>
                      {theme.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Invoice Settings */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Invoice & Billing" />
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth type="number" label="Default GST (%)" value={(settings.invoice || {}).defaultGST || 0} onChange={(e) => handleInputChange('invoice', 'defaultGST', parseFloat(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth type="number" label="Default Discount (%)" value={(settings.invoice || {}).discountPercent || 0} onChange={(e) => handleInputChange('invoice', 'discountPercent', parseFloat(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth type="number" label="Additional Charges" value={(settings.invoice || {}).additionalCharges || 0} onChange={(e) => handleInputChange('invoice', 'additionalCharges', parseFloat(e.target.value))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel control={<Switch checked={(settings.invoice || {}).allowEdit} onChange={(e) => handleInputChange('invoice', 'allowEdit', e.target.checked)} />} label="Allow Editing Invoices" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel control={<Switch checked={(settings.invoice || {}).allowDelete} onChange={(e) => handleInputChange('invoice', 'allowDelete', e.target.checked)} />} label="Allow Deleting Invoices" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel control={<Switch checked={(settings.invoice || {}).billingEnabled} onChange={(e) => handleInputChange('invoice', 'billingEnabled', e.target.checked)} />} label="Billing Enabled" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Dashboard Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Dashboard Widgets" />
            <CardContent>
              {(settings.dashboard || []).map((widget) => (
                <FormControlLabel key={widget.widgetKey} control={<Switch checked={widget.isVisible} onChange={(e) => handleDashboardChange(widget.widgetKey, e.target.checked)} />} label={widget.widgetKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Notifications" />
            <CardContent>
              <FormControlLabel control={<Switch checked={(settings.notifications || {}).notificationsEnabled} onChange={(e) => handleInputChange('notifications', 'notificationsEnabled', e.target.checked)} />} label="Enable All Notifications" />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Channels</Typography>
                <FormControlLabel control={<Switch checked={((settings.notifications || {}).channels || {}).email} onChange={(e) => handleChannelChange('email', e.target.checked)} />} label="Email Notifications" />
                <FormControlLabel control={<Switch checked={((settings.notifications || {}).channels || {}).sms} onChange={(e) => handleChannelChange('sms', e.target.checked)} />} label="SMS Notifications" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={handleSave} size="large">
          Save All Settings
        </Button>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;