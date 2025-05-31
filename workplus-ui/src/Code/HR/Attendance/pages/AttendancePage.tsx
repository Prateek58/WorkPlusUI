import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Groups as GroupsIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useHRService, AttendanceRecord, Worker } from '../../services/hrService';
import AttendanceForm from '../components/AttendanceForm';
import BulkAttendanceForm from '../components/BulkAttendanceForm';
import { useConfirm } from '../../../Common/hooks/useConfirm';
import DashboardLayout from '../../../Common/components/DashboardLayout';

const AttendancePage: React.FC = () => {
  const hrService = useHRService();
  const { showConfirmDialog } = useConfirm();
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [filterDate, setFilterDate] = useState<Dayjs | null>(dayjs());
  const [filterWorker, setFilterWorker] = useState<Worker | null>(null);
  
  // Dialogs
  const [attendanceFormOpen, setAttendanceFormOpen] = useState(false);
  const [bulkFormOpen, setBulkFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [filterDate, filterWorker]);

  const loadInitialData = async () => {
    try {
      const workersData = await hrService.getWorkers();
      setWorkers(workersData.filter(w => w.isActive));
      await loadAttendance();
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load data');
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      
      const date = filterDate?.format('YYYY-MM-DD');
      const workerId = filterWorker?.workerId || undefined;
      
      const records = await hrService.getAttendance(date, workerId);
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditRecord(record);
    setAttendanceFormOpen(true);
  };

  const handleDelete = (record: AttendanceRecord) => {
    showConfirmDialog({
      title: 'Delete Attendance Record',
              message: `Are you sure you want to delete attendance record for ${record.workerName} on ${dayjs(record.attendanceDate).format('DD/MM/YYYY')}?`,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await hrService.deleteAttendance(record.id);
          await loadAttendance();
        } catch (error) {
          console.error('Error deleting attendance:', error);
          setError('Failed to delete attendance record');
        }
      }
    });
  };

  const handleFormSuccess = () => {
    loadAttendance();
    setEditRecord(null);
  };

  const handleFormClose = () => {
    setAttendanceFormOpen(false);
    setEditRecord(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'half day': return 'info';
      case 'on leave': return 'secondary';
      default: return 'default';
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return dayjs(time, 'HH:mm').format('hh:mm A');
  };

  const calculateTotalHours = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return '-';
    const start = dayjs(checkIn, 'HH:mm');
    const end = dayjs(checkOut, 'HH:mm');
    const hours = end.diff(start, 'hour', true);
    return hours > 0 ? `${hours.toFixed(1)}h` : '-';
  };

  // Statistics - based on selected filter date
  const selectedDateRecords = filterDate 
    ? attendanceRecords.filter(r => 
        dayjs(r.attendanceDate).isSame(filterDate, 'day')
      )
    : attendanceRecords;
  
  const presentCount = selectedDateRecords.filter(r => r.status === 'Present').length;
  const absentCount = selectedDateRecords.filter(r => r.status === 'Absent').length;
  const lateCount = selectedDateRecords.filter(r => r.status === 'Late').length;
  
  // Get display date for card labels
  const getDateLabel = () => {
    if (!filterDate) return 'All Time';
    if (filterDate.isSame(dayjs(), 'day')) return 'Today';
    return filterDate.format('DD/MM/YYYY');
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Present {getDateLabel()}
              </Typography>
              <Typography variant="h4" color="success.main">
                {presentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Absent {getDateLabel()}
              </Typography>
              <Typography variant="h4" color="error.main">
                {absentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Late {getDateLabel()}
              </Typography>
              <Typography variant="h4" color="warning.main">
                {lateCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Records {getDateLabel()}
              </Typography>
              <Typography variant="h4">
                {selectedDateRecords.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Filters and Actions */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ position: 'relative' }}>
              <DatePicker
                label="Filter by Date"
                value={filterDate}
                onChange={(newValue) => setFilterDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small'
                  }
                }}
              />
              {filterDate && (
                <IconButton
                  size="small"
                  onClick={() => setFilterDate(null)}
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
          
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              size="small"
              options={workers}
              getOptionLabel={(option) => option.fullName}
              value={filterWorker}
              onChange={(_, newValue) => setFilterWorker(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Worker"
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
            <Box sx={{ 
              display: 'flex', 
              gap: 0.5, 
              flexWrap: 'nowrap',
              alignItems: 'center',
              justifyContent: { xs: 'center', md: 'flex-start' },
              overflow: 'hidden'
            }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAttendanceFormOpen(true)}
                sx={{ 
                  minWidth: 'auto', 
                  whiteSpace: 'nowrap',
                  height: '36px', // Slightly smaller height
                  fontSize: '0.875rem' // Smaller font to fit better
                }}
              >
                Mark New
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<GroupsIcon />}
                onClick={() => setBulkFormOpen(true)}
                sx={{ 
                  minWidth: 'auto', 
                  whiteSpace: 'nowrap',
                  height: '36px', // Slightly smaller height
                  fontSize: '0.875rem' // Smaller font to fit better
                }}
              >
                Bulk Attendance
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ReportIcon />}
                onClick={() => {/* TODO: Open reports */}}
                sx={{ 
                  minWidth: 'auto', 
                  whiteSpace: 'nowrap',
                  height: '36px', // Slightly smaller height
                  fontSize: '0.875rem' // Smaller font to fit better
                }}
              >
                Reports
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Attendance Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Worker</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Half Day Type</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Total Hours</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {record.workerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {dayjs(record.attendanceDate).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {record.status === 'Half Day' && record.halfDayType ? (
                        <Chip
                          label={record.halfDayType}
                          color="info"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{formatTime(record.checkInTime)}</TableCell>
                    <TableCell>{formatTime(record.checkOutTime)}</TableCell>
                    <TableCell>
                      {calculateTotalHours(record.checkInTime, record.checkOutTime)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {record.remarks || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(record)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(record)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={attendanceRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Dialogs */}
      <AttendanceForm
        open={attendanceFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editRecord={editRecord}
      />

      <BulkAttendanceForm
        open={bulkFormOpen}
        onClose={() => setBulkFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
      </Box>
    </DashboardLayout>
  );
};

export default AttendancePage; 