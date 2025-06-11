import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  useTheme,
  CardActionArea,
  IconButton
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import WorkersDialog from '../components/masters/worker/WorkersDialog';
import UsersDialog from '../components/masters/user/UsersDialog';
import JobGroupsDialog from '../components/masters/job-group/JobGroupsDialog';
import GroupMembersDialog from '../components/masters/group-member/GroupMembersDialog';
import UserRolesDialog from '../components/masters/user/UserRolesDialog';
import JobsDialog from '../components/masters/job/JobsDialog';
import JobTypesDialog from '../components/masters/job-type/JobTypesDialog';
import EmployeeTypesDialog from '../components/masters/employee-type/EmployeeTypesDialog';
import RolesDialog from '../components/masters/role/RolesDialog';

const WorkPlusMastersLanding: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [workersDialogOpen, setWorkersDialogOpen] = useState(false);
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [jobGroupsDialogOpen, setJobGroupsDialogOpen] = useState(false);
  const [groupMembersDialogOpen, setGroupMembersDialogOpen] = useState(false);
  const [userRolesDialogOpen, setUserRolesDialogOpen] = useState(false);
  const [jobsDialogOpen, setJobsDialogOpen] = useState(false);
  const [jobTypesDialogOpen, setJobTypesDialogOpen] = useState(false);
  const [employeeTypesDialogOpen, setEmployeeTypesDialogOpen] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);

  const masterItems = [
    {
      title: 'Workers',
      icon: <PeopleIcon fontSize="large" />,
      color: theme.palette.primary.main,
      onClick: () => setWorkersDialogOpen(true)
    },
    {
      title: 'Users',
      icon: <PersonIcon fontSize="large" />,
      color: theme.palette.success.main,
      onClick: () => setUsersDialogOpen(true)
    },
    {
      title: 'User Roles',
      icon: <SupervisorAccountIcon fontSize="large" />,
      color: theme.palette.warning.main,
      onClick: () => setUserRolesDialogOpen(true)
    },
    {
      title: 'Job Groups',
      icon: <GroupIcon fontSize="large" />,
      color: theme.palette.info.main,
      onClick: () => setJobGroupsDialogOpen(true)
    },
    {
      title: 'Group Members',
      icon: <PersonAddIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      onClick: () => setGroupMembersDialogOpen(true)
    },
    {
      title: 'Jobs',
      icon: <WorkIcon fontSize="large" />,
      color: theme.palette.error.main,
      onClick: () => setJobsDialogOpen(true)
    },
    {
      title: 'Job Types',
      icon: <AssignmentIcon fontSize="large" />,
      color: '#9c27b0', // Purple
      onClick: () => setJobTypesDialogOpen(true)
    },
    {
      title: 'Employee Types',
      icon: <BadgeIcon fontSize="large" />,
      color: '#795548', // Brown
      onClick: () => setEmployeeTypesDialogOpen(true)
    },
    {
      title: 'Roles',
      icon: <BusinessIcon fontSize="large" />,
      color: '#607d8b', // Blue Grey
      onClick: () => setRolesDialogOpen(true)
    }
  ];

  return (
    <DashboardLayout>
      <Box p={3} >
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt:8 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" gutterBottom sx={{ mb: 0, flexGrow: 1 }}>
            Master Data
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {masterItems.map((item) => (
            <Grid item xs={6} sm={6} md={4} key={item.title}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${theme.palette.primary.main}20`,
                  },
                }}
                onClick={item.onClick}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 3
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
                  <Typography variant="h6" component="div" align="center">
                    {item.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Dialogs */}
      <WorkersDialog
        open={workersDialogOpen}
        onClose={() => setWorkersDialogOpen(false)}
      />
      <UsersDialog
        open={usersDialogOpen}
        onClose={() => setUsersDialogOpen(false)}
      />
      <JobGroupsDialog
        open={jobGroupsDialogOpen}
        onClose={() => setJobGroupsDialogOpen(false)}
      />
      <GroupMembersDialog
        open={groupMembersDialogOpen}
        onClose={() => setGroupMembersDialogOpen(false)}
      />
      <UserRolesDialog
        open={userRolesDialogOpen}
        onClose={() => setUserRolesDialogOpen(false)}
      />
      <JobsDialog
        open={jobsDialogOpen}
        onClose={() => setJobsDialogOpen(false)}
        userId={1} // Use actual logged-in user ID here
      />
      <JobTypesDialog
        open={jobTypesDialogOpen}
        onClose={() => setJobTypesDialogOpen(false)}
      />
      <EmployeeTypesDialog
        open={employeeTypesDialogOpen}
        onClose={() => setEmployeeTypesDialogOpen(false)}
      />
      <RolesDialog
        open={rolesDialogOpen}
        onClose={() => setRolesDialogOpen(false)}
      />
    </DashboardLayout>
  );
};

export default WorkPlusMastersLanding; 