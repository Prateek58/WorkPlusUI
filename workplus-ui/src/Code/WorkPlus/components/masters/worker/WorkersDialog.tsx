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
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import WorkerFormDialog from './WorkerFormDialog';
import Loader from '../../../../Common/components/Loader';
import { useWorkerService } from './workerService';

interface WorkersDialogProps {
  open: boolean;
  onClose: () => void;
}

const WorkersDialog: React.FC<WorkersDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { getWorkers, getWorker, deleteWorker } = useWorkerService();

  useEffect(() => {
    if (open) {
      loadWorkers();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setWorkers([]);
      setFilteredWorkers([]);
      setSelectedWorker(null);
      setIsFormOpen(false);
      setIsEdit(false);
      setSearchQuery('');
      setPage(0);
    }
  }, [open]);

  useEffect(() => {
    // Filter workers based on search query
    const filtered = workers.filter(worker => {
      const searchLower = searchQuery.toLowerCase();
      return (
        worker.fullName?.toLowerCase().includes(searchLower) ||
        worker.firstName?.toLowerCase().includes(searchLower) ||
        worker.lastName?.toLowerCase().includes(searchLower) ||
        worker.workerId.toString().includes(searchQuery)
      );
    });
    setFilteredWorkers(filtered);
    setPage(0); // Reset to first page when search changes
  }, [searchQuery, workers]);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const data = await getWorkers();
      setWorkers(data);
      setFilteredWorkers(data);
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search workers..."
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
          {!loading && filteredWorkers.length > 0 && (
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
                  {filteredWorkers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((worker) => (
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
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredWorkers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
          {!loading && filteredWorkers.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              color: theme.palette.text.secondary
            }}>
              <Typography>
                {searchQuery ? 'No workers found matching your search' : 'No workers found'}
              </Typography>
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