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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Autocomplete,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useHRService, Worker, LeaveType, LeaveBalance, AllocateLeaveBalance } from '../../services/hrService';

interface LeaveBalanceFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LeaveBalanceForm: React.FC<LeaveBalanceFormProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const hrService = useHRService();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [formData, setFormData] = useState<AllocateLeaveBalance>({
    workerId: 0,
    leaveTypeId: 0,
    year: new Date().getFullYear(),
    allocated: 0
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadMasterData();
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (selectedWorker) {
      loadLeaveBalances(selectedWorker.workerId);
    }
  }, [selectedWorker]);

  const loadMasterData = async () => {
    try {
      const [workersData, leaveTypesData] = await Promise.all([
        hrService.getWorkers(),
        hrService.getLeaveTypes()
      ]);
      setWorkers(workersData.filter(w => w.isActive));
      setLeaveTypes(leaveTypesData.filter(lt => lt.isActive));
    } catch (error) {
      console.error('Error loading master data:', error);
      setError('Failed to load master data');
    }
  };

  const loadLeaveBalances = async (workerId: number) => {
    try {
      const balances = await hrService.getLeaveBalance(workerId);
      setLeaveBalances(balances);
    } catch (error) {
      console.error('Error loading leave balances:', error);
      setLeaveBalances([]);
    }
  };

  const resetForm = () => {
    setFormData({
      workerId: 0,
      leaveTypeId: 0,
      year: new Date().getFullYear(),
      allocated: 0
    });
    setSelectedWorker(null);
    setLeaveBalances([]);
    setError('');
  };

  const handleAllocate = async () => {
    try {
      setError('');
      setLoading(true);
      
      if (!selectedWorker) {
        setError('Please select a worker');
        return;
      }

      if (!formData.leaveTypeId) {
        setError('Please select leave type');
        return;
      }

      if (formData.allocated <= 0) {
        setError('Please enter a valid allocation amount');
        return;
      }

      const allocationData = {
        ...formData,
        workerId: selectedWorker.workerId
      };

      await hrService.allocateLeaveBalance(allocationData);
      
      // Reload balances
      await loadLeaveBalances(selectedWorker.workerId);
      
      // Reset allocation form
      setFormData({
        ...formData,
        leaveTypeId: 0,
        allocated: 0
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error allocating leave balance:', error);
      setError(error.response?.data?.message || 'Failed to allocate leave balance');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAllocate = async () => {
    if (!selectedWorker) {
      setError('Please select a worker');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      await hrService.autoAllocateLeaveBalance(selectedWorker.workerId, formData.year);
      
      // Reload balances
      await loadLeaveBalances(selectedWorker.workerId);
      onSuccess();
    } catch (error: any) {
      console.error('Error auto-allocating leave balance:', error);
      setError(error.response?.data?.message || 'Failed to auto-allocate leave balance');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getBalanceColor = (balance: number, allocated: number) => {
    const percentage = allocated > 0 ? (balance / allocated) * 100 : 0;
    if (percentage > 50) return 'success';
    if (percentage > 20) return 'warning';
    return 'error';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Manage Leave Balances
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Worker Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={workers}
                getOptionLabel={(option) => option.fullName}
                value={selectedWorker}
                onChange={(_, newValue) => {
                  setSelectedWorker(newValue);
                  setFormData({ ...formData, workerId: newValue?.workerId || 0 });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Worker"
                    required
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

            {/* Year Selection */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                inputProps={{ min: 2020, max: 2030 }}
              />
            </Grid>

            {/* Auto Allocate Button */}
            {selectedWorker && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleAutoAllocate}
                    disabled={loading}
                  >
                    Auto Allocate All Leave Types
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    This will automatically allocate standard leave balances based on leave type configurations
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Manual Allocation Form */}
            {selectedWorker && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Manual Allocation
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Leave Type</InputLabel>
                    <Select
                      value={formData.leaveTypeId}
                      label="Leave Type"
                      onChange={(e) => setFormData({ ...formData, leaveTypeId: Number(e.target.value) })}
                    >
                      <MenuItem value={0}>Select Leave Type</MenuItem>
                      {leaveTypes.map((leaveType) => (
                        <MenuItem key={leaveType.id} value={leaveType.id}>
                          {leaveType.name} (Max: {leaveType.maxDaysPerYear} days)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    required
                    label="Allocated Days"
                    type="number"
                    value={formData.allocated}
                    onChange={(e) => setFormData({ ...formData, allocated: parseInt(e.target.value) || 0 })}
                    inputProps={{ min: 0, max: 365 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAllocate}
                    disabled={loading || !formData.leaveTypeId || formData.allocated <= 0}
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Allocate
                  </Button>
                </Grid>
              </>
            )}

            {/* Current Balances Table */}
            {selectedWorker && leaveBalances.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Current Leave Balances for {selectedWorker.fullName}
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell align="center">Year</TableCell>
                        <TableCell align="center">Allocated</TableCell>
                        <TableCell align="center">Used</TableCell>
                        <TableCell align="center">Remaining</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaveBalances.map((balance) => (
                        <TableRow key={balance.id}>
                          <TableCell>{balance.leaveTypeName}</TableCell>
                          <TableCell align="center">{balance.year}</TableCell>
                          <TableCell align="center">{balance.allocated}</TableCell>
                          <TableCell align="center">{balance.used}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="medium">
                              {balance.balance}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${balance.balance} days`}
                              color={getBalanceColor(balance.balance, balance.allocated) as any}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {selectedWorker && leaveBalances.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  No leave balances found for {selectedWorker.fullName} in {formData.year}. 
                  Use "Auto Allocate" or manually allocate leave balances.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveBalanceForm; 