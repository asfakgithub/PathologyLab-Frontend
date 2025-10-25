import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getPatient, 
  getReport,
  createReport, 
  updateReport,
  getTests
} from '../../../services/api';
import LoadingSpinner from '../../common/LoadingSpinner';
import './ReportForm.css';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import ColorLensIcon from '@mui/icons-material/ColorLens';

const ReportForm = () => {
  const { id, reportId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!reportId;
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [patient, setPatient] = useState(null);
  const [report, setReport] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    // Header Configuration
    header: {
      includeBanner: true,
      bannerImage: null,
      labDetails: {
        name: 'PathologyLab Medical Center',
        address: '123 Medical Street, Health City',
        phone: '+1 234 567 8900',
        email: 'info@pathologylab.com',
        license: 'LAB-2024-001'
      },
      bannerColor: 'blue'
    },
    
    // Patient Details
    patientDetails: {
      name: '',
      age: '',
      gender: '',
      patientId: '',
      contact: '',
      referringDoctor: '',
      dateOfBirth: '',
      address: ''
    },
    
    // Test Results
    testResults: [],
    
    // Footer Configuration
    footer: {
      includeBanner: true,
      bannerImage: null,
      includeSignature: true,
      doctorName: '',
      technician: '',
      accreditationDetails: 'Accredited by National Health Authority',
      contactInfo: {
        phone: '+1 234 567 8900',
        email: 'reports@pathologylab.com',
        website: 'www.pathologylab.com'
      }
    },
    
    // Report Metadata
    reportDate: new Date().toISOString().split('T')[0],
    priority: 'normal',
    remarks: '',
    internalNotes: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch available tests
      // This was unused, but we can keep the call if needed for other logic later.
      await getTests();
      
      if (isEditMode && reportId) {
        // Edit mode - fetch existing report
        const reportResponse = await getReport(reportId);
        if (reportResponse?.success) {
          const reportData = reportResponse.data;
          setReport(reportData);
          setPatient(reportData.patient);
          
          // Populate form with existing data
          setFormData(prev => ({
            ...prev,
            patientDetails: {
              name: reportData.patient?.name || '',
              age: reportData.patient?.age || '',
              gender: reportData.patient?.gender || '',
              patientId: reportData.patient?._id || '',
              contact: reportData.patient?.phone || reportData.patient?.mobileNo || '',
              referringDoctor: reportData.patient?.referringDoctor || '',
              dateOfBirth: reportData.patient?.dateOfBirth || '',
              address: typeof reportData.patient?.address === 'string' 
                ? reportData.patient.address 
                : `${reportData.patient?.address?.street || ''} ${reportData.patient?.address?.city || ''}`.trim()
            },
            testResults: reportData.testResults || [],
            reportDate: reportData.reportDate ? reportData.reportDate.split('T')[0] : new Date().toISOString().split('T')[0],
            priority: reportData.priority || 'normal',
            remarks: reportData.remarks || '',
            internalNotes: reportData.internalNotes || ''
          }));
        }
      } else if (id) {
        // Create mode - fetch patient data
        const patientResponse = await getPatient(id);
        if (patientResponse?.success) {
          const patientData = patientResponse.data;
          setPatient(patientData);
          
          // Initialize form with patient data
          setFormData(prev => ({
            ...prev,
            patientDetails: {
              name: patientData.name || '',
              age: patientData.age || '',
              gender: patientData.gender || '',
              patientId: patientData._id || '',
              contact: patientData.phone || patientData.mobileNo || '',
              referringDoctor: patientData.referringDoctor || '',
              dateOfBirth: patientData.dateOfBirth || '',
              address: typeof patientData.address === 'string' 
                ? patientData.address 
                : `${patientData.address?.street || ''} ${patientData.address?.city || ''}`.trim()
            },
            testResults: initializeTestResults(patientData.tests || [])
          }));
        }
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id, reportId, isEditMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const initializeTestResults = (patientTests) => {
    const initialResults = [];
    
    patientTests.forEach((test, testIndex) => {
      if (test.selectedSubtests && test.selectedSubtests.length > 0) {
        test.selectedSubtests.forEach((subtest, subtestIndex) => {
          initialResults.push({
            id: `${testIndex}-${subtestIndex}`,
            testId: test.testId,
            testName: test.testName,
            subtestId: subtest.subtestId,
            subtestName: subtest.subtestName,
            parameterName: subtest.subtestName,
            normalRange: subtest.normalRange || '',
            unit: subtest.unit || '',
            method: subtest.method || 'Standard Laboratory Method',
            result: '',
            findings: '',
            status: 'pending'
          });
        });
      } else {
        initialResults.push({
          id: `${testIndex}-0`,
          testId: test.testId,
          testName: test.testName,
          parameterName: test.testName,
          normalRange: test.normalRange || '',
          unit: '',
          method: 'Standard Laboratory Method',
          result: '',
          findings: '',
          status: 'pending'
        });
      }
    });
    
    return initialResults;
  };

  const handleHeaderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value
      }
    }));
  };

  const handleLabDetailsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      header: {
        ...prev.header,
        labDetails: {
          ...prev.header.labDetails,
          [field]: value
        }
      }
    }));
  };

  const handleFooterChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: value
      }
    }));
  };

  const handleTestResultChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      testResults: prev.testResults.map(result => 
        result.id === id ? { ...result, [field]: value } : result
      )
    }));
  };

  const addNewTest = () => {
    const newTest = {
      id: `custom-${Date.now()}`,
      testId: null,
      testName: '',
      parameterName: '',
      normalRange: '',
      unit: '',
      method: 'Standard Laboratory Method',
      result: '',
      findings: '',
      status: 'pending'
    };
    
    setFormData(prev => ({
      ...prev,
      testResults: [...prev.testResults, newTest]
    }));
  };

  const addSubtest = (parentTestId) => {
    const newSubtest = {
      id: `subtest-${Date.now()}`,
      testId: parentTestId,
      testName: formData.testResults.find(t => t.testId === parentTestId)?.testName || '',
      parameterName: '',
      normalRange: '',
      unit: '',
      method: 'Standard Laboratory Method',
      result: '',
      findings: '',
      status: 'pending'
    };
    
    setFormData(prev => ({
      ...prev,
      testResults: [...prev.testResults, newSubtest]
    }));
  };

  const removeTestResult = (id) => {
    setFormData(prev => ({
      ...prev,
      testResults: prev.testResults.filter(result => result.id !== id)
    }));
  };

  const handleImageUpload = (section, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (section === 'header') {
          handleHeaderChange('bannerImage', e.target.result);
        } else {
          handleFooterChange('bannerImage', e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.patientDetails.name) {
      errors.push('Patient name is required');
    }
    
    if (formData.testResults.length === 0) {
      errors.push('At least one test result is required');
    }
    
    formData.testResults.forEach((result, index) => {
      if (!result.parameterName) {
        errors.push(`Test ${index + 1}: Parameter name is required`);
      }
      if (!result.result) {
        errors.push(`Test ${index + 1}: Result is required`);
      }
    });
    
    return errors;
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return;
      }
      
      // Prepare report data
      const reportData = {
        patientId: formData.patientDetails.patientId || id,
        testResults: formData.testResults.map(result => ({
          testId: result.testId,
          testName: result.testName,
          subtestId: result.subtestId,
          subtestName: result.subtestName,
          parameterName: result.parameterName,
          result: result.result,
          unit: result.unit,
          normalRange: result.normalRange,
          method: result.method,
          findings: result.findings,
          status: 'completed'
        })),
        status: 'completed',
        completedDate: new Date().toISOString(),
        reportDate: new Date(formData.reportDate).toISOString(),
        priority: formData.priority,
        remarks: formData.remarks,
        internalNotes: formData.internalNotes,
        examinedBy: formData.footer.technician || 'Lab Technician',
        
        // Include configuration for PDF generation
        reportConfig: {
          header: formData.header,
          footer: formData.footer
        }
      };
      
      console.log('Submitting report data:', reportData);
      
      let response;
      if (isEditMode) {
        response = await updateReport(reportId, reportData);
      } else {
        response = await createReport(reportData);
      }
      
      console.log('Report submission response:', response);
      
      // Navigate back to report management
      navigate('/dashboard/reports');
      
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to save report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/reports');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !patient && !report) {
    return (
      <div className="report-form">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleCancel} className="btn-secondary">
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-form">
      <div className="report-form-header">
        <h2>
          {isEditMode ? '📝 Edit Report' : '🧾 Create New Report'}
        </h2>
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
      </div>

      <div className="report-form-content">
        {/* Header Configuration Section */}
        <div className="form-section">
          <h3>📄 Header Configuration</h3>
          
          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.header.includeBanner}
                onChange={(e) => handleHeaderChange('includeBanner', e.target.checked)}
              />
              Include Header Banner
            </label>
          </div>

          {formData.header.includeBanner && (
            <>
              <div className="form-row">
                <label>Banner Image:</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('header', e.target.files[0])}
                    id="header-image"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="header-image" className="upload-btn">
                    <ImageIcon /> Upload Image
                  </label>
                  {formData.header.bannerImage && (
                    <div className="image-preview">
                      <img src={formData.header.bannerImage} alt="Header Banner" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <label>Banner Color:</label>
                <div className="color-options">
                  {['white', 'black', 'blue', 'red'].map(color => (
                    <button
                      key={color}
                      className={`color-btn ${color} ${formData.header.bannerColor === color ? 'active' : ''}`}
                      onClick={() => handleHeaderChange('bannerColor', color)}
                    >
                      <ColorLensIcon />
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lab-details-section">
                <h4>Lab Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Lab Name:</label>
                    <input
                      type="text"
                      value={formData.header.labDetails.name}
                      onChange={(e) => handleLabDetailsChange('name', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Address:</label>
                    <input
                      type="text"
                      value={formData.header.labDetails.address}
                      onChange={(e) => handleLabDetailsChange('address', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone:</label>
                    <input
                      type="text"
                      value={formData.header.labDetails.phone}
                      onChange={(e) => handleLabDetailsChange('phone', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={formData.header.labDetails.email}
                      onChange={(e) => handleLabDetailsChange('email', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>License Number:</label>
                    <input
                      type="text"
                      value={formData.header.labDetails.license}
                      onChange={(e) => handleLabDetailsChange('license', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Patient Details Section */}
        <div className="form-section">
          <h3>👤 Patient Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Patient Name:</label>
              <input
                type="text"
                value={formData.patientDetails.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  patientDetails: { ...prev.patientDetails, name: e.target.value }
                }))}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Age:</label>
              <input
                type="text"
                value={formData.patientDetails.age}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  patientDetails: { ...prev.patientDetails, age: e.target.value }
                }))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Gender:</label>
              <select
                value={formData.patientDetails.gender}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  patientDetails: { ...prev.patientDetails, gender: e.target.value }
                }))}
                className="form-input"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Patient ID:</label>
              <input
                type="text"
                value={formData.patientDetails.patientId}
                disabled
                className="form-input disabled"
              />
            </div>
            <div className="form-group">
              <label>Contact:</label>
              <input
                type="text"
                value={formData.patientDetails.contact}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  patientDetails: { ...prev.patientDetails, contact: e.target.value }
                }))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Referring Doctor:</label>
              <input
                type="text"
                value={formData.patientDetails.referringDoctor}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  patientDetails: { ...prev.patientDetails, referringDoctor: e.target.value }
                }))}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Test Results Section */}
        <div className="form-section">
          <h3>🔬 Test Results</h3>
          
          <div className="test-results-list">
            {formData.testResults.map((result, index) => (
              <div key={result.id} className="test-result-card">
                <div className="test-result-header">
                  <h4>{result.testName || 'New Test'}</h4>
                  {result.id.toString().startsWith('custom-') && (
                    <button 
                      className="remove-btn"
                      onClick={() => removeTestResult(result.id)}
                      title="Remove this test"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                </div>
                
                <div className="test-result-fields">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Test Name:</label>
                      <input
                        type="text"
                        value={result.testName}
                        onChange={(e) => handleTestResultChange(result.id, 'testName', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Complete Blood Count"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Parameter Name:</label>
                      <input
                        type="text"
                        value={result.parameterName}
                        onChange={(e) => handleTestResultChange(result.id, 'parameterName', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Hemoglobin"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Normal Range:</label>
                      <input
                        type="text"
                        value={result.normalRange}
                        onChange={(e) => handleTestResultChange(result.id, 'normalRange', e.target.value)}
                        className="form-input"
                        placeholder="e.g., 12.0-16.0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Unit:</label>
                      <input
                        type="text"
                        value={result.unit}
                        onChange={(e) => handleTestResultChange(result.id, 'unit', e.target.value)}
                        className="form-input"
                        placeholder="e.g., g/dL"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Method:</label>
                      <input
                        type="text"
                        value={result.method}
                        onChange={(e) => handleTestResultChange(result.id, 'method', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Colorimetric Method"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Result: *</label>
                      <input
                        type="text"
                        value={result.result}
                        onChange={(e) => handleTestResultChange(result.id, 'result', e.target.value)}
                        className="form-input"
                        placeholder="Enter test result"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Findings/Comments:</label>
                    <textarea
                      value={result.findings}
                      onChange={(e) => handleTestResultChange(result.id, 'findings', e.target.value)}
                      className="form-textarea"
                      placeholder="Any observations or comments about this test result..."
                      rows="3"
                    />
                  </div>
                </div>
                
                {result.testId && (
                  <div className="test-actions">
                    <button 
                      className="add-subtest-btn"
                      onClick={() => addSubtest(result.testId)}
                    >
                      <AddIcon /> Add Subtest
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="add-test-section">
            <button 
              className="add-test-btn"
              onClick={addNewTest}
            >
              <AddIcon /> Add New Test
            </button>
          </div>
        </div>

        {/* Footer Configuration Section */}
        <div className="form-section">
          <h3>📋 Footer Configuration</h3>
          
          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.footer.includeBanner}
                onChange={(e) => handleFooterChange('includeBanner', e.target.checked)}
              />
              Include Footer Banner
            </label>
          </div>

          {formData.footer.includeBanner && (
            <div className="form-row">
              <label>Footer Banner Image:</label>
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload('footer', e.target.files[0])}
                  id="footer-image"
                  style={{ display: 'none' }}
                />
                <label htmlFor="footer-image" className="upload-btn">
                  <ImageIcon /> Upload Footer Image
                </label>
                {formData.footer.bannerImage && (
                  <div className="image-preview">
                    <img src={formData.footer.bannerImage} alt="Footer Banner" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.footer.includeSignature}
                onChange={(e) => handleFooterChange('includeSignature', e.target.checked)}
              />
              Include Signature Area
            </label>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Doctor/Pathologist Name:</label>
              <input
                type="text"
                value={formData.footer.doctorName}
                onChange={(e) => handleFooterChange('doctorName', e.target.value)}
                className="form-input"
                placeholder="Dr. John Smith"
              />
            </div>
            
            <div className="form-group">
              <label>Technician Name:</label>
              <input
                type="text"
                value={formData.footer.technician}
                onChange={(e) => handleFooterChange('technician', e.target.value)}
                className="form-input"
                placeholder="Lab Technician Name"
              />
            </div>
            
            <div className="form-group full-width">
              <label>Accreditation Details:</label>
              <input
                type="text"
                value={formData.footer.accreditationDetails}
                onChange={(e) => handleFooterChange('accreditationDetails', e.target.value)}
                className="form-input"
                placeholder="Accredited by National Health Authority"
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="form-section">
          <h3>📝 Additional Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Report Date:</label>
              <input
                type="date"
                value={formData.reportDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reportDate: e.target.value }))}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Priority:</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="form-input"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Remarks (Public):</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              className="form-textarea"
              placeholder="Any general remarks or recommendations..."
              rows="4"
            />
          </div>
          
          <div className="form-group full-width">
            <label>Internal Notes (Private):</label>
            <textarea
              value={formData.internalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
              className="form-textarea"
              placeholder="Internal notes for lab staff only..."
              rows="3"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            className="btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            <SaveIcon />
            {saving ? 'Saving...' : (isEditMode ? 'Update Report' : 'Create Report')}
          </button>
          
          <button 
            className="btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            <CancelIcon />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
