import { router, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
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
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import UnifiedMap from '@/components/UnifiedMap';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { alertInfo, toastError, toastSuccess } from '@/lib/alerts';
import { uploadDocument } from '@/services/documentManagementService';
import {
  createLandParcel,
  getLandParcels,
} from '@/services/landParcelManagementService';

import {
  createPropertyOwner,
  getPropertyOwners,
} from '@/services/propertyOwnerManagement';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';

const LAND_USE_TYPES = [
  { value: 'Agricultural', key: 'agricultural' },
  { value: 'Residential', key: 'residential' },
  { value: 'Commercial', key: 'commercial' },
  { value: 'Industrial', key: 'industrial' },
  { value: 'Forest Reserve', key: 'forest_reserve' },
  { value: 'Wetland', key: 'wetland' },
  { value: 'Bare Land', key: 'bare_land' },
  { value: 'Mixed Use', key: 'mixed_use' },
];

const TENURE_TYPES = [
  { value: 'Freehold', key: 'freehold' },
  { value: 'Leasehold', key: 'leasehold' },
  { value: 'Crown Land', key: 'crown_land' },
  { value: 'State Land', key: 'state_land' },
  { value: 'Temple Land', key: 'temple_land' },
  { value: 'Other', key: 'other' },
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
  isCasehold: boolean;
  caseNumber: string;
  caseStartDate: string;
  caseEndDate: string;
  caseStatus: string;
  isDonated: boolean;
  estimatedValue: string;
  landUseType: string;
  tenureType: string;
  projectId: string;
  acquisitionSection: string;
  remarks: string;
  latitude: string;
  longitude: string;
};

const EMPTY: FormData = {
  landName: '',
  landNumber: '',
  province: '',
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
  isCasehold: false,
  caseNumber: '',
  caseStartDate: '',
  caseEndDate: '',
  caseStatus: '',
  isDonated: false,
  estimatedValue: '',
  landUseType: '',
  tenureType: '',
  projectId: '',
  acquisitionSection: '',
  remarks: '',
  latitude: '',
  longitude: '',
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
  const { t } = useTranslation();

  const PROVINCES = useMemo(
    () => [
      {
        value: t('western'),
        label: t('western'),
        districts: [
          { value: t('colombo'), label: t('colombo') },
          { value: t('gampaha'), label: t('gampaha') },
          { value: t('kalutara'), label: t('kalutara') },
        ],
      },
      {
        value: t('central'),
        label: t('central'),
        districts: [
          { value: t('kandy'), label: t('kandy') },
          { value: t('matale'), label: t('matale') },
          { value: t('nuwara_eliya'), label: t('nuwara_eliya') },
        ],
      },
      {
        value: t('southern'),
        label: t('southern'),
        districts: [
          { value: t('galle'), label: t('galle') },
          { value: t('matara'), label: t('matara') },
          { value: t('hambantota'), label: t('hambantota') },
        ],
      },
      {
        value: t('northern'),
        label: t('northern'),
        districts: [
          { value: t('jaffna'), label: t('jaffna') },
          { value: t('kilinochchi'), label: t('kilinochchi') },
          { value: t('mannar'), label: t('mannar') },
          { value: t('mullaitivu'), label: t('mullaitivu') },
          { value: t('vavuniya'), label: t('vavuniya') },
        ],
      },
      {
        value: t('eastern'),
        label: t('eastern'),
        districts: [
          { value: t('ampara'), label: t('ampara') },
          { value: t('batticaloa'), label: t('batticaloa') },
          { value: t('trincomalee'), label: t('trincomalee') },
        ],
      },
      {
        value: t('north_western'),
        label: t('north_western'),
        districts: [
          { value: t('kurunegala'), label: t('kurunegala') },
          { value: t('puttalam'), label: t('puttalam') },
        ],
      },
      {
        value: t('north_central'),
        label: t('north_central'),
        districts: [
          { value: t('anuradhapura'), label: t('anuradhapura') },
          { value: t('polonnaruwa'), label: t('polonnaruwa') },
        ],
      },
      {
        value: t('uva'),
        label: t('uva'),
        districts: [
          { value: t('badulla'), label: t('badulla') },
          { value: t('monaragala'), label: t('monaragala') },
        ],
      },
      {
        value: t('sabaragamuwa'),
        label: t('sabaragamuwa'),
        districts: [
          { value: t('kegalle'), label: t('kegalle') },
          { value: t('ratnapura'), label: t('ratnapura') },
        ],
      },
    ],
    [t],
  );

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [planFile, setPlanFile] = useState<File | null>(null);

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
      errs.name = t('resident_name_required', 'Resident name is required');
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

  const syncOwnerResidents = (
    owners: any[],
    hasHouses: boolean,
    isResOwner: boolean,
    prevResidents: any[],
  ) => {
    if (hasHouses && isResOwner) {
      const nonOwnerResidents = prevResidents.filter(
        (r) => r.relationship !== 'owner',
      );

      const ownerResidents = owners.map((owner) => ({
        name: owner.name,
        nic: owner.nic || null,
        contact: owner.contact || null,
        address: owner.address || null,
        relationship: 'owner' as const,
      }));

      return [...ownerResidents, ...nonOwnerResidents];
    }

    return prevResidents.filter((r) => r.relationship !== 'owner');
  };

  const handleRemoveResident = (index: number) => {
    const residentToRemove = selectedResidents[index];

    if (residentToRemove?.relationship === 'owner' && form.isResidentOwner) {
      const remainingOwnerResidents = selectedResidents.filter(
        (r, i) => i !== index && r.relationship === 'owner',
      );

      if (remainingOwnerResidents.length === 0) {
        setForm((f) => ({ ...f, isResidentOwner: false }));
      }
    }

    setSelectedResidents((prev) => prev.filter((_, i) => i !== index));
  };

  const generateNextLandNumber = (parcels: any[]) => {
    const currentYear = new Date().getFullYear();
    const prefix = `LND/${currentYear}/`;

    // Find all parcel_ids matching the pattern LND/YYYY/NNN
    const matchRegex = new RegExp(`^LND/${currentYear}/(\\d+)$`);
    let maxNum = 0;

    parcels.forEach((p) => {
      if (p.parcel_id) {
        const match = String(p.parcel_id).match(matchRegex);

        if (match) {
          const num = parseInt(match[1], 10);

          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    });

    const nextNum = maxNum + 1;
    const paddedNum = String(nextNum).padStart(3, '0');

    return `${prefix}${paddedNum}`;
  };

  // Fetch property owners and existing land parcels to auto-generate land number
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ownerData, parcelData] = await Promise.all([
          getPropertyOwners(),
          getLandParcels(),
        ]);
        setExistingOwners(ownerData);

        const generatedNum = generateNextLandNumber(parcelData);
        setForm((f) => ({
          ...f,
          landNumber: generatedNum,
        }));
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchData();
  }, []);

  const handleMapChange = (lat: string, lng: string) => {
    setForm((f) => ({
      ...f,
      latitude: lat,
      longitude: lng,
    }));
  };

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
      errs.name = t('owner_name_required', 'Name is required');
    }

    if (!newOwnerForm.nic.trim()) {
      errs.nic = t('owner_nic_required', 'NIC is required');
    }

    if (!newOwnerForm.contact.trim()) {
      errs.contact = t('owner_contact_required', 'Contact is required');
    }

    if (!newOwnerForm.address.trim()) {
      errs.address = t('owner_address_required', 'Address is required');
    }

    if (
      selectedOwners.some(
        (o) => o.nic?.toLowerCase() === newOwnerForm.nic.toLowerCase().trim(),
      )
    ) {
      errs.nic = t('owner_added_error', 'This owner is already added');
    }

    if (
      existingOwners.some(
        (o) => o.nic?.toLowerCase() === newOwnerForm.nic.toLowerCase().trim(),
      )
    ) {
      errs.nic = t(
        'owner_exists_db_error',
        'An owner with this NIC already exists in the database. Use search instead.',
      );
    }

    if (Object.keys(errs).length > 0) {
      setNewOwnerErrors(errs);

      return;
    }

    const newOwnerObj = {
      isNew: true,
      name: newOwnerForm.name.trim(),
      nic: newOwnerForm.nic.trim(),
      contact: newOwnerForm.contact.trim(),
      address: newOwnerForm.address.trim(),
    };

    const newOwners = [...selectedOwners, newOwnerObj];
    setSelectedOwners(newOwners);
    setSelectedResidents((prev) =>
      syncOwnerResidents(
        newOwners,
        form.hasResidentialHouses,
        form.isResidentOwner,
        prev,
      ),
    );

    setNewOwnerForm({ name: '', nic: '', contact: '', address: '' });
    setNewOwnerErrors({});
    setShowNewOwnerForm(false);
  };

  const handleSelectExistingOwner = (owner: PropertyOwner) => {
    if (selectedOwners.some((o) => o.nic === owner.nic)) {
      toastError(
        t(
          'owner_added_parcel_error',
          'This owner is already added to the parcel.',
        ),
      );

      return;
    }

    const newOwnerObj = {
      id: owner.id,
      ownerId: owner.ownerId,
      isNew: false,
      name: owner.name,
      nic: owner.nic,
      contact: owner.contact,
      address: owner.address,
    };

    const newOwners = [...selectedOwners, newOwnerObj];
    setSelectedOwners(newOwners);
    setSelectedResidents((prev) =>
      syncOwnerResidents(
        newOwners,
        form.hasResidentialHouses,
        form.isResidentOwner,
        prev,
      ),
    );
    setOwnerSearch('');
    setShowOwnerPicker(false);
  };

  const handleRemoveOwner = (index: number) => {
    const newOwners = selectedOwners.filter((_, i) => i !== index);
    setSelectedOwners(newOwners);
    setSelectedResidents((prev) =>
      syncOwnerResidents(
        newOwners,
        form.hasResidentialHouses,
        form.isResidentOwner,
        prev,
      ),
    );
  };

  const filteredExistingOwners = useMemo(() => {
    const q = ownerSearch.toLowerCase().trim();

    if (!q) {
      return [];
    }

    return existingOwners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(q) ||
        owner.nic?.toLowerCase().includes(q) ||
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
      errs.landNumber = t('land_number_required', 'Land Number is required');
    }

    if (!form.district) {
      errs.district = t('district_required', 'District is required');
    }

    if (!form.divisionalSecretariat.trim()) {
      errs.divisionalSecretariat = t(
        'div_sec_required',
        'Divisional Secretariat is required',
      );
    }

    if (!form.village.trim()) {
      errs.village = t('village_required', 'Village is required');
    }

    if (!form.extentAcres.trim()) {
      errs.extentAcres = t(
        'extent_acres_required',
        'Extent (acres) is required',
      );
    }

    if (!form.landUseType) {
      errs.landUseType = t(
        'land_use_type_required',
        'Land use type is required',
      );
    }

    if (!form.tenureType) {
      errs.tenureType = t('tenure_type_required', 'Tenure type is required');
    }

    if (selectedOwners.length === 0) {
      toastError(
        t(
          'min_one_owner_error',
          'You must add or select at least one property owner.',
        ),
      );

      return false;
    }

    if (!planFile) {
      toastError(
        form.hasPlan
          ? t(
              'upload_copy_of_plan_error',
              'You must upload a copy of the land parcel plan.',
            )
          : t(
              'upload_simple_sketch_error',
              'You must upload a simple sketch of the land parcel.',
            ),
      );

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

      const payload = {
        parcel_id: form.landNumber,
        land_name:
          form.landName ||
          t('land_parcel_name_generated', 'Land Parcel {number}').replace(
            '{number}',
            form.landNumber,
          ),
        province: form.province || t('southern_default', 'Southern'),
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
        cultivation: form.isCultivated
          ? form.cultivation || t('n_a', 'N/A')
          : t('n_a', 'N/A'),
        cultivation_status: form.isCultivated
          ? form.cultivationStatus
          : 'unspecified',
        annual_income: form.isCultivated ? Number(form.annualIncome) || 0 : 0,
        land_type:
          form.landType ||
          form.landUseType ||
          t('standard_land_type', 'Standard'),
        is_casehold: form.isCasehold,
        case_number: form.isCasehold ? form.caseNumber || null : null,
        case_start_date: form.isCasehold ? form.caseStartDate || null : null,
        case_end_date: form.isCasehold ? form.caseEndDate || null : null,
        case_status: form.isCasehold ? form.caseStatus || null : null,
        is_donated: form.isDonated,
        estimated_value: Number(form.estimatedValue) || 0,
        remarks: form.remarks || null,
        status: 'available' as const,
        project_id: form.projectId ? form.projectId : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        property_owner_ids: finalOwnerIds,
        residents: selectedResidents,
      };

      const createdParcel = await createLandParcel(payload);
      const createdParcelId = createdParcel?.id ?? null;

      // Upload the plan/sketch document
      if (planFile && createdParcelId) {
        await uploadDocument(
          planFile,
          String(userId || ''),
          form.projectId ? String(form.projectId) : null,
          form.hasPlan ? 'survey' : 'sketch',
          String(createdParcelId),
        );
      }

      // Upload documents after the land parcel is created, so we can link them
      if (queuedFiles.length > 0 && createdParcelId) {
        for (let i = 0; i < queuedFiles.length; i++) {
          const item = queuedFiles[i];
          await uploadDocument(
            item.file,
            String(userId || ''),
            form.projectId ? String(form.projectId) : null,
            item.category,
            String(createdParcelId),
          );
        }
      }

      toastSuccess(
        t('land_parcel_created_success', 'Land parcel created successfully!'),
      );
      router.visit('/land-parcels');
    } catch (error: any) {
      console.error('Failed to create land parcel:', error);

      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        const errorMessages: string[] = [];
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
            const readableKey = key.replace(/_/g, ' ').toUpperCase();
            errorMessages.push(`• ${readableKey}: ${val[0]}`);
          }
        });
        setErrors(backendErrors);
        await alertInfo(
          t('validation_error_title', 'Validation Error'),
          errorMessages.join('\n'),
        );
      } else if (error.response?.data?.message) {
        setErrors({ landNumber: error.response.data.message });
        toastError(`Error: ${error.response.data.message}`);
      } else {
        setErrors({
          landNumber: t(
            'generic_error_saving',
            'An error occurred while saving the land parcel.',
          ),
        });
        toastError(
          t(
            'save_parcel_error',
            'An error occurred while saving the land parcel. Please verify your inputs.',
          ),
        );
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
            title={t('back_to_land_parcels', 'Back to Land Parcels')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1>{t('add_land_parcel')}</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {t('register_a_new_land_parcel_to_system')}
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
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="add-parcel-form"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? t('saving') : t('save_parcel')}
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
          <SectionHeader icon={MapPin} title={t('location_details')} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label={t('land_name')}>
              <input
                className={inputCls}
                placeholder={t('watta_land_example')}
                value={form.landName}
                onChange={set('landName')}
              />
            </Field>

            <Field label={t('land_number')} required>
              <input
                className={inputCls}
                placeholder="e.g. LND/2026/001"
                value={form.landNumber}
                onChange={set('landNumber')}
              />
              {errMsg('landNumber')}
            </Field>

            <Field label={t('province')}>
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
                <option value="">{t('select_province')}</option>
                {PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t('district')} required>
              <select
                className={inputCls}
                value={form.district}
                onChange={set('district')}
                disabled={!form.province}
              >
                <option value="">{t('select_district')}</option>
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

            <Field label={t('divisional_secretariat')} required>
              <input
                className={inputCls}
                placeholder={t('galle_four_gravets_example')}
                value={form.divisionalSecretariat}
                onChange={set('divisionalSecretariat')}
              />
              {errMsg('divisionalSecretariat')}
            </Field>

            <Field label={t('gn_division')}>
              <input
                className={inputCls}
                placeholder={t('gn_division_example')}
                value={form.gramaNiladhari}
                onChange={set('gramaNiladhari')}
              />
            </Field>

            <Field label={t('village')} required>
              <input
                className={inputCls}
                placeholder={t('village_example')}
                value={form.village}
                onChange={set('village')}
              />
              {errMsg('village')}
            </Field>

            <Field label={t('latitude')}>
              <input
                className={inputCls}
                type="number"
                step="any"
                placeholder={`${t('example')} 6.053500`}
                value={form.latitude}
                onChange={set('latitude')}
              />
            </Field>

            <Field label={t('longitude')}>
              <input
                className={inputCls}
                type="number"
                step="any"
                placeholder={`${t('example')} 80.221000`}
                value={form.longitude}
                onChange={set('longitude')}
              />
            </Field>

            <div className="mt-2 md:col-span-2 lg:col-span-3">
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {t(
                  'google_map_title',
                  'Map Location (Click map to pin / drag marker)',
                )}
              </label>
              <div
                className="border-border bg-muted/20 animate-in fade-in w-full overflow-hidden rounded-xl border"
                style={{ minHeight: '320px', height: '320px' }}
              >
                <UnifiedMap
                  latitude={form.latitude}
                  longitude={form.longitude}
                  zoom={12}
                  editable={true}
                  onChange={handleMapChange}
                  height="100%"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Parcel Details */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader icon={Layers} title={t('parcel_details')} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label={`${t('extent')} — ${t('acres')}`} required>
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

            <Field label={`${t('extent')} — ${t('roods')}`}>
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

            <Field label={`${t('extent')} — ${t('perches')}`}>
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

            <Field label={t('full_land_size')}>
              <input
                className={`${inputCls} bg-muted/40 cursor-not-allowed`}
                type="text"
                readOnly
                value={`${fullLandSizePerches.toFixed(2)} Perches`}
              />
            </Field>

            <div className="flex items-center gap-2 py-2 md:col-span-2 lg:col-span-4">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  className="border-border text-primary focus:ring-primary/40 h-4 w-4 rounded"
                  checked={form.hasPlan}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, hasPlan: e.target.checked }));
                    setPlanFile(null);
                  }}
                />
                <span className="text-foreground text-sm font-medium">
                  {t('does_land_have_plan')}
                </span>
              </label>
            </div>

            <div className="bg-muted/20 border-border/80 rounded-lg border p-4 md:col-span-2 lg:col-span-4">
              <div className="flex flex-col gap-2">
                <label className="text-foreground text-sm font-semibold">
                  {form.hasPlan
                    ? `${t('attach_copy_of_plan')}`
                    : `${t('attach_a_simple_sketch_of_land_parcel')}`}
                </label>
                <p className="text-muted-foreground text-xs">
                  {form.hasPlan
                    ? `${t('copy_of_plan_is_required')}`
                    : `${t('simple_sketch_of_plan_required')}`}
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <label className="bg-primary hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{t('choose_file')}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          setPlanFile(file);
                        }
                      }}
                    />
                  </label>
                  {planFile ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        {t('attached')} <strong>{planFile.name}</strong> (
                        {(planFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <span>{t('no_file_attached')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {form.hasPlan ? (
              <>
                <Field label={t('plan_number')} required>
                  <input
                    className={inputCls}
                    placeholder={`${t('example')} P/2024/001`}
                    value={form.planNumber}
                    onChange={set('planNumber')}
                  />
                  {errMsg('planNumber')}
                </Field>

                <Field label={t('parcel_numbers')}>
                  <input
                    className={inputCls}
                    placeholder={`${t('example')} 1, 2, 3`}
                    value={form.parcelNumbers}
                    onChange={set('parcelNumbers')}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field label={`${t('boundary')} — ${t('north')}`}>
                  <input
                    className={inputCls}
                    placeholder={`${t('example')} ${t('main_road')}`}
                    value={form.boundariesNorth}
                    onChange={set('boundariesNorth')}
                  />
                </Field>

                <Field label={`${t('boundary')} — ${t('south')}`}>
                  <input
                    className={inputCls}
                    placeholder={`${t('example')} ${t('river')}`}
                    value={form.boundariesSouth}
                    onChange={set('boundariesSouth')}
                  />
                </Field>

                <Field label={`${t('boundary')} — ${t('east')}`}>
                  <input
                    className={inputCls}
                    placeholder={`${t('example')} ${t('land_of_silva')}`}
                    value={form.boundariesEast}
                    onChange={set('boundariesEast')}
                  />
                </Field>

                <Field label={`${t('boundary')} — ${t('west')}`}>
                  <input
                    className={inputCls}
                    placeholder={`${t('example')} ${t('temple_land_example')}`}
                    value={form.boundariesWest}
                    onChange={set('boundariesWest')}
                  />
                </Field>
              </>
            )}

            <div className="flex items-center gap-2 py-2 md:col-span-2 lg:col-span-4">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  className="border-border text-primary focus:ring-primary/40 h-4 w-4 rounded"
                  checked={form.isCultivated}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isCultivated: e.target.checked }))
                  }
                />
                <span className="text-foreground text-sm font-medium">
                  {t('does_land_has_cultivation')}
                </span>
              </label>
            </div>

            {form.isCultivated && (
              <>
                <Field label={t('cultivation_details')}>
                  <input
                    className={inputCls}
                    placeholder={`${t('example')} ${t('coconut')}, ${t('paddy')}`}
                    value={form.cultivation}
                    onChange={set('cultivation')}
                  />
                </Field>

                <Field label={t('cultivation_status')}>
                  <select
                    className={inputCls}
                    value={form.cultivationStatus}
                    onChange={set('cultivationStatus')}
                  >
                    <option value="unspecified">{t('unspecified')}</option>
                    <option value="fertile">{t('fertile')}</option>
                    <option value="mid">{t('mid')}</option>
                    <option value="infertile">{t('infertile')}</option>
                  </select>
                </Field>

                <Field label={t('annual_income')}>
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

            <div className="md:col-start-1 lg:col-start-1">
              <Field label={t('estimated_value')}>
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

            <Field label={t('land_use_type')} required>
              <select
                className={inputCls}
                value={form.landUseType}
                onChange={set('landUseType')}
              >
                <option value="">{t('select_type')}</option>
                {LAND_USE_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {t(item.key)}
                  </option>
                ))}
              </select>
              {errMsg('landUseType')}
            </Field>

            <Field label={t('tenure_type')} required>
              <select
                className={inputCls}
                value={form.tenureType}
                onChange={set('tenureType')}
              >
                <option value="">{t('select_tenure')}</option>
                {TENURE_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {t(item.key)}
                  </option>
                ))}
              </select>
              {errMsg('tenureType')}
            </Field>

            <div className="flex items-center gap-2 py-2 md:col-span-2 lg:col-span-4">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  className="border-border text-primary focus:ring-primary/40 h-4 w-4 rounded"
                  checked={form.isCasehold}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isCasehold: e.target.checked }))
                  }
                />
                <span className="text-foreground text-sm font-medium">
                  {t('land_under_litigation')}
                </span>
              </label>
            </div>

            {form.isCasehold && (
              <>
                <Field label={t('case_number')}>
                  <input
                    className={inputCls}
                    placeholder="e.g. CASE/2026/001"
                    value={form.caseNumber}
                    onChange={set('caseNumber')}
                  />
                </Field>

                <Field label={t('case_start_date')}>
                  <input
                    className={inputCls}
                    type="date"
                    value={form.caseStartDate}
                    onChange={set('caseStartDate')}
                  />
                </Field>

                <Field label={t('case_end_date')}>
                  <input
                    className={inputCls}
                    type="date"
                    value={form.caseEndDate}
                    onChange={set('caseEndDate')}
                  />
                </Field>

                <Field label={t('case_status')}>
                  <select
                    className={inputCls}
                    value={form.caseStatus}
                    onChange={set('caseStatus')}
                  >
                    <option value="">{t('select_case_status')}</option>
                    <option value="pending">{t('case_pending')}</option>
                    <option value="ongoing">{t('case_ongoing')}</option>
                    <option value="resolved">{t('case_resolved')}</option>
                    <option value="dismissed">{t('case_dismissed')}</option>
                  </select>
                </Field>
              </>
            )}

            <div className="flex items-center gap-2 py-2 md:col-span-2 lg:col-span-4">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  className="border-border text-primary focus:ring-primary/40 h-4 w-4 rounded"
                  checked={form.isDonated}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isDonated: e.target.checked }))
                  }
                />
                <span className="text-foreground text-sm font-medium">
                  {t('donated_land')}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Owner Details */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader icon={User} title={t('owner_details')} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* List of currently added owners */}
            <div className="space-y-3 md:col-span-2">
              {selectedOwners.length === 0 ? (
                <div className="border-border text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed p-8 text-center">
                  <Users className="text-muted-foreground/60 mx-auto mb-2 h-8 w-8" />
                  <p className="text-sm font-medium">
                    {t('no_owners_linked_to_parcel')}
                  </p>
                  <p className="mt-1 text-xs">
                    {t('please_search_or_add_new_one')}
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
                        title={t('remove_owner_tooltip', 'Remove Owner')}
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
                            {owner.isNew
                              ? t('new_label', 'New')
                              : t('existing_label', 'Existing')}
                          </span>
                          <span className="text-muted-foreground font-mono text-xs">
                            {owner.isNew
                              ? t('will_be_created', 'Will be created')
                              : owner.ownerId}
                          </span>
                        </div>
                        <h4 className="text-foreground text-sm font-semibold">
                          {owner.name}
                        </h4>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {t('nic', 'NIC')}: {owner.nic}
                        </p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {t('contact', 'Contact')}: {owner.contact}
                        </p>
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                          {t('address', 'Address')}: {owner.address}
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
                {t('select_existing_owner')}
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
                {t('add_new_owner')}
              </button>
            </div>

            {showOwnerPicker && (
              <div className="bg-muted/30 border-border space-y-4 rounded-xl border p-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('select_existing_property_owner')}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowOwnerPicker(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    {t('close')}
                  </button>
                </div>
                <div className="relative">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    className={`${inputCls} pl-9`}
                    placeholder={t('search_owner_placeholder')}
                    value={ownerSearch}
                    onChange={(e) => setOwnerSearch(e.target.value)}
                  />
                </div>
                <div className="divide-border border-border bg-card max-h-48 divide-y overflow-y-auto rounded-lg border">
                  {ownerSearch && filteredExistingOwners.length === 0 ? (
                    <p className="text-muted-foreground p-4 text-center text-xs">
                      {t('no_owners_match_search')}
                    </p>
                  ) : !ownerSearch ? (
                    <p className="text-muted-foreground p-4 text-center text-xs">
                      {t('type_in_searchbox_to_search_owners')}
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
                              {t('nic')}: {owner.nic} | {t('contact_number')}:{' '}
                              {owner.contact}
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
                            {alreadyAdded ? t('added') : t('select')}
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
                    {t('add_new_property_owner_details')}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewOwnerForm(false);
                      setNewOwnerErrors({});
                    }}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    {t('close')}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-foreground text-xs font-medium">
                      {`${t('full_name')} *`}
                    </label>
                    <input
                      className={inputCls}
                      placeholder={t('owner_name')}
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
                      {`${t('nic')} *`}
                    </label>
                    <input
                      className={inputCls}
                      placeholder={`${t('example')} 199012345678`}
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
                      {`${t('contact_number')} *`}
                    </label>
                    <input
                      className={inputCls}
                      placeholder={`${t('example')} 0771234567`}
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
                      {`${t('address')} *`}
                    </label>
                    <input
                      className={inputCls}
                      placeholder={t('permanant_address')}
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
                    {t('add_owner_to_list')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resident Details */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader icon={Users} title={t('resident_details')} />
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 md:col-span-1 lg:col-span-2">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  className="border-border text-primary focus:ring-primary/40 h-4 w-4 rounded"
                  checked={form.hasResidentialHouses}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newIsResOwner = checked
                      ? form.isResidentOwner
                      : false;
                    setForm((f) => ({
                      ...f,
                      hasResidentialHouses: checked,
                      isResidentOwner: newIsResOwner,
                    }));
                    setSelectedResidents((prev) =>
                      syncOwnerResidents(
                        selectedOwners,
                        checked,
                        newIsResOwner,
                        prev,
                      ),
                    );
                  }}
                />
                <span className="text-foreground text-sm font-medium">
                  {t('is_land_has_residential_houses')}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 md:col-span-1 lg:col-span-2">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  className="border-border text-primary focus:ring-primary/40 h-4 w-4 rounded"
                  checked={form.isResidentOwner}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newHasHouses = checked
                      ? true
                      : form.hasResidentialHouses;
                    setForm((f) => ({
                      ...f,
                      isResidentOwner: checked,
                      hasResidentialHouses: newHasHouses,
                    }));
                    setSelectedResidents((prev) =>
                      syncOwnerResidents(
                        selectedOwners,
                        newHasHouses,
                        checked,
                        prev,
                      ),
                    );
                  }}
                />
                <span className="text-foreground text-sm font-medium">
                  {t('is_resident_owner')}
                </span>
              </label>
            </div>
          </div>

          {form.hasResidentialHouses && (
            <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
              {/* List of currently added residents */}
              <div className="space-y-3 md:col-span-2">
                {selectedResidents.length === 0 ? (
                  <div className="border-border text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed p-6 text-center">
                    <Users className="text-muted-foreground/60 mx-auto mb-2 h-7 w-7" />
                    <p className="text-sm font-medium">
                      {t('no_residents_added_to_this_parcel_yet')}
                    </p>
                    <p className="mt-1 text-xs">
                      {t('click_add_residents_to_add_residents')}
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
                          title={t(
                            'remove_resident_tooltip',
                            'Remove Resident',
                          )}
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
                              {t('nic')}: {res.nic}
                            </p>
                          )}
                          {res.contact && (
                            <p className="text-muted-foreground font-mono text-xs">
                              {t('contact_number')}: {res.contact}
                            </p>
                          )}
                          {res.address && (
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                              {t('address')}: {res.address}
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
                  {t('add_resident')}
                </button>
              </div>

              {showNewResidentForm && (
                <div className="bg-muted/30 border-border space-y-4 rounded-xl border p-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      {t('add_new_resident_details')}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewResidentForm(false);
                        setNewResidentErrors({});
                      }}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      {t('close')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-foreground text-xs font-medium">
                        {t('full_name')} *
                      </label>
                      <input
                        className={inputCls}
                        placeholder={t('full_name')}
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
                        {t('relationship')}
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
                        <option value="owner">{t('owner_resident')}</option>
                        <option value="tenant">{t('tenant')}</option>
                        <option value="family_member">
                          {t('family_member')}
                        </option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-foreground text-xs font-medium">
                        {t('nic')}
                      </label>
                      <input
                        className={inputCls}
                        placeholder={`${t('example')} 199012345678`}
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
                        {t('contact_number')}
                      </label>
                      <input
                        className={inputCls}
                        placeholder={`${t('example')} 0771234567`}
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
                        {t('resident_address')}
                      </label>
                      <input
                        className={inputCls}
                        placeholder={t('resident_address')}
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
                      {t('add_resident_to_list')}
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
                      {t('land_documents')}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {t('attach_documents_to_this_land_parcel')}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="bg-primary hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{t('select_file')}</span>
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
                              {t('queued')}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {t('category')}: {doc.category} • {t('size')}:{' '}
                            {doc.size} • {t('date')}: {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQueuedFile(doc.id)}
                        className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                        title={t(
                          'remove_from_queue_tooltip',
                          'Remove from queue',
                        )}
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
        {/* <div className="bg-card border-border rounded-xl border p-6">
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
        </div> */}

        {/* Sticky bottom bar (mobile convenience) */}
        <div className="flex justify-end gap-3 pb-6 pt-2">
          <button
            type="button"
            onClick={() => router.visit('/land-parcels')}
            disabled={submitting}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? t('saving') : t('save_parcel')}
          </button>
        </div>
      </form>
    </div>
  );
}

AddLandParcel.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
