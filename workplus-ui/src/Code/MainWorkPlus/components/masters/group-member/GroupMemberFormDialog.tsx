import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  useTheme,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormHelperText,
  Autocomplete,
  TextField,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { GroupMemberCreate, GroupMemberBulkCreate, JobGroup, Worker, useGroupMemberService } from './groupMemberService';

interface GroupMemberFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupMember: GroupMemberCreate) => void;
  onSubmitBulk: (bulkGroupMember: GroupMemberBulkCreate) => void;
  jobGroups: JobGroup[];
  workers: Worker[];
  selectedGroupId?: number;
}

const GroupMemberFormDialog: React.FC<GroupMemberFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  onSubmitBulk,
  jobGroups,
  workers,
  selectedGroupId
}) => {
  const theme = useTheme();
  const { getGroupMembersByGroup } = useGroupMemberService();
  const [groupId, setGroupId] = useState<number | ''>('');
  const [workerIds, setWorkerIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ groupId?: string; workerIds?: string }>({});
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setErrors({});
      
      // Pre-select the group if provided
      if (selectedGroupId) {
        setGroupId(selectedGroupId);
      } else {
        setGroupId('');
      }
      
      setWorkerIds([]);
      
      // Filter active workers
      const activeWorkers = workers.filter(worker => worker.isActive !== false);
      setAvailableWorkers(activeWorkers);
    }
  }, [open, workers, selectedGroupId]);

  // Filter out existing group members when group is selected
  const filterWorkersForGroup = useCallback(async () => {
    if (groupId && typeof groupId === 'number') {
      try {
        // Get existing group members
        const existingMembers = await getGroupMembersByGroup(groupId);
        const existingWorkerIds = existingMembers.map(member => member.workerId);
        
        // Filter out existing members from available workers
        const activeWorkers = workers.filter(worker => worker.isActive !== false);
        const filteredWorkers = activeWorkers.filter(worker => !existingWorkerIds.includes(worker.workerId));
        
        setAvailableWorkers(filteredWorkers);
      } catch (error) {
        console.error('Error fetching group members:', error);
        // Fallback to all active workers if error occurs
        const activeWorkers = workers.filter(worker => worker.isActive !== false);
        setAvailableWorkers(activeWorkers);
      }
    } else {
      // No group selected, show all active workers
      const activeWorkers = workers.filter(worker => worker.isActive !== false);
      setAvailableWorkers(activeWorkers);
    }
  }, [groupId, workers]);

  useEffect(() => {
    filterWorkersForGroup();
  }, [filterWorkersForGroup]);

  const validateForm = (): boolean => {
    const newErrors: { groupId?: string; workerIds?: string } = {};
    
    if (!groupId) {
      newErrors.groupId = 'Job group is required';
    }
    
    if (workerIds.length === 0) {
      newErrors.workerIds = 'At least one worker is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (workerIds.length === 1) {
        // Use single creation for one worker
        onSubmit({
          groupId: groupId as number,
          workerId: workerIds[0]
        });
      } else {
        // Use bulk creation for multiple workers
        onSubmitBulk({
          groupId: groupId as number,
          workerIds: workerIds
        });
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          bgcolor: theme.palette.background.default,
          boxShadow: 24,
          borderRadius: 2,
          maxHeight: '90vh',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column'
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
          Add Workers to Group
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
      <DialogContent sx={{ p: 2, mt: 2, overflow: 'visible', flex: '1 1 auto', minHeight: 0 }}>
        <Box mt={3} sx={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: 0 }}>
          <FormControl fullWidth error={!!errors.groupId} disabled={!!selectedGroupId}>
            <InputLabel id="group-label">Job Group</InputLabel>
            <Select
              labelId="group-label"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value as number)}
              label="Job Group"
            >
              {jobGroups.map((group) => (
                <MenuItem key={group.groupId} value={group.groupId}>
                  {group.groupName} (Min: {group.minWorkers}, Max: {group.maxWorkers})
                </MenuItem>
              ))}
            </Select>
            {errors.groupId && <FormHelperText>{errors.groupId}</FormHelperText>}
          </FormControl>

          <Autocomplete
            multiple
            id="workers-autocomplete"
            options={availableWorkers}
            getOptionLabel={(option) => option.fullName}
            value={availableWorkers.filter(worker => workerIds.includes(worker.workerId))}
            onChange={(event, newValue) => {
              setWorkerIds(newValue.map(worker => worker.workerId));
            }}
            filterSelectedOptions
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option.fullName}
                  {...getTagProps({ index })}
                  key={option.workerId}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Workers"
                placeholder="Search and select workers..."
                error={!!errors.workerIds}
                helperText={errors.workerIds}
              />
            )}
            sx={{
              '& .MuiAutocomplete-tag': {
                maxWidth: '200px',
                margin: '2px',
                height: 'auto'
              },
              '& .MuiOutlinedInput-root': {
                minHeight: 'auto',
                height: 'auto',
                padding: '8px 14px',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                overflow: 'visible',
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '2px'
                  }
                }
              },
              '& .MuiAutocomplete-inputRoot': {
                paddingRight: '39px !important',
                height: 'auto !important',
                minHeight: 'auto !important'
              },
              '& .MuiAutocomplete-input': {
                minWidth: '30px',
                flexGrow: 1,
                height: 'auto'
              },
              '& .MuiAutocomplete-endAdornment': {
                position: 'absolute',
                right: '9px',
                top: '12px'
              },
              '& .MuiInputBase-root': {
                height: 'auto !important',
                minHeight: 'auto !important'
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupMemberFormDialog;