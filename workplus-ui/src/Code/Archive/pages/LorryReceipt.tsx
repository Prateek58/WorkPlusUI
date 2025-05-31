import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Autocomplete,
  Pagination,
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
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import dayjs from 'dayjs';
import DashboardLayout from '../../Common/components/DashboardLayout';
import lrService from '../services/lrService';
import { useTheme } from '@mui/material/styles';
import { getTableHeaderStyle } from '../../../theme/tableStyles';
import { useNavigate } from 'react-router-dom';

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

interface LRFilter {
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  unitId: string;
  partyId: string;
  transporterId: string;
  cityId: string;
  billNo: string;
  lrNo: string;
  truckNo: string;
}

interface Unit {
  unitId: number;
  unitName: string;
}

interface Party {
  partyId: number;
  partyName: string;
  address1?: string;
  address2?: string;
  cityName?: string;
  email?: string;
}

interface Transporter {
  transporterId: number;
  transporterName: string;
}

interface City {
  cityId: number;
  cityName: string;
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
  unitId: string;
  partyId: string;
  transporterId: string;
  cityId: string;
  billNo: string;
  lrNo: string;
  truckNo: string;
}

interface SummaryState {
  totalEntries: number;
  totalParties: number;
  totalTransporters: number;
  totalCities: number;
  totalLrAmount: number;
  totalFreight: number;
  totalOtherExpenses: number;
  totalWeight: number;
  totalQuantity: number;
  totalRecords: number;
}

interface ColumnOption {
  id: string;
  label: string;
  selected: boolean;
}

