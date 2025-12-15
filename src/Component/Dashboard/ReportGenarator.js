import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Grid,
  Stack,
  Box,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SettingsContext } from '../../context/SettingsContext';
import patientService from '../../services/patientService';
import useSystemNotification from '../../core/hooks/useSystemNotification';
import useAutoSuggestionOnTestAndParam from '../../core/hooks/AutoSuggestionOnTestAndParam';

const ReportGenarator = (props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useContext(SettingsContext);
  const { sendSystemNotification } = useSystemNotification();
  useAutoSuggestionOnTestAndParam();

  const isMobile = useMediaQuery('(max-width:600px)');
  const containerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [enrichedTests, setEnrichedTests] = useState([]);
  const [resultsMap, setResultsMap] = useState({});

  const patientId =
    props?.patientId ||
    new URLSearchParams(window.location.search).get('id') ||
    window.location.pathname.split('/').pop();

  /* ================= FETCH ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const res = await patientService.getPatientById(patientId);
        const data = res?.data || res;

        setPatient(data);
        setEnrichedTests(data?.tests || []);

        const map = {};
        (data?.results || []).forEach(r => {
          map[`${r.testId}_${r.subtestId || 'custom'}`] = r;
        });
        setResultsMap(map);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  /* ================= HANDLERS ================= */

  const handlePatientChange = (k, v) =>
    setPatient(p => ({ ...p, [k]: v }));

  const handleResultChange = (testId, subId, field, value) => {
    const key = `${testId}_${subId || 'custom'}`;
    setResultsMap(p => ({
      ...p,
      [key]: { ...(p[key] || {}), testId, subtestId: subId, [field]: value }
    }));
  };

  /* ================= SAVE ================= */

  const saveAll = async () => {
    try {
      setLoading(true);
      await patientService.updatePatient(patientId, patient);

      const calls = [];
      enrichedTests.forEach(t => {
        const rows = [];
        (t.selectedSubtests || []).forEach(s => {
          const key = `${t.testId}_${s.subtestId || s.tempId}`;
          const r = resultsMap[key];
          if (r?.value) {
            rows.push({
              subtestId: s.subtestId,
              parameterName: s.subtestName,
              value: r.value,
              unit: r.unit,
              normalRange: r.normalRange,
              flag: r.flag
            });
          }
        });

        if (rows.length) {
          calls.push(
            patientService.addTestResults(patientId, {
              testId: t.testId,
              results: rows,
              reportedBy: user?._id
            })
          );
        }
      });

      await Promise.all(calls);
      await sendSystemNotification({
        message: `Patient ${patient.name} report saved`
      });

      alert('Saved successfully');
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  if (loading) return <Box p={2}>Loading...</Box>;
  if (error) return <Box p={2}>Error: {error}</Box>;

  return (
    <Paper
      ref={containerRef}
      elevation={3}
      sx={{
        maxWidth: { xs: '100%', md: '210mm' },
        mx: 'auto',
        p: { xs: 1.5, sm: 2, md: 3 },
        fontSize: { xs: '11px', md: '12px' }
      }}
    >
      {/* ================= ACTION BAR ================= */}
      <Box className="no-print" mb={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography fontWeight={700}>Lab Report Generator</Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={saveAll}
              fullWidth={isMobile}
            >
              Save
            </Button>
            <Button
              startIcon={<PreviewIcon />}
              variant="outlined"
              fullWidth={isMobile}
              onClick={() =>
                window.open(`/patient-report/${patientId}`, '_blank')
              }
            >
              Preview
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ================= HEADER ================= */}
      <Box
        textAlign="center"
        sx={{
          background:
            'linear-gradient(90deg,#0f172a,#4c1d95,#7c3aed)',
          color: '#fff',
          p: 2,
          borderRadius: 2,
          mb: 2
        }}
      >
        <Typography variant="h5" fontWeight={800}>
          {settings?.organization?.name || 'Diagnostic Lab'}
        </Typography>
        <Typography fontSize={12}>
          {settings?.organization?.address}
        </Typography>
      </Box>

      {/* ================= PATIENT DETAILS ================= */}
      <Box mb={2}>
        <Grid container spacing={1}>
          {['name', 'mobileNo', 'gender', 'age'].map(k => (
            <Grid item xs={12} sm={6} key={k}>
              <TextField
                fullWidth
                size="small"
                label={k.toUpperCase()}
                value={patient?.[k] || ''}
                onChange={e =>
                  handlePatientChange(k, e.target.value)
                }
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ================= TESTS ================= */}
      {enrichedTests.map((t, ti) => (
        <Box key={ti} mb={3}>
          <Typography
            fontWeight={700}
            sx={{ background: '#eee', p: 1 }}
          >
            {t.testName}
          </Typography>

          {/* ===== TABLE (SCROLLABLE) ===== */}
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    'Test',
                    'Result',
                    'Unit',
                    'Normal Range',
                    'Remarks'
                  ].map(h => (
                    <th
                      key={h}
                      style={{
                        border: '1px solid #ddd',
                        padding: 8
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(t.selectedSubtests || []).map((s, si) => {
                  const key = `${t.testId}_${s.subtestId || s.tempId}`;
                  const r = resultsMap[key] || {};
                  return (
                    <tr key={si}>
                      <td style={cell}>
                        {s.subtestName}
                      </td>
                      <td style={cell}>
                        <TextField
                          size="small"
                          value={r.value || ''}
                          onChange={e =>
                            handleResultChange(
                              t.testId,
                              s.subtestId,
                              'value',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td style={cell}>
                        <TextField
                          size="small"
                          value={r.unit || ''}
                          onChange={e =>
                            handleResultChange(
                              t.testId,
                              s.subtestId,
                              'unit',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td style={cell}>
                        <TextField
                          size="small"
                          value={r.normalRange || ''}
                          onChange={e =>
                            handleResultChange(
                              t.testId,
                              s.subtestId,
                              'normalRange',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td style={cell}>
                        <TextField
                          size="small"
                          value={r.notes || ''}
                          onChange={e =>
                            handleResultChange(
                              t.testId,
                              s.subtestId,
                              'notes',
                              e.target.value
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Box>
      ))}

      {/* ================= FOOTER ================= */}
      <Box textAlign="center" mt={3}>
        <Typography fontWeight={700}>
          ******** End of Report ********
        </Typography>
        <Typography fontSize={11}>
          Computer generated report
        </Typography>
      </Box>
    </Paper>
  );
};

const cell = {
  border: '1px solid #ddd',
  padding: 6,
  fontSize: 11
};

export default ReportGenarator;
