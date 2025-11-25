import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';
import { useNavigate } from 'react-router-dom';
import useSystemNotification from '../../core/hooks/useSystemNotification';

const ViewPatient = (props) => {
  const { sendSystemNotification } = useSystemNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [enrichedTests, setEnrichedTests] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
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

        // Backend returns { message, data: { patient, enrichedTests, results } }
        const payload = res.data || res;
        const fetchedPatient = payload.patient || payload;
        const fetchedEnriched = payload.enrichedTests || [];
        const fetchedResults = payload.results || [];

        setPatient(fetchedPatient);
        setEnrichedTests(fetchedEnriched);

        // Build results map keyed by `${testId}_${subtestId || 'custom'}`
        const map = {};
        (fetchedResults || []).forEach(r => {
          const key = `${r.testId || ''}_${r.subtestId || 'custom'}`;
          map[key] = r;
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

  const addCustomSubtest = (testIndex) => {
    const testsCopy = [...enrichedTests];
    const patientCopy = { ...(patient || {}) };
    const newTempId = `temp_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const newSub = {
      subtestId: null,
      tempId: newTempId,
      subtestName: 'New Subtest',
      status: 'pending',
      parameter: { name: 'New Subtest', unit: '', normalRange: '' },
      custom: true
    };

    if (!testsCopy[testIndex].selectedSubtests) testsCopy[testIndex].selectedSubtests = [];
    testsCopy[testIndex].selectedSubtests.push(newSub);

    // Also persist a corresponding entry into patient.tests so savePatientInfo can persist it
    if (!patientCopy.tests) patientCopy.tests = [];
    // Ensure there is an object at the same testIndex in patient.tests
    if (!patientCopy.tests[testIndex]) {
      patientCopy.tests[testIndex] = {
        testId: testsCopy[testIndex].testId || null,
        testName: testsCopy[testIndex].testName || testsCopy[testIndex].testName || 'Custom Test',
        selectedSubtests: []
      };
    }
    if (!patientCopy.tests[testIndex].selectedSubtests) patientCopy.tests[testIndex].selectedSubtests = [];
    patientCopy.tests[testIndex].selectedSubtests.push({
      subtestId: null,
      tempId: newTempId,
      subtestName: 'New Subtest',
      status: 'pending'
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

  // Helper to convert a normalRange (which can be an object or string) into a display string.
  const formatNormalRange = (range) => {
    if (!range) return '';
    if (typeof range === 'string') {
      return range;
    }
    if (typeof range === 'object') {
      return `Adult: ${range.adult || ''}, Child: ${range.child || ''}`;
    }
    return '';
  };
  const savePatientInfo = async () => {
    try {
      setLoading(true);
      await patientService.updatePatient(patientId, patient);
      alert('Patient info saved');
      try {
        await sendSystemNotification({
          message: `Patient details for ${patient.name} have been updated.`
        });
      } catch (notificationError) {
        console.error('Failed to send patient update notification:', notificationError);
      }
    } catch (err) {
      alert('Failed to save patient: ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  const saveResults = async () => {
    try {
      setLoading(true);
      const calls = [];

      // For each test, prepare results payload if there are entries
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
              // Ensure normalRange is always a string before sending to backend
              normalRange: typeof entry.normalRange === 'object' 
                ? formatNormalRange(entry.normalRange) 
                : entry.normalRange || formatNormalRange(ss.parameter?.normalRange) || '',
              notes: entry.notes || ''
            });
          }
        });

        if (resultsForTest.length > 0) {
          calls.push(patientService.addTestResults(patientId, { 
            testId: test.testId, 
            results: resultsForTest, 
            reportedBy: user?._id,
            testResult: test.testResult,
            testNotes: test.notes,
            status: test.status
          }));
        }
      });

      await Promise.all(calls);
      alert('Results saved');
      try {
        await sendSystemNotification({
          message: `Test results for patient ${patient.name} have been saved.`
        });
      } catch (notificationError) {
        console.error('Failed to send test results saved notification:', notificationError);
      }
    } catch (err) {
      alert('Failed to save results: ' + (err.message || JSON.stringify(err)));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;

  const reportData = {
    patient: patient || {},
    doctor: {
      referredBy: patient?.referredBy || '',
      receivedDate: patient?.examinedDate ? new Date(patient.examinedDate).toLocaleString() : '',
      collectionAt: patient?.collectionAt || '',
      reportDate: patient?.reportDate ? new Date(patient.reportDate).toLocaleString() : ''
    },
    tests: enrichedTests.map(t => ({
      category: t.category || '',
      title: t.testName || '',
      results: t.selectedSubtests || []
    }))
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>THYRO DIAGNOSTIC</h1>
        <p style={styles.headerSubtitle}>Medical Laboratory Report</p>
      </div>

      {/* Patient and Doctor Details - Repeatable for each page */}
      {reportData.tests.map((testSection, index) => (
        <div key={index} style={styles.page}>
          {/* Patient Details (editable) */}
          <div style={styles.detailsSection}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailRow}>
                <span style={styles.label}>Patient Name:</span>
                <input
                  style={{ ...styles.input, ...styles.value }}
                  value={reportData.patient.name || ''}
                  onChange={(e) => handlePatientChange('name', e.target.value)}
                />
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Mobile:</span>
                <input
                  style={{ ...styles.input, ...styles.value }}
                  value={reportData.patient.mobileNo || ''}
                  onChange={(e) => handlePatientChange('mobileNo', e.target.value)}
                />
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Gender:</span>
                <input
                  style={{ ...styles.input, ...styles.value }}
                  value={reportData.patient.gender || ''}
                  onChange={(e) => handlePatientChange('gender', e.target.value)}
                />
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>Age:</span>
                <input
                  style={{ ...styles.input, ...styles.value }}
                  value={reportData.patient.age || reportData.patient.calculatedAge || ''}
                  onChange={(e) => handlePatientChange('age', e.target.value)}
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
              onChange={(e) => handleTestFieldChange(index, 'testName', e.target.value)}
            />
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
          <div style={{ marginBottom: 10 }}>
            <textarea
              placeholder="Test notes"
              value={enrichedTests[index]?.notes || ''}
              onChange={(e) => handleTestFieldChange(index, 'notes', e.target.value)}
              style={{ width: '100%', minHeight: 50, padding: 8 }}
            />
          </div>

          {/* Results Table (editable values) */}
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>Test</th>
                  <th style={styles.tableHeader}>Result</th>
                  <th style={styles.tableHeader}>Unit</th>
                  <th style={styles.tableHeader}>Normal Range</th>
                  <th style={styles.tableHeader}>Remarks</th>
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
                const displayName = ss.subtestName || (ss.parameter && ss.parameter.name) || '';

                return (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <input
                        style={{ ...styles.input, width: '90%' }}
                        value={displayName}
                        onChange={(e) => handleSubtestNameChange(index, idx, e.target.value)}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        style={{ width: '90%' }}
                        value={existing.value || ''}
                        onChange={(e) => handleResultChange(testId, subtestId || tempId, 'value', e.target.value)}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        style={{ width: '90%' }}
                        value={existing.unit || (ss.parameter && ss.parameter.unit) || ''}
                        onChange={(e) => handleResultChange(testId, subtestId || tempId, 'unit', e.target.value)}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        style={{ width: '90%' }}
                        value={formatNormalRange(existing.normalRange || (ss.parameter && ss.parameter.normalRange))}
                        onChange={(e) => handleResultChange(testId, subtestId || tempId, 'normalRange', e.target.value)}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        style={{ width: '90%' }}
                        value={existing.notes || ''}
                        onChange={(e) => handleResultChange(testId, subtestId || tempId, 'notes', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => addCustomSubtest(index)}>Add Custom Subtest</button>
          </div>

          {/* Page Break */}
          {index < reportData.tests.length - 1 && <div style={styles.pageBreak} />}
        </div>
      ))}

      {/* Footer */}
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button onClick={savePatientInfo}>Save Patient Info</button>
        <button onClick={saveResults}>Save Results</button>
        <button onClick={addCustomTest}>Add Custom Test</button>
        <button onClick={() => {
          try {
            console.log('ViewPatient preview clicked, computed patientId=', patientId, 'props.patientId=', props && props.patientId);
            const id = patientId;
            if (id) {
              // navigate to the report route in the same tab (use path param to match App.js)
              navigate(`/patient-report/${id}`);
            } else {
              console.log('No patient id available for preview', patientId, props && props.patientId);
              alert('No patient id available for preview');
            }
          } catch (e) {
            console.error(e);
            alert('Failed to open preview: ' + e.message);
          }
        }}>Preview Report</button>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>******** End of Report ********</p>
        <p style={styles.footerNote}>
          This is a computer-generated report and does not require a signature.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '210mm',
    margin: '0 auto',
    backgroundColor: '#fff',
    padding: '20px',
    fontSize: '12px',
    color: '#333'
  },
  header: {
    textAlign: 'center',
    borderBottom: '3px solid #2c5aa0',
    paddingBottom: '15px',
    marginBottom: '20px'
  },
  headerTitle: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    color: '#2c5aa0',
    fontWeight: 'bold'
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#666'
  },
  page: {
    marginBottom: '30px'
  },
  detailsSection: {
    marginBottom: '15px',
    border: '1px solid #ddd',
    padding: '10px',
    backgroundColor: '#f9f9f9'
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
    color: '#555'
  },
  value: {
    color: '#333'
  },
  categoryHeader: {
    backgroundColor: '#2c5aa0',
    color: '#fff',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '20px',
    marginBottom: '10px'
  },
  testTitle: {
    backgroundColor: '#e8f0f8',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#2c5aa0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    border: '1px solid #ddd'
  },
  tableHeaderRow: {
    backgroundColor: '#4a7bc3'
  },
  tableHeader: {
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#fff',
    border: '1px solid #ddd',
    fontSize: '12px'
  },
  tableRow: {
    borderBottom: '1px solid #ddd'
  },
  tableCell: {
    padding: '8px',
    border: '1px solid #ddd',
    fontSize: '11px'
  },
  abnormalValue: {
    color: '#d32f2f',
    fontWeight: 'bold'
  },
  pageBreak: {
    borderTop: '2px dashed #ccc',
    marginTop: '30px',
    marginBottom: '30px'
  },
  footer: {
    textAlign: 'center',
    borderTop: '3px solid #2c5aa0',
    paddingTop: '15px',
    marginTop: '30px'
  },
  footerText: {
    margin: '10px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#2c5aa0'
  },
  footerNote: {
    margin: '5px 0',
    fontSize: '10px',
    color: '#666',
    fontStyle: 'italic'
  }
  ,
  input: {
    padding: '6px 8px',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontSize: '12px'
  }
};

export default ViewPatient;