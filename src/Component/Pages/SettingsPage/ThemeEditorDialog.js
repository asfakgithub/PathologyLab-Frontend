import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import themeService from '../../../services/themeService';

const defaultTheme = {
  name: 'Cyberpunk',
  description: 'A dark theme with neon accents, inspired by cyberpunk aesthetics.',
  colors: {
    primary: '#00ffff',
    primaryLight: '#80ffff',
    primaryDark: '#00cccc',
    secondary: '#ff00ff',
    secondaryLight: '#ff80ff',
    secondaryDark: '#cc00cc',
    background: '#0a0a0a',
    backgroundSecondary: '#1a1a1a',
    backgroundTertiary: '#2a2a2a',
    surface: '#1c1c1c',
    surfaceSecondary: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#999999',
    border: '#ff00ff',
    borderLight: '#ff80ff',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#00ffff',
    accent: '#ffff00'
  },
  typography: {
    fontFamily: 'Courier New'
  }
};

const fontFamilies = ['Roboto', 'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 'Segoe UI', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];

const ThemeEditorDialog = ({ open, onClose, theme, onSuccess }) => {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (open) {
        if (theme) {
          // Deep merge existing theme with defaults to ensure all fields are present
          setFormData({
              ...defaultTheme,
              ...theme,
              colors: {
                  ...defaultTheme.colors,
                  ...(theme.colors || {})
              },
              typography: {
                  ...defaultTheme.typography,
                  ...(theme.typography || {})
              }
          });
        } else {
          setFormData(defaultTheme);
        }
    }
  }, [theme, open]);

  const handleColorChange = (colorName, value) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorName]: value
      }
    }));
  };
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleTypographyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      if (formData._id) {
        await themeService.updateTheme(formData._id, formData);
      } else {
        await themeService.createTheme(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save theme:', error);
      // You might want to show an error to the user
      alert('Failed to save theme. Check console for details.');
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{formData._id ? 'Edit Theme' : 'Create New Theme'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Theme Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                    value={formData.typography.fontFamily}
                    onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                    label="Font Family"
                >
                    {fontFamilies.map(font => <MenuItem key={font} value={font}>{font}</MenuItem>)}
                </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Colors</Typography>
          </Grid>
          {Object.keys(formData.colors).map((colorName) => (
            <Grid item xs={12} sm={6} md={4} key={colorName}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <TextField label={colorName} value={formData.colors[colorName]} onChange={(e) => handleColorChange(colorName, e.target.value)} variant="standard" />
                    <input type="color" value={formData.colors[colorName]} onChange={(e) => handleColorChange(colorName, e.target.value)} style={{height: '40px', width: '40px', border: 'none', background: 'none', borderRadius: '4px', cursor: 'pointer'}}/>
                </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemeEditorDialog;