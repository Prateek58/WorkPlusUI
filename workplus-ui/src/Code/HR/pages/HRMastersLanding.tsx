import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  CardActionArea
} from '@mui/material';
import DashboardLayout from '../../Common/components/DashboardLayout';
import {
  BeachAccess as LeaveTypeIcon,
  EventNote as HolidayIcon,
  CalendarToday as CalendarConfigIcon,
  Settings as ConfigIcon,
} from '@mui/icons-material';
import LeaveTypesDialog from '../components/masters/leave-type/LeaveTypesDialog';
import HolidaysDialog from '../components/masters/holiday/HolidaysDialog';
import CalendarConfigDialog from '../components/masters/calendar-config/CalendarConfigDialog';
import HRConfigDialog from '../components/masters/hr-config/HRConfigDialog';

const HRMastersLanding: React.FC = () => {
  const theme = useTheme();
  const [leaveTypesDialogOpen, setLeaveTypesDialogOpen] = useState(false);
  const [holidaysDialogOpen, setHolidaysDialogOpen] = useState(false);
  const [calendarConfigDialogOpen, setCalendarConfigDialogOpen] = useState(false);
  const [hrConfigDialogOpen, setHRConfigDialogOpen] = useState(false);

  const masterItems = [
    {
      title: 'Leave Types',
      description: 'Manage different types of leaves (CL, SL, EL, ML, etc.) with allocation rules',
      icon: <LeaveTypeIcon fontSize="large" />,
      color: theme.palette.primary.main,
      onClick: () => setLeaveTypesDialogOpen(true),
      table: 'hr_master_leave_types'
    },
    {
      title: 'Holidays',
      description: 'Manage company holidays and special days (optional/mandatory holidays)',
      icon: <HolidayIcon fontSize="large" />,
      color: theme.palette.warning.main,
      onClick: () => setHolidaysDialogOpen(true),
      table: 'hr_master_holidays'
    },
    {
      title: 'Calendar Configuration',
      description: 'Configure working days of the week (6-day/5-day work week)',
      icon: <CalendarConfigIcon fontSize="large" />,
      color: theme.palette.info.main,
      onClick: () => setCalendarConfigDialogOpen(true),
      table: 'hr_master_calendar_config'
    },
    {
      title: 'HR Configuration',
      description: 'General HR system settings and configuration parameters',
      icon: <ConfigIcon fontSize="large" />,
      color: '#607d8b', // Blue Grey
      onClick: () => setHRConfigDialogOpen(true),
      table: 'hr_master_config'
    }
  ];

  return (
    <DashboardLayout>
      <Box p={3} mt={5}>
        <Typography variant="h4" gutterBottom>
          HR Master Data
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Configure and manage HR master data including leave types, holidays, calendar settings, and system configuration.
        </Typography>
        
        <Grid container spacing={3}>
          {masterItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardActionArea 
                  onClick={item.onClick}
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    p: 3,
                    textAlign: 'center',
                    minHeight: '180px'
                  }}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: '50%', 
                        bgcolor: `${item.color}15`, 
                        color: item.color,
                        mb: 2
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography variant="h6" component="div" align="center" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" align="center" sx={{ 
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      backgroundColor: 'action.hover',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}>
                      {item.table}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Dialogs */}
      <LeaveTypesDialog
        open={leaveTypesDialogOpen}
        onClose={() => setLeaveTypesDialogOpen(false)}
      />
      <HolidaysDialog
        open={holidaysDialogOpen}
        onClose={() => setHolidaysDialogOpen(false)}
      />
      <CalendarConfigDialog
        open={calendarConfigDialogOpen}
        onClose={() => setCalendarConfigDialogOpen(false)}
      />
      <HRConfigDialog
        open={hrConfigDialogOpen}
        onClose={() => setHRConfigDialogOpen(false)}
      />
    </DashboardLayout>
  );
};

export default HRMastersLanding; 