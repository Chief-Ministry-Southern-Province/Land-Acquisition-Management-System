import api from './api';
import type { Document } from './projectsManagementService';

export interface Payment {
  id: string;
  compensation_id: string;
  payment_reference: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  bank_name?: string;
  account_number?: string;
  status: 'completed' | 'pending' | 'failed';
  document_id: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  document?: Document;
}

export const getPayments = async (
  compensationId?: string,
): Promise<Payment[]> => {
  const response = await api.get('/api/payments', {
    params: compensationId ? { compensation_id: compensationId } : {},
  });

  return response.data.payments;
};

export const getPayment = async (id: string): Promise<Payment> => {
  const response = await api.get(`/api/payments/${id}`);

  return response.data.payment;
};

export const createPayment = async (
  data: Omit<Payment, 'id' | 'created_at' | 'updated_at'>,
): Promise<Payment> => {
  const response = await api.post('/api/payments', data);

  return response.data.payment;
};

export const updatePayment = async (
  id: string,
  data: Omit<Payment, 'id' | 'created_at' | 'updated_at'>,
): Promise<Payment> => {
  const response = await api.put(`/api/payments/${id}`, data);

  return response.data.payment;
};

export const deletePayment = async (id: string): Promise<void> => {
  await api.delete(`/api/payments/${id}`);
};
