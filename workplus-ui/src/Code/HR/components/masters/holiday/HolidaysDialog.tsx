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
import HolidayFormDialog from './HolidayFormDialog';
import Loader from '../../../../Common/components/Loader';
import { useHRService } from '../../../services/hrService';
import type { Holiday } from '../../../services/hrService';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';
import dayjs from 'dayjs';

interface HolidaysDialogProps {
  open: boolean;
  onClose: () => void;
}

const HolidaysDialog: React.FC<HolidaysDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const hrService = useHRService();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (open) {
      loadHolidays();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setHolidays([]);
      setFilteredHolidays([]);
      setSelectedHoliday(null);
      setIsFormOpen(false);
      setIsEdit(false);
      setSearchQuery('');
      setPage(0);
    }
  }, [open]);

  useEffect(() => {
    // Filter holidays based on search query
    const filtered = holidays.filter(holiday => {
      const searchLower = searchQuery.toLowerCase();
      return (
        holiday.name?.toLowerCase().includes(searchLower) ||
        dayjs(holiday.holidayDate).format('DD/MM/YYYY').includes(searchLower)
      );
    });
    setFilteredHolidays(filtered);
    setPage(0); // Reset to first page when search changes
  }, [searchQuery, holidays]);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const data = await hrService.getHolidays();
      setHolidays(data);
      setFilteredHolidays(data);
    } catch (error) {
      console.error('Error loading holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedHoliday(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (holiday: Holiday) => {
    if (window.confirm(`Are you sure you want to delete the holiday "${holiday.name}"?`)) {
      setLoading(true);
      try {
        await hrService.deleteHoliday(holiday.id);
        await loadHolidays();
      } catch (error) {
        console.error('Error deleting holiday:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedHoliday(null);
    setIsEdit(false);
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      await loadHolidays();
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
      <Loader open={loading} message="Loading holidays..." />
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
            Holidays Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search holidays..."
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
              Add Holiday
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
          {!loading && filteredHolidays.length > 0 && (
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
                    <TableCell>Holiday Date</TableCell>
                    <TableCell>Holiday Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHolidays
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {dayjs(holiday.holidayDate).format('DD/MM/YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(holiday.holidayDate).format('dddd')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {holiday.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={holiday.isOptional ? 'Optional' : 'Mandatory'}
                            color={holiday.isOptional ? 'warning' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={holiday.isActive ? 'Active' : 'Inactive'}
                            color={holiday.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(holiday)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(holiday)}
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
                count={filteredHolidays.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
          {!loading && filteredHolidays.length === 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              color: theme.palette.text.secondary
            }}>
              <Typography>
                {searchQuery ? 'No holidays found matching your search' : 'No holidays found'}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <HolidayFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        holiday={selectedHoliday || undefined}
        isEdit={isEdit}
        onSubmit={handleFormSubmit}
      />
    </>
  );
};

export default HolidaysDialog; 