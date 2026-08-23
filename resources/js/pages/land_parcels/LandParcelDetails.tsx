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
  const { locale } = useTranslation();
  const [parcel, setParcel] = useState<LandParcel | null>(null);
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
      toastError(err.response?.data?.message || 'Failed to submit survey plan.');
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
      toastError('Mandatory Checklist: Please upload the valuation report PDF.');

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
      toastError(err.response?.data?.message || 'Failed to submit compensation.');
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
        Loading parcel details...
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="text-muted-foreground flex h-96 flex-col items-center justify-center gap-4">
        <p>Land parcel not found.</p>
        <Link href="/land-parcels" className="text-primary hover:underline">
          Back to Land Parcels
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General Information' },
    { id: 'survey', label: 'Survey Info' },
    { id: 'valuation', label: 'Valuation Details' },
    { id: 'compensation', label: 'Compensation & Payments' },
    ...(parcel.is_casehold
      ? [{ id: 'legal', label: 'Legal & Obligations' }]
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
      toastSuccess('Legal document uploaded successfully!');
      setShowLegalUploadForm(false);
      setLegalDocTitle('');
      setLegalDocCategory('court_order');
      setLegalDocRefNumber('');
      await fetchParcelDetails();
    } catch (err) {
      console.error(err);
      toastError('Failed to upload legal document. Please try again.');
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
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1>Land Number: {parcel.parcel_id}</h1>
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
              <span>Edit Parcel</span>
            </button>
          )}
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>View on Map</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors"
            title="Export Land Acquisition Application Form (PDF)"
          >
            <Download className="h-4 w-4" />
            <span>Export Form (PDF)</span>
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
            <h3 className="mb-4">Parcel Information</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Land Name:</dt>
                <dd className="font-medium">{parcel.land_name || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Province / District:</dt>
                <dd>
                  {parcel.province || 'Southern'} / {parcel.district}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Divisional Secretariat:
                </dt>
                <dd>
                  {parcel.divisional_secretariat || parcel.division || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Grama Niladhari Division:
                </dt>
                <dd>{parcel.grama_niladari_division || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Village / Town:</dt>
                <dd>{parcel.village}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Extent Breakdown:</dt>
                <dd className="font-mono">
                  {parcel.land_size_acers ?? parcel.extent_acers ?? 0} A,{' '}
                  {parcel.land_size_roods ?? 0} R,{' '}
                  {parcel.land_size_perches ?? parcel.extent_perches ?? 0} P
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Land Size:</dt>
                <dd className="font-medium">
                  {parcel.full_land_size ?? 0} Perches
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Plan Status:</dt>
                <dd>{parcel.has_plan ? 'Has Plan' : 'No Plan'}</dd>
              </div>
              {parcel.has_plan ? (
                <>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Plan Number:</dt>
                    <dd>{parcel.plan_number || 'N/A'}</dd>
                  </div>
                  {parcel.parcel_numbers &&
                    parcel.parcel_numbers.length > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          Parcel Numbers:
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
                      Plan Boundaries
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">North Boundary:</dt>
                    <dd className="text-right">
                      {parcel.boundaries_north || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">South Boundary:</dt>
                    <dd className="text-right">
                      {parcel.boundaries_south || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">East Boundary:</dt>
                    <dd className="text-right">
                      {parcel.boundaries_east || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">West Boundary:</dt>
                    <dd className="text-right">
                      {parcel.boundaries_west || 'N/A'}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cultivation & Status:</dt>
                <dd>
                  {parcel.cultivation || 'N/A'} (
                  {parcel.cultivation_status || 'fertile'})
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Annual Income:</dt>
                <dd>₨ {Number(parcel.annual_income || 0).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Land Type:</dt>
                <dd>{parcel.land_type || 'Standard'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estimated Value:</dt>
                <dd className="font-medium">
                  ₨ {Number(parcel.estimated_value || 0).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Residential / Owner Living:
                </dt>
                <dd>
                  {parcel.has_residential_houses ? 'Yes' : 'No'} /{' '}
                  {parcel.is_resident_owner ? 'Yes' : 'No'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Donated Status:</dt>
                <dd
                  className={
                    parcel.is_donated
                      ? 'font-medium text-green-600 dark:text-green-400'
                      : ''
                  }
                >
                  {parcel.is_donated ? 'Yes (Donated)' : 'No'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Litigation / Casehold:
                </dt>
                <dd
                  className={
                    parcel.is_casehold
                      ? 'font-medium text-amber-600 dark:text-amber-400'
                      : ''
                  }
                >
                  {parcel.is_casehold ? 'Yes (Under Litigation)' : 'No'}
                </dd>
              </div>
              {parcel.is_casehold && (
                <>
                  <div className="flex justify-between border-l border-amber-200 pl-4">
                    <dt className="text-muted-foreground text-xs">
                      Case Number:
                    </dt>
                    <dd className="font-mono text-xs">
                      {parcel.case_number || 'N/A'}
                    </dd>
                  </div>
                  <div className="flex justify-between border-l border-amber-200 pl-4">
                    <dt className="text-muted-foreground text-xs">
                      Case Status:
                    </dt>
                    <dd className="text-xs">{parcel.case_status || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between border-l border-amber-200 pl-4">
                    <dt className="text-muted-foreground text-xs">
                      Case Period:
                    </dt>
                    <dd className="text-xs">
                      {parcel.case_start_date
                        ? new Date(parcel.case_start_date).toLocaleDateString()
                        : 'N/A'}{' '}
                      -{' '}
                      {parcel.case_end_date
                        ? new Date(parcel.case_end_date).toLocaleDateString()
                        : 'Active'}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Associated Project:</dt>
                <dd>
                  {parcel.project ? (
                    <Link
                      href={`/projects/${parcel.project.id}`}
                      className="text-primary font-medium hover:underline"
                    >
                      {parcel.project.title || parcel.project.name}
                    </Link>
                  ) : (
                    'None'
                  )}
                </dd>
              </div>
              <div className="border-border my-2 flex items-center justify-between border-t pt-2" />
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GPS Location:</dt>
                <dd className="font-mono text-xs">
                  {parcel.latitude && parcel.longitude
                    ? `${Number(parcel.latitude).toFixed(6)}, ${Number(parcel.longitude).toFixed(6)}`
                    : 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Remarks:</dt>
                <dd className="text-right">{parcel.remarks || 'No remarks'}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4">Ownership</h3>
              <DataTable
                columns={[
                  { key: 'name', label: 'Owner Name' },
                  { key: 'nic', label: 'NIC' },
                  { key: 'share', label: 'Share' },
                  { key: 'type', label: 'Type' },
                ]}
                data={owners}
                searchable={false}
                filterable={false}
                exportable={false}
              />
            </div>

            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4">Documents</h3>
              <DataTable
                columns={[
                  { key: 'name', label: 'Document Name' },
                  { key: 'type', label: 'Type' },
                  { key: 'date', label: 'Date' },
                  {
                    key: 'actions',
                    label: 'Actions',
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
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {isAvailable && isDO && (
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Delete"
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
            <h3 className="mb-4">History</h3>
            <DataTable
              columns={[
                { key: 'date', label: 'Date' },
                { key: 'event', label: 'Event' },
                { key: 'user', label: 'User' },
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
                Survey Plans & Ref Coordinates
              </h3>
              <p className="text-muted-foreground text-sm">
                Log external survey plans, surveyor credentials, boundary size,
                and coordinates.
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
                    ? 'Update Survey plan'
                    : 'Log Survey plan'}
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
                  {surveyId ? 'Edit Survey Record' : 'Register Survey Plan'}
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
                    Surveyor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={surveyorName}
                    onChange={(e) => setSurveyorName(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder="Enter surveyor full name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Survey Date *
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
                    Survey Ref Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={surveyRefNumber}
                    onChange={(e) => setSurveyRefNumber(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder="e.g. SRV/2026/G/8732"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Surveyed Size (Perches) *
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
                    placeholder="Size in perches"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={surveyStatus}
                    onChange={(e) => setSurveyStatus(e.target.value as any)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Survey Coordinates (GeoJSON Polygon/JSON - Optional)
                  </label>
                  <textarea
                    value={surveyCoordinates}
                    onChange={(e) => setSurveyCoordinates(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-xs"
                    rows={3}
                    placeholder='e.g. { "type": "Polygon", "coordinates": [...] }'
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Remarks
                  </label>
                  <textarea
                    value={surveyRemarks}
                    onChange={(e) => setSurveyRemarks(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    rows={2}
                    placeholder="Any observations or survey remarks"
                  />
                </div>

                {/* Mandatory Survey plan document upload */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Upload Survey Plan (MANDATORY PDF) *
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                      <Upload className="text-muted-foreground h-4 w-4" />
                      <span>
                        {surveyUploading ? 'Uploading...' : 'Choose File'}
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
                          Uploaded Plan: <strong>{surveyDocName}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          A survey plan report must be uploaded before saving.
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!surveyDocId || surveyUploading}
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:opacity-50"
                >
                  {surveyUploading
                    ? 'Uploading File...'
                    : surveyId
                      ? 'Update Record'
                      : 'Save Survey Plan'}
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
                        Ref Number: {survey.survey_ref_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={survey.status} />
                      {isDO && (
                        <>
                          <button
                            onClick={() => startEditSurvey(survey)}
                            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSurvey(survey.id)}
                            className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
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
                        Surveyor Name
                      </dt>
                      <dd className="text-foreground font-medium">
                        {survey.surveyor_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        Survey Date
                      </dt>
                      <dd className="text-foreground font-medium">
                        {survey.survey_date
                          ? new Date(survey.survey_date).toLocaleDateString()
                          : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        Surveyed Size
                      </dt>
                      <dd className="text-foreground font-mono font-medium">
                        {survey.surveyed_size_perches} Perches
                      </dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        Boundaries & GeoJSON Coordinates
                      </dt>
                      <dd className="bg-muted/40 max-h-24 overflow-y-auto rounded-md p-2 font-mono text-xs">
                        {survey.survey_coordinates
                          ? JSON.stringify(survey.survey_coordinates)
                          : 'No coordinate polygons set'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        Survey Plan Drawing
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
                              Download Plan ({survey.document.original_filename}
                              )
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs text-red-500">
                            File Reference Missing
                          </span>
                        )}
                      </dd>
                    </div>
                    {survey.remarks && (
                      <div className="md:col-span-3">
                        <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                          Remarks
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
              <span>No survey plan logged.</span>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Valuation Details */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-6">
            <div>
              <h3 className="text-base font-semibold">Valuation Assessments</h3>
              <p className="text-muted-foreground text-sm">
                Log external land values, crops and structure assessments, and
                upload reports.
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
                    ? 'Update Valuation'
                    : 'Log Valuation'}
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
                    ? 'Edit Valuation Record'
                    : 'Register Valuation Assessment'}
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
                    Valuer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={valuerName}
                    onChange={(e) => setValuerName(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder="e.g. Government Valuer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Valuation Date *
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
                    Valuation Ref Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={valuationRefNumber}
                    onChange={(e) => setValuationRefNumber(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder="e.g. VAL/2026/LAMS/1029"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Land Value (₨) *
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
                    placeholder="Land parcel assessed value"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Crop Value (₨) *
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
                    placeholder="Crops & trees damage assessed value"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Structure Value (₨) *
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
                    placeholder="Structure & houses assessed value"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={valuationStatus}
                    onChange={(e) => setValuationStatus(e.target.value as any)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Total Valuation (Auto Sum)
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
                    Remarks
                  </label>
                  <textarea
                    value={valuationRemarks}
                    onChange={(e) => setValuationRemarks(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    rows={2}
                    placeholder="Any valuation notes or damages detail"
                  />
                </div>

                {/* Mandatory Valuation report upload */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Upload Valuation Report (MANDATORY PDF) *
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                      <Upload className="text-muted-foreground h-4 w-4" />
                      <span>
                        {valuationUploading ? 'Uploading...' : 'Choose File'}
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
                          Uploaded Report: <strong>{valuationDocName}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          A valuation certificate report PDF must be uploaded
                          before saving.
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!valuationDocId || valuationUploading}
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:opacity-50"
                >
                  {valuationUploading
                    ? 'Uploading Report...'
                    : valuationId
                      ? 'Update Valuation'
                      : 'Save Valuation Report'}
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
                        Valuation Ref: {val.valuation_ref_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={val.status} />
                      {isDO && (
                        <>
                          <button
                            onClick={() => startEditValuation(val)}
                            className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteValuation(val.id)}
                            className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
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
                        Valuer Name
                      </dt>
                      <dd className="text-foreground font-medium">
                        {val.valuer_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        Valuation Date
                      </dt>
                      <dd className="text-foreground font-medium">
                        {val.valuation_date
                          ? new Date(val.valuation_date).toLocaleDateString()
                          : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                        Certificate PDF
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
                            <span>Download Report</span>
                          </button>
                        ) : (
                          <span className="text-xs text-red-500">
                            File Reference Missing
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="row-span-2 flex flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                      <span className="text-muted-foreground text-xs font-bold uppercase">
                        Assessed Value Total
                      </span>
                      <span className="font-mono text-lg font-bold text-emerald-600">
                        ₨ {Number(val.total_valuation).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold">
                        Land Value
                      </dt>
                      <dd className="text-foreground font-mono font-medium">
                        ₨ {Number(val.land_value).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold">
                        Crop Damage Value
                      </dt>
                      <dd className="text-foreground font-mono font-medium">
                        ₨ {Number(val.crop_value).toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-semibold">
                        Structure / Building Value
                      </dt>
                      <dd className="text-foreground font-mono font-medium">
                        ₨ {Number(val.structure_value).toLocaleString()}
                      </dd>
                    </div>

                    {val.remarks && (
                      <div className="md:col-span-4">
                        <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                          Remarks
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
              <span>No valuation assessment logged.</span>
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
                Compensation Schedules & Payments
              </h3>
              <p className="text-muted-foreground text-sm">
                Manage compensation packages for registered land owners and log
                installments receipts.
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
                <span>Calculate Compensation</span>
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
                  {compensationId ? 'Edit Compensation' : 'Set Up Compensation'}
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
                    Select Owner *
                  </label>
                  <select
                    required
                    value={compOwnerId}
                    onChange={(e) => setCompOwnerId(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    disabled={!!compensationId}
                  >
                    <option value="">-- Choose Owner --</option>
                    {parcel.owners?.map((owner: any) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.nic})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Compensation Ref ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={compRef}
                    onChange={(e) => setCompRef(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder="e.g. COMP/2026/029"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Approved Amount (₨) *
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
                    placeholder="Amount in LKR"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Approval Date *
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
                    Target Payment Date *
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
                    Status
                  </label>
                  <select
                    value={compStatus}
                    onChange={(e) => setCompStatus(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Compensation Documents Section */}
              <div className="border-t pt-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-foreground text-sm font-bold">
                      Compensation Documents
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      Upload and manage letters, receipts, valuation worksheets
                      and compensation-related files.
                    </p>
                  </div>
                  {isDO && (
                    <label className="bg-primary hover:bg-primary/95 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {compDocUploading ? 'Uploading...' : 'Upload Document'}
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
                    { key: 'name', label: 'Document Name' },
                    { key: 'type', label: 'Type' },
                    { key: 'date', label: 'Upload Date' },
                    {
                      key: 'actions',
                      label: 'Actions',
                      render: (_val: any, row: any) => (
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleDownload(row.id, row.name)}
                            className="hover:bg-muted text-primary rounded p-1 transition-colors"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          {isDO && (
                            <button
                              type="button"
                              onClick={() => handleDelete(row.id)}
                              className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Delete"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95"
                >
                  Save Schedule
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
                  {paymentId ? 'Edit Payment' : 'Log Payment'}
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
                    Payment Reference (Cheque / Tx ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                    placeholder="Enter cheque no or tx hash"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Amount Paid (₨) *
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
                    placeholder="LKR amount"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Payment Date *
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
                    Payment Method *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                  >
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Bank Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={payBank}
                    onChange={(e) => setPayBank(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    placeholder="e.g. Bank of Ceylon"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Account Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={payAccount}
                    onChange={(e) => setPayAccount(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 font-mono text-sm"
                    placeholder="Account number or cheque branch"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={payStatus}
                    onChange={(e) => setPayStatus(e.target.value as any)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Remarks
                  </label>
                  <textarea
                    value={payRemarks}
                    onChange={(e) => setPayRemarks(e.target.value)}
                    className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    rows={2}
                    placeholder="Payment notes"
                  />
                </div>

                {/* Mandatory Payment receipt upload */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Upload Payment Receipt / Cheque copy (MANDATORY PDF) *
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="bg-muted hover:bg-muted/80 text-foreground border-border flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors">
                      <Upload className="text-muted-foreground h-4 w-4" />
                      <span>
                        {payUploading ? 'Uploading...' : 'Choose File'}
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
                          Uploaded Receipt: <strong>{payDocName}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          A payment receipt PDF must be uploaded before saving.
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!payDocId || payUploading}
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:opacity-50"
                >
                  {payUploading
                    ? 'Uploading Receipt...'
                    : paymentId
                      ? 'Update Payment'
                      : 'Save Payment'}
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
                            Compensation: {comp.compensation_id}
                          </h4>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Owner: <strong>{comp.owner?.name || 'N/A'}</strong> (
                          {comp.owner?.nic || 'N/A'})
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={comp.status} />
                        {isDO && (
                          <>
                            <button
                              onClick={() => startEditCompensation(comp)}
                              className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCompensation(comp.id)}
                              className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Delete"
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
                          Total Approved Amount
                        </span>
                        <span className="text-foreground font-mono text-base font-bold">
                          ₨ {Number(comp.amount).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold uppercase">
                          Approved Date
                        </span>
                        <span className="text-foreground text-sm font-medium">
                          {comp.approved_date
                            ? new Date(comp.approved_date).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold uppercase">
                          Target Payment Date
                        </span>
                        <span className="text-foreground text-sm font-medium">
                          {comp.payment_date
                            ? new Date(comp.payment_date).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Payment Settlement (Paid in Full) */}
                    <div className="space-y-3">
                      {comp.payments && comp.payments.length > 0 ? (
                        <div className="bg-muted/30 border-border rounded-lg border p-4">
                          <h5 className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-bold">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Payment Settlement (Paid in Full)</span>
                          </h5>
                          <dl className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                Payment Date
                              </dt>
                              <dd className="text-foreground font-medium">
                                {comp.payments[0].payment_date
                                  ? new Date(
                                      comp.payments[0].payment_date,
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                Payment Reference
                              </dt>
                              <dd className="text-foreground font-mono font-medium">
                                {comp.payments[0].payment_reference}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                Payment Method
                              </dt>
                              <dd className="text-foreground font-medium uppercase">
                                {comp.payments[0].payment_method}
                                {comp.payments[0].bank_name
                                  ? ` (${comp.payments[0].bank_name})`
                                  : ''}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground font-semibold uppercase tracking-wider">
                                Amount Paid
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
                                Receipt File
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
                                    <span>Download Receipt</span>
                                  </button>
                                ) : (
                                  <span className="text-red-500">
                                    No file reference
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
                                  title="Edit Payment"
                                >
                                  <Pencil className="h-3 w-3" />
                                  <span>Edit Payment Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeletePayment(comp.payments[0].id)
                                  }
                                  className="flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                                  title="Delete Payment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Delete Payment</span>
                                </button>
                              </div>
                            )}
                          </dl>
                        </div>
                      ) : (
                        <div className="bg-muted/10 border-border rounded-md border border-dashed p-4 text-center">
                          <p className="text-muted-foreground mb-3 text-xs">
                            No payment has been recorded for this compensation
                            schedule.
                          </p>
                          {isDO && (
                            <button
                              type="button"
                              onClick={() => startAddPayment(comp.id)}
                              className="bg-primary hover:bg-primary/95 mx-auto flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Record Payment</span>
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
              <span>No compensation setup logged.</span>
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
                Legal Case Information
              </h3>
            </div>
            <div className="border-border rounded-lg border bg-amber-50/50 p-4 dark:bg-amber-950/20">
              <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Case Number
                  </dt>
                  <dd className="text-foreground font-mono font-medium">
                    {parcel.case_number || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Case Status
                  </dt>
                  <dd className="text-foreground font-medium">
                    {parcel.case_status ? (
                      <StatusBadge status={parcel.case_status} />
                    ) : (
                      'N/A'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Case Start Date
                  </dt>
                  <dd className="text-foreground font-medium">
                    {parcel.case_start_date
                      ? new Date(parcel.case_start_date).toLocaleDateString()
                      : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Case End Date
                  </dt>
                  <dd className="text-foreground font-medium">
                    {parcel.case_end_date
                      ? new Date(parcel.case_end_date).toLocaleDateString()
                      : 'Active / Ongoing'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Legal Documents Section */}
          <div className="bg-card border-border rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Legal Documents</h3>
                <p className="text-muted-foreground text-sm">
                  Upload and manage court orders, affidavits, injunction
                  notices, clearance letters, and other legal files.
                </p>
              </div>
              {isDO && !showLegalUploadForm && (
                <button
                  onClick={() => setShowLegalUploadForm(true)}
                  className="bg-primary hover:bg-primary/95 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Upload Legal Document</span>
                </button>
              )}
            </div>

            {/* Legal Document Upload Form */}
            {showLegalUploadForm && (
              <div className="border-border mb-6 space-y-4 rounded-lg border bg-amber-50/30 p-5 dark:bg-amber-950/10">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="text-foreground text-sm font-bold">
                    Upload New Legal Document
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
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={legalDocTitle}
                      onChange={(e) => setLegalDocTitle(e.target.value)}
                      className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                      placeholder="e.g. Court Order - Case #2026/001"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      Legal Category
                    </label>
                    <select
                      value={legalDocCategory}
                      onChange={(e) => setLegalDocCategory(e.target.value)}
                      className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                    >
                      <option value="court_order">Court Order</option>
                      <option value="affidavit">Affidavit</option>
                      <option value="injunction_notice">
                        Injunction Notice
                      </option>
                      <option value="clearance_letter">Clearance Letter</option>
                      <option value="legal_opinion">Legal Opinion</option>
                      <option value="deed">Deed / Title Document</option>
                      <option value="power_of_attorney">
                        Power of Attorney
                      </option>
                      <option value="other">Other Legal Document</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={legalDocRefNumber}
                      onChange={(e) => setLegalDocRefNumber(e.target.value)}
                      className="border-border bg-background w-full rounded-lg border p-2.5 text-sm"
                      placeholder="e.g. REF/2026/LEGAL/001"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="bg-primary hover:bg-primary/95 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>
                      {legalDocUploading
                        ? 'Uploading...'
                        : 'Choose File & Upload'}
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
                    Accepted: PDF, DOC, DOCX, PNG, JPG
                  </span>
                </div>
              </div>
            )}

            {/* Legal Documents Table */}
            {legalDocuments.length > 0 ? (
              <DataTable
                columns={[
                  { key: 'name', label: 'Document Name' },
                  { key: 'type', label: 'Type' },
                  { key: 'date', label: 'Upload Date' },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (_val: any, row: any) => (
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDownload(row.id, row.name)}
                          className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {isDO && (
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
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
                <span>No legal documents uploaded yet.</span>
                {isDO && (
                  <p className="text-xs">
                    Click &quot;Upload Legal Document&quot; above to attach
                    court orders, affidavits, or other legal files.
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
                Map Location: {parcel.land_name || 'Parcel GPS Location'}
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
                        No GPS Coordinates Set
                      </p>
                      <p className="text-xs text-white/80">
                        This land parcel does not have latitude and longitude
                        details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  Coordinates:{' '}
                  {parcel.latitude && parcel.longitude
                    ? `${Number(parcel.latitude).toFixed(6)}, ${Number(parcel.longitude).toFixed(6)}`
                    : 'None'}
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
                    Open in Google Maps
                  </button>
                )}
              </div>
              <div className="border-border flex justify-end border-t pt-4">
                <button
                  onClick={() => setIsMapModalOpen(false)}
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95"
                >
                  Close
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
