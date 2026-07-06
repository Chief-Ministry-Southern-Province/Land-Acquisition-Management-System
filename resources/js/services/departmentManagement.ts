import api from './api';

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  email: string;
  phone: string;
  userCount: number;
  status: 'active' | 'inactive';
}

// Map backend department model to frontend Department type
const mapFromBackend = (data: any): Department => ({
  id: String(data.id),
  name: data.department_name,
  code: data.dep_code,
  head: data.dep_head,
  email: data.email || '',
  phone: data.phone || '',
  userCount: data.staff || 0,
  status: data.status ? 'active' : 'inactive',
});

// Map frontend Department data to backend format
const mapToBackend = (data: Omit<Department, 'id'>) => ({
  department_name: data.name,
  dep_code: data.code,
  dep_head: data.head,
  email: data.email,
  phone: data.phone,
  status: data.status === 'active',
  staff: Number(data.userCount) || 0,
});

export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get('/api/departments');
  const departments = response.data.departments || [];
  
  return departments.map(mapFromBackend);
};

export const getDepartment = async (id: string): Promise<Department> => {
  const response = await api.get(`/api/departments/${id}`);
  
  return mapFromBackend(response.data.department);
};

export const createDepartment = async (
  data: Omit<Department, 'id'>,
): Promise<Department> => {
  const response = await api.post('/api/departments', mapToBackend(data));
  
  return mapFromBackend(response.data.department);
};

export const updateDepartment = async (
  id: string,
  data: Omit<Department, 'id'>,
): Promise<Department> => {
  const response = await api.put(`/api/departments/${id}`, mapToBackend(data));

  return mapFromBackend(response.data.department);
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await api.delete(`/api/departments/${id}`);
};
