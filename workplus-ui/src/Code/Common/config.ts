// API Configuration - Simple environment-based URL switching
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const API_URL = isProduction 
  ? 'https://api.workplus.layerbiz.com/api' 
  : 'https://localhost:7160/api';

// For debugging
if (isDevelopment) {
  console.log('🔧 API URL:', API_URL);
} 