import { router, usePage } from '@inertiajs/react';
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
  Plus,
  DollarSign,
  CheckCircle,
  FileText,
  AlertCircle,
  FileDown,
  Pencil,
  X,
  Trash2,
  Upload,
  Download,
  Loader2,
  Receipt,
} from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import {
  confirmDialog,
  alertInfo,
  toastError,
  toastSuccess,
} from '@/lib/alerts';
import api from '@/services/api';
import { getDepartments } from '@/services/departmentManagementService';
import type { Department } from '@/services/departmentManagementService';
import {
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from '@/services/documentManagementService';
import { getLandParcels } from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';
import {
  createPayment,
  updatePayment,
  deletePayment,
} from '@/services/paymentService';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
} from '@/services/projectsManagementService';
import type { Document } from '@/services/projectsManagementService';
import {
  createSurvey,
  updateSurvey,
  deleteSurvey,
} from '@/services/surveyService';
import {
  createValuation,
  updateValuation,
  deleteValuation,
} from '@/services/valuationService';

// ── Form types ──────────────────────────────────────────────────────────────

type ProjectForm = {
  title: string;
  name: string;
  departmentId?: number | null;
  institution: string;
  institutionAddress: string;
  purpose: string;
  landAreaAcers: string;
  landAreaRoods: string;
  landAreaPerches: string;
  areResidentsMovedTemp: boolean;
  section20Observation: boolean | null;
  section21SecretaryReport: boolean | null;
  section22SecretaryRecommendation: string;
  section23ValuationRecommendation: string;
  section24DecisionRemarks: boolean | null;
  section25AdditionalConditions: string;
  section26FinalRecommendation: boolean | null;
  approvalDate: string;
  remarks: string;
};

