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
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Autocomplete,
  Chip,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useHRService, BulkAttendance, Worker } from '../../services/hrService';

interface BulkAttendanceFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkAttendanceForm: React.FC<BulkAttendanceFormProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const hrService = useHRService();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<Worker[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<Dayjs | null>(dayjs());
  const [status, setStatus] = useState<string>('Present');
  const [halfDayType, setHalfDayType] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [dateValidationWarning, setDateValidationWarning] = useState<string>('');
  const [canOverrideDate, setCanOverrideDate] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      loadWorkers();
      resetForm();
    } else {
      resetForm();
    }
  }, [open]);

  // Separate useEffect for validating attendance date
  useEffect(() => {
    if (attendanceDate) {
      validateAttendanceDate();
    }
  }, [attendanceDate]);

  const loadWorkers = async () => {
    try {
      const workersData = await hrService.getWorkers();
      setWorkers(workersData.filter(w => w.isActive));
    } catch (error) {
      console.error('Error loading workers:', error);
      setError('Failed to load workers');
    }
  };

  const resetForm = () => {
    setSelectedWorkers([]);
    setAttendanceDate(dayjs());
    setStatus('Present');
    setHalfDayType('');
    setRemarks('');
    setError('');
    setSelectAll(false);
  };

  const handleWorkerToggle = (workerId: number) => {
    setSelectedWorkers(prev => {
      if (prev.some(w => w.workerId === workerId)) {
        return prev.filter(w => w.workerId !== workerId);
      } else {
        return [...prev, workers.find(w => w.workerId === workerId) as Worker];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(workers);
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = async () => {
    try {
      setError('');

      // Validate required fields
      if (selectedWorkers.length === 0) {
        setError('Please select at least one worker');
        return;
      }

      if (!attendanceDate) {
        setError('Please select attendance date');
        return;
      }

      if (status === 'Half Day' && !halfDayType) {
        setError('Please select half day type when status is Half Day');
        return;
      }

      // Validate attendance date if there's a warning and no override
      if (dateValidationWarning) {
        setError('Cannot mark attendance on this date. Please select a valid working day.');
        return;
      }

      const bulkData: BulkAttendance = {
        attendanceDate: attendanceDate.format('YYYY-MM-DD'),
        workerIds: selectedWorkers.map(w => w.workerId),
        status,
        halfDayType: status === 'Half Day' ? halfDayType : undefined,
        remarks
      };

      const result = await hrService.markBulkAttendance(bulkData);
      
      // Show success message with warnings if any
      if (result.hasWarnings && result.skippedWorkers.length > 0) {
        const warningMessage = `${result.message}\n\nSkipped workers with leave requests:\n${result.skippedWorkers.join('\n')}`;
        setError(warningMessage);
        // Don't close the dialog immediately so user can see the warning
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 5000); // Increased to 5 seconds for better readability
      } else {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error marking bulk attendance:', error);
      setError(error.response?.data?.message || 'Failed to mark bulk attendance');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateAttendanceDate = async () => {
    if (!attendanceDate) return;

    try {
      const validation = await hrService.validateAttendanceDate(attendanceDate.format('YYYY-MM-DD'));
      
      if (!validation.isValid) {
        setDateValidationWarning(validation.message || 'This date is not valid for attendance marking');
        setCanOverrideDate(validation.canOverride || false);
      } else {
        setDateValidationWarning('');
        setCanOverrideDate(false);
      }
    } catch (error) {
      console.error('Error validating attendance date:', error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Mark Bulk Attendance
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {dateValidationWarning && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dateValidationWarning}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <DatePicker
                  label="Attendance Date"
                  value={attendanceDate}
                  onChange={(newValue) => setAttendanceDate(newValue)}
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
                    onClick={() => setAttendanceDate(null)}
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
                  value={status}
                  label="Status"
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setStatus(newStatus);
                    if (newStatus !== 'Half Day') {
                      setHalfDayType('');
                    }
                  }}
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                  <MenuItem value="Late">Late</MenuItem>
                  <MenuItem value="Half Day">Half Day</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {status === 'Half Day' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Half Day Type</InputLabel>
                  <Select
                    value={halfDayType}
                    label="Half Day Type"
                    onChange={(e) => setHalfDayType(e.target.value)}
                  >
                    <MenuItem value="First Half">First Half</MenuItem>
                    <MenuItem value="Second Half">Second Half</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional remarks for all selected workers..."
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '100px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Workers ({selectedWorkers.length} selected)
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    indeterminate={selectedWorkers.length > 0 && selectedWorkers.length < workers.length}
                  />
                }
                label="Select All Workers"
              />

              <Paper sx={{ maxHeight: 300, overflow: 'auto', mt: 1 }}>
                <List dense>
                  {workers.map((worker) => (
                    <ListItem
                      key={worker.workerId}
                      button
                      onClick={() => handleWorkerToggle(worker.workerId)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedWorkers.some(w => w.workerId === worker.workerId)}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={worker.fullName}
                        secondary={
                          <>
                            {worker.phone && `📞 ${worker.phone}`}
                            {worker.email && ` | 📧 ${worker.email}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={selectedWorkers.length === 0 || !!dateValidationWarning}
        >
          Mark Attendance for {selectedWorkers.length} Workers
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAttendanceForm; 