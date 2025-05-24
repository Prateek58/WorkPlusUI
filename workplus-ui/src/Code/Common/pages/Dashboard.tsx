import React, { useState, useEffect, useMemo } from 'react';
import { Box, Card, Grid, Typography, IconButton, Chip, CircularProgress } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme } from '@mui/material/styles';
import DashboardLayout from '../../Common/components/DashboardLayout';
import dayjs from 'dayjs';
import { 
  cardStyles, 
  sectionTitleStyles, 
  flexContainerStyles, 
  centeredContentStyles 
} from '../../../theme/styleUtils';
import { useNavigate } from 'react-router-dom';
import WorkIcon from '@mui/icons-material/Work';
import SettingsIcon from '@mui/icons-material/Settings';
import ArticleIcon from '@mui/icons-material/Article';

// Import job entry service for real data
import jobEntryReportService, { 
  JobEntryReport, 
  JobEntryFilter,
  FilterOptions
} from '../../MainWorkPlus/components/reports/job-entries/jobEntryReportService';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State for real data
  const [loading, setLoading] = useState(true);
  const [jobEntries, setJobEntries] = useState<JobEntryReport[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    jobs: [],
    workers: [],
    groups: [],
    entryTypes: []
  });

  // Fetch real data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const filter: JobEntryFilter = {
          pageNumber: 1,
          pageSize: 1000 // Get enough data for dashboard
        };
        
        const [reportData, filterData] = await Promise.all([
          jobEntryReportService.getFilteredJobEntriesReport(filter),
          jobEntryReportService.getFilterOptions()
        ]);
        
        setJobEntries(reportData.items);
        setFilterOptions(filterData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate real dashboard statistics using useMemo for performance
  const dashboardStats = useMemo(() => {
    if (!jobEntries.length) {
      return {
        todayEntries: [],
        todayAmount: 0,
        todayHours: 0,
        presentWorkers: 0,
        absentWorkers: 0,
        totalWorkers: 0,
        totalJobs: 0,
        totalEarnings: 0,
        totalHours: 0,
        monthlyData: [],
        topWorkers: [],
        jobDistribution: []
      };
    }

    // Today's data
    const today = dayjs().format('YYYY-MM-DD');
    const todayEntries = jobEntries.filter(entry => 
      entry.createdAt && dayjs(entry.createdAt).format('YYYY-MM-DD') === today
    );
    const todayAmount = todayEntries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const todayHours = todayEntries.reduce((sum, entry) => sum + (entry.hoursTaken || 0), 0);

    // Worker statistics
    const totalWorkers = filterOptions.workers.length;
    // For attendance, we'll check workers with recent activity (last 2 days)
    const recentDate = dayjs().subtract(2, 'days');
    const activeWorkers = new Set(
      jobEntries
        .filter(entry => entry.createdAt && dayjs(entry.createdAt).isAfter(recentDate))
        .map(entry => entry.workerName)
        .filter(Boolean)
    );
    const presentWorkers = activeWorkers.size;
    const absentWorkers = totalWorkers - presentWorkers;

    // Total statistics
    const totalJobs = jobEntries.length;
    const totalEarnings = jobEntries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const totalHours = jobEntries.reduce((sum, entry) => sum + (entry.hoursTaken || 0), 0);

    // Monthly data for bar chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = dayjs().subtract(i, 'month').startOf('month');
      const monthEnd = dayjs().subtract(i, 'month').endOf('month');
      const monthEntries = jobEntries.filter(entry => 
        entry.createdAt && 
        dayjs(entry.createdAt).isAfter(monthStart) && 
        dayjs(entry.createdAt).isBefore(monthEnd)
      );
      
      monthlyData.push({
        month: monthStart.format('MMM YYYY'),
        amount: monthEntries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0),
        hours: monthEntries.reduce((sum, entry) => sum + (entry.hoursTaken || 0), 0),
        jobs: monthEntries.length
      });
    }

    // Top workers by earnings
    const workerStats = new Map();
    jobEntries.forEach(entry => {
      if (entry.workerName) {
        if (!workerStats.has(entry.workerName)) {
          workerStats.set(entry.workerName, {
            name: entry.workerName,
            totalJobs: 0,
            totalEarnings: 0,
            present: activeWorkers.has(entry.workerName)
          });
        }
        const worker = workerStats.get(entry.workerName);
        worker.totalJobs += 1;
        worker.totalEarnings += entry.totalAmount || 0;
      }
    });

    const topWorkers = Array.from(workerStats.values())
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 3);

    // Job distribution for pie chart
    const jobStats = new Map();
    jobEntries.forEach(entry => {
      if (entry.jobName) {
        jobStats.set(entry.jobName, (jobStats.get(entry.jobName) || 0) + 1);
      }
    });

    const jobDistribution = Array.from(jobStats.entries())
      .map(([job, count], index) => ({
        id: index + 1,
        value: count,
        label: job.length > 15 ? job.substring(0, 15) + '...' : job
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 jobs

    return {
      todayEntries,
      todayAmount,
      todayHours,
      presentWorkers,
      absentWorkers,
      totalWorkers,
      totalJobs,
      totalEarnings,
      totalHours,
      monthlyData,
      topWorkers,
      jobDistribution
    };
  }, [jobEntries, filterOptions]);

  // Chart container styles
  const chartContainerStyles = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    mb: 2
  };
  
  const chartBoxStyles = {
    width: '100%', 
    height: 250
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 9, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ ...sectionTitleStyles(theme), mr: 2 }}>
          Dashboard WorkPlus
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<WorkIcon />}
            label="Work Entry"
            color="primary"
            variant="outlined"
            clickable
            onClick={() => navigate('/work-entry')}
            sx={{ fontWeight: 500 }}
          />
          <Chip
            icon={<SettingsIcon />}
            label="Masters"
            color="primary"
            variant="outlined"
            clickable
            onClick={() => navigate('/masters')}
            sx={{ fontWeight: 500 }}
          />
          <Chip
            icon={<ArticleIcon />}
            label="Reports"
            color="primary"
            variant="outlined"
            clickable
            onClick={() => navigate('/reports')}
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={cardStyles(theme)}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Today's Jobs
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
              {dashboardStats.todayEntries.length}
            </Typography>
            <Box sx={flexContainerStyles}>
              <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                ₹{dashboardStats.todayAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Earnings
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={cardStyles(theme)}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Worker Attendance
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
              {dashboardStats.presentWorkers}/{dashboardStats.totalWorkers}
            </Typography>
            <Box sx={flexContainerStyles}>
              <Typography variant="body2" color="error.main" sx={{ mr: 1 }}>
                {dashboardStats.absentWorkers} Absent
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={cardStyles(theme)}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Total Jobs
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {dashboardStats.totalJobs}
            </Typography>
            <Box sx={flexContainerStyles}>
              <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                ₹{dashboardStats.totalEarnings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={cardStyles(theme)}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Total Hours
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
              {dashboardStats.totalHours}
            </Typography>
            <Box sx={flexContainerStyles}>
              <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                {dashboardStats.todayHours} Hours
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Hours
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Card sx={cardStyles(theme)}>
            <Box sx={chartContainerStyles}>
              <Typography variant="subtitle1">Monthly Performance</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={chartBoxStyles}>
              <BarChart
                series={[
                  {
                    data: dashboardStats.monthlyData.map(item => item.amount),
                    label: 'Earnings',
                    color: theme.palette.primary.main,
                  },
                  {
                    data: dashboardStats.monthlyData.map(item => item.hours),
                    label: 'Hours',
                    color: theme.palette.success.main,
                  }
                ]}
                xAxis={[{
                  scaleType: 'band',
                  data: dashboardStats.monthlyData.map(item => item.month),
                }]}
                height={250}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={cardStyles(theme)}>
            <Box sx={chartContainerStyles}>
              <Typography variant="subtitle1">Top Performers</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ mt: 1 }}>
              {dashboardStats.topWorkers.map((worker, index) => (
                <Box key={worker.name} sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {index + 1}. {worker.name}
                  </Typography>
                  <Typography variant="h6">
                    ₹{worker.totalEarnings.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {worker.totalJobs} Jobs
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={cardStyles(theme)}>
            <Box sx={chartContainerStyles}>
              <Typography variant="subtitle1">Job Distribution</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={chartBoxStyles}>
              <PieChart
                series={[
                  {
                    data: dashboardStats.jobDistribution,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30 },
                  },
                ]}
                height={250}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default Dashboard; 