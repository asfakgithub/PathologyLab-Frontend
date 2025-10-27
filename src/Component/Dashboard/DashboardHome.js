import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Science as ScienceIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
// import { getDashboardStats } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const StatCard = ({ title, value, icon, color, change, changeText }) => (
  <Card 
    sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15, ${color}25)`,
      border: `1px solid ${color}40`,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      }
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h3" fontWeight="bold" color={color}>
            {value}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
          {change && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon 
                sx={{ 
                  fontSize: 16, 
                  mr: 0.5,
                  color: change > 0 ? 'success.main' : 'error.main'
                }} 
              />
              <Typography 
                variant="caption" 
                color={change > 0 ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {change > 0 ? '+' : ''}{change}% {changeText}
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const RecentActivity = ({ activities, loading }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
      <Typography variant="h6" fontWeight="bold">
        Recent Activities
      </Typography>
      <IconButton size="small">
        <RefreshIcon />
      </IconButton>
    </Box>
    
    {loading ? (
      <LoadingSpinner />
    ) : (
      <List>
        {activities.slice(0, 5).map((activity, index) => (
          <ListItem key={index} sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {activity.type === 'patient' && <PeopleIcon fontSize="small" />}
                {activity.type === 'test' && <ScienceIcon fontSize="small" />}
                {activity.type === 'invoice' && <ReceiptIcon fontSize="small" />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.description}
              secondary={activity.timestamp}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            <Chip
              label={activity.status}
              size="small"
              color={
                activity.status === 'completed' ? 'success' :
                activity.status === 'pending' ? 'warning' : 'default'
              }
              variant="outlined"
            />
          </ListItem>
        ))}
      </List>
    )}
  </Paper>
);

const TestStatusChart = ({ testStats, loading }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Typography variant="h6" fontWeight="bold" mb={2}>
      Test Status Overview
    </Typography>
    
    {loading ? (
      <LoadingSpinner />
    ) : (
      <Box>
        {Object.entries(testStats).map(([status, data]) => (
          <Box key={status} mb={2}>
            <Box display="flex" alignItems="center" justifyContent="between" mb={1}>
              <Box display="flex" alignItems="center">
                {status === 'completed' && <CheckCircleIcon color="success" sx={{ mr: 1 }} />}
                {status === 'pending' && <PendingIcon color="warning" sx={{ mr: 1 }} />}
                {status === 'in_progress' && <ScheduleIcon color="info" sx={{ mr: 1 }} />}
                <Typography variant="body2" fontWeight="medium">
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {data.count} ({data.percentage}%)
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={data.percentage} 
              color={
                status === 'completed' ? 'success' :
                status === 'pending' ? 'warning' : 'info'
              }
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        ))}
      </Box>
    )}
  </Paper>
);

const DashboardHome = () => {
  const { user, hasAnyRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    patients: { total: 0, change: 0 },
    tests: { total: 0, change: 0 },
    invoices: { total: 0, change: 0 },
    revenue: { total: 0, change: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [testStats, setTestStats] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
        // const response = await getDashboardStats();
        // if (response.data.success) {
        //   setStats(response.data.data.stats);
        //   setRecentActivities(response.data.data.recentActivities || []);
        //   setTestStats(response.data.data.testStats || {});
        // }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
      // Set dummy data for demonstration
      setStats({
        patients: { total: 1250, change: 12.5 },
        tests: { total: 3420, change: 8.3 },
        invoices: { total: 2180, change: -2.1 },
        revenue: { total: 125000, change: 15.7 }
      });
      setRecentActivities([
        {
          type: 'patient',
          description: 'New patient registered: John Doe',
          timestamp: '2 minutes ago',
          status: 'completed'
        },
        {
          type: 'test',
          description: 'Blood test completed for Patient #1234',
          timestamp: '15 minutes ago',
          status: 'completed'
        },
        {
          type: 'invoice',
          description: 'Invoice #INV-001 generated',
          timestamp: '1 hour ago',
          status: 'pending'
        }
      ]);
      setTestStats({
        completed: { count: 150, percentage: 65 },
        pending: { count: 50, percentage: 22 },
        in_progress: { count: 30, percentage: 13 }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's what's happening at your lab today.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} - Showing demo data
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={stats.patients.total.toLocaleString()}
            icon={<PeopleIcon />}
            color="#1976d2"
            change={stats.patients.change}
            changeText="this month"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tests Conducted"
            value={stats.tests.total.toLocaleString()}
            icon={<ScienceIcon />}
            color="#2e7d32"
            change={stats.tests.change}
            changeText="this month"
          />
        </Grid>
        
        {hasAnyRole(['master', 'admin', 'receptionist']) && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Invoices"
              value={stats.invoices.total.toLocaleString()}
              icon={<ReceiptIcon />}
              color="#ed6c02"
              change={stats.invoices.change}
              changeText="this month"
            />
          </Grid>
        )}
        
        {hasAnyRole(['master', 'admin']) && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Revenue"
              value={`$${(stats.revenue.total / 1000).toFixed(1)}K`}
              icon={<TrendingUpIcon />}
              color="#9c27b0"
              change={stats.revenue.change}
              changeText="this month"
            />
          </Grid>
        )}
      </Grid>

      {/* Charts and Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <RecentActivity 
            activities={recentActivities}
            loading={false}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TestStatusChart 
            testStats={testStats}
            loading={false}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
