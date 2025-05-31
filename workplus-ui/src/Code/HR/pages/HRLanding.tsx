import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  AccessTime as AttendanceIcon,
  BeachAccess as LeaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../Common/components/DashboardLayout';

const HRLanding: React.FC = () => {
  const navigate = useNavigate();

  const hrModules = [
    {
      title: 'Attendance Management',
      description: 'Track daily attendance, mark check-in/check-out times, and manage attendance records for all workers.',
      icon: <AttendanceIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      path: '/hr/attendance',
      features: ['Mark Attendance', 'Bulk Operations', 'Time Tracking', 'Attendance Reports']
    },
    {
      title: 'Leave Management System',
      description: 'Handle leave requests, approve/reject applications, and manage leave balances for employees.',
      icon: <LeaveIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      path: '/hr/leave',
      features: ['Leave Requests', 'Approval Workflow', 'Balance Tracking', 'Leave Analytics']
    }
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 , mt:8}}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h3" sx={{ mb: 0, flexGrow: 1, fontWeight: 'bold' }}>
          Human Resources Management
        </Typography>
      </Box>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Streamline your workforce management with comprehensive HR tools for attendance tracking, 
          leave management, and employee administration.
        </Typography>
      </Paper>

      {/* Module Cards */}
      <Grid container spacing={4} justifyContent="center">
        {hrModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={6} lg={5} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: module.color, 
                      width: 56, 
                      height: 56, 
                      mr: 2 
                    }}
                  >
                    {module.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    {module.title}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {module.description}
                </Typography>

                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Key Features:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {module.features.map((feature, idx) => (
                    <Typography 
                      component="li" 
                      variant="body2" 
                      color="text.secondary" 
                      key={idx}
                      sx={{ mb: 0.5 }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  sx={{ 
                    bgcolor: module.color,
                    '&:hover': {
                      bgcolor: module.color,
                      filter: 'brightness(0.9)'
                    }
                  }}
                  onClick={() => navigate(module.path)}
                >
                  Open {module.title.split(' ')[0]}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Quick Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                24/7
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System Availability
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                Real-time
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data Updates
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                Automated
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Workflows
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                Secure
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data Protection
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default HRLanding; 