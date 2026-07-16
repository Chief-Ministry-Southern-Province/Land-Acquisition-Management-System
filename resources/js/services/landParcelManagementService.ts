import api from './api';
import type { PropertyOwner } from './propertyOwnerManagement';

export interface LandParcel {
  id: string;
  parcel_id: string;
  project_id: string | null;
  lot_no: string;
  district: string;
  division: string;
  village: string;
  extent_acers: string;
  extent_perches: string;
  remarks: string | null;
  status: 'available' | 'pending' | 'acquired' | 'in-progress';
  created_at: string;
  updated_at: string;
  owners?: PropertyOwner[];
  property_owner_id?: string | null;
  property_owner_ids?: string[] | null;
  project?: any;
}

// Map backend land parcel to frontend
const mapFromBackend = (data: any): LandParcel => ({
  id: String(data.id),
  parcel_id: data.parcel_id,
  project_id: data.project_id ? String(data.project_id) : null,
  lot_no: data.lot_no,
  district: data.district,
  division: data.division,
  village: data.village,
  extent_acers: String(data.extent_acers),
  extent_perches: String(data.extent_perches),
  remarks: data.remarks || null,
  status: data.status,
  created_at: data.created_at,
  updated_at: data.updated_at,
  project: data.project || null,
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
  lot_no: data.lot_no,
  district: data.district,
  division: data.division,
  village: data.village,
  extent_acers: data.extent_acers,
  extent_perches: data.extent_perches,
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
