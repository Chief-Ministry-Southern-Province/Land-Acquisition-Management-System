import {
  CheckCircle,
  XCircle,
  Eye,
  Download,
  X,
  AlertCircle,
  FolderKanban,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { downloadDocument } from '@/services/documentManagementService';
import {
  getPendingApprovals,
  approveCase,
  rejectCase,
} from '@/services/sasApprovalService';

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

interface ActionTarget {
  type: 'project';
  id: string;
  displayId: string;
  title: string;
  data: any;
}

export default function SASApprovals() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');
  const [activeModal, setActiveModal] = useState<
    'approve' | 'reject' | 'details' | null
  >(null);
  const [actionTarget, setActionTarget] = useState<ActionTarget | null>(null);
  const [comment, setComment] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPendingApprovals();
      setProjects(res.projects || []);
    } catch (err) {
      console.error('Failed to fetch SAS approvals:', err);
      showToast(
        'error',
        t(
          'toast_failed_load_clearance',
          'Failed to load project financial clearance cases.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchApprovals();
    });
  }, [fetchApprovals]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!actionTarget) {
      return;
    }

    if (action === 'reject' && !comment.trim()) {
      showToast(
        'error',
        t(
          'toast_rejection_remark_required',
          'Rejection remark comment is required.',
        ),
      );

      return;
    }

    try {
      setLoading(true);

      if (action === 'approve') {
        await approveCase(actionTarget.type, actionTarget.id);
        showToast(
          'success',
          t(
            'toast_approved_case_success',
            'Successfully approved case :id.',
          ).replace(':id', actionTarget.displayId),
        );
      } else {
        await rejectCase(actionTarget.type, actionTarget.id, comment);
        showToast(
          'success',
          t(
            'toast_case_rejected_returned',
            'Case :id rejected and returned to DO.',
          ).replace(':id', actionTarget.displayId),
        );
      }

      closeModal();
      await fetchApprovals();
    } catch (err: any) {
      console.error(`Failed to ${action} case:`, err);
      const msg =
        err.response?.data?.message ||
        t(
          'toast_failed_action_case',
          'Failed to perform action on case :id',
        ).replace(':id', actionTarget.displayId);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (
    action: 'approve' | 'reject',
    target: ActionTarget,
  ) => {
    setActionTarget(target);
    setComment('');
    setActiveModal(action);
  };

  const openDetailsModal = (target: ActionTarget) => {
    setActionTarget(target);
    setActiveModal('details');
  };

  const closeModal = () => {
    setActiveModal(null);
    setActionTarget(null);
    setComment('');
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      await downloadDocument(docId, filename);
      showToast(
        'success',
        t(
          'toast_downloading_document',
          'Downloading document: :filename',
        ).replace(':filename', filename),
      );
    } catch (err) {
      console.error('Failed to download document:', err);
      showToast(
        'error',
        t('toast_failed_download_document', 'Failed to download document.'),
      );
    }
  };

  const formatLKR = (amount: number | string) => {
    const num = Number(amount);

    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    })
      .format(num)
      .replace('LKR', '₨');
  };

  // Filter projects by status
  const pendingProjects = projects.filter((p) => p.sas_status === 'pending');
  const approvedProjects = projects.filter((p) => p.sas_status === 'approved');
  const rejectedProjects = projects.filter((p) => p.sas_status === 'rejected');

  const getFilteredData = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingProjects;
      case 'approved':
        return approvedProjects;
      case 'rejected':
        return rejectedProjects;
      default:
        return projects;
    }
  };

  const stats = [
    {
      title: t('kpi_total_cases_received', 'Total Cases Received'),
      value: projects.length,
      icon: FolderKanban,
      color: 'primary' as const,
    },
    {
      title: t('kpi_pending_sas_action', 'Pending SAS Action'),
      value: pendingProjects.length,
      icon: Clock,
      color: 'warning' as const,
    },
    {
      title: t('kpi_approved_cases', 'Approved Cases'),
      value: approvedProjects.length,
      icon: ThumbsUp,
      color: 'success' as const,
    },
    {
      title: t('kpi_rejected_cases', 'Rejected Cases'),
      value: rejectedProjects.length,
      icon: ThumbsDown,
      color: 'secondary' as const,
    },
  ];

  const columns = [
    {
      key: 'project_id',
      label: t('col_project_id', 'Project ID'),
      sortable: true,
    },
    {
      key: 'title',
      label: t('col_project_title', 'Project Title'),
      sortable: true,
      render: (_val: any, row: any) => row.title || row.name || t('n_a', 'N/A'),
    },
    {
      key: 'institution',
      label: t('col_institution', 'Institution'),
      sortable: true,
    },
    { key: 'purpose', label: t('col_purpose', 'Purpose'), sortable: true },
    {
      key: 'landArea',
      label: t('col_land_area_arp', 'Land Area (A-R-P)'),
      render: (_val: any, row: any) =>
        `${row.land_area_to_be_acquired_acers ?? 0} ${t('acres', 'A')}, ${row.land_area_to_be_acquired_roods ?? 0} ${t('roods', 'R')}, ${row.land_area_to_be_acquired_perches ?? 0} ${t('perches', 'P')}`,
    },
    {
      key: 'sas_status',
      label: 'Approval Status',
      sortable: true,
      render: (value: string) => {
        const statusMap: Record<string, string> = {
          pending: 'pending',
          approved: 'approved',
          rejected: 'rejected',
        };

        return <StatusBadge status={statusMap[value] || 'pending'} />;
      },
    },
  ];

  const actions = (row: any) => {
    const target: ActionTarget = {
      type: 'project',
      id: String(row.id),
      displayId: row.project_id || `PRJ-${row.id}`,
      title: row.title || row.name || 'Untitled Project',
      data: row,
    };

    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => openDetailsModal(target)}
          className="hover:bg-muted rounded p-1.5 transition-colors"
          title={t('tooltip_review_details', 'Review details')}
        >
          <Eye className="h-4.5 w-4.5 text-muted-foreground" />
        </button>
        {row.sas_status === 'pending' && (
          <>
            <button
              onClick={() => openActionModal('approve', target)}
              className="rounded p-1.5 text-[#2E7D32] transition-colors hover:bg-[#2E7D32]/10"
              title={t('tooltip_approve_case', 'Approve case')}
            >
              <CheckCircle className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => openActionModal('reject', target)}
              className="hover:bg-destructive/10 text-destructive rounded p-1.5 transition-colors"
              title={t('tooltip_reject_return_do', 'Reject & return to DO')}
            >
              <XCircle className="h-4.5 w-4.5" />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative space-y-6">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 ${
            toast.type === 'success'
              ? 'border-[#2E7D32]/30 bg-[#2E7D32]/10 text-[#2E7D32]'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1>
          {t('sas_clearance_title', 'Senior Assistant Secretary Clearance')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t(
            'sas_clearance_subtitle',
            'Review or approve land acquisition projects submitted for Senior Assistant Secretary final financial clearance.',
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Tabs */}
      <div className="border-border border-b">
        <div className="flex gap-1">
          {[
            {
              id: 'all',
              label: t('tab_all_cases', 'All Cases (:count)').replace(
                ':count',
                String(projects.length),
              ),
            },
            {
              id: 'pending',
              label: t(
                'tab_pending_action',
                'Pending SAS Action (:count)',
              ).replace(':count', String(pendingProjects.length)),
            },
            {
              id: 'approved',
              label: t('tab_approved_cases', 'Approved (:count)').replace(
                ':count',
                String(approvedProjects.length),
              ),
            },
            {
              id: 'rejected',
              label: t(
                'tab_rejected_cases',
                'Rejected (Returned) (:count)',
              ).replace(':count', String(rejectedProjects.length)),
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={getFilteredData()}
          actions={actions}
          pageSize={10}
        />
      )}

      {/* Approve Modal */}
      {activeModal === 'approve' && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="bg-card border-border relative max-h-[90vh] w-full max-w-md space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#2E7D32]">
              <CheckCircle className="h-7 w-7" />
              <h3>
                {t('confirm_financial_approval', 'Confirm Financial Approval')}
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t(
                'confirm_approval_desc',
                'Are you sure you want to approve the project :id (:title)? This will grant financial clearance. If the total valuation exceeds 20M LKR, it will be escalated to the Secretary for final approval.',
              )
                .replace(':id', actionTarget.displayId)
                .replace(':title', actionTarget.title)}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={closeModal}
                className="border-border bg-muted hover:bg-muted/80 rounded-lg border px-4 py-2 text-sm"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={() => handleAction('approve')}
                className="flex items-center gap-1.5 rounded-lg bg-[#2E7D32] px-4 py-2 text-sm text-white hover:bg-[#2E7D32]/90"
              >
                {t('btn_confirm_approval', 'Confirm Approval')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal (Returns to DO) */}
      {activeModal === 'reject' && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="bg-card border-border relative max-h-[90vh] w-full max-w-md space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="text-destructive flex items-center gap-3">
              <XCircle className="h-7 w-7" />
              <h3>{t('reject_return_to_do', 'Reject & Return to DO')}</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t(
                'confirm_rejection_desc',
                'Are you sure you want to reject project :id? This action will return the case back to the Development Officer (DO) for correction/re-verification.',
              ).replace(':id', actionTarget.displayId)}
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                {t(
                  'rejection_reason_label',
                  'Reason for rejection (remitted to DO)',
                )}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t(
                  'rejection_reason_placeholder',
                  'State the justification or required corrections...',
                )}
                rows={4}
                className="border-border bg-input-background text-foreground focus:ring-primary/40 focus:border-primary w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="border-border bg-muted hover:bg-muted/80 rounded-lg border px-4 py-2 text-sm"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={!comment.trim()}
                className="bg-destructive hover:bg-destructive/90 rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {t('btn_reject_case', 'Reject Case')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {activeModal === 'details' && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="bg-card border-border relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xl border shadow-2xl">
            {/* Header */}
            <div className="border-border flex items-center justify-between border-b px-6 py-4">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-wider">
                  {t(
                    'project_acquisition_financial_clearance_sas',
                    'PROJECT ACQUISITION FINANCIAL CLEARANCE (SAS)',
                  )}
                </span>
                <h3 className="text-foreground mt-0.5 text-xl font-bold">
                  {t('review_case_title', 'Review Case - :id').replace(
                    ':id',
                    actionTarget.displayId,
                  )}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="hover:bg-muted rounded-lg p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6 text-sm">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      {t('col_project_title', 'Project Title')}
                    </span>
                    <p className="mt-0.5 text-base font-semibold">
                      {actionTarget.data.title ||
                        actionTarget.data.name ||
                        t('n_a', 'N/A')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      {t('col_purpose', 'Purpose')}
                    </span>
                    <p className="text-foreground mt-0.5 leading-relaxed">
                      {actionTarget.data.purpose || t('n_a', 'N/A')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      {t('col_institution', 'Institution')}
                    </span>
                    <p className="mt-0.5 font-medium">
                      {actionTarget.data.institution || t('n_a', 'N/A')}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {actionTarget.data.institution_address || ''}
                    </p>
                  </div>
                </div>

                <div className="border-border space-y-4 border-l pl-6">
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      {t(
                        'proposed_acquisition_area',
                        'Proposed Acquisition Area',
                      )}
                    </span>
                    <p className="mt-0.5 text-base font-semibold">
                      {actionTarget.data.land_area_to_be_acquired_acers ?? 0}{' '}
                      {t('acres', 'Acres')},{' '}
                      {actionTarget.data.land_area_to_be_acquired_roods ?? 0}{' '}
                      {t('roods', 'Roods')},{' '}
                      {actionTarget.data.land_area_to_be_acquired_perches ?? 0}{' '}
                      {t('perches', 'Perches')}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                      {t('total_area_label', 'Total Area:')}{' '}
                      {actionTarget.data.full_land_area_to_be_acquired ?? 0}{' '}
                      {t('perches', 'Perches')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      {t(
                        'resettlement_required_label',
                        'Resettlement Required',
                      )}
                    </span>
                    <p className="mt-0.5 font-medium">
                      {actionTarget.data.are_residents_moved_temp
                        ? t(
                            'resettlement_temp_required',
                            'Yes, Temporary Resettlement Required',
                          )
                        : t('value_no', 'No')}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      {t('status_remarks_history', 'Status Remarks / History')}
                    </span>
                    <p className="text-muted-foreground bg-muted mt-0.5 whitespace-pre-line rounded p-2 text-xs">
                      {actionTarget.data.remarks ||
                        t('no_prior_remarks', 'No prior remarks.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Linked Land Parcels Section */}
              <div className="border-border border-t pt-4">
                <span className="text-muted-foreground text-xs font-bold uppercase">
                  {t('associated_land_parcels', 'Associated Land Parcels')}
                </span>
                <div className="border-border mt-2 overflow-x-auto rounded-lg border">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-border border-b">
                        <th className="p-3 font-semibold">
                          {t('col_parcel_id', 'Parcel ID')}
                        </th>
                        <th className="p-3 font-semibold">
                          {t('col_land_name', 'Land Name')}
                        </th>
                        <th className="p-3 font-semibold">
                          {t('col_location', 'Location')}
                        </th>
                        <th className="p-3 font-semibold">
                          {t('col_extent_arp', 'Extent (A-R-P)')}
                        </th>
                        <th className="p-3 font-semibold">
                          {t('col_estimated_value', 'Estimated Value')}
                        </th>
                        <th className="p-3 font-semibold">
                          {t('col_status', 'Status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {actionTarget.data.land_parcels &&
                      actionTarget.data.land_parcels.length > 0 ? (
                        actionTarget.data.land_parcels.map((parcel: any) => (
                          <tr key={parcel.id} className="hover:bg-muted/10">
                            <td className="p-3 font-semibold">
                              {parcel.parcel_id}
                            </td>
                            <td className="p-3">
                              {parcel.land_name || t('n_a', 'N/A')}
                            </td>
                            <td className="p-3">
                              {parcel.village
                                ? `${parcel.village}, ${parcel.district}`
                                : t('n_a', 'N/A')}
                            </td>
                            <td className="p-3">
                              {`${parcel.land_size_acers ?? 0} ${t('acres', 'A')}, ${parcel.land_size_roods ?? 0} ${t('roods', 'R')}, ${parcel.land_size_perches ?? 0} ${t('perches', 'P')}`}
                            </td>
                            <td className="p-3 font-semibold text-[#2E7D32]">
                              {formatLKR(parcel.estimated_value || 0)}
                            </td>
                            <td className="p-3">
                              <StatusBadge status={parcel.status} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-muted-foreground p-4 text-center"
                          >
                            {t(
                              'no_parcels_registered',
                              'No land parcels are currently registered under this project.',
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Supporting Documents Section */}
              <div className="border-border border-t pt-4">
                <span className="text-muted-foreground text-xs font-bold uppercase">
                  {t(
                    'submitted_supporting_docs',
                    'Submitted Supporting Documents',
                  )}
                </span>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {actionTarget.data.documents &&
                  actionTarget.data.documents.length > 0 ? (
                    actionTarget.data.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="border-border bg-muted/30 flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="text-foreground truncate text-sm font-medium">
                            {doc.original_filename}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {doc.document_category} •{' '}
                            {doc.file_size || t('n_a', 'N/A')}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleDownload(doc.id, doc.original_filename)
                          }
                          className="bg-primary/10 text-primary hover:bg-primary/20 shrink-0 rounded p-2 transition-colors"
                          title={t(
                            'tooltip_download_document',
                            'Download document',
                          )}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground col-span-2 text-xs">
                      {t(
                        'no_documents_uploaded',
                        'No documents have been uploaded for verification.',
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-border bg-muted/20 flex items-center justify-end gap-2 border-t px-6 py-4">
              <button
                onClick={closeModal}
                className="border-border bg-muted hover:bg-muted/80 rounded-lg border px-4 py-2 text-sm"
              >
                {t('btn_close_review', 'Close Review')}
              </button>
              {actionTarget.data.sas_status === 'pending' && (
                <>
                  <button
                    onClick={() => openActionModal('reject', actionTarget)}
                    className="bg-destructive hover:bg-destructive/90 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-white"
                  >
                    <XCircle className="h-4 w-4" />
                    {t('btn_reject_return', 'Reject & Return')}
                  </button>
                  <button
                    onClick={() => openActionModal('approve', actionTarget)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#2E7D32] px-4 py-2 text-sm text-white hover:bg-[#2E7D32]/90"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t('btn_approve_case', 'Approve Case')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

SASApprovals.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
