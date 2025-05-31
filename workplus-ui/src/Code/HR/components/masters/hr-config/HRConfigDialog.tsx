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
  TextField,
  Switch,
  Alert,
  FormControlLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Loader from '../../../../Common/components/Loader';
import { useHRService } from '../../../services/hrService';
import type { HRConfig } from '../../../services/hrService';
import { getTableHeaderStyle } from '../../../../../theme/tableStyles';

interface HRConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

const HRConfigDialog: React.FC<HRConfigDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const hrService = useHRService();
  const [hrConfigs, setHRConfigs] = useState<HRConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [changedConfigs, setChangedConfigs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadHRConfigs();
    } else {
      // Reset states when dialog closes
      setLoading(false);
      setHRConfigs([]);
      setHasChanges(false);
      setError('');
      setSuccess('');
      setChangedConfigs({});
    }
  }, [open]);

  const loadHRConfigs = async () => {
    setLoading(true);
    try {
      const data = await hrService.getHRConfigs();
      setHRConfigs(data);
      setHasChanges(false);
      setChangedConfigs({});
    } catch (error) {
      console.error('Error loading HR configs:', error);
      setError('Failed to load HR configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (configKey: string, configValue: string) => {
    setChangedConfigs(prev => ({
      ...prev,
      [configKey]: configValue
    }));
    setHasChanges(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save each changed config
      for (const [configKey, configValue] of Object.entries(changedConfigs)) {
        await hrService.updateHRConfig(configKey, configValue);
      }
      
      setHasChanges(false);
      setChangedConfigs({});
      setSuccess('HR configuration updated successfully!');
      setError('');
      
      // Reload to get fresh data
      await loadHRConfigs();
    } catch (error: any) {
      console.error('Error saving HR configs:', error);
      setError(error.response?.data?.message || 'Failed to save HR configuration');
    } finally {
      setLoading(false);
    }
  };

  const getConfigValue = (config: HRConfig) => {
    return changedConfigs[config.configKey] !== undefined 
      ? changedConfigs[config.configKey] 
      : config.configValue;
  };

  const renderConfigInput = (config: HRConfig) => {
    const currentValue = getConfigValue(config);
    
    // Boolean configs (true/false)
    if (currentValue === 'true' || currentValue === 'false') {
      return (
        <FormControlLabel
          control={
            <Switch
              checked={currentValue === 'true'}
              onChange={(e) => handleConfigChange(config.configKey, e.target.checked ? 'true' : 'false')}
              color="primary"
            />
          }
          label={currentValue === 'true' ? 'Enabled' : 'Disabled'}
        />
      );
    }
    
    // Numeric configs
    if (!isNaN(Number(currentValue))) {
      return (
        <TextField
          size="small"
          type="number"
          value={currentValue}
          onChange={(e) => handleConfigChange(config.configKey, e.target.value)}
          sx={{ width: 120 }}
          inputProps={{ min: 0 }}
        />
      );
    }
    
    // Time configs (HH:MM format)
    if (currentValue.includes(':') && currentValue.length === 5) {
      return (
        <TextField
          size="small"
          type="time"
          value={currentValue}
          onChange={(e) => handleConfigChange(config.configKey, e.target.value)}
          sx={{ width: 140 }}
        />
      );
    }
    
    // Default text input
    return (
      <TextField
        size="small"
        value={currentValue}
        onChange={(e) => handleConfigChange(config.configKey, e.target.value)}
        sx={{ width: 200 }}
      />
    );
  };

  return (
    <>
      <Loader open={loading} message="Loading HR configuration..." />
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
            HR System Configuration
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
            Configure HR system settings and parameters. Changes will take effect immediately after saving.
          </Typography>

          {!loading && hrConfigs.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={getTableHeaderStyle()}>
                  <TableRow>
                    <TableCell>Configuration</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hrConfigs.map((config) => (
                    <TableRow key={config.configKey}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {config.configKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {config.description || 'No description available'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {renderConfigInput(config)}
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

export default HRConfigDialog; 