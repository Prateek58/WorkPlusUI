import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalShipping as TruckIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useLRService } from '../services/lrService';
import type { LREntry, Document } from '../services/lrService';

interface LRViewDialogProps {
  open: boolean;
  entry: LREntry | null;
  onClose: () => void;
}

const LRViewDialog: React.FC<LRViewDialogProps> = ({ open, entry, onClose }) => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { getDocuments } = useLRService();

  useEffect(() => {
    if (entry && open) {
      loadDocuments();
    }
  }, [entry, open]);

  const loadDocuments = async () => {
    if (!entry) return;
    
    setLoading(true);
    try {
      const docs = await getDocuments(entry.entryId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadDocument = (documentName: string) => {
    // Simulate download - in real implementation, this would download the actual file
    console.log('Downloading document:', documentName);
    // You can implement actual download logic here
  };

  if (!entry) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        py: 1.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TruckIcon color="primary" sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              LR Entry Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              LR No: {entry.lrNo}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip 
            label={entry.status} 
            color={getStatusColor(entry.status) as any}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, px: 2 }}>
        <Grid container spacing={2}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent sx={{ py: 0.5, px: 2 }}>
                <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BusinessIcon fontSize="small" /> Basic Information
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">LR Number</Typography>
                      <Typography variant="body2" fontWeight="bold">{entry.lrNo}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">LR Date</Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 14 }} />
                        {formatDate(entry.lrDate)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Unit Name</Typography>
                      <Typography variant="body2" fontWeight="bold">{entry.unitName || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Bill Number</Typography>
                      <Typography variant="body2">{entry.billNo || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                  {entry.billDate && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Bill Date</Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 14 }} />
                          {formatDate(entry.billDate)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {entry.truckNo && (
                    <Grid item xs={12} md={4}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Truck Number</Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TruckIcon sx={{ fontSize: 14 }} />
                          {entry.truckNo}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Party, Transporter, Route & Driver Information - All in one row */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/* Party Information */}
              <Grid item xs={12} md={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ py: 0.5, px: 2 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PeopleIcon fontSize="small" /> Party
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Party Name</Typography>
                      <Typography variant="body2" fontWeight="bold">{entry.partyName}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Transporter Information */}
              <Grid item xs={12} md={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ py: 0.5, px: 2 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TruckIcon fontSize="small" /> Transporter
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Transporter Name</Typography>
                      <Typography variant="body2" fontWeight="bold">{entry.transporterName}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Route Information */}
              <Grid item xs={12} md={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ py: 0.5, px: 2 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationIcon fontSize="small" /> Route
                    </Typography>
                    {entry.originCityName && (
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">From</Typography>
                        <Typography variant="body2">{entry.originCityName}</Typography>
                      </Box>
                    )}
                    {entry.destinationCityName && (
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">To</Typography>
                        <Typography variant="body2">{entry.destinationCityName}</Typography>
                      </Box>
                    )}
                    {!entry.originCityName && !entry.destinationCityName && (
                      <Typography variant="caption" color="text.secondary">No route info</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Driver Information */}
              <Grid item xs={12} md={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ py: 0.5, px: 2 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PeopleIcon fontSize="small" /> Driver
                    </Typography>
                    {entry.driverName && (
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body2">{entry.driverName}</Typography>
                      </Box>
                    )}
                    {entry.driverMobile && (
                      <Box sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Mobile</Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14 }} />
                          {entry.driverMobile}
                        </Typography>
                      </Box>
                    )}
                    {!entry.driverName && !entry.driverMobile && (
                      <Typography variant="caption" color="text.secondary">No driver info</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Financial Information - More compact 4 columns */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent sx={{ py: 0.5, px: 2 }}>
                <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MoneyIcon fontSize="small" /> Financial Information
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">LR Amount</Typography>
                      <Typography variant="subtitle1" color="success.main" fontWeight="bold">
                        {formatCurrency(entry.lrAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">LR Weight (Qtl)</Typography>
                      <Typography variant="body2">{entry.lrWeight || 0}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Rate per Qtl</Typography>
                      <Typography variant="body2">{formatCurrency(entry.ratePerQtl || 0)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">LR Quantity</Typography>
                      <Typography variant="body2">{entry.lrQty || 0}</Typography>
                    </Box>
                  </Grid>
                  {entry.freight > 0 && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Freight</Typography>
                        <Typography variant="body2">{formatCurrency(entry.freight)}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {entry.totalFreight > 0 && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Total Freight</Typography>
                        <Typography variant="body2">{formatCurrency(entry.totalFreight)}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {entry.billAmount > 0 && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Bill Amount</Typography>
                        <Typography variant="body2">{formatCurrency(entry.billAmount)}</Typography>
                      </Box>
                    </Grid>
                  )}
                  {entry.totalQty > 0 && (
                    <Grid item xs={6} md={3}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">Total Quantity</Typography>
                        <Typography variant="body2">{entry.totalQty}</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Documents - Full width */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent sx={{ py: 0.5, px: 2 }}>
                <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FileIcon fontSize="small" /> Documents ({documents.length})
                </Typography>
                {documents.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 1, display: 'block' }}>
                    No documents uploaded for this LR entry.
                  </Typography>
                ) : (
                  <List dense sx={{ py: 0 }}>
                    {documents.map((doc) => (
                      <ListItem 
                        key={doc.documentId}
                        sx={{ 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 1, 
                          mb: 0.5,
                          py: 0.5,
                          px: 1,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <FileIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2">{doc.documentName}</Typography>}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                              <Chip 
                                label={doc.typeName} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(doc.uploadedAt)}
                              </Typography>
                            </Box>
                          }
                        />
                        <IconButton
                          edge="end"
                          onClick={() => handleDownloadDocument(doc.documentName)}
                          color="primary"
                          title="Download document"
                          size="small"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Remarks & Record Information - Combined row */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/* Remarks */}
              {entry.remarks && (
                <Grid item xs={12} md={8}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ py: 0.5, px: 2 }}>
                      <Typography variant="subtitle1" gutterBottom color="primary" sx={{ mb: 1 }}>
                        Remarks
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? theme.palette.grey[800] 
                          : theme.palette.grey[50], 
                        p: 1.5, 
                        borderRadius: 1,
                        fontStyle: 'italic'
                      }}>
                        {entry.remarks}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Record Information */}
              <Grid item xs={12} md={entry.remarks ? 4 : 12}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ py: 0.5, px: 2 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary" sx={{ mb: 1 }}>
                      Record Information
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Created At</Typography>
                      <Typography variant="body2">{formatDate(entry.createdAt)}</Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body2">{formatDate(entry.updatedAt)}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} variant="contained" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LRViewDialog; 