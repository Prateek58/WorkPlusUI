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
  Chip,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import JobFormDialog from './JobFormDialog';
import { Job, JobCreate, JobType, useJobService } from './jobService';
import Loader from '../../../../Common/components/Loader';
import { useConfirm } from '../../../../Common/hooks/useConfirm';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface JobsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number;
}

const JobsDialog: React.FC<JobsDialogProps> = ({ open, onClose, userId }) => {
  const theme = useTheme();
  const { showConfirmDialog } = useConfirm();
  const { getJobs, getJobTypes, createJob, updateJob, deleteJob } = useJobService();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form dialog
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (open) {
      loadJobs();
      loadJobTypes();
    }
  }, [open]);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, jobs]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getJobs();
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobTypes = async () => {
    try {
      const data = await getJobTypes();
      setJobTypes(data);
    } catch (error) {
      console.error('Error loading job types:', error);
    }
  };

  const filterJobs = () => {
    if (!searchQuery.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    const filtered = jobs.filter(
      job =>
        job.jobName.toLowerCase().includes(lowerCaseQuery) ||
        job.jobTypeName?.toLowerCase().includes(lowerCaseQuery) ||
        job.createdByName?.toLowerCase().includes(lowerCaseQuery)
    );

    setFilteredJobs(filtered);
    setPage(0); // Reset to first page when filtering
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddClick = () => {
    setSelectedJob(null);
    setIsEdit(false);
    setFormDialogOpen(true);
  };

  const handleEditClick = (job: Job) => {
    setSelectedJob(job);
    setIsEdit(true);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (job: Job) => {
    showConfirmDialog({
      title: 'Delete Job',
      message: `Are you sure you want to delete the job "${job.jobName}"?`,
      onConfirm: () => handleDeleteConfirm(job.jobId),
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  };

  const handleDeleteConfirm = async (jobId: number) => {
    try {
      await deleteJob(jobId);
      loadJobs();
    } catch (error: any) {
      const errorMessage = error.response?.data || 'An error occurred while deleting the job.';
      showConfirmDialog({
        title: 'Error',
        message: errorMessage,
        onConfirm: () => {},
        showCancel: false,
        confirmText: 'OK'
      });
    }
  };

  const handleFormClose = () => {
    setFormDialogOpen(false);
  };

  const handleFormSubmit = async (jobData: Job | JobCreate) => {
    try {
      if (isEdit && 'jobId' in jobData) {
        await updateJob(jobData);
      } else {
        await createJob(jobData as JobCreate);
      }
      setFormDialogOpen(false);
      loadJobs();
    } catch (error: any) {
      const errorMessage = error.response?.data || 'An error occurred while saving the job.';
      showConfirmDialog({
        title: 'Error',
        message: errorMessage,
        onConfirm: () => {},
        showCancel: false,
        confirmText: 'OK'
      });
    }
  };

  // Calculate pagination
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredJobs.length) : 0;
  const paginatedJobs = filteredJobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Manage Jobs</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add New Job
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none', minHeight: '400px' }}>
            <Table>
              <TableHead
                sx={getTableHeaderStyle()}
              >
                <TableRow>
                  <TableCell>Job Name</TableCell>
                  <TableCell>Job Type</TableCell>
                  <TableCell>Rate Per Item</TableCell>
                  <TableCell>Rate Per Hour</TableCell>
                  <TableCell>Expected Hours</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : paginatedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedJobs.map((job) => (
                    <TableRow key={job.jobId}>
                      <TableCell>{job.jobName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={job.jobTypeName || 'Unknown'} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        {job.ratePerItem ? `₹${job.ratePerItem.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {job.ratePerHour ? `₹${job.ratePerHour.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {job.expectedHours ? `${job.expectedHours.toFixed(1)} hrs` : '-'}
                      </TableCell>
                      <TableCell>{job.createdByName}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditClick(job)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDeleteClick(job)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredJobs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </DialogContent>
      </Dialog>

      <JobFormDialog
        open={formDialogOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        job={selectedJob}
        isEdit={isEdit}
        jobTypes={jobTypes}
        userId={userId}
      />
    </>
  );
};

export default JobsDialog; 