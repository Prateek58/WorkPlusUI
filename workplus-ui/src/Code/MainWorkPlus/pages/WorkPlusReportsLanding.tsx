import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, Card, Grid, Divider, IconButton } from '@mui/material';
import DashboardLayout from '../../Common/components/DashboardLayout';
import { sectionTitleStyles, cardStyles } from '../../../theme/styleUtils';
import DescriptionIcon from '@mui/icons-material/Description';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const reportTypes = [
  {
    title: 'Worker Performance',
    description: 'View detailed worker performance reports across jobs',
    icon: <BarChartIcon fontSize="large" color="primary" />,
    comingSoon: false
  },
  {
    title: 'Job Completion',
    description: 'Track job completion rates and statistics',
    icon: <PieChartIcon fontSize="large" color="primary" />,
    comingSoon: false
  },
  {
    title: 'Earnings Report',
    description: 'View earnings by worker, job type, and period',
    icon: <TimelineIcon fontSize="large" color="primary" />,
    comingSoon: false
  },
  {
    title: 'Productivity Analysis',
    description: 'Analyze productivity trends and identify improvement areas',
    icon: <DescriptionIcon fontSize="large" color="primary" />,
    comingSoon: true
  }
];

const WorkPlusReportsLanding: React.FC = () => {
  const theme = useTheme();

  return (
    <DashboardLayout>
      <Typography variant="h4" sx={{ ...sectionTitleStyles(theme), mt: 9, mb: 3 }}>
        WorkPlus Reports
      </Typography>

      <Grid container spacing={3}>
        {reportTypes.map((report, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ 
              ...cardStyles(theme),
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative',
              opacity: report.comingSoon ? 0.7 : 1,
              cursor: report.comingSoon ? 'default' : 'pointer',
              '&:hover': {
                boxShadow: report.comingSoon ? 'none' : theme.shadows[8]
              }
            }}>
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
        ))}
      </Grid>
    </DashboardLayout>
  );
};

export default WorkPlusReportsLanding; 