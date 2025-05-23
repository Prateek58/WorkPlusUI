import axios from 'axios';
import { API_URL } from '../../../../Common/config';
import { useApi } from '../../../../Common/hooks/useApi';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  createdAt?: string;
}

export const useRoleService = () => {
  const { callApi } = useApi();

  const getRoles = async (): Promise<Role[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/roles`).then(res => res.data),
      { loadingMessage: 'Loading roles...' }
    );
  };

  const getRole = async (id: number): Promise<Role> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/roles/${id}`).then(res => res.data),
      { loadingMessage: 'Loading role details...' }
    );
  };

  return {
    getRoles,
    getRole
  };
}; 