/**
 * Patients Feature Index
 * =====================
 * 
 * Central export point for all patient management components and services.
 */

// Main Patient Components
export { default as PatientManagement } from './components/PatientManagement';
export { default as PatientForm } from './components/PatientForm';
export { default as PatientList } from './components/PatientList';

// Patient Services
export * from './services/patientService';
