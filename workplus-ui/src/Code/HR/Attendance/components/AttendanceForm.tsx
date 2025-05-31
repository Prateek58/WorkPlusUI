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
  Autocomplete,
  IconButton,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useHRService, CreateAttendance, Worker, AttendanceRecord } from '../../services/hrService';

interface AttendanceFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRecord?: AttendanceRecord | null;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  open,
  onClose,
  onSuccess,
  editRecord
}) => {
  const hrService = useHRService();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [formData, setFormData] = useState<CreateAttendance>({
    workerId: 0,
    attendanceDate: dayjs().format('YYYY-MM-DD'),
    checkInTime: '',
    checkOutTime: '',
    status: 'Present',
    halfDayType: '',
    remarks: '',
    isOvertime: false,
    isHolidayWork: false,
    isPaid: true,
    overtimeHours: 0,
    compOffEarned: 0,
    payMultiplier: 1.0,
    attendanceType: 'Regular'
  });
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [checkInTime, setCheckInTime] = useState<Dayjs | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Dayjs | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<Dayjs | null>(dayjs());
  const [error, setError] = useState<string>('');
  const [leaveConflictWarning, setLeaveConflictWarning] = useState<string>('');
  const [dateValidationWarning, setDateValidationWarning] = useState<string>('');
  const [canOverrideDate, setCanOverrideDate] = useState<boolean>(false);
  const [showOverrideOption, setShowOverrideOption] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      loadWorkers();
      if (editRecord) {
        setFormData({
          workerId: editRecord.workerId,
          attendanceDate: editRecord.attendanceDate,
          checkInTime: editRecord.checkInTime || '',
          checkOutTime: editRecord.checkOutTime || '',
          status: editRecord.status,
          halfDayType: editRecord.halfDayType || '',
          remarks: editRecord.remarks || '',
          isOvertime: editRecord.isOvertime || false,
          isHolidayWork: editRecord.isHolidayWork || false,
          isPaid: editRecord.isPaid || true,
          overtimeHours: editRecord.overtimeHours || 0,
          compOffEarned: editRecord.compOffEarned || 0,
          payMultiplier: editRecord.payMultiplier || 1.0,
          attendanceType: editRecord.attendanceType || 'Regular'
        });
        setAttendanceDate(dayjs(editRecord.attendanceDate));
        setCheckInTime(editRecord.checkInTime ? dayjs(editRecord.checkInTime, 'HH:mm') : null);
        setCheckOutTime(editRecord.checkOutTime ? dayjs(editRecord.checkOutTime, 'HH:mm') : null);
        // Find and set the selected worker
        const worker = workers.find(w => w.workerId === editRecord.workerId);
        setSelectedWorker(worker || null);
      } else {
        resetForm();
      }
    }
  }, [open, editRecord]);

  // Check for leave conflicts when worker or date changes
  useEffect(() => {
    if (formData.workerId && attendanceDate) {
      checkLeaveConflicts();
    } else {
      // Clear warning if no worker or date selected
      setLeaveConflictWarning('');
    }
  }, [formData.workerId, attendanceDate]);

  useEffect(() => {
    if (selectedWorker && attendanceDate) {
      checkLeaveConflicts();
      validateAttendanceForDate();
    }
  }, [selectedWorker, attendanceDate]);

  const checkLeaveConflicts = async () => {
    if (!formData.workerId || !attendanceDate) {
      setLeaveConflictWarning('');
      return;
    }
    
    try {
      console.log('Checking leave conflicts for worker:', formData.workerId, 'date:', attendanceDate.format('YYYY-MM-DD'));
      
      const result = await hrService.checkLeaveConflict(
        formData.workerId, 
        attendanceDate.format('YYYY-MM-DD')
      );
      
      console.log('Leave conflict result:', result);
      
      if (result.hasConflict) {
        setLeaveConflictWarning(result.message || 'Worker has leave request for this date');
      } else {
        setLeaveConflictWarning('');
      }
    } catch (error) {
      console.error('Error checking leave conflicts:', error);
      // Clear warning on error to prevent stale data
      setLeaveConflictWarning('');
    }
  };

  const checkLeaveConflictForDate = async () => {
    if (!attendanceDate) return;

    try {
      const validation = await hrService.validateAttendanceDate(attendanceDate.format('YYYY-MM-DD'));
      
      if (!validation.isValid) {
        setDateValidationWarning(validation.message || 'This date is not valid for attendance marking');
        setCanOverrideDate(validation.canOverride || false);
        setShowOverrideOption(validation.canOverride || false);
      } else {
        setDateValidationWarning('');
        setCanOverrideDate(false);
        setShowOverrideOption(false);
      }
    } catch (error) {
      console.error('Error checking date validation:', error);
    }
  };

  const validateAttendanceForDate = async () => {
    if (!attendanceDate) return;

    try {
      const validation = await hrService.validateAttendanceDate(attendanceDate.format('YYYY-MM-DD'));
      
      if (!validation.isValid) {
        setDateValidationWarning(validation.message || 'This date is not valid for attendance marking');
        setCanOverrideDate(validation.canOverride || false);
        setShowOverrideOption(validation.canOverride || false);
      } else {
        setDateValidationWarning('');
        setCanOverrideDate(false);
        setShowOverrideOption(false);
      }
    } catch (error) {
      console.error('Error validating attendance date:', error);
    }
  };

  const loadWorkers = async () => {
    try {
      const workersData = await hrService.getWorkers();
      setWorkers(workersData);
    } catch (error) {
      console.error('Error loading workers:', error);
      setError('Failed to load workers');
    }
  };

  const resetForm = () => {
    setFormData({
      workerId: 0,
      attendanceDate: dayjs().format('YYYY-MM-DD'),
      checkInTime: '',
      checkOutTime: '',
      status: 'Present',
      halfDayType: '',
      remarks: '',
      isOvertime: false,
      isHolidayWork: false,
      isPaid: true,
      overtimeHours: 0,
      compOffEarned: 0,
      payMultiplier: 1.0,
      attendanceType: 'Regular'
    });
    setSelectedWorker(null);
    setAttendanceDate(dayjs());
    setCheckInTime(null);
    setCheckOutTime(null);
    setError('');
    setLeaveConflictWarning('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setDateValidationWarning('');

      // Validate form data
      if (!selectedWorker) {
        setError('Please select a worker');
        return;
      }

      if (!attendanceDate) {
        setError('Please select attendance date');
        return;
      }

      // Validate attendance date
      const dateValidation = await hrService.validateAttendanceDate(attendanceDate.format('YYYY-MM-DD'));
      if (!dateValidation.isValid) {
        setDateValidationWarning(dateValidation.message || 'Invalid attendance date');
        return;
      }

      // Check for leave conflicts if a worker is selected
      if (selectedWorker && attendanceDate) {
        const conflict = await hrService.checkLeaveConflict(
          selectedWorker.workerId, 
          attendanceDate.format('YYYY-MM-DD')
        );
        if (conflict.hasConflict) {
          setLeaveConflictWarning(
            conflict.message || `Worker has ${conflict.leaveStatus} on this date`
          );
          return;
        }
      }

      const submitData = {
        ...formData,
        attendanceDate: attendanceDate?.format('YYYY-MM-DD') || formData.attendanceDate,
        checkInTime: checkInTime?.format('HH:mm') || '',
        checkOutTime: checkOutTime?.format('HH:mm') || ''
      };

      if (editRecord) {
        await hrService.updateAttendance(editRecord.id, submitData);
      } else {
        await hrService.markAttendance(submitData);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      setError(error.response?.data?.message || 'Failed to save attendance');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editRecord ? 'Edit Attendance' : 'Mark Attendance'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {leaveConflictWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {leaveConflictWarning}
            </Alert>
          )}
          
          {dateValidationWarning && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dateValidationWarning}
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
              <Box sx={{ position: 'relative' }}>
                <DatePicker
                  label="Attendance Date"
                  value={attendanceDate}
                  onChange={(newValue) => {
                    console.log('Date changed to:', newValue?.format('YYYY-MM-DD'));
                    setAttendanceDate(newValue);
                    // Clear any existing warnings when date changes to prevent stale data
                    setLeaveConflictWarning('');
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
                {attendanceDate && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setAttendanceDate(null);
                      setLeaveConflictWarning('');
                    }}
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
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setFormData({ 
                      ...formData, 
                      status: newStatus,
                      halfDayType: newStatus === 'Half Day' ? formData.halfDayType : ''
                    });
                  }}
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                  <MenuItem value="Late">Late</MenuItem>
                  <MenuItem value="Half Day">Half Day</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Comp Off Used">Comp Off Used</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.status === 'Half Day' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Half Day Type</InputLabel>
                  <Select
                    value={formData.halfDayType}
                    label="Half Day Type"
                    onChange={(e) => setFormData({ ...formData, halfDayType: e.target.value })}
                  >
                    <MenuItem value="First Half">First Half</MenuItem>
                    <MenuItem value="Second Half">Second Half</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TimePicker
                label="Check In Time"
                value={checkInTime}
                onChange={(newValue) => setCheckInTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TimePicker
                label="Check Out Time"
                value={checkOutTime}
                onChange={(newValue) => setCheckOutTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={5}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Optional remarks..."
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '120px'
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
          disabled={!!leaveConflictWarning || !!dateValidationWarning}
        >
          {editRecord ? 'Update' : 'Mark'} Attendance
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceForm; 