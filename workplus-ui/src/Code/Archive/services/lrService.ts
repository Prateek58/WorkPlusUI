import axios from 'axios';
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
    const response = await axios.get('/api/LR/list', { params });
    return response.data;
  },

  getLRSummary: async (filter: LRFilter): Promise<LRSummary> => {
    const params = {
      ...filter,
      startDate: filter.startDate?.format('YYYY-MM-DD'),
      endDate: filter.endDate?.format('YYYY-MM-DD'),
    };
    const response = await axios.get('/api/LR/summary', { params });
    return response.data;
  }
};

export default lrService; 