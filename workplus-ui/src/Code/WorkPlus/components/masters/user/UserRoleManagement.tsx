import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput,
  CircularProgress,
  Alert
} from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import { useUserRoleService, Role, UserRoles } from './userRoleService';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(role: Role, selectedRoles: Role[], theme: Theme) {
  return {
    fontWeight:
      selectedRoles.findIndex((selected) => selected.id === role.id) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

interface UserRoleManagementProps {
  open: boolean;
  userId: number | null;
  username: string;
  onClose: () => void;
  onSave: () => void;
}

const UserRoleManagement: React.FC<UserRoleManagementProps> = ({
  open,
  userId,
  username,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<UserRoles | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const { getUserRoles, assignUserRoles } = useUserRoleService();

  useEffect(() => {
    if (open && userId) {
      loadUserRoles(userId);
    }
  }, [open, userId]);

  const loadUserRoles = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserRoles(userId);
      setUserRoles(data);
      setSelectedRoles(data.assignedRoles);
      setAvailableRoles(data.availableRoles);
      setAllRoles([...data.assignedRoles, ...data.availableRoles]);
      setLoading(false);
    } catch (err) {
      console.error('Error loading user roles:', err);
      setError('Failed to load user roles. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (event: SelectChangeEvent<number[]>) => {
    const roleIds = event.target.value as number[];
    
    const selected = allRoles.filter(role => roleIds.includes(role.id));
    setSelectedRoles(selected);
  };

  const handleSave = async () => {
    if (!userId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const roleIds = selectedRoles.map(role => role.id);
      await assignUserRoles(userId, roleIds);
      
      setSaving(false);
      onSave();
    } catch (err) {
      console.error('Error saving user roles:', err);
      setError('Failed to save user roles. Please try again.');
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Roles for User: {username}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="role-select-label">Assigned Roles</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    multiple
                    value={selectedRoles.map(role => role.id)}
                    onChange={handleChange}
                    input={<OutlinedInput label="Assigned Roles" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedRoles.map((role) => (
                          <Chip key={role.id} label={role.name} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {allRoles.map((role) => (
                      <MenuItem
                        key={role.id}
                        value={role.id}
                        style={getStyles(role, selectedRoles, theme)}
                      >
                        <Box>
                          <Typography variant="body1">{role.name}</Typography>
                          {role.description && (
                            <Typography variant="caption" color="textSecondary">
                              {role.description}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Current Roles
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, minHeight: '100px' }}>
                  {selectedRoles.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedRoles.map((role) => (
                        <Chip 
                          key={role.id} 
                          label={role.name} 
                          color="primary" 
                          variant="outlined" 
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary">
                      No roles assigned
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary" 
          disabled={loading || saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserRoleManagement; 