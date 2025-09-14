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
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  SelectChangeEvent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Job, JobCreate, JobType } from './jobService';

interface JobFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (job: Job | JobCreate) => void;
  job?: Job | null;
  isEdit: boolean;
  jobTypes: JobType[];
  userId: number;
}

const defaultJob: JobCreate = {
  jobName: '',
  jobTypeId: 0,
  ratePerItem: null,
  ratePerHour: null,
  expectedHours: null,
  expectedItemsPerHour: null,
  incentiveBonusRate: null,
  penaltyRate: null,
  incentiveType: 'PerUnit',
  createdBy: 0
};

const JobFormDialog: React.FC<JobFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  job,
  isEdit,
  jobTypes,
  userId
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<Job | JobCreate>(defaultJob);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && job) {
      setFormData(job);
    } else {
      setFormData({
        ...defaultJob,
        createdBy: userId
      });
    }
  }, [isEdit, job, userId, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.jobName.trim()) {
      newErrors.jobName = 'Job name is required';
    }

    if (!formData.jobTypeId) {
      newErrors.jobTypeId = 'Job type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    // Clear rate values when job type changes
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    if (name === 'jobTypeId') {
      updatedFormData.ratePerHour = null;
      updatedFormData.ratePerItem = null;
    }
    
    setFormData(updatedFormData);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData({
      ...formData,
      [name]: value === '' ? null : Number(value)
    });
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Get selected job type name for conditional rendering
  const selectedJobType = jobTypes.find(type => type.jobTypeId === formData.jobTypeId);
  const selectedJobTypeName = selectedJobType?.jobTypeName?.toLowerCase() || '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEdit ? 'Edit Job' : 'Add New Job'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid mb={2} container spacing={2} sx={{ mt: 1, mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              name="jobName"
              label="Job Name"
              fullWidth
              required
              value={formData.jobName}
              onChange={handleChange}
              error={!!errors.jobName}
              helperText={errors.jobName}
            />
          </Grid>
          <Grid mb={2} item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.jobTypeId}>
              <InputLabel id="job-type-label">Job Type</InputLabel>
              <Select
                labelId="job-type-label"
                name="jobTypeId"
                value={formData.jobTypeId}
                onChange={handleSelectChange}
                label="Job Type"
              >
                <MenuItem value={0} disabled>Select Job Type</MenuItem>
                {jobTypes.map((type) => (
                  <MenuItem key={type.jobTypeId} value={type.jobTypeId}>
                    {type.jobTypeName}
                  </MenuItem>
                ))}
              </Select>
              {errors.jobTypeId && <FormHelperText>{errors.jobTypeId}</FormHelperText>}
            </FormControl>
          </Grid>
          {selectedJobTypeName !== 'hourly' && (
            <Grid mb={2} item xs={12} md={6}>
              <TextField
                name="ratePerItem"
                label="Rate Per Item"
                fullWidth
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { step: 0.01, min: 0 }
                }}
                value={formData.ratePerItem ?? ''}
                onChange={handleNumberChange}
              />
            </Grid>
          )}
          {selectedJobTypeName !== 'rateperitem' && (
            <Grid item xs={12} md={6}>
              <TextField
                name="ratePerHour"
                label="Rate Per Hour"
                fullWidth
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  inputProps: { step: 0.01, min: 0 }
                }}
                value={formData.ratePerHour ?? ''}
                onChange={handleNumberChange}
              />
            </Grid>
          )}
          <Grid mb={2} item xs={12} md={6}>
            <TextField
              name="expectedHours"
              label="Expected Hours"
              fullWidth
              type="number"
              InputProps={{
                inputProps: { step: 0.1, min: 0 }
              }}
              value={formData.expectedHours ?? ''}
              onChange={handleNumberChange}
            />
          </Grid>
          <Grid mb={2} item xs={12} md={6}>
            <TextField
              name="expectedItemsPerHour"
              label="Expected Items Per Hour"
              fullWidth
              type="number"
              InputProps={{
                inputProps: { step: 1, min: 0 }
              }}
              value={formData.expectedItemsPerHour ?? ''}
              onChange={handleNumberChange}
            />
          </Grid>
          <Grid mb={2} item xs={12} md={6}>
            <TextField
              name="incentiveBonusRate"
              label="Incentive Bonus Rate"
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { step: 0.01, min: 0 }
              }}
              value={formData.incentiveBonusRate ?? ''}
              onChange={handleNumberChange}
            />
          </Grid>
          <Grid mb={2} item xs={12} md={6}>
            <TextField
              name="penaltyRate"
              label="Penalty Rate"
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                inputProps: { step: 0.01, min: 0 }
              }}
              value={formData.penaltyRate ?? ''}
              onChange={handleNumberChange}
            />
          </Grid>
          <Grid mb={2} item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="incentive-type-label">Incentive Type</InputLabel>
              <Select
                labelId="incentive-type-label"
                name="incentiveType"
                value={formData.incentiveType || 'PerUnit'}
                onChange={handleSelectChange}
                label="Incentive Type"
              >
                <MenuItem value="PerUnit">Per Unit</MenuItem>
                <MenuItem value="Percentage">Percentage</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobFormDialog;