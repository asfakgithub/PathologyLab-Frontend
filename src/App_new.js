/**
 * =========================================
 * PATHOLOGY LAB - FRONTEND APPLICATION
 * =========================================
 * 
 * Professional React Application Structure
 * Created: July 31, 2025
 * 
 * Architecture Overview:
 * - Component-based architecture with clear separation of concerns
 * - Feature-based folder organization
 * - Reusable components and utilities
 * - Centralized state management
 * - Professional theming system
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

// ========================================
// CORE PROVIDERS
// ========================================
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
// import { NotificationProvider } from './core/providers/NotificationProvider';

// ========================================
// HOOKS
// ========================================
import { useTheme } from './context/ThemeContext';

// ========================================
// COMPONENTS - COMMON
// ========================================
import ProtectedRoute from './Component/common/ProtectedRoute';
import LoadingSpinner from './Component/common/LoadingSpinner';
import Layout from './shared/components/Layout';
import Navbar from './Component/Navbar';

// ========================================
// FEATURES - AUTHENTICATION
// ========================================
import Login from './Component/Auth/Login';

// ========================================
// FEATURES - DASHBOARD
// ========================================
import Dashboard from './Component/Dashboard/Dashboard';
import DashboardHome from './Component/Dashboard/DashboardHome';

// ========================================
// FEATURES - PATIENTS
// ========================================
import PatientManagementEnhanced from './Component/Dashboard/PatientManagementEnhanced';
import PatientEntryAndTestSelection from './Component/Dashboard/PatientEntryAndTestSelection';

// ========================================
// FEATURES - INVOICES
// ========================================
import InvoiceManagementNew from './Component/Dashboard/InvoiceManagementNew';

// ========================================
// FEATURES - REPORTS
// ========================================
import ReportManagementEnhanced from './Component/Pages/ReportPage/ReportManagementEnhanced';
import ReportManagementProfessional from './Component/Pages/ReportPage/ReportManagementProfessional';
import ReportForm from './Component/Pages/ReportPage/ReportForm';
import ReportDemoIntegration from './features/reports/components/ReportDemoIntegration';

// ========================================
// FEATURES - SETTINGS
// ========================================
import SettingsManagementEnhanced from './Component/Pages/SettingsPage/SettingsManagementEnhanced';

// ========================================
// FEATURES - TESTS
// ========================================
import TestManagement from './Component/Dashboard/TestManagement';

// ========================================
// FEATURES - STATUS
// ========================================
// import StatusPage from './features/status/components/StatusPage'; // COMMENTED: Not in active use

// ========================================
// LEGACY COMPONENTS (COMMENTED OUT)
// ========================================
// import Report from './features/reports/components/report'; // LEGACY: Replaced by enhanced components

// ========================================
// STYLES
// ========================================
import './App.css';

/**
 * MUI Theme Creator Component
 * Integrates our custom theme system with Material-UI
 */
const MuiThemeCreator = ({ children }) => {
  const { theme: appTheme } = useTheme();
  
  const muiTheme = createTheme({
    palette: {
      mode: appTheme.name === 'Light' ? 'light' : 'dark',
      primary: {
        main: appTheme.colors.primary,
        light: appTheme.colors.primaryLight,
        dark: appTheme.colors.primaryDark,
      },
      secondary: {
        main: appTheme.colors.secondary,
        light: appTheme.colors.secondaryLight,
        dark: appTheme.colors.secondaryDark,
      },
      background: {
        default: appTheme.colors.background,
        paper: appTheme.colors.surface,
      },
      text: {
        primary: appTheme.colors.text,
        secondary: appTheme.colors.textSecondary,
      },
      error: {
        main: appTheme.colors.error,
      },
      warning: {
        main: appTheme.colors.warning,
      },
      info: {
        main: appTheme.colors.info,
      },
      success: {
        main: appTheme.colors.success,
      },
    },
    typography: {
      fontFamily: appTheme.typography.fontFamily,
      h4: {
        fontWeight: appTheme.typography.fontWeight.semibold,
        fontSize: appTheme.typography.fontSize.h4,
      },
      h5: {
        fontWeight: appTheme.typography.fontWeight.semibold,
        fontSize: appTheme.typography.fontSize.h5,
      },
      h6: {
        fontWeight: appTheme.typography.fontWeight.semibold,
        fontSize: appTheme.typography.fontSize.h6,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: appTheme.borderRadius.md,
            fontWeight: appTheme.typography.fontWeight.medium,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: appTheme.shadows.md,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: appTheme.borderRadius.lg,
            boxShadow: appTheme.shadows.sm,
            backgroundColor: appTheme.colors.cardBackground,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: appTheme.shadows.md,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: appTheme.colors.surface,
            borderRadius: appTheme.borderRadius.md,
          },
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

/**
 * Main Application Component
 * Entry point for the PathologyLab application
 */
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MuiThemeCreator>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Routes>
                {/* ========================================
                    PUBLIC ROUTES
                    ======================================== */}
                <Route path="/login" element={<Login />} />
                
                {/* ========================================
                    PROTECTED ROUTES
                    ======================================== */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  {/* Dashboard Home */}
                  <Route index element={<DashboardHome />} />
                  
                  {/* Patient Management */}
                  <Route path="patients" element={<PatientManagementEnhanced />} />
                  <Route path="patients/entry" element={<PatientEntryAndTestSelection />} />
                  
                  {/* Invoice Management */}
                  <Route path="invoices" element={<InvoiceManagementNew />} />
                  
                  {/* Report Management */}
                  <Route path="reports" element={<ReportDemoIntegration />} />
                  <Route path="reports/professional" element={<ReportManagementProfessional />} />
                  <Route path="reports/enhanced" element={<ReportManagementEnhanced />} />
                  <Route path="reports/form" element={<ReportForm />} />
                  <Route path="reports/demo" element={<ReportDemoIntegration />} />
                  
                  {/* Test Management */}
                  <Route path="tests" element={<TestManagement />} />
                  
                  {/* Settings */}
                  <Route path="settings" element={<SettingsManagementEnhanced />} />
                  
                  {/* Status Page - Commented out as not in active use */}
                  {/* <Route path="status" element={<StatusPage />} /> */}
                </Route>
                
                {/* ========================================
                    FALLBACK ROUTES
                    ======================================== */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </MuiThemeCreator>
        </ThemeProvider>
      </AuthProvider>
    );
  };

export default App;
