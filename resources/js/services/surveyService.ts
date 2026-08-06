import api from './api';
import type { Document } from './projectsManagementService';

export interface LandSurvey {
  id: string;
  land_parcel_id: string;
  surveyor_name: string;
  survey_date: string;
  survey_ref_number: string;
  survey_coordinates?: any;
  surveyed_size_perches: number;
  status: 'pending' | 'completed';
  document_id: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  document?: Document;
}

export const getSurveys = async (
  landParcelId?: string,
): Promise<LandSurvey[]> => {
  const response = await api.get('/api/land-surveys', {
    params: landParcelId ? { land_parcel_id: landParcelId } : {},
  });

  return response.data.land_surveys;
};

export const getSurvey = async (id: string): Promise<LandSurvey> => {
  const response = await api.get(`/api/land-surveys/${id}`);

  return response.data.land_survey;
};

export const createSurvey = async (
  data: Omit<LandSurvey, 'id' | 'created_at' | 'updated_at'>,
): Promise<LandSurvey> => {
  const response = await api.post('/api/land-surveys', data);

  return response.data.land_survey;
};

export const updateSurvey = async (
  id: string,
  data: Omit<LandSurvey, 'id' | 'created_at' | 'updated_at'>,
): Promise<LandSurvey> => {
  const response = await api.put(`/api/land-surveys/${id}`, data);

  return response.data.land_survey;
};

export const deleteSurvey = async (id: string): Promise<void> => {
  await api.delete(`/api/land-surveys/${id}`);
};
