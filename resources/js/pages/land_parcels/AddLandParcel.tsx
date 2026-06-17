import { router } from '@inertiajs/react';
import { ArrowLeft, FileText, Layers, MapPin, Save, User, X } from 'lucide-react';
import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';

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
  ownerName: string;
  ownerNic: string;
  ownerContact: string;
  ownerAddress: string;
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
  ownerName: '',
  ownerNic: '',
  ownerContact: '',
  ownerAddress: '',
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
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  const set =
    (field: keyof FormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

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

    if (!form.ownerName.trim()) {
      errs.ownerName = 'Owner name is required';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // In production: POST to API, then navigate to the new parcel
      router.visit('/parcels');
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
            onClick={() => router.visit('/parcels')}
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
            onClick={() => router.visit('/parcels')}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            form="add-parcel-form"
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Parcel
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
            <Field label="Owner Full Name" required>
              <input
                className={inputCls}
                placeholder="As per NIC / Title Deed"
                value={form.ownerName}
                onChange={set('ownerName')}
              />
              {errMsg('ownerName')}
            </Field>

            <Field label="NIC / Passport No">
              <input
                className={inputCls}
                placeholder="e.g. 198512345678"
                value={form.ownerNic}
                onChange={set('ownerNic')}
              />
            </Field>

            <Field label="Contact Number">
              <input
                className={inputCls}
                type="tel"
                placeholder="e.g. 0771234567"
                value={form.ownerContact}
                onChange={set('ownerContact')}
              />
            </Field>

            <Field label="Owner Address">
              <input
                className={inputCls}
                placeholder="Permanent address"
                value={form.ownerAddress}
                onChange={set('ownerAddress')}
              />
            </Field>
          </div>
        </div>

        {/* Acquisition Info */}
        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader icon={FileText} title="Acquisition Information" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Associated Project ID">
              <input
                className={inputCls}
                placeholder="e.g. PROJ-001"
                value={form.projectId}
                onChange={set('projectId')}
              />
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
            onClick={() => router.visit('/parcels')}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm text-white transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Parcel
          </button>
        </div>
      </form>
    </div>
  );
}

AddLandParcel.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
