import React, { useEffect, useState } from 'react';
import './styles/global.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LoadingProvider } from './Code/Common/context/LoadingContext';
import { ConfirmProvider } from './Code/Common/hooks/useConfirm';
import Login from './Code/Common/pages/Login';
import Register from './Code/Common/pages/Register';
import Dashboard from './Code/Common/pages/Dashboard';
import Profile from './Code/Common/pages/Profile';
import Settings from './Code/Common/pages/Settings';
import Help from './Code/Common/pages/Help';
import JobWork from './Code/Archive/pages/JobWork';
import LorryReceipt from './Code/Archive/pages/LorryReceipt';
import LRPage from './Code/LR/pages/LRPage';
import PrivateRoute from './Code/Common/components/PrivateRoute';
import { ThemeContextProvider } from './theme/ThemeProvider';
import WorkPlusJobEntryForm from './Code/MainWorkPlus/components/forms/workplus-job-entry/WorkPlusJobEntryForm';
import WorkPlusMastersLanding from './Code/MainWorkPlus/pages/WorkPlusMastersLanding';
import WorkPlusReportsLanding from './Code/MainWorkPlus/pages/WorkPlusReportsLanding';
import JobEntryDashboard from './Code/MainWorkPlus/components/reports/dashboard-job-entry/JobEntryDashboard';
import { HRLanding, AttendancePage, LeavePage } from './Code/HR';
import HRMastersLanding from './Code/HR/pages/HRMastersLanding';
import HRReportsLanding from './Code/HR/pages/HRReportsLanding';
import HRAttendanceDashboard from './Code/HR/pages/HRAttendanceDashboard';
import HRLMSDashboard from './Code/HR/pages/HRLMSDashboard';
import { Alert, Snackbar, Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any; errorInfo?: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Unhandled UI error:', error);
    console.error('Error details:', errorInfo);
    this.setState({ error, errorInfo });
    try {
      const existing = JSON.parse(sessionStorage.getItem('appErrors') || '[]');
      existing.push({
        message: String(error?.message || error),
        stack: String(error?.stack || ''),
        info: errorInfo,
        time: new Date().toISOString()
      });
      sessionStorage.setItem('appErrors', JSON.stringify(existing).slice(0, 100000));
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            A runtime error prevented this page from loading. Details are logged to the console.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => location.reload()}>
            Reload
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const onError = (message: any, source?: string, lineno?: number, colno?: number, error?: any) => {
      const details = typeof message === 'string' ? message : String(message);
      console.error('Global error captured:', { details, source, lineno, colno, error });
      setGlobalError(details);
      setSnackbarOpen(true);
      try {
        const existing = JSON.parse(sessionStorage.getItem('appErrors') || '[]');
        existing.push({
          message: details,
          stack: String(error?.stack || ''),
          source,
          line: lineno,
          column: colno,
          time: new Date().toISOString()
        });
        sessionStorage.setItem('appErrors', JSON.stringify(existing).slice(0, 100000));
      } catch {}
      return false;
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const message = typeof reason === 'string' ? reason : String(reason?.message || reason);
      console.error('Unhandled promise rejection:', reason);
      setGlobalError(message);
      setSnackbarOpen(true);
      try {
        const existing = JSON.parse(sessionStorage.getItem('appErrors') || '[]');
        existing.push({
          message,
          stack: String(reason?.stack || ''),
          time: new Date().toISOString()
        });
        sessionStorage.setItem('appErrors', JSON.stringify(existing).slice(0, 100000));
      } catch {}
    };
    const prevOnError = window.onerror;
    window.onerror = onError as any;
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.onerror = prevOnError || null;
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeContextProvider>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <LoadingProvider>
            <ConfirmProvider>
              <ErrorBoundary>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<PrivateRoute />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="help" element={<Help />} />
                      <Route path="job-work" element={<JobWork />} />
                      <Route path="lorry-receipt" element={<LorryReceipt />} />
                      <Route path="lr" element={<LRPage />} />
                      <Route path="work-entry" element={<WorkPlusJobEntryForm />} />
                      <Route path="masters" element={<WorkPlusMastersLanding />} />
                      <Route path="reports" element={<WorkPlusReportsLanding />} />
                      <Route path="workplus/reports" element={<WorkPlusReportsLanding />} />
                      <Route path="workplus/reports/dashboard/job-entry" element={<JobEntryDashboard />} />
                      <Route path="hr" element={<HRLanding />} />
                      <Route path="hr/attendance" element={<AttendancePage />} />
                      <Route path="hr/leave" element={<LeavePage />} />
                      <Route path="hr/masters" element={<HRMastersLanding />} />
                      <Route path="hr/reports" element={<HRReportsLanding />} />
                      <Route path="hr/reports/dashboard/attendance" element={<HRAttendanceDashboard />} />
                      <Route path="hr/reports/dashboard/lms" element={<HRLMSDashboard />} />
                    </Route>
                  </Routes>
                </Router>
              </ErrorBoundary>
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={8000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
                  {globalError || 'An unexpected error occurred'}
                </Alert>
              </Snackbar>
            </ConfirmProvider>
          </LoadingProvider>
        </LocalizationProvider>
      </ThemeContextProvider>
    </Provider>
  );
};

export default App;
