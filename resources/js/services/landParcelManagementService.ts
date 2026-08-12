import api from './api';
import type { Document } from './projectsManagementService';
import type { PropertyOwner } from './propertyOwnerManagement';

export interface LandParcel {
  id: string;
  parcel_id: string;
  project_id: string | null;
  land_name?: string;
  province?: string;
  district: string;
  division?: string;
  divisional_secretariat?: string;
  grama_niladari_division?: string;
  village: string;
  extent_acers?: string;
  extent_perches?: string;
  land_size_acers?: string;
  land_size_roods?: string;
  land_size_perches?: string;
  full_land_size?: string;
  latitude?: number | null;
  longitude?: number | null;
  boundary_geojson?: any;
  has_plan?: boolean;
  plan_number?: string | null;
  parcel_numbers?: string[];
  boundaries_north?: string | null;
  boundaries_south?: string | null;
  boundaries_east?: string | null;
  boundaries_west?: string | null;
  has_residential_houses?: boolean;
  is_resident_owner?: boolean;
  is_cultivated?: boolean;
  cultivation?: string;
  cultivation_status?: 'fertile' | 'mid' | 'infertile' | 'unspecified';
  annual_income?: number;
  land_type?: string;
  is_casehold?: boolean;
  case_number?: string | null;
  case_start_date?: string | null;
  case_end_date?: string | null;
  case_status?: string | null;
  is_donated?: boolean;
  estimated_value?: number;
  remarks: string | null;
  status: 'available' | 'pending' | 'acquired';
  created_at: string;
  updated_at: string;
  owners?: PropertyOwner[];
  residents?: any[];
  documents?: Document[];
  property_owner_id?: string | null;
  property_owner_ids?: string[] | null;
  project?: any;
  surveys?: any[];
  valuations?: any[];
  compensations?: any[];
}

