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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import axios from 'axios';
import dayjs from 'dayjs';
import DashboardLayout from '../components/DashboardLayout';

// Configure axios defaults
axios.defaults.baseURL = 'https://localhost:7160';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add axios interceptor to handle CORS and JWT
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface JobWorkFilter {
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  jobId: string;
  jobWorkTypeId: string;
  unitId: string;
  employeeId: string;
  jobType: 'work' | 'group';
}

interface JobWork {
  id: string;
  jobName: string;
  jobWorkTypeName: string;
  employeeName: string;
  date: string;
  hours: number;
  quantity: number;
  unitName: string;
  amount: number;
}

interface JobWorkSummary {
  totalHours: number;
  totalQuantity: number;
  totalAmount: number;
  totalRecords: number;
}

interface Unit {
  id: string;
  name: string;
}

interface JobWorkType {
  id: string;
  name: string;
}

interface Job {
  id: string;
  name: string;
  isGroup: boolean;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
}

const JobWork = () => {
  const [filter, setFilter] = useState<JobWorkFilter>({
    startDate: null,
    endDate: null,
    jobId: '',
    jobWorkTypeId: '',
    unitId: '',
    employeeId: '',
    jobType: 'work',
  });

  const [jobWorks, setJobWorks] = useState<JobWork[]>([]);
  const [summary, setSummary] = useState<JobWorkSummary | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [jobWorkTypes, setJobWorkTypes] = useState<JobWorkType[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeInputValue, setEmployeeInputValue] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setError(null);
      console.log('Fetching initial data...');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access this page');
        return;
      }

      const [unitsRes, typesRes, jobsRes] = await Promise.all([
        axios.get('/api/JobWork/units'),
        axios.get('/api/JobWork/job-work-types'),
        axios.get(`/api/JobWork/jobs?isGroup=${filter.jobType === 'group'}`),
      ]);

      console.log('API Responses:', { units: unitsRes.data, types: typesRes.data, jobs: jobsRes.data });

      // Ensure the responses are arrays
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : []);
      setJobWorkTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Your session has expired. Please login again.');
        } else {
          setError(`Failed to load initial data: ${error.response?.data?.message || error.message}`);
        }
      } else {
        setError('Failed to load initial data. Please try again later.');
      }
    }
  };

  const handleFilterChange = (field: keyof JobWorkFilter, value: any) => {
    setFilter(prev => ({ ...prev, [field]: value }));
    
    // If jobType changes, reset jobId and fetch new jobs
    if (field === 'jobType') {
      setFilter(prev => ({ ...prev, jobId: '' }));
      fetchJobs(value);
    }
  };

  const fetchJobs = async (jobType: 'work' | 'group') => {
    try {
      const response = await axios.get(`/api/JobWork/jobs?isGroup=${jobType === 'group'}`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...filter,
        startDate: filter.startDate?.format('YYYY-MM-DD'),
        endDate: filter.endDate?.format('YYYY-MM-DD'),
      };

      console.log('Search params:', params);
      const [jobWorksRes, summaryRes] = await Promise.all([
        axios.get('/api/JobWork/list', { params }),
        axios.get('/api/JobWork/summary', { params }),
      ]);

      console.log('Search results:', { jobWorks: jobWorksRes.data, summary: summaryRes.data });

      setJobWorks(Array.isArray(jobWorksRes.data) ? jobWorksRes.data : []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching job works:', error);
      if (axios.isAxiosError(error)) {
        setError(`Failed to load job works: ${error.response?.data?.message || error.message}`);
      } else {
        setError('Failed to load job works. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      setError(null);
      const params = {
        ...filter,
        startDate: filter.startDate?.format('YYYY-MM-DD'),
        endDate: filter.endDate?.format('YYYY-MM-DD'),
      };

      const response = await axios.get(`/api/JobWork/export/${format}`, {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `jobworks.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      setError(`Failed to export to ${format.toUpperCase()}. Please try again later.`);
    }
  };

  const fetchEmployees = async (searchTerm: string) => {
    try {
      const response = await axios.get(`/api/JobWork/employees?search=${searchTerm}`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    if (employeeInputValue.length >= 2) {
      const debounceTimer = setTimeout(() => {
        fetchEmployees(employeeInputValue);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [employeeInputValue]);

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Job Works
        </Typography>

        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ToggleButtonGroup
                value={filter.jobType}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    handleFilterChange('jobType', newValue);
                  }
                }}
                aria-label="job type selection"
              >
                <ToggleButton value="work" aria-label="job work">
                  Job Work
                </ToggleButton>
                <ToggleButton value="group" aria-label="job work group">
                  Job Work Group
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={filter.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={filter.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Job</InputLabel>
                <Select
                  value={filter.jobId}
                  label="Job"
                  onChange={(e) => handleFilterChange('jobId', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {Array.isArray(jobs) && jobs.map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Job Work Type</InputLabel>
                <Select
                  value={filter.jobWorkTypeId}
                  label="Job Work Type"
                  onChange={(e) => handleFilterChange('jobWorkTypeId', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {Array.isArray(jobWorkTypes) && jobWorkTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={filter.unitId}
                  label="Unit"
                  onChange={(e) => handleFilterChange('unitId', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {Array.isArray(units) && units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                freeSolo
                options={employees}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.name;
                }}
                value={filter.employeeId}
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    handleFilterChange('employeeId', newValue);
                  } else if (newValue) {
                    handleFilterChange('employeeId', newValue.employeeId);
                  }
                }}
                onInputChange={(event, newInputValue) => {
                  setEmployeeInputValue(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Employee"
                    placeholder="Search by ID or name"
                  />
                )}
                loading={loading}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={option.employeeId} {...otherProps}>
                      {option.employeeId} - {option.name}
                    </li>
                  );
                }}
                noOptionsText="No employees found"
                loadingText="Loading employees..."
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  Search
                </Button>
                <Tooltip title="Export to Excel">
                  <IconButton onClick={() => handleExport('excel')}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export to PDF">
                  <IconButton onClick={() => handleExport('pdf')}>
                    <PictureAsPdfIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary */}
        {summary && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Total Hours</Typography>
                <Typography variant="h6">{summary.totalHours}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Total Quantity</Typography>
                <Typography variant="h6">{summary.totalQuantity}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Total Amount</Typography>
                <Typography variant="h6">₹{summary.totalAmount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2">Total Records</Typography>
                <Typography variant="h6">{summary.totalRecords}</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Results Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job</TableCell>
                  <TableCell>Job Work Type</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Hours</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(jobWorks) || jobWorks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  jobWorks.map((jobWork) => (
                    <TableRow key={jobWork.id}>
                      <TableCell>{jobWork.jobName}</TableCell>
                      <TableCell>{jobWork.jobWorkTypeName}</TableCell>
                      <TableCell>{jobWork.employeeName}</TableCell>
                      <TableCell>{dayjs(jobWork.date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell align="right">{jobWork.hours}</TableCell>
                      <TableCell align="right">{jobWork.quantity}</TableCell>
                      <TableCell>{jobWork.unitName}</TableCell>
                      <TableCell align="right">₹{jobWork.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default JobWork; 