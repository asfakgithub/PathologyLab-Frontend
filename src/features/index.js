/**
 * Features Index - Central Export Hub
 * =================================
 * 
 * This file provides a centralized export point for all feature modules
 * in the PathologyLab application. It follows a feature-based architecture
 * where each domain (auth, dashboard, patients, etc.) is self-contained.
 * 
 * Architecture:
 * - Each feature exports its main components, hooks, and services
 * - Clean separation of concerns between features
 * - Simplified import statements throughout the application
 * 
 * Usage:
 * import { AuthProvider, LoginForm } from '../features';
 * 
 * Created: July 31, 2025
 * Author: PathologyLab Development Team
 */

// Authentication Feature
export * from './auth';

// Dashboard Feature
export * from './dashboard';

// Patient Management Feature
export * from './patients';

// Invoice Management Feature
export * from './invoices';

// Report Management Feature
export * from './reports';

// Settings Management Feature
export * from './settings';

// Test Management Feature
export * from './tests';
