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
  LinearProgress
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
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TimerIcon from '@mui/icons-material/Timer';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../Common/components/DashboardLayout';
import { 
  sectionTitleStyles, 
  cardStyles
} from '../../../../theme/styleUtils';
import { useHRService, AttendanceRecord } from '../../services/hrService';
import dayjs from 'dayjs';

interface AttendanceDashboardProps {
  embedded?: boolean; // When true, don't wrap in DashboardLayout and don't show back button
}

const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ embedded = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const hrService = useHRService();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  // Dashboard statistics state
  const [stats, setStats] = useState({
    totalWorkers: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
    attendanceRate: 0,
    chartData: {
      dailyTrends: [] as any[],
      statusDistribution: [] as any[],
      workerAttendance: [] as any[],
      shiftAnalysis: [] as any[]
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

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const attendanceData = await hrService.getAttendance();
      setAttendanceRecords(attendanceData);
      calculateStatistics(attendanceData);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from the data
  const calculateStatistics = (data: AttendanceRecord[]) => {
    if (!data.length) {
      setStats({
        totalWorkers: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        onLeaveToday: 0,
        attendanceRate: 0,
        chartData: {
          dailyTrends: [],
          statusDistribution: [],
          workerAttendance: [],
          shiftAnalysis: []
        }
      });
      return;
    }

    const today = dayjs().format('YYYY-MM-DD');
    const todayRecords = data.filter(record => 
      dayjs(record.attendanceDate).format('YYYY-MM-DD') === today
    );

    // Basic counts for today
    const presentToday = todayRecords.filter(r => r.status === 'Present').length;
    const absentToday = todayRecords.filter(r => r.status === 'Absent').length;
    const lateToday = todayRecords.filter(r => r.status === 'Late').length;
    const onLeaveToday = todayRecords.filter(r => r.status === 'On Leave').length;

    // Get unique workers
    const uniqueWorkers = new Set(data.map(r => r.workerId));
    const totalWorkers = uniqueWorkers.size;

    // Calculate attendance rate
    const attendanceRate = totalWorkers > 0 ? (presentToday / totalWorkers) * 100 : 0;

    // Daily trends (last 7 days)
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'days');
      const dateStr = date.format('YYYY-MM-DD');
      const dayRecords = data.filter(record => 
        dayjs(record.attendanceDate).format('YYYY-MM-DD') === dateStr
      );
      
      dailyTrends.push({
        date: date.format('MM/DD'),
        present: dayRecords.filter(r => r.status === 'Present').length,
        absent: dayRecords.filter(r => r.status === 'Absent').length,
        late: dayRecords.filter(r => r.status === 'Late').length,
        onLeave: dayRecords.filter(r => r.status === 'On Leave').length
      });
    }

    // Status distribution for pie chart
    const statusDistribution = [
      { id: 0, value: presentToday, label: 'Present', color: theme.palette.success.main },
      { id: 1, value: absentToday, label: 'Absent', color: theme.palette.error.main },
      { id: 2, value: lateToday, label: 'Late', color: theme.palette.warning.main },
      { id: 3, value: onLeaveToday, label: 'On Leave', color: theme.palette.info.main }
    ].filter(item => item.value > 0);

    // Worker attendance summary (top 10 workers by attendance)
    const workerStats = new Map();
    data.forEach(record => {
      const workerId = record.workerId;
      if (!workerStats.has(workerId)) {
        workerStats.set(workerId, {
          workerId,
          workerName: record.workerName,
          present: 0,
          absent: 0,
          late: 0,
          onLeave: 0,
          total: 0
        });
      }
      const worker = workerStats.get(workerId);
      if (record.status === 'Present') worker.present++;
      if (record.status === 'Absent') worker.absent++;
      if (record.status === 'Late') worker.late++;
      if (record.status === 'On Leave') worker.onLeave++;
      worker.total++;
    });

    const workerAttendance = Array.from(workerStats.values())
      .map(worker => ({
        ...worker,
        attendanceRate: worker.total > 0 ? (worker.present / worker.total) * 100 : 0
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 10);

    // Shift analysis
    const morningShift = data.filter(r => {
      const checkIn = r.checkInTime;
      if (!checkIn) return false;
      const hour = parseInt(checkIn.split(':')[0]);
      return hour >= 6 && hour < 14; // 6 AM to 2 PM
    }).length;

    const eveningShift = data.filter(r => {
      const checkIn = r.checkInTime;
      if (!checkIn) return false;
      const hour = parseInt(checkIn.split(':')[0]);
      return hour >= 14 && hour < 22; // 2 PM to 10 PM
    }).length;

    const nightShift = data.filter(r => {
      const checkIn = r.checkInTime;
      if (!checkIn) return false;
      const hour = parseInt(checkIn.split(':')[0]);
      return hour >= 22 || hour < 6; // 10 PM to 6 AM
    }).length;

    const shiftAnalysis = [
      { shift: 'Morning', count: morningShift, percentage: data.length > 0 ? (morningShift / data.length) * 100 : 0 },
      { shift: 'Evening', count: eveningShift, percentage: data.length > 0 ? (eveningShift / data.length) * 100 : 0 },
      { shift: 'Night', count: nightShift, percentage: data.length > 0 ? (nightShift / data.length) * 100 : 0 }
    ];

    setStats({
      totalWorkers,
      presentToday,
      absentToday,
      lateToday,
      onLeaveToday,
      attendanceRate,
      chartData: {
        dailyTrends,
        statusDistribution,
        workerAttendance,
        shiftAnalysis
      }
    });
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Refresh data
  const handleRefresh = () => {
    fetchAttendanceData();
  };

  // Navigate back to reports landing
  const handleBack = () => {
    navigate('/hr/reports');
  };

  // Calculate recent activity
  const recentActivity = useMemo(() => {
    if (!attendanceRecords.length) return [];
    
    return attendanceRecords
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 10)
      .map(record => ({
        id: record.id,
        workerName: record.workerName,
        action: `Marked ${record.status}`,
        time: record.createdAt ? dayjs(record.createdAt).format('HH:mm') : 'Unknown',
        status: record.status,
        icon: <EventAvailableIcon />
      }));
  }, [attendanceRecords]);

  // Generate alerts
  const alerts = useMemo(() => {
    const alertList = [];
    
    if (stats.absentToday > stats.totalWorkers * 0.2) {
      alertList.push({
        type: 'error',
        message: `High absenteeism today: ${stats.absentToday} workers absent`,
        icon: <WarningIcon />
      });
    }
    
    if (stats.lateToday > stats.totalWorkers * 0.1) {
      alertList.push({
        type: 'warning',
        message: `${stats.lateToday} workers arrived late today`,
        icon: <TimerIcon />
      });
    }
    
    if (stats.attendanceRate > 95) {
      alertList.push({
        type: 'success',
        message: `Excellent attendance rate: ${stats.attendanceRate.toFixed(1)}%`,
        icon: <TrendingUpIcon />
      });
    }
    
    return alertList;
  }, [stats]);

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
            Attendance Dashboard
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
                Total Workers
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.totalWorkers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registered workers
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Present Today
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.presentToday}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.attendanceRate.toFixed(1)}% attendance rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Absent Today
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.absentToday}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Workers not present
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                On Leave
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.onLeaveToday}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved leave
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Daily Attendance Trends (Last 7 Days)</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {stats.chartData.dailyTrends.length > 0 ? (
                <Box sx={chartBoxStyles}>
                  <LineChart
                    series={[
                      {
                        data: stats.chartData.dailyTrends.map(item => item.present),
                        label: 'Present',
                        color: theme.palette.success.main,
                      },
                      {
                        data: stats.chartData.dailyTrends.map(item => item.absent),
                        label: 'Absent',
                        color: theme.palette.error.main,
                      },
                      {
                        data: stats.chartData.dailyTrends.map(item => item.late),
                        label: 'Late',
                        color: theme.palette.warning.main,
                      }
                    ]}
                    xAxis={[{
                      scaleType: 'band',
                      data: stats.chartData.dailyTrends.map(item => item.date),
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
                    No attendance trend data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Today's Status Distribution</Typography>
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

        {/* Worker Attendance Performance */}
        <Grid item xs={12} lg={6}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Top Performers (Attendance Rate)</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {stats.chartData.workerAttendance.length > 0 ? (
                <TableContainer sx={{ maxHeight: 250 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Worker</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">Present</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.chartData.workerAttendance.slice(0, 8).map((worker) => (
                        <TableRow key={worker.workerId}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24 }}>
                                <PersonIcon fontSize="small" />
                              </Avatar>
                              <Typography variant="body2">
                                {worker.workerName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${worker.attendanceRate.toFixed(1)}%`}
                              size="small"
                              color={worker.attendanceRate >= 90 ? 'success' : 
                                     worker.attendanceRate >= 75 ? 'warning' : 'error'}
                            />
                          </TableCell>
                          <TableCell align="right">{worker.present}</TableCell>
                          <TableCell align="right">{worker.total}</TableCell>
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
                    No worker performance data available
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
                <Typography variant="h6">Recent Activity</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {recentActivity.length > 0 ? (
                <TableContainer sx={{ maxHeight: 250 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Worker</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell align="right">Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentActivity.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {activity.workerName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={activity.action}
                              size="small"
                              color={activity.status === 'Present' ? 'success' : 
                                     activity.status === 'Absent' ? 'error' : 
                                     activity.status === 'Late' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {activity.time}
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

        {/* Shift Analysis */}
        <Grid item xs={12}>
          <Card sx={cardStyles(theme)}>
            <CardContent>
              <Box sx={chartContainerStyles}>
                <Typography variant="h6">Shift Distribution Analysis</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Box>
              {stats.chartData.shiftAnalysis.length > 0 ? (
                <Grid container spacing={3}>
                  {stats.chartData.shiftAnalysis.map((shift, index) => (
                    <Grid item xs={12} sm={4} key={shift.shift}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {shift.count}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          {shift.shift} Shift
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={shift.percentage}
                          color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'warning'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {shift.percentage.toFixed(1)}% of total
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '200px' 
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No shift analysis data available
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

export default AttendanceDashboard; 