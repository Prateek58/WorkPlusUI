// API URL configuration - Simple approach
const isProduction = import.meta.env.PROD;

export const API_URL = isProduction 
  ? 'https://api.workplus.layerbiz.com/api' 
  : 'https://localhost:7160/api'; 