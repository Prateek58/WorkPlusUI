import axios from 'axios';
import { API_URL } from '../../../config';
import { useApi } from '../../../../Common/hooks/useApi';

export interface JobType {
  jobTypeId: number;
  typeName: string;
}

export const useJobTypeService = () => {
  const { callApi } = useApi();

  const getJobTypes = async (): Promise<JobType[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/job-types/all`).then(res => res.data),
      { loadingMessage: 'Loading job types...' }
    );
  };

  const getJobType = async (id: number): Promise<JobType> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/job-types/${id}`).then(res => res.data),
      { loadingMessage: 'Loading job type details...' }
    );
  };

  return {
    getJobTypes,
    getJobType
  };
}; 