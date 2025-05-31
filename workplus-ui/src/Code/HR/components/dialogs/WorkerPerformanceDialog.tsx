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
  Avatar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import StarIcon from '@mui/icons-material/Star';
import WarningIcon from '@mui/icons-material/Warning';
import { 
  cardStyles
} from '../../../../theme/styleUtils';
import { useHRService, AttendanceRecord, LeaveRequest, Worker } from '../../services/hrService';
import dayjs from 'dayjs';

interface WorkerPerformanceDialogProps {
  open: boolean;
  onClose: () => void;
}

interface WorkerPerformanceData {
  worker: Worker;
  attendanceRate: number;
  totalDaysWorked: number;
  totalAbsent: number;
  totalLate: number;
  totalLeavesTaken: number;
  leaveBalance: number;
  performanceScore: number;
  monthlyAttendance: Array<{
    month: string;
    present: number;
    absent: number;
    rate: number;
  }>;
  leavePattern: Array<{
    type: string;
    days: number;
    frequency: number;
  }>;
}

const WorkerPerformanceDialog: React.FC<WorkerPerformanceDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const hrService = useHRService();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [performanceData, setPerformanceData] = useState<WorkerPerformanceData[]>([]);

  // Fetch workers data
  const fetchWorkers = async () => {
    try {
      const workersData = await hrService.getWorkers();
      setWorkers(workersData);
      if (workersData.length > 0 && !selectedWorkerId) {
        setSelectedWorkerId(workersData[0].workerId);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('Failed to load workers data.');
    }
  };

  // Fetch performance data
  const fetchPerformanceData = async () => {
    if (!selectedWorkerId) return;
    
    setLoading(true);
    try {
      const [attendanceData, leaveData, leaveBalanceData] = await Promise.all([
        hrService.getAttendance(undefined, selectedWorkerId),
        hrService.getLeaveRequests(selectedWorkerId),
        hrService.getLeaveBalance(selectedWorkerId)
      ]);

      // Calculate performance metrics
      const worker = workers.find(w => w.workerId === selectedWorkerId)!;
      const totalDays = attendanceData.length;
      const presentDays = attendanceData.filter(a => a.status === 'Present').length;
      const absentDays = attendanceData.filter(a => a.status === 'Absent').length;
      const lateDays = attendanceData.filter(a => a.status === 'Late').length;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      // Leave metrics
      const approvedLeaves = leaveData.filter(l => l.status === 'Approved');
      const totalLeavesTaken = approvedLeaves.reduce((sum, l) => sum + l.totalDays, 0);
      const leaveBalance = leaveBalanceData.reduce((sum, b) => sum + b.balance, 0);

      // Performance score calculation (0-100)
      let performanceScore = 0;
      performanceScore += Math.min(attendanceRate, 100) * 0.6; // 60% weight for attendance
      performanceScore += Math.max(0, (100 - (totalLeavesTaken / 30) * 100)) * 0.2; // 20% weight for leave utilization
      performanceScore += Math.max(0, (100 - (lateDays / totalDays) * 100)) * 0.2; // 20% weight for punctuality

      // Monthly attendance trends (last 6 months)
      const monthlyAttendance = [];
      for (let i = 5; i >= 0; i--) {
        const month = dayjs().subtract(i, 'months');
        const monthStr = month.format('YYYY-MM');
        const monthData = attendanceData.filter(a => 
          dayjs(a.attendanceDate).format('YYYY-MM') === monthStr
        );
        const present = monthData.filter(a => a.status === 'Present').length;
        const absent = monthData.filter(a => a.status === 'Absent').length;
        const rate = monthData.length > 0 ? (present / monthData.length) * 100 : 0;

        monthlyAttendance.push({
          month: month.format('MMM'),
          present,
          absent,
          rate
        });
      }

      // Leave pattern analysis
      const leaveTypeStats = new Map();
      approvedLeaves.forEach(leave => {
        const type = leave.leaveTypeName || 'Unknown';
        if (!leaveTypeStats.has(type)) {
          leaveTypeStats.set(type, { days: 0, frequency: 0 });
        }
        const stats = leaveTypeStats.get(type);
        stats.days += leave.totalDays;
        stats.frequency += 1;
      });

      const leavePattern = Array.from(leaveTypeStats.entries()).map(([type, stats]) => ({
        type,
        days: stats.days,
        frequency: stats.frequency
      }));

      const workerPerformance: WorkerPerformanceData = {
        worker,
        attendanceRate,
        totalDaysWorked: presentDays,
        totalAbsent: absentDays,
        totalLate: lateDays,
        totalLeavesTaken,
        leaveBalance,
        performanceScore,
        monthlyAttendance,
        leavePattern
      };

      setPerformanceData([workerPerformance]);
      setError(null);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError('Failed to load performance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchWorkers();
    }
  }, [open]);

  useEffect(() => {
    if (selectedWorkerId && open) {
      fetchPerformanceData();
    }
  }, [selectedWorkerId, open]);

  const currentWorkerData = performanceData[0];

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'error';
  };

  const getPerformanceRating = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="div">
            👤 Worker Performance Analytics
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Worker Selection */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Worker</InputLabel>
            <Select
              value={selectedWorkerId || ''}
              label="Select Worker"
              onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
            >
              {workers.map((worker) => (
                <MenuItem key={worker.workerId} value={worker.workerId}>
                  {worker.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress size={60} />
          </Box>
        ) : currentWorkerData ? (
          <Grid container spacing={3}>
            {/* Performance Overview */}
            <Grid item xs={12}>
              <Card sx={cardStyles(theme)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{currentWorkerData.worker.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Performance Analysis
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color={`${getPerformanceColor(currentWorkerData.performanceScore)}.main`}>
                        {currentWorkerData.performanceScore.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Performance Score
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip
                    icon={<StarIcon />}
                    label={getPerformanceRating(currentWorkerData.performanceScore)}
                    color={getPerformanceColor(currentWorkerData.performanceScore) as any}
                    sx={{ mb: 2 }}
                  />
                  
                  <LinearProgress
                    variant="determinate"
                    value={currentWorkerData.performanceScore}
                    color={getPerformanceColor(currentWorkerData.performanceScore) as any}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Key Metrics */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EventAvailableIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {currentWorkerData.attendanceRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attendance Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" color="primary.main">
                    {currentWorkerData.totalDaysWorked}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Days Worked
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <BeachAccessIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {currentWorkerData.totalLeavesTaken}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Leave Days Used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <WarningIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    {currentWorkerData.totalLate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late Days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Attendance Trends */}
            <Grid item xs={12} md={8}>
              <Card sx={cardStyles(theme)}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Monthly Attendance Trends
                  </Typography>
                  {currentWorkerData.monthlyAttendance.length > 0 ? (
                    <Box sx={{ width: '100%', height: 300 }}>
                      <LineChart
                        series={[
                          {
                            data: currentWorkerData.monthlyAttendance.map(item => item.rate),
                            label: 'Attendance Rate (%)',
                            color: theme.palette.primary.main,
                          }
                        ]}
                        xAxis={[{
                          scaleType: 'band',
                          data: currentWorkerData.monthlyAttendance.map(item => item.month),
                        }]}
                        height={300}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No attendance trend data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Leave Pattern Analysis */}
            <Grid item xs={12} md={4}>
              <Card sx={cardStyles(theme)}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Leave Usage Pattern
                  </Typography>
                  {currentWorkerData.leavePattern.length > 0 ? (
                    <Box>
                      {currentWorkerData.leavePattern.map((pattern, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2">{pattern.type}</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {pattern.days} days ({pattern.frequency} requests)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(pattern.days / currentWorkerData.totalLeavesTaken) * 100}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No leave pattern data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Insights */}
            <Grid item xs={12}>
              <Card sx={cardStyles(theme)}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Performance Insights & Recommendations
                  </Typography>
                  <Grid container spacing={2}>
                    {currentWorkerData.attendanceRate >= 95 && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity="success" sx={{ mb: 1 }}>
                          <strong>Excellent Attendance:</strong> Consistent presence with {currentWorkerData.attendanceRate.toFixed(1)}% attendance rate.
                        </Alert>
                      </Grid>
                    )}
                    {currentWorkerData.attendanceRate < 80 && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity="warning" sx={{ mb: 1 }}>
                          <strong>Attendance Concern:</strong> Below target attendance rate. Consider support or counseling.
                        </Alert>
                      </Grid>
                    )}
                    {currentWorkerData.totalLate > 5 && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity="info" sx={{ mb: 1 }}>
                          <strong>Punctuality:</strong> {currentWorkerData.totalLate} late arrivals detected. Review scheduling flexibility.
                        </Alert>
                      </Grid>
                    )}
                    {currentWorkerData.leaveBalance > 15 && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity="info" sx={{ mb: 1 }}>
                          <strong>Leave Balance:</strong> High leave balance ({currentWorkerData.leaveBalance} days). Encourage work-life balance.
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : selectedWorkerId ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No performance data available for the selected worker.
          </Typography>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Please select a worker to view performance analytics.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={fetchPerformanceData} disabled={loading || !selectedWorkerId} startIcon={<RefreshIcon />}>
          Refresh Data
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkerPerformanceDialog; 