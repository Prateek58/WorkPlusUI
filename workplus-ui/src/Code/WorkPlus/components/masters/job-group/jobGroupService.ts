import axios from 'axios';
import { API_URL } from '../../../config';
import { useApi } from '../../../../Common/hooks/useApi';

export interface JobGroup {
  groupId: number;
  groupName: string;
  minWorkers: number;
  maxWorkers: number;
}

export const useJobGroupService = () => {
  const { callApi } = useApi();

  const getJobGroups = async (): Promise<JobGroup[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/job-groups`).then(res => res.data),
      { loadingMessage: 'Loading job groups...' }
    );
  };

  const getJobGroup = async (id: number): Promise<JobGroup> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/job-groups/${id}`).then(res => res.data),
      { loadingMessage: 'Loading job group details...' }
    );
  };

  const createJobGroup = async (jobGroup: JobGroup): Promise<JobGroup> => {
    return callApi(
      () => axios.post(`${API_URL}/MasterData/job-groups`, jobGroup).then(res => res.data),
      { loadingMessage: 'Creating job group...' }
    );
  };

  const updateJobGroup = async (jobGroup: JobGroup): Promise<void> => {
    return callApi(
      () => axios.put(`${API_URL}/MasterData/job-groups/${jobGroup.groupId}`, jobGroup),
      { loadingMessage: 'Updating job group...' }
    );
  };

  const deleteJobGroup = async (id: number): Promise<void> => {
    return callApi(
      () => axios.delete(`${API_URL}/MasterData/job-groups/${id}`),
      { loadingMessage: 'Deleting job group...' }
    );
  };

  return {
    getJobGroups,
    getJobGroup,
    createJobGroup,
    updateJobGroup,
    deleteJobGroup
  };
}; 