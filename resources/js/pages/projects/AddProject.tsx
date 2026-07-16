import { router } from '@inertiajs/react';
import {
  ArrowLeft,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Info,
  MapPin,
  Save,
  Search,
  Square,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';
import { getLandParcels } from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';
import {
  createProject,
  getProject,
  updateProject,
} from '@/services/projectsManagementService';

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

const MINISTRIES = [
  'Ministry of Highways',
  'Ministry of Transport',
  'Ministry of Aviation',
  'Ministry of Ports',
  'Ministry of Urban Development',
  'Ministry of Agriculture',
  'Ministry of Industry',
  'Ministry of Cultural Affairs',
  'Ministry of Irrigation',
  'Ministry of Power & Energy',
  'Ministry of Health',
  'Ministry of Education',
  'Ministry of Defence',
  'Ministry of Finance',
];

const PROJECT_TYPES = [
  'Highway',
  'Railway',
  'Airport',
  'Port',
  'Irrigation',
  'Urban Development',
  'Industrial',
  'Heritage',
  'Power Plant',
  'Water Supply',
  'Housing',
  'Health',
  'Education',
  'Other',
];

const ACQUISITION_ACTS = [
  'Land Acquisition Act No. 9 of 1950',
  'State Land Ordinance',
  'Land Reform Law No. 1 of 1972',
  'Urban Development Authority Act',
  'National Environmental Act',
  'Other',
];

// ── Form types ──────────────────────────────────────────────────────────────

type ProjectForm = {
  name: string;
  ministry: string;
  department: string;
  projectType: string;
  acquisitionAct: string;
  district: string;
  division: string;
  purpose: string;
  startDate: string;
  estimatedCompletion: string;
  totalBudget: string;
  projectManager: string;
  managerContact: string;
  managerEmail: string;
  remarks: string;
};

const EMPTY_FORM: ProjectForm = {
  name: '',
  ministry: '',
  department: '',
  projectType: '',
  acquisitionAct: '',
  district: '',
  division: '',
  purpose: '',
  startDate: '',
  estimatedCompletion: '',
  totalBudget: '',
  projectManager: '',
  managerContact: '',
  managerEmail: '',
  remarks: '',
};

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-border mb-5 flex items-start gap-3 border-b pb-3">
      <div className="bg-primary/10 mt-0.5 rounded-lg p-2">
        <Icon className="text-primary h-4 w-4" />
      </div>
      <div>
        <h3 className="text-foreground text-sm font-semibold uppercase tracking-wide">
          {title}
        </h3>
        {subtitle && (
          <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-foreground flex items-center gap-1 text-sm font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
        {hint && (
          <span title={hint} className="text-muted-foreground cursor-help">
            <Info className="h-3.5 w-3.5" />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors';
const errCls = 'text-xs text-destructive mt-0.5';

export default function AddProject() {
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectForm, string>>
  >({});

  // Parcel picker state
  const [parcelSearch, setParcelSearch] = useState('');
  const [selectedParcelIds, setSelectedParcelIds] = useState<Set<string>>(
    new Set(),
  );
  const [pickerOpen, setPickerOpen] = useState(true);

  // Dynamic parcels state
  const [allParcels, setAllParcels] = useState<LandParcel[]>([]);
  const [loadingParcels, setLoadingParcels] = useState(true);

  // Edit states
  const [editId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);

      return urlParams.get('edit');
    }

    return null;
  });
  const [originalProjectId, setOriginalProjectId] = useState<string>('');
  const [originalStatus, setOriginalStatus] = useState<
    'active' | 'pending' | 'completed'
  >('pending');
  const [loadingProject, setLoadingProject] = useState(false);

  // Fetch all parcels
  useEffect(() => {
    const fetchParcels = async () => {
      try {
        setLoadingParcels(true);
        const data = await getLandParcels();
        setAllParcels(data);
      } catch (error) {
        console.error('Failed to fetch land parcels:', error);
      } finally {
        setLoadingParcels(false);
      }
    };
    fetchParcels();
  }, []);

  // Fetch project details (for edit mode)
  useEffect(() => {
    if (editId) {
      const fetchProject = async () => {
        try {
          setLoadingProject(true);
          const data = await getProject(editId);
          setOriginalProjectId(data.projectId);
          setOriginalStatus(data.status);
          setForm({
            name: data.name,
            ministry: data.ministry,
            department: data.department,
            projectType: data.projectType,
            acquisitionAct: data.acquisitionAct,
            district: data.district,
            division: data.division,
            purpose: data.purpose,
            startDate: data.startDate,
            estimatedCompletion: data.estimatedCompletion,
            totalBudget: String(data.budget),
            projectManager: data.projectManager,
            managerContact: data.contact,
            managerEmail: data.email,
            remarks: data.remarks || '',
          });

          if (data.landParcels) {
            setSelectedParcelIds(new Set(data.landParcels.map((p) => p.id)));
          }
        } catch (error) {
          console.error('Failed to fetch project for editing:', error);
        } finally {
          setLoadingProject(false);
        }
      };
      fetchProject();
    }
  }, [editId]);

  const set =
    (field: keyof ProjectForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  // Derived: selected parcel objects
  const selectedParcels = useMemo(
    () => allParcels.filter((p) => selectedParcelIds.has(p.id)),
    [allParcels, selectedParcelIds],
  );

  // Derived: unique owners across all selected parcels
  const autoOwners = useMemo(() => {
    const seen = new Map<string, any>();

    for (const parcel of selectedParcels) {
      if (parcel.owners) {
        for (const owner of parcel.owners) {
          if (seen.has(owner.id)) {
            seen.get(owner.id)!.parcelIds.push(parcel.parcel_id);
          } else {
            seen.set(owner.id, { ...owner, parcelIds: [parcel.parcel_id] });
          }
        }
      }
    }

    return Array.from(seen.values());
  }, [selectedParcels]);

  // Filtered parcels for picker
  const filteredParcels = useMemo(() => {
    const q = parcelSearch.toLowerCase();

    if (!q) {
      return allParcels;
    }

    return allParcels.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.parcel_id.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q),
    );
  }, [allParcels, parcelSearch]);

  const toggleParcel = (id: string) => {
    setSelectedParcelIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const removeParcel = (id: string) => {
    setSelectedParcelIds((prev) => {
      const next = new Set(prev);
      next.delete(id);

      return next;
    });
  };

  // Total extent (numeric sum of acres)
  const totalExtent = useMemo(() => {
    const sum = selectedParcels.reduce((acc, p) => {
      const val = parseFloat(p.extent_acers) || 0;

      return acc + val;
    }, 0);

    return sum > 0 ? `${sum.toFixed(2)} acres` : '—';
  }, [selectedParcels]);

  const generateProjectId = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);

    return `PRJ-${year}-${rand}`;
  };

  const validate = () => {
    const errs: Partial<Record<keyof ProjectForm, string>> = {};

    if (!form.name.trim()) {
      errs.name = 'Project name is required';
    }

    if (!form.ministry) {
      errs.ministry = 'Ministry is required';
    }

    if (!form.projectType) {
      errs.projectType = 'Project type is required';
    }

    if (!form.district) {
      errs.district = 'District is required';
    }

    if (!form.purpose.trim()) {
      errs.purpose = 'Purpose / description is required';
    }

    if (!form.startDate) {
      errs.startDate = 'Start date is required';
    }

    if (!form.projectManager.trim()) {
      errs.projectManager = 'Project manager name is required';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      try {
        const payload = {
          projectId: editId ? originalProjectId : generateProjectId(),
          name: form.name,
          ministry: form.ministry,
          department: form.department,
          projectType: form.projectType,
          acquisitionAct: form.acquisitionAct,
          district: form.district,
          division: form.division,
          purpose: form.purpose,
          startDate: form.startDate,
          estimatedCompletion: form.estimatedCompletion,
          budget: Number(form.totalBudget) || 0,
          status: editId ? originalStatus : ('pending' as const),
          projectManager: form.projectManager,
          contact: form.managerContact,
          email: form.managerEmail,
          remarks: form.remarks || null,
          parcel_ids: Array.from(selectedParcelIds),
        };

        if (editId) {
          await updateProject(editId, payload);
        } else {
          await createProject(payload);
        }

        router.visit('/projects');
      } catch (error) {
        console.error('Failed to save project:', error);
        alert('Failed to save project. Please check form details.');
      }
    }
  };

  if (loadingProject) {
    return (
      <div className="bg-card border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border">
        Loading project details for editing...
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.visit('/projects')}
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1>{editId ? 'Edit Project' : 'Add New Project'}</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {editId
                ? 'Update land acquisition project details'
                : 'Create a land acquisition project and assign parcels with owners'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.visit('/projects')}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            type="submit"
            form="add-project-form"
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
          >
            <Save className="h-4 w-4" /> Save Project
          </button>
        </div>
      </div>

      <form
        id="add-project-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        {/* ── Section 1: Project Details ── */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader
            icon={FolderKanban}
            title="Project Details"
            subtitle="Core information about the acquisition project"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <Field label="Project Name" required>
                <input
                  className={inputCls}
                  placeholder="e.g. Southern Highway Expansion Phase 3"
                  value={form.name}
                  onChange={set('name')}
                />
                {errors.name && <span className={errCls}>{errors.name}</span>}
              </Field>
            </div>

            <Field label="Ministry" required>
              <select
                className={inputCls}
                value={form.ministry}
                onChange={set('ministry')}
              >
                <option value="">Select Ministry</option>
                {MINISTRIES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.ministry && (
                <span className={errCls}>{errors.ministry}</span>
              )}
            </Field>

            <Field label="Department / Authority">
              <input
                className={inputCls}
                placeholder="e.g. Road Development Authority"
                value={form.department}
                onChange={set('department')}
              />
            </Field>

            <Field label="Project Type" required>
              <select
                className={inputCls}
                value={form.projectType}
                onChange={set('projectType')}
              >
                <option value="">Select Type</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.projectType && (
                <span className={errCls}>{errors.projectType}</span>
              )}
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
              {errors.district && (
                <span className={errCls}>{errors.district}</span>
              )}
            </Field>

            <Field label="Divisional Secretariat">
              <input
                className={inputCls}
                placeholder="e.g. Galle Four Gravets"
                value={form.division}
                onChange={set('division')}
              />
            </Field>

            <Field label="Acquisition Act">
              <select
                className={inputCls}
                value={form.acquisitionAct}
                onChange={set('acquisitionAct')}
              >
                <option value="">Select Act</option>
                {ACQUISITION_ACTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>

            <div className="lg:col-span-3">
              <Field label="Purpose / Description" required>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="Describe the purpose of this land acquisition project"
                  value={form.purpose}
                  onChange={set('purpose')}
                />
                {errors.purpose && (
                  <span className={errCls}>{errors.purpose}</span>
                )}
              </Field>
            </div>

            <Field label="Start Date" required>
              <input
                type="date"
                className={inputCls}
                value={form.startDate}
                onChange={set('startDate')}
              />
              {errors.startDate && (
                <span className={errCls}>{errors.startDate}</span>
              )}
            </Field>

            <Field label="Estimated Completion">
              <input
                type="date"
                className={inputCls}
                value={form.estimatedCompletion}
                onChange={set('estimatedCompletion')}
              />
            </Field>

            <Field
              label="Total Budget (₨)"
              hint="Estimated total budget in Sri Lankan Rupees"
            >
              <input
                className={inputCls}
                placeholder="e.g. 2500000000"
                value={form.totalBudget}
                onChange={set('totalBudget')}
              />
            </Field>

            <Field label="Project Manager" required>
              <input
                className={inputCls}
                placeholder="Full name"
                value={form.projectManager}
                onChange={set('projectManager')}
              />
              {errors.projectManager && (
                <span className={errCls}>{errors.projectManager}</span>
              )}
            </Field>

            <Field label="Manager Contact">
              <input
                className={inputCls}
                type="tel"
                placeholder="+94 77 123 4567"
                value={form.managerContact}
                onChange={set('managerContact')}
              />
            </Field>

            <Field label="Manager Email">
              <input
                className={inputCls}
                type="email"
                placeholder="email@gov.lk"
                value={form.managerEmail}
                onChange={set('managerEmail')}
              />
            </Field>

            <div className="lg:col-span-3">
              <Field label="Remarks">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  placeholder="Any additional notes"
                  value={form.remarks}
                  onChange={set('remarks')}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Section 2: Land Parcels Picker ── */}
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          {/* Accordion header */}
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="hover:bg-muted/50 flex w-full items-center justify-between px-6 py-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <MapPin className="text-primary h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  Land Parcels
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Select parcels to include in this project
                </p>
              </div>
              {selectedParcelIds.size > 0 && (
                <span className="bg-primary ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium text-white">
                  {selectedParcelIds.size} selected
                </span>
              )}
            </div>
            {pickerOpen ? (
              <ChevronUp className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            )}
          </button>

          {pickerOpen && (
            <div className="border-border border-t">
              {/* Search bar */}
              <div className="border-border bg-muted/30 border-b px-6 py-3">
                <div className="relative max-w-sm">
                  <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    className={`${inputCls} pl-9`}
                    placeholder="Search by ID, survey no, district, village…"
                    value={parcelSearch}
                    onChange={(e) => setParcelSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Parcel catalogue */}
              <div className="divide-border max-h-80 divide-y overflow-y-auto">
                {loadingParcels ? (
                  <p className="text-muted-foreground px-6 py-8 text-center text-sm">
                    Loading land parcels...
                  </p>
                ) : filteredParcels.length === 0 ? (
                  <p className="text-muted-foreground px-6 py-8 text-center text-sm">
                    No parcels match your search.
                  </p>
                ) : (
                  filteredParcels.map((parcel) => {
                    const selected = selectedParcelIds.has(parcel.id);

                    return (
                      <label
                        key={parcel.id}
                        className={`flex cursor-pointer select-none items-start gap-4 px-6 py-3 transition-colors ${
                          selected ? 'bg-primary/5' : 'hover:bg-muted/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selected}
                          onChange={() => toggleParcel(parcel.id)}
                        />
                        <div className="mt-0.5 shrink-0">
                          {selected ? (
                            <CheckSquare className="text-primary h-5 w-5" />
                          ) : (
                            <Square className="text-muted-foreground h-5 w-5" />
                          )}
                        </div>
                        <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3 md:grid-cols-5">
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Parcel ID
                            </p>
                            <p className="font-medium">{parcel.parcel_id}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Lot No
                            </p>
                            <p>{parcel.lot_no}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              District / Village
                            </p>
                            <p>
                              {parcel.district}, {parcel.village}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Extent
                            </p>
                            <p>
                              {parcel.extent_acers} ac, {parcel.extent_perches}{' '}
                              per
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">
                              Status
                            </p>
                            <StatusBadge status={parcel.status} />
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Selected summary strip */}
              {selectedParcels.length > 0 && (
                <div className="border-border bg-muted/20 border-t px-6 py-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                    Selected Parcels — Total extent: {totalExtent}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedParcels.map((p) => (
                      <span
                        key={p.id}
                        className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                      >
                        {p.parcel_id} · Lot {p.lot_no}
                        <button
                          type="button"
                          onClick={() => removeParcel(p.id)}
                          className="hover:text-destructive transition-colors"
                          title={`Remove ${p.parcel_id}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Section 3: Auto-populated Owners ── */}
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          <div className="border-border flex items-center gap-3 border-b px-6 py-4">
            <div className="bg-primary/10 rounded-lg p-2">
              <Users className="text-primary h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-sm font-semibold uppercase tracking-wide">
                Property Owners
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Automatically populated from selected land parcels
              </p>
            </div>
            {autoOwners.length > 0 && (
              <span className="bg-secondary rounded-full px-2.5 py-0.5 text-xs font-medium text-white">
                {autoOwners.length} owner{autoOwners.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {autoOwners.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <Users className="text-muted-foreground h-5 w-5" />
              </div>
              <p className="text-muted-foreground text-sm">
                Select land parcels above to automatically populate property
                owners.
              </p>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {autoOwners.map((owner) => (
                <div
                  key={owner.id}
                  className="grid grid-cols-1 gap-4 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <div>
                    <p className="text-muted-foreground mb-0.5 text-xs">
                      Owner
                    </p>
                    <p className="text-sm font-medium">{owner.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {owner.ownerId}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5 text-xs">
                      NIC / Contact
                    </p>
                    <p className="text-sm">{owner.nic}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {owner.contact}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5 text-xs">
                      Address
                    </p>
                    <p className="text-sm">{owner.address}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5 text-xs">
                      Linked Parcels
                    </p>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {owner.parcelIds.map((pid: string) => (
                        <span
                          key={pid}
                          className="bg-muted rounded px-2 py-0.5 text-xs font-medium"
                        >
                          {pid}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom actions ── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.visit('/projects')}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm transition-colors"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm text-white transition-colors"
          >
            <Save className="h-4 w-4" /> Save Project
          </button>
        </div>
      </form>
    </div>
  );
}

AddProject.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
