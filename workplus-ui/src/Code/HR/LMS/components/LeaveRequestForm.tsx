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
  Chip,
  Autocomplete,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useHRService, CreateLeaveRequest, Worker, LeaveType, LeaveBalance } from '../../services/hrService';

interface LeaveRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedWorkerId?: number;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  open,
  onClose,
  onSuccess,
  preSelectedWorkerId
}) => {
  const hrService = useHRService();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    workerId: preSelectedWorkerId || 0,
    leaveTypeId: 0,
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [error, setError] = useState<string>('');
  const [totalDays, setTotalDays] = useState<number>(0);

  useEffect(() => {
    if (open) {
      loadMasterData();
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (formData.workerId) {
      loadLeaveBalances(formData.workerId);
    }
  }, [formData.workerId]);

  useEffect(() => {
    calculateTotalDays();
  }, [startDate, endDate]);

  const loadMasterData = async () => {
    try {
      const [workersData, leaveTypesData] = await Promise.all([
        hrService.getWorkers(),
        hrService.getLeaveTypes()
      ]);
      setWorkers(workersData.filter(w => w.isActive));
      setLeaveTypes(leaveTypesData.filter(lt => lt.isActive));
    } catch (error) {
      console.error('Error loading master data:', error);
      setError('Failed to load master data');
    }
  };

  const loadLeaveBalances = async (workerId: number) => {
    try {
      const balances = await hrService.getLeaveBalance(workerId);
      setLeaveBalances(balances);
    } catch (error) {
      console.error('Error loading leave balances:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      workerId: preSelectedWorkerId || 0,
      leaveTypeId: 0,
      fromDate: '',
      toDate: '',
      reason: ''
    });
    setSelectedWorker(null);
    setStartDate(null);
    setEndDate(null);
    setError('');
    setTotalDays(0);
    setLeaveBalances([]);
  };

  const calculateTotalDays = () => {
    if (startDate && endDate) {
      const days = endDate.diff(startDate, 'day') + 1;
      setTotalDays(days > 0 ? days : 0);
    } else {
      setTotalDays(0);
    }
  };

  const getAvailableBalance = (leaveTypeId: number): number => {
    const balance = leaveBalances.find(b => b.leaveTypeId === leaveTypeId);
    return balance ? balance.balance : 0;
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (!formData.workerId) {
        setError('Please select a worker');
        return;
      }

      if (!formData.leaveTypeId) {
        setError('Please select leave type');
        return;
      }

      if (!startDate || !endDate) {
        setError('Please select start and end dates');
        return;
      }

      if (endDate.isBefore(startDate)) {
        setError('End date cannot be before start date');
        return;
      }

      if (!formData.reason.trim()) {
        setError('Please provide a reason for leave');
        return;
      }

      // Check available balance
      const availableBalance = getAvailableBalance(formData.leaveTypeId);
      if (totalDays > availableBalance) {
        setError(`Insufficient leave balance. Available: ${availableBalance} days, Requested: ${totalDays} days`);
        return;
      }

      const submitData = {
        ...formData,
        fromDate: startDate.format('YYYY-MM-DD'),
        toDate: endDate.format('YYYY-MM-DD')
      };

      await hrService.createLeaveRequest(submitData);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating leave request:', error);
      setError(error.response?.data?.message || 'Failed to create leave request');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leaveTypeId);
  const availableBalance = getAvailableBalance(formData.leaveTypeId);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Create Leave Request
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
              <Autocomplete
                options={workers}
                getOptionLabel={(option) => option.fullName}
                value={selectedWorker}
                onChange={(_, newValue) => {
                  setSelectedWorker(newValue);
                  setFormData({ ...formData, workerId: newValue?.workerId || 0 });
                }}
                disabled={!!preSelectedWorkerId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Worker"
                    required
                    placeholder="Search workers..."
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.workerId}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{option.fullName}</div>
                      {option.phone && (
                        <div style={{ fontSize: '0.8em', color: 'gray' }}>
                          📞 {option.phone}
                        </div>
                      )}
                    </div>
                  </li>
                )}
                clearOnEscape
                clearText="Clear"
                noOptionsText="No workers found"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={formData.leaveTypeId}
                  label="Leave Type"
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: Number(e.target.value) })}
                >
                  <MenuItem value={0}>Select Leave Type</MenuItem>
                  {leaveTypes.map((leaveType) => (
                    <MenuItem key={leaveType.id} value={leaveType.id}>
                      {leaveType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedLeaveType && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Leave Type Details:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedLeaveType.description}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={`Max per year: ${selectedLeaveType.maxDaysPerYear} days`} 
                      size="small" 
                      color="info"
                    />
                    <Chip 
                      label={`Available: ${availableBalance} days`} 
                      size="small" 
                      color={availableBalance > 0 ? "success" : "error"}
                    />
                    {selectedLeaveType.carryForward && (
                      <Chip label="Carry Forward Allowed" size="small" color="secondary" />
                    )}
                  </Box>
                </Box>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  minDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    },
                    popper: {
                      placement: 'auto',
                      modifiers: [
                        {
                          name: 'flip',
                          enabled: true,
                          options: {
                            altBoundary: true,
                            rootBoundary: 'viewport',
                            padding: 8,
                          },
                        },
                        {
                          name: 'preventOverflow',
                          enabled: true,
                          options: {
                            altAxis: true,
                            altBoundary: true,
                            tether: true,
                            rootBoundary: 'viewport',
                            padding: 8,
                          },
                        },
                      ],
                    }
                  }}
                />
                {startDate && (
                  <IconButton
                    size="small"
                    onClick={() => setStartDate(null)}
                    sx={{
                      position: 'absolute',
                      right: '40px', // Position before the calendar icon
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 1
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate || dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    },
                    popper: {
                      placement: 'auto',
                      modifiers: [
                        {
                          name: 'flip',
                          enabled: true,
                          options: {
                            altBoundary: true,
                            rootBoundary: 'viewport',
                            padding: 8,
                          },
                        },
                        {
                          name: 'preventOverflow',
                          enabled: true,
                          options: {
                            altAxis: true,
                            altBoundary: true,
                            tether: true,
                            rootBoundary: 'viewport',
                            padding: 8,
                          },
                        },
                      ],
                    }
                  }}
                />
                {endDate && (
                  <IconButton
                    size="small"
                    onClick={() => setEndDate(null)}
                    sx={{
                      position: 'absolute',
                      right: '40px', // Position before the calendar icon
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 1
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Grid>

            {totalDays > 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Total leave days: <strong>{totalDays} days</strong>
                  {formData.leaveTypeId > 0 && (
                    <> | Available balance: <strong>{availableBalance} days</strong></>
                  )}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Reason for Leave"
                multiline
                rows={6}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please provide a detailed reason for your leave request..."
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '140px'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={totalDays === 0 || totalDays > availableBalance}
        >
          Submit Leave Request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveRequestForm; 