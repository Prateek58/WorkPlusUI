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
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Worker, useWorkerService } from '../../../services/workerService';
import WorkerFormDialog from './WorkerFormDialog';
import Loader from '../../../../Common/components/Loader';

interface WorkersDialogProps {
  open: boolean;
  onClose: () => void;
}

const WorkersDialog: React.FC<WorkersDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getWorkers, getWorker, deleteWorker } = useWorkerService();

  useEffect(() => {
    if (open) {
      loadWorkers();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setWorkers([]);
      setSelectedWorker(null);
      setIsFormOpen(false);
      setIsEdit(false);
    }
  }, [open]);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const data = await getWorkers();
      setWorkers(data);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedWorker(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditClick = async (worker: Worker) => {
    setLoading(true);
    try {
      const workerData = await getWorker(worker.workerId);
      setSelectedWorker(workerData);
      setIsEdit(true);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error loading worker details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (worker: Worker) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      setLoading(true);
      try {
        await deleteWorker(worker.workerId);
        await loadWorkers();
      } catch (error) {
        console.error('Error deleting worker:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedWorker(null);
    setIsEdit(false);
  };

  const handleFormSubmit = async (worker: Worker) => {
    setLoading(true);
    try {
      await loadWorkers();
      handleFormClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Loader open={loading} message="Loading workers..." />
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
            Workers
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{ mr: 1 }}
            >
              Add Worker
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
          {!loading && workers.length > 0 && (
            <TableContainer 
              component={Paper}
              sx={{
                opacity: loading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out',
                flex: 1
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker.workerId}>
                      <TableCell>{worker.workerId}</TableCell>
                      <TableCell>{worker.fullName}</TableCell>
                      <TableCell>{worker.phone}</TableCell>
                      <TableCell>{worker.email}</TableCell>
                      <TableCell>{worker.typeId}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(worker)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(worker)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!loading && workers.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              color: theme.palette.text.secondary
            }}>
              <Typography>No workers found</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <WorkerFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        worker={selectedWorker || undefined}
        isEdit={isEdit}
        onSubmit={handleFormSubmit}
      />
    </>
  );
};

export default WorkersDialog; 