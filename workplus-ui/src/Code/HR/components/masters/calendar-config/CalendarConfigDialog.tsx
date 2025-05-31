import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Switch,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Loader from '../../../../Common/components/Loader';
import { useHRService } from '../../../services/hrService';
import type { CalendarConfig } from '../../../services/hrService';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface CalendarConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

const CalendarConfigDialog: React.FC<CalendarConfigDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const hrService = useHRService();
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadCalendarConfig();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setCalendarConfig([]);
      setHasChanges(false);
      setError('');
      setSuccess('');
    }
  }, [open]);

  const loadCalendarConfig = async () => {
    setLoading(true);
    try {
      const data = await hrService.getCalendarConfig();
      setCalendarConfig(data);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading calendar config:', error);
      setError('Failed to load calendar configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingDayChange = (dayOfWeek: string, isWorkingDay: boolean) => {
    setCalendarConfig(prev => 
      prev.map(config => 
        config.dayOfWeek === dayOfWeek 
          ? { ...config, isWorkingDay }
          : config
      )
    );
    setHasChanges(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await hrService.updateCalendarConfig(calendarConfig);
      setHasChanges(false);
      setSuccess('Calendar configuration updated successfully!');
      setError('');
    } catch (error: any) {
      console.error('Error saving calendar config:', error);
      setError(error.response?.data?.message || 'Failed to save calendar configuration');
    } finally {
      setLoading(false);
    }
  };

  const getWorkingDaysCount = () => {
    return calendarConfig.filter(config => config.isWorkingDay).length;
  };

  return (
    <>
      <Loader open={loading} message="Loading calendar configuration..." />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
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
            Calendar Configuration
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
          minHeight: '400px'
        }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Configure which days of the week are working days. Currently configured for{' '}
            <strong>{getWorkingDaysCount()}-day work week</strong>.
          </Typography>

          {!loading && calendarConfig.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={getTableHeaderStyle()}>
                  <TableRow>
                    <TableCell>Day of Week</TableCell>
                    <TableCell>Working Day</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calendarConfig.map((config) => (
                    <TableRow key={config.dayOfWeek}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {config.dayOfWeek}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={config.isWorkingDay}
                          onChange={(e) => handleWorkingDayChange(config.dayOfWeek, e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={config.isWorkingDay ? 'success.main' : 'text.secondary'}
                        >
                          {config.isWorkingDay ? 'Working Day' : 'Holiday'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {hasChanges && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: 'warning.lighter', 
              borderRadius: 1,
              border: `1px solid ${theme.palette.warning.main}`
            }}>
              <Typography variant="body2" color="warning.main">
                You have unsaved changes. Click "Save Changes" to apply the configuration.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!hasChanges || loading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarConfigDialog; 