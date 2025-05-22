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
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import GroupMemberFormDialog from './GroupMemberFormDialog';
import { 
  GroupMember, 
  GroupMemberCreate, 
  JobGroup, 
  Worker, 
  useGroupMemberService 
} from './groupMemberService';
import Loader from '../../../../Common/components/Loader';
import { useConfirm } from '../../../../Common/hooks/useConfirm';

interface GroupMembersDialogProps {
  open: boolean;
  onClose: () => void;
}

const GroupMembersDialog: React.FC<GroupMembersDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<GroupMember[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [jobGroups, setJobGroups] = useState<JobGroup[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
  
  const { 
    getGroupMembers,
    getGroupMembersByGroup,
    createGroupMember,
    deleteGroupMember,
    getJobGroups,
    getWorkers
  } = useGroupMemberService();
  
  const { showConfirmDialog } = useConfirm();

  useEffect(() => {
    if (open) {
      loadInitialData();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setGroupMembers([]);
      setFilteredMembers([]);
      setIsFormOpen(false);
      setSearchQuery('');
      setPage(0);
      setSelectedGroupId('');
    }
  }, [open]);

  useEffect(() => {
    // Filter members based on search query and selected group
    let filtered = groupMembers;
    
    if (selectedGroupId !== '') {
      filtered = filtered.filter(member => member.groupId === selectedGroupId);
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(member => {
        return (
          (member.workerName?.toLowerCase().includes(searchLower) || false) ||
          (member.groupName?.toLowerCase().includes(searchLower) || false)
        );
      });
    }
    
    setFilteredMembers(filtered);
    setPage(0); // Reset to first page when search or filter changes
  }, [searchQuery, groupMembers, selectedGroupId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load all required data in parallel
      const [membersData, groupsData, workersData] = await Promise.all([
        getGroupMembers(),
        getJobGroups(),
        getWorkers()
      ]);
      
      setGroupMembers(membersData);
      setFilteredMembers(membersData);
      setJobGroups(groupsData);
      setWorkers(workersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupMembers = async (groupId?: number) => {
    setLoading(true);
    try {
      let data;
      if (groupId !== undefined) {
        data = await getGroupMembersByGroup(groupId);
      } else {
        data = await getGroupMembers();
      }
      setGroupMembers(data);
      setFilteredMembers(data);
    } catch (error) {
      console.error('Error loading group members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
  };

  const handleDeleteClick = (member: GroupMember) => {
    const groupName = member.groupName || 'this group';
    const workerName = member.workerName || 'this worker';
    
    showConfirmDialog({
      title: 'Remove Worker from Group',
      message: `Are you sure you want to remove ${workerName} from ${groupName}? This action cannot be undone.`,
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteGroupMember(member.id);
          await loadGroupMembers(selectedGroupId !== '' ? selectedGroupId as number : undefined);
        } catch (error: any) {
          console.error('Error removing worker from group:', error);
          // Show more specific error if available
          const errorMessage = error.response?.data || 'An error occurred while removing the worker from the group.';
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
  };

  const handleFormSubmit = async (groupMember: GroupMemberCreate) => {
    setLoading(true);
    try {
      await createGroupMember(groupMember);
      await loadGroupMembers(selectedGroupId !== '' ? selectedGroupId as number : undefined);
      handleFormClose();
    } catch (error: any) {
      console.error('Error adding worker to group:', error);
      // Show more specific error if available
      const errorMessage = error.response?.data || 'An error occurred while adding the worker to the group.';
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
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGroupFilterChange = (event: any) => {
    setSelectedGroupId(event.target.value);
  };

  return (
    <>
      <Loader open={loading} message="Loading group members..." />
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
            Group Members
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="group-filter-label">Filter by Group</InputLabel>
              <Select
                labelId="group-filter-label"
                value={selectedGroupId}
                onChange={handleGroupFilterChange}
                label="Filter by Group"
              >
                <MenuItem value="">
                  <em>All Groups</em>
                </MenuItem>
                {jobGroups.map((group) => (
                  <MenuItem key={group.groupId} value={group.groupId}>
                    {group.groupName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
              Add Member
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
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Worker</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>{member.id}</TableCell>
                      <TableCell>{member.groupName}</TableCell>
                      <TableCell>{member.workerName}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="Remove from group">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteClick(member)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      {groupMembers.length === 0 ? 
                        'No group members found' : 
                        'No matching group members found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredMembers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </DialogContent>
      </Dialog>

      <GroupMemberFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        jobGroups={jobGroups}
        workers={workers}
        selectedGroupId={selectedGroupId !== '' ? selectedGroupId as number : undefined}
      />
    </>
  );
};

export default GroupMembersDialog; 