import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  Typography,
  Box,
  useTheme,
  FormControlLabel,
  Switch
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { User, useUserService } from './userService';
import Loader from '../../../../Common/components/Loader';
import Notification from '../../../../Common/components/Notification';
import axios from 'axios';
import { API_URL } from '../../../config';

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User;
  isEdit?: boolean;
  onSubmit: (user: User) => Promise<void>;
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({ 
  open, 
  onClose, 
  user,
  isEdit = false,
  onSubmit
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState<Partial<User>>(() => {
    // Only initialize with user data if it's an edit operation
    if (isEdit && user) {
      return {
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isActive: user.isActive === null || user.isActive === undefined ? true : user.isActive,
        // Don't include passwordHash in the form
        password: '' // Empty for edit mode
      };
    }
    return {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      isActive: true,
      password: ''
    };
  });

  // Re-initialize form data when user changes
  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isActive: user.isActive === null || user.isActive === undefined ? true : user.isActive,
        password: ''
      });
    }
  }, [isEdit, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    setLoading(true);
    setStartTime(Date.now());
    try {
      // Prepare user data for submission
      let submitData: User;
      
      if (isEdit && user) {
        // For edit mode, start with the original user data
        submitData = {
          ...user,
          email: formData.email || user.email,
          firstName: formData.firstName || user.firstName,
          lastName: formData.lastName || user.lastName,
          isActive: formData.isActive === undefined ? user.isActive : formData.isActive,
          updatedAt: new Date().toISOString()
        };
        
        // If password is provided, update it through Auth API to ensure proper hashing
        if (formData.password && formData.password.trim() !== '') {
          try {
            // This assumes you have an endpoint to update user password
            await axios.post(`${API_URL}/Auth/updatePassword`, {
              userId: user.id,
              newPassword: formData.password
            });
            console.log('Password updated successfully');
          } catch (error) {
            console.error('Error updating password:', error);
            throw new Error('Failed to update password');
          }
        }
      } else {
        // For new user, we'll rely on the backend API to hash the password correctly
        submitData = {
          id: 0,
          username: formData.username || '',
          email: formData.email || '',
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          isActive: formData.isActive === undefined ? true : formData.isActive,
          passwordHash: '', // Will be set by backend
          password: formData.password, // Pass the plain password to API
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      console.log('Submitting user data:', submitData);
      await onSubmit(submitData);
      console.log('Submission successful');
      setNotification({
        open: true,
        message: isEdit ? 'User updated successfully!' : 'User added successfully!',
        severity: 'success'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setNotification({
        open: true,
        message: isEdit ? 'Failed to update user!' : 'Failed to add user!',
        severity: 'error'
      });
    } finally {
      // Ensure loader shows for at least 4 seconds
      const elapsedTime = Date.now() - (startTime || Date.now());
      const remainingTime = Math.max(0, 4000 - elapsedTime);
      console.log('Elapsed time:', elapsedTime, 'Remaining time:', remainingTime);
      
      if (remainingTime > 0) {
        console.log('Setting final timeout for:', remainingTime);
        setTimeout(() => {
          console.log('Final timeout completed');
          setLoading(false);
        }, remainingTime);
      } else {
        console.log('No remaining time needed');
        setLoading(false);
      }
    }
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Loader 
        open={loading} 
        message={isEdit ? "Loading user data..." : "Preparing form..."} 
      />
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.default,
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
            {isEdit ? 'Edit User' : 'Add New User'}
          </Typography>
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
        </DialogTitle>

        <DialogContent sx={{ p: 3}}>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3} mt={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleChange}
                  disabled={isEdit} // Username can't be changed in edit mode
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
                  name="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={handleChange}
                  required={!isEdit} // Required only for new users
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive === true}
                      onChange={handleChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserFormDialog; 