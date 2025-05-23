import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
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
  Chip,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { JobType, useJobTypeService } from './jobTypeService';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface JobTypesDialogProps {
  open: boolean;
  onClose: () => void;
}

const JobTypesDialog: React.FC<JobTypesDialogProps> = ({ open, onClose }) => {
  const { getJobTypes } = useJobTypeService();

  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [filteredJobTypes, setFilteredJobTypes] = useState<JobType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (open) {
      loadJobTypes();
    }
  }, [open]);

  useEffect(() => {
    filterJobTypes();
  }, [searchQuery, jobTypes]);

  const loadJobTypes = async () => {
    setLoading(true);
    try {
      const data = await getJobTypes();
      console.log("Job Types data:", data); // For debugging
      setJobTypes(data);
      setFilteredJobTypes(data);
    } catch (error) {
      console.error('Error loading job types:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobTypes = () => {
    if (!searchQuery.trim()) {
      setFilteredJobTypes(jobTypes);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    const filtered = jobTypes.filter(
      jobType => jobType.typeName.toLowerCase().includes(lowerCaseQuery)
    );

    setFilteredJobTypes(filtered);
    setPage(0); // Reset to first page when filtering
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate pagination
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredJobTypes.length) : 0;
  const paginatedJobTypes = filteredJobTypes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Job Types</Typography>
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
            placeholder="Search job types..."
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
          <Typography variant="subtitle2" color="textSecondary">
            * Read-only view
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none', minHeight: '400px' }}>
          <Table>
            <TableHead
              sx={getTableHeaderStyle()}
            >
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginatedJobTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No job types found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedJobTypes.map((jobType) => (
                  <TableRow key={jobType.jobTypeId}>
                    <TableCell>{jobType.jobTypeId}</TableCell>
                    <TableCell>
                      <Chip 
                        label={jobType.typeName} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredJobTypes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </DialogContent>
    </Dialog>
  );
};

export default JobTypesDialog; 