import api from './api';

export interface Project {
  id: string;
  projectId: string;
  name: string;
  ministry: string;
  department: string;
  projectType: string;
  acquisitionAct: string;
  district: string;
  division: string;
  purpose: string;
  startDate: string;
  estimatedCompletion: string;
  budget: number;
  status: 'active' | 'pending' | 'completed';
  projectManager: string;
  contact: string;
  email: string;
  remarks: string | null;
  created_at?: string;
  updated_at?: string;
}

// Map backend project model to frontend Project type
const mapFromBackend = (data: any): Project => ({
  id: String(data.id),
  projectId: data.project_id || '',
  name: data.name || '',
  ministry: data.ministry || '',
  department: data.department || '',
  projectType: data.project_type || '',
  acquisitionAct: data.acquisition_act || '',
  district: data.district || '',
  division: data.division || '',
  purpose: data.purpose || '',
  startDate: data.start_date || '',
  estimatedCompletion: data.estimated_completion || '',
  budget: Number(data.budget_im_mn) || 0,
  status: data.status || 'pending',
  projectManager: data.project_manager || '',
  contact: data.contact || '',
  email: data.email || '',
  remarks: data.remarks || null,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

// Map frontend Project data to backend format
const mapToBackend = (
  data: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
) => ({
  project_id: data.projectId,
  name: data.name,
  ministry: data.ministry,
  department: data.department,
  project_type: data.projectType,
  acquisition_act: data.acquisitionAct,
  district: data.district,
  division: data.division,
  purpose: data.purpose,
  start_date: data.startDate,
  estimated_completion: data.estimatedCompletion,
  budget_im_mn: Number(data.budget) || 0,
  status: data.status,
  project_manager: data.projectManager,
  contact: data.contact,
  email: data.email,
  remarks: data.remarks,
});

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/api/projects');
  const projects = response.data.projects || [];

  return projects.map(mapFromBackend);
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await api.get(`/api/projects/${id}`);

  return mapFromBackend(response.data.project);
};

export const createProject = async (
  data: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
): Promise<Project> => {
  const response = await api.post('/api/projects', mapToBackend(data));

  return mapFromBackend(response.data.project);
};

export const updateProject = async (
  id: string,
  data: Omit<Project, 'id' | 'created_at' | 'updated_at'>,
): Promise<Project> => {
  const response = await api.put(`/api/projects/${id}`, mapToBackend(data));

  return mapFromBackend(response.data.project);
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/api/projects/${id}`);
};
