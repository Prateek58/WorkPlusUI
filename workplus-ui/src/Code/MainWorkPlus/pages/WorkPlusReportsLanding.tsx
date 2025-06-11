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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import JobEntriesReportDialog from '../components/reports/job-entries/JobEntriesReportDialog';
import WorkerPerformanceReportDialog from '../components/reports/dialogs/WorkerPerformanceReportDialog';
import JobCompletionReportDialog from '../components/reports/dialogs/JobCompletionReportDialog';
import EarningsReportDialog from '../components/reports/dialogs/EarningsReportDialog';

const reportTypes = [
  {
    title: 'Saved Job Entries',
    description: 'View detailed worker job entries',
    icon: <TimelineIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'job-entries'
  },
  {
    title: 'Dashboard',
    description: 'Overview of all the data from job work entries',
    icon: <PieChartIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'overview'
  },
  {
    title: 'Worker Performance',
    description: 'View detailed worker performance reports across jobs',
    icon: <BarChartIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'worker-performance'
  },
  {
    title: 'Job Completion',
    description: 'Track job completion rates and statistics',
    icon: <PieChartIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'job-completion'
  },
  {
    title: 'Earnings Report',
    description: 'View earnings by worker, job type, and period',
    icon: <TimelineIcon fontSize="large" color="primary" />,
    comingSoon: false,
    action: 'earnings'
  },
  {
    title: 'Productivity Analysis',
    description: 'Analyze productivity trends and identify improvement areas',
    icon: <DescriptionIcon fontSize="large" color="primary" />,
    comingSoon: true,
    action: 'productivity'
  }
];

const WorkPlusReportsLanding: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [jobEntriesDialogOpen, setJobEntriesDialogOpen] = useState(false);
  const [workerPerformanceDialogOpen, setWorkerPerformanceDialogOpen] = useState(false);
  const [jobCompletionDialogOpen, setJobCompletionDialogOpen] = useState(false);
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);

  const handleReportCardClick = (action: string) => {
    switch (action) {
      case 'job-entries':
        setJobEntriesDialogOpen(true);
        break;
      case 'overview':
        navigate('/workplus/reports/dashboard/job-entry');
        break;
      case 'worker-performance':
        setWorkerPerformanceDialogOpen(true);
        break;
      case 'job-completion':
        setJobCompletionDialogOpen(true);
        break;
      case 'earnings':
        setEarningsDialogOpen(true);
        break;
      default:
        // Do nothing for now or show a "coming soon" message
        break;
    }
  };

  const renderReportCard = (report: typeof reportTypes[0]) => (
    <Grid item xs={6} sm={6} md={4} key={report.action}>
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
        {report.comingSoon && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'warning.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            Coming Soon
          </Box>
        )}
        <Box sx={{ display: 'flex', p: 2 }}>
          <Box sx={{ p: 2 }}>
            {report.icon}
          </Box>
          <Box sx={{ flexGrow: 1, pl: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {report.title}
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {report.description}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mt: 'auto' }} />
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="primary">
            {report.comingSoon ? 'This report is under development' : 'View Report'}
          </Typography>
        </Box>
      </Card>
    </Grid>
  );

  return (
    
    <DashboardLayout>
    <Box sx={{ p: 3, mt: 8 }}>
    {/* Header Section */}
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom sx={{ mb: 0, flexGrow: 1 }}>
      WorkPlus Reports
      </Typography>
    </Box>
  
  </Box>
      <Box sx={{ px: 3 }}>
        <Grid container spacing={3}>
          {reportTypes.map((report) => renderReportCard(report))}
        </Grid>
      </Box>

      {/* Report Dialogs */}
      <JobEntriesReportDialog 
        open={jobEntriesDialogOpen}
        onClose={() => setJobEntriesDialogOpen(false)}
      />
      <WorkerPerformanceReportDialog 
        open={workerPerformanceDialogOpen}
        onClose={() => setWorkerPerformanceDialogOpen(false)}
      />
      <JobCompletionReportDialog 
        open={jobCompletionDialogOpen}
        onClose={() => setJobCompletionDialogOpen(false)}
      />
      <EarningsReportDialog 
        open={earningsDialogOpen}
        onClose={() => setEarningsDialogOpen(false)}
      />
    </DashboardLayout>
  );
};

export default WorkPlusReportsLanding; 