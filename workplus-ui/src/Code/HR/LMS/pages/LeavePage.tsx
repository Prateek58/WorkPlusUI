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
  Tabs,
  Tab,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  AccountBalance as BalanceIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useHRService, LeaveRequest, Worker, LeaveType } from '../../services/hrService';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveBalanceForm from '../components/LeaveBalanceForm';
import { useConfirm } from '../../../Common/hooks/useConfirm';
import DashboardLayout from '../../../Common/components/DashboardLayout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leave-tabpanel-${index}`}
      aria-labelledby={`leave-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LeavePage: React.FC = () => {
  const hrService = useHRService();
  const { showConfirmDialog } = useConfirm();
  
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [filterWorker, setFilterWorker] = useState<Worker | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Dialogs
  const [leaveFormOpen, setLeaveFormOpen] = useState(false);
  const [leaveBalanceFormOpen, setLeaveBalanceFormOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadLeaveRequests();
  }, [filterWorker, filterStatus]);

  const loadInitialData = async () => {
    try {
      const [workersData, leaveTypesData] = await Promise.all([
        hrService.getWorkers(),
        hrService.getLeaveTypes()
      ]);
      setWorkers(workersData.filter(w => w.isActive));
      setLeaveTypes(leaveTypesData.filter(lt => lt.isActive));
      await loadLeaveRequests();
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load data');
    }
  };

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const workerId = filterWorker?.workerId || undefined;
      const status = filterStatus || undefined;
      
      const requests = await hrService.getLeaveRequests(workerId, status);
      setLeaveRequests(requests);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request: LeaveRequest) => {
    showConfirmDialog({
      title: 'Approve Leave Request',
      message: `Are you sure you want to approve leave request for ${request.workerName} from ${dayjs(request.startDate).format('DD/MM/YYYY')} to ${dayjs(request.endDate).format('DD/MM/YYYY')}?`,
      confirmText: 'Approve',
      onConfirm: async () => {
        try {
          await hrService.approveLeaveRequest(request.id, { status: 'Approved' });
          await loadLeaveRequests();
        } catch (error) {
          console.error('Error approving leave request:', error);
          setError('Failed to approve leave request');
        }
      }
    });
  };

  const handleReject = (request: LeaveRequest) => {
    showConfirmDialog({
      title: 'Reject Leave Request',
      message: `Are you sure you want to reject leave request for ${request.workerName}? Please provide a reason for rejection.`,
      confirmText: 'Reject',
      onConfirm: async () => {
        try {
          // TODO: Add rejection reason input dialog
          await hrService.approveLeaveRequest(request.id, { 
            status: 'Rejected',
            rejectionReason: 'Rejected by manager'
          });
          await loadLeaveRequests();
        } catch (error) {
          console.error('Error rejecting leave request:', error);
          setError('Failed to reject leave request');
        }
      }
    });
  };

  const handleFormSuccess = () => {
    loadLeaveRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getFilteredRequests = () => {
    let filtered = leaveRequests;
    
    switch (tabValue) {
      case 0: // All
        break;
      case 1: // Pending
        filtered = filtered.filter(r => r.status === 'Pending');
        break;
      case 2: // Approved
        filtered = filtered.filter(r => r.status === 'Approved');
        break;
      case 3: // Rejected
        filtered = filtered.filter(r => r.status === 'Rejected');
        break;
    }
    
    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  // Statistics
  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'Rejected').length;

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Leave Management
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Requests
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved Requests
              </Typography>
              <Typography variant="h4" color="success.main">
                {approvedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rejected Requests
              </Typography>
              <Typography variant="h4" color="error.main">
                {rejectedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4">
                {leaveRequests.length}
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
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setLeaveFormOpen(true)}
                sx={{ 
                  minWidth: 'auto', 
                  whiteSpace: 'nowrap',
                  height: '36px', // Slightly smaller height
                  fontSize: '0.875rem' // Smaller font to fit better
                }}
              >
                New Leave Request
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<BalanceIcon />}
                onClick={() => setLeaveBalanceFormOpen(true)}
                sx={{ 
                  minWidth: 'auto', 
                  whiteSpace: 'nowrap',
                  height: '36px', // Slightly smaller height
                  fontSize: '0.875rem' // Smaller font to fit better
                }}
              >
                Manage Balances
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label={`All (${leaveRequests.length})`} />
            <Tab label={`Pending (${pendingCount})`} />
            <Tab label={`Approved (${approvedCount})`} />
            <Tab label={`Rejected (${rejectedCount})`} />
          </Tabs>
        </Box>

        {/* Leave Requests Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Worker</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {request.workerName}
                      </Typography>
                    </TableCell>
                    <TableCell>{request.leaveTypeName}</TableCell>
                    <TableCell>
                      {dayjs(request.startDate).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>
                      {dayjs(request.endDate).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {request.totalDays} days
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {dayjs(request.appliedDate).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {request.reason}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {request.status === 'Pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(request)}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(request)}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {request.status !== 'Pending' && (
                        <Typography variant="body2" color="text.secondary">
                          {request.status === 'Approved' ? 'Approved' : 'Rejected'}
                          {request.approvedDate && (
                            <> on {dayjs(request.approvedDate).format('DD/MM/YYYY')}</>
                          )}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRequests.length}
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
      <LeaveRequestForm
        open={leaveFormOpen}
        onClose={() => setLeaveFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
      
      <LeaveBalanceForm
        open={leaveBalanceFormOpen}
        onClose={() => setLeaveBalanceFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
      </Box>
    </DashboardLayout>
  );
};

export default LeavePage; 