import axios from 'axios';
import { API_URL } from '../../../../Common/config';

// Types
export interface JobEntryReport {
  entryId: number;
  jobName: string;
  workerName?: string;
  groupName?: string;
  entryType?: string;
  expectedHours?: number;
  hoursTaken?: number;
  itemsCompleted?: number;
  ratePerJob?: number;
  productiveHours?: number;
  extraHours?: number;
  underperformanceHours?: number;
  incentiveAmount?: number;
  totalAmount?: number;
  isPostLunch?: boolean;
  remarks?: string;
  createdAt?: string;
}

export interface PaginatedResponse {
  items: JobEntryReport[];
  totalCount: number;
}

// Add auth token to requests
const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Function to convert property names
const convertToCamelCase = (data: any): any => {
  if (data === null || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertToCamelCase(item));
  }
  
  const result: {[key: string]: any} = {};
  
  for (const key in data) {
    // Convert first letter to lowercase
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    result[camelKey] = convertToCamelCase(data[key]);
  }
  
  return result;
};

// Service methods
const getJobEntriesReport = async (pageNumber: number, pageSize: number): Promise<PaginatedResponse> => {
  try {
    const response = await axios.get(`${API_URL}/WorkPlusReports/JobEntries`, {
      params: { pageNumber, pageSize },
      headers: authHeader()
    });
    
    return convertToCamelCase(response.data);
  } catch (error) {
    console.error('Error fetching job entries report:', error);
    throw error;
  }
};

const jobEntryReportService = {
  getJobEntriesReport
};

export default jobEntryReportService; 