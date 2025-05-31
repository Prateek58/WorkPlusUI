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
  Avatar,
  LinearProgress,
  Autocomplete,
  TextField
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  cardStyles
} from '../../../../../theme/styleUtils';
import jobEntryReportService, { JobEntryReport } from '../job-entries/jobEntryReportService';
import dayjs from 'dayjs';

interface WorkerPerformanceReportDialogProps {
  open: boolean;
  onClose: () => void;
}

interface WorkerPerformanceMetrics {
  workerName: string;
  totalJobs: number;
  totalEarnings: number;
  totalHours: number;
  averagePerJob: number;
  averageHourlyRate: number;
  productivityScore: number;
  monthlyTrends: Array<{
    month: string;
    jobs: number;
    earnings: number;
    hours: number;
  }>;
  jobDistribution: Array<{
    jobName: string;
    count: number;
    earnings: number;
  }>;
  recentActivity: Array<{
    date: string;
    jobName: string;
    amount: number;
    hours: number;
  }>;
}

const WorkerPerformanceReportDialog: React.FC<WorkerPerformanceReportDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobEntries, setJobEntries] = useState<JobEntryReport[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [workerOptions, setWorkerOptions] = useState<string[]>([]);

  // Fetch job entries data
  const fetchJobEntries = async () => {
    setLoading(true);
    try {
      const data = await jobEntryReportService.getFilteredJobEntriesReport({
        pageNumber: 1,
        pageSize: 2000 // Increased from 1000 to get more records
      });
      
      setJobEntries(data.items);
      
      // Extract unique worker names and filter out undefined values
      const workerNames = data.items
        .map(item => item.workerName)
        .filter((name): name is string => Boolean(name));
      const uniqueWorkers = [...new Set(workerNames)];
      
      console.log('Total job entries:', data.items.length);
      console.log('Worker names found:', workerNames.length);
      console.log('Unique workers:', uniqueWorkers.length);
      console.log('Workers list:', uniqueWorkers);
      
      setWorkerOptions(uniqueWorkers);
      
      if (uniqueWorkers.length > 0 && !selectedWorker) {
        setSelectedWorker(uniqueWorkers[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching job entries:', err);
      setError('Failed to load worker performance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchJobEntries();
    }
  }, [open]);

  // Calculate worker performance metrics
  const workerMetrics = useMemo((): WorkerPerformanceMetrics | null => {
    if (!selectedWorker || !jobEntries.length) return null;

    const workerEntries = jobEntries.filter(entry => entry.workerName === selectedWorker);
    
    if (!workerEntries.length) return null;

    const totalJobs = workerEntries.length;
    const totalEarnings = workerEntries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0);
    const totalHours = workerEntries.reduce((sum, entry) => sum + (entry.hoursTaken || 0), 0);
    const averagePerJob = totalJobs > 0 ? totalEarnings / totalJobs : 0;
    const averageHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0;

    // Calculate productivity score (0-100) based on multiple factors
    const avgJobsPerMonth = totalJobs / Math.max(1, dayjs().diff(dayjs(workerEntries[0].createdAt), 'months', true));
    const productivityScore = Math.min(100, Math.max(0, 
      (averageHourlyRate / 100) * 40 + // 40% weight on hourly rate
      (avgJobsPerMonth / 10) * 30 + // 30% weight on job frequency
      (totalEarnings / 10000) * 30 // 30% weight on total earnings
    ));

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const month = dayjs().subtract(i, 'months');
      const monthStr = month.format('YYYY-MM');
      const monthEntries = workerEntries.filter(entry => 
        dayjs(entry.createdAt).format('YYYY-MM') === monthStr
      );
      
      monthlyTrends.push({
        month: month.format('MMM'),
        jobs: monthEntries.length,
        earnings: monthEntries.reduce((sum, e) => sum + (e.totalAmount || 0), 0),
        hours: monthEntries.reduce((sum, e) => sum + (e.hoursTaken || 0), 0)
      });
    }

    // Job distribution
    const jobStats = new Map();
    workerEntries.forEach(entry => {
      const jobName = entry.jobName || 'Unknown';
      if (!jobStats.has(jobName)) {
        jobStats.set(jobName, { count: 0, earnings: 0 });
      }
      const stats = jobStats.get(jobName);
      stats.count++;
      stats.earnings += entry.totalAmount || 0;
    });

    const jobDistribution = Array.from(jobStats.entries())
      .map(([jobName, stats]) => ({
        jobName,
        count: stats.count,
        earnings: stats.earnings
      }))
      .sort((a, b) => b.count - a.count);

    // Recent activity (last 10 entries)
    const recentActivity = workerEntries
      .filter(entry => entry.createdAt) // Filter out entries without createdAt
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 10)
      .map(entry => ({
        date: dayjs(entry.createdAt!).format('DD/MM/YYYY'),
        jobName: entry.jobName || 'Unknown',
        amount: entry.totalAmount || 0,
        hours: entry.hoursTaken || 0
      }));

    return {
      workerName: selectedWorker,
      totalJobs,
      totalEarnings,
      totalHours,
      averagePerJob,
      averageHourlyRate,
      productivityScore,
      monthlyTrends,
      jobDistribution,
      recentActivity
    };
  }, [selectedWorker, jobEntries]);

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getPerformanceRating = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
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
            👤 Worker Performance Report
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 4, pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        {/* Debug Information */}
        {!loading && (
          <Alert severity="info" sx={{ mb: 1, py: 0.5 }}>
            <Typography variant="caption">
              <strong>Data Summary:</strong> Found {jobEntries.length} total job entries with {workerOptions.length} unique workers.
              {workerOptions.length > 0 && (
                <>
                  <br />
                  <strong>Workers:</strong> {workerOptions.join(', ')}
                </>
              )}
            </Typography>
          </Alert>
        )}

        {/* Worker Selection */}
        <Box sx={{ mb: 2, mt: 1 }}>
          <Autocomplete
            value={selectedWorker}
            onChange={(event, newValue) => {
              setSelectedWorker(newValue || '');
            }}
            options={workerOptions}
            renderInput={(params) => (
              <TextField {...params} label="Select Worker" variant="outlined" size="small" />
            )}
            isOptionEqualToValue={(option, value) => option === value}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2">{option}</Typography>
              </Box>
            )}
            noOptionsText="No workers found"
            clearOnBlur
            selectOnFocus
            handleHomeEndKeys
            freeSolo={false}
            fullWidth
            size="small"
          />
          {workerOptions.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {workerOptions.length} worker(s) available
            </Typography>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress size={40} />
          </Box>
        ) : workerMetrics ? (
          <Grid container spacing={2}>
            {/* Performance Overview */}
            <Grid item xs={12}>
              <Card sx={{ ...cardStyles(theme), mb: 1 }}>
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ mr: 1.5, bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">{workerMetrics.workerName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Performance Analysis
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color={`${getPerformanceColor(workerMetrics.productivityScore)}.main`}>
                        {workerMetrics.productivityScore.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Score
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      icon={<StarIcon fontSize="small" />}
                      label={getPerformanceRating(workerMetrics.productivityScore)}
                      color={getPerformanceColor(workerMetrics.productivityScore) as any}
                      size="small"
                    />
                    <LinearProgress
                      variant="determinate"
                      value={workerMetrics.productivityScore}
                      color={getPerformanceColor(workerMetrics.productivityScore) as any}
                      sx={{ height: 6, borderRadius: 3, flexGrow: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Key Metrics */}
            <Grid item xs={6} sm={3}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1 }}>
                  <WorkIcon sx={{ fontSize: 24, color: 'primary.main', mb: 0.5 }} />
                  <Typography variant="h6" color="primary.main">
                    {workerMetrics.totalJobs}
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
                  <AccountBalanceWalletIcon sx={{ fontSize: 24, color: 'success.main', mb: 0.5 }} />
                  <Typography variant="h6" color="success.main">
                    ₹{(workerMetrics.totalEarnings / 1000).toFixed(0)}k
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
                  <AccessTimeIcon sx={{ fontSize: 24, color: 'info.main', mb: 0.5 }} />
                  <Typography variant="h6" color="info.main">
                    {workerMetrics.totalHours.toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ textAlign: 'center', py: 1.5, px: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 24, color: 'warning.main', mb: 0.5 }} />
                  <Typography variant="h6" color="warning.main">
                    ₹{workerMetrics.averageHourlyRate.toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hourly Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Performance Trends */}
            <Grid item xs={12} md={8}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Monthly Performance Trends
                  </Typography>
                  {workerMetrics.monthlyTrends.length > 0 ? (
                    <Box sx={{ width: '100%', height: 250 }}>
                      <LineChart
                        series={[
                          {
                            data: workerMetrics.monthlyTrends.map(item => item.earnings),
                            label: 'Earnings (₹)',
                            color: theme.palette.success.main,
                          },
                          {
                            data: workerMetrics.monthlyTrends.map(item => item.jobs * 100), // Scale for visibility
                            label: 'Jobs (x100)',
                            color: theme.palette.primary.main,
                          }
                        ]}
                        xAxis={[{
                          scaleType: 'band',
                          data: workerMetrics.monthlyTrends.map(item => item.month),
                        }]}
                        height={250}
                      />
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No performance trend data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Job Distribution */}
            <Grid item xs={12} md={4}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Job Distribution
                  </Typography>
                  {workerMetrics.jobDistribution.length > 0 ? (
                    <Box>
                      {workerMetrics.jobDistribution.slice(0, 5).map((job, index) => (
                        <Box key={index} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight="medium">{job.jobName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {job.count}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(job.count / workerMetrics.totalJobs) * 100}
                            sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            ₹{(job.earnings / 1000).toFixed(0)}k
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No job distribution data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Recent Job Activity
                  </Typography>
                  {workerMetrics.recentActivity.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><Typography variant="caption" fontWeight="bold">Date</Typography></TableCell>
                            <TableCell><Typography variant="caption" fontWeight="bold">Job</Typography></TableCell>
                            <TableCell align="right"><Typography variant="caption" fontWeight="bold">Amount</Typography></TableCell>
                            <TableCell align="right"><Typography variant="caption" fontWeight="bold">Hours</Typography></TableCell>
                            <TableCell align="right"><Typography variant="caption" fontWeight="bold">Rate/Hour</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {workerMetrics.recentActivity.slice(0, 8).map((activity, index) => (
                            <TableRow key={index}>
                              <TableCell><Typography variant="caption">{activity.date}</Typography></TableCell>
                              <TableCell><Typography variant="caption">{activity.jobName}</Typography></TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`₹${(activity.amount / 1000).toFixed(1)}k`}
                                  color="success"
                                  variant="outlined"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right"><Typography variant="caption">{activity.hours.toFixed(1)}h</Typography></TableCell>
                              <TableCell align="right">
                                <Typography variant="caption">₹{activity.hours > 0 ? (activity.amount / activity.hours).toFixed(0) : '0'}/h</Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No recent activity available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Insights */}
            <Grid item xs={12}>
              <Card sx={cardStyles(theme)}>
                <CardContent sx={{ py: 1.5, px: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Performance Insights
                  </Typography>
                  <Grid container spacing={1}>
                    {workerMetrics.averageHourlyRate > 200 && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity="success" sx={{ py: 0.5 }}>
                          <Typography variant="caption">
                            <strong>High Earner:</strong> ₹{workerMetrics.averageHourlyRate.toFixed(0)}/hr
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    {workerMetrics.totalJobs > 50 && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity="info" sx={{ py: 0.5 }}>
                          <Typography variant="caption">
                            <strong>Experienced:</strong> {workerMetrics.totalJobs} jobs completed
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    {workerMetrics.averagePerJob > 500 && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity="success" sx={{ py: 0.5 }}>
                          <Typography variant="caption">
                            <strong>High Value Jobs:</strong> ₹{(workerMetrics.averagePerJob / 1000).toFixed(1)}k avg
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    {workerMetrics.productivityScore > 80 && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity="success" sx={{ py: 0.5 }}>
                          <Typography variant="caption">
                            <strong>Top Performer:</strong> {workerMetrics.productivityScore.toFixed(1)}/100 score
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            {selectedWorker ? 'No performance data available for this worker.' : 'Please select a worker to view performance data.'}
          </Typography>
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

export default WorkerPerformanceReportDialog; 