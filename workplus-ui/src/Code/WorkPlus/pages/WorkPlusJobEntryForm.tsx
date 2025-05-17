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
    groupId: ''
  });

  // State for master data
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobGroups, setJobGroups] = useState<JobGroup[]>([]);
  
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
    const selectedJob = jobs.find(job => job.jobId === jobId);
    
    // Debug job data
    console.log('Selected job object:', selectedJob);
    if (selectedJob) {
      console.log('Expected items per hour:', selectedJob.expectedItemsPerHour);
      console.log('Expected hours:', selectedJob.expectedHours);
      console.log('Rate per item:', selectedJob.ratePerItem);
      console.log('Rate per hour:', selectedJob.ratePerHour);
      console.log('Type of expectedItemsPerHour:', typeof selectedJob.expectedItemsPerHour);
      console.log('Type of expectedHours:', typeof selectedJob.expectedHours);
      console.log('Type of ratePerItem:', typeof selectedJob.ratePerItem);
      console.log('Type of ratePerHour:', typeof selectedJob.ratePerHour);
    }
    
    // Determine values for form fields
    let expectedOutput = '';
    let rate = '';
    
    if (selectedJob) {
      // For expected output, prefer expectedItemsPerHour if available
      if (selectedJob.expectedItemsPerHour !== null && selectedJob.expectedItemsPerHour !== undefined) {
        expectedOutput = String(selectedJob.expectedItemsPerHour);
        console.log('Setting expected output from expectedItemsPerHour:', expectedOutput);
      } else if (selectedJob.expectedHours !== null && selectedJob.expectedHours !== undefined) {
        expectedOutput = String(selectedJob.expectedHours);
        console.log('Setting expected output from expectedHours:', expectedOutput);
      }
      
      // For rate, prefer ratePerItem if available, otherwise use ratePerHour
      if (selectedJob.ratePerItem !== null && selectedJob.ratePerItem !== undefined) {
        rate = String(selectedJob.ratePerItem);
        console.log('Setting rate from ratePerItem:', rate);
      } else if (selectedJob.ratePerHour !== null && selectedJob.ratePerHour !== undefined) {
        rate = String(selectedJob.ratePerHour);
        console.log('Setting rate from ratePerHour:', rate);
      }
    }
    
    console.log('Final values - expected output:', expectedOutput, 'rate:', rate);
    
    // Set job-related values in form
    setFormData({
      ...formData,
      jobId,
      expectedOutput,
      rate,
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
        expectedHours: expected,
        remarks: formData.remarks,
        createdAt: formattedDate // Add the formatted date
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
          remarks: ''
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

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={sectionTitleStyles(theme)}>
          Work Recording
        </Typography>
        
        <Paper sx={formContainerStyles(theme)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ToggleButtonGroup
                value={formData.entryType}
                exclusive
                onChange={handleEntryTypeChange}
                aria-label="entry type"
                sx={{ mb: 2 }}
              >
                <ToggleButton value="Individual" aria-label="individual">
                  Individual
                </ToggleButton>
                <ToggleButton value="Group" aria-label="group">
                  Group
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={4}>
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
            
            <Grid item xs={12} sm={6} md={4}>
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
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Expected Output"
                type="number"
                value={formData.expectedOutput}
                onChange={(e) => handleInputChange('expectedOutput', e.target.value)}
                InputProps={{
                  readOnly: !!formData.jobId,
                }}
                disabled={!!formData.jobId}
                helperText={!!formData.jobId ? "Auto-filled from job data" : ""}
                sx={formFieldStyles(theme)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Rate"
                type="number"
                value={formData.rate}
                onChange={(e) => handleInputChange('rate', e.target.value)}
                InputProps={{
                  readOnly: !!formData.jobId,
                }}
                disabled={!!formData.jobId}
                helperText={!!formData.jobId ? "Auto-filled from job data" : ""}
                sx={formFieldStyles(theme)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Actual Output"
                type="number"
                value={formData.actualOutput}
                onChange={(e) => handleInputChange('actualOutput', e.target.value)}
                sx={formFieldStyles(theme)}
              />
            </Grid>

            {formData.jobId && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Incentive Bonus Rate"
                  type="text"
                  value={(() => {
                    const job = jobs.find(j => j.jobId === formData.jobId);
                    if (!job) return 'N/A';
                    const rate = job.incentiveBonusRate ?? 0;
                    const type = job.incentiveType || 'N/A';
                    return `${rate} (${type})`;
                  })()}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                  helperText="Current incentive rate and type"
                  sx={formFieldStyles(theme)}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sm={6} md={4}>
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
                  mt: 1,
                  '& .MuiOutlinedInput-root': {
                    '& textarea': {
                      padding: '12px'
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
                    <TableCell sx={tableCellHeaderStyles(theme)}>Worker/Group</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Job</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Expected</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Actual</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Bonus</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Total</TableCell>
                    <TableCell sx={tableCellHeaderStyles(theme)}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedRecords.map((record) => (
                    <TableRow key={record.entryId}>
                      <TableCell>{record.entryId}</TableCell>
                      <TableCell>{record.createdAt ? dayjs(record.createdAt).format('MM/DD/YYYY') : 'N/A'}</TableCell>
                      <TableCell>{record.workerName || record.groupName || 'N/A'}</TableCell>
                      <TableCell>{record.jobName}</TableCell>
                      <TableCell>{record.expectedHours || 'N/A'}</TableCell>
                      <TableCell>{record.hoursTaken || record.itemsCompleted || 'N/A'}</TableCell>
                      <TableCell>{record.incentiveAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{record.totalAmount?.toFixed(2) || '0.00'}</TableCell>
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
                  ))}
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
