import api from './api';
import type { LandParcel } from './landParcelManagementService';
import type { Payment } from './paymentService';
import type { PropertyOwner } from './propertyOwnerManagement';

export interface Compensation {
  id: string | number;
  owner_id: string | number;
  land_parcel_id: string | number;
  compensation_id: string;
  amount: number | string;
  approved_date: string;
  payment_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  owner?: PropertyOwner;
  landParcel?: LandParcel;
  payments?: Payment[];
}

export interface CompensationPayload {
  owner_id: string | number;
  land_parcel_id: string | number;
  compensation_id: string;
  amount: number;
  approved_date: string;
  payment_date: string;
  status: string;
}

export const getCompensations = async (): Promise<Compensation[]> => {
  const response = await api.get('/api/compensation');

  return response.data.compensations;
};

export const getCompensation = async (
  id: string | number,
): Promise<Compensation> => {
  const response = await api.get(`/api/compensation/${id}`);

  return response.data.compensation;
};

export const createCompensation = async (
  data: CompensationPayload,
): Promise<Compensation> => {
  const response = await api.post('/api/compensation', data);

  return response.data.compensation;
};

export const updateCompensation = async (
  id: string | number,
  data: CompensationPayload,
): Promise<Compensation> => {
  const response = await api.put(`/api/compensation/${id}`, data);

  return response.data.compensation;
};

export const deleteCompensation = async (
  id: string | number,
): Promise<void> => {
  await api.delete(`/api/compensation/${id}`);
};
