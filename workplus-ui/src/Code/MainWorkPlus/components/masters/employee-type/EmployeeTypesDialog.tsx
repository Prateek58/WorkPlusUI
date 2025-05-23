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
import { EmployeeType, useEmployeeTypeService } from './employeeTypeService';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface EmployeeTypesDialogProps {
  open: boolean;
  onClose: () => void;
}

const EmployeeTypesDialog: React.FC<EmployeeTypesDialogProps> = ({ open, onClose }) => {
  const { getEmployeeTypes } = useEmployeeTypeService();

  const [employeeTypes, setEmployeeTypes] = useState<EmployeeType[]>([]);
  const [filteredEmployeeTypes, setFilteredEmployeeTypes] = useState<EmployeeType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (open) {
      loadEmployeeTypes();
    }
  }, [open]);

  useEffect(() => {
    filterEmployeeTypes();
  }, [searchQuery, employeeTypes]);

  const loadEmployeeTypes = async () => {
    setLoading(true);
    try {
      const data = await getEmployeeTypes();
      setEmployeeTypes(data);
      setFilteredEmployeeTypes(data);
    } catch (error) {
      console.error('Error loading employee types:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployeeTypes = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployeeTypes(employeeTypes);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase().trim();
    const filtered = employeeTypes.filter(
      employeeType => employeeType.typeName.toLowerCase().includes(lowerCaseQuery)
    );

    setFilteredEmployeeTypes(filtered);
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
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredEmployeeTypes.length) : 0;
  const paginatedEmployeeTypes = filteredEmployeeTypes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Employee Types</Typography>
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
            placeholder="Search employee types..."
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
              ) : paginatedEmployeeTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No employee types found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmployeeTypes.map((employeeType) => (
                  <TableRow key={employeeType.typeId}>
                    <TableCell>{employeeType.typeId}</TableCell>
                    <TableCell>
                      <Chip 
                        label={employeeType.typeName} 
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
          count={filteredEmployeeTypes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeTypesDialog; 