const LorryReceipt = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [partySearchLoading, setPartySearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lrEntries, setLrEntries] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    unitId: '',
    partyId: '',
    transporterId: '',
    cityId: '',
    billNo: '',
    lrNo: '',
    truckNo: '',
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    sortBy: 'lrDate',
    sortOrder: 'desc',
  });
  const [units, setUnits] = useState<Unit[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [partyInputValue, setPartyInputValue] = useState('');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  
  // Key state to force re-render of Autocomplete
  const [autocompleteKey, setAutocompleteKey] = useState(0);
  
  // Ref to prevent duplicate initialization in strict mode
  const isInitialized = useRef(false);

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>([
    { id: 'unitName', label: 'Unit', selected: true },
    { id: 'billDate', label: 'Bill Date', selected: true },
    { id: 'billNo', label: 'Bill No', selected: true },
    { id: 'partyName', label: 'Party', selected: true },
    { id: 'cityName', label: 'City', selected: true },
    { id: 'transporterName', label: 'Transporter', selected: true },
    { id: 'lrNo', label: 'LR No', selected: true },
    { id: 'lrDate', label: 'LR Date', selected: true },
    { id: 'lrWeight', label: 'Weight', selected: true },
    { id: 'ratePerQtl', label: 'Rate/Qtl', selected: true },
    { id: 'lrAmount', label: 'LR Amount', selected: false },
    { id: 'freight', label: 'Freight', selected: false },
    { id: 'totalFreight', label: 'Total Freight', selected: false },
    { id: 'truckNo', label: 'Truck No', selected: false },
    { id: 'billAmount', label: 'Bill Amount', selected: false },
    { id: 'otherExpenses', label: 'Other Expenses', selected: false },
    { id: 'totalQty', label: 'Total Qty', selected: false },
  ]);

  const theme = useTheme();

  // Memoize footer calculations to improve performance
  const footerTotals = useMemo(() => {
    if (!Array.isArray(lrEntries) || lrEntries.length === 0) {
      return {
        totalWeight: 0,
        avgRate: 0,
        totalLrQty: 0,
        totalLrAmount: 0,
        totalFreight: 0,
        totalQty: 0,
        totalTrucks: 0
      };
    }

    const totalWeight = lrEntries.reduce((sum, entry) => sum + (entry.lrWeight || 0), 0);
    const totalLrQty = lrEntries.reduce((sum, entry) => sum + (entry.lrQty || 0), 0);
    const totalLrAmount = lrEntries.reduce((sum, entry) => sum + (entry.lrAmount || 0), 0);
    const totalFreight = lrEntries.reduce((sum, entry) => sum + (entry.freight || 0), 0);
    const totalQty = lrEntries.reduce((sum, entry) => sum + (entry.totalQty || 0), 0);
    const totalTrucks = lrEntries.filter(entry => entry.truckNo && entry.truckNo.trim()).length;
    
    const validEntries = lrEntries.filter(entry => entry.ratePerQtl && entry.ratePerQtl > 0);
    const avgRate = validEntries.length > 0 
      ? validEntries.reduce((sum, entry) => sum + (entry.ratePerQtl || 0), 0) / validEntries.length
      : 0;

    return {
      totalWeight,
      avgRate,
      totalLrQty,
      totalLrAmount,
      totalFreight,
      totalQty,
      totalTrucks
    };
  }, [lrEntries]);

  useEffect(() => {
    const initializeData = async () => {
      // First load the master data (dropdowns)
      await fetchInitialData();
      
      // Then load some initial LR entries to populate the grid
      try {
        console.log('Loading initial LR entries...');
        const response = await lrService.getLREntries({
          startDate: null,
          endDate: null,
          unitId: '',
          partyId: '',
          transporterId: '',
          cityId: '',
          billNo: '',
          lrNo: '',
          truckNo: '',
          page: 1,
          pageSize: 10,
          sortBy: 'lrDate',
          sortOrder: 'desc',
        });
        setLrEntries(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.total
        }));
        console.log('Initial LR entries loaded:', response.data.length, 'entries');
      } catch (error) {
        console.error('Error loading initial LR entries:', error);
        setError('Failed to load LR entries. Please try using the Search button.');
      }
    };
    
    initializeData();
  }, []);

  // Debounced party search to avoid too many API calls
  useEffect(() => {
    if (partyInputValue.length >= 2) {
      const debounceTimer = setTimeout(() => {
        fetchParties(partyInputValue);
      }, 300); // 300ms delay
      
      return () => clearTimeout(debounceTimer);
    }
  }, [partyInputValue]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data with individual error handling to prevent one failed request from breaking all
      const promises = [
        axios.get('/api/Archive/LR/units').catch(err => {
          console.error('Failed to load units:', err);
          return { data: [] };
        }),
        axios.get('/api/Archive/LR/parties').catch(err => {
          console.error('Failed to load parties:', err);
          return { data: [] };
        }),
        axios.get('/api/Archive/LR/transporters').catch(err => {
          console.error('Failed to load transporters:', err);
          return { data: [] };
        }),
        axios.get('/api/Archive/LR/cities').catch(err => {
          console.error('Failed to load cities:', err);
          return { data: [] };
        }),
      ];

      const [unitsResponse, partiesResponse, transportersResponse, citiesResponse] = await Promise.all(promises);

      setUnits(unitsResponse.data);
      setParties(partiesResponse.data);
      setTransporters(transportersResponse.data);
      setCities(citiesResponse.data);
      
      console.log('Initial data loaded successfully');
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError('Failed to load initial data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof LRFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await lrService.getLREntries({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
      });

      setLrEntries(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total
      }));
    } catch (error) {
      console.error('Error searching LR entries:', error);
      setError('Failed to search LR entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    handleSearch();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      unitId: '',
      partyId: '',
      transporterId: '',
      cityId: '',
      billNo: '',
      lrNo: '',
      truckNo: '',
    });
    setSelectedParty(null);
    setPartyInputValue('');
    setAutocompleteKey(prev => prev + 1);
    setPagination(prev => ({
      ...prev,
      page: 1,
      total: 0
    }));
    setLrEntries([]);
    setError(null);
  };

  const fetchParties = useCallback(async (searchTerm: string) => {
    try {
      setPartySearchLoading(true);
      console.log('Searching parties for:', searchTerm);
      const response = await axios.get('/api/Archive/LR/parties/search', {
        params: { search: searchTerm }
      });
      setParties(response.data);
    } catch (error) {
      console.error('Error fetching parties:', error);
      // Don't update parties on error to keep existing data
    } finally {
      setPartySearchLoading(false);
    }
  }, []);

  const handleColumnToggle = (columnId: string) => {
    setColumnOptions(prev => prev.map(col => 
      col.id === columnId ? { ...col, selected: !col.selected } : col
    ));
  };

  const handleSelectAllColumns = (selected: boolean) => {
    setColumnOptions(prev => prev.map(col => ({ ...col, selected })));
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
    
    console.log('Selected columns for export:', selectedColumns);
    console.log('Column options state:', columnOptions);
    console.log('Export type:', exportType);
    
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
      
      // Format any existing dates
      if (filters.startDate) {
        params.startDate = filters.startDate.format('YYYY-MM-DD');
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate.format('YYYY-MM-DD');
      }

      console.log('Sending summary request with params:', params);
      console.log('Selected columns being sent:', selectedColumns);

      const response = await axios.get('/api/Archive/LR/export/summary', {
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
        fileName = `LR_SUMMARY_AS_ON_${asOnDate.format('DDMMMYYYY')}.pdf`;
      } else {
        // Date range report
        const startDate = dayjs(params.startDate as string);
        const endDate = dayjs(params.endDate as string);
        fileName = `LR_SUMMARY_${startDate.format('DDMMMYYYY')}_TO_${endDate.format('DDMMMYYYY')}.pdf`;
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
        setError(error.response?.data?.message || 'Failed to generate summary PDF. Please try again later.');
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
      
      // Format any existing dates
      if (filters.startDate) {
        params.startDate = filters.startDate.format('YYYY-MM-DD');
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate.format('YYYY-MM-DD');
      }

      console.log(`Sending ${type} export request with params:`, params);
      console.log('Selected columns being sent:', selectedColumns);

      const response = await axios.get(`/api/Archive/LR/export/${type}`, {
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
        fileName = `LR_ENTRIES_AS_ON_${asOnDate.format('DDMMMYYYY')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      } else {
        // Date range report
        const startDate = dayjs(params.startDate as string);
        const endDate = dayjs(params.endDate as string);
        fileName = `LR_ENTRIES_${startDate.format('DDMMMYYYY')}_TO_${endDate.format('DDMMMYYYY')}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
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
        setError(error.response?.data?.message || `Failed to export to ${type.toUpperCase()}. Please try again later.`);
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
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 8 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ mb: 0, flexGrow: 1 }}>
            Lorry Receipt Management
          </Typography>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
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
                        right: '40px',
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
                        right: '40px',
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
              <Autocomplete
                options={units}
                getOptionLabel={(option) => option.unitName}
                value={units.find(unit => unit.unitId.toString() === filters.unitId) || null}
                onChange={(event, newValue) => {
                  handleFilterChange('unitId', newValue ? newValue.unitId.toString() : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Unit"
                    placeholder="Select or search unit"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={option.unitId} {...otherProps}>
                      {option.unitName}
                    </li>
                  );
                }}
                noOptionsText="No units found"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                key={autocompleteKey}
                freeSolo
                options={parties}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.partyName;
                }}
                value={selectedParty}
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {
                    handleFilterChange('partyId', newValue);
                  } else if (newValue) {
                    handleFilterChange('partyId', newValue.partyId.toString());
                    setSelectedParty(newValue);
                  } else {
                    handleFilterChange('partyId', '');
                    setSelectedParty(null);
                  }
                }}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason !== 'clear') {
                    setPartyInputValue(newInputValue);
                  }
                  if (reason === 'clear') {
                    handleFilterChange('partyId', '');
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Party"
                    placeholder="Search by party name"
                  />
                )}
                loading={partySearchLoading}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={option.partyId} {...otherProps}>
                      {option.partyName} {option.cityName && `- ${option.cityName}`}
                    </li>
                  );
                }}
                noOptionsText="No parties found"
                loadingText="Loading parties..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={transporters}
                getOptionLabel={(option) => option.transporterName}
                value={transporters.find(transporter => transporter.transporterId.toString() === filters.transporterId) || null}
                onChange={(event, newValue) => {
                  handleFilterChange('transporterId', newValue ? newValue.transporterId.toString() : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Transporter"
                    placeholder="Select or search transporter"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={option.transporterId} {...otherProps}>
                      {option.transporterName}
                    </li>
                  );
                }}
                noOptionsText="No transporters found"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => option.cityName}
                value={cities.find(city => city.cityName === filters.cityId) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    // Always use cityName for filtering since cityId can be null
                    handleFilterChange('cityId', newValue.cityName);
                  } else {
                    handleFilterChange('cityId', '');
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="City"
                    placeholder="Select or search city"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={`${option.cityId}-${option.cityName}`} {...otherProps}>
                      {option.cityName}
                    </li>
                  );
                }}
                noOptionsText="No cities found"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Bill No"
                value={filters.billNo}
                onChange={(e) => handleFilterChange('billNo', e.target.value)}
                placeholder="Enter bill number"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="LR No"
                value={filters.lrNo}
                onChange={(e) => handleFilterChange('lrNo', e.target.value)}
                placeholder="Enter LR number"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Truck No"
                value={filters.truckNo}
                onChange={(e) => handleFilterChange('truckNo', e.target.value)}
                placeholder="Enter truck number"
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
              <TableHead sx={getTableHeaderStyle()}>
                <TableRow>
                  <TableCell>Unit</TableCell>
                  <TableCell>Bill Date</TableCell>
                  <TableCell>Bill No</TableCell>
                  <TableCell>Party</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Transporter</TableCell>
                  <TableCell>LR No</TableCell>
                  <TableCell>LR Date</TableCell>
                  <TableCell align="right">LR Weight</TableCell>
                  <TableCell align="right">Rate/Qtl</TableCell>
                  <TableCell align="right">LR Qty</TableCell>
                  <TableCell align="right">LR Amount</TableCell>
                  <TableCell align="right">Freight</TableCell>
                  <TableCell align="right">Total Qty</TableCell>
                  <TableCell>Truck No</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={15} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(lrEntries) || lrEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  lrEntries.map((entry) => (
                    <TableRow key={entry.entryId}>
                      <TableCell>{entry.unitName}</TableCell>
                      <TableCell>{entry.billDate ? dayjs(entry.billDate).format('DD/MM/YYYY') : '-'}</TableCell>
                      <TableCell>{entry.billNo}</TableCell>
                      <TableCell>{entry.partyName}</TableCell>
                      <TableCell>{entry.cityName}</TableCell>
                      <TableCell>{entry.transporterName}</TableCell>
                      <TableCell>{entry.lrNo}</TableCell>
                      <TableCell>{entry.lrDate ? dayjs(entry.lrDate).format('DD/MM/YYYY') : '-'}</TableCell>
                      <TableCell align="right">{entry.lrWeight?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">{entry.ratePerQtl?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">{entry.lrQty?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">₹{entry.lrAmount?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">₹{entry.freight?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">{entry.totalQty?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{entry.truckNo || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Comprehensive footer row outside table for full width */}
          {Array.isArray(lrEntries) && lrEntries.length > 0 && (
            <Box 
              sx={{ 
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? theme.palette.grey[800] 
                  : theme.palette.grey[100],
                borderTop: (theme) => `2px solid ${theme.palette.divider}`,
                p: 2,
                overflow: 'auto'
              }}
            >
              <Grid container spacing={2} sx={{ minWidth: '100%' }}>
                <Grid item xs={12} md={2}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    color: (theme) => theme.palette.text.primary,
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}>
                    TOTALS
                    <br />
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      ({lrEntries.length} records)
                    </Typography>
                  </Typography>
                </Grid>
                
                <Grid item xs={6} md={1.5}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 'bold', 
                      color: (theme) => theme.palette.primary.main,
                      fontSize: '0.75rem'
                    }}>
                      Weight
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {footerTotals.totalWeight.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={1.5}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 'bold', 
                      color: (theme) => theme.palette.primary.main,
                      fontSize: '0.75rem'
                    }}>
                      Avg Rate
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {footerTotals.avgRate.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={1.5}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 'bold', 
                      color: (theme) => theme.palette.primary.main,
                      fontSize: '0.75rem'
                    }}>
                      LR Qty
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {footerTotals.totalLrQty.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={1.5}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 'bold', 
                      color: (theme) => theme.palette.success.main,
                      fontSize: '0.75rem'
                    }}>
                      LR Amount
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      ₹{footerTotals.totalLrAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={1.5}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 'bold', 
                      color: (theme) => theme.palette.success.main,
                      fontSize: '0.75rem'
                    }}>
                      Freight
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      ₹{footerTotals.totalFreight.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={1.5}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 'bold', 
                      color: (theme) => theme.palette.primary.main,
                      fontSize: '0.75rem'
                    }}>
                      Total Qty
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {footerTotals.totalQty.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} md={1}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 'bold',
                      color: (theme) => theme.palette.info.main,
                      fontSize: '0.75rem'
                    }}>
                      Trucks
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {footerTotals.totalTrucks}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
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

export default LorryReceipt; 