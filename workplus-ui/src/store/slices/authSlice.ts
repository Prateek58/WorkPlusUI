import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../Code/Common/config';

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunks for authentication
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('🔄 Attempting login to:', `${API_URL}/Auth/login`);
      console.log('🔄 Credentials:', { username: credentials.username, password: '***' });
      
      const response = await axios.post(`${API_URL}/Auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });
      
      console.log('✅ Login successful:', response.data);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      if (error.code === 'ECONNABORTED') {
        return rejectWithValue('Request timeout - please try again');
      }
      
      if (error.response) {
        console.error('❌ Response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        return rejectWithValue(error.response?.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error('❌ Request error (no response):', error.request);
        return rejectWithValue('No response from server - check your connection');
      } else {
        console.error('❌ Unknown error:', error.message);
        return rejectWithValue(error.message || 'Login failed');
      }
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/Auth/register`, userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      // Notify theme provider about authentication change
      window.dispatchEvent(new CustomEvent('authStateChanged'));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        // Notify theme provider about authentication change
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        // Notify theme provider about authentication change
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 