// Map backend land parcel to frontend
const mapFromBackend = (data: any): LandParcel => ({
  id: String(data.id),
  parcel_id: data.parcel_id,
  project_id: data.project_id ? String(data.project_id) : null,
  land_name: data.land_name || '',
  province: data.province || 'Southern',
  district: data.district,
  division: data.divisional_secretariat || data.division || '',
  divisional_secretariat: data.divisional_secretariat || data.division || '',
  grama_niladari_division: data.grama_niladari_division || '',
  village: data.village,
  extent_acers: String(data.land_size_acers ?? data.extent_acers ?? 0),
  extent_perches: String(data.land_size_perches ?? data.extent_perches ?? 0),
  land_size_acers: String(data.land_size_acers ?? data.extent_acers ?? 0),
  land_size_roods: String(data.land_size_roods ?? 0),
  land_size_perches: String(data.land_size_perches ?? data.extent_perches ?? 0),
  full_land_size: String(data.full_land_size ?? 0),
  latitude: data.latitude ? Number(data.latitude) : null,
  longitude: data.longitude ? Number(data.longitude) : null,
  boundary_geojson: data.boundary_geojson || null,
  has_plan: Boolean(data.has_plan),
  plan_number: data.plan_number || null,
  parcel_numbers: data.parcel_numbers || [],
  boundaries_north: data.boundaries_north || null,
  boundaries_south: data.boundaries_south || null,
  boundaries_east: data.boundaries_east || null,
  boundaries_west: data.boundaries_west || null,
  has_residential_houses: Boolean(data.has_residential_houses),
  is_resident_owner: Boolean(data.is_resident_owner),
  is_cultivated: Boolean(data.is_cultivated),
  cultivation: data.cultivation || 'N/A',
  cultivation_status: data.cultivation_status || 'unspecified',
  annual_income: Number(data.annual_income) || 0,
  land_type: data.land_type || 'Standard',
  is_casehold: Boolean(data.is_casehold),
  case_number: data.case_number || null,
  case_start_date: data.case_start_date || null,
  case_end_date: data.case_end_date || null,
  case_status: data.case_status || null,
  is_donated: Boolean(data.is_donated),
  estimated_value: Number(data.estimated_value) || 0,
  remarks: data.remarks || null,
  status: data.status,
  created_at: data.created_at,
  updated_at: data.updated_at,
  project: data.project || null,
  residents: data.residents || [],
  documents: data.documents
    ? data.documents.map((d: any) => ({
        id: String(d.id),
        userId: d.user_id,
        projectId: d.project_id ? String(d.project_id) : null,
        landParcelId: d.land_parcel_id ? String(d.land_parcel_id) : null,
        originalFilename: d.original_filename,
        storedFilename: d.stored_filename,
        fileType: d.file_type,
        filePath: d.file_path,
        fileSize: d.file_size,
        documentCategory: d.document_category,
        uploadDate: d.upload_date,
      }))
    : [],
  owners: data.owners
    ? data.owners.map((o: any) => ({
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
  surveys: data.surveys || [],
  valuations: data.valuations || [],
  compensations: data.compensations || [],
});

// Map frontend land parcel to backend
const mapToBackend = (
  data: Omit<LandParcel, 'id' | 'created_at' | 'updated_at' | 'owners'> & {
    property_owner_ids?: string[] | null;
  },
) => ({
  parcel_id: data.parcel_id,
  project_id: data.project_id,
  land_name: data.land_name || 'Land Parcel ' + data.parcel_id,
  province: data.province || 'Southern',
  district: data.district,
  division: data.divisional_secretariat || data.division,
  divisional_secretariat: data.divisional_secretariat || data.division,
  grama_niladari_division: data.grama_niladari_division || 'N/A',
  village: data.village,
  extent_acers: data.land_size_acers ?? data.extent_acers ?? 0,
  extent_perches: data.land_size_perches ?? data.extent_perches ?? 0,
  land_size_acers: data.land_size_acers ?? data.extent_acers ?? 0,
  land_size_roods: data.land_size_roods ?? 0,
  land_size_perches: data.land_size_perches ?? data.extent_perches ?? 0,
  full_land_size: data.full_land_size ?? 0,
  latitude: data.latitude,
  longitude: data.longitude,
  boundary_geojson: data.boundary_geojson,
  has_plan: Boolean(data.has_plan),
  plan_number: data.plan_number,
  parcel_numbers: data.parcel_numbers ?? [],
  boundaries_north: data.boundaries_north,
  boundaries_south: data.boundaries_south,
  boundaries_east: data.boundaries_east,
  boundaries_west: data.boundaries_west,
  has_residential_houses: Boolean(data.has_residential_houses),
  is_resident_owner: Boolean(data.is_resident_owner),
  is_cultivated: Boolean(data.is_cultivated),
  cultivation: data.cultivation || 'N/A',
  cultivation_status: data.cultivation_status || 'unspecified',
  annual_income: data.annual_income ?? 0,
  land_type: data.land_type || 'Standard',
  is_casehold: Boolean(data.is_casehold),
  case_number: data.is_casehold ? data.case_number || null : null,
  case_start_date: data.is_casehold ? data.case_start_date || null : null,
  case_end_date: data.is_casehold ? data.case_end_date || null : null,
  case_status: data.is_casehold ? data.case_status || null : null,
  is_donated: Boolean(data.is_donated),
  estimated_value: data.estimated_value ?? 0,
  remarks: data.remarks,
  status: data.status,
  property_owner_id: data.property_owner_id,
  property_owner_ids: data.property_owner_ids,
  residents: data.residents,
});

export const getLandParcels = async (): Promise<LandParcel[]> => {
  const response = await api.get('/api/land-parcels');
  const landParcels = response.data.land_parcels || [];

  return landParcels.map(mapFromBackend);
};

export const getLandParcel = async (id: string): Promise<LandParcel> => {
  const response = await api.get(`/api/land-parcels/${id}`);

  return mapFromBackend(response.data.land_parcel);
};

export const createLandParcel = async (
  data: Omit<LandParcel, 'id' | 'created_at' | 'updated_at'> & {
    property_owner_ids?: string[] | null;
  },
): Promise<LandParcel> => {
  const response = await api.post('/api/land-parcels', mapToBackend(data));

  return mapFromBackend(response.data.land_parcel);
};

export const updateLandParcel = async (
  id: string,
  data: Omit<LandParcel, 'id' | 'created_at' | 'updated_at'> & {
    property_owner_ids?: string[] | null;
  },
): Promise<LandParcel> => {
  const response = await api.put(`/api/land-parcels/${id}`, mapToBackend(data));

  return mapFromBackend(response.data.land_parcel);
};

export const deleteLandParcel = async (id: string): Promise<void> => {
  await api.delete(`/api/land-parcels/${id}`);
};

export const exportLandParcels = async (
  format: 'pdf' | 'excel' | 'csv',
  id?: string,
  locale?: string,
): Promise<void> => {
  let requestUrl = id
    ? `/api/land-parcels/export?format=${format}&id=${id}`
    : `/api/land-parcels/export?format=${format}`;

  if (locale) {
    requestUrl += `&locale=${locale}`;
  }

  const response = await api.get(requestUrl, {
    responseType: 'blob',
  });

  const contentType = response.headers['content-type'];
  const blob = new Blob([response.data], {
    type:
      typeof contentType === 'string'
        ? contentType
        : 'application/octet-stream',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const contentDisposition = response.headers['content-disposition'];
  let filename = `land_parcels_export.${format === 'excel' ? 'xlsx' : format}`;

  if (typeof contentDisposition === 'string') {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);

    if (match && match[1]) {
      filename = match[1];
    }
  }

  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const importLandParcels = async (
  file: File,
): Promise<{
  message: string;
  imported_count: number;
  failures: any[];
}> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/land-parcels/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
