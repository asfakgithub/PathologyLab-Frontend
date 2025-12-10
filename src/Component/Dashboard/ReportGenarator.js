import React, { useEffect, useState, useContext, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { useNavigate } from 'react-router-dom';
import useSystemNotification from '../../core/hooks/useSystemNotification';
import { SettingsContext } from '../../context/SettingsContext';
import useAutoSuggestionOnTestAndParam from '../../core/hooks/AutoSuggestionOnTestAndParam';
import { createTest, addTestSubtest } from '../../services/api';
import { IconButton, Paper, TextField, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Add as AddIcon, Visibility as PreviewIcon } from '@mui/icons-material';

const ReportGenarator = (props) => {
  const { sendSystemNotification } = useSystemNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [enrichedTests, setEnrichedTests] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();
  // Determine patientId: from props.patientId or query param ?id= or last path segment
  const getPatientIdFromLocation = () => {
    if (props && props.patientId) return props.patientId;
    try {
      const params = new URLSearchParams(window.location.search);
      const qid = params.get('id');
      if (qid) return qid;
      const parts = window.location.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1];
    } catch (e) {
      return null;
    }
  };

  const patientId = getPatientIdFromLocation();
  const { user } = useAuth();
  const { fetchTestSuggestions, fetchParamSuggestions } = useAutoSuggestionOnTestAndParam();

  // Edit mode is always on for report generator
  const [editMode] = useState(true);
  const containerRef = useRef(null);

 
  const [testSuggestions, setTestSuggestions] = useState([]);
  const [showTestSuggestions, setShowTestSuggestions] = useState(false);

  // Maps suggestion lists by key `${testId || ''}_${subtestIdOrTemp || 'custom'}`
  const [subtestSuggestionsMap, setSubtestSuggestionsMap] = useState({});
  const [showSubtestMap, setShowSubtestMap] = useState({});
  const [showFlagMenuMap, setShowFlagMenuMap] = useState({});

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setError('Patient id not provided in URL or props');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('ViewPatient: fetching patient for id=', patientId);
        const res = await patientService.getPatientById(patientId);
        console.log('ViewPatient: patientService.getPatientById response=', res);

        // Extract data from response - API returns { success, message, data: { patient, tests, results } }
        const payload = res && res.data ? res.data : res;
        const fetchedPatient = payload || null;
        
        // Get tests from patient.tests array
        const fetchedTests = (fetchedPatient && fetchedPatient.tests) ? fetchedPatient.tests : [];
        
        // Get results from patient.results array
        const fetchedResults = (fetchedPatient && fetchedPatient.results) ? fetchedPatient.results : [];

        setPatient(fetchedPatient);
        setEnrichedTests(fetchedTests);

        // Map results by key for easy lookup: testId_subtestId or testId_tempId
        const map = {};
        (fetchedResults || []).forEach(r => {
          const keyBySub = `${r.testId || ''}_${r.subtestId || 'custom'}`;
          // Store the most recent result for this key
          map[keyBySub] = r;
        });
        setResultsMap(map);
      } catch (err) {
        console.error('ViewPatient fetch error', err);
        setError(err.message || err.toString() || 'Failed to load patient');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const handlePatientChange = (field, value) => {
    setPatient(p => ({ ...p, [field]: value }));
  };

  const handleResultChange = (testId, subtestId, field, value) => {
    const key = `${testId || ''}_${subtestId || 'custom'}`;
    setResultsMap(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        testId,
        subtestId,
        [field]: value
      }
    }));
  };

  const handleSetFlag = (key, flag) => {
    setResultsMap(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        flag
      }
    }));
    // close the flag menu for this key
    setShowFlagMenuMap(prev => ({ ...prev, [key]: false }));
  };

  const addCustomSubtest = (testIndex) => {
    const testsCopy = [...enrichedTests];
    const patientCopy = { ...(patient || {}) };
    const newTempId = `temp_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const newSub = {
      subtestId: null,
      tempId: newTempId,
      subtestName: '',
      status: 'pending',
      parameter: { name: '', unit: '', normalRange: '' },
      custom: true
    };

    if (!testsCopy[testIndex].selectedSubtests) testsCopy[testIndex].selectedSubtests = [];
    testsCopy[testIndex].selectedSubtests.push(newSub);

    if (!patientCopy.tests) patientCopy.tests = [];
    if (!patientCopy.tests[testIndex]) {
      patientCopy.tests[testIndex] = {
        testId: testsCopy[testIndex].testId || null,
        testName: testsCopy[testIndex].testName || 'Custom Test',
        selectedSubtests: []
      };
    }
    if (!patientCopy.tests[testIndex].selectedSubtests) patientCopy.tests[testIndex].selectedSubtests = [];
    patientCopy.tests[testIndex].selectedSubtests.push({
      subtestId: null,
      tempId: newTempId,
      subtestName: '',
      status: 'pending'
    });

    setEnrichedTests(testsCopy);
    setPatient(patientCopy);
  };

  const deleteCustomSubtest = (testIndex, subIndex) => {
    const testsCopy = [...enrichedTests];
    if (!testsCopy[testIndex] || !testsCopy[testIndex].selectedSubtests) return;
    const ss = testsCopy[testIndex].selectedSubtests[subIndex];
    const key = `${testsCopy[testIndex].testId || ''}_${ss.subtestId || ss.tempId || 'custom'}`;
    testsCopy[testIndex].selectedSubtests.splice(subIndex, 1);
    const patientCopy = { ...(patient || {}) };
    if (patientCopy.tests && patientCopy.tests[testIndex] && patientCopy.tests[testIndex].selectedSubtests) {
      patientCopy.tests[testIndex].selectedSubtests.splice(subIndex, 1);
    }
    setResultsMap(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setEnrichedTests(testsCopy);
    setPatient(patientCopy);
  };

  const addCustomTest = () => {
    const testsCopy = [...enrichedTests];
    const patientCopy = { ...(patient || {}) };
    const newTest = {
      testId: null,
      testName: 'Custom Test',
      category: 'Custom',
      parameters: [],
      selectedSubtests: []
    };

    testsCopy.push(newTest);

    if (!patientCopy.tests) patientCopy.tests = [];
    patientCopy.tests.push({
      testId: null,
      testName: 'Custom Test',
      selectedSubtests: []
    });

    setEnrichedTests(testsCopy);
    setPatient(patientCopy);
  };

  const handleSubtestNameChange = (testIndex, subIndex, value) => {
    const testsCopy = [...enrichedTests];
    if (!testsCopy[testIndex] || !testsCopy[testIndex].selectedSubtests) return;
    testsCopy[testIndex].selectedSubtests[subIndex].subtestName = value;

    const patientCopy = { ...(patient || {}) };
    if (patientCopy.tests && patientCopy.tests[testIndex] && patientCopy.tests[testIndex].selectedSubtests) {
      if (!patientCopy.tests[testIndex].selectedSubtests[subIndex]) {
        patientCopy.tests[testIndex].selectedSubtests[subIndex] = {};
      }
      patientCopy.tests[testIndex].selectedSubtests[subIndex].subtestName = value;
    }

    setEnrichedTests(testsCopy);
    setPatient(patientCopy);
  };

  const handleTestFieldChange = (testIndex, field, value) => {
    const testsCopy = [...enrichedTests];
    if (!testsCopy[testIndex]) return;
    testsCopy[testIndex][field] = value;

    const patientCopy = { ...(patient || {}) };
    if (!patientCopy.tests) patientCopy.tests = [];
    if (!patientCopy.tests[testIndex]) {
      patientCopy.tests[testIndex] = {
        testId: testsCopy[testIndex].testId || null,
        testName: testsCopy[testIndex].testName || '',
        selectedSubtests: testsCopy[testIndex].selectedSubtests || [],
        status: testsCopy[testIndex].status || 'pending',
        notes: testsCopy[testIndex].notes || ''
      };
    }

    patientCopy.tests[testIndex][field] = value;

    setEnrichedTests(testsCopy);
    setPatient(patientCopy);
  };

  const applyTestSuggestion = (testObj, index) => {
    const testsCopy = [...enrichedTests];
    const patientCopy = { ...(patient || {}) };
    const parameters = testObj.parameters || [];

    // Do not auto-select all parameters. Present parameters and let user choose via checkboxes.
    testsCopy[index] = {
      ...testsCopy[index],
      testId: testObj._id || testObj.id,
      testName: testObj.name,
      category: testObj.category || testsCopy[index]?.category || '',
      parameters,
      selectedSubtests: testsCopy[index]?.selectedSubtests || []
    };

    if (!patientCopy.tests) patientCopy.tests = [];
    patientCopy.tests[index] = {
      testId: testObj._id || testObj.id,
      testName: testObj.name,
      selectedSubtests: testsCopy[index].selectedSubtests.map(s => ({ subtestId: s.subtestId, subtestName: s.subtestName, status: s.status }))
    };

    setEnrichedTests(testsCopy);
    setPatient(patientCopy);
    setShowTestSuggestions(false);
    setTestSuggestions([]);
  };

  const applyParamSuggestion = (param, tIndex, sIndex) => {
    const testsCopy = [...enrichedTests];
    if (!testsCopy[tIndex] || !testsCopy[tIndex].selectedSubtests) return;
    const ss = testsCopy[tIndex].selectedSubtests[sIndex];
    ss.subtestName = param.name;
    ss.subtestId = param._id || param.id || ss.subtestId;
    ss.parameter = param;

    const patientCopy = { ...(patient || {}) };
    if (!patientCopy.tests) patientCopy.tests = [];
    if (!patientCopy.tests[tIndex]) {
      patientCopy.tests[tIndex] = { testId: testsCopy[tIndex].testId || null, testName: testsCopy[tIndex].testName || '', selectedSubtests: [] };
    }
    if (!patientCopy.tests[tIndex].selectedSubtests) patientCopy.tests[tIndex].selectedSubtests = [];
    patientCopy.tests[tIndex].selectedSubtests[sIndex] = patientCopy.tests[tIndex].selectedSubtests[sIndex] || {};
    patientCopy.tests[tIndex].selectedSubtests[sIndex].subtestName = param.name;
    patientCopy.tests[tIndex].selectedSubtests[sIndex].subtestId = param._id || param.id;

    setEnrichedTests(testsCopy);
    setPatient(patientCopy);

    const key = `${testsCopy[tIndex].testId || ''}_${ss.subtestId || ss.tempId || 'custom'}`;
    setShowSubtestMap(prev => ({ ...prev, [key]: false }));
    setSubtestSuggestionsMap(prev => ({ ...prev, [key]: [] }));
  };

  const toggleParamSelection = (testIndex, param) => {
    const testsCopy = [...enrichedTests];
    if (!testsCopy[testIndex]) return;
    if (!testsCopy[testIndex].selectedSubtests) testsCopy[testIndex].selectedSubtests = [];

    const existingIndex = testsCopy[testIndex].selectedSubtests.findIndex(s => (s.subtestId && param._id && s.subtestId === param._id) || s.subtestName === param.name);
    if (existingIndex > -1) {
      // remove
      const removed = testsCopy[testIndex].selectedSubtests.splice(existingIndex, 1);
      // also remove any resultsMap entry
      const key = `${testsCopy[testIndex].testId || ''}_${removed[0].subtestId || removed[0].tempId || 'custom'}`;
      setResultsMap(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } else {
      // add
      const newSub = {
        subtestId: param._id || param.id || null,
        tempId: null,
        subtestName: param.name,
        status: 'pending',
        parameter: param
      };
      testsCopy[testIndex].selectedSubtests.push(newSub);
    }

    // Mirror to patient.tests
    const patientCopy = { ...(patient || {}) };
    if (!patientCopy.tests) patientCopy.tests = [];
    if (!patientCopy.tests[testIndex]) patientCopy.tests[testIndex] = { testId: testsCopy[testIndex].testId || null, testName: testsCopy[testIndex].testName || '', selectedSubtests: [] };
    patientCopy.tests[testIndex].selectedSubtests = (testsCopy[testIndex].selectedSubtests || []).map(s => ({ subtestId: s.subtestId, subtestName: s.subtestName, status: s.status }));

    setEnrichedTests(testsCopy);
    setPatient(patientCopy);
  };

  // Create a brand new test on the backend when user saves a custom test
  const createNewTest = async (testIndex) => {
    try {
      const t = enrichedTests[testIndex];
      if (!t) return;
      const payload = {
        name: t.testName || 'Custom Test',
        category: t.category || 'Custom',
        description: t.notes || t.testName || 'Custom test created from report',
        price: t.price || 0,
        parameters: (t.selectedSubtests || []).map(s => ({ name: s.subtestName || (s.parameter && s.parameter.name) || 'Param', unit: s.parameter?.unit || '', method: s.parameter?.method || '', price: s.parameter?.price || 0 }))
      };
      const res = await createTest(payload);
      const created = res && res.data ? res.data : res;
      if (!created) return alert('Failed to create test');

      // Update local state with returned test id and parameter ids if provided
      const testsCopy = [...enrichedTests];
      testsCopy[testIndex].testId = created._id || created.id || created.testId || testsCopy[testIndex].testId;
      // If backend returned parameters with ids, map them to selectedSubtests
      if (Array.isArray(created.parameters) && created.parameters.length) {
        // match by name and assign ids
        (testsCopy[testIndex].selectedSubtests || []).forEach(ss => {
          const matched = created.parameters.find(p => (p.name || '').toLowerCase() === (ss.subtestName || '').toLowerCase());
          if (matched) ss.subtestId = matched._id || matched.id;
        });
        testsCopy[testIndex].parameters = created.parameters;
      }

      setEnrichedTests(testsCopy);
      const patientCopy = { ...(patient || {}) };
      if (!patientCopy.tests) patientCopy.tests = [];
      patientCopy.tests[testIndex] = patientCopy.tests[testIndex] || {};
      patientCopy.tests[testIndex].testId = testsCopy[testIndex].testId;
      setPatient(patientCopy);
      alert('Test created');
    } catch (err) {
      console.error('createNewTest error', err);
      alert('Failed to create test: ' + (err.message || JSON.stringify(err)));
    }
  };

  // Save a new subtest under an existing test
  const saveNewSubtest = async (testIndex, subIndex) => {
    try {
      const t = enrichedTests[testIndex];
      if (!t || !t.testId) return alert('Cannot add subtest: test not saved yet');
      const ss = t.selectedSubtests[subIndex];
      if (!ss) return;
      const payload = {
        name: ss.subtestName || (ss.parameter && ss.parameter.name) || 'New Subtest',
        unit: ss.parameter?.unit || '',
        method: ss.parameter?.method || '',
        price: ss.parameter?.price || 0
      };
      const res = await addTestSubtest(t.testId, payload);
      const created = res && res.data ? res.data : res;
      if (!created) return alert('Failed to create subtest');

      const testsCopy = [...enrichedTests];
      testsCopy[testIndex].selectedSubtests[subIndex].subtestId = created._id || created.id || testsCopy[testIndex].selectedSubtests[subIndex].subtestId;
      setEnrichedTests(testsCopy);
      alert('Subtest saved');
    } catch (err) {
      console.error('saveNewSubtest error', err);
      alert('Failed to save subtest: ' + (err.message || JSON.stringify(err)));
    }
  };

  // Helper to convert a normalRange (which can be an object or string) into a display string.
  const formatReferenceRange = (range) => {
    if (!range) return '';
    if (typeof range === 'string') return range;
    if (typeof range === 'object') {
      const hasStructured = ['male','female','child','infant'].some(k => !!range[k]);
      if (hasStructured) {
        const genderRaw = (patient && patient.gender) ? String(patient.gender).toLowerCase() : '';
        const age = Number(patient?.age);
        let group = 'male';
        if (genderRaw && genderRaw.startsWith('f')) group = 'female';
        else if (!isNaN(age)) {
          if (age < 1) group = 'infant';
          else if (age < 18) group = 'child';
          else group = 'male';
        }
        const g = range[group] || {};
        const min = g.min || '';
        const max = g.max || '';
        if (min || max) return `${capitalize(group)}: ${min}${max ? ' - ' + max : ''}`.trim();

        // Fallback: list available groups
        const parts = [];
        if (range.male) parts.push(`Male: ${range.male.min || ''}${range.male.max ? ' - ' + range.male.max : ''}`);
        if (range.female) parts.push(`Female: ${range.female.min || ''}${range.female.max ? ' - ' + range.female.max : ''}`);
        if (range.child) parts.push(`Child: ${range.child.min || ''}${range.child.max ? ' - ' + range.child.max : ''}`);
        if (range.infant) parts.push(`Infant: ${range.infant.min || ''}${range.infant.max ? ' - ' + range.infant.max : ''}`);
        return parts.join(', ');
      }

      // Legacy shape: adult/child
      if (range.adult || range.child) return `Adult: ${range.adult || ''}${range.child ? ', Child: ' + range.child : ''}`;
    }
    return '';
  };

  const capitalize = (s) => typeof s === 'string' && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  
  const saveAll = async () => {
    try {
      setLoading(true);
      
      // Step 1: Update patient info
      const patientPayload = { ...(patient || {}) };
      
      // Coerce age to number when possible
      if (patientPayload.age !== undefined && patientPayload.age !== null) {
        const n = Number(patientPayload.age);
        if (!isNaN(n)) patientPayload.age = n;
      }

      // Accept alternate mobile/email keys from UI and map to backend names
      if (!patientPayload.mobileNo && (patientPayload.mobile || patientPayload.phone)) {
        patientPayload.mobileNo = patientPayload.mobile || patientPayload.phone;
      }
      if (!patientPayload.email && patientPayload.emailAddress) {
        patientPayload.email = patientPayload.emailAddress;
      }

      // Ensure address is an object matching backend structure
      if (patientPayload.address && typeof patientPayload.address === 'string') {
        patientPayload.address = { street: patientPayload.address };
      }

      console.debug('saveAll - patient payload', patientPayload);
      await patientService.updatePatient(patientId, patientPayload);
      
      // Step 2: Save all test results
      const resultsCalls = [];
      enrichedTests.forEach(test => {
        const resultsForTest = [];
        (test.selectedSubtests || []).forEach(ss => {
          const key = `${test.testId || ''}_${ss.subtestId || ss.tempId || 'custom'}`;
          const entry = resultsMap[key];
          if (entry && (entry.value || entry.parameterName)) {
            resultsForTest.push({
              subtestId: ss.subtestId || ss.tempId || null,
              parameterName: entry.parameterName || ss.subtestName || (ss.parameter && ss.parameter.name) || '',
              value: entry.value || '',
              unit: entry.unit || (ss.parameter && ss.parameter.unit) || '',
              flag: entry.flag || null,
              normalRange: typeof entry.referenceRange === 'object' || typeof entry.normalRange === 'object'
                ? formatReferenceRange(entry.referenceRange || entry.normalRange || ss.parameter?.referenceRange || ss.parameter?.normalRange)
                : entry.normalRange || entry.referenceRange || formatReferenceRange(ss.parameter?.referenceRange || ss.parameter?.normalRange) || '',
              notes: entry.notes || ''
            });
          }
        });

        if (resultsForTest.length > 0) {
          const reportedBy = (user && (user._id || user.id)) || null;
          const payload = {
            testId: test.testId || null,
            results: resultsForTest,
            reportedBy,
            testResult: test.testResult,
            testNotes: test.notes,
            status: test.status
          };

          // Remove undefined fields
          Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

          console.debug('saveAll - test results payload for testId', payload.testId, payload);
          resultsCalls.push(patientService.addTestResults(patientId, payload));
        }
      });

      console.debug('All pending saveAll calls count:', resultsCalls.length);
      await Promise.all(resultsCalls);
      
      alert('Patient and test results saved successfully');
      try {
        await sendSystemNotification({
          message: `Patient ${patient.name} and test results have been saved.`
        });
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
      }
    } catch (err) {
      console.error('saveAll error', err);
      alert('Failed to save: ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'var(--color-error)' }}>Error: {error}</div>;

  const reportData = {
    patient: patient || {},
    doctor: {
      referredBy: patient?.referredBy || '',
      receivedDate: patient?.examinedDate ? new Date(patient.examinedDate).toLocaleString() : '',
      collectionAt: patient?.collectionAt || '',
      reportDate: patient?.reportDate ? new Date(patient.reportDate).toLocaleString() : ''
    },
    tests: enrichedTests.map((t, idx) => ({
      category: t.category || '',
      title: t.testName || '',
      testId: t.testId,
      testIndex: idx,
      // Use selectedSubtests which contains the parameters for this test
      results: (t.selectedSubtests || []).map(s => ({
        ...s,
        // Ensure we have all necessary fields
        subtestId: s.subtestId || null,
        tempId: s.tempId || null,
        subtestName: s.subtestName || s.parameterName || (s.parameter && s.parameter.name) || ''
      }))
    }))
  };

  return (
    <Paper ref={containerRef} style={{ ...styles.container, padding: 24 }} elevation={3}>
      {/* Top Action Bar (Edit / Save / Print / Add) - hidden when printing */}
      <div className="no-print" style={{ marginBottom: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(6px)', borderRadius: 18, padding: 12, boxShadow: '0 8px 30px rgba(16,24,40,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IconButton onClick={() => navigate(-1)} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <div>
              <div style={{ fontSize: 18, fontWeight: '700' }}>Lab Report Generator</div>
              <div style={{ fontSize: 12, color: 'var(--color-textSecondary)' }}>Patient details and test results</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button startIcon={<SaveIcon />} variant="contained" color="primary" onClick={saveAll}>
              Save All
            </Button>
            <Button startIcon={<PreviewIcon />} variant="outlined" onClick={() => {
              const url = `/patient-report/${patientId}`;
              window.open(url, '_blank');
            }}>
              Preview
            </Button>
          </div>
        </div>
      </div>
      </div>


      {/* Header */}
      <div style={styles.header}>
        <Typography variant="h4" component="div" style={styles.headerTitle}>{settings.organization?.name || 'THYRO DIAGNOSTIC'}</Typography>
        <Typography variant="body2" component="div" style={styles.headerSubtitle}>{settings.organization?.address || '123, Main Street, City, Country'}</Typography>
        <Typography variant="body2" component="div" style={styles.headerSubtitle}>License: {settings.organization?.license || '+1-234-567-890'}</Typography>
        <Typography variant="subtitle1" component="div" style={styles.headerSubtitle}>Medical Laboratory Report</Typography>
      </div>

      {/* Patient and Doctor Details - Repeatable for each page */}
      {reportData.tests.map((testSection, index) => (
        <div key={index} style={styles.page}>
          {/* Patient Details (editable) */}
          <div style={styles.detailsSection}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailRow}>
                <span style={styles.label}>Patient Name:</span>
                <TextField
                  variant="outlined"
                  size="small"
                  style={{ flex: 1 }}
                  value={reportData.patient.name || ''}
                  onChange={(e) => handlePatientChange('name', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Mobile:</span>
                <TextField
                  variant="outlined"
                  size="small"
                  style={{ flex: 1 }}
                  value={reportData.patient.mobileNo || ''}
                  onChange={(e) => handlePatientChange('mobileNo', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Gender:</span>
                <TextField
                  variant="outlined"
                  size="small"
                  style={{ flex: 1 }}
                  value={reportData.patient.gender || ''}
                  onChange={(e) => handlePatientChange('gender', e.target.value)}
                  disabled={!editMode}
                />
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Age:</span>
                <TextField
                  variant="outlined"
                  size="small"
                  style={{ flex: 1 }}
                  value={reportData.patient.age || reportData.patient.calculatedAge || ''}
                  onChange={(e) => handlePatientChange('age', e.target.value)}
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>

          {/* Doctor Details (read-only) */}
          <div style={styles.detailsSection}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailRow}>
                <span style={styles.label}>Referred by:</span>
                <span style={styles.value}>{reportData.doctor.referredBy}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Received Date:</span>
                <span style={styles.value}>{reportData.doctor.receivedDate}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Collection At:</span>
                <span style={styles.value}>{reportData.doctor.collectionAt}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Report Date:</span>
                <span style={styles.value}>{reportData.doctor.reportDate}</span>
              </div>
            </div>
          </div>

          {/* Test Category */}
          <div style={styles.categoryHeader}>{testSection.category}</div>

          {/* Test Title (editable) + status + notes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <input
              style={{ ...styles.input, flex: 1 }}
              value={enrichedTests[index]?.testName || testSection.title || ''}
              onChange={async (e) => {
                const v = e.target.value;
                handleTestFieldChange(index, 'testName', v);
                if (v && v.length > 1) {
                  const found = await fetchTestSuggestions(v);
                  setTestSuggestions(found || []);
                  setShowTestSuggestions(true);
                } else {
                  setTestSuggestions([]);
                  setShowTestSuggestions(false);
                }
              }}
            />
            {/* Save new test when testId is not present */}
            {!enrichedTests[index]?.testId && (
              <Button variant="contained" color="primary" size="small" onClick={() => createNewTest(index)} style={{ marginLeft: 8 }}>Save Test</Button>
            )}
            <select
              value={enrichedTests[index]?.status || 'pending'}
              onChange={(e) => handleTestFieldChange(index, 'status', e.target.value)}
              style={{ padding: '6px 8px' }}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <input
              placeholder="Overall result"
              value={enrichedTests[index]?.testResult || ''}
              onChange={(e) => handleTestFieldChange(index, 'testResult', e.target.value)}
              style={{ ...styles.input, width: 120 }}
            />
            <input
              placeholder="Unit"
              value={enrichedTests[index]?.unit || ''}
              onChange={(e) => handleTestFieldChange(index, 'unit', e.target.value)}
              style={{ ...styles.input, width: 100 }}
            />
            <input
              placeholder="Normal range"
              value={enrichedTests[index]?.normalRange || ''}
              onChange={(e) => handleTestFieldChange(index, 'normalRange', e.target.value)}
              style={{ ...styles.input, width: 140 }}
            />
          </div>
          {showTestSuggestions && testSuggestions && testSuggestions.length > 0 && (
            <div style={{ position: 'relative', maxWidth: '600px', zIndex: 2000 }}>
              <div style={{ border: '1px solid #ccc', background: '#fff' }}>
                {testSuggestions.map((t, ti) => (
                  <div key={ti} style={{ padding: 8, cursor: 'pointer' }} onClick={() => applyTestSuggestion(t, index)}>
                    <div style={{ fontWeight: 'bold' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{t.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginBottom: 10 }}>
            <textarea
              placeholder="Test notes"
              value={enrichedTests[index]?.notes || ''}
              onChange={(e) => handleTestFieldChange(index, 'notes', e.target.value)}
              style={{ width: '100%', minHeight: 50, padding: 8 }}
            />
          </div>

          {/* Parameter list with checkboxes - user chooses which subtests to add */}
          {(enrichedTests[index]?.parameters || []).length > 0 && (
            <div style={{ marginBottom: 12, padding: 8, border: '1px solid var(--color-border)', background: 'var(--color-backgroundSecondary)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Available Parameters</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(enrichedTests[index].parameters || []).map((p, pi) => {
                  const selected = (enrichedTests[index].selectedSubtests || []).some(s => (s.subtestId && p._id && s.subtestId === p._id) || s.subtestName === p.name);
                  return (
                    <div key={pi}>
                      <FormControlLabel
                        control={<Checkbox checked={selected} onChange={() => toggleParamSelection(index, p)} />}
                        label={<span style={{ fontSize: 13 }}>{p.name}{p.unit ? ` (${p.unit})` : ''}</span>}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results Table (editable values) */}
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Test</th>
                <th style={styles.tableHeader}>Result</th>
                <th style={styles.tableHeader}>Unit</th>
                <th style={styles.tableHeader}>Normal Range</th>
                <th style={styles.tableHeader}>Remarks</th>
                <th style={styles.tableHeader}>Flag</th>
                </tr>
            </thead>
            <tbody>
              {testSection.results.map((ss, idx) => {
                // ss is a selectedSubtest object
                const testId = enrichedTests[index]?.testId;
                const subtestId = ss.subtestId || null;
                const tempId = ss.tempId || ss.tempId;
                const key = `${testId || ''}_${subtestId || tempId || 'custom'}`;
                const existing = resultsMap[key] || {};
                const displayName = Object.prototype.hasOwnProperty.call(ss, 'subtestName') ? (ss.subtestName) : ((ss.parameter && ss.parameter.name) || '');

                return (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <TextField
                          variant="outlined"
                          size="small"
                          style={{ flex: 1 }}
                          placeholder={ss.custom ? 'Enter subtest name' : ''}
                          value={displayName}
                          onChange={async (e) => {
                            const v = e.target.value;
                            handleSubtestNameChange(index, idx, v);
                            const testIdLocal = enrichedTests[index]?.testId || null;
                            const key = `${testIdLocal || ''}_${(ss.subtestId || ss.tempId) || 'custom'}`;
                            if (v && v.length > 0) {
                              const found = await fetchParamSuggestions(testIdLocal, v);
                              setSubtestSuggestionsMap(prev => ({ ...prev, [key]: found || [] }));
                              setShowSubtestMap(prev => ({ ...prev, [key]: true }));
                            } else {
                              setSubtestSuggestionsMap(prev => ({ ...prev, [key]: [] }));
                              setShowSubtestMap(prev => ({ ...prev, [key]: false }));
                            }
                          }}
                        />
                        {ss.custom && (
                          <Button variant="outlined" size="small" color="error" onClick={() => deleteCustomSubtest(index, idx)} style={{ minWidth: '40px', padding: '4px 6px' }}>
                            ✕
                          </Button>
                        )}
                        {(!ss.subtestId || ss.subtestId === null) && !ss.custom && (
                          <Button variant="outlined" size="small" onClick={() => saveNewSubtest(index, idx)} style={{ minWidth: '50px', padding: '4px 6px' }}>
                            Save
                          </Button>
                        )}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <TextField
                        variant="outlined"
                        size="small"
                        style={{ width: '90%' }}
                        value={existing.value || ''}
                        onChange={(e) => handleResultChange(testId, subtestId || tempId, 'value', e.target.value)}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <TextField
                        variant="outlined"
                        size="small"
                        style={{ width: '90%' }}
                        value={existing.unit || (ss.parameter && ss.parameter.unit) || ''}
                        onChange={(e) => handleResultChange(testId, subtestId || tempId, 'unit', e.target.value)}
                      />
                    </td>
                      <td style={styles.tableCell}>
                      <TextField
                        variant="outlined"
                        size="small"
                        style={{ width: '90%' }}
                        value={existing.normalRange || (typeof existing.referenceRange === 'string' ? existing.referenceRange : formatReferenceRange((ss.parameter && ss.parameter.referenceRange) || (ss.parameter && ss.parameter.normalRange) || existing.referenceRange))}
                        onChange={(e) => handleResultChange(testId, subtestId || tempId, 'normalRange', e.target.value)}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <TextField
                        variant="outlined"
                        size="small"
                        style={{ width: '90%' }}
                        value={existing.notes || ''}
                        onChange={(e) => handleResultChange(testId, subtestId || tempId, 'notes', e.target.value)}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Button size="small" variant={existing.flag === 'bold' ? 'contained' : 'outlined'} onClick={() => handleSetFlag(key, 'bold')}>B</Button>
                        <Button size="small" variant={(existing.flag || '').toString().startsWith('highlight') ? 'contained' : 'outlined'} onClick={() => setShowFlagMenuMap(prev => ({ ...prev, [key]: !prev[key] }))}>H</Button>
                        {showFlagMenuMap[key] && (
                          <div style={{ display: 'flex', gap: 6, marginLeft: 6 }}>
                            <button type="button" onClick={() => handleSetFlag(key, 'highlight:red')} style={{ background: '#ffe6e6', border: '1px solid #f0c2c2', padding: '4px 6px', cursor: 'pointer' }}>R</button>
                            <button type="button" onClick={() => handleSetFlag(key, 'highlight:green')} style={{ background: '#e6ffed', border: '1px solid #cfe8d1', padding: '4px 6px', cursor: 'pointer' }}>G</button>
                            <button type="button" onClick={() => handleSetFlag(key, 'highlight:yellow')} style={{ background: '#fff9db', border: '1px solid #f0e6b8', padding: '4px 6px', cursor: 'pointer' }}>Y</button>
                            <button type="button" onClick={() => handleSetFlag(key, null)} style={{ padding: '4px 6px', cursor: 'pointer' }}>Clear</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Subtest suggestions dropdowns per row */}
          {testSection.results.map((ss, idx) => {
            const testIdLocal = enrichedTests[index]?.testId || null;
            const key = `${testIdLocal || ''}_${(ss.subtestId || ss.tempId) || 'custom'}`;
            const suggestions = subtestSuggestionsMap[key] || [];
            const show = showSubtestMap[key];
            if (!show || !suggestions || suggestions.length === 0) return null;
            return (
              <div key={`sug-${index}-${idx}`} style={{ maxWidth: 600, position: 'relative', zIndex: 2000 }}>
                <div style={{ border: '1px solid #ccc', background: '#fff' }}>
                  {suggestions.map((p, pi) => (
                    <div key={pi} style={{ padding: 8, cursor: 'pointer' }} onClick={() => applyParamSuggestion(p, index, idx)}>
                      <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{p.unit || ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Button variant="text" size="small" onClick={() => addCustomSubtest(index)}>Add Custom Subtest</Button>
          </div>

          {/* Page Break */}
          {index < reportData.tests.length - 1 && <div style={styles.pageBreak} />}
        </div>
      ))}

      {/* Footer */}
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={addCustomTest} style={{ padding: '8px 12px', borderRadius: 6 }}>
          Add Test
        </Button>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>******** End of Report ********</p>
        <p style={styles.footerNote}>
          This is a computer-generated report and does not require a signature.
        </p>
      </div>
    </Paper>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '210mm',
    margin: '0 auto',
    backgroundColor: 'var(--color-surface)',
    padding: '20px',
    fontSize: '12px',
    color: 'var(--color-text)'
  },
  header: {
    textAlign: 'center',
    padding: '28px 18px',
    marginBottom: '20px',
    background: 'linear-gradient(90deg, #0f172a 0%, #4c1d95 50%, #7c3aed 100%)',
    color: '#fff',
    borderRadius: 8
  },
  headerTitle: {
    margin: '0 0 6px 0',
    fontSize: '26px',
    color: '#fff',
    fontWeight: '800'
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: 'rgba(255,255,255,0.85)'
  },
  page: {
    marginBottom: '30px'
  },
  detailsSection: {
    marginBottom: '15px',
    border: '1px solid var(--color-border)',
    padding: '10px',
    backgroundColor: 'var(--color-backgroundSecondary)'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  },
  detailRow: {
    display: 'flex',
    gap: '10px'
  },
  label: {
    fontWeight: 'bold',
    minWidth: '120px',
    color: 'var(--color-textSecondary)'
  },
  value: {
    color: 'var(--color-text)'
  },
  categoryHeader: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-surface)',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '20px',
    marginBottom: '10px'
  },
  testTitle: {
    backgroundColor: 'var(--color-backgroundTertiary)',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: 'var(--color-primary)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    border: '1px solid var(--color-border)'
  },
  tableHeaderRow: {
    backgroundColor: 'var(--color-primaryLight)'
  },
  tableHeader: {
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    fontSize: '12px'
  },
  tableRow: {
    borderBottom: '1px solid var(--color-border)'
  },
  tableCell: {
    padding: '8px',
    border: '1px solid var(--color-border)',
    fontSize: '11px'
  },
  abnormalValue: {
    color: 'var(--color-error)',
    fontWeight: 'bold'
  },
  pageBreak: {
    borderTop: '2px dashed var(--color-borderLight)',
    marginTop: '30px',
    marginBottom: '30px'
  },
  footer: {
    textAlign: 'center',
    borderTop: '3px solid var(--color-primary)',
    paddingTop: '15px',
    marginTop: '30px'
  },
  footerText: {
    margin: '10px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'var(--color-primary)'
  },
  footerNote: {
    margin: '5px 0',
    fontSize: '10px',
    color: 'var(--color-textSecondary)',
    fontStyle: 'italic'
  }
  ,
  input: {
    padding: '6px 8px',
    border: '1px solid var(--color-inputBorder)',
    borderRadius: 4,
    fontSize: '12px'
  }
};

export default ReportGenarator;