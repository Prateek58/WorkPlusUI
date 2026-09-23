import api from './api';
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
    const response = await api.get('/api/JobWork/list', { params });
    return response.data;
  },

  getJobWorkSummary: async (filter: JobWorkFilter): Promise<JobWorkSummary> => {
    const params = {
      ...filter,
      startDate: filter.startDate?.format('YYYY-MM-DD'),
      endDate: filter.endDate?.format('YYYY-MM-DD'),
    };
    const response = await api.get('/api/JobWork/summary', { params });
    return response.data;
  },

  getUnits: async () => {
    const response = await api.get('/api/JobWork/units');
    return response.data;
  },

  getJobWorkTypes: async () => {
    const response = await api.get('/api/JobWork/job-work-types');
    return response.data;
  },

  getJobs: async (isGroup: boolean) => {
    const response = await api.get('/api/JobWork/jobs', { params: { isGroup } });
    return response.data;
  },

  getEmployees: async (search: string) => {
    const response = await api.get('/api/JobWork/employees', { params: { search } });
    return response.data;
  },

  exportSummary: async (params: any) => {
    return api.get('/api/JobWork/export/summary', {
        params,
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json'
        }
      });
  },

  exportData: async (type: string, params: any) => {
      return api.get(`/api/JobWork/export/${type}`, {
        params,
        responseType: 'blob',
        headers: {
          'Accept': type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Type': 'application/json'
        }
      });
  }
};

export default jobWorkService;
