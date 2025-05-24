import React from 'react';
import { Box, Typography, Chip, Grid, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardLayout from '../../Common/components/DashboardLayout';
import { sectionTitleStyles, cardStyles } from '../../../theme/styleUtils';

const LMSLanding: React.FC = () => {
  const theme = useTheme();

  const upcomingFeatures = [
    {
      title: 'Leave Requests',
      description: 'Submit and track leave applications with approval workflows',
      icon: '📝'
    },
    {
      title: 'Leave Calendar',
      description: 'Visual calendar view of all leaves and holidays',
      icon: '📅'
    },
    {
      title: 'Approval Management',
      description: 'Manager dashboard for approving/rejecting leave requests',
      icon: '✅'
    },
    {
      title: 'Leave Balances',
      description: 'Track available leave days by category (sick, vacation, etc.)',
      icon: '⚖️'
    },
    {
      title: 'Team Calendar',
      description: 'View team availability and plan work accordingly',
      icon: '👥'
    },
    {
      title: 'Reports & Analytics',
      description: 'Leave usage reports and attendance analytics',
      icon: '📊'
    }
  ];

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <CalendarTodayIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h3" sx={{ ...sectionTitleStyles(theme), mb: 2 }}>
            Leave Management System
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Comprehensive leave request and approval management platform
          </Typography>
          <Chip 
            label="Coming Soon" 
            color="warning" 
            size="medium"
            sx={{ 
              fontSize: '1rem',
              fontWeight: 600,
              px: 3,
              py: 1,
              height: 'auto'
            }}
          />
        </Box>

        {/* Features Grid */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ ...sectionTitleStyles(theme), mb: 3, textAlign: 'center' }}>
            Upcoming Features
          </Typography>
          <Grid container spacing={3}>
            {upcomingFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ ...cardStyles(theme), height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography sx={{ fontSize: '3rem', mb: 2 }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h6" gutterBottom color="primary">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Bottom Message */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body1" color="text.secondary">
            This module is currently under development. Stay tuned for updates!
          </Typography>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default LMSLanding; 