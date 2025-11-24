import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import patientService from '../../services/patientService';

const PateintReport = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [enrichedTests, setEnrichedTests] = useState([]);
  const [resultsMap, setResultsMap] = useState({});

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
  const routeParams = useParams();
  const patientId = (props && props.patientId) || routeParams?.id || getPatientIdFromLocation();
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
        const res = await patientService.getPatientById(patientId);
        console.debug('PateintReport: raw response from patientService.getPatientById', res);
        const payload = res.data || res;
        console.debug('PateintReport: normalized payload', payload);
        const fetchedPatient = payload.patient || payload;
        const fetchedEnriched = payload.enrichedTests || [];
        const fetchedResults = payload.results || [];

        setPatient(fetchedPatient);
        setEnrichedTests(fetchedEnriched);

        const map = {};
        (fetchedResults || []).forEach(r => {
          const key = `${r.testId || ''}_${r.subtestId || 'custom'}`;
          map[key] = r;
        });
        setResultsMap(map);
      } catch (err) {
        setError(err.message || 'Failed to load patient');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;

  // Helper: only render rows/fields that have values
  const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== '';

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

  const handleDownload = () => {
    // Hide controls with CSS class .no-print and trigger print dialog for PDF download
    window.print();
  };

  return (
    <div style={styles.container}>
      <style>{'@media print { .no-print { display: none !important; } }'}</style>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>THYRO DIAGNOSTIC</h1>
        <p style={styles.headerSubtitle}>Medical Laboratory Report</p>
      </div>

      <div className="no-print" style={{ padding: 10, background: '#fff8e1', border: '1px solid #ffe08a', marginBottom: 12 }}>
        <strong>Debug:</strong>
        <div>patientId: <code>{patientId || 'none'}</code></div>
        <div>route params id: <code>{routeParams?.id || 'none'}</code></div>
        <div>fetched patient: <code>{patient ? (patient.name || patient.id || 'loaded') : 'not loaded'}</code></div>
        <div>enriched tests: <code>{enrichedTests.length}</code> | results entries: <code>{Object.keys(resultsMap || {}).length}</code></div>
      </div>

      {reportData.tests.map((testSection, index) => {
        // filter results that actually have values in resultsMap
        const filteredResults = (testSection.results || []).filter(ss => {
          const testId = enrichedTests[index]?.testId;
          const subtestId = ss.subtestId || ss.tempId || 'custom';
          const key = `${testId || ''}_${subtestId}`;
          const existing = resultsMap[key] || {};
          return hasValue(existing.value) || hasValue(existing.parameterName) || hasValue(ss.subtestName) || hasValue(ss.parameter && ss.parameter.name);
        });

        if (!filteredResults || filteredResults.length === 0) return null;

        return (
          <div key={index} style={styles.page}>
            <div style={styles.detailsSection}>
              <div style={styles.detailsGrid}>
                {hasValue(reportData.patient.name) && (
                  <div style={styles.detailRow}><span style={styles.label}>Patient Name:</span><span style={styles.value}>{reportData.patient.name}</span></div>
                )}
                {hasValue(reportData.patient.mobileNo) && (
                  <div style={styles.detailRow}><span style={styles.label}>Mobile:</span><span style={styles.value}>{reportData.patient.mobileNo}</span></div>
                )}
                {hasValue(reportData.patient.gender) && (
                  <div style={styles.detailRow}><span style={styles.label}>Gender:</span><span style={styles.value}>{reportData.patient.gender}</span></div>
                )}
                {hasValue(reportData.patient.age) && (
                  <div style={styles.detailRow}><span style={styles.label}>Age:</span><span style={styles.value}>{reportData.patient.age}</span></div>
                )}
              </div>
            </div>

            <div style={styles.detailsSection}>
              <div style={styles.detailsGrid}>
                {hasValue(reportData.doctor.referredBy) && (
                  <div style={styles.detailRow}><span style={styles.label}>Referred by:</span><span style={styles.value}>{reportData.doctor.referredBy}</span></div>
                )}
                {hasValue(reportData.doctor.receivedDate) && (
                  <div style={styles.detailRow}><span style={styles.label}>Received Date:</span><span style={styles.value}>{reportData.doctor.receivedDate}</span></div>
                )}
                {hasValue(reportData.doctor.collectionAt) && (
                  <div style={styles.detailRow}><span style={styles.label}>Collection At:</span><span style={styles.value}>{reportData.doctor.collectionAt}</span></div>
                )}
                {hasValue(reportData.doctor.reportDate) && (
                  <div style={styles.detailRow}><span style={styles.label}>Report Date:</span><span style={styles.value}>{reportData.doctor.reportDate}</span></div>
                )}
              </div>
            </div>

            <div style={styles.categoryHeader}>{testSection.category}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              {hasValue(enrichedTests[index]?.testName) && <div style={{ fontWeight: 'bold', fontSize: 16 }}>{enrichedTests[index]?.testName}</div>}
              {hasValue(enrichedTests[index]?.status) && <div>Status: {enrichedTests[index].status}</div>}
              {hasValue(enrichedTests[index]?.testResult) && <div>Result: {enrichedTests[index].testResult}</div>}
            </div>
            {hasValue(enrichedTests[index]?.notes) && <div style={{ marginBottom: 10 }}>{enrichedTests[index].notes}</div>}

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
                {filteredResults.map((ss, idx) => {
                  const testId = enrichedTests[index]?.testId;
                  const subtestId = ss.subtestId || ss.tempId || 'custom';
                  const key = `${testId || ''}_${subtestId}`;
                  const existing = resultsMap[key] || {};
                  const displayName = ss.subtestName || (ss.parameter && ss.parameter.name) || '';

                  return (
                    <tr key={idx} style={styles.tableRow}>
                      <td style={styles.tableCell}>{displayName}</td>
                      <td style={styles.tableCell}>{existing.value || ''}</td>
                      <td style={styles.tableCell}>{existing.unit || (ss.parameter && ss.parameter.unit) || ''}</td>
                      <td style={styles.tableCell}>{formatNormalRange(existing.normalRange || (ss.parameter && ss.parameter.normalRange))}</td>
                      <td style={styles.tableCell}>{existing.notes || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {index < reportData.tests.length - 1 && <div style={styles.pageBreak} />}
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }} className="no-print">
        <button onClick={handleDownload}>Download / Print</button>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>******** End of Report ********</p>
        <p style={styles.footerNote}>This is a computer-generated report and does not require a signature.</p>
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
};

export default PateintReport;
