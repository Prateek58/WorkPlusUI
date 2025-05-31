import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useHRService } from '../../../services/hrService';
import type { LeaveType } from '../../../services/hrService';

interface LeaveTypeFormDialogProps {
  open: boolean;
  onClose: () => void;
  leaveType?: LeaveType;
  isEdit: boolean;
  onSubmit: () => void;
}

interface LeaveTypeFormData {
  code: string;
  name: string;
  isPaid: boolean;
  appliesTo: string;
  maxDaysPerYear: number | null;
  isActive: boolean;
}

const LeaveTypeFormDialog: React.FC<LeaveTypeFormDialogProps> = ({
  open,
  onClose,
  leaveType,
  isEdit,
  onSubmit
}) => {
  const hrService = useHRService();
  const [formData, setFormData] = useState<LeaveTypeFormData>({
    code: '',
    name: '',
    isPaid: true,
    appliesTo: 'All',
    maxDaysPerYear: null,
    isActive: true,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEdit && leaveType) {
        setFormData({
          code: leaveType.code || '',
          name: leaveType.name || '',
          isPaid: leaveType.isPaid || true,
          appliesTo: leaveType.appliesTo || 'All',
          maxDaysPerYear: leaveType.maxDaysPerYear || null,
          isActive: leaveType.isActive !== false,
        });
      } else {
        resetForm();
      }
      setError('');
    }
  }, [open, isEdit, leaveType]);

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      isPaid: true,
      appliesTo: 'All',
      maxDaysPerYear: null,
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      // Validation
      if (!formData.code.trim()) {
        setError('Leave code is required');
        return;
      }
      if (!formData.name.trim()) {
        setError('Leave name is required');
        return;
      }

      // TODO: Implement API calls when available
      if (isEdit && leaveType) {
        // await hrService.updateLeaveType(leaveType.id, formData);
        console.log('Update leave type:', leaveType.id, formData);
      } else {
        // await hrService.createLeaveType(formData);
        console.log('Create leave type:', formData);
      }

      onSubmit();
    } catch (error: any) {
      console.error('Error saving leave type:', error);
      setError(error.response?.data?.message || 'Failed to save leave type');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Edit Leave Type' : 'Add Leave Type'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Leave Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CL, SL, EL"
                inputProps={{ maxLength: 10 }}
                helperText="Short code for the leave type (max 10 characters)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Leave Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Casual Leave, Sick Leave"
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Applies To</InputLabel>
                <Select
                  value={formData.appliesTo}
                  label="Applies To"
                  onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
                >
                  <MenuItem value="All">All Employees</MenuItem>
                  <MenuItem value="FullTime">Full Time Only</MenuItem>
                  <MenuItem value="PartTime">Part Time Only</MenuItem>
                  <MenuItem value="Contract">Contract Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Days Per Year"
                type="number"
                value={formData.maxDaysPerYear || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  maxDaysPerYear: e.target.value ? parseInt(e.target.value) : null 
                })}
                placeholder="Leave blank for unlimited"
                inputProps={{ min: 0, max: 365 }}
                helperText="Maximum days allowed per year (optional)"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPaid}
                      onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                    />
                  }
                  label="Paid Leave"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveTypeFormDialog; 