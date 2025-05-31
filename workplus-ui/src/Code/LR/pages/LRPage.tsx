import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocalShipping as TruckIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  LocationCity as CityIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../Common/components/DashboardLayout';
import { useLRService } from '../services/lrService';
import type { LREntry } from '../services/lrService';
import LREntryForm from '../components/LREntryForm';
import LRViewDialog from '../components/LRViewDialog';
import { useNavigate } from 'react-router-dom';

interface LRStats {
  totalEntries: number;
  totalAmount: number;
  activeParties: number;
  recentEntries: number;
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

const LRPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [entries, setEntries] = useState<LREntry[]>([]);
  const [stats, setStats] = useState<LRStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEntry, setEditingEntry] = useState<LREntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<LREntry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { getLREntries } = useLRService();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const entriesData = await getLREntries();
      setEntries(entriesData);
      
      // Calculate stats from entries
      const statsData: LRStats = {
        totalEntries: entriesData.length,
        totalAmount: entriesData.reduce((sum, entry) => sum + entry.lrAmount, 0),
        activeParties: new Set(entriesData.map(entry => entry.partyId)).size,
        recentEntries: entriesData.filter(entry => {
          const entryDate = new Date(entry.lrDate);
          const currentMonth = new Date();
          return entryDate.getMonth() === currentMonth.getMonth() && 
                 entryDate.getFullYear() === currentMonth.getFullYear();
        }).length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error loading LR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setEditingEntry(null); // Clear editing when switching tabs
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    setTabValue(1); // Switch to form tab
  };

  const handleEditEntry = (entry: LREntry) => {
    setEditingEntry(entry);
    setViewingEntry(null);
    setTabValue(1); // Switch to form tab
  };

  const handleViewEntry = (entry: LREntry) => {
    setViewingEntry(entry);
    setViewDialogOpen(true);
  };

  const handleFormSuccess = () => {
    loadData();
    setTabValue(0); // Switch back to list tab
    setEditingEntry(null);
  };

  const handleFormCancel = () => {
    setTabValue(0); // Switch back to list tab
    setEditingEntry(null);
  };

  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
    setViewingEntry(null);
  };

  const filteredEntries = entries.filter(entry =>
    entry.lrNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.transporterName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3,mt:8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt:4 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          LR Manage
        </Typography>
      </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewEntry}
            size="large"
          >
            New LR Entry
          </Button>
        </Box>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TruckIcon color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalEntries}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Entries
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BusinessIcon color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        ₹{stats.totalAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PeopleIcon color="info" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.activeParties}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Parties
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CityIcon color="warning" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.recentEntries}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This Month
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="LR Entries" />
              <Tab label={editingEntry ? "Edit LR Entry" : "New LR Entry"} />
            </Tabs>
          </Box>

          {/* Tab Panel 0 - LR Entries List */}
          <TabPanel value={tabValue} index={0}>
            {/* Search */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search by LR No, Party Name, or Transporter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Entries Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>LR No</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Party</TableCell>
                    <TableCell>Transporter</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.entryId}>
                      <TableCell>{entry.lrNo}</TableCell>
                      <TableCell>
                        {new Date(entry.lrDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{entry.partyName}</TableCell>
                      <TableCell>{entry.transporterName}</TableCell>
                      <TableCell>₹{entry.lrAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={entry.status}
                          color={getStatusColor(entry.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditEntry(entry)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="default"
                          onClick={() => handleViewEntry(entry)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Tab Panel 1 - LR Entry Form */}
          <TabPanel value={tabValue} index={1}>
            <LREntryForm
              entry={editingEntry}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </TabPanel>
        </Card>

        {/* View Dialog */}
        <LRViewDialog
          open={viewDialogOpen}
          entry={viewingEntry}
          onClose={handleViewDialogClose}
        />
      </Box>
    </DashboardLayout>
  );
};

export default LRPage; 