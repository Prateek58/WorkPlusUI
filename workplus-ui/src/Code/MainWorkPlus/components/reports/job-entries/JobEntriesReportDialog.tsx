import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useTheme,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Autocomplete,
  Tooltip,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import dayjs, { Dayjs } from 'dayjs';
import jobEntryReportService, { 
  JobEntryReport, 
  JobEntryFilter,
  FilterOptions,
  WorkerOption,
  GroupOption,
  ExportColumns
} from './jobEntryReportService';
import ColumnSelectionDialog from './ColumnSelectionDialog';
import { 
  centeredContentStyles
} from '../../../../../theme/styleUtils';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface JobEntriesReportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface FilterState {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  entryType: string;
  jobId: string;
  workerId: string;
  groupId: string;
  isPostLunch: string;
}

const JobEntriesReportDialog: React.FC<JobEntriesReportDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<JobEntryReport[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    entryType: '',
    jobId: '',
    workerId: '',
    groupId: '',
    isPostLunch: '',
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    jobs: [],
    workers: [],
    groups: [],
    entryTypes: []
  });

  // Export states
  const [exportColumns, setExportColumns] = useState<ExportColumns>({ availableColumns: [] });
  const [columnSelectionOpen, setColumnSelectionOpen] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [exportLoading, setExportLoading] = useState(false);

  // Worker search
  const [workerInputValue, setWorkerInputValue] = useState('');
  const [selectedWorker, setSelectedWorker] = useState<WorkerOption | null>(null);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerOption[]>([]);

  // Group search  
  const [groupInputValue, setGroupInputValue] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);
  const [filteredGroups, setFilteredGroups] = useState<GroupOption[]>([]);

  const fetchFilterOptions = async () => {
    try {
      const options = await jobEntryReportService.getFilterOptions();
      setFilterOptions(options);
      setFilteredWorkers(options.workers);
      setFilteredGroups(options.groups);
    } catch (err) {
      console.error('Error fetching filter options:', err);
      setError('Failed to load filter options.');
    }
  };

  const fetchExportColumns = async () => {
    try {
      const columns = await jobEntryReportService.getExportColumns();
      setExportColumns(columns);
    } catch (err) {
      console.error('Error fetching export columns:', err);
      setError('Failed to load export columns.');
    }
  };

  const fetchSavedRecords = async () => {
    setLoading(true);
    try {
      // Build filter object
      const filter: JobEntryFilter = {
        pageNumber: page + 1,
        pageSize: rowsPerPage,
      };

      // Add filters if they have values
      if (filters.startDate) {
        filter.startDate = filters.startDate.format('YYYY-MM-DD');
      }
      if (filters.endDate) {
        filter.endDate = filters.endDate.format('YYYY-MM-DD');
      }
      if (filters.entryType) {
        filter.entryType = filters.entryType;
      }
      if (filters.jobId) {
        filter.jobId = parseInt(filters.jobId);
      }
      if (filters.workerId) {
        filter.workerId = parseInt(filters.workerId);
      }
      if (filters.groupId) {
        filter.groupId = parseInt(filters.groupId);
      }
      if (filters.isPostLunch) {
        filter.isPostLunch = filters.isPostLunch === 'true';
      }

      const response = await jobEntryReportService.getFilteredJobEntriesReport(filter);
      setSavedRecords(response.items);
      setTotalCount(response.totalCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching job entries:', err);
      setError('Failed to load saved records.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    fetchSavedRecords();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      entryType: '',
      jobId: '',
      workerId: '',
      groupId: '',
      isPostLunch: '',
    });
    setSelectedWorker(null);
    setSelectedGroup(null);
    setWorkerInputValue('');
    setGroupInputValue('');
    setPage(0);
    setError(null);
  };

  const handleExportClick = (exportType: 'excel' | 'csv' | 'pdf') => {
    setSelectedExportType(exportType);
    setColumnSelectionOpen(true);
  };

  const handleExportConfirm = async (selectedColumns: string[], exportType: 'excel' | 'csv' | 'pdf') => {
    setExportLoading(true);
    try {
      // Build filter for export (without pagination)
      const filter: JobEntryFilter = {};

      // Add filters if they have values
      if (filters.startDate) {
        filter.startDate = filters.startDate.format('YYYY-MM-DD');
      }
      if (filters.endDate) {
        filter.endDate = filters.endDate.format('YYYY-MM-DD');
      }
      if (filters.entryType) {
        filter.entryType = filters.entryType;
      }
      if (filters.jobId) {
        filter.jobId = parseInt(filters.jobId);
      }
      if (filters.workerId) {
        filter.workerId = parseInt(filters.workerId);
      }
      if (filters.groupId) {
        filter.groupId = parseInt(filters.groupId);
      }
      if (filters.isPostLunch) {
        filter.isPostLunch = filters.isPostLunch === 'true';
      }

      const exportRequest = {
        filter,
        selectedColumns,
        exportType
      };

      const blob = await jobEntryReportService.exportJobEntries(exportRequest);
      
      const fileExtension = exportType === 'excel' ? 'xlsx' : exportType;
      const fileName = `JobEntriesReport_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;
      
      jobEntryReportService.downloadFile(blob, fileName);
      
      setError(null);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError(`Failed to export ${exportType.toUpperCase()} file.`);
    } finally {
      setExportLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter workers based on input
  useEffect(() => {
    if (workerInputValue.length >= 1) {
      const filtered = filterOptions.workers.filter(worker =>
        worker.fullName.toLowerCase().includes(workerInputValue.toLowerCase()) ||
        worker.workerId.toLowerCase().includes(workerInputValue.toLowerCase())
      );
      setFilteredWorkers(filtered);
    } else {
      setFilteredWorkers(filterOptions.workers);
    }
  }, [workerInputValue, filterOptions.workers]);

  // Filter groups based on input
  useEffect(() => {
    if (groupInputValue.length >= 1) {
      const filtered = filterOptions.groups.filter(group =>
        group.groupName.toLowerCase().includes(groupInputValue.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(filterOptions.groups);
    }
  }, [groupInputValue, filterOptions.groups]);

  // Fetch records when page or rowsPerPage changes
  useEffect(() => {
    if (open) {
      fetchSavedRecords();
    }
  }, [page, rowsPerPage]);

  // Fetch filter options and export columns when dialog opens
  useEffect(() => {
    if (open) {
      fetchFilterOptions();
      fetchExportColumns();
    }
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        fullScreen
        PaperProps={{
          sx: { 
            boxShadow: 24,
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" component="div">
            Job Entries Report
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.text.primary,
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 3,
          position: 'relative',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {error && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Filters
                </Typography>
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
                <FormControl fullWidth>
                  <InputLabel>Entry Type</InputLabel>
                  <Select
                    value={filters.entryType}
                    label="Entry Type"
                    onChange={(e) => handleFilterChange('entryType', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {filterOptions.entryTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                    {filterOptions.jobs.map((job) => (
                      <MenuItem key={job.id} value={job.id.toString()}>
                        {job.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  freeSolo
                  options={filteredWorkers}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return `${option.workerId} - ${option.fullName}`;
                  }}
                  value={selectedWorker}
                  onChange={(_event, newValue) => {
                    if (typeof newValue === 'string') {
                      handleFilterChange('workerId', newValue);
                    } else if (newValue) {
                      handleFilterChange('workerId', newValue.id.toString());
                      setSelectedWorker(newValue);
                    } else {
                      handleFilterChange('workerId', '');
                      setSelectedWorker(null);
                    }
                  }}
                  onInputChange={(_event, newInputValue, reason) => {
                    if (reason !== 'clear') {
                      setWorkerInputValue(newInputValue);
                    }
                    if (reason === 'clear') {
                      handleFilterChange('workerId', '');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Worker"
                      placeholder="Search by ID or name"
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={option.id} {...otherProps}>
                        {option.workerId} - {option.fullName}
                      </li>
                    );
                  }}
                  noOptionsText="No workers found"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  freeSolo
                  options={filteredGroups}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option.groupName;
                  }}
                  value={selectedGroup}
                  onChange={(_event, newValue) => {
                    if (typeof newValue === 'string') {
                      handleFilterChange('groupId', newValue);
                    } else if (newValue) {
                      handleFilterChange('groupId', newValue.id.toString());
                      setSelectedGroup(newValue);
                    } else {
                      handleFilterChange('groupId', '');
                      setSelectedGroup(null);
                    }
                  }}
                  onInputChange={(_event, newInputValue, reason) => {
                    if (reason !== 'clear') {
                      setGroupInputValue(newInputValue);
                    }
                    if (reason === 'clear') {
                      handleFilterChange('groupId', '');
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Group"
                      placeholder="Search groups"
                    />
                  )}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={option.id} {...otherProps}>
                        {option.groupName}
                      </li>
                    );
                  }}
                  noOptionsText="No groups found"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Shift</InputLabel>
                  <Select
                    value={filters.isPostLunch}
                    label="Shift"
                    onChange={(e) => handleFilterChange('isPostLunch', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="false">Morning</MenuItem>
                    <MenuItem value="true">Afternoon/Evening</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleResetFilters}
                    disabled={loading}
                  >
                    Reset All
                  </Button>
                  
                  <Divider orientation="vertical" flexItem sx={{ height: '40px' }} />
                  
                  {/* Export Buttons */}
                  <Typography variant="body2" color="text.secondary">
                    Export:
                  </Typography>
                  <Tooltip title="Export to Excel">
                    <Button
                      variant="outlined"
                      startIcon={<TableViewIcon />}
                      onClick={() => handleExportClick('excel')}
                      disabled={exportLoading || savedRecords.length === 0}
                      size="small"
                      sx={{ minWidth: '100px' }}
                    >
                      Excel
                    </Button>
                  </Tooltip>
                  <Tooltip title="Export to CSV">
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleExportClick('csv')}
                      disabled={exportLoading || savedRecords.length === 0}
                      size="small"
                      sx={{ minWidth: '100px' }}
                    >
                      CSV
                    </Button>
                  </Tooltip>
                  <Tooltip title="Export to PDF">
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleExportClick('pdf')}
                      disabled={exportLoading || savedRecords.length === 0}
                      size="small"
                      sx={{ minWidth: '100px' }}
                    >
                      PDF
                    </Button>
                  </Tooltip>
                  
                  {exportLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Exporting...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {loading ? (
            <Box sx={centeredContentStyles}>
              <CircularProgress />
            </Box>
          ) : savedRecords.length > 0 ? (
            <>
              <TableContainer component={Paper} sx={{ mt: 1, boxShadow: 'none', minHeight: '200px' }}>
                <Table>
                  <TableHead sx={getTableHeaderStyle()}>
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
        </DialogContent>
      </Dialog>

      {/* Column Selection Dialog */}
      <ColumnSelectionDialog
        open={columnSelectionOpen}
        onClose={() => setColumnSelectionOpen(false)}
        onConfirm={handleExportConfirm}
        availableColumns={exportColumns.availableColumns}
        exportType={selectedExportType}
      />
    </>
  );
};

export default JobEntriesReportDialog; 