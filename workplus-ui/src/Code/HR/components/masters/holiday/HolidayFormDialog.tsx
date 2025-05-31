import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useHRService } from '../../../services/hrService';
import type { Holiday } from '../../../services/hrService';

interface HolidayFormDialogProps {
  open: boolean;
  onClose: () => void;
  holiday?: Holiday;
  isEdit: boolean;
  onSubmit: () => void;
}

interface HolidayFormData {
  holidayDate: Dayjs | null;
  name: string;
  isOptional: boolean;
  isActive: boolean;
}

const HolidayFormDialog: React.FC<HolidayFormDialogProps> = ({
  open,
  onClose,
  holiday,
  isEdit,
  onSubmit
}) => {
  const hrService = useHRService();
  const [formData, setFormData] = useState<HolidayFormData>({
    holidayDate: null,
    name: '',
    isOptional: false,
    isActive: true,
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEdit && holiday) {
        setFormData({
          holidayDate: dayjs(holiday.holidayDate),
          name: holiday.name || '',
          isOptional: holiday.isOptional || false,
          isActive: holiday.isActive !== false,
        });
      } else {
        resetForm();
      }
      setError('');
    }
  }, [open, isEdit, holiday]);

  const resetForm = () => {
    setFormData({
      holidayDate: null,
      name: '',
      isOptional: false,
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);

      // Validation
      if (!formData.holidayDate) {
        setError('Holiday date is required');
        return;
      }
      if (!formData.name.trim()) {
        setError('Holiday name is required');
        return;
      }

      const holidayData = {
        holidayDate: formData.holidayDate.format('YYYY-MM-DD'),
        name: formData.name.trim(),
        isOptional: formData.isOptional,
        isActive: formData.isActive,
      };

      if (isEdit && holiday) {
        await hrService.updateHoliday(holiday.id, holidayData);
      } else {
        await hrService.createHoliday(holidayData);
      }

      onSubmit();
    } catch (error: any) {
      console.error('Error saving holiday:', error);
      setError(error.response?.data?.message || 'Failed to save holiday');
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
        {isEdit ? 'Edit Holiday' : 'Add Holiday'}
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
              <DatePicker
                label="Holiday Date"
                value={formData.holidayDate}
                onChange={(newValue) => setFormData({ ...formData, holidayDate: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: 'Select the date for this holiday'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Holiday Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Independence Day, Diwali"
                inputProps={{ maxLength: 100 }}
                helperText="Name of the holiday"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isOptional}
                      onChange={(e) => setFormData({ ...formData, isOptional: e.target.checked })}
                    />
                  }
                  label="Optional Holiday"
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
              <Typography variant="caption" color="text.secondary">
                Optional holidays can be taken by employees at their discretion
              </Typography>
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

export default HolidayFormDialog; 