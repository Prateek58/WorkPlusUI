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
import Login from './Code/Common/pages/Login';
import Register from './Code/Common/pages/Register';
import Dashboard from './Code/Common/pages/Dashboard';
import Profile from './Code/Common/pages/Profile';
import Settings from './Code/Common/pages/Settings';
import Help from './Code/Common/pages/Help';
import JobWork from './Code/Archive/pages/JobWork';
import WorkPlusJobEntryForm from './Code/WorkPlus/pages/WorkPlusJobEntryForm';
import WorkPlusMasters from './Code/WorkPlus/pages/WorkPlusMasters';
import PrivateRoute from './Code/Common/components/PrivateRoute';
import { ThemeContextProvider } from './theme/ThemeProvider';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeContextProvider>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <LoadingProvider>
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
                  <Route path="masters" element={<WorkPlusMasters />} />
                </Route>
              </Routes>
            </Router>
          </LoadingProvider>
        </LocalizationProvider>
      </ThemeContextProvider>
    </Provider>
  );
};

export default App;
