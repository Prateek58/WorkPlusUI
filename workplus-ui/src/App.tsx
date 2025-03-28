import React from 'react';
import './styles/global.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import JobWork from './pages/JobWork';
import PrivateRoute from './components/PrivateRoute';
import { ThemeContextProvider } from './theme/ThemeProvider';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeContextProvider>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              </Route>
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeContextProvider>
    </Provider>
  );
};

export default App;
