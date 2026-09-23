import axios from 'axios';
import { API_URL } from '../../Common/config';

// Create a dedicated axios instance for Archive services
// We strip '/api' from the base URL because the service calls include it
// e.g. API_URL is '.../api', calls are '/api/Archive/...'
// So baseURL should be just the host.
const baseURL = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
