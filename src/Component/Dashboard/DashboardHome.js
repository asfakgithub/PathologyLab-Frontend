import React, { useState, useEffect, useContext, useMemo } from 'react';
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
import { SettingsContext } from '../../context/SettingsContext';
import api, { getPatientStats, getReportStats, getInvoiceStats, getPatients, getReports } from '../../services/api';
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
  const { settings } = useContext(SettingsContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    patients: { total: 0, change: 0 },
    tests: { total: 0, change: 0 },
    invoices: { total: 0, totalAmount: 0, totalDue: 0, pendingCount: 0, change: 0 },
    revenue: { total: 0, change: 0 }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [testStats, setTestStats] = useState({});
  
  const widgetVisibility = useMemo(() => 
    (settings.dashboard || []).reduce((acc, widget) => {
      acc[widget.widgetKey] = widget.isVisible;
      return acc;
    }, {}),
    [settings.dashboard]
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch multiple stats in parallel
      const [pStatRes, rStatRes, invStatRes, recentPatientsRes, recentReportsRes, messagesRes] = await Promise.all([
        getPatientStats().catch(e => ({ data: {} })),
        getReportStats().catch(e => ({ data: {} })),
        getInvoiceStats().catch(e => ({ data: {} })),
        getPatients({ page: 1, limit: 5 }).catch(e => ({ data: { data: [] } })),
        getReports({ page: 1, limit: 5 }).catch(e => ({ data: { data: [] } })),
        api.get('/messages', { params: { page: 1, limit: 1 } }).catch(e => ({ unreadCount: 0 }))
      ]);

      // Parse responses (api wrapper returns different shapes in some helpers)
      const patientStats = pStatRes?.data?.stats || pStatRes?.stats || { total: 0 };
      const reportStats = rStatRes?.data?.stats || rStatRes?.stats || {};
      const invoiceStats = invStatRes?.data?.stats || invStatRes?.stats || { totalInvoices: 0, totalAmount: 0 };
      const recentPatients = recentPatientsRes?.data?.data || recentPatientsRes?.data || [];
      const recentReports = recentReportsRes?.data?.data || recentReportsRes?.data || [];
      const unreadMessages = messagesRes?.unreadCount ?? messagesRes?.data?.unreadCount ?? 0;

      setStats({
        patients: { total: patientStats.totalPatients ?? patientStats.total ?? 0, change: patientStats.change ?? 0 },
        tests: { total: reportStats.total ?? reportStats.totalReports ?? 0, change: reportStats.change ?? 0 },
        invoices: {
          total: invoiceStats.totalInvoices ?? invoiceStats.total ?? 0,
          totalAmount: invoiceStats.totalAmount ?? 0,
          totalPaid: invoiceStats.totalPaid ?? 0,
          totalDue: invoiceStats.totalDue ?? 0,
          pendingCount: invoiceStats.pendingInvoices ?? 0,
          change: invoiceStats.change ?? 0
        },
        revenue: { total: invoiceStats.totalAmount ?? 0, change: invoiceStats.revenueChange ?? 0 }
      });

      // Build recent activities from recent patients/reports/invoices
      const activities = [];
      recentPatients.forEach(p => activities.push({ type: 'patient', description: `New patient: ${p.name || p.patientName || p.patientId || p.phone || 'Unknown'}`, timestamp: new Date(p.createdAt || p.createdAt).toLocaleString(), status: 'completed' }));
      recentReports.forEach(r => activities.push({ type: 'test', description: `Report: ${r.title || r.reportId || r._id}`, timestamp: new Date(r.createdAt || r.createdAt).toLocaleString(), status: r.status || 'pending' }));

      setRecentActivities(activities.slice(0, 10));

      // testStats: use reportStats breakdown if available
      const testOverview = {
        completed: { count: reportStats.completed ?? 0, percentage: reportStats.total ? Math.round(((reportStats.completed || 0) / reportStats.total) * 100) : 0 },
        pending: { count: reportStats.pending ?? 0, percentage: reportStats.total ? Math.round(((reportStats.pending || 0) / reportStats.total) * 100) : 0 },
        in_progress: { count: reportStats.in_progress ?? 0, percentage: reportStats.total ? Math.round(((reportStats.in_progress || 0) / reportStats.total) * 100) : 0 }
      };

      setTestStats(testOverview);

      // set unread messages as an analytic card
      setStats(prev => ({ ...prev, messages: { total: unreadMessages, change: 0 } }));
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
        {widgetVisibility.patient_stats && 
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
        }
        
        {widgetVisibility.tests_conducted_stats && 
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
        }
        
        {hasAnyRole(['master', 'admin', 'receptionist']) && widgetVisibility.invoices_stats && (
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

        {hasAnyRole(['master', 'admin', 'receptionist']) && widgetVisibility.revenue_chart && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Invoice Value"
              value={`₹${(stats.invoices.totalAmount || 0).toLocaleString()}`}
              icon={<TrendingUpIcon />}
              color="#6a1b9a"
              change={0}
              changeText=""
            />
          </Grid>
        )}

        {hasAnyRole(['master', 'admin', 'receptionist']) && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Due"
              value={`₹${(stats.invoices.totalDue || 0).toLocaleString()}`}
              icon={<ScheduleIcon />}
              color="#d32f2f"
              change={0}
              changeText=""
            />
          </Grid>
        )}

        {hasAnyRole(['master', 'admin', 'receptionist']) && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Invoices"
              value={(stats.invoices.pendingCount || 0).toLocaleString()}
              icon={<PendingIcon />}
              color="#ff9800"
              change={0}
              changeText=""
            />
          </Grid>
        )}
      </Grid>

      {/* Charts and Activity */}
      <Grid container spacing={3}>
        {widgetVisibility.recent_reports && 
          <Grid item xs={12} md={8}>
            <RecentActivity 
              activities={recentActivities}
              loading={false}
            />
          </Grid>
        }
        
        {widgetVisibility.test_status_chart && 
          <Grid item xs={12} md={4}>
            <TestStatusChart 
              testStats={testStats}
              loading={false}
            />
          </Grid>
        }
      </Grid>
    </Box>
  );
};

export default DashboardHome;