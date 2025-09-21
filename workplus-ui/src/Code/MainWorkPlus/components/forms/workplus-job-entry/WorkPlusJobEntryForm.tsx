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
  useTheme,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import dayjs from 'dayjs';
import jobEntryService from './jobEntryService';
import type { Worker, Job, JobGroup, JobEntryResponse } from './jobEntryService';
import { useGroupMemberService } from '../../masters/group-member/groupMemberService';
import { 
  formContainerStyles, 
  sectionTitleStyles, 
  alertStyles, 
  buttonStyles, 
  formFieldStyles,
  centeredContentStyles,
  tableCellHeaderStyles
} from '../../../../../theme/styleUtils';
import DashboardLayout from '../../../../Common/components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
  const navigate = useNavigate();
  const { getGroupMembersByGroup } = useGroupMemberService();
  
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [workerInputValue, setWorkerInputValue] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [autocompleteKey, setAutocompleteKey] = useState(0);
  
  // Group members dialog states
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

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

  // Function to fetch saved records with pagination
  const fetchSavedRecords = async () => {
    setLoadingRecords(true);
    try {
      const response = await jobEntryService.getPaginatedJobEntries(page + 1, rowsPerPage);
      setSavedRecords(response.items);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error('Error fetching job entries:', err);
      setError('Failed to load saved records.');
    } finally {
      setLoadingRecords(false);
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch records when page or rowsPerPage changes
  useEffect(() => {
    fetchSavedRecords();
  }, [page, rowsPerPage]);

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
        
        // Reset worker autocomplete states
        setSelectedWorker(null);
        setWorkerInputValue('');
        setAutocompleteKey(prev => prev + 1); // Force re-render of autocomplete
        setSelectedJob(null);
        
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

  // Handle show members for selected group
  const handleShowMembers = async () => {
    if (formData.groupId && typeof formData.groupId === 'number') {
      setLoadingMembers(true);
      try {
        const members = await getGroupMembersByGroup(formData.groupId);
        setGroupMembers(members);
        setShowMembersDialog(true);
      } catch (error) {
        console.error('Error fetching group members:', error);
        setGroupMembers([]);
        setShowMembersDialog(true);
      } finally {
        setLoadingMembers(false);
      }
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
    <Box p={3} >
    {/* Header Section */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 3, 
      mt: 8,
      gap: 2 
    }}>
      <IconButton 
        onClick={() => navigate('/')} 
        sx={{ 
          p: 1,
          alignSelf: 'center'
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography 
        variant="h4" 
        sx={{ 
          color: theme.palette.text.primary,
          fontWeight: 600,
          fontSize: '1.75rem',
          lineHeight: 1.2,
          margin: 0,
          flexGrow: 1
        }}
      >
        Work Recording
      </Typography>
    </Box>
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
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 3,
                      flexWrap: 'wrap',
                      gap: 2
                    }}>
                      <ToggleButtonGroup
                        value={formData.entryType}
                        exclusive
                        onChange={handleEntryTypeChange}
                        aria-label="entry type"
                      >
                        <ToggleButton value="Individual" aria-label="individual">
                          Individual
                        </ToggleButton>
                        <ToggleButton value="Group" aria-label="group">
                          Group
                        </ToggleButton>
                      </ToggleButtonGroup>
                      
                      <FormControl sx={{ minWidth: 120 }}>
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
                    </Box>
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
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl sx={{ flex: 1 }}>
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
                        
                        {formData.groupId && (
                          <Button
                            variant="text"
                            startIcon={<GroupIcon />}
                            onClick={handleShowMembers}
                            disabled={loadingMembers}
                            size="small"
                            sx={{ 
                              minWidth: 'auto',
                              whiteSpace: 'nowrap',
                              textTransform: 'none',
                              fontSize: '0.875rem',
                              color: 'primary.main',
                              height: '56px',
                              px: 2,
                              '&:hover': {
                                backgroundColor: 'transparent',
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {loadingMembers ? 'Loading members...' : 'View group members'}
                          </Button>
                        )}
                      </Box>
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
                            {job.jobName}{job.jobTypeName ? ` (${job.jobTypeName})` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={selectedJob?.ratePerHour ? "Hours Taken" : "Items Completed"}
                      type="number"
                      value={formData.actualOutput}
                      onChange={(e) => handleInputChange('actualOutput', e.target.value)}
                      sx={formFieldStyles(theme)}
                    />
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
                    mb: 2, 
                    position: 'sticky', 
                    top: 0, 
                    pb: 1, 
                    zIndex: 1,
                    color: theme.palette.text.primary,
                    fontWeight: 600
                  }}
                >
                  Job Details
                </Typography>
                <Grid container spacing={1.5}>
                  {selectedJob?.ratePerItem && (
                    <Grid item xs={6}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.main}05)`,
                          border: `1px solid ${theme.palette.primary.main}30`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                          }
                        }}
                      >
                        <AttachMoneyIcon sx={{ fontSize: 20, color: 'primary.main', mb: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Rate per Item
                        </Typography>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                          ₹{selectedJob.ratePerItem}
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  
                  {selectedJob?.ratePerHour && (
                    <Grid item xs={6}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.success.main}15, ${theme.palette.success.main}05)`,
                          border: `1px solid ${theme.palette.success.main}30`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                          }
                        }}
                      >
                        <AttachMoneyIcon sx={{ fontSize: 20, color: 'success.main', mb: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Rate per Hour
                        </Typography>
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                          ₹{selectedJob.ratePerHour}
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  
                  {selectedJob?.expectedHours && (
                    <Grid item xs={6}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.info.main}15, ${theme.palette.info.main}05)`,
                          border: `1px solid ${theme.palette.info.main}30`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                          }
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 20, color: 'info.main', mb: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Expected Hours
                        </Typography>
                        <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
                          {selectedJob.expectedHours}h
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  
                  {selectedJob?.expectedItemsPerHour && (
                    <Grid item xs={6}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.warning.main}15, ${theme.palette.warning.main}05)`,
                          border: `1px solid ${theme.palette.warning.main}30`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                          }
                        }}
                      >
                        <SpeedIcon sx={{ fontSize: 20, color: 'warning.main', mb: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Items/Hour
                        </Typography>
                        <Typography variant="h6" color="warning.main" sx={{ fontWeight: 700 }}>
                          {selectedJob.expectedItemsPerHour}
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  
                  {selectedJob?.incentiveBonusRate && (
                    <Grid item xs={6}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.main}05)`,
                          border: `1px solid ${theme.palette.secondary.main}30`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                          }
                        }}
                      >
                        <EmojiEventsIcon sx={{ fontSize: 20, color: 'secondary.main', mb: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Incentive Bonus
                        </Typography>
                        <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 600 }}>
                          {selectedJob.incentiveBonusRate}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({selectedJob.incentiveType || 'N/A'})
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                  
                  {selectedJob?.penaltyRate && (
                    <Grid item xs={6}>
                      <Card 
                        elevation={2}
                        sx={{ 
                          height: '100px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.error.main}15, ${theme.palette.error.main}05)`,
                          border: `1px solid ${theme.palette.error.main}30`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                          }
                        }}
                      >
                        <WarningIcon sx={{ fontSize: 20, color: 'error.main', mb: 0.5 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                          Penalty Rate
                        </Typography>
                        <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }}>
                          {selectedJob.penaltyRate}
                        </Typography>
                      </Card>
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
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Entry Type</TableCell>
                      <TableCell>Worker/Group</TableCell>
                      <TableCell>Job Type</TableCell>
                      <TableCell>Expected Hours</TableCell>
                      <TableCell>Hours Taken</TableCell>
                      <TableCell>Items Completed</TableCell>
                      <TableCell>Rate (Per Hour/Item)</TableCell>
                      <TableCell>Productive Hours</TableCell>
                      <TableCell>Extra Hours</TableCell>
                      <TableCell>Underperformance Hours</TableCell>
                      <TableCell>Incentive Amount</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Shift</TableCell>
                      <TableCell>Remarks</TableCell>
                      <TableCell>Actions</TableCell>
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
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No saved records found.
            </Typography>
          )}
        </Paper>
      </Box>
      
      {/* Group Members Dialog */}
      <Dialog
        open={showMembersDialog}
        onClose={() => setShowMembersDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Group Members</Typography>
          <IconButton onClick={() => setShowMembersDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {groupMembers.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {groupMembers.map((member) => (
                <Chip
                  key={member.id}
                  label={member.workerName}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No members found in this group.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMembersDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default WorkPlusJobEntryForm;
