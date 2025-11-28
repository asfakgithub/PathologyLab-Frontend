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
        const fetched = payload.patient || payload;
        setPatientData(fetched || null);
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
