import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import patientService from '../../services/patientService';
import { SettingsContext } from '../../context/SettingsContext';
import { IconButton} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import './PateintReport.css';

const PateintReport = (props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [enrichedTests, setEnrichedTests] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [layoutMode, setLayoutMode] = useState('normal'); // 'normal' | 'compact'
  const [showWatermark, setShowWatermark] = useState(true);
  const { settings } = useContext(SettingsContext);
  const [labName, setLabName] = useState((settings && settings.organization && settings.organization.name) || 'Your Lab Name');

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
        console.log('PateintReport: fetching patient for id=', patientId);
        const res = await patientService.getPatientById(patientId);
        console.log('PateintReport: patientService.getPatientById response=', res);

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
        console.error('PateintReport fetch error', err);
        setError(err.message || err.toString() || 'Failed to load patient');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

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
    }
  };

  // Helper: group enrichedTests into categories -> [{ name, tests: [{ title, results }] }]
  const buildCategories = () => {
    const map = {};
    (enrichedTests || []).forEach(t => {
      const cat = (t.category || 'General') || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push({ testId: t.testId || '', title: t.testName || '', results: t.selectedSubtests || [], status: t.status || '', notes: t.notes || '' });
    });
    return Object.keys(map).map(k => ({ name: k, tests: map[k] }));
  };

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
    return result;
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
    <div className="container">

      <div className="header">
        <h1 className="headerTitle">{settings.organization?.name || 'THYRO DIAGNOSTIC'}</h1>
        <p className="headerSubtitle">{settings.organization?.address || '123, Main Street, City, Country'}</p>
        <p className="headerSubtitle">License: {settings.organization?.license || '+1-234-567-890'}</p>
        <p className="headerSubtitle">Medical Laboratory Report</p>
      </div>

      <div className="no-print">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>Debug:</strong>
            <div style={{ fontSize: 12 }}>patientId: <code>{patientId || 'none'}</code></div>
            <div style={{ fontSize: 12 }}>fetched patient: <code>{patient ? (patient.name || patient.id || 'loaded') : 'not loaded'}</code></div>
            <div style={{ fontSize: 12 }}>enriched tests: <code>{enrichedTests.length}</code> | results entries: <code>{Object.keys(resultsMap || {}).length}</code></div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={layoutMode === 'compact'} onChange={(e) => setLayoutMode(e.target.checked ? 'compact' : 'normal')} /> Compact mode
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={showWatermark} onChange={(e) => setShowWatermark(e.target.checked)} /> Show watermark
            </label>
            <input style={{ padding: 6 }} value={labName} onChange={(e) => setLabName(e.target.value)} placeholder="Lab name for watermark" />
          </div>
        </div>
      </div>

      {/* Always render patient details once (do not gate behind test filtering) */}
      <div className="detailsSection">
        <div className="detailsGrid">
          <div className="detailRow"><span className="label">Patient Name:</span><span className="value">{reportData.patient.name || reportData.patient.patientName || ''}</span></div>
          <div className="detailRow"><span className="label">Mobile:</span><span className="value">{reportData.patient.mobileNo || reportData.patient.phone || reportData.patient.contact || ''}</span></div>
          <div className="detailRow"><span className="label">Gender:</span><span className="value">{reportData.patient.gender || reportData.patient.sex || ''}</span></div>
          <div className="detailRow"><span className="label">Age:</span><span className="value">{reportData.patient.age || reportData.patient.calculatedAge || ''}</span></div>
        </div>
      </div>

      {/* Left-middle floating action buttons (hidden for print) */}
      <div className="no-print floatingActions">
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ color: 'primary.main', background: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <button className="downloadBtn" onClick={handleDownload}>Download / Print</button>
      </div>

      {/* Paginated category view: group tests into categories then chunk */}
      {(() => {
        const categories = buildCategories();
        const perPage = layoutMode === 'compact' ? 3 : 2;
        const pages = chunkArray(categories, perPage);

        return pages.map((pageCategories, pageIndex) => (
          <div key={pageIndex} className="print-page">
            {showWatermark && (
              <div className="watermark" aria-hidden>{labName}</div>
            )}

            <div className="detailsSection">
              <div className="detailsGrid">
                {hasValue(reportData.doctor.referredBy) && (
                  <div className="detailRow"><span className="label">Referred by:</span><span className="value">{reportData.doctor.referredBy}</span></div>
                )}
                {getDoctorName() && (
                  <div className="detailRow"><span className="label">Doctor:</span><span className="value">{getDoctorName()}</span></div>
                )}
                {hasValue(reportData.doctor.collectionAt) && (
                  <div className="detailRow"><span className="label">Collection At:</span><span className="value">{reportData.doctor.collectionAt}</span></div>
                )}
                {hasValue(reportData.doctor.reportDate) && (
                  <div className="detailRow"><span className="label">Report Date:</span><span className="value">{reportData.doctor.reportDate}</span></div>
                )}
              </div>
            </div>

            {pageCategories.map((cat, cidx) => (
              <section key={cidx} className="category-block">
                <div className="categoryHeader">{cat.name}</div>
                {cat.tests.map((test, ti) => (
                  <div key={ti} className="test-block">
                    {test.title && <div className="testTitle">{test.title}</div>}
                    {test.notes && <div className="testNotes">{test.notes}</div>}
                    <table className="table category-table">
                      <thead>
                        <tr className="tableHeaderRow">
                          <th className="tableHeader">Test</th>
                          <th className="tableHeader">Result</th>
                          <th className="tableHeader">Unit</th>
                          <th className="tableHeader">Normal Range</th>
                          <th className="tableHeader">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(test.results || []).map((ss, idx) => {
                          const testId = (test.testId || '') ;
                          const subtestId = ss.subtestId || ss.tempId || 'custom';
                          const key = `${testId || ''}_${subtestId}`;
                          const existing = resultsMap[key] || {};
                          const displayName = ss.subtestName || (ss.parameter && ss.parameter.name) || '';

                          // Determine classes (reuse earlier mapping)
                          const rawFlagRaw = existing.flag || '';
                          const rawFlag = (rawFlagRaw && typeof rawFlagRaw === 'string') ? rawFlagRaw.toLowerCase() : String(rawFlagRaw).toLowerCase();
                          let highlightClass = '';
                          let boldClass = '';
                          if (rawFlag === 'bold') boldClass = 'result-bold';
                          else if (rawFlag && rawFlag.startsWith('highlight')) {
                            const parts = rawFlag.split(':');
                            const color = (parts[1] || '').trim();
                            if (color === 'green') highlightClass = 'result-highlight-green';
                            else if (color === 'yellow') highlightClass = 'result-highlight-yellow';
                            else if (color === 'red') highlightClass = 'result-highlight-red';
                          } else if (rawFlag === 'green') highlightClass = 'result-highlight-green';
                          else if (rawFlag === 'yellow') highlightClass = 'result-highlight-yellow';
                          else if (rawFlag === 'red') highlightClass = 'result-highlight-red';
                          else if (rawFlag === 'normal') highlightClass = 'result-highlight-green';
                          else if (rawFlag === 'low') highlightClass = 'result-highlight-yellow';
                          else if (rawFlag === 'high' || rawFlag === 'critical') highlightClass = 'result-highlight-red';
                          else if (existing.isAbnormal === true) highlightClass = 'result-highlight-red';

                          const rowClass = `tableRow ${highlightClass}`.trim();

                          return (
                            <tr key={idx} className={rowClass}>
                              <td className={`tableCell ${boldClass}`.trim()}>{displayName}</td>
                              <td className={`tableCell ${highlightClass} ${boldClass}`.trim()}>{existing.value || ''}</td>
                              <td className={`tableCell ${highlightClass} ${boldClass}`.trim()}>{existing.unit || (ss.parameter && ss.parameter.unit) || ''}</td>
                              <td className="tableCell">{formatReferenceRange(existing.referenceRange || (ss.parameter && ss.parameter.referenceRange) || existing.normalRange || (ss.parameter && ss.parameter.normalRange))}</td>
                              <td className="tableCell">{existing.notes || ''}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </section>
            ))}

            {pageIndex < pages.length - 1 && <div className="pageBreak" />}
          </div>
        ));
      })()}

      

      <div className="no-print actions">
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2, color: 'primary.main' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <button className="downloadBtn" onClick={handleDownload}>Download / Print</button>
      </div>
      <div className="footer">
        <p className="footerText">******** End of Report ********</p>
        <p className="footerNote">This is a computer-generated report and does not require a signature.</p>
      </div>
    </div>
  );
};

export default PateintReport;