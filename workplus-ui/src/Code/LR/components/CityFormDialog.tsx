import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  IconButton,
  Typography,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import Loader from '../../Common/components/Loader';
import Notification from '../../Common/components/Notification';
import { useLRService } from '../services/lrService';
import { City, CreateCity } from '../services/lrService';

interface CityFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCityCreated: (city: City) => void;
}

const CityFormDialog: React.FC<CityFormDialogProps> = ({ 
  open, 
  onClose, 
  onCityCreated 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState<CreateCity>({
    cityName: '',
    latitude: '',
    longitude: '',
    state: ''
  });

  const { createCity } = useLRService();

  const handleChange = (field: keyof CreateCity, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.cityName.trim() || !formData.state.trim()) {
      setNotification({
        open: true,
        message: 'City name and state are required',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const newCity = await createCity(formData);
      setNotification({
        open: true,
        message: 'City created successfully',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        cityName: '',
        latitude: '',
        longitude: '',
        state: ''
      });
      
      // Notify parent component
      onCityCreated(newCity);
    } catch (error) {
      console.error('Error creating city:', error);
      setNotification({
        open: true,
        message: 'Error creating city',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      cityName: '',
      latitude: '',
      longitude: '',
      state: ''
    });
    onClose();
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Loader open={loading} message="Creating city..." />
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
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
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationCityIcon color="primary" />
            Add New City
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Add a new city to the master data. This city will be available for selection in all LR entries.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="City Name *"
                  value={formData.cityName}
                  onChange={(e) => handleChange('cityName', e.target.value)}
                  required
                  fullWidth
                  autoFocus
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="State *"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  required
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Latitude"
                  value={formData.latitude}
                  onChange={(e) => handleChange('latitude', e.target.value)}
                  fullWidth
                  placeholder="e.g., 19.07 N"
                  helperText="Optional - Geographic coordinate"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Longitude"
                  value={formData.longitude}
                  onChange={(e) => handleChange('longitude', e.target.value)}
                  fullWidth
                  placeholder="e.g., 72.87 E"
                  helperText="Optional - Geographic coordinate"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              Add City
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default CityFormDialog; 