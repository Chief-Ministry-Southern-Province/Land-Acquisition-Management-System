import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export interface ReportQueryParams {
  type: string;
  project_id?: string;
  district?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export const REPORTS_QUERY_KEY = 'reports';

export function useReportsQuery(params: ReportQueryParams) {
  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await api.get('/api/reports', { params });

      return response.data;
    },
    enabled: Boolean(params.type),
  });
}
