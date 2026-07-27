import api from './api';

export interface PendingApprovalsResponse {
  projects: any[];
  land_parcels: any[];
  compensations: any[];
}

export const getPendingApprovals =
  async (): Promise<PendingApprovalsResponse> => {
    const response = await api.get('/api/hob/pending-approvals');

    return response.data;
  };

export const approveCase = async (
  type: 'project' | 'parcel' | 'compensation',
  id: string,
): Promise<any> => {
  const response = await api.post(`/api/hob/approvals/${type}/${id}/approve`);

  return response.data;
};

export const queryCase = async (
  type: 'project' | 'parcel' | 'compensation',
  id: string,
  comment: string,
): Promise<any> => {
  const response = await api.post(`/api/hob/approvals/${type}/${id}/query`, {
    comment,
  });

  return response.data;
};

export const rejectCase = async (
  type: 'project' | 'parcel' | 'compensation',
  id: string,
  comment: string,
): Promise<any> => {
  const response = await api.post(`/api/hob/approvals/${type}/${id}/reject`, {
    comment,
  });

  return response.data;
};
