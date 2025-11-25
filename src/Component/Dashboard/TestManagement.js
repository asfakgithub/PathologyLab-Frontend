import React, { useEffect, useState, useCallback } from 'react';
import { getTests, deleteTest, createTest, updateTest } from '../../services/api';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Grid,
  Checkbox,
  FormControlLabel,
  Divider,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import LoadingSpinner from '../common/LoadingSpinner';
import TestTube1 from '../Images/TestTube1.svg';
function TestManagement() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  

  // Form state
  const [form, setForm] = useState({
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
    normalRange: { adult: '', child: '' },
    parameters: []
  });

  // Parameter form state
  const [parameterForm, setParameterForm] = useState({
    name: '',
    unit: '',
    referenceRange: '',
    method: '',
    fastingRequired: false,
    instructions: '',
    normalRange: { adult: '', child: '' },
    price: ''
  });

  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Common test categories
  const testCategories = [
    'Hematology',
    'Biochemistry', 
    'Microbiology',
    'Immunology',
    'Pathology',
    'Cardiology',
    'Endocrinology',
    'Nephrology',
    'Hepatology',
    'Other'
  ];

  // Sample types
  const sampleTypes = [
    'Blood',
    'Urine',
    'Stool',
    'Saliva',
    'Tissue',
    'Sputum',
    'CSF',
    'Other'
  ];

  // Fetch all tests
  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTests();
      
      if (response && response.data) {
        // Handle different response structures
        const testsData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setTests(testsData);
      } else {
        setTests([]);
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
      showSnackbar('Failed to load tests', 'error');
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Reset form
  const resetForm = () => {
    setForm({
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
      normalRange: { adult: '', child: '' },
      parameters: []
    });
    setParameterForm({
      name: '',
      unit: '',
      referenceRange: '',
      method: '',
      fastingRequired: false,
      instructions: '',
      normalRange: { adult: '', child: '' },
      price: ''
    });
    setError(null);
  };

  // Handle dialog open/close
  const handleOpenDialog = (test = null) => {
    if (test) {
      setEditingTest(test);
      setForm({
        name: test.name || '',
        code: test.code || '',
        category: test.category || '',
        description: test.description || '',
        duration: test.duration || '',
        sampleType: test.sampleType || '',
        sampleVolume: test.sampleVolume || '',
        price: test.price || '',
        fastingRequired: test.fastingRequired || false,
        instructions: test.instructions || '',
        normalRange: test.normalRange || { adult: '', child: '' },
        parameters: test.parameters || []
      });
    } else {
      setEditingTest(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTest(null);
    resetForm();
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRangeChange = (field, subfield, value) => {
    setForm(prevForm => ({ ...prevForm, [field]: { ...prevForm[field], [subfield]: value } }));
  };

  const handleParameterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParameterForm({ ...parameterForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleParameterRangeChange = (field, subfield, value) => {
    setParameterForm({ ...parameterForm, [field]: { ...parameterForm[field], [subfield]: value } });
  };

  const handleExistingParameterChange = (index, field, value) => {
    setForm(prevForm => {
      const updatedParameters = [...prevForm.parameters];
      updatedParameters[index] = { ...updatedParameters[index], [field]: value };
      return { ...prevForm, parameters: updatedParameters };
    });
  };

  const handleExistingParameterRangeChange = (index, subfield, value) => {
    const updatedParameters = [...form.parameters];
    updatedParameters[index].normalRange = { ...updatedParameters[index].normalRange, [subfield]: value };
    setForm({ ...form, parameters: updatedParameters });
  };
  // Add parameter to test
  const addParameter = () => {
    if (!parameterForm.name.trim()) {
      setError('Parameter name is required');
      return;
    }
    
    const newParameter = {
      ...parameterForm,
      _id: Date.now().toString() // Temporary ID for frontend
    };
    
    console.log('Adding parameter:', newParameter);
    console.log('Current form parameters before adding:', form.parameters);
    
    setForm(prevForm => {
      const updatedForm = { ...prevForm, parameters: [...prevForm.parameters, newParameter] };
      console.log('Updated form parameters after adding:', updatedForm.parameters);
      return updatedForm;
    });
    
    setParameterForm({
      name: '',
      unit: '',
      referenceRange: '',
      method: '',
      fastingRequired: false,
      instructions: '',
      normalRange: { adult: '', child: '' },
      price: ''
    });
    setError(null);
  };

  // Remove parameter
  const removeParameter = (index) => {
    setForm(prevForm => ({ 
      ...prevForm, 
      parameters: prevForm.parameters.filter((_, i) => i !== index) 
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!form.name.trim()) {
      setError('Test name is required');
      return false;
    }
    if (!form.code.trim()) {
      setError('Test code is required');
      return false;
    }
    if (!form.category.trim()) {
      setError('Category is required');
      return false;
    }
    if (!form.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!form.price || form.price <= 0) {
      setError('Valid price is required');
      return false;
    }
    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setFormLoading(true);
      setError(null);

      console.log('Form state before creating testData:', {
        parametersCount: form.parameters.length,
        parameters: form.parameters
      });

      const testData = {
        ...form,
        duration: form.duration ? parseInt(form.duration) : undefined,
        price: parseFloat(form.price),
        parameters: form.parameters.map(param => {
          // For new tests, remove temporary _id; for existing tests, keep ObjectId _id
          const paramData = { ...param, price: param.price ? parseFloat(param.price) : 0 };
          
          // If creating a new test or if _id is a temporary string ID, remove it
          if (!editingTest || (typeof param._id === 'string' && param._id.length < 24)) {
            const { _id, ...paramWithoutId } = paramData;
            return paramWithoutId;
          }
          
          return paramData;
        })
      };

      console.log('Test data being sent to API:', JSON.stringify(testData, null, 2));

      if (editingTest) {
        await updateTest(editingTest._id, testData);
        showSnackbar('Test updated successfully!', 'success');
      } else {
        await createTest(testData);
        showSnackbar('Test created successfully!', 'success');
      }

      // Refresh the tests list
      await fetchTests();
      handleCloseDialog();

    } catch (err) {
      console.error('Error saving test:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save test';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (testId, testName) => {
    if (window.confirm(`Are you sure you want to delete "${testName}"?`)) {
      try {
        await deleteTest(testId);
        showSnackbar('Test deleted successfully!', 'success');
        fetchTests();
      } catch (err) {
        console.error('Error deleting test:', err);
        showSnackbar('Failed to delete test', 'error');
      }
    }
  };

  // Filter tests based on search
  const filteredTests = tests.filter(test =>
    test.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Test Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Add New Test
        </Button>
      </Box>

      {/* Search */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search tests by name, code, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {/* Tests List */}
      {/* Compact grid: horizontal flow (row-first) — smaller tiles */}
      <Grid container spacing={3}>
        {filteredTests.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <ScienceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No tests found matching your search' : 'No tests available'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first test to get started'}
              </Typography>
            </Card>
          </Grid>
        ) : (
          filteredTests.map((test) => (
            <Grid item xs={12} sm={6} md={4} key={test._id} sx={{ display: 'flex' }}>
              <Card sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', p: 2 }}>
                    <Box sx={{ flex: '1 1 75%', pr: 2, display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" fontWeight="bold">
                                {test.name}
                            </Typography>
                            <Chip
                                label={test.code}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Category:</strong> {test.category}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Sample:</strong> {test.sampleType} {test.sampleVolume && `(${test.sampleVolume})`}
                        </Typography>

                        {test.duration && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                <strong>Duration:</strong> {test.duration} hours
                            </Typography>
                        )}

                        <Tooltip title={test.description} arrow>
                            <Typography
                                variant="body2"
                                sx={{
                                mb: 2,
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                cursor: 'pointer',
                                flexGrow: 1
                                }}
                            >
                                {test.description.slice(0, 100) + (test.description.length > 40 ? '...' : '')}
                            </Typography>
                        </Tooltip>

                        {test.parameters && test.parameters.length > 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                <strong>Parameters:</strong> {test.parameters.length} test(s)
                            </Typography>
                        )}

                        {test.fastingRequired && (
                            <Chip
                                label="Fasting Required"
                                size="small"
                                color="warning"
                                sx={{ mt: 'auto' }}
                            />
                        )}
                    </Box>
                    <Box sx={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
                        <Box
                            component="img"
                            src={TestTube1}
                            alt="test-tube"
                            sx={{ width: '100%', maxWidth: 120, height: 'auto', objectFit: 'contain', mb: 1 }}
                        />
                        <Box textAlign="center">
                          <Typography variant="h6" color="primary" fontWeight="bold">
                              ₹{test.price}
                          </Typography>
                        </Box>
                    </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(test)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(test._id, test.name)}
                    >
                        Delete
                    </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Test Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Basic Test Information */}
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
            Basic Information
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Test Name *"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Complete Blood Count (CBC)"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Test Code *"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g., CBC"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  name="category"
                  value={form.category}
                  label="Category *"
                  onChange={handleChange}
                >
                  {testCategories.map((category) => (
                    <MenuItem key={category} value={category.toLowerCase()}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price *"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                name="description"
                multiline
                rows={2}
                value={form.description}
                onChange={handleChange}
                placeholder="e.g., Comprehensive blood analysis including RBC, WBC, platelets"
              />
            </Grid>
          </Grid>

          {/* Sample and Duration Information */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Sample & Duration Information
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Sample Type</InputLabel>
                <Select
                  name="sampleType"
                  value={form.sampleType}
                  label="Sample Type"
                  onChange={handleChange}
                >
                  {sampleTypes.map((type) => (
                    <MenuItem key={type} value={type.toLowerCase()}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Sample Volume"
                name="sampleVolume"
                value={form.sampleVolume}
                onChange={handleChange}
                placeholder="e.g., 5ml"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Duration (hours)"
                name="duration"
                type="number"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g., 24"
              />
            </Grid>
          </Grid>

          {/* Instructions and Requirements */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Instructions & Requirements
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                name="instructions"
                multiline
                rows={2}
                value={form.instructions}
                onChange={handleChange}
                placeholder="e.g., No special preparation required"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="fastingRequired"
                    checked={form.fastingRequired}
                    onChange={handleChange}
                  />
                }
                label="Fasting Required"
              />
            </Grid>
          </Grid>

          {/* Normal Range for Test */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Normal Range (Test Level)
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Adult Normal Range"
                value={form.normalRange.adult}
                onChange={(e) => handleRangeChange('normalRange', 'adult', e.target.value)}
                placeholder="e.g., 1000mn>Normal<2000mn"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Child Normal Range"
                value={form.normalRange.child}
                onChange={(e) => handleRangeChange('normalRange', 'child', e.target.value)}
                placeholder="e.g., 2000mn>Normal<3000mn"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Parameters Section */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Test Parameters / Subtests ({form.parameters.length} added)
          </Typography>

          {/* Existing Parameters */}
          {form.parameters.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {form.parameters.map((param, index) => (
                <Card key={param._id || index} sx={{ mb: 2, bgcolor: 'grey.50', p: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Editing Parameter: {param.name}
                      </Typography>
                      <IconButton 
                        color="error" 
                        onClick={() => removeParameter(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Parameter Name *" name="name" value={param.name} onChange={(e) => handleExistingParameterChange(index, 'name', e.target.value)} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Unit" name="unit" value={param.unit} onChange={(e) => handleExistingParameterChange(index, 'unit', e.target.value)} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Reference Range" name="referenceRange" value={param.referenceRange} onChange={(e) => handleExistingParameterChange(index, 'referenceRange', e.target.value)} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Method" name="method" value={param.method} onChange={(e) => handleExistingParameterChange(index, 'method', e.target.value)} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Price"
                          name="price"
                          type="number"
                          value={param.price}
                          onChange={(e) => handleExistingParameterChange(index, 'price', e.target.value)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="fastingRequired"
                              checked={param.fastingRequired || false}
                              onChange={(e) => handleExistingParameterChange(index, 'fastingRequired', e.target.checked)}
                            />
                          }
                          label="Fasting Required"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Instructions"
                          name="instructions"
                          multiline
                          rows={2}
                          value={param.instructions}
                          onChange={(e) => handleExistingParameterChange(index, 'instructions', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Adult Normal Range"
                          value={param.normalRange?.adult || ''}
                          onChange={(e) => handleExistingParameterRangeChange(index, 'adult', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Child Normal Range"
                          value={param.normalRange?.child || ''}
                          onChange={(e) => handleExistingParameterRangeChange(index, 'child', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Add New Parameter Form */}
          <Card sx={{ bgcolor: 'primary.50', border: '1px dashed', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Add New Parameter
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parameter Name *"
                    name="name"
                    value={parameterForm.name}
                    onChange={handleParameterChange}
                    placeholder="e.g., Hemoglobin"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Unit"
                    name="unit"
                    value={parameterForm.unit}
                    onChange={handleParameterChange}
                    placeholder="e.g., g/dL"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Reference Range"
                    name="referenceRange"
                    value={parameterForm.referenceRange}
                    onChange={handleParameterChange}
                    placeholder="e.g., 12.0-16.0"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Method"
                    name="method"
                    value={parameterForm.method}
                    onChange={handleParameterChange}
                    placeholder="e.g., automated analyzer"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={parameterForm.price}
                    onChange={handleParameterChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="fastingRequired"
                        checked={parameterForm.fastingRequired}
                        onChange={handleParameterChange}
                      />
                    }
                    label="Fasting Required"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Instructions"
                    name="instructions"
                    multiline
                    rows={2}
                    value={parameterForm.instructions}
                    onChange={handleParameterChange}
                    placeholder="e.g., No special preparation required"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Adult Normal Range"
                    value={parameterForm.normalRange.adult}
                    onChange={(e) => handleParameterRangeChange('normalRange', 'adult', e.target.value)}
                    placeholder="e.g., 1000mn>Normal<2000mn"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Child Normal Range"
                    value={parameterForm.normalRange.child}
                    onChange={(e) => handleParameterRangeChange('normalRange', 'child', e.target.value)}
                    placeholder="e.g., 2000mn>Normal<3000mn"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    onClick={addParameter}
                    startIcon={<AddIcon />}
                  >
                    Add Parameter
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} disabled={formLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={formLoading}
          >
            {formLoading ? 'Saving...' : (editingTest ? 'Update Test' : 'Create Test')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>


  );
}

export default TestManagement;
