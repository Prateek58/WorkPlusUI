import axios from 'axios';
import { API_URL } from '../../../config';
import { useApi } from '../../../../Common/hooks/useApi';

export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface UserRoles {
  userId: number;
  username: string;
  assignedRoles: Role[];
  availableRoles: Role[];
}

export interface UserRoleAssignment {
  userId: number;
  roleIds: number[];
}

export const useUserRoleService = () => {
  const { callApi } = useApi();

  const getAllRoles = async (): Promise<Role[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/roles`).then(res => res.data),
      { loadingMessage: 'Loading roles...' }
    );
  };

  const getUserRoles = async (userId: number): Promise<UserRoles> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/users/${userId}/roles`).then(res => res.data),
      { loadingMessage: 'Loading user roles...' }
    );
  };

  const assignUserRoles = async (userId: number, roleIds: number[]): Promise<void> => {
    const assignment: UserRoleAssignment = {
      userId,
      roleIds
    };
    
    return callApi(
      () => axios.post(`${API_URL}/MasterData/users/${userId}/roles`, assignment),
      { loadingMessage: 'Saving user roles...' }
    );
  };

  return {
    getAllRoles,
    getUserRoles,
    assignUserRoles
  };
}; 