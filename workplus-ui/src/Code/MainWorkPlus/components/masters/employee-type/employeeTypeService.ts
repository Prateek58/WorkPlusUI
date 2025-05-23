import axios from 'axios';
import { API_URL } from '../../../../Common/config';
import { useApi } from '../../../../Common/hooks/useApi';

export interface EmployeeType {
  typeId: number;
  typeName: string;
}

export const useEmployeeTypeService = () => {
  const { callApi } = useApi();

  const getEmployeeTypes = async (): Promise<EmployeeType[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/employee-types`).then(res => res.data),
      { loadingMessage: 'Loading employee types...' }
    );
  };

  const getEmployeeType = async (id: number): Promise<EmployeeType> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/employee-types/${id}`).then(res => res.data),
      { loadingMessage: 'Loading employee type details...' }
    );
  };

  return {
    getEmployeeTypes,
    getEmployeeType
  };
}; 