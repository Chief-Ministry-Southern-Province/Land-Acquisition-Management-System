import api from './api';

export const getAllUsers = async () => {
  const response = await api.get('/api/users');

  return response.data;
};

export const updateUser = async (id: number, data: any) => {
  const response = await api.put(`/api/users/${id}`, data);

  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await api.delete(`/api/users/${id}`);

  return response.data;
};
