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

export interface JobEntryFilter {
  startDate?: string;
  endDate?: string;
  entryType?: string;
  jobId?: number;
  workerId?: number;
  groupId?: number;
  isPostLunch?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface JobOption {
  id: number;
  name: string;
  jobType: string;
}

export interface WorkerOption {
  id: number;
  fullName: string;
  workerId: string;
}

export interface GroupOption {
  id: number;
  groupName: string;
}

export interface FilterOptions {
  jobs: JobOption[];
  workers: WorkerOption[];
  groups: GroupOption[];
  entryTypes: string[];
}

export interface ColumnDefinition {
  key: string;
  label: string;
  isDefault: boolean;
  dataType: string;
}

export interface ExportColumns {
  availableColumns: ColumnDefinition[];
}

export interface ExportRequest {
  filter: JobEntryFilter;
  selectedColumns: string[];
  exportType: 'excel' | 'csv' | 'pdf';
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

const getFilteredJobEntriesReport = async (filter: JobEntryFilter): Promise<PaginatedResponse> => {
  try {
    const response = await axios.get(`${API_URL}/WorkPlusReports/JobEntries`, {
      params: filter,
      headers: authHeader()
    });
    
    return convertToCamelCase(response.data);
  } catch (error) {
    console.error('Error fetching filtered job entries report:', error);
    throw error;
  }
};

const getFilterOptions = async (): Promise<FilterOptions> => {
  try {
    const response = await axios.get(`${API_URL}/WorkPlusReports/JobEntries/FilterOptions`, {
      headers: authHeader()
    });
    
    return convertToCamelCase(response.data);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};

const getExportColumns = async (): Promise<ExportColumns> => {
  try {
    const response = await axios.get(`${API_URL}/WorkPlusReports/JobEntries/ExportColumns`, {
      headers: authHeader()
    });
    
    return convertToCamelCase(response.data);
  } catch (error) {
    console.error('Error fetching export columns:', error);
    throw error;
  }
};

const exportJobEntries = async (request: ExportRequest): Promise<Blob> => {
  try {
    const response = await axios.post(`${API_URL}/WorkPlusReports/JobEntries/Export`, request, {
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting job entries:', error);
    throw error;
  }
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const jobEntryReportService = {
  getJobEntriesReport,
  getFilteredJobEntriesReport,
  getFilterOptions,
  getExportColumns,
  exportJobEntries,
  downloadFile
};

export default jobEntryReportService; 