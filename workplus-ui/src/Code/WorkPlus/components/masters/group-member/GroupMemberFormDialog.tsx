import React, { useState, useEffect } from 'react';
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
  FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { GroupMemberCreate, JobGroup, Worker } from './groupMemberService';

interface GroupMemberFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupMember: GroupMemberCreate) => void;
  jobGroups: JobGroup[];
  workers: Worker[];
  selectedGroupId?: number;
}

const GroupMemberFormDialog: React.FC<GroupMemberFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  jobGroups,
  workers,
  selectedGroupId
}) => {
  const theme = useTheme();
  const [groupId, setGroupId] = useState<number | ''>('');
  const [workerId, setWorkerId] = useState<number | ''>('');
  const [errors, setErrors] = useState<{ groupId?: string; workerId?: string }>({});
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
      
      setWorkerId('');
      
      // Filter active workers
      const activeWorkers = workers.filter(worker => worker.isActive !== false);
      setAvailableWorkers(activeWorkers);
    }
  }, [open, workers, selectedGroupId]);

  const validateForm = (): boolean => {
    const newErrors: { groupId?: string; workerId?: string } = {};
    
    if (!groupId) {
      newErrors.groupId = 'Job group is required';
    }
    
    if (!workerId) {
      newErrors.workerId = 'Worker is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        groupId: groupId as number,
        workerId: workerId as number
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          Add Worker to Group
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
      <DialogContent sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

          <FormControl fullWidth error={!!errors.workerId}>
            <InputLabel id="worker-label">Worker</InputLabel>
            <Select
              labelId="worker-label"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value as number)}
              label="Worker"
            >
              {availableWorkers.map((worker) => (
                <MenuItem key={worker.workerId} value={worker.workerId}>
                  {worker.fullName}
                </MenuItem>
              ))}
            </Select>
            {errors.workerId && <FormHelperText>{errors.workerId}</FormHelperText>}
          </FormControl>
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