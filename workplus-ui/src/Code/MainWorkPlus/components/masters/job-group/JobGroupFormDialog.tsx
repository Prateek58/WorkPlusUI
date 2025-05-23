import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
  Box,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { JobGroup } from './jobGroupService';

interface JobGroupFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (jobGroup: JobGroup) => void;
  jobGroup?: JobGroup | null;
  isEdit: boolean;
}

const defaultJobGroup: JobGroup = {
  groupId: 0,
  groupName: '',
  minWorkers: 1,
  maxWorkers: 10
};

const JobGroupFormDialog: React.FC<JobGroupFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  jobGroup,
  isEdit
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<JobGroup>(defaultJobGroup);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (jobGroup) {
      setFormData(jobGroup);
    } else {
      setFormData(defaultJobGroup);
    }
    setErrors({});
  }, [jobGroup, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    // Parse numeric values
    if (name === 'minWorkers' || name === 'maxWorkers') {
      parsedValue = value === '' ? 0 : parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    }

    if (formData.minWorkers < 1) {
      newErrors.minWorkers = 'Minimum workers must be at least 1';
    }

    if (formData.maxWorkers < formData.minWorkers) {
      newErrors.maxWorkers = 'Maximum workers must be greater than or equal to minimum workers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.default,
          boxShadow: 24,
          borderRadius: 2
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
        <Typography variant="h6">
          {isEdit ? 'Edit Job Group' : 'Create Job Group'}
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
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Group Name"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                error={!!errors.groupName}
                helperText={errors.groupName}
                autoFocus
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Workers"
                name="minWorkers"
                type="number"
                value={formData.minWorkers}
                onChange={handleChange}
                error={!!errors.minWorkers}
                helperText={errors.minWorkers}
                required
                variant="outlined"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Workers"
                name="maxWorkers"
                type="number"
                value={formData.maxWorkers}
                onChange={handleChange}
                error={!!errors.maxWorkers}
                helperText={errors.maxWorkers}
                required
                variant="outlined"
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JobGroupFormDialog; 