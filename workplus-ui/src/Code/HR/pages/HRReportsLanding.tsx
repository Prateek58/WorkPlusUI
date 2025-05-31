import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, Card, Grid, Divider, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../Common/components/DashboardLayout';
import { sectionTitleStyles, cardStyles } from '../../../theme/styleUtils';
import DescriptionIcon from '@mui/icons-material/Description';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Import the new dialog components
import WorkerPerformanceDialog from '../components/dialogs/WorkerPerformanceDialog';
import LeaveAnalyticsDialog from '../components/dialogs/LeaveAnalyticsDialog';

const reportTypes = [
  {
    title: 'Attendance Dashboard',
    description: 'Real-time attendance analytics and worker presence tracking',
    icon: <PieChartIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'attendance-dashboard',
    category: 'attendance'
  },
  {
    title: 'Leave Management Dashboard', 
    description: 'LMS analytics, leave balances, and approval workflows',
    icon: <BarChartIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'lms-dashboard',
    category: 'leave'
  },
  {
    title: 'Attendance Reports',
    description: 'Detailed attendance records and worker time tracking',
    icon: <CalendarTodayIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'attendance-reports',
    category: 'attendance'
  },
  {
    title: 'Leave Balance Reports',
    description: 'Worker leave balances and allocation tracking',
    icon: <BeachAccessIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'leave-balance',
    category: 'leave'
  },
  {
    title: 'Monthly Attendance Summary',
    description: 'Monthly attendance summaries and statistics',
    icon: <AssessmentIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'monthly-summary',
    category: 'attendance'
  },
  {
    title: 'Worker Performance',
    description: 'Attendance patterns and performance metrics',
    icon: <TrendingUpIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'worker-performance',
    category: 'combined'
  },
  {
    title: 'Leave Analytics',
    description: 'Leave trends, patterns, and utilization analysis',
    icon: <TimelineIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'leave-analytics',
    category: 'leave'
  },
  {
    title: 'Shift Analysis',
    description: 'Shift patterns and workforce distribution analysis',
    icon: <ScheduleIcon fontSize="large" color="primary" />,
    comingSoon: true,
    action: 'shift-analysis',
    category: 'attendance'
  },
  {
    title: 'Compliance Reports',
    description: 'HR compliance and policy adherence tracking',
    icon: <DescriptionIcon fontSize="large" color="primary" />,
    comingSoon: true,
    action: 'compliance',
    category: 'combined'
  }
];

const HRReportsLanding: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Dialog state management
  const [workerPerformanceOpen, setWorkerPerformanceOpen] = useState(false);
  const [leaveAnalyticsOpen, setLeaveAnalyticsOpen] = useState(false);

  const handleReportCardClick = (action: string) => {
    switch (action) {
      case 'attendance-dashboard':
        navigate('/hr/reports/dashboard/attendance');
        break;
      case 'lms-dashboard':
        navigate('/hr/reports/dashboard/lms');
        break;
      case 'attendance-reports':
        navigate('/hr/attendance');
        break;
      case 'leave-balance':
        navigate('/hr/leave');
        break;
      case 'monthly-summary':
        // Will open attendance reports with monthly filter
        navigate('/hr/attendance?view=monthly');
        break;
      case 'worker-performance':
        setWorkerPerformanceOpen(true);
        break;
      case 'leave-analytics':
        setLeaveAnalyticsOpen(true);
        break;
      default:
        // Show coming soon message
        break;
    }
  };

  const attendanceReports = reportTypes.filter(report => 
    report.category === 'attendance' || report.category === 'combined'
  );
  const leaveReports = reportTypes.filter(report => 
    report.category === 'leave' || report.category === 'combined'
  );

  const renderReportCard = (report: typeof reportTypes[0]) => (
    <Grid item xs={12} sm={6} md={4} key={report.action}>
      <Card
        sx={{
          ...cardStyles(theme),
          height: '100%',
          cursor: report.comingSoon ? 'not-allowed' : 'pointer',
          opacity: report.comingSoon ? 0.6 : 1,
          transition: 'all 0.3s ease',
          '&:hover': report.comingSoon ? {} : {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${theme.palette.primary.main}20`,
          },
        }}
        onClick={() => !report.comingSoon && handleReportCardClick(report.action)}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              {report.icon}
            </Box>
            <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
              <MoreVertIcon />
            </IconButton>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {report.title}
            {report.comingSoon && (
              <Box component="span" sx={{ 
                ml: 1, 
                fontSize: '0.75rem', 
                color: theme.palette.warning.main,
                fontWeight: 400 
              }}>
                (Coming Soon)
              </Box>
            )}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ flexGrow: 1, lineHeight: 1.5 }}
          >
            {report.description}
          </Typography>
        </Box>
      </Card>
    </Grid>
  );

  return (
    <DashboardLayout>
      <Box sx={{ mt: 9, mb: 4, px: 3 }}>
        {/* Header */}
        <Typography variant="h4" sx={{ ...sectionTitleStyles(theme), mb: 1 }}>
          HR Reports & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Comprehensive reporting and analytics for attendance tracking and leave management
        </Typography>

        {/* Quick Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles(theme)}>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <EventAvailableIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" color="success.main">Live</Typography>
                <Typography variant="body2" color="text.secondary">
                  Attendance Tracking
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles(theme)}>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <BeachAccessIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" color="info.main">Active</Typography>
                <Typography variant="body2" color="text.secondary">
                  Leave Management
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles(theme)}>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" color="primary.main">All</Typography>
                <Typography variant="body2" color="text.secondary">
                  Workers Covered
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles(theme)}>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h6" color="secondary.main">Real-time</Typography>
                <Typography variant="body2" color="text.secondary">
                  Analytics & Reports
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Attendance Reports Section */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          📅 Attendance & Time Tracking
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {attendanceReports.map(renderReportCard)}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Leave Management Reports Section */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          🏖️ Leave Management System (LMS)
        </Typography>
        <Grid container spacing={3}>
          {leaveReports.map(renderReportCard)}
        </Grid>
      </Box>

      {/* Dialog Components */}
      <WorkerPerformanceDialog 
        open={workerPerformanceOpen}
        onClose={() => setWorkerPerformanceOpen(false)}
      />
      
      <LeaveAnalyticsDialog 
        open={leaveAnalyticsOpen}
        onClose={() => setLeaveAnalyticsOpen(false)}
      />
    </DashboardLayout>
  );
};

export default HRReportsLanding; 