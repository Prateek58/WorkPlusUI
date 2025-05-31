import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useTheme,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  TablePagination,
  InputAdornment,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import LeaveTypeFormDialog from './LeaveTypeFormDialog';
import Loader from '../../../../Common/components/Loader';
import { useHRService } from '../../../services/hrService';
import type { LeaveType } from '../../../services/hrService';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface LeaveTypesDialogProps {
  open: boolean;
  onClose: () => void;
}

const LeaveTypesDialog: React.FC<LeaveTypesDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const hrService = useHRService();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [filteredLeaveTypes, setFilteredLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (open) {
      loadLeaveTypes();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setLeaveTypes([]);
      setFilteredLeaveTypes([]);
      setSelectedLeaveType(null);
      setIsFormOpen(false);
      setIsEdit(false);
      setSearchQuery('');
      setPage(0);
    }
  }, [open]);

  useEffect(() => {
    // Filter leave types based on search query
    const filtered = leaveTypes.filter(leaveType => {
      const searchLower = searchQuery.toLowerCase();
      return (
        leaveType.name?.toLowerCase().includes(searchLower) ||
        leaveType.description?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredLeaveTypes(filtered);
    setPage(0); // Reset to first page when search changes
  }, [searchQuery, leaveTypes]);

  const loadLeaveTypes = async () => {
    setLoading(true);
    try {
      const data = await hrService.getLeaveTypes();
      setLeaveTypes(data);
      setFilteredLeaveTypes(data);
    } catch (error) {
      console.error('Error loading leave types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedLeaveType(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (leaveType: LeaveType) => {
    if (window.confirm(`Are you sure you want to delete the leave type "${leaveType.name}"?`)) {
      setLoading(true);
      try {
        // TODO: Implement delete API call when available
        // await hrService.deleteLeaveType(leaveType.id);
        console.log('Delete leave type:', leaveType.id);
        await loadLeaveTypes();
      } catch (error) {
        console.error('Error deleting leave type:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedLeaveType(null);
    setIsEdit(false);
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      await loadLeaveTypes();
      handleFormClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <Loader open={loading} message="Loading leave types..." />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            boxShadow: 24,
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h6" component="div">
            Leave Types
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search leave types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Leave Type
            </Button>
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
          </Box>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 3,
          position: 'relative',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {!loading && filteredLeaveTypes.length > 0 && (
            <TableContainer 
              component={Paper}
              sx={{
                opacity: loading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out',
                flex: 1
              }}
            >
              <Table>
                <TableHead sx={getTableHeaderStyle()}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Max Days/Year</TableCell>
                    <TableCell>Carry Forward</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeaveTypes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((leaveType) => (
                      <TableRow key={leaveType.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {leaveType.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {leaveType.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {leaveType.maxDaysPerYear || 'Unlimited'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={leaveType.carryForward ? 'Yes' : 'No'}
                            color={leaveType.carryForward ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={leaveType.isActive ? 'Active' : 'Inactive'}
                            color={leaveType.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(leaveType)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(leaveType)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredLeaveTypes.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
          {!loading && filteredLeaveTypes.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              color: theme.palette.text.secondary
            }}>
              <Typography>
                {searchQuery ? 'No leave types found matching your search' : 'No leave types found'}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <LeaveTypeFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        leaveType={selectedLeaveType || undefined}
        isEdit={isEdit}
        onSubmit={handleFormSubmit}
      />
    </>
  );
};

export default LeaveTypesDialog; 