import React from 'react';
import { Box, Typography, Chip, Grid, Card, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import DashboardLayout from '../../Common/components/DashboardLayout';
import { sectionTitleStyles, cardStyles } from '../../../theme/styleUtils';

const AttendanceLanding: React.FC = () => {
  const theme = useTheme();

  const upcomingFeatures = [
    {
      title: 'Time Tracking',
      description: 'Clock in/out with GPS and photo verification',
      icon: '⏰'
    },
    {
      title: 'Attendance Reports',
      description: 'Comprehensive attendance analytics and reports',
      icon: '📊'
    },
    {
      title: 'Shift Management',
      description: 'Manage different shifts and work schedules',
      icon: '🔄'
    },
    {
      title: 'Overtime Tracking',
      description: 'Track and calculate overtime hours automatically',
      icon: '⚡'
    },
    {
      title: 'Mobile Check-in',
      description: 'Mobile app for easy attendance marking',
      icon: '📱'
    },
    {
      title: 'Biometric Integration',
      description: 'Support for fingerprint and face recognition',
      icon: '👆'
    }
  ];

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <PeopleIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h3" sx={{ ...sectionTitleStyles(theme), mb: 2 }}>
            Attendance Management System
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Real-time attendance tracking and analytics platform
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

export default AttendanceLanding; 