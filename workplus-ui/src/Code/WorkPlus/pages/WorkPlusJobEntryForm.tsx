import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Autocomplete,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardLayout from '../../Common/components/DashboardLayout';
import dayjs from 'dayjs';
import jobEntryService from '../services/jobEntryService';
import type { Worker, Job, JobGroup, JobEntryResponse } from '../services/jobEntryService';
import { 
  formContainerStyles, 
  sectionTitleStyles, 
  alertStyles, 
  buttonStyles, 
  formFieldStyles,
  centeredContentStyles,
  tableCellHeaderStyles
} from '../../../theme/styleUtils';

// Type for form data
interface FormData {
  date: dayjs.Dayjs | null;
  workerId: number | '';
  jobId: number | '';
  expectedOutput: string;
  rate: string;
  actualOutput: string;
  shift: string;
  remarks: string;
  entryType: 'Individual' | 'Group';
  groupId: number | '';
  penaltyRate: string;
  expectedHours: string;
  ratePerItem: string;
  ratePerHour: string;
  expectedItemsPerHour: string;
}

const WorkPlusJobEntryForm: React.FC = () => {
  const theme = useTheme();
  
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    date: dayjs(),
    workerId: '',
    jobId: '',
    expectedOutput: '',
    rate: '',
    actualOutput: '',
    shift: 'Morning',
    remarks: '',
    entryType: 'Individual',
    groupId: '',
    penaltyRate: '',
    expectedHours: '',
    ratePerItem: '',
    ratePerHour: '',
    expectedItemsPerHour: ''
  });

  // State for master data
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobGroups, setJobGroups] = useState<JobGroup[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Saved records
  const [savedRecords, setSavedRecords] = useState<JobEntryResponse[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [workerInputValue, setWorkerInputValue] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [autocompleteKey, setAutocompleteKey] = useState(0);

  // Fetch master data and saved records on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch master data
        const data = await jobEntryService.getMasterData();
        console.log('Master data received:', data);
        
        // Log specific job data
        if (data.jobs && data.jobs.length > 0) {
          console.log('First job data:', data.jobs[0]);
        }
        
        setWorkers(data.workers || []);
        setJobs(data.jobs || []);
        setJobGroups(data.jobGroups || []);
        
        // Fetch saved records
        await fetchSavedRecords();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch saved records
  const fetchSavedRecords = async () => {
    setLoadingRecords(true);
    try {
      const records = await jobEntryService.getJobEntries();
      console.log('Fetched job entries:', records);
      setSavedRecords(records);
    } catch (err) {
      console.error('Error fetching job entries:', err);
      setError('Failed to load saved records.');
    } finally {
      setLoadingRecords(false);
    }
  };

  // Handle entry type change (Individual/Group)
  const handleEntryTypeChange = (_: React.MouseEvent<HTMLElement>, newEntryType: 'Individual' | 'Group' | null) => {
    if (newEntryType !== null) {
      setFormData({
        ...formData,
        entryType: newEntryType,
        workerId: '',
        groupId: ''
      });
    }
  };

  // Handle input changes for all form fields
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Handle job selection
  const handleJobChange = (jobId: number) => {
    // Find the selected job
    const job = jobs.find(job => job.jobId === jobId);
    setSelectedJob(job || null);
    
    // Debug job data
    console.log('Selected job object:', job);
    
    // Determine values for form fields
    let expectedOutput = '';
    let rate = '';
    let expectedHours = '';
    let ratePerItem = '';
    let ratePerHour = '';
    let expectedItemsPerHour = '';
    let penaltyRate = '';
    
    if (job) {
      // Set expected hours
      if (job.expectedHours !== null && job.expectedHours !== undefined) {
        expectedHours = String(job.expectedHours);
      }
      
      // Set rate per item
      if (job.ratePerItem !== null && job.ratePerItem !== undefined) {
        ratePerItem = String(job.ratePerItem);
      }
      
      // Set rate per hour
      if (job.ratePerHour !== null && job.ratePerHour !== undefined) {
        ratePerHour = String(job.ratePerHour);
      }
      
      // Set expected items per hour
      if (job.expectedItemsPerHour !== null && job.expectedItemsPerHour !== undefined) {
        expectedItemsPerHour = String(job.expectedItemsPerHour);
      }
      
      // Set penalty rate
      if (job.penaltyRate !== null && job.penaltyRate !== undefined) {
        penaltyRate = String(job.penaltyRate);
      }
      
      // For expected output, prefer expectedItemsPerHour if available
      if (job.expectedItemsPerHour !== null && job.expectedItemsPerHour !== undefined) {
        expectedOutput = String(job.expectedItemsPerHour);
      } else if (job.expectedHours !== null && job.expectedHours !== undefined) {
        expectedOutput = String(job.expectedHours);
      }
      
      // For rate, prefer ratePerItem if available, otherwise use ratePerHour
      if (job.ratePerItem !== null && job.ratePerItem !== undefined) {
        rate = String(job.ratePerItem);
      } else if (job.ratePerHour !== null && job.ratePerHour !== undefined) {
        rate = String(job.ratePerHour);
      }
    }
    
    // Set job-related values in form
    setFormData({
      ...formData,
      jobId,
      expectedOutput,
      rate,
      expectedHours,
      ratePerItem,
      ratePerHour,
      expectedItemsPerHour,
      penaltyRate
    });
  };

  // Handle form submission
  const handleSaveRecord = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Get the selected job to access incentive rates
      const selectedJob = jobs.find(job => job.jobId === formData.jobId);
      
      if (!selectedJob) {
        throw new Error('Please select a valid job');
      }
      
      if (formData.entryType === 'Individual' && !formData.workerId) {
        throw new Error('Please select a worker');
      }
      
      if (formData.entryType === 'Group' && !formData.groupId) {
        throw new Error('Please select a group');
      }
      
      if (!formData.actualOutput) {
        throw new Error('Please enter the actual output');
      }
      
      const expected = parseFloat(formData.expectedOutput) || 0;
      const actual = parseFloat(formData.actualOutput) || 0;
      const rate = parseFloat(formData.rate) || 0;
      const expectedHours = parseFloat(formData.expectedHours) || 0;
      const ratePerItem = parseFloat(formData.ratePerItem) || 0;
      const ratePerHour = parseFloat(formData.ratePerHour) || 0;
      const expectedItemsPerHour = parseFloat(formData.expectedItemsPerHour) || 0;
      const penaltyRate = parseFloat(formData.penaltyRate) || 0;
      
      // Format the date correctly for the backend (ISO format)
      const formattedDate = formData.date ? formData.date.toISOString() : null;
      
      // Create a minimal job entry object with just the required fields
      const jobEntry = {
        jobId: Number(formData.jobId),
        entryType: formData.entryType,
        // Only one of these will be set based on entry type
        workerId: formData.entryType === 'Individual' ? Number(formData.workerId) : null,
        groupId: formData.entryType === 'Group' ? Number(formData.groupId) : null,
        isPostLunch: formData.shift === 'Afternoon' || formData.shift === 'Evening',
        
        // Only one of these will have a value depending on job type
        hoursTaken: selectedJob.ratePerHour ? actual : null, 
        itemsCompleted: selectedJob.ratePerItem ? Math.round(actual) : null,
        
        ratePerJob: rate,
        expectedHours: expectedHours,
        remarks: formData.remarks,
        createdAt: formattedDate, // Add the formatted date
        
        // Add new fields
        ratePerItem: selectedJob.ratePerItem ? ratePerItem : null,
        ratePerHour: selectedJob.ratePerHour ? ratePerHour : null,
        expectedItemsPerHour: selectedJob.expectedItemsPerHour ? expectedItemsPerHour : null,
        penaltyRate: penaltyRate
      };
      
      console.log('Created job entry data:', jobEntry);
      
      try {
        // Save to API - the service will add the missing required fields
        await jobEntryService.saveJobEntry(jobEntry);
        
        // Refresh the records list
        await fetchSavedRecords();
        
        // Reset form after successful save
        setFormData({
          ...formData,
          workerId: '',
          jobId: '',
          expectedOutput: '',
          rate: '',
          actualOutput: '',
          remarks: '',
          expectedHours: '',
          ratePerItem: '',
          ratePerHour: '',
          expectedItemsPerHour: '',
          penaltyRate: ''
        });
        
        setSuccess('Work record saved successfully!');
      } catch (err) {
        console.error('Error response from API:', err);
        setError(typeof err === 'object' && err !== null && 'message' in err 
          ? (err as Error).message 
          : 'Failed to save work record. Please check browser console for details.');
      }
      
    } catch (err) {
      console.error('Error in form validation:', err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? (err as Error).message 
        : 'Failed to validate form. Please check all fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete record
  const handleDeleteRecord = async (entryId: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }
    
    setLoadingRecords(true);
    try {
      await jobEntryService.deleteJobEntry(entryId);
      setSuccess('Record deleted successfully!');
      await fetchSavedRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record. Please try again.');
    } finally {
      setLoadingRecords(false);
    }
  };

  // Add this new function to fetch workers based on search term
  const fetchWorkers = async (searchTerm: string) => {
    try {
      const response = await jobEntryService.getWorkers(searchTerm);
      setWorkers(response);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  // Add this useEffect for worker search
  useEffect(() => {
    if (workerInputValue.length >= 2) {
      const debounceTimer = setTimeout(() => {
        fetchWorkers(workerInputValue);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [workerInputValue]);

  // Add this useEffect after other useEffects
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={sectionTitleStyles(theme)}>
          Work Recording
        </Typography>
        
        <Paper sx={formContainerStyles(theme)}>
          <Grid container spacing={3}>
            {/* Left Column - Input Fields */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 2,
                  minHeight: '400px'
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <ToggleButtonGroup
                      value={formData.entryType}
                      exclusive
                      onChange={handleEntryTypeChange}
                      aria-label="entry type"
                      sx={{ mb: 3 }}
                    >
                      <ToggleButton value="Individual" aria-label="individual">
                        Individual
                      </ToggleButton>
                      <ToggleButton value="Group" aria-label="group">
                        Group
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>

                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date"
                        value={formData.date}
                        onChange={(newValue) => handleInputChange('date', newValue)}
                        sx={{ width: '100%' }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  {formData.entryType === 'Individual' ? (
                    <Grid item xs={12}>
                      <Autocomplete
                        key={autocompleteKey}
                        freeSolo
                        options={workers}
                        getOptionLabel={(option) => {
                          if (typeof option === 'string') return option;
                          return option.fullName;
                        }}
                        value={selectedWorker}
                        onChange={(event, newValue) => {
                          if (typeof newValue === 'string') {
                            handleInputChange('workerId', '');
                          } else if (newValue) {
                            handleInputChange('workerId', newValue.workerId);
                            setSelectedWorker(newValue);
                          } else {
                            handleInputChange('workerId', '');
                            setSelectedWorker(null);
                          }
                        }}
                        onInputChange={(event, newInputValue, reason) => {
                          if (reason !== 'clear') {
                            setWorkerInputValue(newInputValue);
                          }
                          if (reason === 'clear') {
                            handleInputChange('workerId', '');
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            label="Select Worker"
                            placeholder="Search by name"
                            sx={formFieldStyles(theme)}
                          />
                        )}
                        loading={loading}
                        renderOption={(props, option) => (
                          <li {...props}>
                            {option.fullName}
                          </li>
                        )}
                        noOptionsText="No workers found"
                        loadingText="Loading workers..."
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="group-select-label">Select Group</InputLabel>
                        <Select
                          labelId="group-select-label"
                          id="group-select"
                          value={formData.groupId}
                          label="Select Group"
                          onChange={(e) => handleInputChange('groupId', e.target.value)}
                          sx={formFieldStyles(theme)}
                        >
                          {jobGroups.map((group) => (
                            <MenuItem key={group.groupId} value={group.groupId}>
                              {group.groupName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel id="job-select-label">Select Job</InputLabel>
                      <Select
                        labelId="job-select-label"
                        id="job-select"
                        value={formData.jobId}
                        label="Select Job"
                        onChange={(e) => handleJobChange(e.target.value as number)}
                        sx={formFieldStyles(theme)}
                      >
                        {jobs.map((job) => (
                          <MenuItem key={job.jobId} value={job.jobId}>
                            {job.jobName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label={selectedJob?.ratePerHour ? "Hours Taken" : "Items Completed"}
                      type="number"
                      value={formData.actualOutput}
                      onChange={(e) => handleInputChange('actualOutput', e.target.value)}
                      sx={formFieldStyles(theme)}
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <InputLabel id="shift-select-label">Shift</InputLabel>
                      <Select
                        labelId="shift-select-label"
                        id="shift-select"
                        value={formData.shift}
                        label="Shift"
                        onChange={(e) => handleInputChange('shift', e.target.value)}
                        sx={formFieldStyles(theme)}
                      >
                        <MenuItem value="Morning">Morning</MenuItem>
                        <MenuItem value="Afternoon">Afternoon</MenuItem>
                        <MenuItem value="Evening">Evening</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Remarks"
                      multiline
                      rows={3}
                      variant="outlined"
                      value={formData.remarks}
                      onChange={(e) => handleInputChange('remarks', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& textarea': {
                            padding: '12px',
                            marginTop: '32px'
                          }
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    {error && (
                      <Alert severity="error" sx={alertStyles(theme)}>
                        {error}
                      </Alert>
                    )}
                    
                    {success && (
                      <Alert severity="success" sx={alertStyles(theme)}>
                        {success}
                      </Alert>
                    )}
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={loading}
                      onClick={handleSaveRecord}
                      sx={{ ...buttonStyles(theme), mt: 2 }}
                    >
                      Save Work Record
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Right Column - Job Details */}
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 2, 
                  minHeight: '400px',
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                    backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : '#ffffff',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : theme.palette.grey[300],
                    borderRadius: '3px',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : theme.palette.grey[400],
                    },
                  },
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 1.5, 
                    position: 'sticky', 
                    top: 0, 
                    pb: 1, 
                    zIndex: 1,
                    color: theme.palette.text.primary
                  }}
                >
                  Job Details
                </Typography>
                <Grid container spacing={2}>
                  {selectedJob?.ratePerItem && (
                    <Grid item xs={12}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Rate per Item</Typography>
                        <Typography variant="body1">{selectedJob.ratePerItem}</Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedJob?.ratePerHour && (
                    <Grid item xs={12}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Rate per Hour</Typography>
                        <Typography variant="body1">{selectedJob.ratePerHour}</Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedJob?.expectedHours && (
                    <Grid item xs={12}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Expected Hours</Typography>
                        <Typography variant="body1">{selectedJob.expectedHours}</Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedJob?.expectedItemsPerHour && (
                    <Grid item xs={12}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Expected Items per Hour</Typography>
                        <Typography variant="body1">{selectedJob.expectedItemsPerHour}</Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedJob?.incentiveBonusRate && (
                    <Grid item xs={12}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Incentive Bonus Rate</Typography>
                        <Typography variant="body1">
                          {selectedJob.incentiveBonusRate} ({selectedJob.incentiveType || 'N/A'})
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  
                  {selectedJob?.penaltyRate && (
                    <Grid item xs={12}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Penalty Rate</Typography>
                        <Typography variant="body1">{selectedJob.penaltyRate}</Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Saved work records table */}
        <Typography variant="h5" sx={{ ...sectionTitleStyles(theme), mt: 4, mb: 2 }}>
          Saved Work Records
        </Typography>
        
        <Paper sx={formContainerStyles(theme)}>
          {loadingRecords ? (
            <Box sx={centeredContentStyles}>
              <CircularProgress />
            </Box>
          ) : savedRecords.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableCellHeaderStyles(theme)}>ID</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Date</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Entry Type</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Worker/Group</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Job Type</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Expected Hours</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Hours Taken</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Items Completed</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Rate (Per Hour/Item)</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Productive Hours</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Extra Hours</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Underperformance Hours</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Incentive Amount</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Total Amount</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Shift</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Remarks</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedRecords.map((record) => {
                    // Determine if job is hourly based or item based based on actual values
                    const isHourlyJob = record.hoursTaken !== null && record.hoursTaken !== undefined;
                    const isItemBasedJob = record.itemsCompleted !== null && record.itemsCompleted !== undefined;

                    return (
                      <TableRow key={record.entryId}>
                        <TableCell>{record.entryId}</TableCell>
                        <TableCell>{record.createdAt ? dayjs(record.createdAt).format('MM/DD/YYYY') : 'N/A'}</TableCell>
                        <TableCell>{record.entryType || 'N/A'}</TableCell>
                        <TableCell>{record.workerName || record.groupName || 'N/A'}</TableCell>
                        <TableCell>{record.jobName}</TableCell>
                        <TableCell>{record.expectedHours?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>
                          {isHourlyJob ? record.hoursTaken?.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isItemBasedJob ? record.itemsCompleted : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isHourlyJob ? `₹${record.ratePerJob?.toFixed(2)}/hr` : 
                           isItemBasedJob ? `₹${record.ratePerJob?.toFixed(2)}/item` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isHourlyJob ? record.productiveHours?.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isHourlyJob ? record.extraHours?.toFixed(2) : 
                           isItemBasedJob ? record.extraHours?.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isHourlyJob ? record.underperformanceHours?.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell>{record.incentiveAmount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{record.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{record.isPostLunch ? 'Afternoon/Evening' : 'Morning'}</TableCell>
                        <TableCell>{record.remarks || 'N/A'}</TableCell>
                        <TableCell>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleDeleteRecord(record.entryId)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No saved records found.
            </Typography>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default WorkPlusJobEntryForm;
