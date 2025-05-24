import React from 'react';
import './styles/global.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
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
import PrivateRoute from './Code/Common/components/PrivateRoute';
import { ThemeContextProvider } from './theme/ThemeProvider';
import WorkPlusJobEntryForm from './Code/MainWorkPlus/components/forms/workplus-job-entry/WorkPlusJobEntryForm';
import WorkPlusMastersLanding from './Code/MainWorkPlus/pages/WorkPlusMastersLanding';
import WorkPlusReportsLanding from './Code/MainWorkPlus/pages/WorkPlusReportsLanding';
import JobEntryDashboard from './Code/MainWorkPlus/components/reports/dashboard-job-entry/JobEntryDashboard';
import LMSLanding from './Code/LMS/pages/LMSLanding';
import AttendanceLanding from './Code/Attendance/pages/AttendanceLanding';

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
                    <Route path="work-entry" element={<WorkPlusJobEntryForm />} />
                    <Route path="masters" element={<WorkPlusMastersLanding />} />
                    <Route path="reports" element={<WorkPlusReportsLanding />} />
                    <Route path="workplus/reports" element={<WorkPlusReportsLanding />} />
                    <Route path="workplus/reports/dashboard/job-entry" element={<JobEntryDashboard />} />
                    <Route path="lms" element={<LMSLanding />} />
                    <Route path="attendance" element={<AttendanceLanding />} />
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
