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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LREntryFormDialog from './LREntryFormDialog';
import Loader from '../../Common/components/Loader';
import { useLRService } from '../services/lrService';
import { LREntry } from '../services/lrService';
import { getTableHeaderStyle } from '../../../theme/tableStyles';

interface LREntriesDialogProps {
  open: boolean;
  onClose: () => void;
}

const LREntriesDialog: React.FC<LREntriesDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [entries, setEntries] = useState<LREntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LREntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<LREntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { getLREntries, getLREntry, deleteLREntry } = useLRService();

  useEffect(() => {
    if (open) {
      loadEntries();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setEntries([]);
      setFilteredEntries([]);
      setSelectedEntry(null);
      setIsFormOpen(false);
      setIsEdit(false);
      setSearchQuery('');
      setPage(0);
    }
  }, [open]);

  useEffect(() => {
    // Filter entries based on search query
    const filtered = entries.filter(entry => {
      const searchLower = searchQuery.toLowerCase();
      return (
        entry.lrNo?.toLowerCase().includes(searchLower) ||
        entry.billNo?.toLowerCase().includes(searchLower) ||
        entry.truckNo?.toLowerCase().includes(searchLower) ||
        entry.unitName?.toLowerCase().includes(searchLower) ||
        entry.partyName?.toLowerCase().includes(searchLower) ||
        entry.transporterName?.toLowerCase().includes(searchLower) ||
        entry.originCityName?.toLowerCase().includes(searchLower) ||
        entry.destinationCityName?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredEntries(filtered);
    setPage(0); // Reset to first page when search changes
  }, [searchQuery, entries]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const data = await getLREntries();
      setEntries(data);
      setFilteredEntries(data);
    } catch (error) {
      console.error('Error loading LR entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedEntry(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditClick = async (entry: LREntry) => {
    setLoading(true);
    try {
      const entryData = await getLREntry(entry.entryId);
      setSelectedEntry(entryData);
      setIsEdit(true);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error loading LR entry details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (entry: LREntry) => {
    if (window.confirm(`Are you sure you want to delete LR entry ${entry.lrNo}?`)) {
      setLoading(true);
      try {
        await deleteLREntry(entry.entryId);
        await loadEntries();
      } catch (error) {
        console.error('Error deleting LR entry:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedEntry(null);
    setIsEdit(false);
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      await loadEntries();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'CONFIRMED': return 'primary';
      case 'IN_TRANSIT': return 'warning';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <>
      <Loader open={loading} message="Loading LR entries..." />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            boxShadow: 24,
            borderRadius: 2,
            height: '90vh'
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon color="primary" />
            <Typography variant="h6" component="div">
              LR Entries
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search LR entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 300 }}
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
              New LR Entry
            </Button>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <TableContainer component={Paper} sx={{ flexGrow: 1 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={getTableHeaderStyle()}>LR No</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>LR Date</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>Unit</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>Party</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>Transporter</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>Origin</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>Destination</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>Truck No</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>Status</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>Amount</TableCell>
                  <TableCell sx={getTableHeaderStyle()}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEntries
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((entry) => (
                    <TableRow key={entry.entryId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {entry.lrNo}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(entry.lrDate)}</TableCell>
                      <TableCell>{entry.unitName}</TableCell>
                      <TableCell>{entry.partyName}</TableCell>
                      <TableCell>{entry.transporterName}</TableCell>
                      <TableCell>{entry.originCityName || '-'}</TableCell>
                      <TableCell>{entry.destinationCityName || '-'}</TableCell>
                      <TableCell>{entry.truckNo || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={entry.status} 
                          color={getStatusColor(entry.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(entry.lrAmount)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(entry)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(entry)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredEntries.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 'No LR entries found matching your search.' : 'No LR entries found. Click "New LR Entry" to create one.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredEntries.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
          />
        </DialogContent>
      </Dialog>

      {/* LR Entry Form Dialog */}
      <LREntryFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        entry={selectedEntry}
        isEdit={isEdit}
        onSubmit={handleFormSubmit}
      />
    </>
  );
};

export default LREntriesDialog; 