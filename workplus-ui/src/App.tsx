import React from 'react';
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

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeContextProvider>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <LoadingProvider>
            <ConfirmProvider>
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
            </ConfirmProvider>
          </LoadingProvider>
        </LocalizationProvider>
      </ThemeContextProvider>
    </Provider>
  );
};

export default App;
