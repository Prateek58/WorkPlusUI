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
import WorkIcon from '@mui/icons-material/Work';
import TimerIcon from '@mui/icons-material/Timer';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../../Common/components/DashboardLayout';
import { 
  sectionTitleStyles, 
  cardStyles
} from '../../../../../theme/styleUtils';

// Import our existing service for data
import jobEntryReportService, { 
  JobEntryReport, 
  JobEntryFilter,
  FilterOptions
} from '../job-entries/jobEntryReportService';

const JobEntryDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawJobEntries, setRawJobEntries] = useState<JobEntryReport[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    jobs: [],
    workers: [],
    groups: [],
    entryTypes: []
  });
  
  // Dashboard statistics state
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalAmount: 0,
    totalHours: 0,
    averageEfficiency: 0,
    topWorkers: [] as any[],
    jobDistribution: [] as any[],
    timeAnalysis: {} as any,
    chartData: {
      workerPerformance: [] as any[],
      jobDistributionChart: [] as any[],
      dailyTrends: [] as any[],
      efficiencyAnalysis: [] as any[]
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

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get all data without pagination for dashboard calculations
      const filter: JobEntryFilter = {
        pageNumber: 1,
        pageSize: 1000 // Large number to get all recent data
      };
      
      const [reportData, filterData] = await Promise.all([
        jobEntryReportService.getFilteredJobEntriesReport(filter),
        jobEntryReportService.getFilterOptions()
      ]);
      
      setRawJobEntries(reportData.items);
      calculateStatistics(reportData.items);
      setFilterOptions(filterData);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from the data
  const calculateStatistics = (data: JobEntryReport[]) => {
    if (!data.length) {
      setStats({
        totalRecords: 0,
        totalAmount: 0,
        totalHours: 0,
        averageEfficiency: 0,
        topWorkers: [],
        jobDistribution: [],
        timeAnalysis: {},
        chartData: {
          workerPerformance: [],
          jobDistributionChart: [],
          dailyTrends: [],
          efficiencyAnalysis: []
        }
      });
      return;
    }

    // Basic totals
    const totalRecords = data.length;
    const totalAmount = data.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalHours = data.reduce((sum, item) => sum + (item.hoursTaken || item.expectedHours || 0), 0);
    
    // Worker performance analysis
    const workerStats = new Map();
    data.forEach(item => {
      if (item.workerName) {
        if (!workerStats.has(item.workerName)) {
          workerStats.set(item.workerName, {
            name: item.workerName,
            totalAmount: 0,
            totalHours: 0,
            jobCount: 0,
            efficiency: 0
          });
        }
        const worker = workerStats.get(item.workerName);
        worker.totalAmount += item.totalAmount || 0;
        worker.totalHours += item.hoursTaken || 0;
        worker.jobCount += 1;
        
        // Calculate efficiency (productive hours / total hours taken)
        if (item.hoursTaken && item.productiveHours) {
          worker.efficiency = (item.productiveHours / item.hoursTaken) * 100;
        }
      }
    });

    // Top 5 workers by total amount earned
    const topWorkers = Array.from(workerStats.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    // Job distribution
    const jobStats = new Map();
    data.forEach(item => {
      if (item.jobName) {
        jobStats.set(item.jobName, (jobStats.get(item.jobName) || 0) + 1);
      }
    });

    const jobDistribution = Array.from(jobStats.entries())
      .map(([job, count]) => ({ job, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Time analysis
    const morningShift = data.filter(item => !item.isPostLunch).length;
    const eveningShift = data.filter(item => item.isPostLunch).length;
    
    const averageEfficiency = totalHours > 0 ? (totalAmount / totalHours) : 0;

    // Prepare chart data
    const chartData = {
      // Worker performance for bar chart (top 10 workers)
      workerPerformance: Array.from(workerStats.values())
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10)
        .map(worker => ({
          worker: worker.name.length > 8 ? worker.name.substring(0, 8) + '...' : worker.name,
          earnings: worker.totalAmount,
          hours: worker.totalHours,
          jobs: worker.jobCount
        })),

      // Job distribution for pie chart
      jobDistributionChart: Array.from(jobStats.entries())
        .map(([job, count], index) => ({
          id: index,
          value: count,
          label: job.length > 12 ? job.substring(0, 12) + '...' : job
        }))
        .slice(0, 8), // Top 8 jobs for better visualization

      // Daily trends (group by entry date)
      dailyTrends: (() => {
        const dateStats = new Map();
        data.forEach(item => {
          const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown';
          if (!dateStats.has(date)) {
            dateStats.set(date, { amount: 0, hours: 0, count: 0 });
          }
          const stat = dateStats.get(date);
          stat.amount += item.totalAmount || 0;
          stat.hours += item.hoursTaken || 0;
          stat.count += 1;
        });
        
        return Array.from(dateStats.entries())
          .map(([date, stats]) => ({
            date: date,
            amount: stats.amount,
            hours: stats.hours,
            count: stats.count
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7); // Last 7 days
      })(),

      // Efficiency analysis (morning vs evening)
      efficiencyAnalysis: [
        {
          shift: 'Morning',
          entries: morningShift,
          percentage: totalRecords > 0 ? (morningShift / totalRecords) * 100 : 0
        },
        {
          shift: 'Evening',
          entries: eveningShift,
          percentage: totalRecords > 0 ? (eveningShift / totalRecords) * 100 : 0
        }
      ]
    };

    setStats({
      totalRecords,
      totalAmount,
      totalHours,
      averageEfficiency,
      topWorkers,
      jobDistribution,
      timeAnalysis: {
        morningShift,
        eveningShift,
        morningPercentage: totalRecords > 0 ? (morningShift / totalRecords) * 100 : 0,
        eveningPercentage: totalRecords > 0 ? (eveningShift / totalRecords) * 100 : 0
      },
      chartData
    });
  };

  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Navigate back to reports landing
  const handleBack = () => {
    navigate('/workplus/reports');
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Optimized data processing using useMemo
  const dashboardGrids = useMemo(() => {
    if (!rawJobEntries.length) return null;

    const today = new Date();
    const todayStr = today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    // Recent Activity Feed (last 10 entries)
    const recentActivity = rawJobEntries
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 10)
      .map(entry => ({
        worker: entry.workerName || 'Unknown',
        job: entry.jobName || 'Unknown',
        amount: entry.totalAmount || 0,
        hours: entry.hoursTaken || 0,
        time: entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString() : 'Unknown',
        efficiency: entry.hoursTaken && entry.expectedHours ? 
          Math.round((entry.expectedHours / entry.hoursTaken) * 100) : 0
      }));

    // Alerts & Warnings
    const alerts: { type: string; message: string; severity: string }[] = [];
    rawJobEntries.forEach(entry => {
      // Low efficiency alert
      if (entry.hoursTaken && entry.expectedHours && 
          (entry.hoursTaken > entry.expectedHours * 1.2)) {
        alerts.push({
          type: 'warning',
          message: `${entry.workerName} took ${entry.hoursTaken}h vs expected ${entry.expectedHours}h on ${entry.jobName}`,
          severity: 'high'
        });
      }
      // Missing data alert
      if (!entry.totalAmount || entry.totalAmount === 0) {
        alerts.push({
          type: 'error',
          message: `Missing amount data for ${entry.workerName} - ${entry.jobName}`,
          severity: 'medium'
        });
      }
    });

    // Quick Comparisons (Today vs Yesterday)
    const todayEntries = rawJobEntries.filter(entry => 
      entry.createdAt && new Date(entry.createdAt).toDateString() === todayStr
    );
    const yesterdayEntries = rawJobEntries.filter(entry => 
      entry.createdAt && new Date(entry.createdAt).toDateString() === yesterdayStr
    );

    const comparisons = {
      earnings: {
        today: todayEntries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0),
        yesterday: yesterdayEntries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)
      },
      hours: {
        today: todayEntries.reduce((sum, entry) => sum + (entry.hoursTaken || 0), 0),
        yesterday: yesterdayEntries.reduce((sum, entry) => sum + (entry.hoursTaken || 0), 0)
      },
      jobs: {
        today: todayEntries.length,
        yesterday: yesterdayEntries.length
      }
    };

    // Worker Status (based on recent activity)
    const workerStatus = new Map();
    filterOptions.workers.forEach(worker => {
      const recentWork = rawJobEntries
        .filter(entry => entry.workerName === worker.fullName)
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())[0];
      
      workerStatus.set(worker.fullName, {
        name: worker.fullName,
        currentJob: recentWork?.jobName || 'Available',
        lastActivity: recentWork?.createdAt ? 
          new Date(recentWork.createdAt).toLocaleTimeString() : 'No recent activity',
        status: recentWork ? 'working' : 'available'
      });
    });

    // Time Efficiency Analysis
    const timeEfficiency = rawJobEntries
      .filter(entry => entry.hoursTaken && entry.expectedHours)
      .map(entry => ({
        job: entry.jobName || 'Unknown',
        worker: entry.workerName || 'Unknown',
        expected: entry.expectedHours || 0,
        actual: entry.hoursTaken || 0,
        efficiency: Math.round(((entry.expectedHours || 0) / (entry.hoursTaken || 1)) * 100),
        variance: (entry.hoursTaken || 0) - (entry.expectedHours || 0)
      }))
      .sort((a, b) => a.efficiency - b.efficiency)
      .slice(0, 8);

    // Targets vs Actual (mock targets for demo)
    const totalEarnings = rawJobEntries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const totalHours = rawJobEntries.reduce((sum, entry) => sum + (entry.hoursTaken || 0), 0);
    const targets = {
      dailyEarnings: { target: 50000, actual: comparisons.earnings.today },
      weeklyEarnings: { target: 300000, actual: totalEarnings },
      dailyHours: { target: 80, actual: comparisons.hours.today },
      weeklyHours: { target: 500, actual: totalHours }
    };

    return {
      recentActivity,
      alerts: alerts.slice(0, 5), // Top 5 alerts
      comparisons,
      workerStatus: Array.from(workerStatus.values()).slice(0, 8),
      timeEfficiency,
      targets
    };
  }, [rawJobEntries, filterOptions]);

  if (loading) {
    return (
      <DashboardLayout>
        <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress size={60} />
          </Box>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 9, mb: 4 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ ...sectionTitleStyles(theme), mb: 0, flexGrow: 1 }}>
            Job Entry Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
            <IconButton>
              <FilterListIcon />
            </IconButton>
            <IconButton>
              <GetAppIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Dashboard Content */}
        <Grid container spacing={3}>
          {/* Summary Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Records
                </Typography>
                <Typography variant="h4" color="primary">
                  {stats.totalRecords.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Job entries processed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Earnings
                </Typography>
                <Typography variant="h4" color="success.main">
                  ₹{stats.totalAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total amount earned
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Hours
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.totalHours.toFixed(1)}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hours worked
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Avg. Rate
                </Typography>
                <Typography variant="h4" color="warning.main">
                  ₹{stats.averageEfficiency.toFixed(0)}/hr
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average hourly rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Workers Section */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performers
                </Typography>
                {stats.topWorkers.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {stats.topWorkers.map((worker, index) => (
                      <Box 
                        key={worker.name} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          py: 1,
                          borderBottom: index < stats.topWorkers.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            color={index === 0 ? 'warning' : index === 1 ? 'info' : 'default'}
                          />
                          <Typography variant="body1">{worker.name}</Typography>
                        </Box>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          ₹{worker.totalAmount.toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No worker data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Job Distribution Section */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Popular Jobs
                </Typography>
                {stats.jobDistribution.length > 0 ? (
                  <Box sx={{ mt: 2 }}>
                    {stats.jobDistribution.map((job, index) => (
                      <Box 
                        key={job.job} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          py: 1,
                          borderBottom: index < stats.jobDistribution.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                        }}
                      >
                        <Typography variant="body1">{job.job}</Typography>
                        <Chip 
                          label={`${job.count} entries`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No job data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Shift Analysis */}
          <Grid item xs={12}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shift Analysis
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {stats.timeAnalysis.morningShift || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Morning Shift Entries
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({(stats.timeAnalysis.morningPercentage || 0).toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="secondary">
                        {stats.timeAnalysis.eveningShift || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Evening Shift Entries
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({(stats.timeAnalysis.eveningPercentage || 0).toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {filterOptions.workers.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Workers
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total registered
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Interactive Charts Section */}
          
          {/* Worker Performance Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Box sx={chartContainerStyles}>
                  <Typography variant="h6">Worker Performance</Typography>
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
                {stats.chartData.workerPerformance.length > 0 ? (
                  <Box sx={chartBoxStyles}>
                    <BarChart
                      series={[
                        {
                          data: stats.chartData.workerPerformance.map(item => item.earnings),
                          label: 'Earnings (₹)',
                          color: theme.palette.primary.main,
                        },
                        {
                          data: stats.chartData.workerPerformance.map(item => item.hours),
                          label: 'Hours',
                          color: theme.palette.success.main,
                        }
                      ]}
                      xAxis={[{
                        scaleType: 'band',
                        data: stats.chartData.workerPerformance.map(item => item.worker),
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
                      No performance data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Job Distribution Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Box sx={chartContainerStyles}>
                  <Typography variant="h6">Job Distribution</Typography>
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
                {stats.chartData.jobDistributionChart.length > 0 ? (
                  <Box sx={chartBoxStyles}>
                    <PieChart
                      series={[
                        {
                          data: stats.chartData.jobDistributionChart,
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
                      No job distribution data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Daily Trends Line Chart */}
          <Grid item xs={12}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Box sx={chartContainerStyles}>
                  <Typography variant="h6">Daily Trends (Last 7 Days)</Typography>
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
                {stats.chartData.dailyTrends.length > 0 ? (
                  <Box sx={chartBoxStyles}>
                    <LineChart
                      series={[
                        {
                          data: stats.chartData.dailyTrends.map(item => item.amount),
                          label: 'Daily Earnings (₹)',
                          color: theme.palette.primary.main,
                        },
                        {
                          data: stats.chartData.dailyTrends.map(item => item.count),
                          label: 'Job Entries',
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
                      No daily trend data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Efficiency Analysis */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Box sx={chartContainerStyles}>
                  <Typography variant="h6">Shift Distribution</Typography>
                  <IconButton onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Box>
                {stats.chartData.efficiencyAnalysis.length > 0 ? (
                  <Box sx={chartBoxStyles}>
                    <BarChart
                      series={[
                        {
                          data: stats.chartData.efficiencyAnalysis.map(item => item.entries),
                          label: 'Entry Count',
                          color: theme.palette.secondary.main,
                        }
                      ]}
                      xAxis={[{
                        scaleType: 'band',
                        data: stats.chartData.efficiencyAnalysis.map(item => item.shift),
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
                      No shift analysis data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Summary Insights */}
          <Grid item xs={12} md={6}>
            <Card sx={cardStyles(theme)}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Insights
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Most Productive Worker
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {stats.topWorkers.length > 0 ? stats.topWorkers[0].name : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      ₹{stats.topWorkers.length > 0 ? stats.topWorkers[0].totalAmount.toLocaleString() : '0'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Most Popular Job
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {stats.jobDistribution.length > 0 ? stats.jobDistribution[0].job : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="info.main">
                      {stats.jobDistribution.length > 0 ? stats.jobDistribution[0].count : '0'} entries
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Peak Performance Time
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {stats.timeAnalysis.morningShift >= stats.timeAnalysis.eveningShift ? 'Morning' : 'Evening'} Shift
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      {Math.max(stats.timeAnalysis.morningShift, stats.timeAnalysis.eveningShift)} entries
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick-Look Data Grids Section */}
          {dashboardGrids && (
            <>
              {/* Alerts & Warnings Grid */}
              <Grid item xs={12} lg={6}>
                <Card sx={cardStyles(theme)}>
                  <CardContent>
                    <Box sx={chartContainerStyles}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="warning" />
                        <Typography variant="h6">Alerts & Warnings</Typography>
                      </Box>
                      <IconButton onClick={handleRefresh} disabled={loading}>
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    {dashboardGrids.alerts.length > 0 ? (
                      <Box sx={{ mt: 2 }}>
                        {dashboardGrids.alerts.map((alert, index) => (
                          <Alert 
                            key={index} 
                            severity={alert.type === 'error' ? 'error' : 'warning'}
                            sx={{ mb: 1, fontSize: '0.875rem' }}
                          >
                            {alert.message}
                          </Alert>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100px' 
                      }}>
                        <Typography variant="body2" color="success.main">
                          ✅ No alerts - Everything looks good!
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Activity Feed */}
              <Grid item xs={12} lg={6}>
                <Card sx={cardStyles(theme)}>
                  <CardContent>
                    <Box sx={chartContainerStyles}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimerIcon color="primary" />
                        <Typography variant="h6">Recent Activity</Typography>
                      </Box>
                      <IconButton onClick={handleRefresh} disabled={loading}>
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    <TableContainer component={Paper} sx={{ maxHeight: 300, mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Worker</TableCell>
                            <TableCell>Job</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">Time</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardGrids.recentActivity.map((activity, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                    {activity.worker.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {activity.worker.length > 10 ? 
                                      activity.worker.substring(0, 10) + '...' : 
                                      activity.worker}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {activity.job.length > 12 ? 
                                    activity.job.substring(0, 12) + '...' : 
                                    activity.job}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="success.main">
                                  ₹{activity.amount.toLocaleString()}
                                </Typography>
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
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Comparisons Grid */}
              <Grid item xs={12} md={6}>
                <Card sx={cardStyles(theme)}>
                  <CardContent>
                    <Box sx={chartContainerStyles}>
                      <Typography variant="h6">Today vs Yesterday</Typography>
                      <IconButton onClick={handleRefresh} disabled={loading}>
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Earnings</Typography>
                          <Typography variant="h6" color="primary">
                            ₹{dashboardGrids.comparisons.earnings.today.toLocaleString()}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {dashboardGrids.comparisons.earnings.today >= dashboardGrids.comparisons.earnings.yesterday ? 
                              <TrendingUpIcon color="success" fontSize="small" /> : 
                              <TrendingDownIcon color="error" fontSize="small" />
                            }
                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                              vs ₹{dashboardGrids.comparisons.earnings.yesterday.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Hours</Typography>
                          <Typography variant="h6" color="info.main">
                            {dashboardGrids.comparisons.hours.today.toFixed(1)}h
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {dashboardGrids.comparisons.hours.today >= dashboardGrids.comparisons.hours.yesterday ? 
                              <TrendingUpIcon color="success" fontSize="small" /> : 
                              <TrendingDownIcon color="error" fontSize="small" />
                            }
                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                              vs {dashboardGrids.comparisons.hours.yesterday.toFixed(1)}h
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Jobs</Typography>
                          <Typography variant="h6" color="warning.main">
                            {dashboardGrids.comparisons.jobs.today}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {dashboardGrids.comparisons.jobs.today >= dashboardGrids.comparisons.jobs.yesterday ? 
                              <TrendingUpIcon color="success" fontSize="small" /> : 
                              <TrendingDownIcon color="error" fontSize="small" />
                            }
                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                              vs {dashboardGrids.comparisons.jobs.yesterday}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Worker Status Grid */}
              <Grid item xs={12} md={6}>
                <Card sx={cardStyles(theme)}>
                  <CardContent>
                    <Box sx={chartContainerStyles}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6">Worker Status</Typography>
                      </Box>
                      <IconButton onClick={handleRefresh} disabled={loading}>
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    <TableContainer component={Paper} sx={{ maxHeight: 250, mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Worker</TableCell>
                            <TableCell>Current Job</TableCell>
                            <TableCell align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardGrids.workerStatus.map((worker, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body2">
                                  {worker.name.length > 12 ? 
                                    worker.name.substring(0, 12) + '...' : 
                                    worker.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {worker.currentJob.length > 15 ? 
                                    worker.currentJob.substring(0, 15) + '...' : 
                                    worker.currentJob}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={worker.status}
                                  size="small"
                                  color={worker.status === 'working' ? 'success' : 'default'}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Targets vs Actual Grid */}
              <Grid item xs={12} md={6}>
                <Card sx={cardStyles(theme)}>
                  <CardContent>
                    <Box sx={chartContainerStyles}>
                      <Typography variant="h6">Targets vs Actual</Typography>
                      <IconButton onClick={handleRefresh} disabled={loading}>
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      {Object.entries(dashboardGrids.targets).map(([key, data]) => (
                        <Box key={key} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Typography>
                            <Typography variant="body2">
                              {typeof data.actual === 'number' && data.actual > 1000 ? 
                                `₹${data.actual.toLocaleString()}` : 
                                `${data.actual.toFixed(1)}`} / 
                              {typeof data.target === 'number' && data.target > 1000 ? 
                                `₹${data.target.toLocaleString()}` : 
                                `${data.target}`}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((data.actual / data.target) * 100, 100)}
                            color={data.actual >= data.target ? 'success' : 
                                   data.actual >= data.target * 0.8 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {((data.actual / data.target) * 100).toFixed(1)}% achieved
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Time Efficiency Grid */}
              <Grid item xs={12} md={6}>
                <Card sx={cardStyles(theme)}>
                  <CardContent>
                    <Box sx={chartContainerStyles}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon color="primary" />
                        <Typography variant="h6">Time Efficiency</Typography>
                      </Box>
                      <IconButton onClick={handleRefresh} disabled={loading}>
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                    <TableContainer component={Paper} sx={{ maxHeight: 250, mt: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Job</TableCell>
                            <TableCell align="center">Expected</TableCell>
                            <TableCell align="center">Actual</TableCell>
                            <TableCell align="center">Efficiency</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dashboardGrids.timeEfficiency.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body2">
                                  {item.job.length > 10 ? 
                                    item.job.substring(0, 10) + '...' : 
                                    item.job}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.worker.length > 8 ? 
                                    item.worker.substring(0, 8) + '...' : 
                                    item.worker}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">{item.expected}h</Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">{item.actual}h</Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={`${item.efficiency}%`}
                                  size="small"
                                  color={item.efficiency >= 100 ? 'success' : 
                                         item.efficiency >= 80 ? 'warning' : 'error'}
                                  variant="outlined"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default JobEntryDashboard; 