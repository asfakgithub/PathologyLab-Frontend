/**
 * Main Layout Component
 * ====================
 * 
 * Professional layout wrapper that provides consistent structure
 * across all pages of the PathologyLab application.
 * 
 * Features:
 * - Navigation bar integration
 * - Responsive layout design
 * - Content area management
 * - Theme integration
 * 
 * Author: PathologyLab Development Team
 * Created: July 31, 2025
 */

import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../../../Component/Navbar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'background.default' 
    }}>
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        p: { xs: 1, sm: 2, md: 3 },
        backgroundColor: 'background.default',
        overflow: 'auto'
      }}>
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default Layout;
