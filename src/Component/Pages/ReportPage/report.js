import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  getPatient, 
  updatePatient, 
  createReport 
} from '../../../services/api';
import formatReferenceRange from '../../../utils/formatReferenceRange';
import LoadingSpinner from '../../common/LoadingSpinner';
import './report.css';

function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Report data state
  const [reportResults, setReportResults] = useState([]);
  
  const fetchPatientData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPatient(id);
      console.log('Patient data response:', response);
      
      if (response && response.data) {
        const patientData = response.data;
        setPatient(patientData);
        
        // Initialize report results based on patient's tests
        if (patientData.tests && patientData.tests.length > 0) {
          initializeReportResults(patientData.tests, patientData);
        }
      } else {
        setError('Patient not found');
      }
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id, fetchPatientData]);

  const initializeReportResults = (tests) => {
    const initialResults = [];
    
    tests.forEach((test, testIndex) => {
      if (test.selectedSubtests && test.selectedSubtests.length > 0) {
        // For tests with subtests
        test.selectedSubtests.forEach((subtest, subtestIndex) => {
          initialResults.push({
            id: `${testIndex}-${subtestIndex}`,
            testId: test.testId,
            testName: test.testName,
            subtestId: subtest.subtestId,
            subtestName: subtest.subtestName,
            name: subtest.subtestName,
            normalRange: formatReferenceRange(subtest.referenceRange || subtest.normalRange, patient || {}),
            unit: subtest.unit || '',
            result: '',
            status: 'pending'
          });
        });
      } else {
        // For tests without subtests
        initialResults.push({
          id: `${testIndex}-0`,
          testId: test.testId,
          testName: test.testName,
          name: test.testName,
          normalRange: formatReferenceRange(test.referenceRange || test.normalRange, patient || {}),
          unit: '',
          result: '',
          status: 'pending'
        });
      }
    });
    
    setReportResults(initialResults);
  };

  const handleResultChange = (id, field, value) => {
    setReportResults(prev => 
      prev.map(result => 
        result.id === id ? { ...result, [field]: value } : result
      )
    );
  };

  const addCustomResult = () => {
    const newResult = {
      id: `custom-${Date.now()}`,
      testId: null,
      testName: 'Custom Test',
      name: '',
      normalRange: '',
      unit: '',
      result: '',
      status: 'pending'
    };
    setReportResults(prev => [...prev, newResult]);
  };

  const removeResult = (id) => {
    setReportResults(prev => prev.filter(result => result.id !== id));
  };

  const validateResults = () => {
    const errors = [];
    reportResults.forEach((result, index) => {
      if (!result.name.trim()) {
        errors.push(`Result ${index + 1}: Test name is required`);
      }
      if (!result.result.trim()) {
        errors.push(`Result ${index + 1}: Result value is required`);
      }
    });
    return errors;
  };

  const handleSubmitReport = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate results
      const validationErrors = validateResults();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }

      // Prepare report data
      const reportData = {
        patientId: patient._id,
        testResults: reportResults.map(result => ({
          testId: result.testId,
          testName: result.testName,
          subtestId: result.subtestId,
          subtestName: result.subtestName,
          parameterName: result.name,
          result: result.result,
          unit: result.unit,
          normalRange: result.normalRange,
          status: 'completed'
        })),
        status: 'completed',
        completedDate: new Date().toISOString(),
        examinedBy: patient.examinedBy || 'Lab Technician'
      };

      console.log('Creating report with data:', reportData);

      // Create the report
      const reportResponse = await createReport(reportData);
      console.log('Report created:', reportResponse);

      // Update patient status
      const updatedPatientData = {
        ...patient,
        status: 'completed',
        results: reportResults
      };

      const patientResponse = await updatePatient(patient._id, updatedPatientData);
      console.log('Patient updated:', patientResponse);

      // Navigate to prescription/result page
      navigate(`/prescription/${id}`);

    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !patient) {
    return (
      <div className="report-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='report-page'>
      <div className='reportDiv'>
        <div className='report-header'>
          <h2>Lab Report Entry</h2>
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}
        </div>

        <div className='report-infos'>
          <div className='patient-info-grid'>
            <div className='report-info'>
              <strong>Patient Name:</strong> {patient?.name}
            </div>
            <div className='report-info'>
              <strong>Patient ID:</strong> {patient?._id?.slice(-6)}
            </div>
            <div className='report-info'>
              <strong>Age:</strong> {patient?.age} years
            </div>
            <div className='report-info'>
              <strong>Gender:</strong> {patient?.gender}
            </div>
            <div className='report-info'>
              <strong>Examined By:</strong> {patient?.examinedBy || 'Lab Technician'}
            </div>
            <div className='report-info'>
              <strong>Test Date:</strong> {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className='report-inputBlock'>
          <div className='report-tests'>
            <h3>Test Results Entry</h3>
            <p>Enter the results for each test parameter below:</p>
          </div>

          <div className='inputRows'>
            {reportResults.map((result, index) => (
              <div className='inputRow' key={result.id}>
                <div className="result-header">
                  <h4>{result.testName}</h4>
                  {result.subtestName && (
                    <span className="subtest-label">- {result.subtestName}</span>
                  )}
                  {result.id.startsWith('custom-') && (
                    <button 
                      className="remove-btn"
                      onClick={() => removeResult(result.id)}
                      title="Remove this result"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <div className="input-fields-grid">
                  <div className="input-row-group">
                    <label className='input-test-name'>Parameter Name</label>
                    <input 
                      type='text' 
                      value={result.name} 
                      onChange={(e) => handleResultChange(result.id, 'name', e.target.value)}
                      className='input-field-tests'
                      placeholder="e.g., Hemoglobin"
                    />
                  </div>
                  
                  <div className="input-row-group">
                    <label className='input-test-name'>Normal Range</label>
                    <input 
                      type='text' 
                      value={result.normalRange} 
                      onChange={(e) => handleResultChange(result.id, 'normalRange', e.target.value)}
                      className='input-field-tests'
                      placeholder="e.g., 12.0-16.0"
                    />
                  </div>
                  
                  <div className="input-row-group">
                    <label className='input-test-name'>Unit</label>
                    <input 
                      type='text' 
                      value={result.unit} 
                      onChange={(e) => handleResultChange(result.id, 'unit', e.target.value)}
                      className='input-field-tests'
                      placeholder="e.g., g/dL"
                    />
                  </div>
                  
                  <div className="input-row-group">
                    <label className='input-test-name'>Result *</label>
                    <input 
                      type='text' 
                      value={result.result} 
                      onChange={(e) => handleResultChange(result.id, 'result', e.target.value)}
                      className='input-field-tests'
                      placeholder="Enter test result"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className='btn-grp-add-rem'>
              <button 
                className='add-btn-row'
                onClick={addCustomResult}
                disabled={saving}
              >
                Add Custom Test
              </button>
              
              <button 
                className='add-btn-row primary'
                onClick={handleSubmitReport}
                disabled={saving || reportResults.length === 0}
              >
                {saving ? 'Submitting...' : 'Submit Report'}
              </button>
              
              <Link 
                to="/dashboard" 
                className='add-btn-row secondary'
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;