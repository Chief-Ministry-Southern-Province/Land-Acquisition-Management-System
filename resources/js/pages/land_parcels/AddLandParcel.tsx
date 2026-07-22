import { router, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  FileText,
  Layers,
  MapPin,
  Save,
  User,
  X,
  Plus,
  Search,
  Users,
  FolderKanban,
  Upload,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { uploadDocument } from '@/services/documentManagementService';
import { createLandParcel } from '@/services/landParcelManagementService';
import { getProjects } from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';
import {
  createPropertyOwner,
  getPropertyOwners,
} from '@/services/propertyOwnerManagement';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';

const PROVINCES = [
  {
    value: 'Western',
    label: 'Western',
    districts: [
      { value: 'Colombo', label: 'Colombo' },
      { value: 'Gampaha', label: 'Gampaha' },
      { value: 'Kalutara', label: 'Kalutara' },
    ],
  },
  {
    value: 'Central',
    label: 'Central',
    districts: [
      { value: 'Kandy', label: 'Kandy' },
      { value: 'Matale', label: 'Matale' },
      { value: 'Nuwara Eliya', label: 'Nuwara Eliya' },
    ],
  },
  {
    value: 'Southern',
    label: 'Southern',
    districts: [
      { value: 'Galle', label: 'Galle' },
      { value: 'Matara', label: 'Matara' },
      { value: 'Hambantota', label: 'Hambantota' },
    ],
  },
  {
    value: 'Northern',
    label: 'Northern',
    districts: [
      { value: 'Jaffna', label: 'Jaffna' },
      { value: 'Kilinochchi', label: 'Kilinochchi' },
      { value: 'Mannar', label: 'Mannar' },
      { value: 'Mullaitivu', label: 'Mullaitivu' },
      { value: 'Vavuniya', label: 'Vavuniya' },
    ],
  },
  {
    value: 'Eastern',
    label: 'Eastern',
    districts: [
      { value: 'Ampara', label: 'Ampara' },
      { value: 'Batticaloa', label: 'Batticaloa' },
      { value: 'Trincomalee', label: 'Trincomalee' },
    ],
  },
  {
    value: 'North Western',
    label: 'North Western',
    districts: [
      { value: 'Kurunegala', label: 'Kurunegala' },
      { value: 'Puttalam', label: 'Puttalam' },
    ],
  },
  {
    value: 'North Central',
    label: 'North Central',
    districts: [
      { value: 'Anuradhapura', label: 'Anuradhapura' },
      { value: 'Polonnaruwa', label: 'Polonnaruwa' },
    ],
  },
  {
    value: 'Uva',
    label: 'Uva',
    districts: [
      { value: 'Badulla', label: 'Badulla' },
      { value: 'Monaragala', label: 'Monaragala' },
    ],
  },
  {
    value: 'Sabaragamuwa',
    label: 'Sabaragamuwa',
    districts: [
      { value: 'Kegalle', label: 'Kegalle' },
      { value: 'Ratnapura', label: 'Ratnapura' },
    ],
  },
];

const LAND_USE_TYPES = [
  'Agricultural',
  'Residential',
  'Commercial',
  'Industrial',
  'Forest Reserve',
  'Wetland',
  'Bare Land',
  'Mixed Use',
];

const TENURE_TYPES = [
  'Freehold',
  'Leasehold',
  'Crown Land',
  'State Land',
  'Temple Land',
  'Other',
];

type FormData = {
  landName: string;
  landNumber: string;
  province: string;
  district: string;
  divisionalSecretariat: string;
  gramaNiladhari: string;
  village: string;
  extentAcres: string;
  extentRoods: string;
  extentPerches: string;
  hasPlan: boolean;
  planNumber: string;
  parcelNumbers: string;
  boundariesNorth: string;
  boundariesSouth: string;
  boundariesEast: string;
  boundariesWest: string;
  hasResidentialHouses: boolean;
  isResidentOwner: boolean;
  isCultivated: boolean;
  cultivation: string;
  cultivationStatus: 'fertile' | 'mid' | 'infertile' | 'unspecified';
  annualIncome: string;
  landType: string;
  estimatedValue: string;
  landUseType: string;
  tenureType: string;
  projectId: string;
  acquisitionSection: string;
  remarks: string;
};

const EMPTY: FormData = {
  landName: '',
  landNumber: '',
  province: 'Southern',
  district: '',
  divisionalSecretariat: '',
  gramaNiladhari: '',
  village: '',
  extentAcres: '',
  extentRoods: '',
  extentPerches: '',
  hasPlan: false,
  planNumber: '',
  parcelNumbers: '',
  boundariesNorth: '',
  boundariesSouth: '',
  boundariesEast: '',
  boundariesWest: '',
  hasResidentialHouses: false,
  isResidentOwner: false,
  isCultivated: false,
  cultivation: '',
  cultivationStatus: 'unspecified',
  annualIncome: '',
  landType: '',
  estimatedValue: '',
  landUseType: '',
  tenureType: '',
  projectId: '',
  acquisitionSection: '',
  remarks: '',
};

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="border-border mb-4 flex items-center gap-2 border-b pb-2">
      <div className="bg-primary/10 rounded p-1.5">
        <Icon className="text-primary h-4 w-4" />
      </div>
      <h3 className="text-foreground text-sm font-semibold uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-foreground text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors';

export default function AddLandParcel() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [projects, setProjects] = useState<Project[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  // Document upload state
  const [queuedFiles, setQueuedFiles] = useState<
    { id: string; file: File; category: string }[]
  >([]);

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userId = user?.id;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const newQueuedFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      category: 'Land Parcels',
    }));

    setQueuedFiles((prev) => [...prev, ...newQueuedFiles]);
  };

  const handleRemoveQueuedFile = (tempId: string) => {
    setQueuedFiles((prev) => prev.filter((item) => item.id !== tempId));
  };

  // Property owners selection state
  const [selectedOwners, setSelectedOwners] = useState<any[]>([]);
  const [existingOwners, setExistingOwners] = useState<PropertyOwner[]>([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [showOwnerPicker, setShowOwnerPicker] = useState(false);

  // New owner inline form
  const [showNewOwnerForm, setShowNewOwnerForm] = useState(false);
  const [newOwnerForm, setNewOwnerForm] = useState({
    name: '',
    nic: '',
    contact: '',
    address: '',
  });
  const [newOwnerErrors, setNewOwnerErrors] = useState<any>({});

  // Residents state
  const [selectedResidents, setSelectedResidents] = useState<any[]>([]);
  const [showNewResidentForm, setShowNewResidentForm] = useState(false);
  const [newResidentForm, setNewResidentForm] = useState({
    name: '',
    nic: '',
    contact: '',
    address: '',
    relationship: 'tenant' as 'owner' | 'tenant' | 'family_member',
  });
  const [newResidentErrors, setNewResidentErrors] = useState<any>({});

  const handleAddNewResident = () => {
    const errs: any = {};

    if (!newResidentForm.name.trim()) {
      errs.name = 'Resident name is required';
    }

    if (Object.keys(errs).length > 0) {
      setNewResidentErrors(errs);

      return;
    }

    setSelectedResidents((prev) => [
      ...prev,
      {
        name: newResidentForm.name.trim(),
        nic: newResidentForm.nic.trim() || null,
        contact: newResidentForm.contact.trim() || null,
        address: newResidentForm.address.trim() || null,
        relationship: newResidentForm.relationship || 'tenant',
      },
    ]);

    setNewResidentForm({
      name: '',
      nic: '',
      contact: '',
      address: '',
      relationship: 'tenant',
    });
    setNewResidentErrors({});
    setShowNewResidentForm(false);
  };

  const handleRemoveResident = (index: number) => {
    setSelectedResidents((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch projects and property owners
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projData, ownerData] = await Promise.all([
          getProjects(),
          getPropertyOwners(),
        ]);
        setProjects(projData);
        setExistingOwners(ownerData);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchData();
  }, []);

  const set =
    (field: keyof FormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleAddNewOwner = () => {
    const errs: any = {};

    if (!newOwnerForm.name.trim()) {
      errs.name = 'Name is required';
    }

    if (!newOwnerForm.nic.trim()) {
      errs.nic = 'NIC is required';
    }

    if (!newOwnerForm.contact.trim()) {
      errs.contact = 'Contact is required';
    }

    if (!newOwnerForm.address.trim()) {
      errs.address = 'Address is required';
    }

    if (
      selectedOwners.some(
        (o) => o.nic.toLowerCase() === newOwnerForm.nic.toLowerCase().trim(),
      )
    ) {
      errs.nic = 'This owner is already added';
    }

    if (
      existingOwners.some(
        (o) => o.nic.toLowerCase() === newOwnerForm.nic.toLowerCase().trim(),
      )
    ) {
      errs.nic =
        'An owner with this NIC already exists in the database. Use search instead.';
    }

    if (Object.keys(errs).length > 0) {
      setNewOwnerErrors(errs);

      return;
    }

    setSelectedOwners((prev) => [
      ...prev,
      {
        isNew: true,
        name: newOwnerForm.name.trim(),
        nic: newOwnerForm.nic.trim(),
        contact: newOwnerForm.contact.trim(),
        address: newOwnerForm.address.trim(),
      },
    ]);

    setNewOwnerForm({ name: '', nic: '', contact: '', address: '' });
    setNewOwnerErrors({});
    setShowNewOwnerForm(false);
  };

  const handleSelectExistingOwner = (owner: PropertyOwner) => {
    if (selectedOwners.some((o) => o.nic === owner.nic)) {
      alert('This owner is already added to the parcel.');

      return;
    }

    setSelectedOwners((prev) => [
      ...prev,
      {
        id: owner.id,
        ownerId: owner.ownerId,
        isNew: false,
        name: owner.name,
        nic: owner.nic,
        contact: owner.contact,
        address: owner.address,
      },
    ]);
    setOwnerSearch('');
    setShowOwnerPicker(false);
  };

  const handleRemoveOwner = (index: number) => {
    setSelectedOwners((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredExistingOwners = useMemo(() => {
    const q = ownerSearch.toLowerCase().trim();

    if (!q) {
      return [];
    }

    return existingOwners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(q) ||
        owner.nic.toLowerCase().includes(q) ||
        owner.ownerId.toLowerCase().includes(q),
    );
  }, [existingOwners, ownerSearch]);

  const fullLandSizePerches = useMemo(() => {
    const acres = parseFloat(form.extentAcres) || 0;
    const roods = parseFloat(form.extentRoods) || 0;
    const perches = parseFloat(form.extentPerches) || 0;

    return acres * 160 + roods * 40 + perches;
  }, [form.extentAcres, form.extentRoods, form.extentPerches]);

  const validate = () => {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (!form.landNumber.trim()) {
      errs.landNumber = 'Land Number is required';
    }

    if (!form.district) {
      errs.district = 'District is required';
    }

    if (!form.divisionalSecretariat.trim()) {
      errs.divisionalSecretariat = 'Divisional Secretariat is required';
    }

    if (!form.village.trim()) {
      errs.village = 'Village is required';
    }

    if (!form.extentAcres.trim()) {
      errs.extentAcres = 'Extent (acres) is required';
    }

    if (!form.landUseType) {
      errs.landUseType = 'Land use type is required';
    }

    if (!form.tenureType) {
      errs.tenureType = 'Tenure type is required';
    }

    if (queuedFiles.length > 0 && !form.projectId) {
      errs.projectId = 'A project must be selected to upload documents';
      alert('You must select an Associated Project to upload documents.');
      setErrors(errs);
      return false;
    }

    if (selectedOwners.length === 0) {
      alert('You must add or select at least one property owner.');

      return false;
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      const finalOwnerIds: string[] = [];

      for (const owner of selectedOwners) {
        if (owner.isNew) {
          const ownerId = `OWN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          const ownerPayload = {
            ownerId,
            name: owner.name,
            nic: owner.nic,
            address: owner.address,
            contact: owner.contact,
          };
          const created = await createPropertyOwner(ownerPayload);
          finalOwnerIds.push(created.id);
        } else {
          finalOwnerIds.push(owner.id);
        }
      }

      const acres = parseFloat(form.extentAcres) || 0;
      const roods = parseFloat(form.extentRoods) || 0;
      const perches = parseFloat(form.extentPerches) || 0;
      const totalPerches = acres * 160 + roods * 40 + perches;

      let primaryDocumentId: string | null = null;

      if (queuedFiles.length > 0 && form.projectId) {
        for (let i = 0; i < queuedFiles.length; i++) {
          const item = queuedFiles[i];
          const uploaded = await uploadDocument(
            item.file,
            String(userId || ''),
            String(form.projectId),
            item.category,
          );
          if (i === 0 && uploaded && uploaded.id) {
            primaryDocumentId = uploaded.id;
          }
        }
      }

      const payload = {
        parcel_id: form.landNumber,
        land_name: form.landName || 'Land Parcel ' + form.landNumber,
        province: form.province || 'Southern',
        district: form.district,
        division: form.divisionalSecretariat,
        divisional_secretariat: form.divisionalSecretariat,
        grama_niladari_division: form.gramaNiladhari || 'N/A',
        village: form.village,
        extent_acers: form.extentAcres,
        extent_perches: form.extentPerches || '0',
        land_size_acers: form.extentAcres || '0',
        land_size_roods: form.extentRoods || '0',
        land_size_perches: form.extentPerches || '0',
        full_land_size: totalPerches.toString(),
        has_plan: form.hasPlan,
        plan_number: form.planNumber || form.landNumber,
        parcel_numbers: form.parcelNumbers
          ? form.parcelNumbers
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        boundaries_north: form.boundariesNorth || null,
        boundaries_south: form.boundariesSouth || null,
        boundaries_east: form.boundariesEast || null,
        boundaries_west: form.boundariesWest || null,
        has_residential_houses: form.hasResidentialHouses,
        is_resident_owner: form.isResidentOwner,
        is_cultivated: form.isCultivated,
        cultivation: form.isCultivated ? form.cultivation || 'N/A' : 'N/A',
        cultivation_status: form.isCultivated ? form.cultivationStatus : 'unspecified',
        annual_income: form.isCultivated ? Number(form.annualIncome) || 0 : 0,
        land_type: form.landType || form.landUseType || 'Standard',
        estimated_value: Number(form.estimatedValue) || 0,
        remarks: form.remarks || null,
        status: 'available' as const,
        project_id: form.projectId ? form.projectId : null,
        document_id: primaryDocumentId,
        property_owner_ids: finalOwnerIds,
        residents: selectedResidents,
      };

      await createLandParcel(payload);

      router.visit('/land-parcels');
    } catch (error: any) {
      console.error('Failed to create land parcel:', error);

      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, val]) => {
          let fieldName = key;

          if (key === 'parcel_id') {
            fieldName = 'landNumber';
          }

          if (key === 'division') {
            fieldName = 'divisionalSecretariat';
          }

          if (key === 'extent_acers') {
            fieldName = 'extentAcres';
          }

          if (key === 'extent_perches') {
            fieldName = 'extentPerches';
          }

          if (key === 'project_id') {
            fieldName = 'projectId';
          }

          if (Array.isArray(val) && val.length > 0) {
            backendErrors[fieldName] = val[0];
          }
        });
        setErrors(backendErrors);
      } else if (error.response?.data?.message) {
        setErrors({ landNumber: error.response.data.message });
      } else {
        setErrors({
          landNumber: 'An error occurred while saving the land parcel.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const errMsg = (field: keyof FormData) =>
    errors[field] ? (
      <span className="text-destructive mt-0.5 text-xs">{errors[field]}</span>
    ) : null;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.visit('/land-parcels')}
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            title="Back to Land Parcels"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1>Add Land Parcel</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Register a new land parcel into the system
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.visit('/land-parcels')}
            disabled={submitting}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            form="add-parcel-form"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Saving...' : 'Save Parcel'}
          </button>
        </div>
      </div>

      <form
        id="add-parcel-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        {/* Location Details */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader icon={MapPin} title="Location Details" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Land Name">
              <input
                className={inputCls}
                placeholder="e.g. Watta Land"
                value={form.landName}
                onChange={set('landName')}
              />
            </Field>

            <Field label="Land Number" required>
              <input
                className={inputCls}
                placeholder="e.g. LND/2026/001"
                value={form.landNumber}
                onChange={set('landNumber')}
              />
              {errMsg('landNumber')}
            </Field>

            <Field label="Province">
              <select
                className={inputCls}
                value={form.province}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    province: e.target.value,
                    district: '',
                  }));
                }}
              >
                <option value="">Select Province</option>
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="District" required>
              <select
                className={inputCls}
                value={form.district}
                onChange={set('district')}
                disabled={!form.province}
              >
                <option value="">Select District</option>
                {PROVINCES.find(
                  (p) => p.value === form.province,
                )?.districts.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                )) || null}
              </select>
              {errMsg('district')}
            </Field>

            <Field label="Divisional Secretariat" required>
              <input
                className={inputCls}
                placeholder="e.g. Galle Four Gravets"
                value={form.divisionalSecretariat}
                onChange={set('divisionalSecretariat')}
              />
              {errMsg('divisionalSecretariat')}
            </Field>

            <Field label="Grama Niladhari Division">
              <input
                className={inputCls}
                placeholder="GN Division"
                value={form.gramaNiladhari}
                onChange={set('gramaNiladhari')}
              />
            </Field>

            <Field label="Village / Town" required>
              <input
                className={inputCls}
                placeholder="e.g. Unawatuna"
                value={form.village}
                onChange={set('village')}
              />
              {errMsg('village')}
            </Field>
          </div>
        </div>

        {/* Parcel Details */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader icon={Layers} title="Parcel Details" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Extent — Acres" required>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.extentAcres}
                onChange={set('extentAcres')}
              />
              {errMsg('extentAcres')}
            </Field>

            <Field label="Extent — Roods">
              <input
                className={inputCls}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.extentRoods}
                onChange={set('extentRoods')}
              />
            </Field>

            <Field label="Extent — Perches">
              <input
                className={inputCls}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.extentPerches}
                onChange={set('extentPerches')}
              />
            </Field>

            <Field label="Full Land Size (Perches)">
              <input
                className={`${inputCls} bg-muted/40 cursor-not-allowed`}
                type="text"
                readOnly
                value={`${fullLandSizePerches.toFixed(2)} Perches`}
              />
            </Field>

            <div className="flex items-center gap-2 lg:col-span-4 md:col-span-2 py-2">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary/40 h-4 w-4"
                  checked={form.hasPlan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hasPlan: e.target.checked }))
                  }
                />
                <span className="text-foreground text-sm font-medium">
                  Does land parcel has a plan
                </span>
              </label>
            </div>

            {form.hasPlan ? (
              <>
                <Field label="Plan Number" required>
                  <input
                    className={inputCls}
                    placeholder="e.g. P/2024/001"
                    value={form.planNumber}
                    onChange={set('planNumber')}
                  />
                  {errMsg('planNumber')}
                </Field>

                <Field label="Parcel Numbers">
                  <input
                    className={inputCls}
                    placeholder="e.g. 1, 2, 3"
                    value={form.parcelNumbers}
                    onChange={set('parcelNumbers')}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label="Boundary — North">
                  <input
                    className={inputCls}
                    placeholder="e.g. Main Road"
                    value={form.boundariesNorth}
                    onChange={set('boundariesNorth')}
                  />
                </Field>

                <Field label="Boundary — South">
                  <input
                    className={inputCls}
                    placeholder="e.g. River"
                    value={form.boundariesSouth}
                    onChange={set('boundariesSouth')}
                  />
                </Field>

                <Field label="Boundary — East">
                  <input
                    className={inputCls}
                    placeholder="e.g. Land of Mr. Silva"
                    value={form.boundariesEast}
                    onChange={set('boundariesEast')}
                  />
                </Field>

                <Field label="Boundary — West">
                  <input
                    className={inputCls}
                    placeholder="e.g. Temple Land"
                    value={form.boundariesWest}
                    onChange={set('boundariesWest')}
                  />
                </Field>
              </>
            )}

            <div className="flex items-center gap-2 lg:col-span-4 md:col-span-2 py-2">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary/40 h-4 w-4"
                  checked={form.isCultivated}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isCultivated: e.target.checked }))
                  }
                />
                <span className="text-foreground text-sm font-medium">
                  Does land has a cultivation
                </span>
              </label>
            </div>

            {form.isCultivated && (
              <>
                <Field label="Cultivation Details">
                  <input
                    className={inputCls}
                    placeholder="e.g. Coconut, Paddy"
                    value={form.cultivation}
                    onChange={set('cultivation')}
                  />
                </Field>

                <Field label="Cultivation Status">
                  <select
                    className={inputCls}
                    value={form.cultivationStatus}
                    onChange={set('cultivationStatus')}
                  >
                    <option value="unspecified">Unspecified</option>
                    <option value="fertile">Fertile</option>
                    <option value="mid">Mid</option>
                    <option value="infertile">Infertile</option>
                  </select>
                </Field>

                <Field label="Annual Income (LKR)">
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={form.annualIncome}
                    onChange={set('annualIncome')}
                  />
                </Field>
              </>
            )}

            <div className="lg:col-start-1 md:col-start-1">
              <Field label="Estimated Value (LKR)">
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={form.estimatedValue}
                  onChange={set('estimatedValue')}
                />
              </Field>
            </div>

            <Field label="Land Use Type" required>
              <select
                className={inputCls}
                value={form.landUseType}
                onChange={set('landUseType')}
              >
                <option value="">Select Type</option>
                {LAND_USE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errMsg('landUseType')}
            </Field>

            <Field label="Tenure Type" required>
              <select
                className={inputCls}
                value={form.tenureType}
                onChange={set('tenureType')}
              >
                <option value="">Select Tenure</option>
                {TENURE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errMsg('tenureType')}
            </Field>
          </div>
        </div>

        {/* Owner Details */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader icon={User} title="Owner Details" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* List of currently added owners */}
            <div className="space-y-3 md:col-span-2">
              {selectedOwners.length === 0 ? (
                <div className="border-border text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed p-8 text-center">
                  <Users className="text-muted-foreground/60 mx-auto mb-2 h-8 w-8" />
                  <p className="text-sm font-medium">
                    No owners linked to this parcel yet.
                  </p>
                  <p className="mt-1 text-xs">
                    Please search existing owners or add a new one below.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {selectedOwners.map((owner, idx) => (
                    <div
                      key={idx}
                      className="border-border bg-muted/20 relative flex flex-col justify-between rounded-xl border p-4"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveOwner(idx)}
                        className="text-muted-foreground hover:text-destructive absolute right-3 top-3 transition-colors"
                        title="Remove Owner"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              owner.isNew
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-blue-500/10 text-blue-600'
                            }`}
                          >
                            {owner.isNew ? 'New' : 'Existing'}
                          </span>
                          <span className="text-muted-foreground font-mono text-xs">
                            {owner.isNew ? 'Will be created' : owner.ownerId}
                          </span>
                        </div>
                        <h4 className="text-foreground text-sm font-semibold">
                          {owner.name}
                        </h4>
                        <p className="text-muted-foreground mt-1 text-xs">
                          NIC: {owner.nic}
                        </p>
                        <p className="text-muted-foreground font-mono text-xs">
                          Contact: {owner.contact}
                        </p>
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                          Address: {owner.address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-border flex flex-wrap gap-3 border-t pt-4 md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  setShowOwnerPicker(true);
                  setShowNewOwnerForm(false);
                }}
                className="bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                Select Existing Owner
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNewOwnerForm(true);
                  setShowOwnerPicker(false);
                }}
                className="border-border hover:bg-muted text-foreground flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Owner
              </button>
            </div>

            {showOwnerPicker && (
              <div className="bg-muted/30 border-border space-y-4 rounded-xl border p-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Select Existing Property Owner
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowOwnerPicker(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Close
                  </button>
                </div>
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    className={`${inputCls} pl-9`}
                    placeholder="Search owners by Name, NIC, or Owner ID..."
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                  />
                </div>
                <div className="divide-border border-border bg-card max-h-48 divide-y overflow-y-auto rounded-lg border">
                  {ownerSearch && filteredExistingOwners.length === 0 ? (
                    <p className="text-muted-foreground p-4 text-center text-xs">
                      No owners match your search.
                    </p>
                  ) : !ownerSearch ? (
                    <p className="text-muted-foreground p-4 text-center text-xs">
                      Type in the search box to find registered owners.
                    </p>
                  ) : (
                    filteredExistingOwners.map((owner) => {
                      const alreadyAdded = selectedOwners.some(
                        (o) => o.nic === owner.nic,
                      );

                      return (
                        <div
                          key={owner.id}
                          className="flex items-center justify-between p-3 text-xs"
                        >
                          <div>
                            <p className="text-foreground font-semibold">
                              {owner.name}{' '}
                              <span className="text-muted-foreground font-mono font-normal">
                                ({owner.ownerId})
                              </span>
                            </p>
                            <p className="text-muted-foreground mt-0.5">
                              NIC: {owner.nic} | Contact: {owner.contact}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={alreadyAdded}
                            onClick={() => handleSelectExistingOwner(owner)}
                            className={`rounded px-3 py-1.5 font-medium transition-colors ${
                              alreadyAdded
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-hover text-white'
                            }`}
                          >
                            {alreadyAdded ? 'Added' : 'Select'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {showNewOwnerForm && (
              <div className="bg-muted/30 border-border space-y-4 rounded-xl border p-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Add New Property Owner Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewOwnerForm(false);
                      setNewOwnerErrors({});
                    }}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-foreground text-xs font-medium">
                      Full Name *
                    </label>
                    <input
                      className={inputCls}
                      placeholder="Owner Name"
                      value={newOwnerForm.name}
                      onChange={(e) =>
                        setNewOwnerForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                    {newOwnerErrors.name && (
                      <span className="text-destructive text-[10px]">
                        {newOwnerErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-foreground text-xs font-medium">
                      NIC No *
                    </label>
                    <input
                      className={inputCls}
                      placeholder="e.g. 199012345678"
                      value={newOwnerForm.nic}
                      onChange={(e) =>
                        setNewOwnerForm((p) => ({ ...p, nic: e.target.value }))
                      }
                    />
                    {newOwnerErrors.nic && (
                      <span className="text-destructive text-[10px]">
                        {newOwnerErrors.nic}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-foreground text-xs font-medium">
                      Contact Number *
                    </label>
                    <input
                      className={inputCls}
                      placeholder="e.g. 0771234567"
                      value={newOwnerForm.contact}
                      onChange={(e) =>
                        setNewOwnerForm((p) => ({
                          ...p,
                          contact: e.target.value,
                        }))
                      }
                    />
                    {newOwnerErrors.contact && (
                      <span className="text-destructive text-[10px]">
                        {newOwnerErrors.contact}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-foreground text-xs font-medium">
                      Address *
                    </label>
                    <input
                      className={inputCls}
                      placeholder="Permanent Address"
                      value={newOwnerForm.address}
                      onChange={(e) =>
                        setNewOwnerForm((p) => ({
                          ...p,
                          address: e.target.value,
                        }))
                      }
                    />
                    {newOwnerErrors.address && (
                      <span className="text-destructive text-[10px]">
                        {newOwnerErrors.address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAddNewOwner}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Owner to List
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resident Details */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader icon={Users} title="Resident Details" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="flex items-center gap-2 lg:col-span-2 md:col-span-1">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary/40 h-4 w-4"
                  checked={form.hasResidentialHouses}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      hasResidentialHouses: e.target.checked,
                    }))
                  }
                />
                <span className="text-foreground text-sm font-medium">
                  Is land has residential houses
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 lg:col-span-2 md:col-span-1">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary/40 h-4 w-4"
                  checked={form.isResidentOwner}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isResidentOwner: e.target.checked }))
                  }
                />
                <span className="text-foreground text-sm font-medium">
                  Are resident is owner
                </span>
              </label>
            </div>
          </div>

          {form.hasResidentialHouses && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t pt-4">
              {/* List of currently added residents */}
              <div className="space-y-3 md:col-span-2">
                {selectedResidents.length === 0 ? (
                  <div className="border-border text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed p-6 text-center">
                    <Users className="text-muted-foreground/60 mx-auto mb-2 h-7 w-7" />
                    <p className="text-sm font-medium">
                      No residents added to this parcel yet.
                    </p>
                    <p className="mt-1 text-xs">
                      Click "Add Resident" below to record people living on this
                      land.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {selectedResidents.map((res, idx) => (
                      <div
                        key={idx}
                        className="border-border bg-muted/20 relative flex flex-col justify-between rounded-xl border p-4"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveResident(idx)}
                          className="text-muted-foreground hover:text-destructive absolute right-3 top-3 transition-colors"
                          title="Remove Resident"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-600">
                              {res.relationship || 'resident'}
                            </span>
                          </div>
                          <h4 className="text-foreground text-sm font-semibold">
                            {res.name}
                          </h4>
                          {res.nic && (
                            <p className="text-muted-foreground mt-1 text-xs">
                              NIC: {res.nic}
                            </p>
                          )}
                          {res.contact && (
                            <p className="text-muted-foreground font-mono text-xs">
                              Contact: {res.contact}
                            </p>
                          )}
                          {res.address && (
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                              Address: {res.address}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-border flex flex-wrap gap-3 border-t pt-4 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowNewResidentForm(!showNewResidentForm)}
                  className="bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Resident
                </button>
              </div>

              {showNewResidentForm && (
                <div className="bg-muted/30 border-border space-y-4 rounded-xl border p-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      Add New Resident Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewResidentForm(false);
                        setNewResidentErrors({});
                      }}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-foreground text-xs font-medium">
                        Full Name *
                      </label>
                      <input
                        className={inputCls}
                        placeholder="Resident Name"
                        value={newResidentForm.name}
                        onChange={(e) =>
                          setNewResidentForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                      />
                      {newResidentErrors.name && (
                        <span className="text-destructive text-[10px]">
                          {newResidentErrors.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-foreground text-xs font-medium">
                        Relationship
                      </label>
                      <select
                        className={inputCls}
                        value={newResidentForm.relationship}
                        onChange={(e: any) =>
                          setNewResidentForm((p) => ({
                            ...p,
                            relationship: e.target.value,
                          }))
                        }
                      >
                        <option value="owner">Owner Resident</option>
                        <option value="tenant">Tenant</option>
                        <option value="family_member">Family Member</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-foreground text-xs font-medium">
                        NIC No
                      </label>
                      <input
                        className={inputCls}
                        placeholder="e.g. 199012345678"
                        value={newResidentForm.nic}
                        onChange={(e) =>
                          setNewResidentForm((p) => ({
                            ...p,
                            nic: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-foreground text-xs font-medium">
                        Contact Number
                      </label>
                      <input
                        className={inputCls}
                        placeholder="e.g. 0771234567"
                        value={newResidentForm.contact}
                        onChange={(e) =>
                          setNewResidentForm((p) => ({
                            ...p,
                            contact: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-foreground text-xs font-medium">
                        Address
                      </label>
                      <input
                        className={inputCls}
                        placeholder="Resident Address"
                        value={newResidentForm.address}
                        onChange={(e) =>
                          setNewResidentForm((p) => ({
                            ...p,
                            address: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleAddNewResident}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Resident to List
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Section: Land Documents ── */}
        {(() => {
          const formatBytes = (bytes: number, precision = 1) => {
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            const maxVal = Math.max(bytes, 0);
            const pow = Math.min(
              Math.floor((maxVal ? Math.log(maxVal) : 0) / Math.log(1024)),
              units.length - 1,
            );
            const val = maxVal / Math.pow(1024, pow);

            return `${val.toFixed(precision)} ${units[pow]}`;
          };

          const queuedDocs = queuedFiles.map((q) => ({
            id: q.id,
            name: q.file.name,
            type: q.file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
            category: q.category,
            uploadDate: new Date().toISOString().split('T')[0],
            size: formatBytes(q.file.size),
            isQueued: true,
          }));

          return (
            <div className="bg-card border-border overflow-hidden rounded-xl border">
              <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <FolderKanban className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold uppercase tracking-wide">
                      Land Documents
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Attach documents to this land parcel. Queued files will be
                      uploaded when you save the parcel.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="bg-primary hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Select File</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.dwg"
                      multiple
                    />
                  </label>
                </div>
              </div>

              {queuedDocs.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <FolderKanban className="text-muted-foreground h-5 w-5" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No documents selected for this parcel yet.
                  </p>
                </div>
              ) : (
                <div className="divide-border divide-y">
                  {queuedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="hover:bg-muted/10 flex items-center justify-between px-6 py-4 transition-colors"
                    >
                      <div className="mr-4 flex min-w-0 flex-1 items-center gap-3">
                        <div className="bg-secondary/15 text-secondary flex w-12 flex-shrink-0 items-center justify-center rounded p-2 text-center font-mono text-xs font-bold uppercase">
                          {doc.type}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">
                              {doc.name}
                            </p>
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                              Queued
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            Category: {doc.category} • Size: {doc.size} • Date:{' '}
                            {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQueuedFile(doc.id)}
                        className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                        title="Remove from queue"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Acquisition Info */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader icon={FileText} title="Acquisition Information" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Associated Project">
              <select
                className={inputCls}
                value={form.projectId}
                onChange={set('projectId')}
              >
                <option value="">Select Associated Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.projectId} - {project.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Acquisition Section / Act">
              <input
                className={inputCls}
                placeholder="e.g. Section 4 — Land Acquisition Act"
                value={form.acquisitionSection}
                onChange={set('acquisitionSection')}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Remarks">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="Any additional notes or observations about this parcel"
                  value={form.remarks}
                  onChange={set('remarks')}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Sticky bottom bar (mobile convenience) */}
        <div className="flex justify-end gap-3 pb-6 pt-2">
          <button
            type="button"
            onClick={() => router.visit('/land-parcels')}
            disabled={submitting}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Saving...' : 'Save Parcel'}
          </button>
        </div>
      </form>
    </div>
  );
}

AddLandParcel.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
