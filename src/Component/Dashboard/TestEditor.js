import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Button,
  IconButton,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { createTest, updateTest } from '../../services/api';

const emptyRef = () => ({ male: { min: '', max: '' }, female: { min: '', max: '' }, child: { min: '', max: '' }, infant: { min: '', max: '' } });

const defaultForm = {
  name: '',
  code: '',
  category: '',
  description: '',
  duration: '',
  sampleType: '',
  sampleVolume: '',
  price: '',
  fastingRequired: false,
  instructions: '',
  referenceRange: emptyRef(),
  parameters: []
};

const defaultParameter = {
  name: '',
  unit: '',
  method: '',
  fastingRequired: false,
  instructions: '',
  referenceRange: emptyRef(),
  price: ''
};

const TestEditor = ({ open, onClose, editingTest, onSaved, testCategories = [], sampleTypes = [] }) => {
  const [form, setForm] = useState(defaultForm);
  const [parameterForm, setParameterForm] = useState(defaultParameter);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTest) {
      setForm({
        name: editingTest.name || '',
        code: editingTest.code || '',
        category: editingTest.category || '',
        description: editingTest.description || '',
        duration: editingTest.duration || '',
        sampleType: editingTest.sampleType || '',
        sampleVolume: editingTest.sampleVolume || '',
        price: editingTest.price || '',
        fastingRequired: editingTest.fastingRequired || false,
        instructions: editingTest.instructions || '',
        referenceRange: editingTest.referenceRange || emptyRef(),
        parameters: (editingTest.parameters || []).map(p => ({ ...p, referenceRange: p.referenceRange || emptyRef() }))
      });
    } else {
      setForm(defaultForm);
      setParameterForm(defaultParameter);
      setError(null);
    }
  }, [editingTest, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRefRangeChange = (gender, bound, value) => {
    setForm(prev => ({
      ...prev,
      referenceRange: {
        ...prev.referenceRange,
        [gender]: { ...prev.referenceRange[gender], [bound]: value }
      }
    }));
  };

  const handleParameterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParameterForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleParameterRefRangeChange = (field, gender, bound, value) => {
    setParameterForm(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [gender]: { ...prev[field][gender], [bound]: value }
      }
    }));
  };

  const addParameter = () => {
    if (!parameterForm.name.trim()) {
      setError('Parameter name is required');
      return;
    }
    const newParam = { ...parameterForm, _id: Date.now().toString(), referenceRange: parameterForm.referenceRange || emptyRef() };
    setForm(prev => ({ ...prev, parameters: [...prev.parameters, newParam] }));
    setParameterForm(defaultParameter);
    setError(null);
  };

  const removeParameter = (index) => {
    setForm(prev => ({ ...prev, parameters: prev.parameters.filter((_, i) => i !== index) }));
  };

  const handleExistingParameterChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.parameters];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, parameters: updated };
    });
  };

  const handleExistingParameterRefRangeChange = (index, gender, bound, value) => {
    setForm(prev => {
      const updated = [...prev.parameters];
      const existing = updated[index] || {};
      updated[index] = {
        ...existing,
        referenceRange: {
          ...existing.referenceRange,
          [gender]: { ...((existing.referenceRange && existing.referenceRange[gender]) || {}), [bound]: value }
        }
      };
      return { ...prev, parameters: updated };
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) return setError('Test name is required') || false;
    if (!form.code.trim()) return setError('Test code is required') || false;
    if (!form.category) return setError('Category is required') || false;
    if (!form.description.trim()) return setError('Description is required') || false;
    if (!form.price || Number(form.price) <= 0) return setError('Valid price is required') || false;
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        duration: form.duration ? parseInt(form.duration) : undefined,
        price: parseFloat(form.price),
        parameters: form.parameters.map(p => {
          const param = { ...p, price: p.price ? parseFloat(p.price) : 0 };
          if (!editingTest || (typeof p._id === 'string' && p._id.length < 24)) {
            const { _id, ...rest } = param; return rest;
          }
          return param;
        })
      };

      if (editingTest) {
        await updateTest(editingTest._id, payload);
      } else {
        await createTest(payload);
      }

      if (typeof onSaved === 'function') onSaved();
      onClose();
    } catch (err) {
      console.error('TestEditor save error', err);
      setError(err.response?.data?.message || err.message || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>Basic Information</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Test Name *" name="name" value={form.name} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Test Code *" name="code" value={form.code} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Category *</InputLabel>
              <Select name="category" value={form.category} label="Category *" onChange={handleChange}>
                {testCategories.map(c => <MenuItem key={c} value={c.toLowerCase()}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Price *" name="price" type="number" value={form.price} onChange={handleChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
          </Grid>
          <Grid item xs={12}><TextField fullWidth label="Description *" name="description" multiline rows={2} value={form.description} onChange={handleChange} /></Grid>
        </Grid>

        <Typography variant="h6" sx={{ mb: 2 }}>Sample & Duration Information</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Sample Type</InputLabel>
              <Select name="sampleType" value={form.sampleType} label="Sample Type" onChange={handleChange}>
                {sampleTypes.map(t => <MenuItem key={t} value={t.toLowerCase()}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Sample Volume" name="sampleVolume" value={form.sampleVolume} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Duration (hours)" name="duration" type="number" value={form.duration} onChange={handleChange} /></Grid>
        </Grid>

        <Typography variant="h6" sx={{ mb: 2 }}>Instructions & Requirements</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}><TextField fullWidth label="Instructions" name="instructions" multiline rows={2} value={form.instructions} onChange={handleChange} /></Grid>
          <Grid item xs={12}><FormControlLabel control={<Checkbox name="fastingRequired" checked={form.fastingRequired} onChange={handleChange} />} label="Fasting Required" /></Grid>
        </Grid>

        <Typography variant="h6" sx={{ mb: 2 }}>Reference Range (Test Level)</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {['male','female','child','infant'].map(g => (
            <Grid item xs={12} sm={6} key={g}>
              <Grid container spacing={1}>
                <Grid item xs={6}><TextField fullWidth label={`${g.charAt(0).toUpperCase()+g.slice(1)} Min`} value={form.referenceRange[g].min} onChange={(e) => handleRefRangeChange(g, 'min', e.target.value)} /></Grid>
                <Grid item xs={6}><TextField fullWidth label={`${g.charAt(0).toUpperCase()+g.slice(1)} Max`} value={form.referenceRange[g].max} onChange={(e) => handleRefRangeChange(g, 'max', e.target.value)} /></Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" sx={{ mb: 2 }}>Test Parameters / Subtests ({form.parameters.length} added)</Typography>

        {form.parameters.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {form.parameters.map((param, index) => (
              <Grid item xs={12} key={param._id || index}>
                <Card sx={{ p: 1 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Parameter Name *" value={param.name} onChange={(e) => handleExistingParameterChange(index, 'name', e.target.value)} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Unit" value={param.unit} onChange={(e) => handleExistingParameterChange(index, 'unit', e.target.value)} /></Grid>
                      {['male','female','child','infant'].map(g => (
                        <Grid item xs={12} sm={6} key={g}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}><TextField fullWidth label={`${g.charAt(0).toUpperCase()+g.slice(1)} Min`} value={param.referenceRange?.[g]?.min || ''} onChange={(e) => handleExistingParameterRefRangeChange(index, g, 'min', e.target.value)} /></Grid>
                            <Grid item xs={6}><TextField fullWidth label={`${g.charAt(0).toUpperCase()+g.slice(1)} Max`} value={param.referenceRange?.[g]?.max || ''} onChange={(e) => handleExistingParameterRefRangeChange(index, g, 'max', e.target.value)} /></Grid>
                          </Grid>
                        </Grid>
                      ))}
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Method" value={param.method} onChange={(e) => handleExistingParameterChange(index, 'method', e.target.value)} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Price" type="number" value={param.price} onChange={(e) => handleExistingParameterChange(index, 'price', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
                      <Grid item xs={12} sm={6}><FormControlLabel control={<Checkbox checked={param.fastingRequired || false} onChange={(e) => handleExistingParameterChange(index, 'fastingRequired', e.target.checked)} />} label="Fasting Required" /></Grid>
                      <Grid item xs={12}><TextField fullWidth label="Instructions" multiline rows={2} value={param.instructions} onChange={(e) => handleExistingParameterChange(index, 'instructions', e.target.value)} /></Grid>
                      
                    </Grid>
                    <IconButton color="error" onClick={() => removeParameter(index)} sx={{ mt: 1 }}><DeleteIcon /></IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Card sx={{ bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Add New Parameter</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Parameter Name *" name="name" value={parameterForm.name} onChange={handleParameterChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Unit" name="unit" value={parameterForm.unit} onChange={handleParameterChange} /></Grid>
              {['male','female','child','infant'].map(g => (
                <Grid item xs={12} sm={6} key={g}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}><TextField fullWidth label={`${g.charAt(0).toUpperCase()+g.slice(1)} Min`} value={parameterForm.referenceRange?.[g]?.min || ''} onChange={(e) => handleParameterRefRangeChange('referenceRange', g, 'min', e.target.value)} /></Grid>
                    <Grid item xs={6}><TextField fullWidth label={`${g.charAt(0).toUpperCase()+g.slice(1)} Max`} value={parameterForm.referenceRange?.[g]?.max || ''} onChange={(e) => handleParameterRefRangeChange('referenceRange', g, 'max', e.target.value)} /></Grid>
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={12} sm={6}><TextField fullWidth label="Method" name="method" value={parameterForm.method} onChange={handleParameterChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Price" name="price" type="number" value={parameterForm.price} onChange={handleParameterChange} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
              <Grid item xs={12} sm={6}><FormControlLabel control={<Checkbox name="fastingRequired" checked={parameterForm.fastingRequired} onChange={handleParameterChange} />} label="Fasting Required" /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Instructions" name="instructions" multiline rows={2} value={parameterForm.instructions} onChange={handleParameterChange} /></Grid>
              
              <Grid item xs={12}><Button variant="outlined" startIcon={<AddIcon />} onClick={addParameter}>Add Parameter</Button></Grid>
            </Grid>
          </CardContent>
        </Card>

      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>{loading ? 'Saving...' : (editingTest ? 'Update Test' : 'Create Test')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestEditor;
