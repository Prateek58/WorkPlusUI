import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
  Grid,
  Card,
  CardContent,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import { 
  cardStyles
} from '../../../../theme/styleUtils';
import { useHRService, LeaveRequest, LeaveBalance, LeaveType } from '../../services/hrService';
import dayjs from 'dayjs';

interface LeaveAnalyticsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const LeaveAnalyticsDialog: React.FC<LeaveAnalyticsDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const hrService = useHRService();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [tabValue, setTabValue] = useState(0);

  // Fetch leave data
  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const [requestsData, balancesData, typesData] = await Promise.all([
        hrService.getLeaveRequests(),
        hrService.getLeaveBalance(1), // Sample worker ID - in real app, fetch for all workers
        hrService.getLeaveTypes()
      ]);
      
      setLeaveRequests(requestsData);
      setLeaveBalances(balancesData);
      setLeaveTypes(typesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching leave data:', err);
      setError('Failed to load leave analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLeaveData();
    }
  }, [open]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!leaveRequests.length) return null;

    const currentYearRequests = leaveRequests.filter(req => 
      dayjs(req.appliedDate).year() === selectedYear
    );

    // Basic statistics
    const totalRequests = currentYearRequests.length;
    const approvedRequests = currentYearRequests.filter(r => r.status === 'Approved').length;
    const pendingRequests = currentYearRequests.filter(r => r.status === 'Pending').length;
    const rejectedRequests = currentYearRequests.filter(r => r.status === 'Rejected').length;
    const approvalRate = totalRequests > 0 ? (approvedRequests / totalRequests) * 100 : 0;

    // Leave type distribution
    const leaveTypeStats = new Map();
    currentYearRequests.forEach(request => {
      const type = request.leaveTypeName || 'Unknown';
      if (!leaveTypeStats.has(type)) {
        leaveTypeStats.set(type, {
          name: type,
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          totalDays: 0
        });
      }
      const stats = leaveTypeStats.get(type);
      stats.total++;
      stats.totalDays += request.totalDays;
      if (request.status === 'Approved') stats.approved++;
      if (request.status === 'Rejected') stats.rejected++;
      if (request.status === 'Pending') stats.pending++;
    });

    const leaveTypeDistribution = Array.from(leaveTypeStats.values());

    // Monthly trends
    const monthlyTrends = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = dayjs().year(selectedYear).month(month).startOf('month');
      const monthEnd = dayjs().year(selectedYear).month(month).endOf('month');
      
      const monthRequests = currentYearRequests.filter(req => {
        const reqDate = dayjs(req.appliedDate);
        return reqDate.isAfter(monthStart) && reqDate.isBefore(monthEnd);
      });

      monthlyTrends.push({
        month: monthStart.format('MMM'),
        total: monthRequests.length,
        approved: monthRequests.filter(r => r.status === 'Approved').length,
        rejected: monthRequests.filter(r => r.status === 'Rejected').length,
        totalDays: monthRequests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.totalDays, 0)
      });
    }

    // Peak periods analysis
    const monthlyRequestCounts = monthlyTrends.map(m => ({ month: m.month, count: m.total }));
    const peakMonth = monthlyRequestCounts.reduce((peak, current) => 
      current.count > peak.count ? current : peak, { month: 'None', count: 0 });

    // Day of week analysis
    const dayOfWeekStats = new Map();
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => {
      dayOfWeekStats.set(day, 0);
    });

    currentYearRequests.forEach(req => {
      const startDay = dayjs(req.startDate).format('dddd');
      dayOfWeekStats.set(startDay, dayOfWeekStats.get(startDay) + 1);
    });

    const dayOfWeekDistribution = Array.from(dayOfWeekStats.entries()).map(([day, count]) => ({
      day, count
    }));

    // Average leave duration by type
    const avgDurationByType = leaveTypeDistribution.map(type => ({
      ...type,
      avgDuration: type.approved > 0 ? type.totalDays / type.approved : 0
    }));

    // Recent patterns (last 3 months)
    const recent3Months = dayjs().subtract(3, 'months');
    const recentRequests = currentYearRequests.filter(req => 
      dayjs(req.appliedDate).isAfter(recent3Months)
    );

    const recentTrend = recentRequests.length;
    const previousPeriodStart = dayjs().subtract(6, 'months');
    const previousPeriodEnd = dayjs().subtract(3, 'months');
    const previousRequests = currentYearRequests.filter(req => {
      const reqDate = dayjs(req.appliedDate);
      return reqDate.isAfter(previousPeriodStart) && reqDate.isBefore(previousPeriodEnd);
    });

    const trendDirection = recentTrend > previousRequests.length ? 'up' : 
                          recentTrend < previousRequests.length ? 'down' : 'stable';

    return {
      totalRequests,
      approvedRequests,
      pendingRequests,
      rejectedRequests,
      approvalRate,
      leaveTypeDistribution,
      monthlyTrends,
      peakMonth,
      dayOfWeekDistribution,
      avgDurationByType,
      trendDirection,
      recentTrend: ((recentTrend - previousRequests.length) / Math.max(previousRequests.length, 1)) * 100
    };
  }, [leaveRequests, selectedYear]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { height: '95vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="div">
            📊 Leave Analytics & Insights
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[2022, 2023, 2024, 2025].map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress size={60} />
          </Box>
        ) : analyticsData ? (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={cardStyles(theme)}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <BeachAccessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary.main">
                      {analyticsData.totalRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Requests {selectedYear}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={cardStyles(theme)}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" color="success.main">
                      {analyticsData.approvalRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approval Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={cardStyles(theme)}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <EventIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h4" color="info.main">
                      {analyticsData.peakMonth.month}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Peak Leave Month
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={cardStyles(theme)}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    {analyticsData.trendDirection === 'up' ? (
                      <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    ) : analyticsData.trendDirection === 'down' ? (
                      <TrendingDownIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    ) : (
                      <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    )}
                    <Typography variant="h4" color={
                      analyticsData.trendDirection === 'up' ? 'warning.main' : 
                      analyticsData.trendDirection === 'down' ? 'success.main' : 'info.main'
                    }>
                      {analyticsData.recentTrend.toFixed(0)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      3-Month Trend
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tabs for different analytics views */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Trends & Patterns" />
                <Tab label="Leave Type Analysis" />
                <Tab label="Seasonal Insights" />
                <Tab label="Performance Metrics" />
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Monthly Trends */}
                <Grid item xs={12} md={8}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Monthly Leave Request Trends
                      </Typography>
                      <Box sx={{ width: '100%', height: 400 }}>
                        <LineChart
                          series={[
                            {
                              data: analyticsData.monthlyTrends.map(item => item.total),
                              label: 'Total Requests',
                              color: theme.palette.primary.main,
                            },
                            {
                              data: analyticsData.monthlyTrends.map(item => item.approved),
                              label: 'Approved',
                              color: theme.palette.success.main,
                            }
                          ]}
                          xAxis={[{
                            scaleType: 'band',
                            data: analyticsData.monthlyTrends.map(item => item.month),
                          }]}
                          height={400}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Status Distribution */}
                <Grid item xs={12} md={4}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Request Status Distribution
                      </Typography>
                      <Box sx={{ width: '100%', height: 400 }}>
                        <PieChart
                          series={[
                            {
                              data: [
                                { id: 0, value: analyticsData.approvedRequests, label: 'Approved', color: theme.palette.success.main },
                                { id: 1, value: analyticsData.pendingRequests, label: 'Pending', color: theme.palette.warning.main },
                                { id: 2, value: analyticsData.rejectedRequests, label: 'Rejected', color: theme.palette.error.main }
                              ].filter(item => item.value > 0),
                              highlightScope: { faded: 'global', highlighted: 'item' },
                              faded: { innerRadius: 30, additionalRadius: -30 },
                            },
                          ]}
                          height={400}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {/* Leave Type Usage */}
                <Grid item xs={12} md={8}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Leave Type Usage Analysis
                      </Typography>
                      <Box sx={{ width: '100%', height: 400 }}>
                        <BarChart
                          series={[
                            {
                              data: analyticsData.leaveTypeDistribution.map(item => item.approved),
                              label: 'Approved Requests',
                              color: theme.palette.success.main,
                            },
                            {
                              data: analyticsData.leaveTypeDistribution.map(item => item.rejected),
                              label: 'Rejected Requests',
                              color: theme.palette.error.main,
                            }
                          ]}
                          xAxis={[{
                            scaleType: 'band',
                            data: analyticsData.leaveTypeDistribution.map(item => item.name),
                          }]}
                          height={400}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Average Duration by Type */}
                <Grid item xs={12} md={4}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Average Duration by Type
                      </Typography>
                      <TableContainer sx={{ maxHeight: 350 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Leave Type</TableCell>
                              <TableCell align="right">Avg Days</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analyticsData.avgDurationByType.map((type, index) => (
                              <TableRow key={index}>
                                <TableCell>{type.name}</TableCell>
                                <TableCell align="right">
                                  {type.avgDuration.toFixed(1)}
                                </TableCell>
                                <TableCell align="right">
                                  {type.approved}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {/* Day of Week Analysis */}
                <Grid item xs={12} md={6}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Leave Start Day Preferences
                      </Typography>
                      <Box sx={{ width: '100%', height: 350 }}>
                        <BarChart
                          series={[
                            {
                              data: analyticsData.dayOfWeekDistribution.map(item => item.count),
                              label: 'Requests Started',
                              color: theme.palette.secondary.main,
                            }
                          ]}
                          xAxis={[{
                            scaleType: 'band',
                            data: analyticsData.dayOfWeekDistribution.map(item => item.day.substr(0, 3)),
                          }]}
                          height={350}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Monthly Leave Days */}
                <Grid item xs={12} md={6}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Monthly Leave Days Approved
                      </Typography>
                      <Box sx={{ width: '100%', height: 350 }}>
                        <BarChart
                          series={[
                            {
                              data: analyticsData.monthlyTrends.map(item => item.totalDays),
                              label: 'Total Days',
                              color: theme.palette.info.main,
                            }
                          ]}
                          xAxis={[{
                            scaleType: 'band',
                            data: analyticsData.monthlyTrends.map(item => item.month),
                          }]}
                          height={350}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Seasonal Insights */}
                <Grid item xs={12}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Seasonal Leave Insights
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Alert severity="info">
                            <strong>Peak Month:</strong> {analyticsData.peakMonth.month} with {analyticsData.peakMonth.count} requests
                          </Alert>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Alert severity="success">
                            <strong>Approval Rate:</strong> {analyticsData.approvalRate.toFixed(1)}% overall approval rate
                          </Alert>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Alert severity="warning">
                            <strong>Trend Alert:</strong> {Math.abs(analyticsData.recentTrend).toFixed(0)}% {analyticsData.trendDirection} in recent requests
                          </Alert>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Alert severity="info">
                            <strong>Most Popular:</strong> {analyticsData.leaveTypeDistribution[0]?.name || 'N/A'} leave type
                          </Alert>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                {/* Performance Metrics Table */}
                <Grid item xs={12}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Leave Type Performance Metrics
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Leave Type</TableCell>
                              <TableCell align="right">Total Requests</TableCell>
                              <TableCell align="right">Approved</TableCell>
                              <TableCell align="right">Approval Rate</TableCell>
                              <TableCell align="right">Avg Duration</TableCell>
                              <TableCell align="right">Total Days</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {analyticsData.leaveTypeDistribution.map((type, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Chip label={type.name} variant="outlined" />
                                </TableCell>
                                <TableCell align="right">{type.total}</TableCell>
                                <TableCell align="right">{type.approved}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={`${((type.approved / type.total) * 100).toFixed(1)}%`}
                                    color={((type.approved / type.total) * 100) >= 80 ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  {(type.totalDays / Math.max(type.approved, 1)).toFixed(1)} days
                                </TableCell>
                                <TableCell align="right">{type.totalDays}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No leave analytics data available for the selected year.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={fetchLeaveData} disabled={loading} startIcon={<RefreshIcon />}>
          Refresh Data
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveAnalyticsDialog; 