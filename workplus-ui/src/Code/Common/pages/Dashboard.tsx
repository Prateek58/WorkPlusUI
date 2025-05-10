import { Box, Card, Grid, Typography, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme } from '@mui/material/styles';
import DashboardLayout from '../../Common/components/DashboardLayout';
import dayjs from 'dayjs';

// Dummy data
const dummyJobWorks = [
  { entryDate: dayjs().format('YYYY-MM-DD'), workName: 'Cutting', employeeName: 'Rahul', qtyHours: 8, totalAmount: 1200 },
  { entryDate: dayjs().format('YYYY-MM-DD'), workName: 'Stitching', employeeName: 'Priya', qtyHours: 6, totalAmount: 900 },
  { entryDate: dayjs().format('YYYY-MM-DD'), workName: 'Packing', employeeName: 'Amit', qtyHours: 4, totalAmount: 600 },
  { entryDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), workName: 'Cutting', employeeName: 'Rahul', qtyHours: 8, totalAmount: 1200 },
  { entryDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), workName: 'Stitching', employeeName: 'Priya', qtyHours: 8, totalAmount: 1200 },
  { entryDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD'), workName: 'Packing', employeeName: 'Amit', qtyHours: 8, totalAmount: 1200 },
];

const dummyWorkers = [
  { name: 'Rahul', present: true, totalJobs: 45, totalEarnings: 54000 },
  { name: 'Priya', present: true, totalJobs: 38, totalEarnings: 45600 },
  { name: 'Amit', present: false, totalJobs: 42, totalEarnings: 50400 },
  { name: 'Sneha', present: true, totalJobs: 35, totalEarnings: 42000 },
  { name: 'Rajesh', present: false, totalJobs: 40, totalEarnings: 48000 },
];

const dummyMonthlyData = [
  { month: 'Jan 2024', amount: 120000, hours: 960, jobs: 80 },
  { month: 'Feb 2024', amount: 135000, hours: 1080, jobs: 90 },
  { month: 'Mar 2024', amount: 150000, hours: 1200, jobs: 100 },
  { month: 'Apr 2024', amount: 165000, hours: 1320, jobs: 110 },
  { month: 'May 2024', amount: 180000, hours: 1440, jobs: 120 },
  { month: 'Jun 2024', amount: 195000, hours: 1560, jobs: 130 },
];

const dummyJobDistribution = [
  { id: 1, value: 40, label: 'Cutting' },
  { id: 2, value: 30, label: 'Stitching' },
  { id: 3, value: 20, label: 'Packing' },
  { id: 4, value: 10, label: 'Quality Check' },
];

const Dashboard = () => {
  const theme = useTheme();

  // Calculate today's statistics
  const today = dayjs().format('YYYY-MM-DD');
  const todayEntries = dummyJobWorks.filter(entry => entry.entryDate === today);
  const todayAmount = todayEntries.reduce((sum, entry) => sum + entry.totalAmount, 0);
  const todayHours = todayEntries.reduce((sum, entry) => sum + entry.qtyHours, 0);
  
  // Calculate worker statistics
  const presentWorkers = dummyWorkers.filter(w => w.present).length;
  const absentWorkers = dummyWorkers.filter(w => !w.present).length;
  const totalWorkers = dummyWorkers.length;
  
  // Calculate total statistics
  const totalJobs = dummyWorkers.reduce((sum, w) => sum + w.totalJobs, 0);
  const totalEarnings = dummyWorkers.reduce((sum, w) => sum + w.totalEarnings, 0);
  const totalHours = dummyMonthlyData.reduce((sum, m) => sum + m.hours, 0);

  return (
    <DashboardLayout>
      <Typography variant="h4" sx={{ mb: 3, mt: 9 }}>
        Dashboard WorkPlus
      </Typography>

      <Grid container spacing={2}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Today's Jobs
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
              {todayEntries.length}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                ₹{todayAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Earnings
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Worker Attendance
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
              {presentWorkers}/{totalWorkers}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="error.main" sx={{ mr: 1 }}>
                {absentWorkers} Absent
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Total Jobs
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {totalJobs}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                ₹{totalEarnings.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Total Hours
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
              {totalHours}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                {todayHours} Hours
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Today's Hours
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Monthly Performance</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ width: '100%', height: 250 }}>
              <BarChart
                series={[
                  {
                    data: dummyMonthlyData.map(item => item.amount),
                    label: 'Earnings',
                    color: theme.palette.primary.main,
                  },
                  {
                    data: dummyMonthlyData.map(item => item.hours),
                    label: 'Hours',
                    color: theme.palette.success.main,
                  }
                ]}
                xAxis={[{
                  scaleType: 'band',
                  data: dummyMonthlyData.map(item => item.month),
                }]}
                height={250}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Top Performers</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ mt: 1 }}>
              {dummyWorkers
                .sort((a, b) => b.totalEarnings - a.totalEarnings)
                .slice(0, 3)
                .map((worker, index) => (
                  <Box key={worker.name} sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {index + 1}. {worker.name}
                    </Typography>
                    <Typography variant="h6">
                      ₹{worker.totalEarnings.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {worker.totalJobs} Jobs
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Job Distribution</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ width: '100%', height: 250 }}>
              <PieChart
                series={[
                  {
                    data: dummyJobDistribution,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30 },
                  },
                ]}
                height={250}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default Dashboard; 