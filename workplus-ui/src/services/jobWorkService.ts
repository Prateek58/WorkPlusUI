import axios from 'axios';
import dayjs from 'dayjs';

interface JobWorkFilter {
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  jobId: string;
  jobWorkTypeId: string;
  unitId: string;
  employeeId: string;
  jobType: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface JobWorkResponse {
  data: any[];
  total: number;
}

interface JobWorkSummary {
  totalJobWorks: number;
  totalJobGroups: number;
  totalEmployees: number;
  totalUnits: number;
  totalHours: number;
  totalQuantity: number;
  totalAmount: number;
  totalRecords: number;
}

const jobWorkService = {
  getJobWorks: async (filter: JobWorkFilter): Promise<JobWorkResponse> => {
    const params = {
      ...filter,
      startDate: filter.startDate?.format('YYYY-MM-DD'),
      endDate: filter.endDate?.format('YYYY-MM-DD'),
    };
    const response = await axios.get('/api/JobWork/list', { params });
    return response.data;
  },

  getJobWorkSummary: async (filter: JobWorkFilter): Promise<JobWorkSummary> => {
    const params = {
      ...filter,
      startDate: filter.startDate?.format('YYYY-MM-DD'),
      endDate: filter.endDate?.format('YYYY-MM-DD'),
    };
    const response = await axios.get('/api/JobWork/summary', { params });
    return response.data;
  }
};

export default jobWorkService; 