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
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import UserFormDialog from './UserFormDialog';
import UserRoleManagement from './UserRoleManagement';
import Loader from '../../../../Common/components/Loader';
import { User, useUserService } from './userService';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface UsersDialogProps {
  open: boolean;
  onClose: () => void;
}

const UsersDialog: React.FC<UsersDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isRoleManagementOpen, setIsRoleManagementOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { getUsers, getUser, createUser, updateUser } = useUserService();

  useEffect(() => {
    if (open) {
      loadUsers();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setUsers([]);
      setFilteredUsers([]);
      setSelectedUser(null);
      setIsFormOpen(false);
      setIsEdit(false);
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
        user.id.toString().includes(searchQuery)
      );
    });
    setFilteredUsers(filtered);
    setPage(0); // Reset to first page when search changes
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditClick = async (user: User) => {
    setLoading(true);
    try {
      const userData = await getUser(user.id);
      setSelectedUser(userData);
      setIsEdit(true);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageRolesClick = (user: User) => {
    setSelectedUser(user);
    setIsRoleManagementOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
    setIsEdit(false);
  };

  const handleRoleManagementClose = () => {
    setIsRoleManagementOpen(false);
  };

  const handleRoleManagementSave = () => {
    setIsRoleManagementOpen(false);
    loadUsers(); // Refresh the users list
  };

  const handleFormSubmit = async (user: User) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateUser(user);
      } else {
        await createUser(user);
      }
      await loadUsers();
      handleFormClose();
    } finally {
      setLoading(false);
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
  const getUserFullName = (user: User): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || '-';
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
            Users
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
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add User
            </Button>
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
                <TableHead
                  sx={getTableHeaderStyle()}
                >
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
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
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(user)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Manage Roles">
                            <IconButton
                              size="small"
                              onClick={() => handleManageRolesClick(user)}
                              color="secondary"
                            >
                              <LockPersonIcon />
                            </IconButton>
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

      <UserFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        user={selectedUser || undefined}
        isEdit={isEdit}
        onSubmit={handleFormSubmit}
      />

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

export default UsersDialog; 