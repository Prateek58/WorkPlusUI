import axios from 'axios';
import { API_URL } from '../../../../Common/config';
import { useApi } from '../../../../Common/hooks/useApi';

export interface GroupMember {
  id: number;
  groupId: number;
  workerId: number;
  groupName?: string;
  workerName?: string;
}

export interface GroupMemberCreate {
  groupId: number;
  workerId: number;
}

export interface Worker {
  workerId: number;
  fullName: string;
  isActive?: boolean;
}

export interface JobGroup {
  groupId: number;
  groupName: string;
  minWorkers: number;
  maxWorkers: number;
}

export const useGroupMemberService = () => {
  const { callApi } = useApi();

  const getGroupMembers = async (): Promise<GroupMember[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/group-members`).then(res => res.data),
      { loadingMessage: 'Loading group members...' }
    );
  };

  const getGroupMembersByGroup = async (groupId: number): Promise<GroupMember[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/job-groups/${groupId}/members`).then(res => res.data),
      { loadingMessage: 'Loading group members...' }
    );
  };

  const getGroupMember = async (id: number): Promise<GroupMember> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/group-members/${id}`).then(res => res.data),
      { loadingMessage: 'Loading group member details...' }
    );
  };

  const createGroupMember = async (groupMember: GroupMemberCreate): Promise<GroupMember> => {
    return callApi(
      () => axios.post(`${API_URL}/MasterData/group-members`, groupMember).then(res => res.data),
      { loadingMessage: 'Adding worker to group...' }
    );
  };

  const deleteGroupMember = async (id: number): Promise<void> => {
    return callApi(
      () => axios.delete(`${API_URL}/MasterData/group-members/${id}`).then(res => res.data),
      { loadingMessage: 'Removing worker from group...' }
    );
  };

  // Get all job groups for dropdown
  const getJobGroups = async (): Promise<JobGroup[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/job-groups`).then(res => res.data),
      { loadingMessage: 'Loading job groups...' }
    );
  };

  // Get all workers for dropdown
  const getWorkers = async (): Promise<Worker[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/workers`).then(res => res.data),
      { loadingMessage: 'Loading workers...' }
    );
  };

  return {
    getGroupMembers,
    getGroupMembersByGroup,
    getGroupMember,
    createGroupMember,
    deleteGroupMember,
    getJobGroups,
    getWorkers
  };
}; 