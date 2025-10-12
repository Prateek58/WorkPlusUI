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
    Tabs,
    Tab,
  } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Refresh as RefreshIcon, Edit as EditIcon } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useHRService, BulkAttendance, Worker, AttendanceRecord } from '../../services/hrService';
import AttendanceForm from './AttendanceForm';

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
  const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceRecord | undefined>>({});
  const [editFormOpen, setEditFormOpen] = useState<boolean>(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  // Load attendance records for the selected date to enable sorting and edit actions
  useEffect(() => {
    const loadAttendanceForDate = async () => {
      if (!attendanceDate) return;
      try {
        const records = await hrService.getAttendance(attendanceDate.format('YYYY-MM-DD'));
        const map: Record<number, AttendanceRecord> = {};
        records.forEach(r => { map[r.workerId] = r; });
        setAttendanceMap(map);
      } catch (error) {
        console.error('Error loading attendance for date:', error);
      }
    };
    loadAttendanceForDate();
  }, [attendanceDate, open]);

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
    setAttendanceMap({});
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
        // Refresh attendance map after successful bulk mark
        if (attendanceDate) {
          const records = await hrService.getAttendance(attendanceDate.format('YYYY-MM-DD'));
          const map: Record<number, AttendanceRecord> = {};
          records.forEach(r => { map[r.workerId] = r; });
          setAttendanceMap(map);
        }
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

  const getStatusPriority = (workerId: number) => {
    const rec = attendanceMap[workerId];
    const status = rec?.status?.toLowerCase();
    if (status === 'present') return 0;
    if (status === 'absent') return 1;
    if (status === 'half day') return 2;
    return 3; // unmarked or other statuses
  };

  const getStatusLabelAndColor = (workerId: number): { label: string; color: 'success'|'error'|'warning'|'default' } => {
    const rec = attendanceMap[workerId];
    if (!rec) return { label: 'Unmarked', color: 'default' };
    const status = rec.status;
    if (status === 'Present') return { label: 'Present', color: 'success' };
    if (status === 'Absent') return { label: 'Absent', color: 'error' };
    if (status === 'Half Day') {
      const suffix = rec.halfDayType ? ` - ${rec.halfDayType}` : '';
      return { label: `Half Day${suffix}` , color: 'warning' };
    }
    return { label: status, color: 'default' };
  };

  const sortedWorkers = [...workers].sort((a, b) => {
    const prioDiff = getStatusPriority(a.workerId) - getStatusPriority(b.workerId);
    if (prioDiff !== 0) return prioDiff;
    return a.fullName.localeCompare(b.fullName);
  });

  const filteredWorkers = sortedWorkers.filter((worker) => {
    const rec = attendanceMap[worker.workerId];
    switch (statusFilter) {
      case 'present':
        return rec?.status === 'Present';
      case 'absent':
        return rec?.status === 'Absent';
      case 'firstHalf':
        return rec?.status === 'Half Day' && rec?.halfDayType === 'First Half';
      case 'secondHalf':
        return rec?.status === 'Half Day' && rec?.halfDayType === 'Second Half';
      case 'unmarked':
        return !rec;
      default:
        return true; // 'all'
    }
  });

  const handleEditClick = (workerId: number) => {
    const rec = attendanceMap[workerId];
    if (rec) {
      setEditRecord(rec);
      setEditFormOpen(true);
    }
  };

  const handleEditClose = () => {
    setEditFormOpen(false);
    setEditRecord(null);
  };

  const handleEditSuccess = async () => {
    // Refresh the attendance map to reflect edits
    if (attendanceDate) {
      const records = await hrService.getAttendance(attendanceDate.format('YYYY-MM-DD'));
      const map: Record<number, AttendanceRecord> = {};
      records.forEach(r => { map[r.workerId] = r; });
      setAttendanceMap(map);
    }
    setEditFormOpen(false);
    setEditRecord(null);
    onSuccess();
  };

  return (
    <>
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

              <Box sx={{ mt: 1, mb: 1 }}>
                <Tabs
                  value={statusFilter}
                  onChange={(_, v) => setStatusFilter(v)}
                  variant="scrollable"
                  scrollButtons
                  allowScrollButtonsMobile
                >
                  <Tab label="All" value="all" />
                  <Tab label="Present" value="present" />
                  <Tab label="Absent" value="absent" />
                  <Tab label="First Half" value="firstHalf" />
                  <Tab label="Second Half" value="secondHalf" />
                  <Tab label="Unmarked" value="unmarked" />
                </Tabs>
              </Box>

              <Paper sx={{ maxHeight: 300, overflow: 'auto', mt: 1 }}>
                <List dense>
                  {filteredWorkers.map((worker) => (
                    <ListItem
                      key={worker.workerId}
                      button
                      onClick={() => handleWorkerToggle(worker.workerId)}
                      sx={(theme) => {
                        const { color } = getStatusLabelAndColor(worker.workerId);
                        const paletteColor = 
                          color === 'success' ? theme.palette.success.main :
                          color === 'error' ? theme.palette.error.main :
                          color === 'warning' ? theme.palette.warning.main :
                          theme.palette.grey[500];
                        return {
                          borderLeft: `4px solid ${paletteColor}`,
                          bgcolor: `${paletteColor}15`,
                          '&:hover': { bgcolor: `${paletteColor}25` }
                        };
                      }}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          size="small"
                          label={getStatusLabelAndColor(worker.workerId).label}
                          color={getStatusLabelAndColor(worker.workerId).color as any}
                          variant={getStatusLabelAndColor(worker.workerId).color === 'default' ? 'outlined' : 'filled'}
                        />
                        <IconButton 
                          size="small" 
                          onClick={(e) => { e.stopPropagation(); handleEditClick(worker.workerId); }}
                          disabled={!attendanceMap[worker.workerId]}
                          title={attendanceMap[worker.workerId] ? 'Edit attendance' : 'Not marked yet'}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
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
    <AttendanceForm 
      open={editFormOpen}
      onClose={handleEditClose}
      onSuccess={handleEditSuccess}
      editRecord={editRecord}
    />
    </>
  );
};

export default BulkAttendanceForm;