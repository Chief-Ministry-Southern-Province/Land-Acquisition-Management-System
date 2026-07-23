import api from './api';
import type { LandParcel } from './landParcelManagementService';

export interface PropertyOwner {
  id: string;
  ownerId: string;
  name: string;
  nic?: string | null;
  address: string;
  contact?: string | null;
  dateOfBirth?: string;
  occupation?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  landParcels?: LandParcel[];
  compensations?: any[];
}

// Map backend property owner model to frontend PropertyOwner type
const mapFromBackend = (data: any): PropertyOwner => ({
  id: String(data.id),
  ownerId: data.owner_id,
  name: data.name,
  nic: data.nic,
  address: data.address,
  contact: data.contact,
  dateOfBirth: data.date_of_birth,
  occupation: data.occupation,
  email: data.email,
  created_at: data.created_at,
  updated_at: data.updated_at,
  landParcels: data.land_parcels
    ? data.land_parcels.map((p: any) => ({
        id: String(p.id),
        parcel_id: p.parcel_id,
        project_id: p.project_id ? String(p.project_id) : null,
        district: p.district,
        division: p.division,
        village: p.village,
        extent_acers: String(p.extent_acers),
        extent_perches: String(p.extent_perches),
        remarks: p.remarks || null,
        status: p.status,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }))
    : [],
  compensations: data.compensations
    ? data.compensations.map((c: any) => ({
        id: String(c.id),
        owner_id: String(c.owner_id),
        land_parcel_id: String(c.land_parcel_id),
        compensation_id: c.compensation_id,
        amount: Number(c.amount),
        approved_date: c.approved_date,
        payment_date: c.payment_date,
        status: c.status,
        created_at: c.created_at,
        updated_at: c.updated_at,
        landParcel: c.land_parcel
          ? {
              id: String(c.land_parcel.id),
              parcel_id: c.land_parcel.parcel_id,
              district: c.land_parcel.district,
              division: c.land_parcel.division,
              village: c.land_parcel.village,
              extent_acers: String(c.land_parcel.extent_acers),
              extent_perches: String(c.land_parcel.extent_perches),
              remarks: c.land_parcel.remarks || null,
              status: c.land_parcel.status,
              created_at: c.land_parcel.created_at,
              updated_at: c.land_parcel.updated_at,
            }
          : undefined,
      }))
    : [],
});

// Map frontend PropertyOwner data to backend format
const mapToBackend = (
  data: Omit<
    PropertyOwner,
    'id' | 'created_at' | 'updated_at' | 'landParcels' | 'compensations'
  >,
) => ({
  owner_id: data.ownerId,
  name: data.name,
  nic: data.nic,
  address: data.address,
  contact: data.contact,
});

export const getPropertyOwners = async (): Promise<PropertyOwner[]> => {
  const response = await api.get('/api/property-owners');
  const propertyOwners = response.data.property_owners || [];

  return propertyOwners.map(mapFromBackend);
};

export const getPropertyOwner = async (id: string): Promise<PropertyOwner> => {
  const response = await api.get(`/api/property-owners/${id}`);

  return mapFromBackend(response.data.property_owner);
};

export const createPropertyOwner = async (
  data: Omit<PropertyOwner, 'id' | 'created_at' | 'updated_at'>,
): Promise<PropertyOwner> => {
  const response = await api.post('/api/property-owners', mapToBackend(data));

  return mapFromBackend(response.data.property_owner);
};

export const updatePropertyOwner = async (
  id: string,
  data: Omit<PropertyOwner, 'id' | 'created_at' | 'updated_at'>,
): Promise<PropertyOwner> => {
  const response = await api.put(
    `/api/property-owners/${id}`,
    mapToBackend(data),
  );

  return mapFromBackend(response.data.property_owner);
};

export const deletePropertyOwner = async (id: string): Promise<void> => {
  await api.delete(`/api/property-owners/${id}`);
};
