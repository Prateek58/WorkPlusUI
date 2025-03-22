import axios from 'axios';

const getJobWorks = async (params) => {
  try {
    const apiParams = {
      startDate: params.startDate?.format('YYYY-MM-DD'),
      endDate: params.endDate?.format('YYYY-MM-DD'),
      jobId: params.jobId,
      jobWorkTypeId: params.jobWorkTypeId,
      unitId: params.unitId,
      employeeId: params.employeeId,
      jobType: params.jobType,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc'
    };

    const response = await axios.get('/api/JobWork/list', { params: apiParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching job works:', error);
    throw error;
  }
};

const getJobWorkSummary = async (params) => {
  try {
    const apiParams = {
      startDate: params.startDate?.format('YYYY-MM-DD'),
      endDate: params.endDate?.format('YYYY-MM-DD'),
      jobId: params.jobId,
      jobWorkTypeId: params.jobWorkTypeId,
      unitId: params.unitId,
      employeeId: params.employeeId,
      jobType: params.jobType
    };

    const response = await axios.get('/api/JobWork/summary', { params: apiParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching job work summary:', error);
    throw error;
  }
};

export default {
  getJobWorks,
  getJobWorkSummary
}; 