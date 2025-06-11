import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../../store/slices/authSlice';
import type { RootState } from '../../../store/store';
import logoTransparent from '../../../assets/logo-trans.png';
import '../../../styles/background.css';
import { 
  loginFormStyles, 
  formFieldStyles, 
  alertStyles, 
  buttonStyles, 
  socialButtonStyles 
} from '../../../theme/styleUtils';

// Light mode specific form field styles
const lightFormFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1976d2', // Primary color
      borderWidth: 1,
    },
    '& .MuiOutlinedInput-input': {
      color: 'rgba(0, 0, 0, 0.87)', // Dark text for light mode
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.6)',
    '&.Mui-focused': {
      color: '#1976d2', // Primary color
    },
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(0, 0, 0, 0.54)', // Icon color for light mode
  },
};

// Light mode specific alert styles
const lightAlertStyles = {
  mb: 2,
  borderRadius: 8,
};

// Light mode specific button styles
const lightButtonStyles = {
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  backgroundColor: '#1976d2', // Primary blue color
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#1565c0', // Darker blue on hover
    boxShadow: 'none',
  },
  py: 1,
  height: '45px',
};

const Login = () => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [credentials, setCredentials] = useState({
    username: 'admintest2',
    password: 'Asdf@#1234_323'
    //username: '',
    //password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login(credentials) as any);
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  return (
    <>
      {/* Animated Background */}
      <div className="bg"></div>
      <div className="bg bg2"></div>
      <div className="bg bg3"></div>

      {/* Login Form */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          autoComplete="off"
          sx={loginFormStyles(theme)}
        >
          {/* Logo */}
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <img
              src={logoTransparent}
              alt="Logo"
              style={{
                height: 'auto',
                width: '380px',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Form Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Welcome back
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Login to WorkPlus
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={lightAlertStyles}>
              {error}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={lightFormFieldStyles}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      color="default"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={lightFormFieldStyles}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="medium"
              disabled={loading}
              sx={lightButtonStyles}
            >
              {loading ? <CircularProgress size={20} /> : 'Sign In'}
            </Button>

            {/* Social Login Section */}
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: 'rgba(0, 0, 0, 0.6)' }}>
                or sign in with
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
              >
                <IconButton sx={{ 
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 1,
                  p: 1.5,
                  bgcolor: '#ffffff',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                  color: '#4267B2' 
                }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton sx={{ 
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 1,
                  p: 1.5,
                  bgcolor: '#ffffff',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                  color: '#DB4437' 
                }}>
                  <GoogleIcon />
                </IconButton>
                <IconButton sx={{ 
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 1,
                  p: 1.5,
                  bgcolor: '#ffffff',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                  color: '#000000' 
                }}>
                  <AppleIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Sign Up Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                Don't have an account?{' '}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ 
                    color: '#1976d2', // Primary blue color
                    cursor: 'pointer',
                    fontWeight: 500,
                    '&:hover': { 
                      textDecoration: 'underline',
                      color: '#1565c0', // Darker blue on hover
                    }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Sign up
                </Typography>
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default Login; 