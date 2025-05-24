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
  Alert,
  Pagination,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import axios from 'axios';
import dayjs from 'dayjs';
import DashboardLayout from '../../Common/components/DashboardLayout';
import jobWorkService from '../services/jobWorkService';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTheme } from '@mui/material/styles';

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
  entryId: number;
  entryDate: string;
  jwNo: string;
  workName: string;
  workType: string;
  groupName: string;
  employeeName: string;
  qtyItems: number;
  qtyHours: number;
  rateForJob: number;
  totalAmount: number;
  unitName: string;
  isApproved: boolean;
  remarks: string;
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

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterState {
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  jobId: string;
  jobWorkTypeId: string;
  unitId: string;
  employeeId: string;
  jobType: string;
}

interface SummaryState {
  totalJobWorks: number;
  totalJobGroups: number;
  totalEmployees: number;
  totalUnits: number;
  totalHours: number;
  totalQuantity: number;
  totalAmount: number;
  totalRecords: number;
}

interface ColumnOption {
  id: string;
  label: string;
  selected: boolean;
}

const JobWork = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobWorks, setJobWorks] = useState<any[]>([]);
  const [summary, setSummary] = useState<SummaryState | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    jobId: '',
    jobWorkTypeId: '',
    unitId: '',
    employeeId: '',
    jobType: '',
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    sortBy: 'entryDate',
    sortOrder: 'desc',
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [jobWorkTypes, setJobWorkTypes] = useState<JobWorkType[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeInputValue, setEmployeeInputValue] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Key state to force re-render of Autocomplete
  const [autocompleteKey, setAutocompleteKey] = useState(0);

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>([
    { id: 'unitName', label: 'Unit', selected: true },
    { id: 'entryDate', label: 'Date', selected: true },
    { id: 'workType', label: 'Type', selected: true },
    { id: 'workName', label: 'Job', selected: true },
    { id: 'qtyHours', label: 'Hours', selected: true },
    { id: 'rateForJob', label: 'Rate/day', selected: true },
    { id: 'qtyItems', label: 'Quantity', selected: true },
    { id: 'totalAmount', label: 'Amount', selected: true },
    { id: 'employeeName', label: 'Employee', selected: true },
    { id: 'jwNo', label: 'Job Work No.', selected: false },
    { id: 'groupName', label: 'Group', selected: false },
    { id: 'isApproved', label: 'Is Approved', selected: false },
    { id: 'remarks', label: 'Remarks', selected: false },
  ]);

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
        axios.get(`/api/JobWork/jobs?isGroup=${filters.jobType === 'group'}`),
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
    // Reset pagination when any filter changes
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Date validation
    if (field === 'startDate' && value && filters.endDate && dayjs(value).isAfter(filters.endDate)) {
      setError('Start date cannot be greater than end date');
      return;
    }
    
    if (field === 'endDate' && value && filters.startDate && dayjs(filters.startDate).isAfter(value)) {
      setError('End date cannot be less than start date');
      return;
    }
    
    // Clear any existing validation errors
    if (error && (field === 'startDate' || field === 'endDate')) {
      setError(null);
    }
    
    // Handle missing date pairs
    if (field === 'startDate' && value && !filters.endDate) {
      // If setting start date and no end date is set, set end date to same date
      setFilters(prev => ({ ...prev, [field]: value, endDate: value }));
    } else if (field === 'endDate' && value && !filters.startDate) {
      // If setting end date and no start date is set, set start date to same date
      setFilters(prev => ({ ...prev, [field]: value, startDate: value }));
    } else {
      // Normal case, just update the specified field
      setFilters(prev => ({ ...prev, [field]: value }));
    }
    
    // If employeeId changes, update selectedEmployee
    if (field === 'employeeId') {
      const employee = employees.find(emp => emp.employeeId === value) || null;
      setSelectedEmployee(employee);
    }
    
    // If jobType changes, reset jobId and fetch new jobs
    if (field === 'jobType') {
      setFilters(prev => ({ ...prev, jobId: '' }));
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
    try {
      setLoading(true);
      setError(null);
      const response = await jobWorkService.getJobWorks({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder
      });
      setJobWorks(response.data);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      console.error('Error fetching job works:', error);
      setError('Failed to fetch job works');
    } finally {
      setLoading(false);
    }
  };

  const handleSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = dayjs();
      let params: Record<string, any> = {
        ...filters,
      };
      
      // Format any existing dates - backend will handle default dates
      if (filters.startDate) {
        params.startDate = filters.startDate.format('YYYY-MM-DD');
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate.format('YYYY-MM-DD');
      }

      console.log('Sending summary request with params:', params);

      const response = await axios.get('/api/JobWork/export/summary', {
        params,
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response received:', response);

      // Create blob with proper type
      const blob = new Blob([response.data], { 
        type: 'application/pdf'
      });

      // Check blob validity
      if (blob.size === 0) {
        setError('Failed to generate summary PDF. Empty response received.');
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create appropriate filename based on date parameters
      let fileName: string;
      if (!params.startDate) {
        // "As on" report for today
        const asOnDate = params.endDate ? dayjs(params.endDate as string) : today;
        fileName = `JOB_WORK_SUMMARY_AS_ON_${asOnDate.format('DDMMMYYYY')}.pdf`;
      } else {
        // Date range report
        const startDate = dayjs(params.startDate as string);
        const endDate = dayjs(params.endDate as string);
        fileName = `JOB_WORK_SUMMARY_${startDate.format('DDMMMYYYY')}_TO_${endDate.format('DDMMMYYYY')}.pdf`;
      }
      
      link.setAttribute('download', fileName);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('Error generating summary PDF:', error);
      if (axios.isAxiosError(error)) {
        // Log detailed error information
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        });
        
        if (error.response?.data instanceof Blob) {
          // Try to read error message from blob
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const jsonResponse = JSON.parse(reader.result as string);
              setError(jsonResponse.message || 'Failed to generate PDF');
            } catch {
              setError('Failed to generate PDF. Server returned an error.');
            }
          };
          reader.readAsText(error.response.data);
        } else {
          setError(error.response?.data?.message || 'Failed to generate summary PDF. Please try again later.');
        }
      } else {
        setError('Failed to generate summary PDF. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const today = dayjs();
      let params: Record<string, any> = {
        ...filters,
      };
      
      // Format any existing dates - backend will handle default dates
      if (filters.startDate) {
        params.startDate = filters.startDate.format('YYYY-MM-DD');
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate.format('YYYY-MM-DD');
      }

      console.log(`Sending ${type} export request with params:`, params);

      const response = await axios.get(`/api/JobWork/export/${type}`, {
        params,
        responseType: 'blob',
        headers: {
          'Accept': type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response received:', response);

      // Create blob with proper type
      const blob = new Blob([response.data], { 
        type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // If blob is empty or invalid
      if (blob.size === 0) {
        setError(`Failed to export to ${type.toUpperCase()}. Empty response received.`);
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create appropriate filename based on date parameters
      let fileName: string;
      if (!params.startDate) {
        // "As on" report
        const asOnDate = params.endDate ? dayjs(params.endDate as string) : today;
        fileName = `JOB_WORK_AS_ON_${asOnDate.format('DDMMMYYYY')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      } else {
        // Date range report
        const startDate = dayjs(params.startDate as string);
        const endDate = dayjs(params.endDate as string);
        fileName = `JOB_WORK_${startDate.format('DDMMMYYYY')}_TO_${endDate.format('DDMMMYYYY')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      }
      
      link.setAttribute('download', fileName);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error(`Error exporting to ${type}:`, error);
      if (axios.isAxiosError(error)) {
        // Log detailed error information
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        });
        
        if (error.response?.data instanceof Blob) {
          // Try to read error message from blob
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const jsonResponse = JSON.parse(reader.result as string);
              setError(jsonResponse.message || `Failed to export to ${type.toUpperCase()}`);
            } catch {
              setError(`Failed to export to ${type.toUpperCase()}. Server returned an error.`);
            }
          };
          reader.readAsText(error.response.data);
        } else {
          setError(error.response?.data?.message || `Failed to export to ${type.toUpperCase()}. Please try again later.`);
        }
      } else {
        setError(`Failed to export to ${type.toUpperCase()}. Please try again later.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    // Update the page in the pagination state
    setPagination(prev => ({ ...prev, page: newPage }));
    // Fetch data with the new pagination settings
    handleSearch();
  };

  const handleResetFilters = () => {
    // Reset all filters to default values
    setFilters({
      startDate: dayjs(),
      endDate: dayjs(),
      jobId: '',
      jobWorkTypeId: '',
      unitId: '',
      employeeId: '',
      jobType: '',
    });
    
    // Reset pagination to page 1
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Reset selected employee
    setSelectedEmployee(null);
    setEmployeeInputValue('');
    
    // Reset any errors
    setError(null);
    
    // Reset autocomplete key to force re-render
    setAutocompleteKey(prev => prev + 1);
    
    // Fetch jobs if needed
    fetchInitialData();
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

  const handleColumnToggle = (columnId: string) => {
    setColumnOptions(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, selected: !col.selected } : col
      )
    );
  };

  const handleSelectAllColumns = (selected: boolean) => {
    setColumnOptions(prev => 
      prev.map(col => ({ ...col, selected }))
    );
  };

  const showColumnSelectorDialog = (type: string) => {
    setExportType(type);
    setShowColumnSelector(true);
  };

  const handleExportWithColumns = () => {
    setShowColumnSelector(false);
    
    // Create comma-separated list of selected column IDs
    const selectedColumns = columnOptions
      .filter(col => col.selected)
      .map(col => col.id)
      .join(',');
    
    if (exportType === 'summary') {
      handleSummaryWithColumns(selectedColumns);
    } else {
      handleExportWithSelectedColumns(exportType!, selectedColumns);
    }
  };

  const handleSummaryWithColumns = async (selectedColumns: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const today = dayjs();
      let params: Record<string, any> = {
        ...filters,
        columns: selectedColumns,
      };
      
      // Format any existing dates - backend will handle default dates
      if (filters.startDate) {
        params.startDate = filters.startDate.format('YYYY-MM-DD');
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate.format('YYYY-MM-DD');
      }

      console.log('Sending summary request with params:', params);

      const response = await axios.get('/api/JobWork/export/summary', {
        params,
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response received:', response);

      // Create blob with proper type
      const blob = new Blob([response.data], { 
        type: 'application/pdf'
      });

      // Check blob validity
      if (blob.size === 0) {
        setError('Failed to generate summary PDF. Empty response received.');
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create appropriate filename based on date parameters
      let fileName: string;
      if (!params.startDate) {
        // "As on" report for today
        const asOnDate = params.endDate ? dayjs(params.endDate as string) : today;
        fileName = `JOB_WORK_SUMMARY_AS_ON_${asOnDate.format('DDMMMYYYY')}.pdf`;
      } else {
        // Date range report
        const startDate = dayjs(params.startDate as string);
        const endDate = dayjs(params.endDate as string);
        fileName = `JOB_WORK_SUMMARY_${startDate.format('DDMMMYYYY')}_TO_${endDate.format('DDMMMYYYY')}.pdf`;
      }
      
      link.setAttribute('download', fileName);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('Error generating summary PDF:', error);
      if (axios.isAxiosError(error)) {
        // Log detailed error information
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        });
        
        if (error.response?.data instanceof Blob) {
          // Try to read error message from blob
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const jsonResponse = JSON.parse(reader.result as string);
              setError(jsonResponse.message || 'Failed to generate PDF');
            } catch {
              setError('Failed to generate PDF. Server returned an error.');
            }
          };
          reader.readAsText(error.response.data);
        } else {
          setError(error.response?.data?.message || 'Failed to generate summary PDF. Please try again later.');
        }
      } else {
        setError('Failed to generate summary PDF. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportWithSelectedColumns = async (type: string, selectedColumns: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const today = dayjs();
      let params: Record<string, any> = {
        ...filters,
        columns: selectedColumns,
      };
      
      // Format any existing dates - backend will handle default dates
      if (filters.startDate) {
        params.startDate = filters.startDate.format('YYYY-MM-DD');
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate.format('YYYY-MM-DD');
      }

      console.log(`Sending ${type} export request with params:`, params);

      const response = await axios.get(`/api/JobWork/export/${type}`, {
        params,
        responseType: 'blob',
        headers: {
          'Accept': type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response received:', response);

      // Create blob with proper type
      const blob = new Blob([response.data], { 
        type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // If blob is empty or invalid
      if (blob.size === 0) {
        setError(`Failed to export to ${type.toUpperCase()}. Empty response received.`);
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create appropriate filename based on date parameters
      let fileName: string;
      if (!params.startDate) {
        // "As on" report
        const asOnDate = params.endDate ? dayjs(params.endDate as string) : today;
        fileName = `JOB_WORK_AS_ON_${asOnDate.format('DDMMMYYYY')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      } else {
        // Date range report
        const startDate = dayjs(params.startDate as string);
        const endDate = dayjs(params.endDate as string);
        fileName = `JOB_WORK_${startDate.format('DDMMMYYYY')}_TO_${endDate.format('DDMMMYYYY')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      }
      
      link.setAttribute('download', fileName);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error(`Error exporting to ${type}:`, error);
      if (axios.isAxiosError(error)) {
        // Log detailed error information
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers,
          data: error.response?.data
        });
        
        if (error.response?.data instanceof Blob) {
          // Try to read error message from blob
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const jsonResponse = JSON.parse(reader.result as string);
              setError(jsonResponse.message || `Failed to export to ${type.toUpperCase()}`);
            } catch {
              setError(`Failed to export to ${type.toUpperCase()}. Server returned an error.`);
            }
          };
          reader.readAsText(error.response.data);
        } else {
          setError(error.response?.data?.message || `Failed to export to ${type.toUpperCase()}. Please try again later.`);
        }
      } else {
        setError(`Failed to export to ${type.toUpperCase()}. Please try again later.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, mt: 4 }}>
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
                value={filters.jobType}
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
                <Box sx={{ position: 'relative' }}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange('startDate', date)}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                      } 
                    }}
                  />
                  {filters.startDate && (
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange('startDate', null)}
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
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ position: 'relative' }}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                      } 
                    }}
                  />
                  {filters.endDate && (
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange('endDate', null)}
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
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Job</InputLabel>
                <Select
                  value={filters.jobId}
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
                  value={filters.jobWorkTypeId}
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
                  value={filters.unitId}
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
                key={autocompleteKey}
                freeSolo
                options={employees}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.name;
                }}
                value={selectedEmployee}
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    handleFilterChange('employeeId', newValue);
                  } else if (newValue) {
                    handleFilterChange('employeeId', newValue.employeeId);
                    setSelectedEmployee(newValue);
                  } else {
                    handleFilterChange('employeeId', '');
                    setSelectedEmployee(null);
                  }
                }}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason !== 'clear') {
                    setEmployeeInputValue(newInputValue);
                  }
                  if (reason === 'clear') {
                    handleFilterChange('employeeId', '');
                  }
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
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  sx={{
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  Search
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => showColumnSelectorDialog('summary')}
                  sx={{
                    bgcolor: 'success.main',
                    '&:hover': {
                      bgcolor: 'success.dark',
                    },
                  }}
                >
                  Summary PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => showColumnSelectorDialog('excel')}
                  sx={{
                    bgcolor: 'info.main',
                    '&:hover': {
                      bgcolor: 'info.dark',
                    },
                  }}
                >
                  Export Excel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => showColumnSelectorDialog('pdf')}
                  sx={{
                    bgcolor: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.dark',
                    },
                  }}
                >
                  Export PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetFilters}
                  disabled={loading}
                >
                  Reset All
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Column Selection Dialog */}
        <Dialog open={showColumnSelector} onClose={() => setShowColumnSelector(false)}>
          <DialogTitle>
            Select Columns to Include
          </DialogTitle>
          <DialogContent>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={columnOptions.every(col => col.selected)}
                    indeterminate={columnOptions.some(col => col.selected) && !columnOptions.every(col => col.selected)}
                    onChange={(e) => handleSelectAllColumns(e.target.checked)}
                  />
                }
                label="Select All"
              />
              <Box sx={{ borderTop: '1px solid #eee', my: 1, pt: 1 }} />
              
              <Grid container spacing={1}>
                {columnOptions.map(col => (
                  <Grid item xs={6} key={col.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={col.selected}
                          onChange={() => handleColumnToggle(col.id)}
                        />
                      }
                      label={col.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowColumnSelector(false)}>Cancel</Button>
            <Button 
              onClick={handleExportWithColumns} 
              variant="contained" 
              color="primary"
              disabled={!columnOptions.some(col => col.selected)}
            >
              Export
            </Button>
          </DialogActions>
        </Dialog>

        {/* Results Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Unit</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Job</TableCell>
                  <TableCell align="right">Hours</TableCell>
                  <TableCell align="right">Rate/day</TableCell>
                  <TableCell align="right">Rate</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(jobWorks) || jobWorks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  jobWorks.map((jobWork) => (
                    <TableRow key={jobWork.entryId}>
                      <TableCell>{jobWork.unitName}</TableCell>
                      <TableCell>{dayjs(jobWork.entryDate).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{jobWork.workType}</TableCell>
                      <TableCell>{jobWork.workName}</TableCell>
                      <TableCell align="right">{jobWork.qtyHours}</TableCell>
                      <TableCell align="right">₹{(jobWork.rateForJob * 8)?.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{jobWork.rateForJob?.toFixed(2)}</TableCell>
                      <TableCell align="right">{jobWork.qtyItems}</TableCell>
                      <TableCell align="right">₹{jobWork.totalAmount?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
                {/* Add total row at the bottom if we have job works */}
                {Array.isArray(jobWorks) && jobWorks.length > 0 && (
                  <TableRow 
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: (theme) => theme.palette.mode === 'dark' 
                        ? theme.palette.grey[800] 
                        : theme.palette.grey[100],
                      '& td': { 
                        borderTop: (theme) => `2px solid ${theme.palette.divider}`,
                        fontSize: '1.1rem',
                        color: (theme) => theme.palette.text.primary,
                        fontWeight: 'bold'
                      }
                    }}
                  >
                    <TableCell colSpan={8} align="right" sx={{ 
                      fontWeight: 'bold',
                      color: (theme) => theme.palette.text.primary
                    }}>
                      Total:
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontWeight: 'bold', 
                      color: (theme) => theme.palette.primary.main
                    }}>
                      ₹{jobWorks.reduce((sum, job) => sum + (job.totalAmount || 0), 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <Pagination
              count={Math.ceil(pagination.total / pagination.pageSize)}
              page={pagination.page}
              onChange={(event, newPage) => {
                handlePageChange(newPage);
              }}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default JobWork; 