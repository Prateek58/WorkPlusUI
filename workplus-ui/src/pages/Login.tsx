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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
} from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import type { RootState } from '../store/store';
import logoTransparent from '../assets/logo-trans.png';
import '../styles/background.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [credentials, setCredentials] = useState({
    username: 'admintest',
    password: 'Admin123',
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
          sx={{
            width: '100%',
            maxWidth: '440px',
            mx: 'auto',
            p: 4,
            bgcolor: '#ffffff',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
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
            <Typography variant="body1" sx={{ color: '#666666' }} gutterBottom>
              Welcome back
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
              Login to WorkPlus
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
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
                    <EmailIcon sx={{ color: '#666666' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  color: '#1a1a1a',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: 1,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666666',
                  '&.Mui-focused': {
                    color: '#1976d2',
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '& .MuiOutlinedInput-input:-webkit-autofill': {
                  '-webkit-box-shadow': '0 0 0 100px #ffffff inset !important',
                  '-webkit-text-fill-color': '#1a1a1a !important',
                  'caret-color': '#1a1a1a !important',
                },
              }}
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
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#666666' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  color: '#1a1a1a',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                    borderWidth: 1,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#666666',
                  '&.Mui-focused': {
                    color: '#1976d2',
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '& .MuiOutlinedInput-input:-webkit-autofill': {
                  '-webkit-box-shadow': '0 0 0 100px #ffffff inset !important',
                  '-webkit-text-fill-color': '#1a1a1a !important',
                  'caret-color': '#1a1a1a !important',
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                bgcolor: '#1976d2',
                '&:hover': {
                  bgcolor: '#1565c0',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            {/* Social Login Section */}
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                or sign in with
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
              >
                <IconButton 
                  sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2,
                    p: 1.5,
                    color: '#4267B2',
                    bgcolor: '#ffffff',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton 
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    p: 1.5,
                    color: '#DB4437',
                    bgcolor: '#ffffff',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  <GoogleIcon />
                </IconButton>
                <IconButton 
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    p: 1.5,
                    color: '#000000',
                    bgcolor: '#ffffff',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  <AppleIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Sign Up Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Don't have an account?{' '}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ 
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontWeight: 500,
                    '&:hover': { 
                      textDecoration: 'underline',
                      color: '#1565c0',
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