import api from './api';
import dayjs from 'dayjs';

interface LRFilter {
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  unitId: string;
  partyId: string;
  transporterId: string;
  cityId: string;
  billNo: string;
  lrNo: string;
  truckNo: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface LRResponse {
  data: any[];
  total: number;
}

interface LRSummary {
  totalEntries: number;
  totalParties: number;
  totalTransporters: number;
  totalCities: number;
  totalLrAmount: number;
  totalFreight: number;
  totalOtherExpenses: number;
  totalWeight: number;
  totalQuantity: number;
  totalRecords: number;
}

const lrService = {
  getLREntries: async (filter: LRFilter): Promise<LRResponse> => {
    const params = {
      ...filter,
      startDate: filter.startDate?.format('YYYY-MM-DD'),
      endDate: filter.endDate?.format('YYYY-MM-DD'),
    };
    const response = await api.get('/api/Archive/LR/list', { params });
    return response.data;
  },

  getLRSummary: async (filter: LRFilter): Promise<LRSummary> => {
    const params = {
      ...filter,
      startDate: filter.startDate?.format('YYYY-MM-DD'),
      endDate: filter.endDate?.format('YYYY-MM-DD'),
    };
    const response = await api.get('/api/Archive/LR/summary', { params });
    return response.data;
  },

  getUnits: async () => {
    const response = await api.get('/api/Archive/LR/units');
    return response.data;
  },

  getParties: async () => {
    const response = await api.get('/api/Archive/LR/parties');
    return response.data;
  },

  getTransporters: async () => {
    const response = await api.get('/api/Archive/LR/transporters');
    return response.data;
  },

  getCities: async () => {
    const response = await api.get('/api/Archive/LR/cities');
    return response.data;
  },

  searchParties: async (search: string) => {
    const response = await api.get('/api/Archive/LR/parties/search', { params: { search } });
    return response.data;
  }
};

export default lrService;
