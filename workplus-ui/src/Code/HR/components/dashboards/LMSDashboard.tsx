import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Grid,
  Card,
  CardContent,
  Container,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonIcon from '@mui/icons-material/Person';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../Common/components/DashboardLayout';
import { 
  sectionTitleStyles, 
  cardStyles
} from '../../../../theme/styleUtils';
import { useHRService, LeaveRequest, LeaveBalance } from '../../services/hrService';
import dayjs from 'dayjs';

interface LMSDashboardProps {
  embedded?: boolean; // When true, don't wrap in DashboardLayout and don't show back button
}

const LMSDashboard: React.FC<LMSDashboardProps> = ({ embedded = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const hrService = useHRService();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  
  // Dashboard statistics state
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalLeaveDays: 0,
    averageLeaveBalance: 0,
    chartData: {
      requestTrends: [] as any[],
      statusDistribution: [] as any[],
      leaveTypeUsage: [] as any[],
      monthlyTrends: [] as any[]
    }
  });

  // Chart container styles
  const chartContainerStyles = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    mb: 2
  };
  
  const chartBoxStyles = {
    width: '100%', 
    height: 280
  };

  // Fetch leave data
  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const requestsData = await hrService.getLeaveRequests();
      const balancesData = await hrService.getLeaveBalance(1); // Using workerId 1 as example
      
      setLeaveRequests(requestsData);
      setLeaveBalances(balancesData);
      calculateStatistics(requestsData, balancesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching leave data:', err);
      setError('Failed to load leave data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from the data
  const calculateStatistics = (requests: LeaveRequest[], balances: LeaveBalance[]) => {
    if (!requests.length && !balances.length) {
      setStats({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalLeaveDays: 0,
        averageLeaveBalance: 0,
        chartData: {
          requestTrends: [],
          statusDistribution: [],
          leaveTypeUsage: [],
          monthlyTrends: []
        }
      });
      return;
    }

    // Basic counts
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'Pending').length;
    const approvedRequests = requests.filter(r => r.status === 'Approved').length;
    const rejectedRequests = requests.filter(r => r.status === 'Rejected').length;

    // Calculate total leave days (from approved requests)
    const totalLeaveDays = requests
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + r.totalDays, 0);

    // Calculate average leave balance
    const averageLeaveBalance = balances.length > 0 
      ? balances.reduce((sum, b) => sum + b.balance, 0) / balances.length 
      : 0;

    // Daily request trends (last 7 days)
    const requestTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'days');
      const dateStr = date.format('YYYY-MM-DD');
      const dayRequests = requests.filter(request => 
        dayjs(request.appliedDate).format('YYYY-MM-DD') === dateStr
      );
      
      requestTrends.push({
        date: date.format('MM/DD'),
        requests: dayRequests.length,
        approved: dayRequests.filter(r => r.status === 'Approved').length,
        pending: dayRequests.filter(r => r.status === 'Pending').length,
        rejected: dayRequests.filter(r => r.status === 'Rejected').length
      });
    }

    // Status distribution for pie chart
    const statusDistribution = [
      { id: 0, value: pendingRequests, label: 'Pending', color: theme.palette.warning.main },
      { id: 1, value: approvedRequests, label: 'Approved', color: theme.palette.success.main },
      { id: 2, value: rejectedRequests, label: 'Rejected', color: theme.palette.error.main }
    ].filter(item => item.value > 0);

    // Leave type usage analysis
    const leaveTypeStats = new Map();
    requests.forEach(request => {
      const leaveType = request.leaveTypeName;
      if (!leaveTypeStats.has(leaveType)) {
        leaveTypeStats.set(leaveType, {
          name: leaveType,
          requests: 0,
          totalDays: 0,
          approved: 0
        });
      }
      const stats = leaveTypeStats.get(leaveType);
      stats.requests++;
      stats.totalDays += request.totalDays;
      if (request.status === 'Approved') {
        stats.approved++;
      }
    });

    const leaveTypeUsage = Array.from(leaveTypeStats.values())
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 8);

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const month = dayjs().subtract(i, 'months');
      const monthStr = month.format('YYYY-MM');
      const monthRequests = requests.filter(request => 
        dayjs(request.appliedDate).format('YYYY-MM') === monthStr
      );
      
      monthlyTrends.push({
        month: month.format('MMM'),
        requests: monthRequests.length,
        totalDays: monthRequests
          .filter(r => r.status === 'Approved')
          .reduce((sum, r) => sum + r.totalDays, 0)
      });
    }

    setStats({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalLeaveDays,
      averageLeaveBalance,
      chartData: {
        requestTrends,
        statusDistribution,
        leaveTypeUsage,
        monthlyTrends
      }
    });
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    fetchLeaveData();
  };

  // Navigate back to reports landing
  const handleBack = () => {
    navigate('/hr/reports');
  };

  // Calculate recent activity
  const recentActivity = useMemo(() => {
    if (!leaveRequests.length) return [];
    
    return leaveRequests
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
      .slice(0, 10)
      .map(request => ({
        id: request.id,
        workerName: request.workerName,
        action: `${request.status} - ${request.leaveTypeName}`,
        time: dayjs(request.appliedDate).format('HH:mm'),
        date: dayjs(request.appliedDate).format('DD/MM'),
        status: request.status,
        days: request.totalDays,
        icon: request.status === 'Approved' ? <CheckCircleIcon /> : 
              request.status === 'Pending' ? <PendingIcon /> : <CancelIcon />
      }));
  }, [leaveRequests]);

  // Generate alerts
  const alerts = useMemo(() => {
    const alertList = [];
    
    if (stats.pendingRequests > 10) {
      alertList.push({
        type: 'warning',
        message: `${stats.pendingRequests} leave requests pending approval`,
        icon: <PendingIcon />
      });
    }
    
    // Check for workers with low leave balance
    const lowBalanceWorkers = leaveBalances.filter(b => b.balance < 2).length;
    if (lowBalanceWorkers > 0) {
      alertList.push({
        type: 'info',
        message: `${lowBalanceWorkers} workers have low leave balance (< 2 days)`,
        icon: <WarningIcon />
      });
    }
    
    if (stats.approvedRequests > stats.totalRequests * 0.8) {
      alertList.push({
        type: 'success',
        message: `High approval rate: ${((stats.approvedRequests / stats.totalRequests) * 100).toFixed(1)}%`,
        icon: <TrendingUpIcon />
      });
    }
    
    return alertList;
  }, [stats, leaveBalances]);

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Approved':
        return { icon: <CheckCircleIcon />, color: 'success' };
      case 'Pending':
        return { icon: <PendingIcon />, color: 'warning' };
      case 'Rejected':
        return { icon: <CancelIcon />, color: 'error' };
      default:
        return { icon: <PendingIcon />, color: 'default' };
    }
  };

  if (loading) {
    const loadingContent = (
      <Container maxWidth={embedded ? false : "xl"} sx={{ mt: embedded ? 0 : 9, mb: 4, px: embedded ? 0 : 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );

    return embedded ? loadingContent : <DashboardLayout>{loadingContent}</DashboardLayout>;
  }

  const dashboardContent = (
    <Container maxWidth={embedded ? false : "xl"} sx={{ mt: embedded ? 0 : 9, mb: 4, px: embedded ? 0 : 3 }}>
      {/* Header Section */}
      {!embedded && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ ...sectionTitleStyles(theme), mb: 0, flexGrow: 1 }}>
            Leave Management Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert, index) => (
            <Alert key={index} severity={alert.type as any} sx={{ mb: 1 }}>
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Summary Statistics Cards */}
        <Grid item xs={6} sm={6} md={3}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.totalRequests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All leave requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pending Approval
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pendingRequests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting decision
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Approved Requests
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.approvedRequests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.totalRequests > 0 ? ((stats.approvedRequests / stats.totalRequests) * 100).toFixed(1) : 0}% approval rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Leave Days
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.totalLeaveDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Request Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Leave Request Trends (Last 7 Days)</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {stats.chartData.requestTrends.length > 0 ? (
                <Box sx={chartBoxStyles}>
                  <LineChart
                    series={[
                      {
                        data: stats.chartData.requestTrends.map(item => item.requests),
                        label: 'Total Requests',
                        color: theme.palette.primary.main,
                      },
                      {
                        data: stats.chartData.requestTrends.map(item => item.approved),
                        label: 'Approved',
                        color: theme.palette.success.main,
                      },
                      {
                        data: stats.chartData.requestTrends.map(item => item.pending),
                        label: 'Pending',
                        color: theme.palette.warning.main,
                      }
                    ]}
                    xAxis={[{
                      scaleType: 'band',
                      data: stats.chartData.requestTrends.map(item => item.date),
                    }]}
                    height={280}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '200px' 
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No request trend data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Request Status Distribution</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {stats.chartData.statusDistribution.length > 0 ? (
                <Box sx={chartBoxStyles}>
                  <PieChart
                    series={[
                      {
                        data: stats.chartData.statusDistribution,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        faded: { innerRadius: 30, additionalRadius: -30 },
                      },
                    ]}
                    height={280}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '200px' 
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No status distribution data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Type Usage */}
        <Grid item xs={12} lg={6}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Leave Type Usage</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {stats.chartData.leaveTypeUsage.length > 0 ? (
                <Box sx={chartBoxStyles}>
                  <BarChart
                    series={[
                      {
                        data: stats.chartData.leaveTypeUsage.map(item => item.requests),
                        label: 'Requests',
                        color: theme.palette.primary.main,
                      },
                      {
                        data: stats.chartData.leaveTypeUsage.map(item => item.approved),
                        label: 'Approved',
                        color: theme.palette.success.main,
                      }
                    ]}
                    xAxis={[{
                      scaleType: 'band',
                      data: stats.chartData.leaveTypeUsage.map(item => item.name),
                    }]}
                    height={280}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '200px' 
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No leave type usage data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={6}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Recent Leave Requests</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {recentActivity.length > 0 ? (
                <TableContainer sx={{ maxHeight: 280 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Worker</TableCell>
                        <TableCell>Request</TableCell>
                        <TableCell align="right">Days</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentActivity.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24 }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Typography variant="body2">
                                {activity.workerName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={activity.action}>
                              <Chip
                                label={activity.status}
                                size="small"
                                color={getStatusInfo(activity.status).color as any}
                                icon={getStatusInfo(activity.status).icon}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {activity.days}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {activity.date}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '200px' 
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent activity available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12} lg={6}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Monthly Leave Trends</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {stats.chartData.monthlyTrends.length > 0 ? (
                <Box sx={chartBoxStyles}>
                  <BarChart
                    series={[
                      {
                        data: stats.chartData.monthlyTrends.map(item => item.requests),
                        label: 'Requests',
                        color: theme.palette.primary.main,
                      },
                      {
                        data: stats.chartData.monthlyTrends.map(item => item.totalDays),
                        label: 'Total Days',
                        color: theme.palette.secondary.main,
                      }
                    ]}
                    xAxis={[{
                      scaleType: 'band',
                      data: stats.chartData.monthlyTrends.map(item => item.month),
                    }]}
                    height={280}
                  />
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '200px' 
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No monthly trend data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Balance Summary */}
        <Grid item xs={12} lg={6}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Leave Balance Summary</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {leaveBalances.length > 0 ? (
                <TableContainer sx={{ maxHeight: 280 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Worker</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Balance</TableCell>
                        <TableCell align="right">Used</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaveBalances.slice(0, 8).map((balance) => (
                        <TableRow key={`${balance.workerId}-${balance.leaveTypeId}`}>
                          <TableCell>
                            <Typography variant="body2">
                              {balance.workerName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={balance.leaveTypeName}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              color={balance.balance < 2 ? 'error' : 'success.main'}
                            >
                              {balance.balance}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {balance.used}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '200px' 
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No leave balance data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );

  return embedded ? dashboardContent : <DashboardLayout>{dashboardContent}</DashboardLayout>;
};

export default LMSDashboard; 