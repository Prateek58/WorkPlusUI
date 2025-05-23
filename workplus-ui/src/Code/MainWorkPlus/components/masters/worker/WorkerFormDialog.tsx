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
  MenuItem,
  FormControlLabel,
  Switch,
  Tabs,
  Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Loader from '../../../../Common/components/Loader';
import Notification from '../../../../Common/components/Notification';
import { Worker } from './workerService';
interface WorkerFormDialogProps {
  open: boolean;
  onClose: () => void;
  worker?: Worker;
  isEdit?: boolean;
  onSubmit: (worker: Worker) => Promise<void>;
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
      id={`worker-tabpanel-${index}`}
      aria-labelledby={`worker-tab-${index}`}
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

const WorkerFormDialog: React.FC<WorkerFormDialogProps> = ({ 
  open, 
  onClose, 
  worker,
  isEdit = false,
  onSubmit
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [formData, setFormData] = useState<Partial<Worker>>(() => {
    // Only initialize with worker data if it's an edit operation
    if (isEdit && worker) {
      return {
        fullName: worker.fullName || '',
        firstName: worker.firstName || '',
        lastName: worker.lastName || '',
        fatherName: worker.fatherName || '',
        motherName: worker.motherName || '',
        gender: worker.gender || '',
        birthPlace: worker.birthPlace || '',
        birthCity: worker.birthCity || '',
        bloodGroup: worker.bloodGroup || '',
        ageAtJoining: worker.ageAtJoining || 0,
        phone: worker.phone || '',
        email: worker.email || '',
        presentAddress1: worker.presentAddress1 || '',
        presentAddress2: worker.presentAddress2 || '',
        presentAddress3: worker.presentAddress3 || '',
        presentCity: worker.presentCity || '',
        presentState: worker.presentState || '',
        permanentAddress1: worker.permanentAddress1 || '',
        permanentAddress2: worker.permanentAddress2 || '',
        permanentAddress3: worker.permanentAddress3 || '',
        permanentCity: worker.permanentCity || '',
        permanentState: worker.permanentState || '',
        dateOfJoining: worker.dateOfJoining || '',
        dateOfLeaving: worker.dateOfLeaving || '',
        referenceName: worker.referenceName || '',
        remarks: worker.remarks || '',
        esiApplicable: worker.esiApplicable || false,
        esiLocation: worker.esiLocation || '',
        pfNo: worker.pfNo || '',
        nomineeName: worker.nomineeName || '',
        nomineeRelation: worker.nomineeRelation || '',
        nomineeAge: worker.nomineeAge || 0,
        pan: worker.pan || '',
        bankAccountNo: worker.bankAccountNo || '',
        bankName: worker.bankName || '',
        bankLocation: worker.bankLocation || '',
        bankRtgsCode: worker.bankRtgsCode || '',
        typeId: worker.typeId || 0,
        userId: worker.userId || 0,
        isActive: worker.isActive || true
      };
    }
    // For new worker, initialize with empty values
    return {
      fullName: '',
      firstName: '',
      lastName: '',
      fatherName: '',
      motherName: '',
      gender: '',
      birthPlace: '',
      birthCity: '',
      bloodGroup: '',
      ageAtJoining: 0,
      phone: '',
      email: '',
      presentAddress1: '',
      presentAddress2: '',
      presentAddress3: '',
      presentCity: '',
      presentState: '',
      permanentAddress1: '',
      permanentAddress2: '',
      permanentAddress3: '',
      permanentCity: '',
      permanentState: '',
      dateOfJoining: '',
      dateOfLeaving: '',
      referenceName: '',
      remarks: '',
      esiApplicable: false,
      esiLocation: '',
      pfNo: '',
      nomineeName: '',
      nomineeRelation: '',
      nomineeAge: 0,
      pan: '',
      bankAccountNo: '',
      bankName: '',
      bankLocation: '',
      bankRtgsCode: '',
      typeId: 1,
      userId: 0,
      isActive: true
    };
  });

  // Reset form data when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (isEdit && worker) {
        setFormData({
          fullName: worker.fullName || '',
          firstName: worker.firstName || '',
          lastName: worker.lastName || '',
          fatherName: worker.fatherName || '',
          motherName: worker.motherName || '',
          gender: worker.gender || '',
          birthPlace: worker.birthPlace || '',
          birthCity: worker.birthCity || '',
          bloodGroup: worker.bloodGroup || '',
          ageAtJoining: worker.ageAtJoining || 0,
          phone: worker.phone || '',
          email: worker.email || '',
          presentAddress1: worker.presentAddress1 || '',
          presentAddress2: worker.presentAddress2 || '',
          presentAddress3: worker.presentAddress3 || '',
          presentCity: worker.presentCity || '',
          presentState: worker.presentState || '',
          permanentAddress1: worker.permanentAddress1 || '',
          permanentAddress2: worker.permanentAddress2 || '',
          permanentAddress3: worker.permanentAddress3 || '',
          permanentCity: worker.permanentCity || '',
          permanentState: worker.permanentState || '',
          dateOfJoining: worker.dateOfJoining || '',
          dateOfLeaving: worker.dateOfLeaving || '',
          referenceName: worker.referenceName || '',
          remarks: worker.remarks || '',
          esiApplicable: worker.esiApplicable || false,
          esiLocation: worker.esiLocation || '',
          pfNo: worker.pfNo || '',
          nomineeName: worker.nomineeName || '',
          nomineeRelation: worker.nomineeRelation || '',
          nomineeAge: worker.nomineeAge || 0,
          pan: worker.pan || '',
          bankAccountNo: worker.bankAccountNo || '',
          bankName: worker.bankName || '',
          bankLocation: worker.bankLocation || '',
          bankRtgsCode: worker.bankRtgsCode || '',
          typeId: worker.typeId || 0,
          userId: worker.userId || 0,
          isActive: worker.isActive || true
        });
      } else {
        // Reset form data for new worker
        setFormData({
          fullName: '',
          firstName: '',
          lastName: '',
          fatherName: '',
          motherName: '',
          gender: '',
          birthPlace: '',
          birthCity: '',
          bloodGroup: '',
          ageAtJoining: 0,
          phone: '',
          email: '',
          presentAddress1: '',
          presentAddress2: '',
          presentAddress3: '',
          presentCity: '',
          presentState: '',
          permanentAddress1: '',
          permanentAddress2: '',
          permanentAddress3: '',
          permanentCity: '',
          permanentState: '',
          dateOfJoining: '',
          dateOfLeaving: '',
          referenceName: '',
          remarks: '',
          esiApplicable: false,
          esiLocation: '',
          pfNo: '',
          nomineeName: '',
          nomineeRelation: '',
          nomineeAge: 0,
          pan: '',
          bankAccountNo: '',
          bankName: '',
          bankLocation: '',
          bankRtgsCode: '',
          typeId: 1,
          userId: 0,
          isActive: true
        });
      }
    }
  }, [open, isEdit, worker]);

  // Remove the loading effect when dialog opens
  useEffect(() => {
    if (open) {
      setLoading(false);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    setLoading(true);
    setStartTime(Date.now());
    try {
      const submitData = {
        ...formData,
        workerId: worker?.workerId || 0,
        isActive: true,
        userId: formData.userId || null,
        typeId: formData.typeId || 1,
        dateOfJoining: formData.dateOfJoining ? new Date(formData.dateOfJoining).toISOString().split('T')[0] : null,
        dateOfLeaving: formData.dateOfLeaving ? new Date(formData.dateOfLeaving).toISOString().split('T')[0] : null
      };
      console.log('Submitting worker data:', submitData);
      await onSubmit(submitData as Worker);
      console.log('Submission successful');
      setNotification({
        open: true,
        message: isEdit ? 'Worker updated successfully!' : 'Worker added successfully!',
        severity: 'success'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setNotification({
        open: true,
        message: isEdit ? 'Failed to update worker!' : 'Failed to add worker!',
        severity: 'error'
      });
    } finally {
      // Ensure loader shows for at least 4 seconds
      const elapsedTime = Date.now() - (startTime || Date.now());
      const remainingTime = Math.max(0, 4000 - elapsedTime);
      console.log('Elapsed time:', elapsedTime, 'Remaining time:', remainingTime);
      
      if (remainingTime > 0) {
        console.log('Setting final timeout for:', remainingTime);
        setTimeout(() => {
          console.log('Final timeout completed');
          setLoading(false);
        }, remainingTime);
      } else {
        console.log('No remaining time needed');
        setLoading(false);
      }
    }
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Loader 
        open={loading} 
        message={isEdit ? "Loading worker data..." : "Preparing form..."} 
      />
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleNotificationClose}
      />
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.default,
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
            {isEdit ? 'Edit Worker' : 'Add New Worker'}
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

        <form onSubmit={handleSubmit}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="worker form tabs">
              <Tab label="Basic Info" />
              <Tab label="Address" />
              <Tab label="Employment" />
              <Tab label="Bank Details" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="typeId"
                  select
                  label="Type"
                  value={formData.typeId}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value={1}>Full Time</MenuItem>
                  <MenuItem value={2}>Part Time</MenuItem>
                  <MenuItem value={3}>Contract</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="fatherName"
                  label="Father's Name"
                  value={formData.fatherName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="motherName"
                  label="Mother's Name"
                  value={formData.motherName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="gender"
                  select
                  label="Gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="birthPlace"
                  label="Birth Place"
                  value={formData.birthPlace}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="birthCity"
                  label="Birth City"
                  value={formData.birthCity}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="bloodGroup"
                  label="Blood Group"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="userId"
                  label="User ID"
                  type="number"
                  value={formData.userId}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Present Address</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="presentAddress1"
                  label="Address Line 1"
                  value={formData.presentAddress1}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="presentAddress2"
                  label="Address Line 2"
                  value={formData.presentAddress2}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="presentAddress3"
                  label="Address Line 3"
                  value={formData.presentAddress3}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="presentCity"
                  label="City"
                  value={formData.presentCity}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="presentState"
                  label="State"
                  value={formData.presentState}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Permanent Address</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="permanentAddress1"
                  label="Address Line 1"
                  value={formData.permanentAddress1}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="permanentAddress2"
                  label="Address Line 2"
                  value={formData.permanentAddress2}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="permanentAddress3"
                  label="Address Line 3"
                  value={formData.permanentAddress3}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="permanentCity"
                  label="City"
                  value={formData.permanentCity}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="permanentState"
                  label="State"
                  value={formData.permanentState}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="dateOfJoining"
                  label="Date of Joining"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="dateOfLeaving"
                  label="Date of Leaving"
                  type="date"
                  value={formData.dateOfLeaving}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="ageAtJoining"
                  label="Age at Joining"
                  type="number"
                  value={formData.ageAtJoining}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="referenceName"
                  label="Reference Name"
                  value={formData.referenceName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="remarks"
                  label="Remarks"
                  multiline
                  rows={4}
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.esiApplicable}
                      onChange={handleChange}
                      name="esiApplicable"
                    />
                  }
                  label="ESI Applicable"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="esiLocation"
                  label="ESI Location"
                  value={formData.esiLocation}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="pfNo"
                  label="PF Number"
                  value={formData.pfNo}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="pan"
                  label="PAN"
                  value={formData.pan}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="bankAccountNo"
                  label="Bank Account Number"
                  value={formData.bankAccountNo}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="bankName"
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="bankLocation"
                  label="Bank Location"
                  value={formData.bankLocation}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="bankRtgsCode"
                  label="RTGS Code"
                  value={formData.bankRtgsCode}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="nomineeName"
                  label="Nominee Name"
                  value={formData.nomineeName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="nomineeRelation"
                  label="Nominee Relation"
                  value={formData.nomineeRelation}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  name="nomineeAge"
                  label="Nominee Age"
                  type="number"
                  value={formData.nomineeAge}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
            >
              {isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default WorkerFormDialog; 