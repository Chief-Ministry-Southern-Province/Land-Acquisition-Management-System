import api from './api';

export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/users');

    return response.data;
  } catch (err: any) {
    console.log(err); //REMOVE: debug only

    throw new Error('Failed to fetch users');
  }
};

export const updateUser = async (id: number, data: any) => {
  try {
    const response = await api.put(`/api/users/${id}`, data);

    return response.data;
  } catch (err: any) {
    console.log(err); //REMOVE: debug only

    throw new Error('Failed to update user');
  }
};

export const deleteUser = async (id: number) => {
  try {
    const response = await api.delete(`/api/users/${id}`);

    return response.data;
  } catch (err: any) {
    console.log(err); //REMOVE: debug only

    throw new Error('Failed to delete user');
  }
};
