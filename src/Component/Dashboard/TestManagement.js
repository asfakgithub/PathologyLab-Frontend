import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Snackbar,
  Alert,
  Grid,
  FormControlLabel,
  Chip,
  InputAdornment,
  Tooltip,
  Switch,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Delete,
  Edit,
  Add,
  Search,
  Science
} from '@mui/icons-material';

import { getTests, deleteTest, getTestStats } from '../../services/api';
import TestTable from './TestTable';
import LoadingSpinner from '../common/LoadingSpinner';
import TestEditor from './TestEditor';
import TestTube1 from '../Images/TestTube1.svg';

function TestManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [isTableView, setIsTableView] = useState(!isMobile);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [testStats, setTestStats] = useState(null);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTests();
      const data = res?.data?.data || res?.data || res || [];
      setTests(Array.isArray(data) ? data : []);
    } catch {
      showSnackbar('Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTestStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await getTestStats();
      setTestStats(res?.data?.data || res?.data || null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
    fetchTestStats();
  }, [fetchTests, fetchTestStats]);

  const filteredTests = tests.filter(test =>
    test.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <Box p={{ xs: 2, md: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          Test Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          fullWidth={isMobile}
        >
          Add New Test
        </Button>
      </Stack>

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        {statsLoading ? (
          <Typography variant="body2">Loading analysis…</Typography>
        ) : testStats ? (
          <>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="caption">Total Tests</Typography>
                  <Typography variant="h5">{testStats.totalTests}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="caption">Average Price</Typography>
                  <Typography variant="h5">₹{Math.round(testStats.averagePrice || 0)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="caption">Categories</Typography>
                  <Typography variant="h5">
                    {(testStats.categoryDistribution || []).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : null}
      </Grid>

      {/* Search + View Toggle */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        mb={3}
      >
        <TextField
          fullWidth
          placeholder="Search tests…"
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

        {!isMobile && (
          <FormControlLabel
            control={
              <Switch
                checked={isTableView}
                onChange={(e) => setIsTableView(e.target.checked)}
              />
            }
            label="Table View"
          />
        )}
      </Stack>

      {/* CONTENT */}
      {isTableView && !isMobile ? (
        <TestTable
          tests={filteredTests}
          handleOpenDialog={(t) => {
            setEditingTest(t);
            setOpenDialog(true);
          }}
          handleDelete={async (id, name) => {
            if (window.confirm(`Delete "${name}"?`)) {
              await deleteTest(id);
              fetchTests();
            }
          }}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredTests.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Science sx={{ fontSize: '3rem', opacity: 0.4 }} />
                <Typography>No tests found</Typography>
              </Card>
            </Grid>
          ) : (
            filteredTests.map(test => (
              <Grid item xs={12} sm={6} md={4} key={test._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography fontWeight={600}>{test.name}</Typography>
                      <Chip label={test.code} size="small" />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Category: {test.category}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Sample: {test.sampleType}
                    </Typography>

                    <Tooltip title={test.description || ''}>
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {test.description}
                      </Typography>
                    </Tooltip>

                    <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography color="primary" fontWeight={700}>
                        ₹{test.price}
                      </Typography>
                      <Box
                        component="img"
                        src={TestTube1}
                        alt="test"
                        sx={{ width: '3rem', opacity: 0.8 }}
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button size="small" startIcon={<Edit />} onClick={() => {
                      setEditingTest(test);
                      setOpenDialog(true);
                    }}>
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => deleteTest(test._id).then(fetchTests)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Dialog */}
      <TestEditor
        open={openDialog}
        editingTest={editingTest}
        onClose={() => {
          setOpenDialog(false);
          setEditingTest(null);
        }}
        onSaved={() => {
          fetchTests();
          fetchTestStats();
          showSnackbar('Saved successfully');
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TestManagement;
