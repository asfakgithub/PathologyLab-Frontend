import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import patientService from '../../services/patientService';
import { SettingsContext } from '../../context/SettingsContext';
import { IconButton} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const PateintReport = (props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [enrichedTests, setEnrichedTests] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const { settings } = useContext(SettingsContext);

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
        // Normalize payload to support both res.data.data and older res.data shapes
        let payload = res && res.data ? res.data : res;
        if (payload && payload.data) payload = payload.data;
        console.debug('PateintReport: normalized payload', payload);
        const fetchedPatient = payload && (payload.patient || payload) ? (payload.patient || payload) : null;
        const fetchedEnriched = (payload && payload.enrichedTests) ? payload.enrichedTests : [];
        const fetchedResults = (payload && payload.results) ? payload.results : [];

        setPatient(fetchedPatient);
        setEnrichedTests(fetchedEnriched);

        const map = {};
        (fetchedResults || []).forEach(r => {
          const keyBySub = `${r.testId || ''}_${r.subtestId || 'custom'}`;
          map[keyBySub] = r;
          if (r.tempId) {
            const keyByTemp = `${r.testId || ''}_${r.tempId}`;
            map[keyByTemp] = r;
          }
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
  if (error) return <div style={{ padding: 20, color: 'var(--color-error)' }}>Error: {error}</div>;

  // Helper: only render rows/fields that have values
  const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== '';

  // Helper to convert a referenceRange (structured or legacy) into a display string.
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

      // legacy adult/child shape
      if (range.adult || range.child) return `Adult: ${range.adult || ''}${range.child ? ', Child: ' + range.child : ''}`;
    }
    return '';
  };

  const capitalize = (s) => typeof s === 'string' && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
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

  // Helper to robustly obtain patient age (derive from dateOfBirth if needed)
  const getPatientAge = () => {
    const p = patient || {};
    if (p.age) return p.age;
    const dob = p.dateOfBirth || p.dob || p.birthDate;
    if (dob) {
      try {
        const d = new Date(dob);
        if (!isNaN(d)) {
          const diff = Date.now() - d.getTime();
          return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }
      } catch (e) {}
    }
    return null;
  };

  const getPatientGender = () => {
    const p = patient || {};
    return p.gender || p.sex || p.genderName || '';
  };

  const getDoctorName = () => {
    const p = patient || {};
    if (p.examinedBy) {
      if (typeof p.examinedBy === 'string') return p.examinedBy;
      if (p.examinedBy.name) return p.examinedBy.name;
      if (p.doctorName) return p.doctorName;
    }
    return p.doctorName || p.referredBy || p.referringDoctor || '';
  };

  const handleDownload = () => {
    // Hide controls with CSS class .no-print and trigger print dialog for PDF download
    window.print();
  };

  return (
    <div style={styles.container}>
      <style>{'@media print { .no-print { display: none !important; } }'}</style>

      <div style={styles.header}>
        <h1 style={styles.headerTitle}>{settings.organization?.name || 'THYRO DIAGNOSTIC'}</h1>
        <p style={styles.headerSubtitle}>{settings.organization?.address || '123, Main Street, City, Country'}</p>
        <p style={styles.headerSubtitle}>License: {settings.organization?.license || '+1-234-567-890'}</p>
        <p style={styles.headerSubtitle}>Medical Laboratory Report</p>
      </div>

      <div className="no-print" style={{ padding: 10, background: 'var(--color-backgroundTertiary)', border: '1px solid var(--color-borderLight)', marginBottom: 12 }}>
        <strong>Debug:</strong>
        <div>patientId: <code>{patientId || 'none'}</code></div>
        <div>route params id: <code>{routeParams?.id || 'none'}</code></div>
        <div>fetched patient: <code>{patient ? (patient.name || patient.id || 'loaded') : 'not loaded'}</code></div>
        <div>enriched tests: <code>{enrichedTests.length}</code> | results entries: <code>{Object.keys(resultsMap || {}).length}</code></div>
      </div>

      {/* Always render patient details once (do not gate behind test filtering) */}
      <div style={styles.detailsSection}>
        <div style={styles.detailsGrid}>
          <div style={styles.detailRow}><span style={styles.label}>Patient Name:</span><span style={styles.value}>{reportData.patient.name || reportData.patient.patientName || ''}</span></div>
          <div style={styles.detailRow}><span style={styles.label}>Mobile:</span><span style={styles.value}>{reportData.patient.mobileNo || reportData.patient.phone || reportData.patient.contact || ''}</span></div>
          <div style={styles.detailRow}><span style={styles.label}>Gender:</span><span style={styles.value}>{reportData.patient.gender || reportData.patient.sex || ''}</span></div>
          <div style={styles.detailRow}><span style={styles.label}>Age:</span><span style={styles.value}>{reportData.patient.age || reportData.patient.calculatedAge || ''}</span></div>
        </div>
      </div>

      {/* Left-middle floating action buttons (hidden for print) */}
      <div className="no-print" style={{ position: 'fixed', left: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 1200 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: 'primary.main', background: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <button onClick={handleDownload} style={{ padding: '8px 10px' }}>Download / Print</button>
        </div>
      </div>

      {reportData.tests.map((testSection, index) => {
        // filter results that actually have values in resultsMap
        // Deduplicate subtests by unique key (subtestId/tempId/subtestName)
        const unique = [];
        const deduped = (testSection.results || []).filter(ss => {
          const key = ss.subtestId || ss.tempId || ss.subtestName || JSON.stringify(ss);
          if (unique.indexOf(key) !== -1) return false;
          unique.push(key);
          return true;
        });

        // Show all deduped subtests (report should list subtests even if values are not present)
        const filteredResults = deduped;

        return (
          <div key={index} style={styles.page}>
            <div style={styles.detailsSection}>
              <div style={styles.detailsGrid}>
                {hasValue(reportData.patient.name) && (
                  <div style={styles.detailRow}><span style={styles.label}>Patient Name:</span><span style={styles.value}>{reportData.patient.name}</span></div>
                )}
                {hasValue(reportData.patient.mobileNo || reportData.patient.phone || reportData.patient.contact) && (
                  <div style={styles.detailRow}><span style={styles.label}>Mobile:</span><span style={styles.value}>{reportData.patient.mobileNo || reportData.patient.phone || reportData.patient.contact}</span></div>
                )}
                {getPatientGender() && (
                  <div style={styles.detailRow}><span style={styles.label}>Gender:</span><span style={styles.value}>{getPatientGender()}</span></div>
                )}
                {getPatientAge() !== null && (
                  <div style={styles.detailRow}><span style={styles.label}>Age:</span><span style={styles.value}>{getPatientAge()}</span></div>
                )}
              </div>
            </div>

            <div style={styles.detailsSection}>
              <div style={styles.detailsGrid}>
                {hasValue(reportData.doctor.referredBy) && (
                  <div style={styles.detailRow}><span style={styles.label}>Referred by:</span><span style={styles.value}>{reportData.doctor.referredBy}</span></div>
                )}
                {getDoctorName() && (
                  <div style={styles.detailRow}><span style={styles.label}>Doctor:</span><span style={styles.value}>{getDoctorName()}</span></div>
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
                      <td style={styles.tableCell}>{formatReferenceRange(existing.referenceRange || (ss.parameter && ss.parameter.referenceRange) || existing.normalRange || (ss.parameter && ss.parameter.normalRange))}</td>
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
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2, color: 'primary.main' }}
        >
          <ArrowBackIcon />
        </IconButton>
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
    backgroundColor: 'var(--color-surface)',
    padding: '20px',
    fontSize: '12px',
    color: 'var(--color-text)'
  },
  header: {
    textAlign: 'center',
    borderBottom: '3px solid var(--color-primary)',
    paddingBottom: '15px',
    marginBottom: '20px'
  },
  headerTitle: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    color: 'var(--color-primary)',
    fontWeight: 'bold'
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: 'var(--color-textSecondary)'
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
};

export default PateintReport;