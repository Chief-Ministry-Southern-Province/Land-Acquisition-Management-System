import api from './api';
import type { Document } from './projectsManagementService';

export const uploadDocument = async (
  file: File,
  userId: string,
  projectId: string | null,
  category: string,
  landParcelId: string | null = null,
  propertyOwnerId: string | null = null,
  onUploadProgress?: (progressEvent: any) => void,
): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);

  if (projectId && projectId !== 'null' && projectId !== 'undefined') {
    formData.append('project_id', projectId);
  }

  if (landParcelId && landParcelId !== 'null' && landParcelId !== 'undefined') {
    formData.append('land_parcel_id', landParcelId);
  }

  if (propertyOwnerId && propertyOwnerId !== 'null' && propertyOwnerId !== 'undefined') {
    formData.append('property_owner_id', propertyOwnerId);
  }

  formData.append('document_category', category);

  const response = await api.post('/api/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data.document;
};

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get('/api/documents');

  return response.data.documents;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/api/documents/${id}`);
};

export const downloadDocument = async (
  id: string,
  originalFilename: string,
): Promise<void> => {
  const response = await api.get(`/api/documents/${id}/download`, {
    responseType: 'blob',
  });

  const contentType = response.headers['content-type'];
  const blob = new Blob([response.data], {
    type:
      typeof contentType === 'string'
        ? contentType
        : 'application/octet-stream',
  });
  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.setAttribute('download', originalFilename);
  window.document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
