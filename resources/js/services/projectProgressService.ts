import api from './api';

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
