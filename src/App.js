import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';
import ProtectedRoute from './Component/common/ProtectedRoute';
import Login from './Component/Auth/Login';
import Dashboard from './Component/Dashboard/Dashboard';
import DashboardHome from './Component/Dashboard/DashboardHome';
import PatientManagementEnhanced from './Component/Dashboard/PatientManagementEnhanced';
import InvoiceManagementNew from './Component/Dashboard/InvoiceManagementNew';
import ReportManagementEnhanced from './Component/Pages/ReportPage/ReportManagementEnhanced';
import SettingsManagementEnhanced from './Component/Pages/SettingsPage/SettingsManagementEnhanced';
import TestManagement from './Component/Dashboard/TestManagement';
import LoadingSpinner from './Component/common/LoadingSpinner';

// Report Components
import ReportForm from './Component/Pages/ReportPage/ReportForm';
import Report from './Component/Pages/ReportPage/report';

import './App.css';
import ViewPatient from './Component/Dashboard/ViewPatient';

// MUI Theme Creator Component
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
            borderRadius: appTheme.borderRadius.md,
            backgroundColor: appTheme.colors.surface,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: appTheme.borderRadius.md,
              backgroundColor: appTheme.colors.inputBackground,
              '& fieldset': {
                borderColor: appTheme.colors.inputBorder,
              },
              '&:hover fieldset': {
                borderColor: appTheme.colors.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: appTheme.colors.primary,
              },
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: appTheme.borderRadius.lg,
            boxShadow: appTheme.shadows.sm,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: appTheme.colors.surfaceSecondary,
          },
        },
      },
    },
    shape: {
      borderRadius: parseInt(appTheme.borderRadius.md),
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

function AppContent() {
  return (
    <div className="App">
      <AuthProvider>
        <MuiThemeCreator>
          <Box sx={{ minHeight: '100vh' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              {/* Nested Dashboard Routes */}
              <Route index element={<DashboardHome />} />
              <Route 
                path="patients" 
                element={
                  <ProtectedRoute allowedRoles={["master", "admin", "doctor", "technician", "receptionist"]}>
                    <PatientManagementEnhanced />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="invoices" 
                element={
                  <ProtectedRoute allowedRoles={["master", "admin", "receptionist"]}>
                    <InvoiceManagementNew />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="tests" 
                element={
                  <ProtectedRoute allowedRoles={["master", "admin", "doctor", "technician"]}>
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <TestManagement />
                    </React.Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="analytics" 
                element={
                  <ProtectedRoute allowedRoles={["master", "admin"]}>
                    <div style={{ padding: '20px' }}>
                      <h2>Analytics Dashboard</h2>
                      <p>Analytics dashboard coming soon...</p>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="profile" 
                element={
                  <div style={{ padding: '20px' }}>
                    <h2>User Profile</h2>
                    <p>Profile management coming soon...</p>
                  </div>
                } 
              />
              <Route 
                path="settings"
                  element={
                  <ProtectedRoute allowedRoles={["master", "admin"]}>
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <SettingsManagementEnhanced/>
                    </React.Suspense>
                  </ProtectedRoute>
                } 
              />
              {/* Reports Management - New comprehensive system */}
              <Route 
                path="reports" 
                element={
                  <ProtectedRoute allowedRoles={["master", "admin", "doctor", "technician"]}>
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <ReportManagementEnhanced />
                    </React.Suspense>
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Individual Report Entry Page (outside Dashboard layout) */}
            <Route 
              path="/report/:id" 
              element={
                <ProtectedRoute allowedRoles={["master", "admin", "doctor", "technician"]}>
                  <React.Suspense fallback={<LoadingSpinner />}>
                    <Report />
                  </React.Suspense>
                </ProtectedRoute>
              } 
            />

            {/* Report Create/Edit Form (outside Dashboard layout) */}
            <Route 
              path="/report/create/:id" 
              element={
                <ProtectedRoute allowedRoles={["master", "admin", "doctor", "technician"]}>
                  <React.Suspense fallback={<LoadingSpinner />}>
                    <ReportForm />
                  </React.Suspense>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/report/edit/:reportId" 
              element={
                <ProtectedRoute allowedRoles={["master", "admin", "doctor", "technician"]}>
                  <React.Suspense fallback={<LoadingSpinner />}>
                    <ReportForm />
                  </React.Suspense>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/report/view/:reportId" 
              element={
                <ProtectedRoute allowedRoles={["master", "admin", "doctor", "technician", "receptionist"]}>
                  <React.Suspense fallback={<LoadingSpinner />}>
                    <Report />
                  </React.Suspense>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/view"
              element={
                <ProtectedRoute allowedRoles={["master", "admin", "doctor", "technician", "receptionist"]}>
                  <React.Suspense fallback={<LoadingSpinner />}>
                    <ViewPatient />
                  </React.Suspense>
                </ProtectedRoute>
              } 
            />

            {/* Default Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Box>
      </MuiThemeCreator>
    </AuthProvider>
  </div>
  );
}

// Main App component with ThemeProvider
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
