import { router } from '@inertiajs/react';
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
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { createLandParcel } from '@/services/landParcelManagementService';
import { getProjects } from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';
import {
  createPropertyOwner,
  getPropertyOwners,
} from '@/services/propertyOwnerManagement';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';

const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
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
  surveyPlanNo: string;
  lotNo: string;
  district: string;
  divisionalSecretariat: string;
  gramaNiladhari: string;
  village: string;
  extentAcres: string;
  extentPerches: string;
  landUseType: string;
  tenureType: string;
  assessmentNo: string;
  titleDeedNo: string;
  projectId: string;
  acquisitionSection: string;
  remarks: string;
};

const EMPTY: FormData = {
  surveyPlanNo: '',
  lotNo: '',
  district: '',
  divisionalSecretariat: '',
  gramaNiladhari: '',
  village: '',
  extentAcres: '',
  extentPerches: '',
  landUseType: '',
  tenureType: '',
  assessmentNo: '',
  titleDeedNo: '',
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

  const validate = () => {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (!form.surveyPlanNo.trim()) {
      errs.surveyPlanNo = 'Survey Plan No is required';
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

      const payload = {
        parcel_id: form.surveyPlanNo,
        lot_no: form.lotNo || '-',
        district: form.district,
        division: form.divisionalSecretariat,
        village: form.village,
        extent_acers: form.extentAcres,
        extent_perches: form.extentPerches || '0',
        remarks: form.remarks || null,
        status: 'available' as const,
        project_id: form.projectId ? form.projectId : null,
        property_owner_ids: finalOwnerIds,
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
            fieldName = 'surveyPlanNo';
          }

          if (key === 'lot_no') {
            fieldName = 'lotNo';
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
        setErrors({ surveyPlanNo: error.response.data.message });
      } else {
        setErrors({
          surveyPlanNo: 'An error occurred while saving the land parcel.',
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
            <Field label="Survey Plan No" required>
              <input
                className={inputCls}
                placeholder="e.g. 123/4A"
                value={form.surveyPlanNo}
                onChange={set('surveyPlanNo')}
              />
              {errMsg('surveyPlanNo')}
            </Field>

            <Field label="Lot No">
              <input
                className={inputCls}
                placeholder="e.g. Lot 3"
                value={form.lotNo}
                onChange={set('lotNo')}
              />
            </Field>

            <Field label="District" required>
              <select
                className={inputCls}
                value={form.district}
                onChange={set('district')}
              >
                <option value="">Select District</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            <Field label="Assessment No">
              <input
                className={inputCls}
                placeholder="Local authority assessment no"
                value={form.assessmentNo}
                onChange={set('assessmentNo')}
              />
            </Field>

            <Field label="Title Deed No">
              <input
                className={inputCls}
                placeholder="Deed reference number"
                value={form.titleDeedNo}
                onChange={set('titleDeedNo')}
              />
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
