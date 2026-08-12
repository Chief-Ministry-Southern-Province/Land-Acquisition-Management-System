import api from './api';

export interface BackupFile {
  filename: string;
  size: string;
  created_at: string;
}

export const getBackups = async (): Promise<BackupFile[]> => {
  const response = await api.get<{ backups: BackupFile[] }>('/api/backups');

  return response.data.backups || [];
};

export const createBackup = async (): Promise<{
  message: string;
  filename: string;
}> => {
  const response = await api.post<{ message: string; filename: string }>(
    '/api/backups',
  );

  return response.data;
};

export const downloadBackup = async (filename: string): Promise<void> => {
  const response = await api.get(`/api/backups/${filename}`, {
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
  link.setAttribute('download', filename);
  window.document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const deleteBackup = async (filename: string): Promise<void> => {
  await api.delete(`/api/backups/${filename}`);
};

export const clearCache = async (): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/api/clear-cache');

  return response.data;
};
