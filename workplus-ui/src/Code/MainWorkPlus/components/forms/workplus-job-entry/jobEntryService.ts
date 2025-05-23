import axios from 'axios';
import { API_URL } from '../../../../Common/config';



// Set headers
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Types
export interface Worker {
  workerId: number;
  fullName: string;
}

export interface Job {
  jobId: number;
  jobName: string;
  ratePerItem: number | null;
  ratePerHour: number | null;
  expectedHours: number | null;
  expectedItemsPerHour: number | null;
  incentiveBonusRate: number | null;
  penaltyRate: number | null;
  incentiveType: string | null;
}

export interface JobGroup {
  groupId: number;
  groupName: string;
}

export interface JobEntryMasterData {
  workers: Worker[];
  jobs: Job[];
  jobGroups: JobGroup[];
}

export interface JobEntry {
  entryId?: number;
  jobId: number;
  entryType: 'Individual' | 'Group';
  workerId?: number | null;
  groupId?: number | null;
  isPostLunch: boolean;
  itemsCompleted?: number | null;
  hoursTaken?: number | null;
  ratePerJob: number;
  expectedHours?: number | null;
  productiveHours?: number | null;
  extraHours?: number | null;
  underperformanceHours?: number | null;
  incentiveAmount?: number | null;
  totalAmount?: number | null;
  remarks?: string | null;
  isFinalized?: boolean | null;
  createdBy?: number;
  createdAt?: string | null;
}

export interface JobEntryResponse {
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

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

// Simplified job entry DTO that matches the backend CreateJobEntryDTO
export interface SimpleJobEntry {
  jobId: number;
  entryType: 'Individual' | 'Group';
  workerId?: number | null;
  groupId?: number | null;
  isPostLunch: boolean;
  itemsCompleted?: number | null;
  hoursTaken?: number | null;
  ratePerJob: number;
  expectedHours?: number | null;
  remarks?: string | null;
  entryDate?: string | null;
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

// Function to convert camelCase to PascalCase for backend API
const convertToPascalCase = (data: any): any => {
  if (data === null || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertToPascalCase(item));
  }
  
  const result: {[key: string]: any} = {};
  
  for (const key in data) {
    // Convert first letter to uppercase
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    result[pascalKey] = convertToPascalCase(data[key]);
  }
  
  return result;
};

// Service methods
const getMasterData = async (): Promise<JobEntryMasterData> => {
  try {
    const response = await axios.get(`${API_URL}/GetJobEntryMasterData`, {
      headers: authHeader()
    });
    
    console.log('Original response data:', JSON.stringify(response.data, null, 2));
    
    const transformedData = convertToCamelCase(response.data);
    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));
    
    // Make sure we have correct data for debugging
    if (transformedData.jobs && transformedData.jobs.length > 0) {
      const sampleJob = transformedData.jobs[0];
      console.log('Sample job properties:', Object.keys(sampleJob));
      console.log('Sample job data:', {
        id: sampleJob.jobId,
        name: sampleJob.jobName,
        ratePerItem: sampleJob.ratePerItem,
        ratePerHour: sampleJob.ratePerHour, 
        expectedHours: sampleJob.expectedHours,
        expectedItemsPerHour: sampleJob.expectedItemsPerHour
      });
    }
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching master data:', error);
    throw error;
  }
};

const saveJobEntry = async (jobEntry: JobEntry): Promise<JobEntryResponse> => {
  try {
    // Create a simplified object for the API
    const simpleJobEntry: SimpleJobEntry = {
      jobId: jobEntry.jobId,
      entryType: jobEntry.entryType,
      workerId: jobEntry.workerId,
      groupId: jobEntry.groupId,
      isPostLunch: jobEntry.isPostLunch,
      itemsCompleted: jobEntry.itemsCompleted,
      hoursTaken: jobEntry.hoursTaken,
      ratePerJob: jobEntry.ratePerJob,
      expectedHours: jobEntry.expectedHours,
      remarks: jobEntry.remarks,
      entryDate: jobEntry.createdAt
    };

    console.log('Sending job entry data:', simpleJobEntry);
    
    // Use the main endpoint for job entry creation
    const response = await axios.post(`${API_URL}/JobEntry`, simpleJobEntry, {
      headers: {
        ...authHeader(),
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Job entry save response:', response.data);
    return convertToCamelCase(response.data);
  } catch (error) {
    console.error('Error saving job entry:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    throw error;
  }
};

const getJobEntries = async (): Promise<JobEntryResponse[]> => {
  try {
    console.log('Making API request to:', `${API_URL}/JobEntry`);
    const response = await axios.get(`${API_URL}/JobEntry`, {
      headers: authHeader()
    });
    
    console.log('Raw API response:', response);
    console.log('Response data:', response.data);
    
    const transformedData = convertToCamelCase(response.data);
    console.log('Transformed data:', transformedData);
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching job entries:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    throw error;
  }
};

const getPaginatedJobEntries = async (pageNumber: number, pageSize: number): Promise<PaginatedResponse<JobEntryResponse>> => {
  try {
    const response = await axios.get(`${API_URL}/JobEntry/paginated`, {
      params: { pageNumber, pageSize },
      headers: authHeader()
    });
    
    const transformedData = convertToCamelCase(response.data);
    return transformedData;
  } catch (error) {
    console.error('Error fetching paginated job entries:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    throw error;
  }
};

const deleteJobEntry = async (entryId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/JobEntry/${entryId}`, {
      headers: authHeader()
    });
    console.log(`Successfully deleted job entry with ID: ${entryId}`);
  } catch (error) {
    console.error(`Error deleting job entry with ID: ${entryId}:`, error);
    throw error;
  }
};

const getWorkers = async (searchTerm: string): Promise<Worker[]> => {
  try {
    const response = await axios.get(`${API_URL}/GetWorkers?search=${searchTerm}`, {
      headers: authHeader()
    });
    return convertToCamelCase(response.data);
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

const jobEntryService = {
  getMasterData,
  saveJobEntry,
  getJobEntries,
  getPaginatedJobEntries,
  deleteJobEntry,
  getWorkers
};

export default jobEntryService; 