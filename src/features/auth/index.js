/**
 * Authentication Feature Index
 * ===========================
 * 
 * Central export point for all authentication-related components,
 * providers, hooks, and services.
 * 
 * Exports:
 * - AuthProvider: Main authentication context provider
 * - Login components and forms
 * - Authentication hooks and utilities
 */

// Context and Providers
export { default as AuthProvider } from './providers/AuthProvider';

// Components
export { default as LoginForm } from './components/LoginForm';
export { default as AuthGuard } from './components/AuthGuard';

// Hooks
export { default as useAuth } from './hooks/useAuth';

// Services
export * from './services/authService';
