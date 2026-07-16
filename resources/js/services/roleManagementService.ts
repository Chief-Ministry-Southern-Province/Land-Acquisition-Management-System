import api from './api';

export interface Role {
  id: string;
  role_name: string;
  description: string;
}

export interface RoleResponse {
  message?: string;
  errors?: Record<string, string[]>;
  role?: any;
}

// Map backend role model to frontend Role type
const mapFromBackend = (data: any): Role => ({
  id: String(data.id),
  role_name: data.role_name,
  description: data.description,
});

// Map frontend role to backend
const mapToBackend = (data: Omit<Role, 'id'>): any => ({
  role_name: data.role_name,
  description: data.description,
});

/**
 * Fetches all roles from the database using the axios instance.
 *
 * @returns A promise resolving to an array of roles.
 */
export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get<{ roles: Role[] }>('/api/roles');
  const roles = response.data.roles || [];

  return roles.map(mapFromBackend);
};

export const createRole = async (data: Omit<Role, 'id'>): Promise<Role> => {
  const response = await api.post<RoleResponse>(
    '/api/roles',
    mapToBackend(data),
  );

  return mapFromBackend(response.data.role);
};

export const updateRole = async (
  id: string,
  data: Omit<Role, 'id'>,
): Promise<Role> => {
  const response = await api.put<RoleResponse>(
    `/api/roles/${id}`,
    mapToBackend(data),
  );

  return mapFromBackend(response.data.role);
};

export const deleteRole = async (id: string): Promise<void> => {
  await api.delete<RoleResponse>(`/api/roles/${id}`);
};
