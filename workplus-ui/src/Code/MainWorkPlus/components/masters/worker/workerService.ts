import axios from 'axios';
import { API_URL } from '../../../../Common/config';
import { useApi } from '../../../../Common/hooks/useApi';

export interface Worker {
  workerId: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  motherName?: string;
  gender?: string;
  birthPlace?: string;
  birthCity?: string;
  bloodGroup?: string;
  ageAtJoining?: number;
  phone?: string;
  email?: string;
  presentAddress1?: string;
  presentAddress2?: string;
  presentAddress3?: string;
  presentCity?: string;
  presentState?: string;
  permanentAddress1?: string;
  permanentAddress2?: string;
  permanentAddress3?: string;
  permanentCity?: string;
  permanentState?: string;
  dateOfJoining?: string | null;
  dateOfLeaving?: string | null;
  referenceName?: string;
  remarks?: string;
  esiApplicable?: boolean;
  esiLocation?: string;
  pfNo?: string;
  nomineeName?: string;
  nomineeRelation?: string;
  nomineeAge?: number;
  pan?: string;
  bankAccountNo?: string;
  bankName?: string;
  bankLocation?: string;
  bankRtgsCode?: string;
  typeId?: number;
  userId?: number | null;
  isActive?: boolean;
}

export const useWorkerService = () => {
  const { callApi } = useApi();

  const getWorkers = async (): Promise<Worker[]> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/workers`).then(res => res.data),
      { loadingMessage: 'Loading workers...' }
    );
  };

  const getWorker = async (id: number): Promise<Worker> => {
    return callApi(
      () => axios.get(`${API_URL}/MasterData/workers/${id}`).then(res => res.data),
      { loadingMessage: 'Loading worker details...' }
    );
  };

  const createWorker = async (worker: Worker): Promise<Worker> => {
    return callApi(
      () => axios.post(`${API_URL}/MasterData/workers`, worker).then(res => res.data),
      { loadingMessage: 'Creating worker...' }
    );
  };

  const updateWorker = async (worker: Worker): Promise<void> => {
    return callApi(
      () => axios.put(`${API_URL}/MasterData/workers/${worker.workerId}`, worker),
      { loadingMessage: 'Updating worker...' }
    );
  };

  const deleteWorker = async (id: number): Promise<void> => {
    return callApi(
      () => axios.delete(`${API_URL}/MasterData/workers/${id}`),
      { loadingMessage: 'Deleting worker...' }
    );
  };

  return {
    getWorkers,
    getWorker,
    createWorker,
    updateWorker,
    deleteWorker
  };
}; 