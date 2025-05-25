import React, { useState, useEffect } from 'react';
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
  Box,
  useTheme,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import Loader from '../../Common/components/Loader';
import Notification from '../../Common/components/Notification';
import CityFormDialog from './CityFormDialog';
import DocumentUpload from './DocumentUpload';
import { useLRService } from '../services/lrService';
import { 
  LREntry, 
  CreateLREntry, 
  UpdateLREntry, 
  Unit, 
  Party, 
  Transporter, 
  City 
} from '../services/lrService';

interface LREntryFormDialogProps {
  open: boolean;
  onClose: () => void;
  entry?: LREntry | null;
  isEdit?: boolean;
  onSubmit: () => Promise<void>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lr-tabpanel-${index}`}
      aria-labelledby={`lr-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LREntryFormDialog: React.FC<LREntryFormDialogProps> = ({ 
  open, 
  onClose, 
  entry,
  isEdit = false,
  onSubmit
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Master data
  const [units, setUnits] = useState<Unit[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Form data
  const [formData, setFormData] = useState<Partial<CreateLREntry>>(() => {
    if (isEdit && entry) {
      return {
        unitId: entry.unitId,
        partyId: entry.partyId,
        transporterId: entry.transporterId,
        lrNo: entry.lrNo,
        lrDate: entry.lrDate,
        billDate: entry.billDate,
        billNo: entry.billNo,
        truckNo: entry.truckNo,
        lrWeight: entry.lrWeight,
        ratePerQtl: entry.ratePerQtl,
        lrQty: entry.lrQty,
        lrAmount: entry.lrAmount,
        freight: entry.freight,
        otherExpenses: entry.otherExpenses,
        totalFreight: entry.totalFreight,
        totalQty: entry.totalQty,
        billAmount: entry.billAmount,
        originCityId: entry.originCityId,
        destinationCityId: entry.destinationCityId,
        driverName: entry.driverName,
        driverMobile: entry.driverMobile,
        remarks: entry.remarks,
        status: entry.status
      };
    }
    return {
      unitId: 0,
      partyId: 0,
      transporterId: 0,
      lrNo: '',
      lrDate: dayjs().format('YYYY-MM-DD'),
      billDate: '',
      billNo: '',
      truckNo: '',
      lrWeight: 0,
      ratePerQtl: 0,
      lrQty: 0,
      lrAmount: 0,
      freight: 0,
      otherExpenses: 0,
      totalFreight: 0,
      totalQty: 0,
      billAmount: 0,
      originCityId: undefined,
      destinationCityId: undefined,
      driverName: '',
      driverMobile: '',
      remarks: '',
      status: 'DRAFT'
    };
  });

  const { 
    getUnits, 
    getParties, 
    getTransporters, 
    searchCities, 
    createLREntry, 
    updateLREntry 
  } = useLRService();

  useEffect(() => {
    if (open) {
      loadMasterData();
      if (isEdit && entry) {
        setFormData({
          unitId: entry.unitId,
          partyId: entry.partyId,
          transporterId: entry.transporterId,
          lrNo: entry.lrNo,
          lrDate: entry.lrDate,
          billDate: entry.billDate,
          billNo: entry.billNo,
          truckNo: entry.truckNo,
          lrWeight: entry.lrWeight,
          ratePerQtl: entry.ratePerQtl,
          lrQty: entry.lrQty,
          lrAmount: entry.lrAmount,
          freight: entry.freight,
          otherExpenses: entry.otherExpenses,
          totalFreight: entry.totalFreight,
          totalQty: entry.totalQty,
          billAmount: entry.billAmount,
          originCityId: entry.originCityId,
          destinationCityId: entry.destinationCityId,
          driverName: entry.driverName,
          driverMobile: entry.driverMobile,
          remarks: entry.remarks,
          status: entry.status
        });
      } else {
        setFormData({
          unitId: 0,
          partyId: 0,
          transporterId: 0,
          lrNo: '',
          lrDate: dayjs().format('YYYY-MM-DD'),
          billDate: '',
          billNo: '',
          truckNo: '',
          lrWeight: 0,
          ratePerQtl: 0,
          lrQty: 0,
          lrAmount: 0,
          freight: 0,
          otherExpenses: 0,
          totalFreight: 0,
          totalQty: 0,
          billAmount: 0,
          originCityId: undefined,
          destinationCityId: undefined,
          driverName: '',
          driverMobile: '',
          remarks: '',
          status: 'DRAFT'
        });
      }
    } else {
      setTabValue(0);
      setCities([]);
    }
  }, [open, isEdit, entry]);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [unitsData, partiesData, transportersData] = await Promise.all([
        getUnits(),
        getParties(),
        getTransporters()
      ]);
      setUnits(unitsData);
      setParties(partiesData);
      setTransporters(transportersData);
    } catch (error) {
      console.error('Error loading master data:', error);
      setNotification({
        open: true,
        message: 'Error loading master data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCitySearch = async (searchTerm: string) => {
    if (searchTerm.length >= 2) {
      try {
        const citiesData = await searchCities(searchTerm);
        setCities(citiesData);
      } catch (error) {
        console.error('Error searching cities:', error);
      }
    }
  };

  const handleAddCityClick = () => {
    setIsCityDialogOpen(true);
  };

  const handleCityDialogClose = () => {
    setIsCityDialogOpen(false);
  };

  const handleCityCreated = (newCity: City) => {
    setCities(prev => [newCity, ...prev]);
    setIsCityDialogOpen(false);
    setNotification({
      open: true,
      message: 'City created successfully',
      severity: 'success'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.unitId || !formData.partyId || !formData.transporterId || !formData.lrNo || !formData.lrDate) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit && entry) {
        const updateData: UpdateLREntry = {
          ...formData as CreateLREntry,
          entryId: entry.entryId
        };
        await updateLREntry(updateData);
        setNotification({
          open: true,
          message: 'LR entry updated successfully',
          severity: 'success'
        });
      } else {
        await createLREntry(formData as CreateLREntry);
        setNotification({
          open: true,
          message: 'LR entry created successfully',
          severity: 'success'
        });
      }
      
      setTimeout(() => {
        onSubmit();
      }, 1000);
    } catch (error) {
      console.error('Error saving LR entry:', error);
      setNotification({
        open: true,
        message: 'Error saving LR entry',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Loader open={loading} message={isEdit ? "Updating LR entry..." : "Creating LR entry..."} />
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
      
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
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
          <Typography variant="h6" component="div">
            {isEdit ? 'Edit LR Entry' : 'New LR Entry'}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Basic Details" />
              <Tab label="Financial Details" />
              <Tab label="Additional Info" />
              {isEdit && <Tab label="Documents" />}
            </Tabs>

            {/* Basic Details Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Required Fields */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Required Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={units}
                    getOptionLabel={(option) => option.unitName}
                    value={units.find(u => u.unitId === formData.unitId) || null}
                    onChange={(_, value) => handleChange('unitId', value?.unitId || 0)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Unit *"
                        required
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={parties}
                    getOptionLabel={(option) => option.partyName}
                    value={parties.find(p => p.partyId === formData.partyId) || null}
                    onChange={(_, value) => handleChange('partyId', value?.partyId || 0)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Party *"
                        required
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={transporters}
                    getOptionLabel={(option) => option.transporterName}
                    value={transporters.find(t => t.transporterId === formData.transporterId) || null}
                    onChange={(_, value) => handleChange('transporterId', value?.transporterId || 0)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Transporter *"
                        required
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="LR Number *"
                    value={formData.lrNo}
                    onChange={(e) => handleChange('lrNo', e.target.value)}
                    required
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="LR Date *"
                    value={formData.lrDate ? dayjs(formData.lrDate) : null}
                    onChange={(date) => handleChange('lrDate', date?.format('YYYY-MM-DD') || '')}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="DRAFT">Draft</MenuItem>
                      <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                      <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
                      <MenuItem value="DELIVERED">Delivered</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Optional Fields */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Optional Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Bill Date"
                    value={formData.billDate ? dayjs(formData.billDate) : null}
                    onChange={(date) => handleChange('billDate', date?.format('YYYY-MM-DD') || '')}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Bill Number"
                    value={formData.billNo}
                    onChange={(e) => handleChange('billNo', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Truck Number"
                    value={formData.truckNo}
                    onChange={(e) => handleChange('truckNo', e.target.value)}
                    fullWidth
                  />
                </Grid>

                {/* Cities */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Autocomplete
                      options={cities}
                      getOptionLabel={(option) => `${option.cityName}, ${option.state}`}
                      value={cities.find(c => c.cityId === formData.originCityId) || null}
                      onChange={(_, value) => handleChange('originCityId', value?.cityId)}
                      onInputChange={(_, value) => handleCitySearch(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Origin City"
                          fullWidth
                        />
                      )}
                      sx={{ flexGrow: 1 }}
                    />
                    <IconButton
                      onClick={handleAddCityClick}
                      color="primary"
                      title="Add New City"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Autocomplete
                      options={cities}
                      getOptionLabel={(option) => `${option.cityName}, ${option.state}`}
                      value={cities.find(c => c.cityId === formData.destinationCityId) || null}
                      onChange={(_, value) => handleChange('destinationCityId', value?.cityId)}
                      onInputChange={(_, value) => handleCitySearch(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Destination City"
                          fullWidth
                        />
                      )}
                      sx={{ flexGrow: 1 }}
                    />
                    <IconButton
                      onClick={handleAddCityClick}
                      color="primary"
                      title="Add New City"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Driver Name"
                    value={formData.driverName}
                    onChange={(e) => handleChange('driverName', e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Driver Mobile"
                    value={formData.driverMobile}
                    onChange={(e) => handleChange('driverMobile', e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Financial Details Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Weight & Quantity
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="LR Weight (Qtl)"
                    type="number"
                    value={formData.lrWeight}
                    onChange={(e) => handleChange('lrWeight', parseFloat(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ step: 0.001 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Rate per Qtl"
                    type="number"
                    value={formData.ratePerQtl}
                    onChange={(e) => handleChange('ratePerQtl', parseFloat(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="LR Quantity"
                    type="number"
                    value={formData.lrQty}
                    onChange={(e) => handleChange('lrQty', parseFloat(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ step: 0.001 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Financial Details
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="LR Amount"
                    type="number"
                    value={formData.lrAmount}
                    onChange={(e) => handleChange('lrAmount', parseFloat(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Freight"
                    type="number"
                    value={formData.freight}
                    onChange={(e) => handleChange('freight', parseFloat(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Other Expenses"
                    type="number"
                    value={formData.otherExpenses}
                    onChange={(e) => handleChange('otherExpenses', parseFloat(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Total Freight"
                    type="number"
                    value={formData.totalFreight}
                    onChange={(e) => handleChange('totalFreight', parseFloat(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Total Quantity"
                    type="number"
                    value={formData.totalQty}
                    onChange={(e) => handleChange('totalQty', parseFloat(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ step: 0.001 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    label="Bill Amount"
                    type="number"
                    value={formData.billAmount}
                    onChange={(e) => handleChange('billAmount', parseFloat(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ step: 0.01 }}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Additional Info Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Remarks"
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Documents Tab */}
            {isEdit && (
              <TabPanel value={tabValue} index={3}>
                <DocumentUpload lrEntryId={entry?.entryId || 0} />
              </TabPanel>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {isEdit ? 'Update' : 'Create'} LR Entry
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* City Form Dialog */}
      <CityFormDialog
        open={isCityDialogOpen}
        onClose={handleCityDialogClose}
        onCityCreated={handleCityCreated}
      />
    </>
  );
};

export default LREntryFormDialog; 