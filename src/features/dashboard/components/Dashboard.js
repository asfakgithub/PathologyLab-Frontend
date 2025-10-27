import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Science as ScienceIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Assessment as ReportsIcon,
  AccountCircle,
  Logout,
  Notifications,
  Person
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasAnyRole } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/dashboard/profile');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['master', 'admin', 'doctor', 'technician', 'receptionist']
    },
    {
      text: 'Patients',
      icon: <PeopleIcon />,
      path: '/dashboard/patients',
      roles: ['master', 'admin', 'doctor', 'technician', 'receptionist']
    },
    {
      text: 'Tests',
      icon: <ScienceIcon />,
      path: '/dashboard/tests',
      roles: ['master', 'admin', 'doctor', 'technician']
    },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      path: '/dashboard/reports',
      roles: ['master', 'admin', 'doctor', 'technician']
    },
    {
      text: 'Invoices',
      icon: <ReceiptIcon />,
      path: '/dashboard/invoices',
      roles: ['master', 'admin', 'receptionist']
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/dashboard/analytics',
      roles: ['master', 'admin']
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/dashboard/settings',
      roles: ['master', 'admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    hasAnyRole(item.roles)
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'master': return 'error';
      case 'admin': return 'warning';
      case 'doctor': return 'success';
      case 'technician': return 'info';
      case 'receptionist': return 'default';
      default: return 'default';
    }
  };

  const drawer = (
    <Box>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          PathologyLab
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Professional Lab Management
        </Typography>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Avatar 
          sx={{ 
            width: 56, 
            height: 56, 
            mx: 'auto', 
            mb: 1,
            bgcolor: 'primary.main'
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="medium">
          {user?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {user?.email}
        </Typography>
        <Chip 
          label={user?.role?.toUpperCase()}
          size="small"
          color={getRoleColor(user?.role)}
          variant="outlined"
        />
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ px: 1, py: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  }
                }
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0,0,0,0.1)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'grey.50'
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
