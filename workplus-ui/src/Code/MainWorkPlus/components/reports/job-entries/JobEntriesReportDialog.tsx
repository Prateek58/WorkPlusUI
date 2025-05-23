import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  useTheme,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import jobEntryReportService, { JobEntryReport } from './jobEntryReportService';
import { 
  centeredContentStyles
} from '../../../../../theme/styleUtils';
import Loader from '../../../../Common/components/Loader';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface JobEntriesReportDialogProps {
  open: boolean;
  onClose: () => void;
}

const JobEntriesReportDialog: React.FC<JobEntriesReportDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<JobEntryReport[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSavedRecords = async () => {
    setLoading(true);
    try {
      const response = await jobEntryReportService.getJobEntriesReport(page + 1, rowsPerPage);
      setSavedRecords(response.items);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error('Error fetching job entries:', err);
      setError('Failed to load saved records.');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fetch records when page or rowsPerPage changes or dialog opens
  useEffect(() => {
    if (open) {
      fetchSavedRecords();
    }
  }, [page, rowsPerPage, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
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
          Job Entries Report
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

      <DialogContent sx={{ 
        p: 3,
        position: 'relative',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {loading ? (
          <Box sx={centeredContentStyles}>
            <CircularProgress />
          </Box>
        ) : savedRecords.length > 0 ? (
          <>
            <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none', minHeight: '400px' }}>
              <Table>
                <TableHead sx={getTableHeaderStyle()}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Entry Type</TableCell>
                    <TableCell>Worker/Group</TableCell>
                    <TableCell>Job Type</TableCell>
                    <TableCell>Expected Hours</TableCell>
                    <TableCell>Hours Taken</TableCell>
                    <TableCell>Items Completed</TableCell>
                    <TableCell>Rate (Per Hour/Item)</TableCell>
                    <TableCell>Productive Hours</TableCell>
                    <TableCell>Extra Hours</TableCell>
                    <TableCell>Underperformance Hours</TableCell>
                    <TableCell>Incentive Amount</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savedRecords.map((record) => {
                    // Determine if job is hourly based or item based based on actual values
                    const isHourlyJob = record.hoursTaken !== null && record.hoursTaken !== undefined;
                    const isItemBasedJob = record.itemsCompleted !== null && record.itemsCompleted !== undefined;

                    return (
                      <TableRow key={record.entryId}>
                        <TableCell>{record.entryId}</TableCell>
                        <TableCell>{record.createdAt ? dayjs(record.createdAt).format('MM/DD/YYYY') : 'N/A'}</TableCell>
                        <TableCell>{record.entryType || 'N/A'}</TableCell>
                        <TableCell>{record.workerName || record.groupName || 'N/A'}</TableCell>
                        <TableCell>{record.jobName}</TableCell>
                        <TableCell>{record.expectedHours?.toFixed(2) || 'N/A'}</TableCell>
                        <TableCell>
                          {isHourlyJob ? record.hoursTaken?.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isItemBasedJob ? record.itemsCompleted : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isHourlyJob ? `₹${record.ratePerJob?.toFixed(2)}/hr` : 
                           isItemBasedJob ? `₹${record.ratePerJob?.toFixed(2)}/item` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isHourlyJob ? record.productiveHours?.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isHourlyJob ? record.extraHours?.toFixed(2) : 
                           isItemBasedJob ? record.extraHours?.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {isHourlyJob ? record.underperformanceHours?.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell>{record.incentiveAmount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{record.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{record.isPostLunch ? 'Afternoon/Evening' : 'Morning'}</TableCell>
                        <TableCell>{record.remarks || 'N/A'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No saved records found.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobEntriesReportDialog; 