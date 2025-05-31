import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
  cardStyles
} from '../../../../../theme/styleUtils';
import jobEntryReportService, { JobEntryReport } from '../job-entries/jobEntryReportService';
import dayjs from 'dayjs';

interface EarningsReportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface EarningsMetrics {
  totalEarnings: number;
  totalJobs: number;
  averagePerJob: number;
  averagePerHour: number;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
    jobs: number;
    hours: number;
  }>;
  workerEarnings: Array<{
    workerName: string;
    totalEarnings: number;
    totalJobs: number;
    averagePerJob: number;
    totalHours: number;
  }>;
  jobTypeEarnings: Array<{
    jobName: string;
    totalEarnings: number;
    totalJobs: number;
    averagePerJob: number;
  }>;
  dailyEarnings: Array<{
    date: string;
    earnings: number;
    jobs: number;
  }>;
  topEarners: Array<{
    workerName: string;
    earnings: number;
    jobs: number;
  }>;
}

const EarningsReportDialog: React.FC<EarningsReportDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobEntries, setJobEntries] = useState<JobEntryReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [tabValue, setTabValue] = useState(0);

  // Fetch job entries data
  const fetchJobEntries = async () => {
    setLoading(true);
    try {
      const data = await jobEntryReportService.getFilteredJobEntriesReport({
        pageNumber: 1,
        pageSize: 1000
      });
      
      setJobEntries(data.items);
      setError(null);
    } catch (err) {
      console.error('Error fetching job entries:', err);
      setError('Failed to load earnings data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchJobEntries();
    }
  }, [open]);

  // Filter jobs based on selected period
  const filteredJobs = useMemo(() => {
    if (selectedPeriod === 'all') return jobEntries;
    
    const now = dayjs();
    let startDate: dayjs.Dayjs;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = now.subtract(1, 'week');
        break;
      case 'month':
        startDate = now.subtract(1, 'month');
        break;
      case 'quarter':
        startDate = now.subtract(3, 'months');
        break;
      case 'year':
        startDate = now.subtract(1, 'year');
        break;
      default:
        return jobEntries;
    }
    
    return jobEntries.filter(job => {
      if (!job.createdAt) return false; // Exclude jobs without createdAt
      const jobDate = dayjs(job.createdAt);
      return jobDate.isValid() && jobDate.isAfter(startDate);
    });
  }, [jobEntries, selectedPeriod]);

  // Calculate earnings metrics
  const earningsMetrics = useMemo((): EarningsMetrics => {
    const totalEarnings = filteredJobs.reduce((sum, job) => sum + (job.totalAmount || 0), 0);
    const totalJobs = filteredJobs.length;
    const totalHours = filteredJobs.reduce((sum, job) => sum + (job.hoursTaken || 0), 0);
    const averagePerJob = totalJobs > 0 ? totalEarnings / totalJobs : 0;
    const averagePerHour = totalHours > 0 ? totalEarnings / totalHours : 0;

    // Monthly earnings (last 6 months)
    const monthlyEarnings = [];
    for (let i = 5; i >= 0; i--) {
      const month = dayjs().subtract(i, 'months');
      const monthStr = month.format('YYYY-MM');
      const monthJobs = filteredJobs.filter(job => {
        if (!job.createdAt) return false;
        const jobDate = dayjs(job.createdAt);
        return jobDate.isValid() && jobDate.format('YYYY-MM') === monthStr;
      });
      
      monthlyEarnings.push({
        month: month.format('MMM'),
        earnings: monthJobs.reduce((sum, job) => sum + (job.totalAmount || 0), 0),
        jobs: monthJobs.length,
        hours: monthJobs.reduce((sum, job) => sum + (job.hoursTaken || 0), 0)
      });
    }

    // Worker earnings
    const workerStats = new Map();
    filteredJobs.forEach(job => {
      const workerName = job.workerName || 'Unknown';
      if (!workerStats.has(workerName)) {
        workerStats.set(workerName, { 
          totalEarnings: 0, 
          totalJobs: 0, 
          totalHours: 0 
        });
      }
      const stats = workerStats.get(workerName);
      stats.totalEarnings += job.totalAmount || 0;
      stats.totalJobs++;
      stats.totalHours += job.hoursTaken || 0;
    });

    const workerEarnings = Array.from(workerStats.entries())
      .map(([workerName, stats]) => ({
        workerName,
        totalEarnings: stats.totalEarnings,
        totalJobs: stats.totalJobs,
        averagePerJob: stats.totalJobs > 0 ? stats.totalEarnings / stats.totalJobs : 0,
        totalHours: stats.totalHours
      }))
      .sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Job type earnings
    const jobTypeStats = new Map();
    filteredJobs.forEach(job => {
      const jobName = job.jobName || 'Unknown';
      if (!jobTypeStats.has(jobName)) {
        jobTypeStats.set(jobName, { totalEarnings: 0, totalJobs: 0 });
      }
      const stats = jobTypeStats.get(jobName);
      stats.totalEarnings += job.totalAmount || 0;
      stats.totalJobs++;
    });

    const jobTypeEarnings = Array.from(jobTypeStats.entries())
      .map(([jobName, stats]) => ({
        jobName,
        totalEarnings: stats.totalEarnings,
        totalJobs: stats.totalJobs,
        averagePerJob: stats.totalJobs > 0 ? stats.totalEarnings / stats.totalJobs : 0
      }))
      .sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Daily earnings (last 30 days)
    const dailyEarnings = [];
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'days');
      const dateStr = date.format('YYYY-MM-DD');
      const dayJobs = filteredJobs.filter(job => {
        if (!job.createdAt) return false;
        const jobDate = dayjs(job.createdAt);
        return jobDate.isValid() && jobDate.format('YYYY-MM-DD') === dateStr;
      });
      
      dailyEarnings.push({
        date: date.format('DD/MM'),
        earnings: dayJobs.reduce((sum, job) => sum + (job.totalAmount || 0), 0),
        jobs: dayJobs.length
      });
    }

    // Top earners (top 5)
    const topEarners = workerEarnings.slice(0, 5).map(worker => ({
      workerName: worker.workerName,
      earnings: worker.totalEarnings,
      jobs: worker.totalJobs
    }));

    return {
      totalEarnings,
      totalJobs,
      averagePerJob,
      averagePerHour,
      monthlyEarnings,
      workerEarnings,
      jobTypeEarnings,
      dailyEarnings,
      topEarners
    };
  }, [filteredJobs]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { height: '95vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            💰 Earnings Report
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2, pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        {/* Period Selection */}
        <Box sx={{ mb: 2, mt: 1 }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Time Period</InputLabel>
            <Select
              value={selectedPeriod}
              label="Time Period"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            {/* Key Metrics */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <Card sx={cardStyles(theme)}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1 }}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 24, color: 'success.main', mb: 0.5 }} />
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(earningsMetrics.totalEarnings)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Earnings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card sx={cardStyles(theme)}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1 }}>
                    <WorkIcon sx={{ fontSize: 24, color: 'primary.main', mb: 0.5 }} />
                    <Typography variant="h6" color="primary.main">
                      {earningsMetrics.totalJobs}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Jobs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card sx={cardStyles(theme)}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1 }}>
                    <AttachMoneyIcon sx={{ fontSize: 24, color: 'info.main', mb: 0.5 }} />
                    <Typography variant="h6" color="info.main">
                      {formatCurrency(earningsMetrics.averagePerJob)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg. per Job
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Card sx={cardStyles(theme)}>
                  <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 24, color: 'warning.main', mb: 0.5 }} />
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(earningsMetrics.averagePerHour)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg. per Hour
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tabs for different views */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="scrollable">
                <Tab label="Overview" />
                <Tab label="By Worker" />
                <Tab label="By Job Type" />
                <Tab label="Top Earners" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            {tabValue === 0 && (
              <Grid container spacing={2}>
                {/* Monthly Earnings Trend */}
                <Grid item xs={12} md={8}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Monthly Earnings Trend
                      </Typography>
                      <Box sx={{ width: '100%', height: 250 }}>
                        <LineChart
                          series={[
                            {
                              data: earningsMetrics.monthlyEarnings.map(item => item.earnings),
                              label: 'Earnings (₹)',
                              color: theme.palette.success.main,
                            }
                          ]}
                          xAxis={[{
                            scaleType: 'band',
                            data: earningsMetrics.monthlyEarnings.map(item => item.month),
                          }]}
                          height={250}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Earnings Distribution */}
                <Grid item xs={12} md={4}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Top Job Types
                      </Typography>
                      <Box sx={{ width: '100%', height: 250 }}>
                        <PieChart
                          series={[
                            {
                              data: earningsMetrics.jobTypeEarnings.slice(0, 5).map((job, index) => ({
                                id: index,
                                value: job.totalEarnings,
                                label: job.jobName
                              }))
                            }
                          ]}
                          height={250}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Performance Insights */}
                <Grid item xs={12}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Earnings Insights
                      </Typography>
                      <Grid container spacing={1}>
                        {earningsMetrics.totalEarnings > 100000 && (
                          <Grid item xs={12} sm={6}>
                            <Alert severity="success" sx={{ py: 0.5 }}>
                              <Typography variant="caption">
                                <strong>Milestone:</strong> Exceeded ₹1,00,000
                              </Typography>
                            </Alert>
                          </Grid>
                        )}
                        {earningsMetrics.averagePerJob > 1000 && (
                          <Grid item xs={12} sm={6}>
                            <Alert severity="info" sx={{ py: 0.5 }}>
                              <Typography variant="caption">
                                <strong>High Value:</strong> {formatCurrency(earningsMetrics.averagePerJob)} per job
                              </Typography>
                            </Alert>
                          </Grid>
                        )}
                        {earningsMetrics.averagePerHour > 200 && (
                          <Grid item xs={12} sm={6}>
                            <Alert severity="success" sx={{ py: 0.5 }}>
                              <Typography variant="caption">
                                <strong>Excellent Rate:</strong> {formatCurrency(earningsMetrics.averagePerHour)} per hour
                              </Typography>
                            </Alert>
                          </Grid>
                        )}
                        {earningsMetrics.topEarners.length > 0 && (
                          <Grid item xs={12} sm={6}>
                            <Alert severity="info" sx={{ py: 0.5 }}>
                              <Typography variant="caption">
                                <strong>Top Performer:</strong> {earningsMetrics.topEarners[0].workerName}
                              </Typography>
                            </Alert>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Earnings by Worker
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><Typography variant="caption" fontWeight="bold">Worker</Typography></TableCell>
                              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Earnings</Typography></TableCell>
                              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Jobs</Typography></TableCell>
                              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Avg/Job</Typography></TableCell>
                              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Hours</Typography></TableCell>
                              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Rate/Hr</Typography></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {earningsMetrics.workerEarnings.slice(0, 10).map((worker, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                                      <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Typography variant="caption">{worker.workerName}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={formatCurrency(worker.totalEarnings)}
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right"><Typography variant="caption">{worker.totalJobs}</Typography></TableCell>
                                <TableCell align="right"><Typography variant="caption">{formatCurrency(worker.averagePerJob)}</Typography></TableCell>
                                <TableCell align="right"><Typography variant="caption">{worker.totalHours.toFixed(1)}h</Typography></TableCell>
                                <TableCell align="right">
                                  <Typography variant="caption">{formatCurrency(worker.totalHours > 0 ? worker.totalEarnings / worker.totalHours : 0)}/h</Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Earnings by Job Type
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><Typography variant="caption" fontWeight="bold">Job Type</Typography></TableCell>
                              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Earnings</Typography></TableCell>
                              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Jobs</Typography></TableCell>
                              <TableCell align="right"><Typography variant="caption" fontWeight="bold">Avg/Job</Typography></TableCell>
                              <TableCell align="right"><Typography variant="caption" fontWeight="bold">% of Total</Typography></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {earningsMetrics.jobTypeEarnings.slice(0, 10).map((job, index) => (
                              <TableRow key={index}>
                                <TableCell><Typography variant="caption">{job.jobName}</Typography></TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={formatCurrency(job.totalEarnings)}
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right"><Typography variant="caption">{job.totalJobs}</Typography></TableCell>
                                <TableCell align="right"><Typography variant="caption">{formatCurrency(job.averagePerJob)}</Typography></TableCell>
                                <TableCell align="right">
                                  <Typography variant="caption">{((job.totalEarnings / earningsMetrics.totalEarnings) * 100).toFixed(1)}%</Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {tabValue === 3 && (
              <Grid container spacing={2}>
                {/* Top Earners Cards */}
                {earningsMetrics.topEarners.slice(0, 5).map((earner, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                    <Card sx={cardStyles(theme)}>
                      <CardContent sx={{ py: 1.5, px: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ mr: 1, bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze', width: 24, height: 24 }}>
                            <Typography variant="caption">{index + 1}</Typography>
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">{earner.workerName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {earner.jobs} jobs
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="h6" color="success.main" sx={{ textAlign: 'center' }}>
                          {formatCurrency(earner.earnings)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {/* Daily Earnings Chart */}
                <Grid item xs={12}>
                  <Card sx={cardStyles(theme)}>
                    <CardContent sx={{ py: 1.5, px: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                        Daily Earnings (Last 30 Days)
                      </Typography>
                      <Box sx={{ width: '100%', height: 300 }}>
                        <BarChart
                          series={[
                            {
                              data: earningsMetrics.dailyEarnings.map(item => item.earnings),
                              label: 'Daily Earnings (₹)',
                              color: theme.palette.success.main,
                            }
                          ]}
                          xAxis={[{
                            scaleType: 'band',
                            data: earningsMetrics.dailyEarnings.map(item => item.date),
                          }]}
                          height={300}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={fetchJobEntries} disabled={loading} startIcon={<RefreshIcon />}>
          Refresh Data
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EarningsReportDialog; 