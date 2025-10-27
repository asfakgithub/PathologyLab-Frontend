/**
 * =========================================
 * PATHOLOGY LAB - MAIN ENTRY POINT
 * =========================================
 * 
 * Professional React Application Entry Point
 * Created: July 31, 2025
 * 
 * This file serves as the main entry point for the PathologyLab application.
 * It follows React best practices and maintains a clean, professional structure.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// ========================================
// MAIN APPLICATION COMPONENT
// ========================================
import App from './App_new';

// ========================================
// GLOBAL STYLES
// ========================================
import './shared/styles/index.css';
import './shared/styles/theme.css';

// ========================================
// PERFORMANCE MONITORING
// ========================================
import reportWebVitals from './reportWebVitals';

// ========================================
// APPLICATION SETUP
// ========================================

// Create root element for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render application with providers and routing
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// ========================================
// PERFORMANCE MEASUREMENT
// ========================================

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// ========================================
// DEVELOPMENT NOTES
// ========================================

/*
 * ARCHITECTURE OVERVIEW:
 * 
 * /src
 *   /core                    - Core application logic
 *     /providers            - Context providers (Auth, Theme, etc.)
 *     /hooks               - Custom hooks
 *   
 *   /shared                 - Shared/common components and utilities
 *     /components          - Reusable components
 *     /styles             - Global styles and themes
 *     /assets             - Images, fonts, static files
 *     /utils              - Utility functions
 *   
 *   /features              - Feature-based modules
 *     /auth               - Authentication feature
 *     /dashboard          - Dashboard feature
 *     /patients           - Patient management feature
 *     /invoices          - Invoice management feature
 *     /reports           - Report management feature
 *     /settings          - Settings feature
 *     /tests             - Test management feature
 *   
 *   /services             - API services and external integrations
 * 
 * BENEFITS:
 * - Clear separation of concerns
 * - Feature-based organization for scalability
 * - Shared components for reusability
 * - Professional structure for maintainability
 * - Easy to understand and navigate
 */
