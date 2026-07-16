import api from './api';

export interface LoginResponse {
  token?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  department_id: number;
  role_id: number;
}

export interface RegisterResponse {
  message?: string;
  errors?: Record<string, string[]>;
  user?: any;
}

/**
 * Sends a login request to the API using the axios instance.
 *
 * @param email The user's email address.
 * @param password The user's password.
 * @returns The response data containing token, message, etc.
 */
export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/login', {
    email,
    password,
  });

  return response.data;
};

/**
 * Sends a registration request to the API using the axios instance.
 *
 * @param data The registration user details.
 * @returns The response data containing message, user, etc.
 */
export const register = async (
  data: RegisterData,
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/api/auth/register', data);

  return response.data;
};
