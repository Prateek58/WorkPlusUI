import axios from 'axios';
import { API_URL } from '../../../../Common/config';
import { useApi } from '../../../../Common/hooks/useApi';

export interface Job {
  jobId: number;
  jobName: string;
  jobTypeId: number;
  ratePerItem: number | null;
  ratePerHour: number | null;
  expectedHours: number | null;
  expectedItemsPerHour: number | null;
  incentiveBonusRate: number | null;
  penaltyRate: number | null;
  incentiveType: string | null;
  createdBy: number;
  jobTypeName?: string;
  createdByName?: string;
}

export interface JobCreate {
  jobName: string;
  jobTypeId: number;
  ratePerItem: number | null;
  ratePerHour: number | null;
  expectedHours: number | null;
  expectedItemsPerHour: number | null;
  incentiveBonusRate: number | null;
  penaltyRate: number | null;
  incentiveType: string | null;
  createdBy: number;
}

export interface JobType {
  jobTypeId: number;
  jobTypeName: string;
}

export const useJobService = () => {
  const { callApi } = useApi();

  const getJobs = async (): Promise<Job[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/jobs`).then(res => res.data),
      { loadingMessage: 'Loading jobs...' }
    );
  };

  const getJob = async (id: number): Promise<Job> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/jobs/${id}`).then(res => res.data),
      { loadingMessage: 'Loading job details...' }
    );
  };

  const createJob = async (job: JobCreate): Promise<Job> => {
    return callApi(
      () => axios.post(`${API_URL}/MasterData/jobs`, job).then(res => res.data),
      { loadingMessage: 'Creating job...' }
    );
  };

  const updateJob = async (job: Job): Promise<void> => {
    return callApi(
      () => axios.put(`${API_URL}/MasterData/jobs/${job.jobId}`, job).then(res => res.data),
      { loadingMessage: 'Updating job...' }
    );
  };

  const deleteJob = async (id: number): Promise<void> => {
    return callApi(
      () => axios.delete(`${API_URL}/MasterData/jobs/${id}`).then(res => res.data),
      { loadingMessage: 'Deleting job...' }
    );
  };

  const getJobTypes = async (): Promise<JobType[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/job-types`).then(res => res.data),
      { loadingMessage: 'Loading job types...' }
    );
  };

  return {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    getJobTypes
  };
}; 