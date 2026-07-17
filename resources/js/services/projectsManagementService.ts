import api from './api';
import type { LandParcel } from './landParcelManagementService';

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
  landParcels?: LandParcel[];
  documents?: Document[];
}

export interface Document {
  id: string;
  user_id: string;
  project_id: string;
  original_filename: string;
  stored_filename: string;
  file_type: string;
  file_path: string;
  file_size: string;
  document_category: string;
  upload_date: string;
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
  landParcels: data.land_parcels
    ? data.land_parcels.map((p: any) => ({
        id: String(p.id),
        parcel_id: p.parcel_id,
        project_id: p.project_id ? String(p.project_id) : null,
        lot_no: p.lot_no,
        district: p.district,
        division: p.division,
        village: p.village,
        extent_acers: String(p.extent_acers),
        extent_perches: String(p.extent_perches),
        remarks: p.remarks || null,
        status: p.status,
        created_at: p.created_at,
        updated_at: p.updated_at,
        owners: p.owners
          ? p.owners.map((o: any) => ({
              id: String(o.id),
              ownerId: o.owner_id,
              name: o.name,
              nic: o.nic,
              address: o.address,
              contact: o.contact,
              created_at: o.created_at,
              updated_at: o.updated_at,
            }))
          : [],
      }))
    : [],
  documents: data.documents
    ? data.documents.map((d: any) => ({
        id: String(d.id),
        user_id: String(d.user_id),
        project_id: String(d.project_id),
        original_filename: d.original_filename || '',
        stored_filename: d.stored_filename || '',
        file_type: d.file_type || '',
        file_path: d.file_path || '',
        file_size: d.file_size || '',
        document_category: d.document_category || '',
        upload_date: d.upload_date || '',
        created_at: d.created_at,
        updated_at: d.updated_at,
      }))
    : [],
});

// Map frontend Project data to backend format
const mapToBackend = (
  data: Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
    parcel_ids?: string[];
  },
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
  parcel_ids: data.parcel_ids,
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
  data: Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
    parcel_ids?: string[];
  },
): Promise<Project> => {
  const response = await api.post('/api/projects', mapToBackend(data));

  return mapFromBackend(response.data.project);
};

export const updateProject = async (
  id: string,
  data: Omit<Project, 'id' | 'created_at' | 'updated_at'> & {
    parcel_ids?: string[];
  },
): Promise<Project> => {
  const response = await api.put(`/api/projects/${id}`, mapToBackend(data));

  return mapFromBackend(response.data.project);
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/api/projects/${id}`);
};
