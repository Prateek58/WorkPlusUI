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
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import JobGroupFormDialog from './JobGroupFormDialog';
import { JobGroup, useJobGroupService } from './jobGroupService';
import Loader from '../../../../Common/components/Loader';
import { useConfirm } from '../../../../Common/hooks/useConfirm';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface JobGroupsDialogProps {
  open: boolean;
  onClose: () => void;
}

const JobGroupsDialog: React.FC<JobGroupsDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [jobGroups, setJobGroups] = useState<JobGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<JobGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<JobGroup | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { getJobGroups, getJobGroup, createJobGroup, updateJobGroup, deleteJobGroup } = useJobGroupService();
  const { showConfirmDialog } = useConfirm();

  useEffect(() => {
    if (open) {
      loadJobGroups();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setJobGroups([]);
      setFilteredGroups([]);
      setSelectedGroup(null);
      setIsFormOpen(false);
      setIsEdit(false);
      setSearchQuery('');
      setPage(0);
    }
  }, [open]);

  useEffect(() => {
    // Filter job groups based on search query
    const filtered = jobGroups.filter(group => {
      const searchLower = searchQuery.toLowerCase();
      return (
        group.groupName.toLowerCase().includes(searchLower) ||
        group.groupId.toString().includes(searchQuery) ||
        group.minWorkers.toString().includes(searchQuery) ||
        group.maxWorkers.toString().includes(searchQuery)
      );
    });
    setFilteredGroups(filtered);
    setPage(0); // Reset to first page when search changes
  }, [searchQuery, jobGroups]);

  const loadJobGroups = async () => {
    setLoading(true);
    try {
      const data = await getJobGroups();
      setJobGroups(data);
      setFilteredGroups(data);
    } catch (error) {
      console.error('Error loading job groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedGroup(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditClick = async (group: JobGroup) => {
    setLoading(true);
    try {
      const groupData = await getJobGroup(group.groupId);
      setSelectedGroup(groupData);
      setIsEdit(true);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error loading job group details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (group: JobGroup) => {
    showConfirmDialog({
      title: 'Delete Job Group',
      message: `Are you sure you want to delete "${group.groupName}"? This action cannot be undone.`,
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteJobGroup(group.groupId);
          await loadJobGroups();
        } catch (error: any) {
          console.error('Error deleting job group:', error);
          // Show more specific error if available
          const errorMessage = error.response?.data || 'An error occurred while deleting the job group.';
          showConfirmDialog({
            title: 'Error',
            message: errorMessage,
            showCancel: false,
            confirmText: 'OK',
            onConfirm: () => {}
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedGroup(null);
    setIsEdit(false);
  };

  const handleFormSubmit = async (jobGroup: JobGroup) => {
    setLoading(true);
    try {
      if (isEdit) {
        await updateJobGroup(jobGroup);
      } else {
        await createJobGroup(jobGroup);
      }
      await loadJobGroups();
      handleFormClose();
    } catch (error) {
      console.error('Error saving job group:', error);
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
      <Loader open={loading} message="Loading job groups..." />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.default,
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
            Job Groups
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Job Group
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
        <DialogContent sx={{ p: 2 }}>
          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none', minHeight: '400px' }}>
            <Table>
              <TableHead
                sx={getTableHeaderStyle()}
              >
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Group Name</TableCell>
                  <TableCell>Min Workers</TableCell>
                  <TableCell>Max Workers</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGroups
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((group) => (
                    <TableRow key={group.groupId} hover>
                      <TableCell>{group.groupId}</TableCell>
                      <TableCell>{group.groupName}</TableCell>
                      <TableCell>{group.minWorkers}</TableCell>
                      <TableCell>{group.maxWorkers}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleEditClick(group)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteClick(group)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredGroups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      {jobGroups.length === 0 ? 'No job groups found' : 'No matching job groups found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredGroups.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </DialogContent>
      </Dialog>

      <JobGroupFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        jobGroup={selectedGroup}
        isEdit={isEdit}
      />
    </>
  );
};

export default JobGroupsDialog; 