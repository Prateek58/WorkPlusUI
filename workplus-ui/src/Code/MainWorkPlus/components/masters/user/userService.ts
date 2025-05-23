import axios from 'axios';
import { API_URL } from '../../../../Common/config';
import { useApi } from '../../../../Common/hooks/useApi';

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean | null;
  createdAt: string;
  updatedAt: string;
  // For password changes
  password?: string;
}

export const useUserService = () => {
  const { callApi } = useApi();

  const getUsers = async (): Promise<User[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/users`).then(res => res.data),
      { loadingMessage: 'Loading users...' }
    );
  };

  const getUser = async (id: number): Promise<User> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/users/${id}`).then(res => res.data),
      { loadingMessage: 'Loading user details...' }
    );
  };

  const createUser = async (user: User): Promise<User> => {
    return callApi(
      () => axios.post(`${API_URL}/MasterData/users`, user).then(res => res.data),
      { loadingMessage: 'Creating user...' }
    );
  };

  const updateUser = async (user: User): Promise<void> => {
    return callApi(
      () => axios.put(`${API_URL}/MasterData/users/${user.id}`, user),
      { loadingMessage: 'Updating user...' }
    );
  };

  // Note: We'll keep this for API consistency but won't use it in the UI as per requirements
  const deleteUser = async (id: number): Promise<void> => {
    return callApi(
      () => axios.delete(`${API_URL}/MasterData/users/${id}`),
      { loadingMessage: 'Deleting user...' }
    );
  };

  return {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
  };
}; 