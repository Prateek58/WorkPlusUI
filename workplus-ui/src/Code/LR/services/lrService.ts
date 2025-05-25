import axios from 'axios';
import { API_URL } from '../../Common/config';
import { useApi } from '../../Common/hooks/useApi';

// Types matching backend DTOs
export interface LREntry {
  entryId: number;
  unitId: number;
  partyId: number;
  transporterId: number;
  lrNo: string;
  lrDate: string;
  billDate?: string;
  billNo?: string;
  truckNo?: string;
  lrWeight: number;
  ratePerQtl: number;
  lrQty: number;
  lrAmount: number;
  freight: number;
  otherExpenses: number;
  totalFreight: number;
  totalQty: number;
  billAmount: number;
  originCityId?: number;
  destinationCityId?: number;
  driverName?: string;
  driverMobile?: string;
  remarks?: string;
  status: string;
  createdBy?: number;
  createdAt: string;
  updatedBy?: number;
  updatedAt: string;
  // Navigation properties
  unitName?: string;
  partyName?: string;
  transporterName?: string;
  originCityName?: string;
  destinationCityName?: string;
}

export interface CreateLREntry {
  unitId: number;
  partyId: number;
  transporterId: number;
  lrNo: string;
  lrDate: string;
  billDate?: string;
  billNo?: string;
  truckNo?: string;
  lrWeight: number;
  ratePerQtl: number;
  lrQty: number;
  lrAmount: number;
  freight: number;
  otherExpenses: number;
  totalFreight: number;
  totalQty: number;
  billAmount: number;
  originCityId?: number;
  destinationCityId?: number;
  driverName?: string;
  driverMobile?: string;
  remarks?: string;
  status: string;
}

export interface UpdateLREntry extends CreateLREntry {
  entryId: number;
}

export interface Unit {
  unitId: number;
  unitName: string;
  unitCode?: string;
  address?: string;
  cityId?: number;
  pincode?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  isActive: boolean;
  cityName?: string;
}

export interface Party {
  partyId: number;
  partyName: string;
  partyCode?: string;
  contactPerson?: string;
  address1?: string;
  address2?: string;
  cityId?: number;
  pincode?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  isActive: boolean;
  cityName?: string;
}

export interface Transporter {
  transporterId: number;
  transporterName: string;
  transporterCode?: string;
  contactPerson?: string;
  address?: string;
  cityId?: number;
  pincode?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  isActive: boolean;
  cityName?: string;
}

export interface City {
  cityId: number;
  cityName: string;
  latitude?: string;
  longitude?: string;
  state: string;
}

export interface CreateCity {
  cityName: string;
  latitude?: string;
  longitude?: string;
  state: string;
}

export interface DocumentType {
  typeId: number;
  typeName: string;
  allowedExtensions: string;
}

export interface Document {
  documentId: number;
  lrEntryId: number;
  typeId: number;
  documentName: string;
  uploadedAt: string;
  typeName?: string;
  allowedExtensions?: string;
}

export const useLRService = () => {
  const { callApi } = useApi();

  // LR Entries
  const getLREntries = async (): Promise<LREntry[]> => {
    return callApi(
      () => axios.get(`${API_URL}/LR/entries`).then(res => res.data),
      { loadingMessage: 'Loading LR entries...' }
    );
  };

  const getLREntry = async (id: number): Promise<LREntry> => {
    return callApi(
      () => axios.get(`${API_URL}/LR/entries/${id}`).then(res => res.data),
      { loadingMessage: 'Loading LR entry details...' }
    );
  };

  const createLREntry = async (entry: CreateLREntry): Promise<LREntry> => {
    return callApi(
      () => axios.post(`${API_URL}/LR/entries`, entry).then(res => res.data),
      { loadingMessage: 'Creating LR entry...' }
    );
  };

  const updateLREntry = async (entry: UpdateLREntry): Promise<void> => {
    return callApi(
      () => axios.put(`${API_URL}/LR/entries/${entry.entryId}`, entry),
      { loadingMessage: 'Updating LR entry...' }
    );
  };

  const deleteLREntry = async (id: number): Promise<void> => {
    return callApi(
      () => axios.delete(`${API_URL}/LR/entries/${id}`),
      { loadingMessage: 'Deleting LR entry...' }
    );
  };

  // Master Data
  const getUnits = async (): Promise<Unit[]> => {
    return callApi(
      () => axios.get(`${API_URL}/LR/master-data/units`).then(res => res.data),
      { loadingMessage: 'Loading units...' }
    );
  };

  const getParties = async (): Promise<Party[]> => {
    return callApi(
      () => axios.get(`${API_URL}/LR/master-data/parties`).then(res => res.data),
      { loadingMessage: 'Loading parties...' }
    );
  };

  const getTransporters = async (): Promise<Transporter[]> => {
    return callApi(
      () => axios.get(`${API_URL}/LR/master-data/transporters`).then(res => res.data),
      { loadingMessage: 'Loading transporters...' }
    );
  };

  const getCities = async (): Promise<City[]> => {
    return callApi(
      () => axios.get(`${API_URL}/LR/master-data/cities`).then(res => res.data),
      { loadingMessage: 'Loading cities...' }
    );
  };

  const searchCities = async (searchTerm: string): Promise<City[]> => {
    return callApi(
      () => axios.get(`${API_URL}/LR/master-data/cities/search?searchTerm=${encodeURIComponent(searchTerm)}`).then(res => res.data),
      { loadingMessage: 'Searching cities...' }
    );
  };

  const createCity = async (city: CreateCity): Promise<City> => {
    return callApi(
      () => axios.post(`${API_URL}/LR/master-data/cities`, city).then(res => res.data),
      { loadingMessage: 'Creating city...' }
    );
  };

  const getDocumentTypes = async (): Promise<DocumentType[]> => {
    return callApi(
      () => axios.get(`${API_URL}/LR/master-data/document-types`).then(res => res.data),
      { loadingMessage: 'Loading document types...' }
    );
  };

  // Documents
  const getDocuments = async (lrEntryId: number): Promise<Document[]> => {
    return callApi(
      () => axios.get(`${API_URL}/LR/entries/${lrEntryId}/documents`).then(res => res.data),
      { loadingMessage: 'Loading documents...' }
    );
  };

  const uploadDocument = async (lrEntryId: number, typeId: number, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('typeId', typeId.toString());
    formData.append('file', file);

    return callApi(
      () => axios.post(`${API_URL}/LR/entries/${lrEntryId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(res => res.data),
      { loadingMessage: 'Uploading document...' }
    );
  };

  const deleteDocument = async (documentId: number): Promise<void> => {
    return callApi(
      () => axios.delete(`${API_URL}/LR/documents/${documentId}`),
      { loadingMessage: 'Deleting document...' }
    );
  };

  return {
    // LR Entries
    getLREntries,
    getLREntry,
    createLREntry,
    updateLREntry,
    deleteLREntry,
    // Master Data
    getUnits,
    getParties,
    getTransporters,
    getCities,
    searchCities,
    createCity,
    getDocumentTypes,
    // Documents
    getDocuments,
    uploadDocument,
    deleteDocument
  };
}; 