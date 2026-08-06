import api from './api';
import type { Document } from './projectsManagementService';

export interface LandValuation {
  id: string;
  land_parcel_id: string;
  valuer_name: string;
  valuation_date: string;
  valuation_ref_number: string;
  land_value: number;
  crop_value: number;
  structure_value: number;
  total_valuation: number;
  status: 'pending' | 'approved' | 'rejected';
  document_id: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  document?: Document;
}

export const getValuations = async (
  landParcelId?: string,
): Promise<LandValuation[]> => {
  const response = await api.get('/api/land-valuations', {
    params: landParcelId ? { land_parcel_id: landParcelId } : {},
  });

  return response.data.land_valuations;
};

export const getValuation = async (id: string): Promise<LandValuation> => {
  const response = await api.get(`/api/land-valuations/${id}`);

  return response.data.valuation;
};

export const createValuation = async (
  data: Omit<
    LandValuation,
    'id' | 'total_valuation' | 'created_at' | 'updated_at'
  >,
): Promise<LandValuation> => {
  const response = await api.post('/api/land-valuations', data);

  return response.data.valuation;
};

export const updateValuation = async (
  id: string,
  data: Omit<
    LandValuation,
    'id' | 'total_valuation' | 'created_at' | 'updated_at'
  >,
): Promise<LandValuation> => {
  const response = await api.put(`/api/land-valuations/${id}`, data);

  return response.data.valuation;
};

export const deleteValuation = async (id: string): Promise<void> => {
  await api.delete(`/api/land-valuations/${id}`);
};
