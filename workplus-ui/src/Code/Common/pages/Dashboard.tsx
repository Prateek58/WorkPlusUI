import React, { useState, useEffect, useMemo } from 'react';
import { Box, Card, Grid, Typography, IconButton, Chip, CircularProgress, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme } from '@mui/material/styles';
import DashboardLayout from '../../Common/components/DashboardLayout';
import dayjs from 'dayjs';
import { 
  cardStyles, 
  sectionTitleStyles, 
  flexContainerStyles
} from '../../../theme/styleUtils';
import { useNavigate } from 'react-router-dom';
import WorkIcon from '@mui/icons-material/Work';
import SettingsIcon from '@mui/icons-material/Settings';
import ArticleIcon from '@mui/icons-material/Article';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';
import SchoolIcon from '@mui/icons-material/School';

// Import job entry service for real data
import jobEntryReportService, { 
  JobEntryReport, 
  JobEntryFilter,
  FilterOptions
} from '../../MainWorkPlus/components/reports/job-entries/jobEntryReportService';

// Import the JobEntryDashboard component
import JobEntryDashboard from '../../MainWorkPlus/components/reports/dashboard-job-entry/JobEntryDashboard';

// Import HR Dashboard components
import AttendanceDashboard from '../../HR/components/dashboards/AttendanceDashboard';
import LMSDashboard from '../../HR/components/dashboards/LMSDashboard';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State for dashboard switching
  const [dashboardType, setDashboardType] = useState<string>('default');

  // State for real data
  const [loading, setLoading] = useState(true);
  const [jobEntries, setJobEntries] = useState<JobEntryReport[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    jobs: [],
    workers: [],
    groups: [],
    entryTypes: []
  });

  // Handle dashboard type change
  const handleDashboardChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDashboardType: string | null,
  ) => {
    if (newDashboardType !== null) {
      setDashboardType(newDashboardType);
    }
  };

  // Get dynamic title based on dashboard type
  const getDashboardTitle = () => {
    switch (dashboardType) {
      case 'work-entries':
        return 'Work Entry Analytics';
      case 'lms':
        return 'Leave Management System';
      case 'attendance':
        return 'Attendance Dashboard';
      default:
        return 'Dashboard WorkPlus';
    }
  };

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

  if (loading && dashboardType === 'default') {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  // Default dashboard render function
  const renderDefaultDashboard = () => (
    <Grid container spacing={2}>
      {/* Stats Cards */}
      <Grid item xs={6} md={3}>
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

      <Grid item xs={6} md={3}>
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

      <Grid item xs={6} md={3}>
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

      <Grid item xs={6} md={3}>
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
  );

  return (
    <DashboardLayout>
      {/* Fixed Header for All Dashboards */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        mt: 9, 
        mb: 2, 
        gap: { xs: 2, sm: 0 },
        flexWrap: { sm: 'wrap' }
      }}>
        <Typography variant="h6" sx={{ ...sectionTitleStyles(theme), mr: { sm: 2 } }}>
          {getDashboardTitle()}
        </Typography>
        
        {/* Quick Action Links */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-start' },
          mr: { sm: 2 }
        }}>
          <Chip
            icon={<WorkIcon sx={{ fontSize: '1rem' }} />}
            label="Work Entry"
            color="primary"
            variant="outlined"
            clickable
            onClick={() => navigate('/work-entry')}
            size="small"
            sx={{ 
              fontWeight: 400,
              fontSize: '0.8rem',
              height: '28px',
              '& .MuiChip-label': {
                px: 1.5,
                fontSize: '0.8rem',
              },
              '& .MuiChip-icon': {
                fontSize: '1rem',
                ml: 0.5,
              }
            }}
          />
          <Chip
            icon={<SettingsIcon sx={{ fontSize: '1rem' }} />}
            label="Masters"
            color="primary"
            variant="outlined"
            clickable
            onClick={() => navigate('/masters')}
            size="small"
            sx={{ 
              fontWeight: 400,
              fontSize: '0.8rem',
              height: '28px',
              '& .MuiChip-label': {
                px: 1.5,
                fontSize: '0.8rem',
              },
              '& .MuiChip-icon': {
                fontSize: '1rem',
                ml: 0.5,
              }
            }}
          />
          <Chip
            icon={<ArticleIcon sx={{ fontSize: '1rem' }} />}
            label="Reports"
            color="primary"
            variant="outlined"
            clickable
            onClick={() => navigate('/reports')}
            size="small"
            sx={{ 
              fontWeight: 400,
              fontSize: '0.8rem',
              height: '28px',
              '& .MuiChip-label': {
                px: 1.5,
                fontSize: '0.8rem',
              },
              '& .MuiChip-icon': {
                fontSize: '1rem',
                ml: 0.5,
              }
            }}
          />
        </Box>

        {/* Dashboard Toggle Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: { xs: 'center', sm: 'flex-end' },
          width: { xs: '100%', sm: 'auto' },
          ml: { sm: 'auto' },
          mt: { xs: 1, sm: 0 }
        }}>
          <ToggleButtonGroup
            value={dashboardType}
            exclusive
            onChange={handleDashboardChange}
            aria-label="dashboard type"
            size="small"
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              '& .MuiToggleButton-root': {
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 500,
                flex: { xs: 1, sm: 'none' },
                minWidth: { sm: 70 },
                height: 32,
                display: 'flex',
                flexDirection: 'row',
                gap: 0.5,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              },
              '& .MuiToggleButton-root:first-of-type': {
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
              },
              '& .MuiToggleButton-root:last-of-type': {
                borderTopRightRadius: 16,
                borderBottomRightRadius: 16,
              }
            }}
          >
            <ToggleButton value="default" aria-label="default dashboard">
              <DashboardIcon sx={{ fontSize: '1rem' }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Overview</Typography>
            </ToggleButton>
            <ToggleButton value="work-entries" aria-label="work entries dashboard">
              <AssignmentIcon sx={{ fontSize: '1rem' }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Work</Typography>
            </ToggleButton>
            <ToggleButton value="lms" aria-label="lms dashboard">
              <CalendarTodayIcon sx={{ fontSize: '1rem' }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>LMS</Typography>
            </ToggleButton>
            <ToggleButton value="attendance" aria-label="attendance dashboard">
              <PeopleIcon sx={{ fontSize: '1rem' }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Attend</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Dashboard Content */}
      {dashboardType === 'default' ? (
        <>
          {/* Action buttons for default dashboard - commented out for now, can be re-enabled later
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 1 }}>
            <IconButton onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
            <IconButton disabled>
              <FilterListIcon />
            </IconButton>
            <IconButton disabled>
              <GetAppIcon />
            </IconButton>
          </Box>
          */}
          {renderDefaultDashboard()}
        </>
      ) : null}
      
      {dashboardType === 'work-entries' && <JobEntryDashboard embedded={true} />}
      
      {dashboardType === 'lms' && <LMSDashboard embedded={true} />}
      
      {dashboardType === 'attendance' && <AttendanceDashboard embedded={true} />}
    </DashboardLayout>
  );
};

export default Dashboard; 