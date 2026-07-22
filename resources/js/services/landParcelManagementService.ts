import api from './api';
import type { PropertyOwner } from './propertyOwnerManagement';

export interface LandParcel {
  id: string;
  parcel_id: string;
  project_id: string | null;
  document_id?: string | null;
  land_name?: string;
  province?: string;
  lot_no?: string;
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
  cultivation?: string;
  cultivation_status?: 'fertile' | 'mid' | 'infertile';
  annual_income?: number;
  land_type?: string;
  estimated_value?: number;
  remarks: string | null;
  status: 'available' | 'pending' | 'acquired';
  created_at: string;
  updated_at: string;
  owners?: PropertyOwner[];
  residents?: any[];
  property_owner_id?: string | null;
  property_owner_ids?: string[] | null;
  project?: any;
}

// Map backend land parcel to frontend
const mapFromBackend = (data: any): LandParcel => ({
  id: String(data.id),
  parcel_id: data.parcel_id,
  project_id: data.project_id ? String(data.project_id) : null,
  document_id: data.document_id ? String(data.document_id) : null,
  land_name: data.land_name || '',
  province: data.province || 'Southern',
  lot_no: data.lot_no || data.plan_number || '',
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
  cultivation: data.cultivation || 'N/A',
  cultivation_status: data.cultivation_status || 'fertile',
  annual_income: Number(data.annual_income) || 0,
  land_type: data.land_type || 'Standard',
  estimated_value: Number(data.estimated_value) || 0,
  remarks: data.remarks || null,
  status: data.status,
  created_at: data.created_at,
  updated_at: data.updated_at,
  project: data.project || null,
  residents: data.residents || [],
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
});

// Map frontend land parcel to backend
const mapToBackend = (
  data: Omit<LandParcel, 'id' | 'created_at' | 'updated_at' | 'owners'> & {
    property_owner_ids?: string[] | null;
  },
) => ({
  parcel_id: data.parcel_id,
  project_id: data.project_id,
  document_id: data.document_id,
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
  cultivation: data.cultivation || 'N/A',
  cultivation_status: data.cultivation_status || 'fertile',
  annual_income: data.annual_income ?? 0,
  land_type: data.land_type || 'Standard',
  estimated_value: data.estimated_value ?? 0,
  remarks: data.remarks,
  status: data.status,
  property_owner_id: data.property_owner_id,
  property_owner_ids: data.property_owner_ids,
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
): Promise<void> => {
  const response = await api.get(`/api/land-parcels/export?format=${format}`, {
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
