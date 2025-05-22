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
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import WorkersDialog from '../components/masters/worker/WorkersDialog';
import UsersDialog from '../components/masters/user/UsersDialog';
import UserRolesDialog from '../components/masters/user/UserRolesDialog';

const WorkPlusMasters: React.FC = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const handleOpenDialog = (dialogName: string) => {
    setOpenDialog(dialogName);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  const masterCards = [
    {
      title: 'Workers',
      description: 'Manage worker information and details',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      dialog: 'workers'
    },
    {
      title: 'Users',
      description: 'Manage system users and access',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      dialog: 'users'
    },
    {
      title: 'Roles',
      description: 'Configure user roles and permissions',
      icon: <SupervisorAccountIcon sx={{ fontSize: 40 }} />,
      dialog: 'roles'
    },
    {
      title: 'Job Groups',
      description: 'Manage job group configurations',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      dialog: 'job-groups'
    },
    {
      title: 'Jobs',
      description: 'Configure job types and rates',
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      dialog: 'jobs'
    },
    {
      title: 'Group Members',
      description: 'Manage group member assignments',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      dialog: 'group-members'
    },
    {
      title: 'Employee Types',
      description: 'Configure employee type categories',
      icon: <BadgeIcon sx={{ fontSize: 40 }} />,
      dialog: 'employee-types'
    },
    {
      title: 'Companies',
      description: 'Manage company information',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      dialog: 'companies'
    }
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 , mt:4}}>
        <Typography variant="h4" sx={{ mb: 4, color: theme.palette.text.primary }}>
          WorkPlus Masters
        </Typography>

        <Grid container spacing={3}>
          {masterCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <CardActionArea 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2
                  }}
                  onClick={() => handleOpenDialog(card.dialog)}
                >
                  <Box 
                    sx={{ 
                      color: theme.palette.primary.main,
                      mb: 2
                    }}
                  >
                    {card.icon}
                  </Box>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      component="div" 
                      sx={{ 
                        mb: 1,
                        color: theme.palette.text.primary
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                    >
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialogs */}
        <WorkersDialog 
          open={openDialog === 'workers'} 
          onClose={handleCloseDialog} 
        />
        <UsersDialog
          open={openDialog === 'users'}
          onClose={handleCloseDialog}
        />
        <UserRolesDialog
          open={openDialog === 'roles'}
          onClose={handleCloseDialog}
        />
        {/* Add other dialogs here as they are created */}
      </Box>
    </DashboardLayout>
  );
};

export default WorkPlusMasters; 