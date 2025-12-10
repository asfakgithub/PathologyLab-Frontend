import { useState, useEffect } from 'react';
import patientService from '../../services/patientService';

export const usePatient = (patientId) => {
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setError('No patient ID provided');
      setIsLoading(false);
      return;
    }

    const fetchPatient = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await patientService.getPatientById(patientId);
        const payload = (res && res.data) ? res.data : res;

        // Backend returns { patient, enrichedTests, results }
        const rawPatient = payload.patient || payload || null;

        if (!rawPatient) {
          setPatientData(null);
          return;
        }

        // Normalize fields expected by UI components
        const normalized = { ...rawPatient };

        // phone: UI expects `phone`, backend uses `mobileNo`
        normalized.phone = normalized.phone || normalized.mobileNo || '';

        // billing: map backend keys to UI-friendly keys
        normalized.billing = normalized.billing || {};
        normalized.billing.invoice = normalized.billing.invoice || normalized.billing.invoiceNumber || '';
        normalized.billing.total = normalized.billing.total || normalized.billing.totalAmount || 0;
        normalized.billing.status = normalized.billing.status || normalized.billing.paymentStatus || '';

        // tests: prefer enrichedTests (backend computed), otherwise fallback to stored tests
        const enriched = payload.enrichedTests || null;
        if (Array.isArray(enriched)) {
          normalized.tests = enriched.map((t) => ({
            id: t.testId || (t._id || ''),
            name: t.testName || '',
            status: t.status || '',
            subtests: (t.selectedSubtests || []).map(s => s.subtestName || s.subtestName || ''),
            notes: t.notes || ''
          }));
        } else {
          // fallback mapping if no enriched tests present
          normalized.tests = (normalized.tests || []).map(t => ({
            id: t.testId || t._id || '' ,
            name: t.testName || t.name || '',
            status: t.status || '',
            subtests: (t.selectedSubtests || []).map(s => s.subtestName || s.name || ''),
            notes: t.notes || ''
          }));
        }

        // results: map to UI-friendly shape, include testName when possible
        const rawResults = payload.results || normalized.results || [];
        normalized.results = (rawResults || []).map(r => {
          const testMatch = (payload.enrichedTests || []).find(et => String(et.testId) === String(r.testId));
          return {
            ...r,
            testName: r.testName || (testMatch && testMatch.testName) || '',
            parameter: r.parameter || r.parameterName || r.parameterName,
            value: r.value,
            flag: r.flag || 'normal'
          };
        });

        setPatientData(normalized || null);
      } catch (err) {
        console.error('usePatient fetch error', err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  return { patient: patientData, isLoading, error };
};
