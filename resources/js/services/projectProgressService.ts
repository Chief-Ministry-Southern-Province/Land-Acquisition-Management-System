import api from './api';

export interface ChecklistReminder {
  id: number;
  project_id: number;
  milestone_months: number;
  status:
    | 'pending_do'
    | 'second_reminder_sent'
    | 'escalated_to_sas'
    | 'resolved';
  first_reminder_sent_at?: string | null;
  second_reminder_sent_at?: string | null;
  escalated_to_sas_at?: string | null;
  progress_updated_at?: string | null;
  deadline_date?: string | null;
  days_remaining?: number | null;
  is_overdue?: boolean;
}

export interface ProjectProgressResponse {
  message: string;
  project_id: number;
  progress?: {
    id: number;
    project_id: number;
    stages: any[];
    total_items: number;
    completed_items: number;
    progress_percentage: number;
    updated_by?: number;
    last_saved_at?: string;
    updated_by_user?: {
      id: number;
      name: string;
    };
  } | null;
  reminder?: ChecklistReminder | null;
}

/**
 * Get acquisition case progress from backend.
 */
export async function getProjectProgress(
  projectId: string | number,
): Promise<ProjectProgressResponse> {
  const response = await api.get<ProjectProgressResponse>(
    `/api/projects/${projectId}/progress`,
  );

  return response.data;
}

/**
 * Save/Update acquisition case progress (DO Role authorized only).
 */
export async function saveProjectProgress(
  projectId: string | number,
  stages: any[],
): Promise<ProjectProgressResponse> {
  const response = await api.post<ProjectProgressResponse>(
    `/api/projects/${projectId}/progress`,
    { stages },
  );

  return response.data;
}
