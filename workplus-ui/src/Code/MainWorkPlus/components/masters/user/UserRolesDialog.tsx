import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useTheme,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  InputAdornment,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import UserRoleManagement from './UserRoleManagement';
import Loader from '../../../../Common/components/Loader';
import { User, useUserService } from './userService';
import { useUserRoleService, Role } from './userRoleService';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface UserRolesDialogProps {
  open: boolean;
  onClose: () => void;
}

interface UserWithRoles extends User {
  roles: Role[];
  loadingRoles: boolean;
}

const UserRolesDialog: React.FC<UserRolesDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRoles[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [isRoleManagementOpen, setIsRoleManagementOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { getUsers } = useUserService();
  const { getUserRoles } = useUserRoleService();

  useEffect(() => {
    if (open) {
      loadUsers();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setUsers([]);
      setFilteredUsers([]);
      setSelectedUser(null);
      setIsRoleManagementOpen(false);
      setSearchQuery('');
      setPage(0);
    }
  }, [open]);

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (user.username || '').toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
        user.id.toString().includes(searchQuery) ||
        (user.roles && user.roles.some(role => role.name.toLowerCase().includes(searchLower)))
      );
    });
    setFilteredUsers(filtered);
    setPage(0); // Reset to first page when search changes
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      
      // Add roles property to each user
      const usersWithRoles = data.map(user => ({
        ...user,
        roles: [],
        loadingRoles: true
      }));
      
      setUsers(usersWithRoles);
      setFilteredUsers(usersWithRoles);
      
      // Load roles for each user
      for (const user of usersWithRoles) {
        loadUserRoles(user.id);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRoles = async (userId: number) => {
    try {
      const userRolesData = await getUserRoles(userId);
      
      setUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              roles: userRolesData.assignedRoles,
              loadingRoles: false
            };
          }
          return user;
        });
      });
      
      // Also update filtered users
      setFilteredUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              roles: userRolesData.assignedRoles,
              loadingRoles: false
            };
          }
          return user;
        });
      });
    } catch (error) {
      console.error(`Error loading roles for user ${userId}:`, error);
      // Update the user to show loading is complete even if there was an error
      setUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              loadingRoles: false
            };
          }
          return user;
        });
      });
    }
  };

  const handleManageRolesClick = (user: UserWithRoles) => {
    setSelectedUser(user);
    setIsRoleManagementOpen(true);
  };

  const handleRoleManagementClose = () => {
    setIsRoleManagementOpen(false);
  };

  const handleRoleManagementSave = () => {
    setIsRoleManagementOpen(false);
    // Reload roles for the selected user
    if (selectedUser) {
      loadUserRoles(selectedUser.id);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Helper function to get user's full name
  const getUserFullName = (user: UserWithRoles): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || '-';
  };

  // Helper function to format roles as comma-separated string
  const formatRoles = (user: UserWithRoles): React.ReactNode => {
    if (user.loadingRoles) {
      return <CircularProgress size={20} />;
    }
    
    if (!user.roles || user.roles.length === 0) {
      return <Typography variant="body2" color="text.secondary">No roles assigned</Typography>;
    }
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {user.roles.map(role => (
          <Chip
            key={role.id}
            label={role.name}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ margin: '2px' }}
          />
        ))}
      </Box>
    );
  };

  return (
    <>
      <Loader open={loading} message="Loading users..." />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            boxShadow: 24,
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" component="div">
            User Role Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.text.primary,
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 3,
          position: 'relative',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Select a user to manage their roles and permissions.
          </Typography>
          
          {!loading && filteredUsers.length > 0 && (
            <TableContainer 
              component={Paper}
              sx={{
                opacity: loading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out',
                flex: 1
              }}
            >
              <Table>
                <TableHead sx={getTableHeaderStyle()}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned Roles</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username || ''}</TableCell>
                        <TableCell>{user.email || ''}</TableCell>
                        <TableCell>{getUserFullName(user)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.isActive === false ? "Inactive" : "Active"} 
                            color={user.isActive === false ? "error" : "success"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {formatRoles(user)}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Manage Roles">
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              startIcon={<SecurityIcon />}
                              onClick={() => handleManageRolesClick(user)}
                            >
                              Manage Roles
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
          {!loading && filteredUsers.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              color: theme.palette.text.secondary
            }}>
              <Typography>
                {searchQuery ? 'No users found matching your search' : 'No users found'}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {selectedUser && (
        <UserRoleManagement
          open={isRoleManagementOpen}
          userId={selectedUser.id}
          username={selectedUser.username || ''}
          onClose={handleRoleManagementClose}
          onSave={handleRoleManagementSave}
        />
      )}
    </>
  );
};

export default UserRolesDialog; 