/**
 * Main Services Index
 * Central export point for all API services
 */

// Base API Client
export { default as apiClient } from './apiClient';

// Authentication Services
export * from './auth';

// Patient Management Services
export * from './patient';

// Invoice Management Services
export * from './invoice';

// Test Management Services
export * from './test';

// Report Management Services
export * from './report';

// Settings Management Services
export * from './settings';

// Legacy services (for backward compatibility)
export { default as api } from './api';
export { default as authService } from './authService';

/**
 * Usage Examples:
 * 
 * // Import specific API
 * import { authAPI } from '../services';
 * 
 * // Import multiple APIs
 * import { authAPI, patientAPI, invoiceAPI } from '../services';
 * 
 * // Import base client for custom calls
 * import { apiClient } from '../services';
 * 
 * // Use the APIs
 * const response = await authAPI.login(credentials);
 * const patients = await patientAPI.getAllPatients();
 * const invoices = await invoiceAPI.getAllInvoices();
 */
