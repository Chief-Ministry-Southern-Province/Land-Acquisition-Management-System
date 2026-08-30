import { Link, router, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  Download,
  MapPin,
  Pencil,
  Trash2,
  X,
  Plus,
  Upload,
  DollarSign,
  CheckCircle,
  FileText,
  AlertCircle,
  FileDown,
  Scale,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { confirmDialog, toastError, toastSuccess } from '@/lib/alerts';
import api from '@/services/api';
import { getAuditLogs } from '@/services/auditLogService';
import {
  deleteDocument,
  downloadDocument,
  uploadDocument,
} from '@/services/documentManagementService';
import {
  getLandParcel,
  exportLandParcels,
} from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';
import {
  createPayment,
  updatePayment,
  deletePayment,
} from '@/services/paymentService';
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

interface Props {
  id: string;
}

export default function LandParcelDetails({ id }: Props) {
  const { locale, t } = useTranslation();
  const [parcel, setParcel] = useState<LandParcel | null>(null);

  const getCultivationStatusText = (status: string) => {
    switch (status) {
      case 'fertile': return t('fertile', 'Fertile');
      case 'mid': return t('mid', 'Moderate');
      case 'infertile': return t('infertile', 'Infertile');
      default: return t('unspecified', 'Unspecified');
    }
  };
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Survey Form State
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

  // Valuation Form State
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

  // Compensation Form State
  const [showCompensationForm, setShowCompensationForm] = useState(false);
  const [compensationId, setCompensationId] = useState<string | null>(null);
  const [compOwnerId, setCompOwnerId] = useState('');
  const [compRef, setCompRef] = useState('');
  const [compAmount, setCompAmount] = useState<number | ''>('');
  const [compApprovedDate, setCompApprovedDate] = useState('');
  const [compPaymentDate, setCompPaymentDate] = useState('');
  const [compStatus, setCompStatus] = useState('pending');

  // Payment Form State
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
  const [compDocUploading, setCompDocUploading] = useState(false);

  // Legal Documents State
  const [legalDocUploading, setLegalDocUploading] = useState(false);
  const [legalDocTitle, setLegalDocTitle] = useState('');
  const [legalDocCategory, setLegalDocCategory] = useState('court_order');
  const [legalDocRefNumber, setLegalDocRefNumber] = useState('');
  const [showLegalUploadForm, setShowLegalUploadForm] = useState(false);

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userRole = user?.role?.role_name || 'User';
  const isDO = userRole === 'DO';

  const fetchParcelDetails = useCallback(async () => {
    try {
      const data = await getLandParcel(id);
      setParcel(data);

      try {
        const logs = await getAuditLogs({ module: 'Land Parcels' });
        const filtered = logs.filter((log) =>
          log.details.includes(data.parcel_id),
        );
        const mapped = filtered.map((log) => {
          let formattedDate = 'N/A';

          if (log.timestamp) {
            try {
              formattedDate = new Date(log.timestamp)
                .toISOString()
                .split('T')[0];
            } catch {
              formattedDate = log.timestamp;
            }
          }

          return {
            date: formattedDate,
            event: log.details,
            user: log.user,
          };
        });
        setHistory(mapped);
      } catch (err) {
        console.error('Failed to fetch audit logs for land parcel:', err);
      }
    } catch (error) {
      console.error('Failed to fetch land parcel:', error);
    }
  }, [id]);

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true);
        await fetchParcelDetails();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initialFetch();
    }
  }, [id, fetchParcelDetails]);

  const handleExportPdf = async () => {
    try {
      setLoading(true);
      await exportLandParcels('pdf', id, locale);
    } catch (error) {
      console.error('Failed to export land parcel as PDF:', error);
      toastError('Failed to export land parcel.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    if (!docId || docId.startsWith('mock-')) {
      toastError('This is a placeholder document and cannot be downloaded.');

      return;
    }

    try {
      await downloadDocument(docId, filename);
    } catch (error) {
      console.error('Failed to download document:', error);
      toastError('Failed to download document.');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!docId || docId.startsWith('mock-')) {
      toastError('This is a placeholder document and cannot be deleted.');

      return;
    }

    const confirmed = await confirmDialog({
      title: 'Delete Document',
      text: 'Are you sure you want to delete this document?',
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await deleteDocument(docId);
      await fetchParcelDetails();
      toastSuccess('Document deleted successfully.');
    } catch (error) {
      console.error('Failed to delete document:', error);
      toastError('Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  // Helper file upload handler
  const handleWorkflowFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: string,
    setDocId: (id: string) => void,
    setDocName: (name: string) => void,
    setUploading: (state: boolean) => void,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const doc = await uploadDocument(
        file,
        String(user.id),
        parcel?.project_id || null,
        category,
        parcel?.id || null,
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
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setCompDocUploading(true);
      await uploadDocument(
        file,
        String(user.id),
        parcel?.project_id || null,
        'compensation',
        parcel?.id || null,
      );
      toastSuccess('Document uploaded successfully!');
      await fetchParcelDetails();
    } catch (err) {
      console.error(err);
      toastError('Failed to upload document. Please try again.');
    } finally {
      setCompDocUploading(false);
    }
  };

  // Survey Form Submission
  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      land_parcel_id: String(parcel?.id),
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
      setLoading(true);

      if (surveyId) {
        await updateSurvey(surveyId, payload);
        toastSuccess('Survey record updated successfully.');
      } else {
        await createSurvey(payload);
        toastSuccess('Survey plan registered successfully.');
      }

      setShowSurveyForm(false);
      resetSurveyForm();
      await fetchParcelDetails();
    } catch (err: any) {
      console.error(err);
      toastError(
        err.response?.data?.message || 'Failed to submit survey plan.',
      );
    } finally {
      setLoading(false);
    }
  };

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
    setSurveyorName(s.surveyor_name);
    setSurveyDate(s.survey_date ? s.survey_date.split('T')[0] : '');
    setSurveyRefNumber(s.survey_ref_number);
    setSurveyedSizePerches(Number(s.surveyed_size_perches));
    setSurveyStatus(s.status);
    setSurveyRemarks(s.remarks || '');
    setSurveyCoordinates(
      s.survey_coordinates ? JSON.stringify(s.survey_coordinates, null, 2) : '',
    );
    setSurveyDocId(String(s.document_id));
    setSurveyDocName(s.document?.original_filename || 'Survey Plan PDF');
    setShowSurveyForm(true);
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
      setLoading(true);
      await deleteSurvey(sId);
      toastSuccess('Survey record deleted.');
      await fetchParcelDetails();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete survey record.');
    } finally {
      setLoading(false);
    }
  };

  // Valuation Form Submission
  const handleValuationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!valuationDocId) {
      toastError(
        'Mandatory Checklist: Please upload the valuation report PDF.',
      );

      return;
    }

    const payload = {
      land_parcel_id: String(parcel?.id),
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
      setLoading(true);

      if (valuationId) {
        await updateValuation(valuationId, payload);
        toastSuccess('Valuation record updated successfully.');
      } else {
        await createValuation(payload);
        toastSuccess('Valuation report registered successfully.');
      }

      setShowValuationForm(false);
      resetValuationForm();
      await fetchParcelDetails();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to submit valuation.');
    } finally {
      setLoading(false);
    }
  };

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
    setValuerName(v.valuer_name);
    setValuationDate(v.valuation_date ? v.valuation_date.split('T')[0] : '');
    setValuationRefNumber(v.valuation_ref_number);
    setLandValue(Number(v.land_value));
    setCropValue(Number(v.crop_value));
    setStructureValue(Number(v.structure_value));
    setValuationStatus(v.status);
    setValuationRemarks(v.remarks || '');
    setValuationDocId(String(v.document_id));
    setValuationDocName(v.document?.original_filename || 'Valuation PDF');
    setShowValuationForm(true);
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
      setLoading(true);
      await deleteValuation(vId);
      toastSuccess('Valuation record deleted.');
      await fetchParcelDetails();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete valuation.');
    } finally {
      setLoading(false);
    }
  };

  // Compensation Form Submission
  const handleCompensationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!compOwnerId) {
      toastError('Please select a property owner.');

      return;
    }

    const payload = {
      owner_id: compOwnerId,
      land_parcel_id: String(parcel?.id),
      compensation_id: compRef,
      amount: Number(compAmount || 0),
      approved_date: compApprovedDate,
      payment_date: compPaymentDate,
      status: compStatus,
    };

    try {
      setLoading(true);

      if (compensationId) {
        await api.put(`/api/compensation/${compensationId}`, payload);
        toastSuccess('Compensation schedule updated.');
      } else {
        await api.post('/api/compensation', payload);
        toastSuccess('Compensation schedule created.');
      }

      setShowCompensationForm(false);
      resetCompensationForm();
      await fetchParcelDetails();
    } catch (err: any) {
      console.error(err);
      toastError(
        err.response?.data?.message || 'Failed to submit compensation.',
      );
    } finally {
      setLoading(false);
    }
  };

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
    setCompRef(c.compensation_id);
    setCompAmount(Number(c.amount));
    setCompApprovedDate(c.approved_date ? c.approved_date.split('T')[0] : '');
    setCompPaymentDate(c.payment_date ? c.payment_date.split('T')[0] : '');
    setCompStatus(c.status);
    setShowCompensationForm(true);
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
      setLoading(true);
      await api.delete(`/api/compensation/${cId}`);
      toastSuccess('Compensation schedule deleted.');
      await fetchParcelDetails();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete compensation.');
    } finally {
      setLoading(false);
    }
  };

  // Payment Form Submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      setLoading(true);

      if (paymentId) {
        await updatePayment(paymentId, payload);
        toastSuccess('Payment record updated.');
      } else {
        await createPayment(payload);
        toastSuccess('Payment installment logged successfully.');
      }

      setShowPaymentForm(false);
      resetPaymentForm();
      await fetchParcelDetails();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to submit payment.');
    } finally {
      setLoading(false);
    }
  };

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

  const startAddPayment = (compId: string) => {
    resetPaymentForm();
    setPayCompensationId(compId);
    const comp = parcel?.compensations?.find(
      (c: any) => String(c.id) === compId,
    );

    if (comp) {
      setPayAmount(Number(comp.amount));
    }

    setShowPaymentForm(true);
  };

  const startEditPayment = (p: any) => {
    setPaymentId(String(p.id));
    setPayCompensationId(String(p.compensation_id));
    setPayRef(p.payment_reference);
    setPayAmount(Number(p.amount_paid));
    setPayDate(p.payment_date ? p.payment_date.split('T')[0] : '');
    setPayMethod(p.payment_method);
    setPayBank(p.bank_name || '');
    setPayAccount(p.account_number || '');
    setPayStatus(p.status);
    setPayRemarks(p.remarks || '');
    setPayDocId(String(p.document_id));
    setPayDocName(p.document?.original_filename || 'Payment Receipt PDF');
    setShowPaymentForm(true);
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
      setLoading(true);
      await deletePayment(pId);
      toastSuccess('Payment record deleted.');
      await fetchParcelDetails();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete payment.');
    } finally {
      setLoading(false);
    }
  };

  // Keep other tables mock/placeholder since their services are not implemented
  const owners =
    parcel?.owners && parcel.owners.length > 0
      ? parcel.owners.map((o) => ({
          name: o.name,
          nic: o.nic,
          share: '100%',
          type: 'Full Owner',
        }))
      : [];

  const dbDocuments: any[] = [];

  // General documents
  if (parcel?.documents && parcel.documents.length > 0) {
    parcel.documents.forEach((d: any) => {
      const fileTypeStr = d.fileType || d.file_type || 'N/A';
      dbDocuments.push({
        id: String(d.id),
        name: d.originalFilename || d.original_filename || 'Unnamed Document',
        type: fileTypeStr.toUpperCase().replace('.', ''),
        date: d.uploadDate || d.upload_date || 'N/A',
      });
    });
  }

  // Survey plans
  parcel?.surveys?.forEach((s: any) => {
    if (s.document) {
      const fileTypeStr = s.document.originalFilename
        ? s.document.fileType || 'PDF'
        : s.document.file_type || 'PDF';
      dbDocuments.push({
        id: String(s.document.id),
        name: `Survey Plan - Ref: ${s.survey_ref_number || 'N/A'}`,
        type: fileTypeStr.toUpperCase().replace('.', ''),
        date: s.document.uploadDate || s.document.upload_date || 'N/A',
      });
    }
  });

  // Valuation reports
  parcel?.valuations?.forEach((v: any) => {
    if (v.document) {
      const fileTypeStr = v.document.originalFilename
        ? v.document.fileType || 'PDF'
        : v.document.file_type || 'PDF';
      dbDocuments.push({
        id: String(v.document.id),
        name: `Valuation Report - Ref: ${v.valuation_ref_number || 'N/A'}`,
        type: fileTypeStr.toUpperCase().replace('.', ''),
        date: v.document.uploadDate || v.document.upload_date || 'N/A',
      });
    }
  });

  // Payment receipts
  parcel?.compensations?.forEach((c: any) => {
    c.payments?.forEach((p: any) => {
      if (p.document) {
        const fileTypeStr = p.document.originalFilename
          ? p.document.fileType || 'PDF'
          : p.document.file_type || 'PDF';
        dbDocuments.push({
          id: String(p.document.id),
          name: `Payment Receipt - Ref: ${p.payment_reference || 'N/A'} (Parcel ${parcel.parcel_id})`,
          type: fileTypeStr.toUpperCase().replace('.', ''),
          date: p.document.uploadDate || p.document.upload_date || 'N/A',
        });
      }
    });
  });

  const filteredDocuments =
    dbDocuments.length > 0
      ? dbDocuments
      : [
          {
            id: 'mock-3',
            name: 'Ownership Certificate',
            type: 'PDF',
            date: '2024-02-05',
          },
          {
            id: 'mock-4',
            name: 'Site Photographs',
            type: 'ZIP',
            date: '2024-03-10',
          },
        ];

  const compDocuments =
    parcel?.documents && parcel.documents.length > 0
      ? parcel.documents
          .filter(
            (d: any) =>
              (d.documentCategory || d.document_category) === 'compensation',
          )
          .map((d: any) => {
            const fileTypeStr = d.fileType || d.file_type || 'N/A';

            return {
              id: d.id,
              name:
                d.originalFilename || d.original_filename || 'Unnamed Document',
              type: fileTypeStr.toUpperCase().replace('.', ''),
              date: d.uploadDate || d.upload_date || 'N/A',
            };
          })
      : [];

  if (loading && !parcel) {
    return (
      <div className="text-muted-foreground flex h-96 items-center justify-center">
        {t('loading_project_details_view', 'Loading parcel details...')}
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="text-muted-foreground flex h-96 flex-col items-center justify-center gap-4">
        <p>{t('land_parcel_not_found', 'Land parcel not found.')}</p>
        <Link href="/land-parcels" className="text-primary hover:underline">
          {t('back_to_land_parcels', 'Back to Land Parcels')}
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: t('general_information', 'General Information') },
    { id: 'survey', label: t('survey_info', 'Survey Info') },
    { id: 'valuation', label: t('valuation_details', 'Valuation Details') },
    { id: 'compensation', label: t('compensation_payments', 'Compensation & Payments') },
    ...(parcel.is_casehold
      ? [{ id: 'legal', label: t('legal_obligations', 'Legal & Obligations') }]
      : []),
  ];

  // Filter legal documents from parcel documents
  const legalDocuments =
    parcel?.documents && parcel.documents.length > 0
      ? parcel.documents
          .filter(
            (d: any) =>
              (d.documentCategory || d.document_category) === 'legal' ||
              (d.documentCategory || d.document_category) === 'legal_document',
          )
          .map((d: any) => {
            const fileTypeStr = d.fileType || d.file_type || 'N/A';

            return {
              id: String(d.id),
              name:
                d.originalFilename || d.original_filename || 'Unnamed Document',
              type: fileTypeStr.toUpperCase().replace('.', ''),
              date: d.uploadDate || d.upload_date || 'N/A',
            };
          })
      : [];

  const handleLegalDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setLegalDocUploading(true);
      await uploadDocument(
        file,
        String(user.id),
        parcel?.project_id || null,
        'legal',
        parcel?.id || null,
      );
      toastSuccess(t('legal_document_uploaded_success', 'Legal document uploaded successfully!'));
      setShowLegalUploadForm(false);
      setLegalDocTitle('');
      setLegalDocCategory('court_order');
      setLegalDocRefNumber('');
      await fetchParcelDetails();
    } catch (err) {
      console.error(err);
      toastError(t('failed_upload_legal_doc', 'Failed to upload legal document. Please try again.'));
    } finally {
      setLegalDocUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/land-parcels"
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            title={t('back_to_land_parcels', 'Back to Land Parcels')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1>{t('land_number_colon', 'Land Number:')} {parcel.parcel_id}</h1>
              <StatusBadge status={parcel.status} />
            </div>
            <p className="text-muted-foreground">{parcel.land_name || ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDO && parcel.status === 'available' && (
            <button
              onClick={() => router.visit(`/land-parcels/${parcel.id}/edit`)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
            >
              <Pencil className="h-4 w-4" />
              <span>{t('edit_land_parcel', 'Edit Land Parcel')}</span>
            </button>
          )}
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>{t('view_on_map_tooltip', 'View on Map')}</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors"
            title={t('export_land_acq_form_tooltip', 'Export Land Acquisition Application Form (PDF)')}
          >
            <Download className="h-4 w-4" />
            <span>{t('export_form_pdf', 'Export Form (PDF)')}</span>
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="border-border border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* TAB CONTENT: General Info */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="mb-4">{t('parcel_overview', 'Parcel Overview')}</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('land_name_colon', 'Land Name:')}</dt>
                <dd className="font-medium">{parcel.land_name || t('n_a', 'N/A')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('province_district_label', 'Province / District:')}</dt>
                <dd>
                  {parcel.province || t('southern_default', 'Southern')} / {parcel.district}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t('divisional_secretariat_colon', 'Divisional Secretariat:')}
                </dt>
                <dd>
                  {parcel.divisional_secretariat || parcel.division || t('n_a', 'N/A')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t('gn_division_colon', 'Grama Niladhari Division:')}
                </dt>
                <dd>{parcel.grama_niladari_division || t('n_a', 'N/A')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('village_town_colon', 'Village / Town:')}</dt>
                <dd>{parcel.village}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('extent_breakdown_label', 'Extent Breakdown:')}</dt>
                <dd className="font-mono">
                  {parcel.land_size_acers ?? parcel.extent_acers ?? 0} {t('ac_abbr', 'A')},{' '}
                  {parcel.land_size_roods ?? 0} {t('rd_abbr', 'R')},{' '}
                  {parcel.land_size_perches ?? parcel.extent_perches ?? 0} {t('per_abbr', 'P')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('total_land_size_label', 'Total Land Size:')}</dt>
                <dd className="font-medium">
                  {parcel.full_land_size ?? 0} {t('perches', 'Perches')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('plan_status_label', 'Plan Status:')}</dt>
                <dd>{parcel.has_plan ? t('has_plan', 'Has Plan') : t('no_plan', 'No Plan')}</dd>
              </div>
              {parcel.has_plan ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('plan_number_colon', 'Plan Number:')}</dt>
                    <dd>{parcel.plan_number || t('n_a', 'N/A')}</dd>
                  </div>
                  {parcel.parcel_numbers &&
                    parcel.parcel_numbers.length > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          {t('parcel_numbers_colon', 'Parcel Numbers:')}
                        </dt>
                        <dd className="font-mono">
                          {parcel.parcel_numbers.join(', ')}
                        </dd>
                      </div>
                    )}
                </>
              ) : (
                <>
                  <div className="border-border my-2 flex items-center justify-between border-t pt-2">
                    <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      {t('plan_boundaries_label', 'Plan Boundaries')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('north_boundary_label', 'North Boundary:')}</dt>
                    <dd className="text-right">
                      {parcel.boundaries_north || t('n_a', 'N/A')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('south_boundary_label', 'South Boundary:')}</dt>
                    <dd className="text-right">
                      {parcel.boundaries_south || t('n_a', 'N/A')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('east_boundary_label', 'East Boundary:')}</dt>
                    <dd className="text-right">
                      {parcel.boundaries_east || t('n_a', 'N/A')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('west_boundary_label', 'West Boundary:')}</dt>
                    <dd className="text-right">
                      {parcel.boundaries_west || t('n_a', 'N/A')}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('cultivation_status_label', 'Cultivation & Status:')}</dt>
                <dd>
                  {parcel.cultivation || t('n_a', 'N/A')} (
                  {getCultivationStatusText(parcel.cultivation_status || 'fertile')})
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('annual_income_colon', 'Annual Income:')}</dt>
                <dd>₨ {Number(parcel.annual_income || 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('land_type_colon', 'Land Type:')}</dt>
                <dd>{parcel.land_type || t('standard_land_type', 'Standard')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('estimated_value_colon', 'Estimated Value:')}</dt>
                <dd className="font-medium">
                  ₨ {Number(parcel.estimated_value || 0).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t('residential_owner_living_colon', 'Residential / Owner Living:')}
                </dt>
                <dd>
                  {parcel.has_residential_houses ? t('yes', 'Yes') : t('no', 'No')} /{' '}
                  {parcel.is_resident_owner ? t('yes', 'Yes') : t('no', 'No')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('donated_status_label', 'Donated Status:')}</dt>
                <dd
                  className={
                    parcel.is_donated
                      ? 'font-medium text-green-600 dark:text-green-400'
                      : ''
                  }
                >
                  {parcel.is_donated ? t('yes_donated', 'Yes (Donated)') : t('no', 'No')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t('litigation_casehold_label', 'Litigation / Casehold:')}
                </dt>
                <dd
                  className={
                    parcel.is_casehold
                      ? 'font-medium text-amber-600 dark:text-amber-400'
                      : ''
                  }
                >
                  {parcel.is_casehold ? t('yes_casehold', 'Yes (Under Litigation)') : t('no', 'No')}
                </dd>
              </div>
              {parcel.is_casehold && (
                <>
                  <div className="flex justify-between border-l border-amber-200 pl-4">
                    <dt className="text-muted-foreground text-xs">
                      {t('case_number_colon', 'Case Number:')}
                    </dt>
                    <dd className="font-mono text-xs">
                      {parcel.case_number || t('n_a', 'N/A')}
                    </dd>
                  </div>
                  <div className="flex justify-between border-l border-amber-200 pl-4">
                    <dt className="text-muted-foreground text-xs">
                      {t('case_status_colon', 'Case Status:')}
                    </dt>
                    <dd className="text-xs">{parcel.case_status || t('n_a', 'N/A')}</dd>
                  </div>
                  <div className="flex justify-between border-l border-amber-200 pl-4">
                    <dt className="text-muted-foreground text-xs">
                      {t('case_period_label', 'Case Period:')}
                    </dt>
                    <dd className="text-xs">
                      {parcel.case_start_date
                        ? new Date(parcel.case_start_date).toLocaleDateString()
                        : t('n_a', 'N/A')}{' '}
                      -{' '}
                      {parcel.case_end_date
                        ? new Date(parcel.case_end_date).toLocaleDateString()
                        : t('active', 'Active')}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('associated_project_colon', 'Associated Project:')}</dt>
                <dd>
                  {parcel.project ? (
                    <Link
                      href={`/projects/${parcel.project.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {parcel.project.title || parcel.project.name}
                    </Link>
                  ) : (
                    t('none', 'None')
                  )}
                </dd>
              </div>
              <div className="border-border my-2 flex items-center justify-between border-t pt-2" />
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('gps_location_label', 'GPS Location:')}</dt>
                <dd className="font-mono text-xs">
                  {parcel.latitude && parcel.longitude
                    ? `${Number(parcel.latitude).toFixed(6)}, ${Number(parcel.longitude).toFixed(6)}`
                    : t('n_a', 'N/A')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t('remarks_colon', 'Remarks:')}</dt>
                <dd className="text-right">{parcel.remarks || t('no_remarks', 'No remarks')}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4">{t('ownership', 'Ownership')}</h3>
              <DataTable
                columns={[
                  { key: 'name', label: t('owner_name_header', 'Owner Name') },
                  { key: 'nic', label: t('nic', 'NIC') },
                  { key: 'share', label: t('share', 'Share') },
                  { key: 'type', label: t('type', 'Type') },
                ]}
                data={owners}
                searchable={false}
                filterable={false}
                exportable={false}
              />
            </div>

            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4">{t('land_documents', 'Documents')}</h3>
              <DataTable
                columns={[
                  { key: 'name', label: t('document_name_header', 'Document Name') },
                  { key: 'type', label: t('type', 'Type') },
                  { key: 'date', label: t('date', 'Date') },
                  {
                    key: 'actions',
                    label: t('actions', 'Actions'),
                    render: (_val: any, row: any) => {
                      const isAvailable = parcel?.status === 'available';

                      return (
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleDownload(row.id, row.name)}
                            className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
                            title={t('download', 'Download')}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {isAvailable && isDO && (
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              title={t('delete', 'Delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      );
                    },
                  },
                ]}
                data={filteredDocuments}
                searchable={false}
                filterable={false}
              />
            </div>
          </div>

          <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
            <h3 className="mb-4">{t('history', 'History')}</h3>
            <DataTable
              columns={[
                { key: 'date', label: t('date', 'Date') },
                { key: 'event', label: t('event', 'Event') },
                { key: 'user', label: t('user', 'User') },
              ]}
              data={history}
              searchable={false}
              filterable={false}
              exportable={false}
            />
          </div>
        </div>
      )}

      {/* TAB CONTENT: Survey Info */}
      {activeTab === 'survey' && (
        <div className="space-y-6">
          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-6">
            <div>
              <h3 className="text-base font-semibold">
                {t('survey_plan_records', 'Survey Plan Records')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('survey_plans_subtitle', 'Register and view surveyor reports and official survey maps of the land.')}
              </p>
            </div>
            {isDO && !showSurveyForm && (
              <button
                onClick={() => {
                  resetSurveyForm();
                  setShowSurveyForm(true);
                }}
                className="bg-primary hover:bg-primary/95 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {parcel.surveys && parcel.surveys.length > 0
                    ? t('update_survey_plan', 'Update Survey plan')
                    : t('register_survey_plan', 'Register Survey Plan')}
                </span>
              </button>
            )}
          </div>

          {showSurveyForm && (
            <form
              onSubmit={handleSurveySubmit}
              className="bg-card border-border space-y-6 rounded-lg border p-6"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-foreground text-base font-bold">
                  {surveyId ? t('edit_survey_record', 'Edit Survey Record') : t('register_survey_plan', 'Register Survey Plan')}
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
                    placeholder={t('enter_surveyor_fullname', 'Enter surveyor full name')}
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
                    onChange={(e) => setSurveyRefNumber(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder={t('survey_ref_placeholder', 'e.g. SRV/2026/G/8732')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('surveyed_size_perches', 'Surveyed Size (Perches)')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={surveyedSizePerches}
                    onChange={(e) =>
                      setSurveyedSizePerches(
                        e.target.value !== '' ? Number(e.target.value) : '',
                      )
                    }
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder={t('size_in_perches_placeholder', 'Size in perches')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('status', 'Status')}
                  </label>
                  <select
                    value={surveyStatus}
                    onChange={(e) => setSurveyStatus(e.target.value as any)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                  >
                    <option value="completed">{t('completed', 'Completed')}</option>
                    <option value="pending">{t('pending', 'Pending')}</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('survey_coordinates', 'Survey Coordinates (GeoJSON Polygon/JSON - Optional)')}
                  </label>
                  <textarea
                    value={surveyCoordinates}
                    onChange={(e) => setSurveyCoordinates(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-xs"
                    rows={3}
                    placeholder={t('coordinates_placeholder', 'e.g. { "type": "Polygon", "coordinates": [...] }')}
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
                    placeholder={t('survey_remarks_placeholder', 'Any observations or survey remarks')}
                  />
                </div>

                {/* Mandatory Survey plan document upload */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('upload_survey_plan_mandatory', 'Upload Survey Plan (MANDATORY PDF) *')}
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                      <Upload className="text-muted-foreground h-4 w-4" />
                      <span>
                        {surveyUploading ? t('uploading', 'Uploading...') : t('choose_file', 'Choose File')}
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
                          )
                        }
                      />
                    </label>
                    {surveyDocId ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          {t('uploaded_plan', 'Uploaded Plan')}: <strong>{surveyDocName}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {t('survey_plan_upload_alert', 'A survey plan report must be uploaded before saving.')}
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
                  type="submit"
                  disabled={!surveyDocId || surveyUploading}
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:opacity-50"
                >
                  {surveyUploading
                    ? t('uploading_file', 'Uploading File...')
                    : surveyId
                      ? t('update_record', 'Update Record')
                      : t('save_survey_plan', 'Save Survey Plan')}
                </button>
              </div>
            </form>
          )}

          {/* List existing survey records */}
          {parcel.surveys && parcel.surveys.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {parcel.surveys.map((survey: any) => (
                <div
                  key={survey.id}
                  className="bg-card border-border shadow-xs rounded-lg border p-6"
                >
                  <div className="mb-4 flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="text-primary h-5 w-5" />
                      <span className="text-sm font-bold">
                        {t('ref_number_label', 'Ref Number')}: {survey.survey_ref_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={survey.status} />
                      {isDO && (
                        <>
                          <button
                            onClick={() => startEditSurvey(survey)}
                            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                            title={t('edit', 'Edit')}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSurvey(survey.id)}
                            className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            title={t('delete', 'Delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
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
                          ? new Date(survey.survey_date).toLocaleDateString()
                          : t('n_a', 'N/A')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        {t('surveyed_size', 'Surveyed Size')}
                      </dt>
                      <dd className="text-foreground font-mono font-medium">
                        {survey.surveyed_size_perches} {t('perches', 'Perches')}
                      </dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        {t('boundaries_geojson_label', 'Boundaries & GeoJSON Coordinates')}
                      </dt>
                      <dd className="bg-muted/40 max-h-24 overflow-y-auto rounded-md p-2 font-mono text-xs">
                        {survey.survey_coordinates
                          ? JSON.stringify(survey.survey_coordinates)
                          : t('no_coords_polygons_set', 'No coordinate polygons set')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        {t('survey_plan_drawing', 'Survey Plan Drawing')}
                      </dt>
                      <dd className="mt-1">
                        {survey.document ? (
                          <button
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
                              {t('download_plan', 'Download Plan')} ({survey.document.original_filename}
                              )
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-red-500">
                            {t('file_ref_missing', 'File Reference Missing')}
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
              <span>{t('no_survey_plan_logged', 'No survey plan logged.')}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Valuation Details */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-6">
            <div>
              <h3 className="text-base font-semibold">{t('valuation_assessments', 'Valuation Assessments')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('valuation_subtitle', 'Record assessed values of land, structures, and crops from official valuers.')}
              </p>
            </div>
            {isDO && !showValuationForm && (
              <button
                onClick={() => {
                  resetValuationForm();
                  setShowValuationForm(true);
                }}
                className="bg-primary hover:bg-primary/95 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>
                  {parcel.valuations && parcel.valuations.length > 0
                    ? t('update_valuation', 'Update Valuation')
                    : t('register_valuation', 'Register Valuation')}
                </span>
              </button>
            )}
          </div>

          {showValuationForm && (
            <form
              onSubmit={handleValuationSubmit}
              className="bg-card border-border space-y-6 rounded-lg border p-6"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-foreground text-base font-bold">
                  {valuationId
                    ? t('edit_valuation_record', 'Edit Valuation Record')
                    : t('register_valuation_assessment', 'Register Valuation Assessment')}
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
                    placeholder={t('government_valuer_placeholder', 'e.g. Government Valuer')}
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
                    {t('valuation_ref_number', 'Valuation Ref Number')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={valuationRefNumber}
                    onChange={(e) => setValuationRefNumber(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder={t('valuation_ref_placeholder', 'e.g. VAL/2026/LAMS/1029')}
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
                        e.target.value !== '' ? Number(e.target.value) : '',
                      )
                    }
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                    placeholder={t('land_assessed_value_placeholder', 'Land parcel assessed value')}
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
                        e.target.value !== '' ? Number(e.target.value) : '',
                      )
                    }
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                    placeholder={t('crops_assessed_value_placeholder', 'Crops & trees damage assessed value')}
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
                        e.target.value !== '' ? Number(e.target.value) : '',
                      )
                    }
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                    placeholder={t('structure_assessed_value_placeholder', 'Structure & houses assessed value')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('status', 'Status')}
                  </label>
                  <select
                    value={valuationStatus}
                    onChange={(e) => setValuationStatus(e.target.value as any)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                  >
                    <option value="approved">{t('approved', 'Approved')}</option>
                    <option value="pending">{t('pending', 'Pending')}</option>
                    <option value="rejected">{t('rejected', 'Rejected')}</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('total_valuation_autosum', 'Total Valuation (Auto Sum)')}
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
                    onChange={(e) => setValuationRemarks(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    rows={2}
                    placeholder={t('valuation_notes_placeholder', 'Any valuation notes or damages detail')}
                  />
                </div>

                {/* Mandatory Valuation report upload */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('upload_valuation_report_mandatory', 'Upload Valuation Report (MANDATORY PDF) *')}
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                      <Upload className="text-muted-foreground h-4 w-4" />
                      <span>
                        {valuationUploading ? t('uploading', 'Uploading...') : t('choose_file', 'Choose File')}
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
                          )
                        }
                      />
                    </label>
                    {valuationDocId ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          {t('uploaded_report', 'Uploaded Report')}: <strong>{valuationDocName}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {t('valuation_report_upload_alert', 'A valuation certificate report PDF must be uploaded before saving.')}
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
                  type="submit"
                  disabled={!valuationDocId || valuationUploading}
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:opacity-50"
                >
                  {valuationUploading
                    ? t('uploading_report', 'Uploading Report...')
                    : valuationId
                      ? t('update_valuation', 'Update Valuation')
                      : t('save_valuation_report', 'Save Valuation Report')}
                </button>
              </div>
            </form>
          )}

          {/* List existing valuations */}
          {parcel.valuations && parcel.valuations.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {parcel.valuations.map((val: any) => (
                <div
                  key={val.id}
                  className="bg-card border-border shadow-xs rounded-lg border p-6"
                >
                  <div className="mb-4 flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-bold">
                        {t('valuation_ref_label', 'Valuation Ref')}: {val.valuation_ref_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={val.status} />
                      {isDO && (
                        <>
                          <button
                            onClick={() => startEditValuation(val)}
                            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                            title={t('edit', 'Edit')}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteValuation(val.id)}
                            className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            title={t('delete', 'Delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
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
                          ? new Date(val.valuation_date).toLocaleDateString()
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
                            onClick={() =>
                              handleDownload(
                                String(val.document_id),
                                val.document.original_filename,
                              )
                            }
                            className="text-primary flex items-center gap-1.5 text-xs font-bold hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>{t('download_report', 'Download Report')}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-red-500">
                            {t('file_ref_missing', 'File Reference Missing')}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="row-span-2 flex flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                      <span className="text-muted-foreground text-xs font-bold uppercase">
                        {t('assessed_value_total', 'Assessed Value Total')}
                      </span>
                      <span className="font-mono text-lg font-bold text-emerald-600">
                        ₨ {Number(val.total_valuation).toLocaleString()}
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
                        {t('structure_building_value', 'Structure / Building Value')}
                      </dt>
                      <dd className="text-foreground font-mono font-medium">
                        ₨ {Number(val.structure_value).toLocaleString()}
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
              <span>{t('no_valuation_assessment_logged', 'No valuation assessment logged.')}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Compensation & Payments */}
      {activeTab === 'compensation' && (
        <div className="space-y-6">
          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-6">
            <div>
              <h3 className="text-base font-semibold">
                {t('compensation_schedules_payments', 'Compensation Schedules & Payments')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('compensation_subtitle', 'Record and track payment packages for each affected land owner.')}
              </p>
            </div>
            {isDO && !showCompensationForm && (
              <button
                onClick={() => {
                  resetCompensationForm();
                  setShowCompensationForm(true);
                }}
                className="bg-primary hover:bg-primary/95 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                disabled={!parcel.owners || parcel.owners.length === 0}
              >
                <Plus className="h-4 w-4" />
                <span>{t('calculate_compensation', 'Calculate Compensation')}</span>
              </button>
            )}
          </div>

          {/* Compensation Form */}
          {showCompensationForm && (
            <form
              onSubmit={handleCompensationSubmit}
              className="bg-card border-border space-y-6 rounded-lg border p-6"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-foreground text-base font-bold">
                  {compensationId ? t('edit_compensation', 'Edit Compensation') : t('setup_compensation', 'Set Up Compensation')}
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
                    <option value="">{t('choose_owner_option', '-- Choose Owner --')}</option>
                    {parcel.owners?.map((owner: any) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.nic})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('compensation_ref_id', 'Compensation Ref ID')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={compRef}
                    onChange={(e) => setCompRef(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder={t('compensation_ref_placeholder', 'e.g. COMP/2026/029')}
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
                        e.target.value !== '' ? Number(e.target.value) : '',
                      )
                    }
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                    placeholder={t('amount_in_lkr_placeholder', 'Amount in LKR')}
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
                    onChange={(e) => setCompApprovedDate(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('target_payment_date', 'Target Payment Date')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={compPaymentDate}
                    onChange={(e) => setCompPaymentDate(e.target.value)}
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
                    <option value="pending">{t('pending', 'Pending')}</option>
                    <option value="approved">{t('approved', 'Approved')}</option>
                    <option value="paid">{t('paid', 'Paid')}</option>
                  </select>
                </div>
              </div>

              {/* Compensation Documents Section */}
              <div className="border-t pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-foreground text-sm font-bold">
                      {t('compensation_documents', 'Compensation Documents')}
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      {t('comp_docs_subtitle', 'Upload and view letters, receipts, and compensation vouchers.')}
                    </p>
                  </div>
                  {isDO && (
                    <label className="bg-primary hover:bg-primary/95 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {compDocUploading ? t('uploading', 'Uploading...') : t('upload_document', 'Upload Document')}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        disabled={compDocUploading}
                        onChange={handleCompDocUpload}
                      />
                    </label>
                  )}
                </div>
                <DataTable
                  columns={[
                    { key: 'name', label: t('document_name_header', 'Document Name') },
                    { key: 'type', label: t('type', 'Type') },
                    { key: 'date', label: t('upload_date_header', 'Upload Date') },
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
                            onClick={() => handleDownload(row.id, row.name)}
                            className="hover:bg-muted text-primary rounded p-1 transition-colors"
                            title={t('download', 'Download')}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          {isDO && (
                            <button
                              type="button"
                              onClick={() => handleDelete(row.id)}
                              className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              title={t('delete', 'Delete')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
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
                  type="submit"
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95"
                >
                  {t('save_schedule', 'Save Schedule')}
                </button>
              </div>
            </form>
          )}

          {/* Payment form */}
          {showPaymentForm && (
            <form
              onSubmit={handlePaymentSubmit}
              className="bg-card border-border space-y-6 rounded-lg border p-6"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-foreground text-base font-bold">
                  {paymentId ? t('edit_payment', 'Edit Payment') : t('log_payment', 'Log Payment')}
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
                    {t('payment_reference_label', 'Payment Reference (Cheque / Tx ID)')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                    placeholder={t('cheque_tx_placeholder', 'Enter cheque no or tx hash')}
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
                        e.target.value !== '' ? Number(e.target.value) : '',
                      )
                    }
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                    placeholder={t('lkr_amount_placeholder', 'LKR amount')}
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
                    <option value="cheque">{t('cheque', 'Cheque')}</option>
                    <option value="bank_transfer">{t('bank_transfer', 'Bank Transfer')}</option>
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
                    placeholder={t('bank_name_placeholder', 'e.g. Bank of Ceylon')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('account_number_optional', 'Account Number (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={payAccount}
                    onChange={(e) => setPayAccount(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                    placeholder={t('account_number_placeholder', 'Account number or cheque branch')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('status', 'Status')}
                  </label>
                  <select
                    value={payStatus}
                    onChange={(e) => setPayStatus(e.target.value as any)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                  >
                    <option value="completed">{t('completed', 'Completed')}</option>
                    <option value="pending">{t('pending', 'Pending')}</option>
                    <option value="failed">{t('failed', 'Failed')}</option>
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
                    placeholder={t('payment_notes_placeholder', 'Payment notes')}
                  />
                </div>

                {/* Mandatory Payment receipt upload */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    {t('upload_receipt_mandatory', 'Upload Payment Receipt / Cheque copy (MANDATORY PDF) *')}
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                      <Upload className="text-muted-foreground h-4 w-4" />
                      <span>
                        {payUploading ? t('uploading', 'Uploading...') : t('choose_file', 'Choose File')}
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
                          )
                        }
                      />
                    </label>
                    {payDocId ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          {t('uploaded_receipt', 'Uploaded Receipt')}: <strong>{payDocName}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {t('payment_receipt_upload_alert', 'A payment receipt PDF must be uploaded before saving.')}
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
                  type="submit"
                  disabled={!payDocId || payUploading}
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:opacity-50"
                >
                  {payUploading
                    ? t('uploading_receipt', 'Uploading Receipt...')
                    : paymentId
                      ? t('update_payment', 'Update Payment')
                      : t('save_payment', 'Save Payment')}
                </button>
              </div>
            </form>
          )}

          {/* List existing compensations */}
          {parcel.compensations && parcel.compensations.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {parcel.compensations.map((comp: any) => {
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
                            {t('compensation_ref', 'Compensation')}: {comp.compensation_id}
                          </h4>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {t('owner', 'Owner')}: <strong>{comp.owner?.name || t('n_a', 'N/A')}</strong> (
                          {comp.owner?.nic || t('n_a', 'N/A')})
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={comp.status} />
                        {isDO && (
                          <>
                            <button
                              onClick={() => startEditCompensation(comp)}
                              className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                              title={t('edit', 'Edit')}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCompensation(comp.id)}
                              className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              title={t('delete', 'Delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-muted/20 border-border/50 grid grid-cols-1 gap-4 rounded-lg border p-4 text-sm md:grid-cols-3">
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold uppercase">
                          {t('total_approved_amount', 'Total Approved Amount')}
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
                            ? new Date(comp.approved_date).toLocaleDateString()
                            : t('n_a', 'N/A')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold uppercase">
                          {t('target_payment_date', 'Target Payment Date')}
                        </span>
                        <span className="text-foreground text-sm font-medium">
                          {comp.payment_date
                            ? new Date(comp.payment_date).toLocaleDateString()
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
                            <span>{t('payment_settlement_paid_full', 'Payment Settlement (Paid in Full)')}</span>
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
                                {t('payment_reference_label', 'Payment Reference')}
                              </dt>
                              <dd className="text-foreground font-mono font-medium">
                                {comp.payments[0].payment_reference}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                {t('payment_method', 'Payment Method')}
                              </dt>
                              <dd className="text-foreground font-medium uppercase">
                                {comp.payments[0].payment_method === 'cheque'
                                  ? t('cheque', 'Cheque')
                                  : comp.payments[0].payment_method === 'bank_transfer'
                                    ? t('bank_transfer', 'Bank Transfer')
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
                                        String(comp.payments[0].document_id),
                                        comp.payments[0].document
                                          .original_filename,
                                      )
                                    }
                                    className="text-primary flex items-center gap-1 font-semibold hover:underline"
                                  >
                                    <FileDown className="h-3.5 w-3.5" />
                                    <span>{t('download_receipt', 'Download Receipt')}</span>
                                  </button>
                                ) : (
                                  <span className="text-red-500">
                                    {t('no_file_reference', 'No file reference')}
                                  </span>
                                )}
                              </dd>
                            </div>
                            {isDO && (
                              <div className="flex items-end justify-end gap-2 lg:col-span-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditPayment(comp.payments[0])
                                  }
                                  className="hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 rounded border px-2 py-1 transition-colors"
                                  title={t('edit_payment_tooltip', 'Edit Payment')}
                                >
                                  <Pencil className="h-3 w-3" />
                                  <span>{t('edit_payment_details', 'Edit Payment Details')}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeletePayment(comp.payments[0].id)
                                  }
                                  className="flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                  title={t('delete_payment_tooltip', 'Delete Payment')}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>{t('delete_payment', 'Delete Payment')}</span>
                                </button>
                              </div>
                            )}
                          </dl>
                        </div>
                      ) : (
                        <div className="bg-muted/10 border-border rounded-md border border-dashed p-4 text-center">
                          <p className="text-muted-foreground mb-3 text-xs">
                            {t('no_payments_recorded', 'No payment has been recorded for this compensation schedule.')}
                          </p>
                          {isDO && (
                            <button
                              type="button"
                              onClick={() => startAddPayment(comp.id)}
                              className="bg-primary hover:bg-primary/95 mx-auto flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              <span>{t('record_payment', 'Record Payment')}</span>
                            </button>
                          )}
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
              <span>{t('no_compensation_setup_logged', 'No compensation setup logged.')}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Legal & Obligations */}
      {activeTab === 'legal' && parcel.is_casehold && (
        <div className="space-y-6">
          {/* Legal Case Information Summary */}
          <div className="bg-card border-border rounded-lg border p-6">
            <div className="mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-semibold">
                {t('legal_case_info', 'Legal Case Information')}
              </h3>
            </div>
            <div className="border-border rounded-lg border bg-amber-50/50 p-4 dark:bg-amber-950/20">
              <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    {t('case_number', 'Case Number')}
                  </dt>
                  <dd className="text-foreground font-mono font-medium">
                    {parcel.case_number || t('n_a', 'N/A')}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    {t('case_status', 'Case Status')}
                  </dt>
                  <dd className="text-foreground font-medium">
                    {parcel.case_status ? (
                      <StatusBadge status={parcel.case_status} />
                    ) : (
                      t('n_a', 'N/A')
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    {t('case_start_date', 'Case Start Date')}
                  </dt>
                  <dd className="text-foreground font-medium">
                    {parcel.case_start_date
                      ? new Date(parcel.case_start_date).toLocaleDateString()
                      : t('n_a', 'N/A')}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    {t('case_end_date', 'Case End Date')}
                  </dt>
                  <dd className="text-foreground font-medium">
                    {parcel.case_end_date
                      ? new Date(parcel.case_end_date).toLocaleDateString()
                      : t('active_ongoing', 'Active / Ongoing')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Legal Documents Section */}
          <div className="bg-card border-border rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">{t('legal_documents', 'Legal Documents')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('legal_docs_subtitle', 'Upload and view court orders, affidavits, clearance letters, and deeds.')}
                </p>
              </div>
              {isDO && !showLegalUploadForm && (
                <button
                  onClick={() => setShowLegalUploadForm(true)}
                  className="bg-primary hover:bg-primary/95 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('upload_legal_doc', 'Upload Legal Document')}</span>
                </button>
              )}
            </div>

            {/* Legal Document Upload Form */}
            {showLegalUploadForm && (
              <div className="border-border mb-6 space-y-4 rounded-lg border bg-amber-50/30 p-5 dark:bg-amber-950/10">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="text-foreground text-sm font-bold">
                    {t('upload_new_legal_doc', 'Upload New Legal Document')}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLegalUploadForm(false);
                      setLegalDocTitle('');
                      setLegalDocCategory('court_order');
                      setLegalDocRefNumber('');
                    }}
                    className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      {t('document_title', 'Document Title')}
                    </label>
                    <input
                      type="text"
                      value={legalDocTitle}
                      onChange={(e) => setLegalDocTitle(e.target.value)}
                      className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                      placeholder={t('doc_title_placeholder', 'e.g. Court Order - Case #2026/001')}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      {t('legal_category', 'Legal Category')}
                    </label>
                    <select
                      value={legalDocCategory}
                      onChange={(e) => setLegalDocCategory(e.target.value)}
                      className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    >
                      <option value="court_order">{t('court_order', 'Court Order')}</option>
                      <option value="affidavit">{t('affidavit', 'Affidavit')}</option>
                      <option value="injunction_notice">
                        {t('injunction_notice', 'Injunction Notice')}
                      </option>
                      <option value="clearance_letter">{t('clearance_letter', 'Clearance Letter')}</option>
                      <option value="legal_opinion">{t('legal_opinion', 'Legal Opinion')}</option>
                      <option value="deed">{t('deed_title_doc', 'Deed / Title Document')}</option>
                      <option value="power_of_attorney">
                        {t('power_of_attorney', 'Power of Attorney')}
                      </option>
                      <option value="other">{t('other_legal_doc', 'Other Legal Document')}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      {t('reference_number', 'Reference Number')}
                    </label>
                    <input
                      type="text"
                      value={legalDocRefNumber}
                      onChange={(e) => setLegalDocRefNumber(e.target.value)}
                      className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                      placeholder={t('ref_number_placeholder', 'e.g. REF/2026/LEGAL/001')}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="bg-primary hover:bg-primary/95 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>
                      {legalDocUploading
                        ? t('uploading', 'Uploading...')
                        : t('choose_file_upload', 'Choose File & Upload')}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      disabled={legalDocUploading}
                      onChange={handleLegalDocUpload}
                    />
                  </label>
                  <span className="text-muted-foreground text-xs">
                    {t('accepted_files_label', 'Accepted: PDF, DOC, DOCX, PNG, JPG')}
                  </span>
                </div>
              </div>
            )}

            {/* Legal Documents Table */}
            {legalDocuments.length > 0 ? (
              <DataTable
                columns={[
                  { key: 'name', label: t('document_name_header', 'Document Name') },
                  { key: 'type', label: t('type', 'Type') },
                  { key: 'date', label: t('upload_date_header', 'Upload Date') },
                  {
                    key: 'actions',
                    label: t('actions', 'Actions'),
                    render: (_val: any, row: any) => (
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDownload(row.id, row.name)}
                          className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
                          title={t('download', 'Download')}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {isDO && (
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            title={t('delete', 'Delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={legalDocuments}
                searchable={false}
                filterable={false}
              />
            ) : (
              <div className="text-muted-foreground flex h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
                <Scale className="text-muted-foreground/60 h-8 w-8" />
                <span>{t('no_legal_docs_uploaded', 'No legal documents uploaded yet.')}</span>
                {isDO && (
                  <p className="text-xs">
                    {t('upload_legal_doc_instruction', 'Click "Upload Legal Document" above to attach court orders, affidavits, or other legal files.')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google Maps Location Popup Dialog */}
      {isMapModalOpen && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border-border animate-in fade-in zoom-in w-full max-w-2xl overflow-hidden rounded-xl border shadow-xl duration-200">
            <div className="border-border bg-muted/20 flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5 text-[#2E7D32]" />
                {t('map_location', 'Map Location:')} {parcel.land_name || t('parcel_gps_location', 'Parcel GPS Location')}
              </h3>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="border-border relative h-96 w-full overflow-hidden rounded-lg border bg-[#cce4f2]">
                {parcel.latitude && parcel.longitude ? (
                  <iframe
                    title={`Google Map for ${parcel.parcel_id}`}
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY || ''}&q=${Number(parcel.latitude)},${Number(parcel.longitude)}&zoom=16`}
                    className="absolute inset-0 h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                ) : (
                  <div className="bg-linear-to-br absolute inset-0 flex items-center justify-center from-[#4a9f8f]/90 to-[#2d6b5f]/95 p-6 text-center text-white">
                    <div className="max-w-sm">
                      <MapPin className="mx-auto mb-3 h-12 w-12 animate-bounce text-white/90" />
                      <p className="mb-1 text-lg font-bold">
                        {t('no_gps_coordinates_set', 'No GPS Coordinates Set')}
                      </p>
                      <p className="text-xs text-white/80">
                        {t('no_gps_details_desc', 'This land parcel does not have latitude and longitude details.')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  {t('coordinates_colon', 'Coordinates:')}{' '}
                  {parcel.latitude && parcel.longitude
                    ? `${Number(parcel.latitude).toFixed(6)}, ${Number(parcel.longitude).toFixed(6)}`
                    : t('none', 'None')}
                </span>
                {parcel.latitude && parcel.longitude && (
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${parcel.latitude},${parcel.longitude}`,
                        '_blank',
                      )
                    }
                    className="flex items-center gap-1 font-bold text-[#2E7D32] hover:underline"
                  >
                    {t('open_in_google_maps', 'Open in Google Maps')}
                  </button>
                )}
              </div>
              <div className="border-border flex justify-end border-t pt-4">
                <button
                  onClick={() => setIsMapModalOpen(false)}
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95"
                >
                  {t('close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

LandParcelDetails.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
