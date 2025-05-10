import axios from 'axios';

// Set base URL and headers
const API_URL = 'https://localhost:7160/api';
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
  incentiveAmount?: number | null;
  remarks?: string | null;
  createdBy?: number;
}

export interface JobEntryResponse {
  entryId: number;
  jobName: string;
  workerName?: string;
  groupName?: string;
  expectedHours?: number;
  hoursTaken?: number;
  itemsCompleted?: number;
  incentiveAmount?: number;
  totalAmount?: number;
  createdAt?: string;
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
    // Convert data to PascalCase for backend
    const pascalCaseData = convertToPascalCase(jobEntry);
    console.log('Sending job entry data:', pascalCaseData);
    
    const response = await axios.post(`${API_URL}/JobEntry`, pascalCaseData, {
      headers: authHeader()
    });
    
    console.log('Job entry save response:', response.data);
    return convertToCamelCase(response.data);
  } catch (error) {
    console.error('Error saving job entry:', error);
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
  deleteJobEntry,
  getWorkers
};

export default jobEntryService; 