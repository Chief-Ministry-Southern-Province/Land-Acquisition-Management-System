import api from './api';
import type { LandParcel } from './landParcelManagementService';
import type { Document } from './projectsManagementService';

export interface Compensation {
  id: string;
  owner_id: string;
  land_parcel_id: string;
  compensation_id: string;
  amount: number;
  approved_date: string | null;
  payment_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  landParcel?: LandParcel;
}

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
  compensations?: Compensation[];
  documents?: Document[];
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
  documents: data.documents
    ? data.documents.map((d: any) => ({
        id: String(d.id),
        user_id: String(d.user_id),
        project_id: d.project_id ? String(d.project_id) : null,
        land_parcel_id: d.land_parcel_id ? String(d.land_parcel_id) : null,
        property_owner_id: d.property_owner_id
          ? String(d.property_owner_id)
          : null,
        original_filename: d.original_filename,
        stored_filename: d.stored_filename,
        file_type: d.file_type,
        file_path: d.file_path,
        file_size: d.file_size,
        document_category: d.document_category,
        upload_date: d.upload_date,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }))
    : [],
});

// Map frontend PropertyOwner data to backend format
const mapToBackend = (
  data: Omit<
    PropertyOwner,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'landParcels'
    | 'compensations'
    | 'documents'
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

export const exportPropertyOwners = async (
  format: 'pdf' | 'excel' | 'csv',
  id?: string,
  locale?: string,
): Promise<void> => {
  let requestUrl = id
    ? `/api/property-owners/export?format=${format}&id=${id}`
    : `/api/property-owners/export?format=${format}`;
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
  let filename = `property_owners_export.${format === 'excel' ? 'xlsx' : format}`;

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
