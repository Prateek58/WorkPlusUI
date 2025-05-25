import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useLRService } from '../services/lrService';
import type { LREntry, Unit, Party, Transporter, City, CreateLREntry, UpdateLREntry } from '../services/lrService';
import DocumentUpload from './DocumentUpload';
import CityFormDialog from './CityFormDialog';

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
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface LREntryFormProps {
  entry?: LREntry | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const LREntryForm: React.FC<LREntryFormProps> = ({ entry, onSuccess, onCancel }) => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateLREntry>>({
    lrNo: '',
    lrDate: new Date().toISOString().split('T')[0],
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
    driverName: '',
    driverMobile: '',
    remarks: '',
    status: 'DRAFT',
  });

  const [units, setUnits] = useState<Unit[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [cityDialogOpen, setCityDialogOpen] = useState(false);

  const { 
    getUnits, 
    getParties, 
    getTransporters, 
    getCities, 
    createLREntry, 
    updateLREntry 
  } = useLRService();

  useEffect(() => {
    loadMasterData();
    if (entry) {
      setFormData({
        unitId: entry.unitId,
        partyId: entry.partyId,
        transporterId: entry.transporterId,
        lrNo: entry.lrNo,
        lrDate: entry.lrDate,
        billDate: entry.billDate || '',
        billNo: entry.billNo || '',
        truckNo: entry.truckNo || '',
        lrWeight: entry.lrWeight,
        ratePerQtl: entry.ratePerQtl,
        lrQty: entry.lrQty,
        lrAmount: entry.lrAmount,
        freight: entry.freight || 0,
        otherExpenses: entry.otherExpenses || 0,
        totalFreight: entry.totalFreight || 0,
        totalQty: entry.totalQty || 0,
        billAmount: entry.billAmount || 0,
        originCityId: entry.originCityId,
        destinationCityId: entry.destinationCityId,
        driverName: entry.driverName || '',
        driverMobile: entry.driverMobile || '',
        remarks: entry.remarks || '',
        status: entry.status,
      });
    }
  }, [entry]);

  const loadMasterData = async () => {
    try {
      const [unitsData, partiesData, transportersData, citiesData] = await Promise.all([
        getUnits(),
        getParties(),
        getTransporters(),
        getCities(),
      ]);
      setUnits(unitsData);
      setParties(partiesData);
      setTransporters(transportersData);
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (entry) {
        const updateData: UpdateLREntry = {
          entryId: entry.entryId,
          ...formData as CreateLREntry
        };
        await updateLREntry(updateData);
      } else {
        await createLREntry(formData as CreateLREntry);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving LR entry:', error);
      setLoading(false);
    }
  };

  const handleCityCreated = (newCity: City) => {
    setCities(prev => [...prev, newCity]);
    setCityDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {entry ? 'Edit LR Entry' : 'New LR Entry'}
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Basic Information" />
            <Tab label="Financial Details" />
            <Tab label="Additional Information" />
            <Tab label="Documents" />
          </Tabs>
        </Box>

        {/* Tab 1: Basic Information */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LR Number *"
                value={formData.lrNo}
                onChange={(e) => handleInputChange('lrNo', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="LR Date *"
                value={formData.lrDate ? dayjs(formData.lrDate) : dayjs()}
                onChange={(date) => handleInputChange('lrDate', date?.format('YYYY-MM-DD'))}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={units}
                getOptionLabel={(option) => option.unitName}
                value={units.find(u => u.unitId === formData.unitId) || null}
                onChange={(_, value) => handleInputChange('unitId', value?.unitId)}
                renderInput={(params) => (
                  <TextField {...params} label="Unit *" required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={parties}
                getOptionLabel={(option) => option.partyName}
                value={parties.find(p => p.partyId === formData.partyId) || null}
                onChange={(_, value) => handleInputChange('partyId', value?.partyId)}
                renderInput={(params) => (
                  <TextField {...params} label="Party *" required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={transporters}
                getOptionLabel={(option) => option.transporterName}
                value={transporters.find(t => t.transporterId === formData.transporterId) || null}
                onChange={(_, value) => handleInputChange('transporterId', value?.transporterId)}
                renderInput={(params) => (
                  <TextField {...params} label="Transporter *" required />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bill Number"
                value={formData.billNo}
                onChange={(e) => handleInputChange('billNo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Bill Date"
                value={formData.billDate ? dayjs(formData.billDate) : null}
                onChange={(date) => handleInputChange('billDate', date?.format('YYYY-MM-DD'))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Truck Number"
                value={formData.truckNo}
                onChange={(e) => handleInputChange('truckNo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => `${option.cityName}, ${option.state}`}
                value={cities.find(c => c.cityId === formData.originCityId) || null}
                onChange={(_, value) => handleInputChange('originCityId', value?.cityId)}
                renderInput={(params) => (
                  <TextField {...params} label="Origin City" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => `${option.cityName}, ${option.state}`}
                value={cities.find(c => c.cityId === formData.destinationCityId) || null}
                onChange={(_, value) => handleInputChange('destinationCityId', value?.cityId)}
                renderInput={(params) => (
                  <TextField {...params} label="Destination City" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
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
          </Grid>
        </TabPanel>

        {/* Tab 2: Financial Details */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LR Amount *"
                type="number"
                value={formData.lrAmount}
                onChange={(e) => handleInputChange('lrAmount', parseFloat(e.target.value) || 0)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LR Weight (Qtl)"
                type="number"
                value={formData.lrWeight}
                onChange={(e) => handleInputChange('lrWeight', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rate per Qtl"
                type="number"
                value={formData.ratePerQtl}
                onChange={(e) => handleInputChange('ratePerQtl', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LR Quantity"
                type="number"
                value={formData.lrQty}
                onChange={(e) => handleInputChange('lrQty', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Freight"
                type="number"
                value={formData.freight}
                onChange={(e) => handleInputChange('freight', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Other Expenses"
                type="number"
                value={formData.otherExpenses}
                onChange={(e) => handleInputChange('otherExpenses', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Freight"
                type="number"
                value={formData.totalFreight}
                onChange={(e) => handleInputChange('totalFreight', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Quantity"
                type="number"
                value={formData.totalQty}
                onChange={(e) => handleInputChange('totalQty', parseFloat(e.target.value) || 0)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bill Amount"
                type="number"
                value={formData.billAmount}
                onChange={(e) => handleInputChange('billAmount', parseFloat(e.target.value) || 0)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Additional Information */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver Name"
                value={formData.driverName}
                onChange={(e) => handleInputChange('driverName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Driver Mobile"
                value={formData.driverMobile}
                onChange={(e) => handleInputChange('driverMobile', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remarks"
                multiline
                rows={4}
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: '120px',
                    alignItems: 'flex-start',
                    paddingTop: '16px'
                  },
                  '& .MuiInputBase-input': {
                    minHeight: '80px !important',
                    resize: 'vertical'
                  }
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Documents */}
        <TabPanel value={tabValue} index={3}>
          {entry && entry.entryId ? (
            <DocumentUpload lrEntryId={entry.entryId} />
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Please save the LR entry first to upload documents.
              </Typography>
            </Box>
          )}
        </TabPanel>

        <CardContent>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              {loading ? 'Saving...' : (entry ? 'Update' : 'Save')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* City Form Dialog */}
      <CityFormDialog
        open={cityDialogOpen}
        onClose={() => setCityDialogOpen(false)}
        onCityCreated={handleCityCreated}
      />
    </Box>
  );
};

export default LREntryForm; 