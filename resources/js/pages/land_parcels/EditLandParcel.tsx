import { router, usePage, Link } from '@inertiajs/react';
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
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import {
  confirmDialog,
  alertInfo,
  toastError,
  toastSuccess,
} from '@/lib/alerts';
import {
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from '@/services/documentManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';
import {
  getLandParcel,
  updateLandParcel,
} from '@/services/landParcelManagementService';
import type { Document } from '@/services/projectsManagementService';
import {
  createPropertyOwner,
  getPropertyOwners,
} from '@/services/propertyOwnerManagement';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';


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
  latitude: string;
  longitude: string;
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

export default function EditLandParcel({ id }: { id: string }) {
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

  const [form, setForm] = useState<FormData>(EMPTY);
  const [parcel, setParcel] = useState<LandParcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [statusError, setStatusError] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [planFile, setPlanFile] = useState<File | null>(null);

  // Document upload state
  const [queuedFiles, setQueuedFiles] = useState<
    { id: string; file: File; category: string }[]
  >([]);
  const [parcelDocuments, setParcelDocuments] = useState<Document[]>([]);

  // Google Map refs
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userId = user?.id;
  const userRole = user?.role?.role_name || 'User';

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

  const refreshDocuments = async () => {
    try {
      const data = await getLandParcel(id);

      if (data.documents) {
        setParcelDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to refresh documents:', error);
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      await downloadDocument(docId, filename);
    } catch (error) {
      console.error('Failed to download document:', error);
      toastError(t('failed_download_document', 'Failed to download document.'));
    }
  };

  const handleDelete = async (docId: string, isQueued: boolean) => {
    if (isQueued) {
      handleRemoveQueuedFile(docId);

      return;
    }

    const confirmed = await confirmDialog({
      title: t('delete_document_title', 'Delete Document'),
      text: t('delete_document_confirm_details', 'Are you sure you want to delete this document?'),
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await deleteDocument(docId);
      await refreshDocuments();
      toastSuccess(t('document_deleted_success', 'Document deleted successfully.'));
    } catch (error) {
      console.error('Failed to delete document:', error);
      toastError(t('failed_delete_document', 'Failed to delete document.'));
    } finally {
      setLoading(false);
    }
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

  // Fetch projects, property owners, and land parcel details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setUnauthorized(false);
        setStatusError(false);

        const [ownerData, parcelData] = await Promise.all([
          getPropertyOwners(),
          getLandParcel(id),
        ]);

        if (userRole !== 'DO') {
          setUnauthorized(true);
          setLoading(false);

          return;
        }

        if (parcelData.status !== 'available') {
          setStatusError(true);
          setLoading(false);

          return;
        }

        setExistingOwners(ownerData);
        setParcel(parcelData);

        if (parcelData.documents) {
          setParcelDocuments(parcelData.documents);
        }

        // Map values into form state
        setForm({
          landName: parcelData.land_name || '',
          landNumber: parcelData.parcel_id || '',
          province: parcelData.province || 'Southern',
          district: parcelData.district || '',
          divisionalSecretariat:
            parcelData.divisional_secretariat || parcelData.division || '',
          gramaNiladhari: parcelData.grama_niladari_division || '',
          village: parcelData.village || '',
          extentAcres:
            parcelData.land_size_acers || parcelData.extent_acers || '',
          extentRoods: parcelData.land_size_roods || '0',
          extentPerches:
            parcelData.land_size_perches || parcelData.extent_perches || '',
          hasPlan: Boolean(parcelData.has_plan),
          planNumber: parcelData.plan_number || '',
          parcelNumbers: parcelData.parcel_numbers
            ? parcelData.parcel_numbers.join(', ')
            : '',
          boundariesNorth: parcelData.boundaries_north || '',
          boundariesSouth: parcelData.boundaries_south || '',
          boundariesEast: parcelData.boundaries_east || '',
          boundariesWest: parcelData.boundaries_west || '',
          hasResidentialHouses: Boolean(parcelData.has_residential_houses),
          isResidentOwner: Boolean(parcelData.is_resident_owner),
          isCultivated: Boolean(
            parcelData.is_cultivated ||
            (parcelData.cultivation && parcelData.cultivation !== 'N/A'),
          ),
          cultivation: parcelData.cultivation || '',
          cultivationStatus: parcelData.cultivation_status || 'unspecified',
          annualIncome: parcelData.annual_income
            ? String(parcelData.annual_income)
            : '',
          landType: parcelData.land_type || '',
          estimatedValue: parcelData.estimated_value
            ? String(parcelData.estimated_value)
            : '',
          landUseType: parcelData.land_type || 'Standard',
          tenureType: 'Freehold',
          projectId: parcelData.project_id ? String(parcelData.project_id) : '',
          acquisitionSection: '',
          remarks: parcelData.remarks || '',
          latitude: parcelData.latitude ? String(parcelData.latitude) : '',
          longitude: parcelData.longitude ? String(parcelData.longitude) : '',
        });

        setSelectedOwners(parcelData.owners || []);
        setSelectedResidents(parcelData.residents || []);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, userRole]);

  // Store initial form coordinates in a ref to prevent re-running map loader effect
  const initialCoords = useRef({
    latitude: '',
    longitude: '',
  });

  // Load Google Maps API and initialize map
  useEffect(() => {
    if (loading || !parcel || unauthorized || statusError) {
      return;
    }

    initialCoords.current = {
      latitude: form.latitude,
      longitude: form.longitude,
    };

    const apiKey = (import.meta as any).env.VITE_GOOGLE_MAP_API_KEY || '';
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initEditLandParcelMapCallback`;

    // Default center in Galle, Sri Lanka (Southern Province)
    const defaultLat = 6.0535;
    const defaultLng = 80.221;

    (window as any).initEditLandParcelMapCallback = () => {
      const mapContainer = document.getElementById('google-map-picker');

      if (!mapContainer) {
        return;
      }

      const initialLat =
        parseFloat(initialCoords.current.latitude) || defaultLat;
      const initialLng =
        parseFloat(initialCoords.current.longitude) || defaultLng;
      const center = { lat: initialLat, lng: initialLng };

      const map = new (window as any).google.maps.Map(mapContainer, {
        center: center,
        zoom: 12,
        mapTypeId: 'roadmap',
      });
      mapRef.current = map;

      if (initialCoords.current.latitude && initialCoords.current.longitude) {
        const marker = new (window as any).google.maps.Marker({
          position: center,
          map: map,
          draggable: true,
        });
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();

          if (pos) {
            setForm((f) => ({
              ...f,
              latitude: pos.lat().toFixed(6),
              longitude: pos.lng().toFixed(6),
            }));
          }
        });
        markerRef.current = marker;
      }

      // Add click listener on map to pin location
      map.addListener('click', (e: any) => {
        if (!e.latLng) {
          return;
        }

        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();

        setForm((f) => ({
          ...f,
          latitude: clickedLat.toFixed(6),
          longitude: clickedLng.toFixed(6),
        }));
      });
    };

    // Load script
    if (!(window as any).google || !(window as any).google.maps) {
      const existingScript = document.getElementById('google-maps-script');

      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = scriptUrl;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        if (
          typeof (window as any).initEditLandParcelMapCallback === 'function' &&
          (window as any).google &&
          (window as any).google.maps
        ) {
          (window as any).initEditLandParcelMapCallback();
        }
      }
    } else {
      (window as any).initEditLandParcelMapCallback();
    }

    return () => {
      delete (window as any).initEditLandParcelMapCallback;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Update marker position and center map when latitude/longitude change manually
  useEffect(() => {
    if (
      (window as any).google &&
      (window as any).google.maps &&
      mapRef.current
    ) {
      const lat = parseFloat(form.latitude);
      const lng = parseFloat(form.longitude);

      if (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        const newPos = { lat, lng };

        if (markerRef.current) {
          markerRef.current.setPosition(newPos);
        } else {
          const newMarker = new (window as any).google.maps.Marker({
            position: newPos,
            map: mapRef.current,
            draggable: true,
          });
          newMarker.addListener('dragend', () => {
            const pos = newMarker.getPosition();

            if (pos) {
              setForm((f) => ({
                ...f,
                latitude: pos.lat().toFixed(6),
                longitude: pos.lng().toFixed(6),
              }));
            }
          });
          markerRef.current = newMarker;
        }

        mapRef.current.setCenter(newPos);
      }
    }
  }, [form.latitude, form.longitude]);

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
        (o) => o.nic?.toLowerCase() === newOwnerForm.nic.toLowerCase().trim(),
      )
    ) {
      errs.nic = 'This owner is already added';
    }

    if (
      existingOwners.some(
        (o) => o.nic?.toLowerCase() === newOwnerForm.nic.toLowerCase().trim(),
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
      toastError(t('owner_added_parcel_error', 'This owner is already added to the parcel.'));

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
      errs.divisionalSecretariat = t('div_sec_required', 'Divisional Secretariat is required');
    }

    if (!form.village.trim()) {
      errs.village = t('village_required', 'Village is required');
    }

    if (!form.extentAcres.trim()) {
      errs.extentAcres = t('extent_acres_required', 'Extent (acres) is required');
    }

    if (!form.landUseType) {
      errs.landUseType = t('land_use_type_required', 'Land use type is required');
    }

    if (!form.tenureType) {
      errs.tenureType = t('tenure_type_required', 'Tenure type is required');
    }

    if (selectedOwners.length === 0) {
      toastError(t('min_one_owner_error', 'You must add or select at least one property owner.'));

      return false;
    }

    const existingPlanDoc = parcel?.documents?.find(
      (d: any) =>
        (d.documentCategory || d.document_category) === 'survey' ||
        (d.documentCategory || d.document_category) === 'plan',
    );

    const existingSketchDoc = parcel?.documents?.find(
      (d: any) => (d.documentCategory || d.document_category) === 'sketch',
    );

    if (form.hasPlan) {
      if (!planFile && !existingPlanDoc) {
        toastError(t('upload_copy_of_plan_error', 'You must upload a copy of the land parcel plan.'));

        return false;
      }
    } else {
      if (!planFile && !existingSketchDoc) {
        toastError(t('upload_simple_sketch_error', 'You must upload a simple sketch of the land parcel.'));

        return false;
      }
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
        cultivation_status: form.isCultivated
          ? form.cultivationStatus
          : 'unspecified',
        annual_income: form.isCultivated ? Number(form.annualIncome) || 0 : 0,
        land_type: form.landType || form.landUseType || 'Standard',
        estimated_value: Number(form.estimatedValue) || 0,
        remarks: form.remarks || null,
        status: 'available' as const,
        project_id: form.projectId ? form.projectId : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        property_owner_ids: finalOwnerIds,
        residents: selectedResidents,
      };

      await updateLandParcel(id, payload);

      // Upload the plan/sketch document
      if (planFile) {
        await uploadDocument(
          planFile,
          String(userId || ''),
          form.projectId ? String(form.projectId) : null,
          form.hasPlan ? 'survey' : 'sketch',
          String(id),
        );
      }

      // Upload documents after the land parcel is updated, so we can link them
      if (queuedFiles.length > 0) {
        for (let i = 0; i < queuedFiles.length; i++) {
          const item = queuedFiles[i];
          await uploadDocument(
            item.file,
            String(userId || ''),
            form.projectId ? String(form.projectId) : null,
            item.category,
            String(id),
          );
        }
      }

      toastSuccess(t('land_parcel_updated_success', 'Land parcel updated successfully!'));
      router.visit(`/land-parcels/${id}`);
    } catch (error: any) {
      console.error('Failed to update land parcel:', error);

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
        await alertInfo(t('validation_error_title', 'Validation Error'), errorMessages.join('\n'));
      } else if (error.response?.data?.message) {
        setErrors({ landNumber: error.response.data.message });
        toastError(`Error: ${error.response.data.message}`);
      } else {
        setErrors({
          landNumber: t('generic_error_saving', 'An error occurred while saving the land parcel.'),
        });
        toastError(
          t('save_parcel_error', 'An error occurred while saving the land parcel. Please verify your inputs.'),
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

  if (loading) {
    return (
      <div className="text-muted-foreground flex h-96 items-center justify-center">
        {t('loading_project_details_view', 'Loading parcel details...')}
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="bg-destructive/10 border-destructive/30 text-destructive flex h-96 flex-col items-center justify-center gap-4 rounded-xl border p-6">
        <p className="text-lg font-semibold">{t('access_denied', 'Access Denied')}</p>
        <p className="text-sm">
          {t('unauthorized_do_edit_info', 'Only Divisional/Development Officers (DO) can edit land parcel information.')}
        </p>
        <Link
          href={`/land-parcels/${id}`}
          className="text-primary font-medium hover:underline"
        >
          {t('back_to_details', 'Back to Details')}
        </Link>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="bg-destructive/10 border-destructive/30 text-destructive flex h-96 flex-col items-center justify-center gap-4 rounded-xl border p-6">
        <p className="text-lg font-semibold">{t('editing_restricted', 'Editing Restricted')}</p>
        <p className="text-sm">
          {t('only_available_status_editable', 'Only land parcels with status "available" can be edited.')}
        </p>
        <Link
          href={`/land-parcels/${id}`}
          className="text-primary font-medium hover:underline"
        >
          {t('back_to_details', 'Back to Details')}
        </Link>
      </div>
    );
  }

  if (!parcel && !loading && !unauthorized && !statusError) {
    return (
      <div className="bg-destructive/10 border-destructive/30 text-destructive flex h-96 flex-col items-center justify-center gap-4 rounded-xl border p-6">
        <p className="text-lg font-semibold">{t('error_loading_parcel', 'Error Loading Parcel')}</p>
        <p className="text-sm">
          {t('failed_retrieve_parcel_details', 'Failed to retrieve land parcel details. Please try again later.')}
        </p>
        <Link
          href={`/land-parcels/${id}`}
          className="text-primary font-medium hover:underline"
        >
          {t('back_to_details', 'Back to Details')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.visit(`/land-parcels/${id}`)}
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            title={t('back_to_details', 'Back to Details')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1>{t('edit_land_parcel', 'Edit Land Parcel')}</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {t('update_details_for_parcel_desc', 'Update details for land parcel #{number}').replace('{number}', form.landNumber)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.visit(`/land-parcels/${id}`)}
            disabled={submitting}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            form="edit-parcel-form"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form
        id="edit-parcel-form"
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

            <Field label="Latitude">
              <input
                className={inputCls}
                type="number"
                step="any"
                placeholder="e.g. 6.053500"
                value={form.latitude}
                onChange={set('latitude')}
              />
            </Field>

            <Field label="Longitude">
              <input
                className={inputCls}
                type="number"
                step="any"
                placeholder="e.g. 80.221000"
                value={form.longitude}
                onChange={set('longitude')}
              />
            </Field>

            <div className="mt-2 md:col-span-2 lg:col-span-3">
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                Google Map Pin (Click on the map to pin/re-pin the location)
              </label>
              <div
                id="google-map-picker"
                className="border-border bg-muted/20 w-full overflow-hidden rounded-xl border"
                style={{ minHeight: '320px', height: '320px' }}
              />
            </div>
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
                  Does land parcel has a plan
                </span>
              </label>
            </div>

            {/* Plan / Sketch file attachment section */}
            <div className="bg-muted/20 border-border/80 rounded-lg border p-4 md:col-span-2 lg:col-span-4">
              <div className="flex flex-col gap-2">
                <label className="text-foreground text-sm font-semibold">
                  {form.hasPlan
                    ? 'Attach Copy of Plan *'
                    : 'Attach Simple Sketch of Land Parcel *'}
                </label>
                <p className="text-muted-foreground text-xs">
                  {form.hasPlan
                    ? 'A copy of the land parcel plan is required. Supported formats: PDF, JPG, PNG, DOCX.'
                    : 'A simple sketch of the land parcel is required. Supported formats: PDF, JPG, PNG, DOCX.'}
                </p>
                <div className="mt-2 flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <label className="bg-primary hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Choose File</span>
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
                          Attached: <strong>{planFile.name}</strong> (
                          {(planFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ) : (
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <span>No new file chosen.</span>
                      </div>
                    )}
                  </div>

                  {/* Show existing document if available */}
                  {(() => {
                    const existingPlanDoc = parcel?.documents?.find(
                      (d: any) =>
                        (d.documentCategory || d.document_category) ===
                          'survey' ||
                        (d.documentCategory || d.document_category) === 'plan',
                    );
                    const existingSketchDoc = parcel?.documents?.find(
                      (d: any) =>
                        (d.documentCategory || d.document_category) ===
                        'sketch',
                    );

                    const currentDoc = form.hasPlan
                      ? existingPlanDoc
                      : existingSketchDoc;

                    if (currentDoc) {
                      return (
                        <div className="bg-card border-border flex items-center justify-between rounded-lg border px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="text-primary h-4 w-4" />
                            <span className="text-foreground font-medium">
                              Current File: {currentDoc.original_filename}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                String(currentDoc.id),
                                currentDoc.original_filename,
                              )
                            }
                            className="text-primary hover:text-primary/80 flex items-center gap-1 font-semibold"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download Current</span>
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <div className="flex items-center gap-2 text-xs text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            No existing copy has been uploaded yet. Upload is
                            required.
                          </span>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
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

            <div className="md:col-start-1 lg:col-start-1">
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
                            {owner.isNew ? t('new_label', 'New') : t('existing_label', 'Existing')}
                          </span>
                          <span className="text-muted-foreground font-mono text-xs">
                            {owner.isNew ? t('will_be_created', 'Will be created') : owner.ownerId}
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
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 md:col-span-1 lg:col-span-2">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  className="border-border text-primary focus:ring-primary/40 h-4 w-4 rounded"
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

            <div className="flex items-center gap-2 md:col-span-1 lg:col-span-2">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  className="border-border text-primary focus:ring-primary/40 h-4 w-4 rounded"
                  checked={form.isResidentOwner}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      isResidentOwner: e.target.checked,
                    }))
                  }
                />
                <span className="text-foreground text-sm font-medium">
                  Are resident is owner
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
                          title={t('remove_resident_tooltip', 'Remove Resident')}
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

          const savedDocs = parcelDocuments.map((doc: any) => ({
            id: doc.id,
            name: doc.originalFilename || doc.original_filename,
            type: doc.fileType
              ? doc.fileType.replace('.', '').toUpperCase()
              : doc.file_type
                ? doc.file_type.replace('.', '').toUpperCase()
                : 'UNKNOWN',
            category: doc.documentCategory || doc.document_category,
            uploadDate: doc.uploadDate || doc.upload_date,
            size: doc.fileSize || doc.file_size,
            isQueued: false,
          }));

          const queuedDocs = queuedFiles.map((q) => ({
            id: q.id,
            name: q.file.name,
            type: q.file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
            category: q.category,
            uploadDate: new Date().toISOString().split('T')[0],
            size: formatBytes(q.file.size),
            isQueued: true,
          }));

          const allDisplayDocs = [...savedDocs, ...queuedDocs];

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

              {allDisplayDocs.length === 0 ? (
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
                  {allDisplayDocs.map((doc) => (
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
                            {doc.isQueued && (
                              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                                Queued
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            Category: {doc.category} • Size: {doc.size} • Date:{' '}
                            {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!doc.isQueued && (
                          <button
                            type="button"
                            onClick={() => handleDownload(doc.id, doc.name)}
                            className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
                            title={t('download', 'Download')}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.id, doc.isQueued)}
                          className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          title={
                            doc.isQueued
                              ? t('remove_from_queue_tooltip', 'Remove from queue')
                              : t('delete_permanently', 'Delete permanently')
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
            onClick={() => router.visit(`/land-parcels/${id}`)}
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
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

EditLandParcel.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
