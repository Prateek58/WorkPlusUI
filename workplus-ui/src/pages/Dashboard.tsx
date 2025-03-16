import { Box, Card, Grid, Stack, Typography, IconButton } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme } from '@mui/material/styles';
import DashboardLayout from '../components/DashboardLayout';
import { LinearProgress } from '@mui/material';

// Dummy data for charts
const monthlyData = [
  { month: 'Jan', value: 15000 },
  { month: 'Feb', value: 18000 },
  { month: 'Mar', value: 14000 },
  { month: 'Apr', value: 16500 },
  { month: 'May', value: 19000 },
  { month: 'Jun', value: 21845 },
];

const revenueData = [
  { month: 'Jan', earning: 4000, expense: 2400 },
  { month: 'Feb', earning: 5000, expense: 3000 },
  { month: 'Mar', earning: 6000, expense: 4000 },
  { month: 'Apr', earning: 4500, expense: 2800 },
  { month: 'May', earning: 5500, expense: 3200 },
  { month: 'Jun', earning: 6500, expense: 3800 },
];

const salesData = [
  { id: 0, value: 12150, label: 'Apparel' },
  { id: 1, value: 24900, label: 'Electronics' },
  { id: 2, value: 12750, label: 'FMCG' },
  { id: 3, value: 50200, label: 'Other Sales' },
];

const Dashboard = () => {
  const theme = useTheme();

  return (
    <DashboardLayout>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ratings
            </Typography>
            <Typography variant="h3" color="primary.main">
              13k
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                +15.6%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Year of 2025
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sessions
            </Typography>
            <Typography variant="h3">
              24.5k
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" color="error.main" sx={{ mr: 1 }}>
                -20%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Week
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transactions
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Sales
                </Typography>
                <Typography variant="h6">
                  245k
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Users
                </Typography>
                <Typography variant="h6">
                  12.5k
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Product
                </Typography>
                <Typography variant="h6">
                  1.54k
                </Typography>
              </Box>
            </Box>
            <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Total Sales</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Typography variant="h4" sx={{ mb: 2 }}>$21,845</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <LineChart
                series={[
                  {
                    data: monthlyData.map(item => item.value),
                    area: true,
                    color: theme.palette.primary.main,
                  },
                ]}
                xAxis={[{
                  scaleType: 'point',
                  data: monthlyData.map(item => item.month),
                }]}
                height={300}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Revenue Report</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ width: '100%', height: 300 }}>
              <BarChart
                series={[
                  {
                    data: revenueData.map(item => item.earning),
                    label: 'Earning',
                    color: theme.palette.primary.main,
                  },
                  {
                    data: revenueData.map(item => item.expense),
                    label: 'Expense',
                    color: theme.palette.mode === 'dark' ? '#666' : '#ddd',
                  },
                ]}
                xAxis={[{
                  scaleType: 'band',
                  data: revenueData.map(item => item.month),
                }]}
                height={300}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Sales Overview</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ width: '60%', height: 300 }}>
                <PieChart
                  series={[
                    {
                      data: salesData,
                      highlightScope: { faded: 'global', highlighted: 'item' },
                      faded: { innerRadius: 30, additionalRadius: -30 },
                    },
                  ]}
                  height={300}
                />
              </Box>
              <Box sx={{ width: '35%' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Number of Sales
                </Typography>
                <Typography variant="h5" gutterBottom>
                  $86,400
                </Typography>
                {salesData.map((item) => (
                  <Box key={item.label} sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {item.label}
                    </Typography>
                    <Typography variant="h6">
                      ${item.value.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default Dashboard; 