const EMPTY_FORM: ProjectForm = {
  title: '',
  name: '',
  departmentId: null,
  institution: '',
  institutionAddress: '',
  purpose: '',
  landAreaAcers: '',
  landAreaRoods: '',
  landAreaPerches: '',
  areResidentsMovedTemp: false,
  section20Observation: null,
  section21SecretaryReport: null,
  section22SecretaryRecommendation: '',
  section23ValuationRecommendation: '',
  section24DecisionRemarks: null,
  section25AdditionalConditions: '',
  section26FinalRecommendation: null,
  approvalDate: '',
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

const getParcelFullSizeInPerches = (parcel: LandParcel): number => {
  const directFullSize = parseFloat(parcel.full_land_size || '0');

  if (!isNaN(directFullSize) && directFullSize > 0) {
    return directFullSize;
  }

  const acers =
    parseFloat(parcel.land_size_acers || parcel.extent_acers || '0') || 0;
  const roods = parseFloat(parcel.land_size_roods || '0') || 0;
  const perches =
    parseFloat(parcel.land_size_perches || parcel.extent_perches || '0') || 0;

  return acers * 160 + roods * 40 + perches;
};

export default function AddProject() {
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectForm | 'landArea' | 'parcels', string>>
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
  const [departments, setDepartments] = useState<Department[]>([]);

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
    'draft' | 'pending' | 'rejected' | 'completed'
  >('draft');
  const [loadingProject, setLoadingProject] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projectDocuments, setProjectDocuments] = useState<Document[]>([]);
  const [queuedFiles, setQueuedFiles] = useState<
    { id: string; file: File; category: string }[]
  >([]);

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userId = user?.id;
  const { t } = useTranslation();

  const [allProjects, setAllProjects] = useState<any[]>([]);

  // Fetch all parcels, departments, and existing projects
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingParcels(true);
        const [parcelsData, deptsData, projectsData] = await Promise.all([
          getLandParcels(),
          getDepartments(),
          getProjects(),
        ]);
        setAllParcels(parcelsData);
        setDepartments(deptsData);

        if (projectsData) {
          setAllProjects(projectsData);
        }
      } catch (error) {
        console.error('Failed to fetch land parcels or departments:', error);
      } finally {
        setLoadingParcels(false);
      }
    };
    init();
  }, []);

  // Fetch project details (for edit mode)
  useEffect(() => {
    if (editId) {
      const fetchProject = async () => {
        try {
          setLoadingProject(true);
          const data = await getProject(editId);
          const userRole = user?.role?.role_name || 'User';

          if (
            userRole === 'DO' &&
            (data.caseStatus || data.status || '').toLowerCase() !== 'draft' &&
            (data.doStatus || '').toLowerCase() !== 'draft'
          ) {
            await alertInfo(
              'Forbidden',
              'Development Officers (DO) can only edit draft projects.',
            );
            router.visit(`/projects/${editId}`);

            return;
          }

          setOriginalProjectId(data.projectId);
          setOriginalStatus(
            (data.status as 'draft' | 'pending' | 'rejected' | 'completed') ||
              'draft',
          );
          setForm({
            title: data.title || '',
            name: data.name,
            departmentId: data.departmentId ?? null,
            institution: data.institution || '',
            institutionAddress: data.institutionAddress || '',
            purpose: data.purpose,
            landAreaAcers: String(data.landAreaAcers ?? ''),
            landAreaRoods: String(data.landAreaRoods ?? ''),
            landAreaPerches: String(data.landAreaPerches ?? ''),
            areResidentsMovedTemp: !!data.areResidentsMovedTemp,
            section20Observation: data.section20Observation ?? null,
            section21SecretaryReport: data.section21SecretaryReport ?? null,
            section22SecretaryRecommendation:
              data.section22SecretaryRecommendation || '',
            section23ValuationRecommendation:
              data.section23ValuationRecommendation || '',
            section24DecisionRemarks: data.section24DecisionRemarks ?? null,
            section25AdditionalConditions:
              data.section25AdditionalConditions || '',
            section26FinalRecommendation:
              data.section26FinalRecommendation ?? null,
            approvalDate: data.approvalDate || '',
            remarks: data.remarks || '',
          });

          if (data.landParcels) {
            setSelectedParcelIds(new Set(data.landParcels.map((p) => p.id)));
          }

          if (data.documents) {
            setProjectDocuments(data.documents);
          }
        } catch (error) {
          console.error('Failed to fetch project for editing:', error);
        } finally {
          setLoadingProject(false);
        }
      };
      fetchProject();
    }
  }, [editId, user?.role?.role_name]);

  const refreshDocuments = async () => {
    if (editId) {
      try {
        const data = await getProject(editId);

        if (data.documents) {
          setProjectDocuments(data.documents);
        }
      } catch (error) {
        console.error('Failed to refresh documents:', error);
      }
    }
  };

  const getCategoryFromModule = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;

      if (pathname.includes('/projects')) {
        return 'Acquisition Case';
      }

      if (pathname.includes('/land-parcels')) {
        return 'Land Parcels';
      }

      if (pathname.includes('/land-owners')) {
        return 'Property Owners';
      }
    }

    return 'Acquisition Case';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const newQueuedFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      category: getCategoryFromModule(),
    }));

    setQueuedFiles((prev) => [...prev, ...newQueuedFiles]);
  };

  const handleRemoveQueuedFile = (tempId: string) => {
    setQueuedFiles((prev) => prev.filter((item) => item.id !== tempId));
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      await downloadDocument(docId, filename);
    } catch (error) {
      console.error('Failed to download document:', error);
      toastError(t('document_download_failed'));
    }
  };

  const handleDelete = async (docId: string, isQueued: boolean) => {
    if (isQueued) {
      handleRemoveQueuedFile(docId);

      return;
    }

    const confirmed = await confirmDialog({
      title: t('delete_document'),
      text: t('delete_document_confirm'),
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoadingProject(true);
      await deleteDocument(docId);
      await refreshDocuments();
      toastSuccess(t('document_deleted_success'));
    } catch (error) {
      console.error('Failed to delete document:', error);
      toastError(t('document_delete_failed'));
    } finally {
      setLoadingProject(false);
    }
  };

  // ── Tab State ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<
    'project_info' | 'survey' | 'valuation' | 'compensation'
  >('project_info');

  // Selected parcel for workflow tabs
  const [selectedWorkflowParcelId, setSelectedWorkflowParcelId] =
    useState<string>('');

  // ── Survey Form State ─────────────────────────────────────────────────────
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [surveyorName, setSurveyorName] = useState('');
  const [surveyDate, setSurveyDate] = useState('');
  const [surveyRefNumber, setSurveyRefNumber] = useState('');
  const [surveyedSizePerches, setSurveyedSizePerches] = useState<number | ''>(
    '',
  );
  const [surveyStatus, setSurveyStatus] = useState<'pending' | 'completed'>(
    'completed',
  );
  const [surveyRemarks, setSurveyRemarks] = useState('');
  const [surveyCoordinates, setSurveyCoordinates] = useState('');
  const [surveyDocId, setSurveyDocId] = useState<string | null>(null);
  const [surveyDocName, setSurveyDocName] = useState('');
  const [surveyUploading, setSurveyUploading] = useState(false);
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);

  // ── Valuation Form State ──────────────────────────────────────────────────
  const [showValuationForm, setShowValuationForm] = useState(false);
  const [valuationId, setValuationId] = useState<string | null>(null);
  const [valuerName, setValuerName] = useState('');
  const [valuationDate, setValuationDate] = useState('');
  const [valuationRefNumber, setValuationRefNumber] = useState('');
  const [landValue, setLandValue] = useState<number | ''>('');
  const [cropValue, setCropValue] = useState<number | ''>('');
  const [structureValue, setStructureValue] = useState<number | ''>('');
  const [valuationStatus, setValuationStatus] = useState<
    'pending' | 'approved' | 'rejected'
  >('approved');
  const [valuationRemarks, setValuationRemarks] = useState('');
  const [valuationDocId, setValuationDocId] = useState<string | null>(null);
  const [valuationDocName, setValuationDocName] = useState('');
  const [valuationUploading, setValuationUploading] = useState(false);
  const [isSubmittingValuation, setIsSubmittingValuation] = useState(false);

  // ── Compensation Form State ───────────────────────────────────────────────
  const [showCompensationForm, setShowCompensationForm] = useState(false);
  const [compensationId, setCompensationId] = useState<string | null>(null);
  const [compOwnerId, setCompOwnerId] = useState('');
  const [compRef, setCompRef] = useState('');
  const [compAmount, setCompAmount] = useState<number | ''>('');
  const [compApprovedDate, setCompApprovedDate] = useState('');
  const [compPaymentDate, setCompPaymentDate] = useState('');
  const [compStatus, setCompStatus] = useState('pending');
  const [isSubmittingCompensation, setIsSubmittingCompensation] =
    useState(false);
  const [compDocUploading, setCompDocUploading] = useState(false);

  // ── Payment Form State ────────────────────────────────────────────────────
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [payCompensationId, setPayCompensationId] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payDate, setPayDate] = useState('');
  const [payMethod, setPayMethod] = useState('cheque');
  const [payBank, setPayBank] = useState('');
  const [payAccount, setPayAccount] = useState('');
  const [payStatus, setPayStatus] = useState<
    'completed' | 'pending' | 'failed'
  >('completed');
  const [payRemarks, setPayRemarks] = useState('');
  const [payDocId, setPayDocId] = useState<string | null>(null);
  const [payDocName, setPayDocName] = useState('');
  const [payUploading, setPayUploading] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // ── Receipt (ලදු පත) Form State ─────────────────────────────────────────
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [receiptReceivedFrom, setReceiptReceivedFrom] = useState('');
  const [receiptAmountRupees, setReceiptAmountRupees] = useState<number | ''>(
    '',
  );
  const [receiptAmountCents, setReceiptAmountCents] = useState<number | ''>('');
  const [receiptReason, setReceiptReason] = useState('');
  const [receiptDocId, setReceiptDocId] = useState<string | null>(null);
  const [receiptDocName, setReceiptDocName] = useState('');
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  const [receiptEditId, setReceiptEditId] = useState<string | null>(null);

  const refreshParcels = useCallback(async () => {
    try {
      const data = await getLandParcels();
      setAllParcels(data);
    } catch (err) {
      console.error('Failed to refresh land parcels:', err);
    }
  }, []);

  const handleWorkflowFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: string,
    setDocId: (id: string) => void,
    setDocName: (name: string) => void,
    setUploading: (state: boolean) => void,
    targetParcelId: string | null,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const doc = await uploadDocument(
        file,
        String(userId),
        editId || null,
        category,
        targetParcelId || null,
      );
      setDocId(String(doc.id));
      setDocName(doc.original_filename || file.name);
      toastSuccess('File uploaded successfully!');
    } catch (err) {
      console.error(err);
      toastError('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCompDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetParcelId: string | null,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setCompDocUploading(true);
      await uploadDocument(
        file,
        String(userId),
        editId || null,
        'compensation',
        targetParcelId || null,
      );
      toastSuccess('Document uploaded successfully!');
      await refreshParcels();
    } catch (err) {
      console.error(err);
      toastError('Failed to upload document. Please try again.');
    } finally {
      setCompDocUploading(false);
    }
  };

  // Survey Handlers
  const resetSurveyForm = () => {
    setSurveyId(null);
    setSurveyorName('');
    setSurveyDate('');
    setSurveyRefNumber('');
    setSurveyedSizePerches('');
    setSurveyStatus('completed');
    setSurveyRemarks('');
    setSurveyCoordinates('');
    setSurveyDocId(null);
    setSurveyDocName('');
  };

  const startEditSurvey = (s: any) => {
    setSurveyId(String(s.id));
    setSurveyorName(s.surveyor_name || '');
    setSurveyDate(s.survey_date ? s.survey_date.split('T')[0] : '');
    setSurveyRefNumber(s.survey_ref_number || '');
    setSurveyedSizePerches(Number(s.surveyed_size_perches) || '');
    setSurveyStatus(s.status || 'completed');
    setSurveyRemarks(s.remarks || '');
    setSurveyCoordinates(
      s.survey_coordinates ? JSON.stringify(s.survey_coordinates, null, 2) : '',
    );
    setSurveyDocId(s.document_id ? String(s.document_id) : null);
    setSurveyDocName(s.document?.original_filename || 'Survey Plan PDF');
    setShowSurveyForm(true);
  };

  const handleSurveySubmit = async (
    e: React.FormEvent,
    targetParcelId: string,
  ) => {
    e.preventDefault();

    if (isSubmittingSurvey) {
      return;
    }

    if (!surveyDocId) {
      toastError('Mandatory Checklist: Please upload the survey plan file.');

      return;
    }

    let coords = null;

    if (surveyCoordinates.trim()) {
      try {
        coords = JSON.parse(surveyCoordinates);
      } catch {
        coords = { raw: surveyCoordinates };
      }
    }

    const payload = {
      land_parcel_id: String(targetParcelId),
      surveyor_name: surveyorName,
      survey_date: surveyDate,
      survey_ref_number: surveyRefNumber,
      survey_coordinates: coords,
      surveyed_size_perches: Number(surveyedSizePerches),
      status: surveyStatus,
      document_id: String(surveyDocId),
      remarks: surveyRemarks || undefined,
    };

    try {
      setIsSubmittingSurvey(true);

      if (surveyId) {
        await updateSurvey(surveyId, payload);
        toastSuccess('Survey record updated successfully.');
      } else {
        await createSurvey(payload);
        toastSuccess('Survey plan registered successfully.');
      }

      setShowSurveyForm(false);
      resetSurveyForm();
      await refreshParcels();
    } catch (err: any) {
      console.error(err);
      toastError(
        err.response?.data?.message || 'Failed to submit survey plan.',
      );
    } finally {
      setIsSubmittingSurvey(false);
    }
  };

  const handleDeleteSurvey = async (sId: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete Survey Record',
      text: 'Are you sure you want to delete this survey record?',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteSurvey(sId);
      toastSuccess('Survey record deleted.');
      await refreshParcels();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete survey record.');
    }
  };

  // Valuation Handlers
  const resetValuationForm = () => {
    setValuationId(null);
    setValuerName('');
    setValuationDate('');
    setValuationRefNumber('');
    setLandValue('');
    setCropValue('');
    setStructureValue('');
    setValuationStatus('approved');
    setValuationRemarks('');
    setValuationDocId(null);
    setValuationDocName('');
  };

  const startEditValuation = (v: any) => {
    setValuationId(String(v.id));
    setValuerName(v.valuer_name || '');
    setValuationDate(v.valuation_date ? v.valuation_date.split('T')[0] : '');
    setValuationRefNumber(v.valuation_ref_number || '');
    setLandValue(v.land_value !== undefined ? Number(v.land_value) : '');
    setCropValue(v.crop_value !== undefined ? Number(v.crop_value) : '');
    setStructureValue(
      v.structure_value !== undefined ? Number(v.structure_value) : '',
    );
    setValuationStatus(v.status || 'approved');
    setValuationRemarks(v.remarks || '');
    setValuationDocId(v.document_id ? String(v.document_id) : null);
    setValuationDocName(v.document?.original_filename || 'Valuation PDF');
    setShowValuationForm(true);
  };

  const handleValuationSubmit = async (
    e: React.FormEvent,
    targetParcelId: string,
  ) => {
    e.preventDefault();

    if (isSubmittingValuation) {
      return;
    }

    if (!valuationDocId) {
      toastError(
        'Mandatory Checklist: Please upload the valuation report PDF.',
      );

      return;
    }

    const payload = {
      land_parcel_id: String(targetParcelId),
      valuer_name: valuerName,
      valuation_date: valuationDate,
      valuation_ref_number: valuationRefNumber,
      land_value: Number(landValue || 0),
      crop_value: Number(cropValue || 0),
      structure_value: Number(structureValue || 0),
      status: valuationStatus,
      document_id: String(valuationDocId),
      remarks: valuationRemarks || undefined,
    };

    try {
      setIsSubmittingValuation(true);

      if (valuationId) {
        await updateValuation(valuationId, payload);
        toastSuccess('Valuation record updated successfully.');
      } else {
        await createValuation(payload);
        toastSuccess('Valuation report registered successfully.');
      }

      setShowValuationForm(false);
      resetValuationForm();
      await refreshParcels();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to submit valuation.');
    } finally {
      setIsSubmittingValuation(false);
    }
  };

  const handleDeleteValuation = async (vId: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete Valuation Record',
      text: 'Are you sure you want to delete this valuation record?',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteValuation(vId);
      toastSuccess('Valuation record deleted.');
      await refreshParcels();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete valuation.');
    }
  };

  // Compensation Handlers
  const resetCompensationForm = () => {
    setCompensationId(null);
    setCompOwnerId('');
    setCompRef('');
    setCompAmount('');
    setCompApprovedDate('');
    setCompPaymentDate('');
    setCompStatus('pending');
  };

  const startEditCompensation = (c: any) => {
    setCompensationId(String(c.id));
    setCompOwnerId(String(c.owner_id));
    setCompRef(c.compensation_id || '');
    setCompAmount(Number(c.amount) || '');
    setCompApprovedDate(c.approved_date ? c.approved_date.split('T')[0] : '');
    setCompPaymentDate(c.payment_date ? c.payment_date.split('T')[0] : '');
    setCompStatus(c.status || 'pending');
    setShowCompensationForm(true);
  };

  const handleCompensationSubmit = async (
    e: React.FormEvent,
    targetParcelId: string,
  ) => {
    e.preventDefault();

    if (isSubmittingCompensation) {
      return;
    }

    if (!compOwnerId) {
      toastError('Please select a property owner.');

      return;
    }

    const payload = {
      owner_id: compOwnerId,
      land_parcel_id: String(targetParcelId),
      compensation_id: compRef,
      amount: Number(compAmount || 0),
      approved_date: compApprovedDate,
      payment_date: compPaymentDate,
      status: compStatus,
    };

    try {
      setIsSubmittingCompensation(true);

      if (compensationId) {
        await api.put(`/api/compensation/${compensationId}`, payload);
        toastSuccess('Compensation schedule updated.');
      } else {
        await api.post('/api/compensation', payload);
        toastSuccess('Compensation schedule created.');
      }

      setShowCompensationForm(false);
      resetCompensationForm();
      await refreshParcels();
    } catch (err: any) {
      console.error(err);
      toastError(
        err.response?.data?.message || 'Failed to submit compensation.',
      );
    } finally {
      setIsSubmittingCompensation(false);
    }
  };

  const handleDeleteCompensation = async (cId: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete Compensation',
      text: 'Are you sure you want to delete this compensation?',
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/compensation/${cId}`);
      toastSuccess('Compensation schedule deleted.');
      await refreshParcels();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete compensation.');
    }
  };

  // Payment Handlers
  const resetPaymentForm = () => {
    setPaymentId(null);
    setPayCompensationId('');
    setPayRef('');
    setPayAmount('');
    setPayDate('');
    setPayMethod('cheque');
    setPayBank('');
    setPayAccount('');
    setPayStatus('completed');
    setPayRemarks('');
    setPayDocId(null);
    setPayDocName('');
  };

  const startAddPayment = (compId: string, compDefaultAmount?: number) => {
    resetPaymentForm();
    setPayCompensationId(compId);

    if (compDefaultAmount !== undefined) {
      setPayAmount(compDefaultAmount);
    }

    setShowPaymentForm(true);
  };

  const startEditPayment = (p: any) => {
    setPaymentId(String(p.id));
    setPayCompensationId(String(p.compensation_id));
    setPayRef(p.payment_reference || '');
    setPayAmount(Number(p.amount_paid) || '');
    setPayDate(p.payment_date ? p.payment_date.split('T')[0] : '');
    setPayMethod(p.payment_method || 'cheque');
    setPayBank(p.bank_name || '');
    setPayAccount(p.account_number || '');
    setPayStatus(p.status || 'completed');
    setPayRemarks(p.remarks || '');
    setPayDocId(p.document_id ? String(p.document_id) : null);
    setPayDocName(p.document?.original_filename || 'Payment Receipt PDF');
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingPayment) {
      return;
    }

    if (!payDocId) {
      toastError('Mandatory Checklist: Please upload a payment receipt PDF.');

      return;
    }

    const payload = {
      compensation_id: payCompensationId,
      payment_reference: payRef,
      amount_paid: Number(payAmount || 0),
      payment_date: payDate,
      payment_method: payMethod,
      bank_name: payBank || undefined,
      account_number: payAccount || undefined,
      status: payStatus,
      document_id: String(payDocId),
      remarks: payRemarks || undefined,
    };

    try {
      setIsSubmittingPayment(true);

      if (paymentId) {
        await updatePayment(paymentId, payload);
        toastSuccess('Payment record updated.');
      } else {
        await createPayment(payload);
        toastSuccess('Payment installment logged successfully.');
      }

      setShowPaymentForm(false);
      resetPaymentForm();
      await refreshParcels();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to submit payment.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleDeletePayment = async (pId: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete Payment Record',
      text: 'Are you sure you want to delete this payment record?',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deletePayment(pId);
      toastSuccess('Payment record deleted.');
      await refreshParcels();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete payment.');
    }
  };

  // Receipt (ලදු පත) Handlers
  const resetReceiptForm = () => {
    setReceiptEditId(null);
    setReceiptNumber('');
    setReceiptDate('');
    setReceiptReceivedFrom('');
    setReceiptAmountRupees('');
    setReceiptAmountCents('');
    setReceiptReason('');
    setReceiptDocId(null);
    setReceiptDocName('');
  };

  const handleReceiptSubmit = async (
    e: React.FormEvent,
    targetParcelId: string,
  ) => {
    e.preventDefault();

    if (isSubmittingReceipt) {
      return;
    }

    if (!receiptDocId) {
      toastError(
        t('receipt_upload_required', 'Please upload the receipt document.'),
      );

      return;
    }

    const payload = {
      land_parcel_id: String(targetParcelId),
      receipt_number: receiptNumber,
      receipt_date: receiptDate,
      received_from: receiptReceivedFrom,
      amount_rupees: Number(receiptAmountRupees || 0),
      amount_cents: Number(receiptAmountCents || 0),
      reason: receiptReason,
      document_id: String(receiptDocId),
    };

    try {
      setIsSubmittingReceipt(true);

      if (receiptEditId) {
        await api.put(`/api/receipts/${receiptEditId}`, payload);
        toastSuccess(
          t('receipt_updated_success', 'Receipt updated successfully.'),
        );
      } else {
        await api.post('/api/receipts', payload);
        toastSuccess(t('receipt_saved_success', 'Receipt saved successfully.'));
      }

      setShowReceiptForm(false);
      resetReceiptForm();
      await refreshParcels();
    } catch (err: any) {
      console.error(err);
      toastError(
        err.response?.data?.message ||
          t('receipt_submit_failed', 'Failed to submit receipt.'),
      );
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  const startEditReceipt = (r: any) => {
    setReceiptEditId(String(r.id));
    setReceiptNumber(r.receipt_number || '');
    setReceiptDate(r.receipt_date ? r.receipt_date.split('T')[0] : '');
    setReceiptReceivedFrom(r.received_from || '');
    setReceiptAmountRupees(
      r.amount_rupees !== undefined ? Number(r.amount_rupees) : '',
    );
    setReceiptAmountCents(
      r.amount_cents !== undefined ? Number(r.amount_cents) : '',
    );
    setReceiptReason(r.reason || '');
    setReceiptDocId(r.document_id ? String(r.document_id) : null);
    setReceiptDocName(r.document?.original_filename || 'Receipt PDF');
    setShowReceiptForm(true);
  };

  const handleDeleteReceipt = async (rId: string) => {
    const confirmed = await confirmDialog({
      title: t('delete_receipt_title', 'Delete Receipt'),
      text: t(
        'delete_receipt_confirm',
        'Are you sure you want to delete this receipt?',
      ),
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/receipts/${rId}`);
      toastSuccess(
        t('receipt_deleted_success', 'Receipt deleted successfully.'),
      );
      await refreshParcels();
    } catch (err) {
      console.error(err);
      toastError(t('receipt_delete_failed', 'Failed to delete receipt.'));
    }
  };

  const set =
    (field: keyof ProjectForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));

      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];

          return next;
        });
      }

      if (
        (field === 'landAreaAcers' ||
          field === 'landAreaRoods' ||
          field === 'landAreaPerches') &&
        errors.landArea
      ) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.landArea;

          return next;
        });
      }
    };

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

    const availableOrSelected = allParcels.filter((p) => {
      if (editId) {
        return (
          p.status === 'available' ||
          selectedParcelIds.has(p.id) ||
          (p.project_id && String(p.project_id) === String(editId))
        );
      }

      return p.status === 'available' || selectedParcelIds.has(p.id);
    });

    if (!q) {
      return availableOrSelected;
    }

    return availableOrSelected.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.parcel_id.toLowerCase().includes(q) ||
        (p.land_name && p.land_name.toLowerCase().includes(q)) ||
        p.district.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q),
    );
  }, [allParcels, parcelSearch, editId, selectedParcelIds]);

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

    if (errors.parcels || errors.landArea) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.parcels;
        delete next.landArea;

        return next;
      });
    }
  };

  const removeParcel = (id: string) => {
    setSelectedParcelIds((prev) => {
      const next = new Set(prev);
      next.delete(id);

      return next;
    });

    if (errors.parcels || errors.landArea) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.parcels;
        delete next.landArea;

        return next;
      });
    }
  };

  // Total extent (numeric sum of acres)
  const totalExtent = useMemo(() => {
    const sum = selectedParcels.reduce((acc, p) => {
      const val = parseFloat(p.extent_acers || '') || 0;

      return acc + val;
    }, 0);

    return sum > 0 ? `${sum.toFixed(2)} acres` : '—';
  }, [selectedParcels]);

  // Total full land size of selected parcels in perches
  const totalParcelLandSize = useMemo(() => {
    return selectedParcels.reduce(
      (acc, p) => acc + getParcelFullSizeInPerches(p),
      0,
    );
  }, [selectedParcels]);

  // Full acquiring land size in perches
  const fullAcquiringLandSize = useMemo(() => {
    const acers = parseFloat(form.landAreaAcers) || 0;
    const roods = parseFloat(form.landAreaRoods) || 0;
    const perches = parseFloat(form.landAreaPerches) || 0;

    return acers * 160 + roods * 40 + perches;
  }, [form.landAreaAcers, form.landAreaRoods, form.landAreaPerches]);

  const isLandSizeExceeded = useMemo(() => {
    if (selectedParcels.length === 0) {
      return false;
    }

    const acquiringSize = Number(fullAcquiringLandSize.toFixed(2));
    const parcelSize = Number(totalParcelLandSize.toFixed(2));

    return acquiringSize > parcelSize;
  }, [selectedParcels.length, fullAcquiringLandSize, totalParcelLandSize]);

  const generateProjectId = (existingProjects: any[] = allProjects) => {
    const year = new Date().getFullYear();
    const yearStr = String(year);

    let maxIndex = 0;

    existingProjects.forEach((p) => {
      const pid = p.projectId || (p as any).project_id;

      if (!pid) {
        return;
      }

      const matchYearIndex = String(pid).match(
        new RegExp(`PRJ[/.-]${yearStr}[/.-](\\d+)`, 'i'),
      );

      if (matchYearIndex) {
        const num = parseInt(matchYearIndex[1], 10);

        if (!isNaN(num) && num > maxIndex) {
          maxIndex = num;
        }
      }
    });

    if (maxIndex === 0) {
      const projectsInYear = existingProjects.filter((p) => {
        const pid = p.projectId || (p as any).project_id;
        const createdAt = p.created_at || (p as any).created_at;

        return (
          (pid && String(pid).includes(yearStr)) ||
          (createdAt && String(createdAt).startsWith(yearStr))
        );
      });

      if (projectsInYear.length > 0) {
        maxIndex = projectsInYear.length;
      }
    }

    const nextIndex = maxIndex + 1;
    const paddedIndex = String(nextIndex).padStart(3, '0');

    return `PRJ/${year}/${paddedIndex}`;
  };

  const validate = () => {
    const errs: Partial<
      Record<keyof ProjectForm | 'landArea' | 'parcels', string>
    > = {};

    if (!form.name.trim()) {
      errs.name = t('project_name_required');
    }

    if (!form.purpose.trim()) {
      errs.purpose = t('purpose_description_required');
    }

    const acquiringSize = Number(fullAcquiringLandSize.toFixed(2));
    const parcelSize = Number(totalParcelLandSize.toFixed(2));

    if (selectedParcels.length === 0) {
      if (acquiringSize > 0) {
        const msg = t(
          'select_at_least_one_parcel',
          'Please select at least one land parcel.',
        );
        errs.landArea = msg;
        errs.parcels = msg;
        toastError(msg);
      }
    } else if (acquiringSize > parcelSize) {
      const msg = t(
        'acquiring_size_exceeds_parcel_size',
        'The full acquiring land size must be equal to or less than the full size of the land parcel.',
      );
      const detailMsg = `${msg} (${acquiringSize.toFixed(2)} > ${parcelSize.toFixed(2)} ${t('perches')})`;
      errs.landArea = detailMsg;
      toastError(detailMsg);
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    if (validate()) {
      try {
        setSubmitting(true);
        const acers = parseFloat(form.landAreaAcers) || 0;
        const roods = parseFloat(form.landAreaRoods) || 0;
        const perches = parseFloat(form.landAreaPerches) || 0;
        const fullArea = fullAcquiringLandSize;

        const payload = {
          projectId: editId ? originalProjectId : generateProjectId(),
          departmentId:
            form.departmentId ??
            (departments.find((d) => d.name === form.institution)?.id
              ? Number(departments.find((d) => d.name === form.institution)?.id)
              : null),
          title: form.title || form.name,
          name: form.name || form.title,
          institution: form.institution || 'N/A',
          institutionAddress: form.institutionAddress || 'N/A',
          purpose: form.purpose,
          landAreaAcers: acers,
          landAreaRoods: roods,
          landAreaPerches: perches,
          fullLandArea: fullArea,
          areResidentsMovedTemp: form.areResidentsMovedTemp,
          section20Observation: form.section20Observation,
          section21SecretaryReport: form.section21SecretaryReport,
          section22SecretaryRecommendation:
            form.section22SecretaryRecommendation || null,
          section23ValuationRecommendation:
            form.section23ValuationRecommendation || null,
          section24DecisionRemarks: form.section24DecisionRemarks,
          section25AdditionalConditions:
            form.section25AdditionalConditions || null,
          section26FinalRecommendation: form.section26FinalRecommendation,
          approvalDate: form.approvalDate || null,
          status: editId ? originalStatus : ('draft' as const),
          remarks: form.remarks || null,
          parcel_ids: Array.from(selectedParcelIds),
        };

        let savedProject: any;

        if (editId) {
          savedProject = await updateProject(editId, payload);
        } else {
          savedProject = await createProject(payload);
        }

        const targetProjectId = editId || savedProject.id;

        // Upload queued files
        if (queuedFiles.length > 0) {
          for (const item of queuedFiles) {
            await uploadDocument(
              item.file,
              String(userId),
              String(targetProjectId),
              item.category,
            );
          }
        }

        router.visit('/projects');
      } catch (error) {
        console.error('Failed to save project and upload documents:', error);
        toastError(t('project_save_failed'));
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loadingProject) {
    return (
      <div className="bg-card border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border">
        {t('loading_project_details')}
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
            title={t('back_to_projects')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1>{editId ? t('edit_project') : t('create_project')}</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {editId
                ? t('update_land_acquisition_project')
                : t('create_land_acquisition_project')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.visit('/projects')}
            disabled={submitting}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" /> {t('cancel')}
          </button>
          <button
            type="submit"
            form="add-project-form"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitting ? t('saving', 'Saving...') : t('save_project')}
          </button>
        </div>
      </div>

      {/* ── Tabs List ── */}
      <div className="border-border border-b">
        <div className="flex gap-1 overflow-x-auto">
          {[
            {
              id: 'project_info',
              label: t('project_details', 'Project Details'),
            },
            { id: 'survey', label: t('survey_info', 'Survey Info') },
            {
              id: 'valuation',
              label: t('valuation_details', 'Valuation Details'),
            },
            {
              id: 'compensation',
              label: t('compensation_payments', 'Compensation & Payments'),
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form
        id="add-project-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        {/* ── TAB 1: Project Information (Original Sections 1-4) ── */}
        {activeTab === 'project_info' && (
          <div className="space-y-6">
            {/* ── Section 1: Project Details ── */}
            <div className="bg-card border-border rounded-xl border p-6">
              <SectionHeader
                icon={FolderKanban}
                title={t('project_details')}
                subtitle={t('project_subtitle')}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Field label={t('project_title')} required>
                    <input
                      className={inputCls}
                      placeholder={`${t('example')} ${t('project_title_example')}`}
                      value={form.name || form.title}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          name: e.target.value,
                          title: e.target.value,
                        }));
                      }}
                    />
                    {errors.name && (
                      <span className={errCls}>{errors.name}</span>
                    )}
                  </Field>
                </div>

                <Field label={t('requesting_institution')}>
                  <select
                    className={inputCls}
                    title="Select Requesting Institution"
                    value={form.institution}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const dept = departments.find(
                        (d) =>
                          d.name === selectedVal ||
                          String(d.id) === selectedVal,
                      );
                      setForm((f) => ({
                        ...f,
                        institution: dept ? dept.name : selectedVal,
                        departmentId: dept ? Number(dept.id) : null,
                        institutionAddress: dept?.address || '',
                      }));
                    }}
                  >
                    <option value="">{t('select_department')}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                    {form.institution &&
                      !departments.some((d) => d.name === form.institution) && (
                        <option value={form.institution}>
                          {form.institution}
                        </option>
                      )}
                  </select>
                </Field>

                <div className="lg:col-span-3">
                  <Field label={t('institution_address')}>
                    <input
                      className={inputCls}
                      placeholder={t('institution_address_placeholder')}
                      value={form.institutionAddress}
                      onChange={set('institutionAddress')}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-4">
                  <Field label={`${t('acquiring_land_area')} — ${t('acres')}`}>
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.landAreaAcers}
                      onChange={set('landAreaAcers')}
                    />
                  </Field>

                  <Field label={`${t('acquiring_land_area')} — ${t('roods')}`}>
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.landAreaRoods}
                      onChange={set('landAreaRoods')}
                    />
                  </Field>

                  <Field
                    label={`${t('acquiring_land_area')} — ${t('perches')}`}
                  >
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.landAreaPerches}
                      onChange={set('landAreaPerches')}
                    />
                  </Field>

                  <Field
                    label={`${t('full_acquiring_land_size')} (${t('perches')})`}
                    hint={
                      selectedParcels.length > 0
                        ? `${t('full_size_of_land_parcel', 'Full size of land parcel')}: ${totalParcelLandSize.toFixed(2)} ${t('perches')}`
                        : undefined
                    }
                  >
                    <input
                      className={`${inputCls} ${
                        errors.landArea || isLandSizeExceeded
                          ? 'border-destructive text-destructive focus:border-destructive focus:ring-destructive/30'
                          : ''
                      } bg-muted/30 cursor-not-allowed font-medium`}
                      type="text"
                      readOnly
                      placeholder="0.00"
                      value={fullAcquiringLandSize.toFixed(2)}
                    />
                    {errors.landArea ? (
                      <span className={errCls}>{errors.landArea}</span>
                    ) : isLandSizeExceeded ? (
                      <span className={errCls}>
                        {t(
                          'acquiring_size_exceeds_parcel_size',
                          'The full acquiring land size must be equal to or less than the full size of the land parcel.',
                        )}{' '}
                        ({fullAcquiringLandSize.toFixed(2)} &gt;{' '}
                        {totalParcelLandSize.toFixed(2)} {t('perches')})
                      </span>
                    ) : null}
                  </Field>
                </div>

                <div className="lg:col-span-3">
                  <Field label={t('purpose_description')} required>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={3}
                      placeholder={t('describe_purpose')}
                      value={form.purpose}
                      onChange={set('purpose')}
                    />
                    {errors.purpose && (
                      <span className={errCls}>{errors.purpose}</span>
                    )}
                  </Field>
                </div>

                <div className="py-1 lg:col-span-3">
                  <label className="border-border bg-muted/10 hover:bg-muted/20 flex cursor-pointer select-none items-start gap-3 rounded-lg border p-4 transition-colors">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.areResidentsMovedTemp}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          areResidentsMovedTemp: e.target.checked,
                        }));
                      }}
                    />
                    <div className="mt-0.5 shrink-0">
                      {form.areResidentsMovedTemp ? (
                        <CheckSquare className="text-primary h-5 w-5" />
                      ) : (
                        <Square className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-foreground text-sm font-medium">
                        {t('are_residents_moved_to_temporary_habitat')}
                      </span>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {t('are_residents_moved_to_temporary_habitat_info')}
                      </p>
                    </div>
                  </label>
                </div>

                <div className="lg:col-span-3">
                  <Field label={t('remarks')}>
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={2}
                      placeholder={t('remarks_placeholder')}
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
                      {t('land_parcels')}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {t('select_parcels_to_include_in_this_project')}
                    </p>
                  </div>
                  {selectedParcelIds.size > 0 && (
                    <span className="bg-primary ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium text-white">
                      {selectedParcelIds.size} {t('selected')}
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
                  {errors.parcels && (
                    <div className="bg-destructive/10 border-destructive/20 text-destructive border-b px-6 py-2.5 text-xs font-medium">
                      {errors.parcels}
                    </div>
                  )}
                  {/* Search bar */}
                  <div className="border-border bg-muted/30 border-b px-6 py-3">
                    <div className="relative max-w-sm">
                      <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                      <input
                        className={`${inputCls} pl-9`}
                        placeholder={t(
                          'search_by_id_survey_no_district_village',
                        )}
                        value={parcelSearch}
                        onChange={(e) => setParcelSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Parcel catalogue */}
                  <div className="divide-border max-h-80 divide-y overflow-y-auto">
                    {loadingParcels ? (
                      <p className="text-muted-foreground px-6 py-8 text-center text-sm">
                        {t('loading_land_parcels')}
                      </p>
                    ) : filteredParcels.length === 0 ? (
                      <p className="text-muted-foreground px-6 py-8 text-center text-sm">
                        {t('no_parcels_match_your_search')}
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
                                  {t('parcel_id')}
                                </p>
                                <p className="font-medium">
                                  {parcel.parcel_id}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  {t('land_name', 'Land Name')}
                                </p>
                                <p
                                  className="truncate font-medium"
                                  title={parcel.land_name || t('n_a', 'N/A')}
                                >
                                  {parcel.land_name || t('n_a', 'N/A')}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  {`${t('district')} / ${t('village')}`}
                                </p>
                                <p>
                                  {parcel.district}, {parcel.village}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  {t('extent')}
                                </p>
                                <p>
                                  {parcel.extent_acers} ac,{' '}
                                  {parcel.extent_perches} per
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  {t('status')}
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
                        {t('selected_parcels_total_extent')} {totalExtent}
                        {totalParcelLandSize > 0 &&
                          ` (${totalParcelLandSize.toFixed(2)} ${t('perches')})`}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedParcels.map((p) => (
                          <span
                            key={p.id}
                            className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          >
                            <span>
                              {p.parcel_id}
                              {p.land_name ? ` (${p.land_name})` : ''}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeParcel(p.id)}
                              className="hover:text-destructive transition-colors"
                              title={`${t('remove_parcel')} ${p.parcel_id}`}
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
                    {t('land_owners')}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t('automatically_populated_from_selected_land_parcels')}
                  </p>
                </div>
                {autoOwners.length > 0 && (
                  <span className="bg-secondary rounded-full px-2.5 py-0.5 text-xs font-medium text-white">
                    {autoOwners.length}{' '}
                    {autoOwners.length !== 1 ? t('owners') : t('owner')}
                  </span>
                )}
              </div>

              {autoOwners.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <Users className="text-muted-foreground h-5 w-5" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {t('select_parcels_above_to_populate_owners')}
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
                          {t('owner')}
                        </p>
                        <p className="text-sm font-medium">{owner.name}</p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {owner.ownerId}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5 text-xs">
                          {t('nic_contact')}
                        </p>
                        <p className="text-sm">{owner.nic}</p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {owner.contact}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5 text-xs">
                          {t('address')}
                        </p>
                        <p className="text-sm">{owner.address}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5 text-xs">
                          {t('linked_parcels')}
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

            {/* ── Section: Recommendations & Decisions (Sections 20 - 26) ── */}
            <div className="bg-card border-border rounded-xl border p-6">
              <SectionHeader
                icon={CheckSquare}
                title={t('recommendations_and_decisions')}
                subtitle={t('recommendations_and_decisions_subtitle')}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Section 20 */}
                <div className="flex items-center md:col-span-2">
                  <label className="border-border bg-muted/10 hover:bg-muted/20 flex w-full cursor-pointer select-none items-center gap-3 rounded-lg border p-4 transition-colors">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={!!form.section20Observation}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          section20Observation: e.target.checked,
                        }));
                      }}
                    />
                    <div className="shrink-0">
                      {form.section20Observation ? (
                        <CheckSquare className="text-primary h-5 w-5" />
                      ) : (
                        <Square className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                    <span className="text-foreground text-sm font-medium">
                      {t('section_20')}
                    </span>
                  </label>
                </div>

                {/* Section 21 */}
                <div className="flex items-center md:col-span-2">
                  <label className="border-border bg-muted/10 hover:bg-muted/20 flex w-full cursor-pointer select-none items-center gap-3 rounded-lg border p-4 transition-colors">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={!!form.section21SecretaryReport}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          section21SecretaryReport: e.target.checked,
                        }));
                      }}
                    />
                    <div className="shrink-0">
                      {form.section21SecretaryReport ? (
                        <CheckSquare className="text-primary h-5 w-5" />
                      ) : (
                        <Square className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                    <span className="text-foreground text-sm font-medium">
                      {t('section_21')}
                    </span>
                  </label>
                </div>

                {/* Section 22 */}
                <div className="md:col-span-2">
                  <Field label={t('section_22')}>
                    <input
                      className={inputCls}
                      placeholder={t('section_22')}
                      value={form.section22SecretaryRecommendation}
                      onChange={set('section22SecretaryRecommendation')}
                    />
                  </Field>
                </div>

                {/* Section 23 */}
                <div className="md:col-span-2">
                  <Field label={t('section_23')}>
                    <input
                      className={inputCls}
                      placeholder={t('section_23')}
                      value={form.section23ValuationRecommendation}
                      onChange={set('section23ValuationRecommendation')}
                    />
                  </Field>
                </div>

                {/* Section 24 */}
                <div className="flex items-center md:col-span-2">
                  <label className="border-border bg-muted/10 hover:bg-muted/20 flex w-full cursor-pointer select-none items-center gap-3 rounded-lg border p-4 transition-colors">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={!!form.section24DecisionRemarks}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          section24DecisionRemarks: e.target.checked,
                        }));
                      }}
                    />
                    <div className="shrink-0">
                      {form.section24DecisionRemarks ? (
                        <CheckSquare className="text-primary h-5 w-5" />
                      ) : (
                        <Square className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                    <span className="text-foreground text-sm font-medium">
                      {t('section_24')}
                    </span>
                  </label>
                </div>

                {/* Section 25 */}
                <div className="md:col-span-2">
                  <Field label={t('section_25')}>
                    <input
                      className={inputCls}
                      placeholder={t('section_25')}
                      value={form.section25AdditionalConditions}
                      onChange={set('section25AdditionalConditions')}
                    />
                  </Field>
                </div>

                {/* Section 26 */}
                <div className="flex items-center md:col-span-2">
                  <label className="border-border bg-muted/10 hover:bg-muted/20 flex w-full cursor-pointer select-none items-center gap-3 rounded-lg border p-4 transition-colors">
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={!!form.section26FinalRecommendation}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          section26FinalRecommendation: e.target.checked,
                        }));
                      }}
                    />
                    <div className="shrink-0">
                      {form.section26FinalRecommendation ? (
                        <CheckSquare className="text-primary h-5 w-5" />
                      ) : (
                        <Square className="text-muted-foreground h-5 w-5" />
                      )}
                    </div>
                    <span className="text-foreground text-sm font-medium">
                      {t('section_26')}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Section 4: Project Documents ── */}
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

              const savedDocs = projectDocuments.map((doc) => ({
                id: doc.id,
                name: doc.original_filename,
                type: doc.file_type.replace('.', '').toUpperCase(),
                category: doc.document_category,
                uploadDate: doc.upload_date,
                size: doc.file_size,
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
                          {t('project_documents')}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {t('attach_documents_to_project')}
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

                  {allDisplayDocs.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                        <FolderKanban className="text-muted-foreground h-5 w-5" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {t('no_documents_for_project')}
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
                                    {t('queued')}
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {t('category')}: {doc.category} • {t('size')}:{' '}
                                {doc.size} • {t('date')}: {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!doc.isQueued && (
                              <button
                                type="button"
                                onClick={() => handleDownload(doc.id, doc.name)}
                                className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
                                title={t('download')}
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
                                  ? t('remove_from_queue')
                                  : t('delete_permanently')
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
          </div>
        )}

        {/* ── WORKFLOW TABS (Survey, Valuation, Compensation & Payments) ── */}
        {activeTab !== 'project_info' &&
          (() => {
            const effectiveWorkflowParcelId =
              selectedWorkflowParcelId &&
              selectedParcelIds.has(selectedWorkflowParcelId)
                ? selectedWorkflowParcelId
                : selectedParcels[0]?.id || '';

            const activeParcel = allParcels.find(
              (p) => p.id === effectiveWorkflowParcelId,
            );

            if (selectedParcels.length === 0) {
              return (
                <div className="bg-card border-border rounded-xl border p-12 text-center">
                  <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <MapPin className="text-muted-foreground h-5 w-5" />
                  </div>
                  <h4 className="text-foreground text-base font-semibold">
                    {t(
                      'no_parcels_selected_yet',
                      'No Land Parcels Selected Yet',
                    )}
                  </h4>
                  <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
                    {t(
                      'select_parcels_workflow_hint',
                      'Please select land parcels in the Project Details tab first to manage survey plans, valuations, and compensation packages for them.',
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('project_info')}
                    className="bg-primary hover:bg-primary/90 mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                  >
                    {t('go_to_project_details', 'Go to Project Details')}
                  </button>
                </div>
              );
            }

            const compDocuments =
              activeParcel?.documents && activeParcel.documents.length > 0
                ? activeParcel.documents
                    .filter(
                      (d: any) =>
                        (d.documentCategory || d.document_category) ===
                        'compensation',
                    )
                    .map((d: any) => {
                      const fileTypeStr = d.fileType || d.file_type || 'N/A';

                      return {
                        id: d.id,
                        name:
                          d.originalFilename ||
                          d.original_filename ||
                          'Unnamed Document',
                        type: fileTypeStr.toUpperCase().replace('.', ''),
                        date: d.uploadDate || d.upload_date || 'N/A',
                      };
                    })
                : [];

            return (
              <div className="space-y-6">
                {/* Parcel Selector Strip when multiple parcels are selected */}
                <div className="bg-card border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      {t('active_parcel', 'Active Land Parcel')}:
                    </span>
                    <select
                      className="border-border bg-input-background text-foreground focus:ring-primary/40 rounded-lg border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2"
                      value={effectiveWorkflowParcelId}
                      onChange={(e) =>
                        setSelectedWorkflowParcelId(e.target.value)
                      }
                    >
                      {selectedParcels.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.parcel_id} {p.land_name ? `(${p.land_name})` : ''}{' '}
                          — {p.village}, {p.district}
                        </option>
                      ))}
                    </select>
                  </div>
                  {activeParcel && (
                    <div className="flex items-center gap-2">
                      <StatusBadge status={activeParcel.status} />
                      <span className="text-muted-foreground font-mono text-xs">
                        {activeParcel.extent_acers} ac,{' '}
                        {activeParcel.extent_perches} per
                      </span>
                    </div>
                  )}
                </div>

                {/* ── SUB-TAB: SURVEY INFO ── */}
                {activeTab === 'survey' && activeParcel && (
                  <div className="space-y-6">
                    <div className="bg-card border-border flex items-center justify-between rounded-lg border p-6">
                      <div>
                        <h3 className="text-base font-semibold">
                          {t('survey_plan_records', 'Survey Plan Records')}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {t(
                            'survey_plans_subtitle',
                            'Register and view surveyor reports and official survey maps of the land.',
                          )}
                        </p>
                      </div>
                      {!showSurveyForm && (
                        <button
                          type="button"
                          onClick={() => {
                            resetSurveyForm();
                            setShowSurveyForm(true);
                          }}
                          className="bg-primary hover:bg-primary/95 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>
                            {activeParcel.surveys &&
                            activeParcel.surveys.length > 0
                              ? t('update_survey_plan', 'Update Survey plan')
                              : t(
                                  'register_survey_plan',
                                  'Register Survey Plan',
                                )}
                          </span>
                        </button>
                      )}
                    </div>

                    {showSurveyForm && (
                      <div className="bg-card border-border space-y-6 rounded-lg border p-6">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="text-foreground text-base font-bold">
                            {surveyId
                              ? t('edit_survey_record', 'Edit Survey Record')
                              : t(
                                  'register_survey_plan',
                                  'Register Survey Plan',
                                )}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowSurveyForm(false)}
                            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('surveyor_name', 'Surveyor Name')} *
                            </label>
                            <input
                              type="text"
                              required
                              value={surveyorName}
                              onChange={(e) => setSurveyorName(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              placeholder={t(
                                'enter_surveyor_fullname',
                                'Enter surveyor full name',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('survey_date', 'Survey Date')} *
                            </label>
                            <input
                              type="date"
                              required
                              value={surveyDate}
                              onChange={(e) => setSurveyDate(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('survey_ref_number', 'Survey Ref Number')} *
                            </label>
                            <input
                              type="text"
                              required
                              value={surveyRefNumber}
                              onChange={(e) =>
                                setSurveyRefNumber(e.target.value)
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              placeholder={t(
                                'survey_ref_placeholder',
                                'e.g. SRV/2026/G/8732',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t(
                                'surveyed_size_perches',
                                'Surveyed Size (Perches)',
                              )}{' '}
                              *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={surveyedSizePerches}
                              onChange={(e) =>
                                setSurveyedSizePerches(
                                  e.target.value !== ''
                                    ? Number(e.target.value)
                                    : '',
                                )
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              placeholder={t(
                                'size_in_perches_placeholder',
                                'Size in perches',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('status', 'Status')}
                            </label>
                            <select
                              value={surveyStatus}
                              onChange={(e) =>
                                setSurveyStatus(e.target.value as any)
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            >
                              <option value="completed">
                                {t('completed', 'Completed')}
                              </option>
                              <option value="pending">
                                {t('pending', 'Pending')}
                              </option>
                            </select>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t(
                                'survey_coordinates',
                                'Survey Coordinates (GeoJSON Polygon/JSON - Optional)',
                              )}
                            </label>
                            <textarea
                              value={surveyCoordinates}
                              onChange={(e) =>
                                setSurveyCoordinates(e.target.value)
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-xs"
                              rows={3}
                              placeholder={t(
                                'coordinates_placeholder',
                                'e.g. { "type": "Polygon", "coordinates": [...] }',
                              )}
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('remarks_field', 'Remarks')}
                            </label>
                            <textarea
                              value={surveyRemarks}
                              onChange={(e) => setSurveyRemarks(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              rows={2}
                              placeholder={t(
                                'survey_remarks_placeholder',
                                'Any observations or survey remarks',
                              )}
                            />
                          </div>

                          {/* Mandatory Survey plan document upload */}
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t(
                                'upload_survey_plan_mandatory',
                                'Upload Survey Plan (MANDATORY PDF) *',
                              )}
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                                <Upload className="text-muted-foreground h-4 w-4" />
                                <span>
                                  {surveyUploading
                                    ? t('uploading', 'Uploading...')
                                    : t('choose_file', 'Choose File')}
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf"
                                  disabled={surveyUploading}
                                  onChange={(e) =>
                                    handleWorkflowFileUpload(
                                      e,
                                      'survey_plan',
                                      setSurveyDocId,
                                      setSurveyDocName,
                                      setSurveyUploading,
                                      activeParcel.id,
                                    )
                                  }
                                />
                              </label>
                              {surveyDocId ? (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>
                                    {t('uploaded_plan', 'Uploaded Plan')}:{' '}
                                    <strong>{surveyDocName}</strong>
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>
                                    {t(
                                      'survey_plan_upload_alert',
                                      'A survey plan report must be uploaded before saving.',
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-4">
                          <button
                            type="button"
                            onClick={() => setShowSurveyForm(false)}
                            className="border-border hover:bg-muted text-foreground rounded-lg border px-5 py-2 text-sm font-semibold transition-colors"
                          >
                            {t('cancel', 'Cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={(e) =>
                              handleSurveySubmit(e, activeParcel.id)
                            }
                            disabled={
                              !surveyDocId ||
                              surveyUploading ||
                              isSubmittingSurvey
                            }
                            className="flex items-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSubmittingSurvey && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isSubmittingSurvey
                              ? t('saving', 'Saving...')
                              : surveyUploading
                                ? t('uploading_file', 'Uploading File...')
                                : surveyId
                                  ? t('update_record', 'Update Record')
                                  : t('save_survey_plan', 'Save Survey Plan')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* List existing survey records */}
                    {activeParcel.surveys && activeParcel.surveys.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {activeParcel.surveys.map((survey: any) => (
                          <div
                            key={survey.id}
                            className="bg-card border-border shadow-xs rounded-lg border p-6"
                          >
                            <div className="mb-4 flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="text-primary h-5 w-5" />
                                <span className="text-sm font-bold">
                                  {t('ref_number_label', 'Ref Number')}:{' '}
                                  {survey.survey_ref_number}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={survey.status} />
                                <button
                                  type="button"
                                  onClick={() => startEditSurvey(survey)}
                                  className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                                  title={t('edit', 'Edit')}
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSurvey(survey.id)}
                                  className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                  title={t('delete', 'Delete')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                  {t('surveyor_name', 'Surveyor Name')}
                                </dt>
                                <dd className="text-foreground font-medium">
                                  {survey.surveyor_name}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                  {t('survey_date', 'Survey Date')}
                                </dt>
                                <dd className="text-foreground font-medium">
                                  {survey.survey_date
                                    ? new Date(
                                        survey.survey_date,
                                      ).toLocaleDateString()
                                    : t('n_a', 'N/A')}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                  {t('surveyed_size', 'Surveyed Size')}
                                </dt>
                                <dd className="text-foreground font-mono font-medium">
                                  {survey.surveyed_size_perches}{' '}
                                  {t('perches', 'Perches')}
                                </dd>
                              </div>
                              <div className="md:col-span-2">
                                <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                  {t(
                                    'boundaries_geojson_label',
                                    'Boundaries & GeoJSON Coordinates',
                                  )}
                                </dt>
                                <dd className="bg-muted/40 max-h-24 overflow-y-auto rounded-md p-2 font-mono text-xs">
                                  {survey.survey_coordinates
                                    ? JSON.stringify(survey.survey_coordinates)
                                    : t(
                                        'no_coords_polygons_set',
                                        'No coordinate polygons set',
                                      )}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                  {t(
                                    'survey_plan_drawing',
                                    'Survey Plan Drawing',
                                  )}
                                </dt>
                                <dd className="mt-1">
                                  {survey.document ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDownload(
                                          String(survey.document_id),
                                          survey.document.original_filename,
                                        )
                                      }
                                      className="text-primary flex items-center gap-1.5 text-xs font-bold hover:underline"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      <span>
                                        {t(
                                          'download_survey_plan',
                                          'Download Plan',
                                        )}
                                      </span>
                                    </button>
                                  ) : (
                                    <span className="text-xs text-red-500">
                                      {t(
                                        'file_ref_missing',
                                        'File Reference Missing',
                                      )}
                                    </span>
                                  )}
                                </dd>
                              </div>
                              {survey.remarks && (
                                <div className="md:col-span-3">
                                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    {t('remarks_field', 'Remarks')}
                                  </dt>
                                  <dd className="text-foreground mt-1 text-xs">
                                    {survey.remarks}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-card border-border text-muted-foreground flex h-36 flex-col items-center justify-center gap-2 rounded-lg border text-sm">
                        <FileText className="text-muted-foreground/60 h-8 w-8" />
                        <span>
                          {t(
                            'no_survey_plan_records',
                            'No survey plan records logged.',
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUB-TAB: VALUATION DETAILS ── */}
                {activeTab === 'valuation' && activeParcel && (
                  <div className="space-y-6">
                    <div className="bg-card border-border flex items-center justify-between rounded-lg border p-6">
                      <div>
                        <h3 className="text-base font-semibold">
                          {t('valuation_assessments', 'Valuation Assessments')}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {t(
                            'valuation_subtitle',
                            'Record assessed values of land, structures, and crops from official valuers.',
                          )}
                        </p>
                      </div>
                      {!showValuationForm && (
                        <button
                          type="button"
                          onClick={() => {
                            resetValuationForm();
                            setShowValuationForm(true);
                          }}
                          className="bg-primary hover:bg-primary/95 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>
                            {activeParcel.valuations &&
                            activeParcel.valuations.length > 0
                              ? t('update_valuation', 'Update Valuation')
                              : t('register_valuation', 'Register Valuation')}
                          </span>
                        </button>
                      )}
                    </div>

                    {showValuationForm && (
                      <div className="bg-card border-border space-y-6 rounded-lg border p-6">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="text-foreground text-base font-bold">
                            {valuationId
                              ? t(
                                  'edit_valuation_record',
                                  'Edit Valuation Record',
                                )
                              : t(
                                  'register_valuation_assessment',
                                  'Register Valuation Assessment',
                                )}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowValuationForm(false)}
                            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('valuer_name', 'Valuer Name')} *
                            </label>
                            <input
                              type="text"
                              required
                              value={valuerName}
                              onChange={(e) => setValuerName(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              placeholder={t(
                                'government_valuer_placeholder',
                                'e.g. Government Valuer',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('valuation_date', 'Valuation Date')} *
                            </label>
                            <input
                              type="date"
                              required
                              value={valuationDate}
                              onChange={(e) => setValuationDate(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t(
                                'valuation_ref_number',
                                'Valuation Ref Number',
                              )}{' '}
                              *
                            </label>
                            <input
                              type="text"
                              required
                              value={valuationRefNumber}
                              onChange={(e) =>
                                setValuationRefNumber(e.target.value)
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              placeholder={t(
                                'valuation_ref_placeholder',
                                'e.g. VAL/2026/LAMS/1029',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('land_value_rs', 'Land Value (₨)')} *
                            </label>
                            <input
                              type="number"
                              required
                              value={landValue}
                              onChange={(e) =>
                                setLandValue(
                                  e.target.value !== ''
                                    ? Number(e.target.value)
                                    : '',
                                )
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                              placeholder={t(
                                'land_assessed_value_placeholder',
                                'Land parcel assessed value',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('crop_value_rs', 'Crop Value (₨)')} *
                            </label>
                            <input
                              type="number"
                              required
                              value={cropValue}
                              onChange={(e) =>
                                setCropValue(
                                  e.target.value !== ''
                                    ? Number(e.target.value)
                                    : '',
                                )
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                              placeholder={t(
                                'crops_assessed_value_placeholder',
                                'Crops & trees damage assessed value',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('structure_value_rs', 'Structure Value (₨)')} *
                            </label>
                            <input
                              type="number"
                              required
                              value={structureValue}
                              onChange={(e) =>
                                setStructureValue(
                                  e.target.value !== ''
                                    ? Number(e.target.value)
                                    : '',
                                )
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                              placeholder={t(
                                'structure_assessed_value_placeholder',
                                'Structure & houses assessed value',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('status', 'Status')}
                            </label>
                            <select
                              value={valuationStatus}
                              onChange={(e) =>
                                setValuationStatus(e.target.value as any)
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            >
                              <option value="approved">
                                {t('approved', 'Approved')}
                              </option>
                              <option value="pending">
                                {t('pending', 'Pending')}
                              </option>
                              <option value="rejected">
                                {t('rejected', 'Rejected')}
                              </option>
                            </select>
                          </div>

                          <div className="flex flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t(
                                'total_valuation_autosum',
                                'Total Valuation (Auto Sum)',
                              )}
                            </span>
                            <span className="font-mono text-xl font-bold text-[#2E7D32]">
                              ₨{' '}
                              {Number(
                                (Number(landValue) || 0) +
                                  (Number(cropValue) || 0) +
                                  (Number(structureValue) || 0),
                              ).toLocaleString()}
                            </span>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('remarks_field', 'Remarks')}
                            </label>
                            <textarea
                              value={valuationRemarks}
                              onChange={(e) =>
                                setValuationRemarks(e.target.value)
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              rows={2}
                              placeholder={t(
                                'valuation_notes_placeholder',
                                'Any valuation notes or damages detail',
                              )}
                            />
                          </div>

                          {/* Mandatory Valuation report upload */}
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t(
                                'upload_valuation_report_mandatory',
                                'Upload Valuation Report (MANDATORY PDF) *',
                              )}
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                                <Upload className="text-muted-foreground h-4 w-4" />
                                <span>
                                  {valuationUploading
                                    ? t('uploading', 'Uploading...')
                                    : t('choose_file', 'Choose File')}
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf"
                                  disabled={valuationUploading}
                                  onChange={(e) =>
                                    handleWorkflowFileUpload(
                                      e,
                                      'valuation_report',
                                      setValuationDocId,
                                      setValuationDocName,
                                      setValuationUploading,
                                      activeParcel.id,
                                    )
                                  }
                                />
                              </label>
                              {valuationDocId ? (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>
                                    {t('uploaded_report', 'Uploaded Report')}:{' '}
                                    <strong>{valuationDocName}</strong>
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>
                                    {t(
                                      'valuation_report_upload_alert',
                                      'A valuation certificate report PDF must be uploaded before saving.',
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-4">
                          <button
                            type="button"
                            onClick={() => setShowValuationForm(false)}
                            className="border-border hover:bg-muted text-foreground rounded-lg border px-5 py-2 text-sm font-semibold transition-colors"
                          >
                            {t('cancel', 'Cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={(e) =>
                              handleValuationSubmit(e, activeParcel.id)
                            }
                            disabled={
                              !valuationDocId ||
                              valuationUploading ||
                              isSubmittingValuation
                            }
                            className="flex items-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSubmittingValuation && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isSubmittingValuation
                              ? t('saving', 'Saving...')
                              : valuationUploading
                                ? t('uploading_report', 'Uploading Report...')
                                : valuationId
                                  ? t('update_valuation', 'Update Valuation')
                                  : t(
                                      'save_valuation_report',
                                      'Save Valuation Report',
                                    )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* List existing valuations */}
                    {activeParcel.valuations &&
                    activeParcel.valuations.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {activeParcel.valuations.map((val: any) => (
                          <div
                            key={val.id}
                            className="bg-card border-border shadow-xs rounded-lg border p-6"
                          >
                            <div className="mb-4 flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                                <span className="text-sm font-bold">
                                  {t('valuation_ref_label', 'Valuation Ref')}:{' '}
                                  {val.valuation_ref_number}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={val.status} />
                                <button
                                  type="button"
                                  onClick={() => startEditValuation(val)}
                                  className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                                  title={t('edit', 'Edit')}
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteValuation(val.id)}
                                  className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                  title={t('delete', 'Delete')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                  {t('valuer_name', 'Valuer Name')}
                                </dt>
                                <dd className="text-foreground font-medium">
                                  {val.valuer_name}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                  {t('valuation_date', 'Valuation Date')}
                                </dt>
                                <dd className="text-foreground font-medium">
                                  {val.valuation_date
                                    ? new Date(
                                        val.valuation_date,
                                      ).toLocaleDateString()
                                    : t('n_a', 'N/A')}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                  {t('certificate_pdf', 'Certificate PDF')}
                                </dt>
                                <dd className="mt-1">
                                  {val.document ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDownload(
                                          String(val.document_id),
                                          val.document.original_filename,
                                        )
                                      }
                                      className="text-primary flex items-center gap-1.5 text-xs font-bold hover:underline"
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      <span>
                                        {t(
                                          'download_report',
                                          'Download Report',
                                        )}
                                      </span>
                                    </button>
                                  ) : (
                                    <span className="text-xs text-red-500">
                                      {t(
                                        'file_ref_missing',
                                        'File Reference Missing',
                                      )}
                                    </span>
                                  )}
                                </dd>
                              </div>
                              <div className="row-span-2 flex flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                                <span className="text-muted-foreground text-xs font-bold uppercase">
                                  {t(
                                    'assessed_value_total',
                                    'Assessed Value Total',
                                  )}
                                </span>
                                <span className="font-mono text-lg font-bold text-emerald-600">
                                  ₨{' '}
                                  {Number(val.total_valuation).toLocaleString()}
                                </span>
                              </div>

                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold">
                                  {t('land_value', 'Land Value')}
                                </dt>
                                <dd className="text-foreground font-mono font-medium">
                                  ₨ {Number(val.land_value).toLocaleString()}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold">
                                  {t('crop_damage_value', 'Crop Damage Value')}
                                </dt>
                                <dd className="text-foreground font-mono font-medium">
                                  ₨ {Number(val.crop_value).toLocaleString()}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs font-semibold">
                                  {t(
                                    'structure_building_value',
                                    'Structure / Building Value',
                                  )}
                                </dt>
                                <dd className="text-foreground font-mono font-medium">
                                  ₨{' '}
                                  {Number(val.structure_value).toLocaleString()}
                                </dd>
                              </div>

                              {val.remarks && (
                                <div className="md:col-span-4">
                                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                    {t('remarks_field', 'Remarks')}
                                  </dt>
                                  <dd className="text-foreground mt-1 text-xs">
                                    {val.remarks}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-card border-border text-muted-foreground flex h-36 flex-col items-center justify-center gap-2 rounded-lg border text-sm">
                        <DollarSign className="text-muted-foreground/60 h-8 w-8" />
                        <span>
                          {t(
                            'no_valuation_assessment_logged',
                            'No valuation assessment logged.',
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SUB-TAB: COMPENSATION & PAYMENTS ── */}
                {activeTab === 'compensation' && activeParcel && (
                  <div className="space-y-6">
                    {/* ── RECEIPT (ලදු පත) SECTION ── */}
                    <div className="bg-card border-border rounded-lg border p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-amber-100 p-2.5 dark:bg-amber-900/30">
                            <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold">
                              {t('cash_receipt', 'Cash Receipt')}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {t(
                                'receipt_subtitle',
                                'Upload and manage Southern Provincial Council cash receipts.',
                              )}
                            </p>
                          </div>
                        </div>
                        {!showReceiptForm && (
                          <button
                            type="button"
                            onClick={() => {
                              resetReceiptForm();
                              setShowReceiptForm(true);
                            }}
                            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                          >
                            <Plus className="h-4 w-4" />
                            <span>{t('add_receipt', 'Add Receipt')}</span>
                          </button>
                        )}
                      </div>

                      {/* Receipt Form */}
                      {showReceiptForm && (
                        <div className="mt-6 space-y-6 border-t pt-6">
                          <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="text-foreground text-base font-bold">
                              {receiptEditId
                                ? t('edit_receipt', 'Edit Receipt')
                                : t('new_receipt', 'New Receipt')}
                            </h3>
                            <button
                              type="button"
                              onClick={() => setShowReceiptForm(false)}
                              className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                {t('receipt_number', 'Receipt Number')} *
                              </label>
                              <input
                                type="text"
                                required
                                value={receiptNumber}
                                onChange={(e) =>
                                  setReceiptNumber(e.target.value)
                                }
                                className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                                placeholder={t(
                                  'receipt_number_placeholder',
                                  'e.g. I 192384',
                                )}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                {t('receipt_date', 'Date')} *
                              </label>
                              <input
                                type="date"
                                required
                                value={receiptDate}
                                onChange={(e) => setReceiptDate(e.target.value)}
                                className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              />
                            </div>

                            <div className="space-y-1 md:col-span-2">
                              <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                {t('received_from', 'Received From')} *
                              </label>
                              <input
                                type="text"
                                required
                                value={receiptReceivedFrom}
                                onChange={(e) =>
                                  setReceiptReceivedFrom(e.target.value)
                                }
                                className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                                placeholder={t(
                                  'received_from_placeholder',
                                  'Name of person or entity received from',
                                )}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                {t('amount_rupees', 'Amount (Rupees)')} *
                              </label>
                              <input
                                type="number"
                                required
                                value={receiptAmountRupees}
                                onChange={(e) =>
                                  setReceiptAmountRupees(
                                    e.target.value !== ''
                                      ? Number(e.target.value)
                                      : '',
                                  )
                                }
                                className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                                placeholder={t(
                                  'amount_rupees_placeholder',
                                  'e.g. 160000',
                                )}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                {t('amount_cents', 'Cents')}
                              </label>
                              <input
                                type="number"
                                value={receiptAmountCents}
                                onChange={(e) =>
                                  setReceiptAmountCents(
                                    e.target.value !== ''
                                      ? Number(e.target.value)
                                      : '',
                                  )
                                }
                                className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                                placeholder="00"
                                min={0}
                                max={99}
                              />
                            </div>

                            <div className="space-y-1 md:col-span-2">
                              <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                {t('receipt_reason', 'Reason')} *
                              </label>
                              <textarea
                                required
                                value={receiptReason}
                                onChange={(e) =>
                                  setReceiptReason(e.target.value)
                                }
                                className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                                rows={2}
                                placeholder={t(
                                  'receipt_reason_placeholder',
                                  'Reason as stated in the receipt',
                                )}
                              />
                            </div>

                            {/* Receipt file upload */}
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                {t(
                                  'upload_receipt_copy',
                                  'Upload Receipt Copy (PDF/Image) *',
                                )}
                              </label>
                              <div className="flex items-center gap-4">
                                <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                                  <Upload className="text-muted-foreground h-4 w-4" />
                                  <span>
                                    {receiptUploading
                                      ? t('uploading', 'Uploading...')
                                      : t('choose_file', 'Choose File')}
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    disabled={receiptUploading}
                                    onChange={(e) =>
                                      handleWorkflowFileUpload(
                                        e,
                                        'receipt',
                                        setReceiptDocId,
                                        setReceiptDocName,
                                        setReceiptUploading,
                                        activeParcel.id,
                                      )
                                    }
                                  />
                                </label>
                                {receiptDocId ? (
                                  <div className="flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>
                                      {t('uploaded_file', 'Uploaded')}:{' '}
                                      <strong>{receiptDocName}</strong>
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-sm text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>
                                      {t(
                                        'receipt_upload_alert',
                                        'A receipt copy must be uploaded before saving.',
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 border-t pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setShowReceiptForm(false);
                                resetReceiptForm();
                              }}
                              className="border-border hover:bg-muted text-foreground rounded-lg border px-5 py-2 text-sm font-semibold transition-colors"
                            >
                              {t('cancel', 'Cancel')}
                            </button>
                            <button
                              type="button"
                              onClick={(e) =>
                                handleReceiptSubmit(e, activeParcel.id)
                              }
                              disabled={
                                !receiptDocId ||
                                receiptUploading ||
                                isSubmittingReceipt
                              }
                              className="flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isSubmittingReceipt && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              {isSubmittingReceipt
                                ? t('saving', 'Saving...')
                                : receiptEditId
                                  ? t('update_receipt', 'Update Receipt')
                                  : t('save_receipt', 'Save Receipt')}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* List existing receipts */}
                      {activeParcel.receipts &&
                      activeParcel.receipts.length > 0 ? (
                        <div className="mt-6 space-y-4 border-t pt-6">
                          <h4 className="text-foreground flex items-center gap-2 text-sm font-bold">
                            <FileText className="h-4 w-4 text-amber-600" />
                            {t('existing_receipts', 'Existing Receipts')}
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                            {activeParcel.receipts.map((r: any) => (
                              <div
                                key={r.id}
                                className="bg-muted/30 border-border flex items-center justify-between rounded-lg border p-4"
                              >
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400">
                                      #{r.receipt_number}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                      {r.receipt_date
                                        ? new Date(
                                            r.receipt_date,
                                          ).toLocaleDateString()
                                        : t('n_a', 'N/A')}
                                    </span>
                                  </div>
                                  <p className="text-foreground text-sm">
                                    <span className="text-muted-foreground">
                                      {t(
                                        'received_from_label',
                                        'Received From:',
                                      )}
                                    </span>{' '}
                                    {r.received_from || t('n_a', 'N/A')}
                                  </p>
                                  <p className="font-mono text-sm font-bold text-green-700 dark:text-green-400">
                                    ₨{' '}
                                    {Number(
                                      r.amount_rupees || 0,
                                    ).toLocaleString()}
                                    .
                                    {String(r.amount_cents || 0).padStart(
                                      2,
                                      '0',
                                    )}
                                  </p>
                                  {r.reason && (
                                    <p className="text-muted-foreground text-xs">
                                      {t('reason_label', 'Reason:')} {r.reason}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {r.document && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDownload(
                                          String(r.document.id),
                                          r.document.original_filename ||
                                            'Receipt',
                                        )
                                      }
                                      className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
                                      title={t('download', 'Download')}
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => startEditReceipt(r)}
                                    className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                                    title={t('edit', 'Edit')}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReceipt(r.id)}
                                    className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                    title={t('delete', 'Delete')}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        !showReceiptForm && (
                          <div className="mt-4 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4 text-center dark:border-amber-700 dark:bg-amber-900/10">
                            <Receipt className="mx-auto h-8 w-8 text-amber-400" />
                            <p className="text-muted-foreground mt-2 text-sm">
                              {t(
                                'no_receipts_yet',
                                'No receipts added yet. Click "Add Receipt" to upload a cash receipt.',
                              )}
                            </p>
                          </div>
                        )
                      )}
                    </div>

                    {/* ── Divider between Receipt and Compensation sections ── */}
                    <div className="border-border border-t" />

                    <div className="bg-card border-border flex items-center justify-between rounded-lg border p-6">
                      <div>
                        <h3 className="text-base font-semibold">
                          {t(
                            'compensation_schedules_payments',
                            'Compensation Schedules & Payments',
                          )}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {t(
                            'compensation_subtitle',
                            'Record and track payment packages for each affected land owner.',
                          )}
                        </p>
                      </div>
                      {!showCompensationForm && (
                        <button
                          type="button"
                          onClick={() => {
                            resetCompensationForm();
                            setShowCompensationForm(true);
                          }}
                          className="bg-primary hover:bg-primary/95 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                          disabled={
                            !activeParcel.owners ||
                            activeParcel.owners.length === 0
                          }
                        >
                          <Plus className="h-4 w-4" />
                          <span>
                            {t(
                              'calculate_compensation',
                              'Calculate Compensation',
                            )}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Compensation Form */}
                    {showCompensationForm && (
                      <div className="bg-card border-border space-y-6 rounded-lg border p-6">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="text-foreground text-base font-bold">
                            {compensationId
                              ? t('edit_compensation', 'Edit Compensation')
                              : t('setup_compensation', 'Set Up Compensation')}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowCompensationForm(false)}
                            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('select_owner', 'Select Owner')} *
                            </label>
                            <select
                              required
                              value={compOwnerId}
                              onChange={(e) => setCompOwnerId(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              disabled={!!compensationId}
                            >
                              <option value="">
                                {t('choose_owner_option', '-- Choose Owner --')}
                              </option>
                              {activeParcel.owners?.map((owner: any) => (
                                <option key={owner.id} value={owner.id}>
                                  {owner.name} ({owner.nic})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('compensation_ref_id', 'Compensation Ref ID')}{' '}
                              *
                            </label>
                            <input
                              type="text"
                              required
                              value={compRef}
                              onChange={(e) => setCompRef(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              placeholder={t(
                                'compensation_ref_placeholder',
                                'e.g. COMP/2026/029',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('approved_amount_rs', 'Approved Amount (₨)')} *
                            </label>
                            <input
                              type="number"
                              required
                              value={compAmount}
                              onChange={(e) =>
                                setCompAmount(
                                  e.target.value !== ''
                                    ? Number(e.target.value)
                                    : '',
                                )
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                              placeholder={t(
                                'amount_in_lkr_placeholder',
                                'Amount in LKR',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('approval_date', 'Approval Date')} *
                            </label>
                            <input
                              type="date"
                              required
                              value={compApprovedDate}
                              onChange={(e) =>
                                setCompApprovedDate(e.target.value)
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('target_payment_date', 'Target Payment Date')}{' '}
                              *
                            </label>
                            <input
                              type="date"
                              required
                              value={compPaymentDate}
                              onChange={(e) =>
                                setCompPaymentDate(e.target.value)
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('status', 'Status')}
                            </label>
                            <select
                              value={compStatus}
                              onChange={(e) => setCompStatus(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            >
                              <option value="pending">
                                {t('pending', 'Pending')}
                              </option>
                              <option value="approved">
                                {t('approved', 'Approved')}
                              </option>
                              <option value="paid">{t('paid', 'Paid')}</option>
                            </select>
                          </div>
                        </div>

                        {/* Compensation Documents Section */}
                        <div className="border-t pt-4">
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-foreground text-sm font-bold">
                                {t(
                                  'compensation_documents',
                                  'Compensation Documents',
                                )}
                              </h4>
                              <p className="text-muted-foreground text-xs">
                                {t(
                                  'comp_docs_subtitle',
                                  'Upload and view letters, receipts, and compensation vouchers.',
                                )}
                              </p>
                            </div>
                            <label className="bg-primary hover:bg-primary/95 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors">
                              <Upload className="h-3.5 w-3.5" />
                              <span>
                                {compDocUploading
                                  ? t('uploading', 'Uploading...')
                                  : t('upload_document', 'Upload Document')}
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                disabled={compDocUploading}
                                onChange={(e) =>
                                  handleCompDocUpload(e, activeParcel.id)
                                }
                              />
                            </label>
                          </div>
                          <DataTable
                            columns={[
                              {
                                key: 'name',
                                label: t(
                                  'document_name_header',
                                  'Document Name',
                                ),
                              },
                              { key: 'type', label: t('type', 'Type') },
                              {
                                key: 'date',
                                label: t('upload_date_header', 'Upload Date'),
                              },
                              {
                                key: 'actions',
                                label: t('actions', 'Actions'),
                                render: (_val: any, row: any) => (
                                  <div
                                    className="flex items-center justify-end gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDownload(row.id, row.name)
                                      }
                                      className="hover:bg-muted text-primary rounded p-1 transition-colors"
                                      title={t('download', 'Download')}
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDelete(row.id, false)
                                      }
                                      className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                      title={t('delete', 'Delete')}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ),
                              },
                            ]}
                            data={compDocuments}
                            searchable={false}
                            filterable={false}
                          />
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-4">
                          <button
                            type="button"
                            onClick={() => setShowCompensationForm(false)}
                            className="border-border hover:bg-muted text-foreground rounded-lg border px-5 py-2 text-sm font-semibold transition-colors"
                          >
                            {t('cancel', 'Cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={(e) =>
                              handleCompensationSubmit(e, activeParcel.id)
                            }
                            disabled={isSubmittingCompensation}
                            className="flex items-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSubmittingCompensation && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isSubmittingCompensation
                              ? t('saving', 'Saving...')
                              : t('save_schedule', 'Save Schedule')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Payment form */}
                    {showPaymentForm && (
                      <div className="bg-card border-border space-y-6 rounded-lg border p-6">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h3 className="text-foreground text-base font-bold">
                            {paymentId
                              ? t('edit_payment', 'Edit Payment')
                              : t('log_payment', 'Log Payment')}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowPaymentForm(false)}
                            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t(
                                'payment_reference_label',
                                'Payment Reference (Cheque / Tx ID)',
                              )}{' '}
                              *
                            </label>
                            <input
                              type="text"
                              required
                              value={payRef}
                              onChange={(e) => setPayRef(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                              placeholder={t(
                                'cheque_tx_placeholder',
                                'Enter cheque no or tx hash',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('amount_paid_rs', 'Amount Paid (₨)')} *
                            </label>
                            <input
                              type="number"
                              required
                              value={payAmount}
                              onChange={(e) =>
                                setPayAmount(
                                  e.target.value !== ''
                                    ? Number(e.target.value)
                                    : '',
                                )
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                              placeholder={t(
                                'lkr_amount_placeholder',
                                'LKR amount',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('payment_date', 'Payment Date')} *
                            </label>
                            <input
                              type="date"
                              required
                              value={payDate}
                              onChange={(e) => setPayDate(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('payment_method', 'Payment Method')} *
                            </label>
                            <select
                              value={payMethod}
                              onChange={(e) => setPayMethod(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            >
                              <option value="cheque">
                                {t('cheque', 'Cheque')}
                              </option>
                              <option value="bank_transfer">
                                {t('bank_transfer', 'Bank Transfer')}
                              </option>
                              <option value="cash">{t('cash', 'Cash')}</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('bank_name_optional', 'Bank Name (Optional)')}
                            </label>
                            <input
                              type="text"
                              value={payBank}
                              onChange={(e) => setPayBank(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              placeholder={t(
                                'bank_name_placeholder',
                                'e.g. Bank of Ceylon',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t(
                                'account_number_optional',
                                'Account Number (Optional)',
                              )}
                            </label>
                            <input
                              type="text"
                              value={payAccount}
                              onChange={(e) => setPayAccount(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                              placeholder={t(
                                'account_number_placeholder',
                                'Account number or cheque branch',
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('status', 'Status')}
                            </label>
                            <select
                              value={payStatus}
                              onChange={(e) =>
                                setPayStatus(e.target.value as any)
                              }
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                            >
                              <option value="completed">
                                {t('completed', 'Completed')}
                              </option>
                              <option value="pending">
                                {t('pending', 'Pending')}
                              </option>
                              <option value="failed">
                                {t('failed', 'Failed')}
                              </option>
                            </select>
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t('remarks_field', 'Remarks')}
                            </label>
                            <textarea
                              value={payRemarks}
                              onChange={(e) => setPayRemarks(e.target.value)}
                              className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                              rows={2}
                              placeholder={t(
                                'payment_notes_placeholder',
                                'Payment notes',
                              )}
                            />
                          </div>

                          {/* Mandatory Payment receipt upload */}
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                              {t(
                                'upload_receipt_mandatory',
                                'Upload Payment Receipt / Cheque copy (MANDATORY PDF) *',
                              )}
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                                <Upload className="text-muted-foreground h-4 w-4" />
                                <span>
                                  {payUploading
                                    ? t('uploading', 'Uploading...')
                                    : t('choose_file', 'Choose File')}
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf"
                                  disabled={payUploading}
                                  onChange={(e) =>
                                    handleWorkflowFileUpload(
                                      e,
                                      'payment_receipt',
                                      setPayDocId,
                                      setPayDocName,
                                      setPayUploading,
                                      activeParcel.id,
                                    )
                                  }
                                />
                              </label>
                              {payDocId ? (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>
                                    {t('uploaded_receipt', 'Uploaded Receipt')}:{' '}
                                    <strong>{payDocName}</strong>
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>
                                    {t(
                                      'payment_receipt_upload_alert',
                                      'A payment receipt PDF must be uploaded before saving.',
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-4">
                          <button
                            type="button"
                            onClick={() => setShowPaymentForm(false)}
                            className="border-border hover:bg-muted text-foreground rounded-lg border px-5 py-2 text-sm font-semibold transition-colors"
                          >
                            {t('cancel', 'Cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={handlePaymentSubmit}
                            disabled={
                              !payDocId || payUploading || isSubmittingPayment
                            }
                            className="flex items-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSubmittingPayment && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isSubmittingPayment
                              ? t('saving', 'Saving...')
                              : payUploading
                                ? t('uploading_receipt', 'Uploading Receipt...')
                                : paymentId
                                  ? t('update_payment', 'Update Payment')
                                  : t('save_payment', 'Save Payment')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* List existing compensations */}
                    {activeParcel.compensations &&
                    activeParcel.compensations.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {activeParcel.compensations.map((comp: any) => {
                          return (
                            <div
                              key={comp.id}
                              className="bg-card border-border shadow-xs space-y-6 rounded-lg border p-6"
                            >
                              <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="text-primary h-5 w-5" />
                                    <h4 className="text-foreground text-base font-bold">
                                      {t('compensation_ref', 'Compensation')}:{' '}
                                      {comp.compensation_id}
                                    </h4>
                                  </div>
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    {t('owner', 'Owner')}:{' '}
                                    <strong>
                                      {comp.owner?.name || t('n_a', 'N/A')}
                                    </strong>{' '}
                                    ({comp.owner?.nic || t('n_a', 'N/A')})
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <StatusBadge status={comp.status} />
                                  <button
                                    type="button"
                                    onClick={() => startEditCompensation(comp)}
                                    className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                                    title={t('edit', 'Edit')}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteCompensation(comp.id)
                                    }
                                    className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                    title={t('delete', 'Delete')}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="bg-muted/20 border-border/50 grid grid-cols-1 gap-4 rounded-lg border p-4 text-sm md:grid-cols-3">
                                <div>
                                  <span className="text-muted-foreground block text-xs font-semibold uppercase">
                                    {t(
                                      'total_approved_amount',
                                      'Total Approved Amount',
                                    )}
                                  </span>
                                  <span className="text-foreground font-mono text-base font-bold">
                                    ₨ {Number(comp.amount).toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-xs font-semibold uppercase">
                                    {t('approved_date', 'Approved Date')}
                                  </span>
                                  <span className="text-foreground text-sm font-medium">
                                    {comp.approved_date
                                      ? new Date(
                                          comp.approved_date,
                                        ).toLocaleDateString()
                                      : t('n_a', 'N/A')}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-xs font-semibold uppercase">
                                    {t(
                                      'target_payment_date',
                                      'Target Payment Date',
                                    )}
                                  </span>
                                  <span className="text-foreground text-sm font-medium">
                                    {comp.payment_date
                                      ? new Date(
                                          comp.payment_date,
                                        ).toLocaleDateString()
                                      : t('n_a', 'N/A')}
                                  </span>
                                </div>
                              </div>

                              {/* Payment Settlement (Paid in Full) */}
                              <div className="space-y-3">
                                {comp.payments && comp.payments.length > 0 ? (
                                  <div className="bg-muted/30 border-border rounded-lg border p-4">
                                    <h5 className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-bold">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span>
                                        {t(
                                          'payment_settlement_paid_full',
                                          'Payment Settlement (Paid in Full)',
                                        )}
                                      </span>
                                    </h5>
                                    <dl className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2 lg:grid-cols-3">
                                      <div>
                                        <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                          {t('payment_date', 'Payment Date')}
                                        </dt>
                                        <dd className="text-foreground font-medium">
                                          {comp.payments[0].payment_date
                                            ? new Date(
                                                comp.payments[0].payment_date,
                                              ).toLocaleDateString()
                                            : t('n_a', 'N/A')}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                          {t(
                                            'payment_reference_label',
                                            'Payment Reference',
                                          )}
                                        </dt>
                                        <dd className="text-foreground font-mono font-medium">
                                          {comp.payments[0].payment_reference}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                          {t(
                                            'payment_method',
                                            'Payment Method',
                                          )}
                                        </dt>
                                        <dd className="text-foreground font-medium uppercase">
                                          {comp.payments[0].payment_method ===
                                          'cheque'
                                            ? t('cheque', 'Cheque')
                                            : comp.payments[0]
                                                  .payment_method ===
                                                'bank_transfer'
                                              ? t(
                                                  'bank_transfer',
                                                  'Bank Transfer',
                                                )
                                              : t('cash', 'Cash')}
                                          {comp.payments[0].bank_name
                                            ? ` (${comp.payments[0].bank_name})`
                                            : ''}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                          {t('amount_paid', 'Amount Paid')}
                                        </dt>
                                        <dd className="text-foreground font-mono font-bold text-green-600">
                                          ₨{' '}
                                          {Number(
                                            comp.payments[0].amount_paid,
                                          ).toLocaleString()}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                          {t('receipt_file', 'Receipt File')}
                                        </dt>
                                        <dd className="mt-1">
                                          {comp.payments[0].document ? (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDownload(
                                                  String(
                                                    comp.payments[0]
                                                      .document_id,
                                                  ),
                                                  comp.payments[0].document
                                                    .original_filename,
                                                )
                                              }
                                              className="text-primary flex items-center gap-1 font-semibold hover:underline"
                                            >
                                              <FileDown className="h-3.5 w-3.5" />
                                              <span>
                                                {t(
                                                  'download_receipt',
                                                  'Download Receipt',
                                                )}
                                              </span>
                                            </button>
                                          ) : (
                                            <span className="text-red-500">
                                              {t(
                                                'no_file_reference',
                                                'No file reference',
                                              )}
                                            </span>
                                          )}
                                        </dd>
                                      </div>
                                      <div className="flex items-end justify-end gap-2 lg:col-span-3">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            startEditPayment(comp.payments[0])
                                          }
                                          className="hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 rounded border px-2 py-1 transition-colors"
                                          title={t(
                                            'edit_payment_tooltip',
                                            'Edit Payment',
                                          )}
                                        >
                                          <Pencil className="h-3 w-3" />
                                          <span>
                                            {t(
                                              'edit_payment_details',
                                              'Edit Payment Details',
                                            )}
                                          </span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeletePayment(
                                              comp.payments[0].id,
                                            )
                                          }
                                          className="flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                          title={t(
                                            'delete_payment_tooltip',
                                            'Delete Payment',
                                          )}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          <span>
                                            {t(
                                              'delete_payment',
                                              'Delete Payment',
                                            )}
                                          </span>
                                        </button>
                                      </div>
                                    </dl>
                                  </div>
                                ) : (
                                  <div className="bg-muted/10 border-border rounded-md border border-dashed p-4 text-center">
                                    <p className="text-muted-foreground mb-3 text-xs">
                                      {t(
                                        'no_payments_recorded',
                                        'No payment has been recorded for this compensation schedule.',
                                      )}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startAddPayment(
                                          comp.id,
                                          Number(comp.amount),
                                        )
                                      }
                                      className="bg-primary hover:bg-primary/95 mx-auto flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors"
                                    >
                                      <Plus className="h-3 w-3" />
                                      <span>
                                        {t('record_payment', 'Record Payment')}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-card border-border text-muted-foreground flex h-36 flex-col items-center justify-center gap-2 rounded-lg border text-sm">
                        <CheckCircle className="text-muted-foreground/60 h-8 w-8" />
                        <span>
                          {t(
                            'no_compensation_setup_logged',
                            'No compensation setup logged.',
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

        {/* ── Bottom actions ── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.visit('/projects')}
            disabled={submitting}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" /> {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm text-white transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitting ? t('saving', 'Saving...') : t('save_project')}
          </button>
        </div>
      </form>
    </div>
  );
}

AddProject.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
