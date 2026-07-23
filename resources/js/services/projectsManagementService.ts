import api from './api';
import type { LandParcel } from './landParcelManagementService';

export interface Project {
  id: string;
  projectId: string;
  title: string;
  name: string;
  institution?: string;
  institutionAddress?: string;
  ministry?: string;
  department?: string;
  projectType?: string;
  acquisitionAct?: string;
  district?: string;
  division?: string;
  purpose: string;
  landAreaAcers?: number;
  landAreaRoods?: number;
  landAreaPerches?: number;
  fullLandArea?: number;
  areResidentsMovedTemp?: boolean;
  section20Observation?: boolean | null;
  section21SecretaryReport?: boolean | null;
  section22SecretaryRecommendation?: string | null;
  section23ValuationRecommendation?: string | null;
  section24DecisionRemarks?: boolean | null;
  section25AdditionalConditions?: string | null;
  section26FinalRecommendation?: boolean | null;
  approvalDate?: string | null;
  approvedBy?: number | null;
  startDate?: string;
  estimatedCompletion?: string;
  budget?: number;
  status: 'active' | 'pending' | 'completed';
  caseStatus?: 'active' | 'pending' | 'rejected' | 'completed';
  doStatus?: 'draft' | 'submitted';
  hobStatus?: 'approved' | 'pending' | 'rejected';
  aoStatus?: 'approved' | 'pending' | 'rejected';
  asStatus?: 'approved' | 'pending' | 'rejected';
  sasStatus?: 'approved' | 'pending' | 'rejected';
  secStatus?: 'approved' | 'pending' | 'rejected';
  projectManager?: string;
  contact?: string;
  email?: string;
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
  title: data.title || data.name || '',
  name: data.title || data.name || '',
  institution: data.institution || '',
  institutionAddress: data.institution_address || '',
  ministry: data.ministry || data.institution || '',
  department: data.department || '',
  projectType: data.project_type || '',
  acquisitionAct: data.acquisition_act || '',
  district: data.district || '',
  division: data.division || '',
  purpose: data.purpose || '',
  landAreaAcers: Number(data.land_area_to_be_acquired_acers) || 0,
  landAreaRoods: Number(data.land_area_to_be_acquired_roods) || 0,
  landAreaPerches: Number(data.land_area_to_be_acquired_perches) || 0,
  fullLandArea: Number(data.full_land_area_to_be_acquired) || 0,
  areResidentsMovedTemp: Boolean(data.are_residents_moved_temp),
  section20Observation: data.section20_observation ?? null,
  section21SecretaryReport: data.section21_secretary_report ?? null,
  section22SecretaryRecommendation:
    data.section22_secretary_recommendation ?? null,
  section23ValuationRecommendation:
    data.section23_valuation_recommendation ?? null,
  section24DecisionRemarks: data.section24_decision_remarks ?? null,
  section25AdditionalConditions: data.section25_additional_conditions ?? null,
  section26FinalRecommendation: data.section26_final_recommendation ?? null,
  approvalDate: data.approval_date || null,
  approvedBy: data.approved_by || null,
  startDate: data.start_date || '',
  estimatedCompletion: data.estimated_completion || '',
  budget: Number(data.budget_im_mn) || 0,
  status: data.case_status || data.status || 'pending',
  caseStatus: data.case_status || 'pending',
  doStatus: data.do_status || 'draft',
  hobStatus: data.hob_status || 'pending',
  aoStatus: data.ao_status || 'pending',
  asStatus: data.as_status || 'pending',
  sasStatus: data.sas_status || 'pending',
  secStatus: data.sec_status || 'pending',
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
        land_name: p.land_name || '',
        district: p.district,
        division: p.divisional_secretariat || p.division || '',
        village: p.village,
        extent_acers: String(p.land_size_acers ?? p.extent_acers ?? 0),
        extent_perches: String(p.land_size_perches ?? p.extent_perches ?? 0),
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
  title: data.title || data.name,
  name: data.name || data.title,
  purpose: data.purpose,
  institution: data.institution || data.ministry || 'N/A',
  institution_address: data.institutionAddress || 'N/A',
  land_area_to_be_acquired_acers: data.landAreaAcers ?? 0,
  land_area_to_be_acquired_roods: data.landAreaRoods ?? 0,
  land_area_to_be_acquired_perches: data.landAreaPerches ?? 0,
  full_land_area_to_be_acquired: data.fullLandArea ?? 0,
  are_residents_moved_temp: Boolean(data.areResidentsMovedTemp),
  section20_observation: data.section20Observation ?? null,
  section21_secretary_report: data.section21SecretaryReport ?? null,
  section22_secretary_recommendation:
    data.section22SecretaryRecommendation ?? null,
  section23_valuation_recommendation:
    data.section23ValuationRecommendation ?? null,
  section24_decision_remarks: data.section24DecisionRemarks ?? null,
  section25_additional_conditions: data.section25AdditionalConditions ?? null,
  section26_final_recommendation: data.section26FinalRecommendation ?? null,
  approval_date: data.approvalDate || null,
  approved_by: data.approvedBy || null,
  case_status: data.caseStatus || data.status,
  do_status: data.doStatus,
  hob_status: data.hobStatus,
  ao_status: data.aoStatus,
  as_status: data.asStatus,
  sas_status: data.sasStatus,
  sec_status: data.secStatus,
  status: data.status,
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
