import {
  CheckCircle,
  MessageSquare,
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
import MainLayout from '@/layouts/MainLayout';
import { downloadDocument } from '@/services/documentManagementService';
import {
  getPendingApprovals,
  approveCase,
  queryCase,
  rejectCase,
} from '@/services/hobApprovalService';

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

export default function HOBApprovals() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');
  const [activeModal, setActiveModal] = useState<
    'approve' | 'query' | 'reject' | 'details' | null
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
      console.error('Failed to fetch HOB approvals:', err);
      showToast('error', 'Failed to load project approval cases.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchApprovals();
    });
  }, [fetchApprovals]);

  const handleAction = async (action: 'approve' | 'query' | 'reject') => {
    if (!actionTarget) {
      return;
    }

    if ((action === 'query' || action === 'reject') && !comment.trim()) {
      showToast('error', 'Remarks comment is required for this action.');

      return;
    }

    try {
      setLoading(true);

      if (action === 'approve') {
        await approveCase(actionTarget.type, actionTarget.id);
        showToast(
          'success',
          `Successfully approved case ${actionTarget.displayId}.`,
        );
      } else if (action === 'query') {
        await queryCase(actionTarget.type, actionTarget.id, comment);
        showToast(
          'success',
          `Returned case ${actionTarget.displayId} to DO with queries.`,
        );
      } else {
        await rejectCase(actionTarget.type, actionTarget.id, comment);
        showToast('success', `Rejected case ${actionTarget.displayId}.`);
      }

      closeModal();
      await fetchApprovals();
    } catch (err: any) {
      console.error(`Failed to ${action} case:`, err);
      const msg =
        err.response?.data?.message ||
        `Failed to perform action on case ${actionTarget.displayId}`;
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (
    action: 'approve' | 'query' | 'reject',
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
      showToast('success', `Downloading document: ${filename}`);
    } catch (err) {
      console.error('Failed to download document:', err);
      showToast('error', 'Failed to download document.');
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
  const pendingProjects = projects.filter((p) => p.hob_status === 'pending');
  const approvedProjects = projects.filter((p) => p.hob_status === 'approved');
  const rejectedProjects = projects.filter((p) => p.hob_status === 'rejected');

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
      title: 'Total Cases Recieved',
      value: projects.length,
      icon: FolderKanban,
      color: 'primary' as const,
    },
    {
      title: 'Pending HOB Action',
      value: pendingProjects.length,
      icon: Clock,
      color: 'warning' as const,
    },
    {
      title: 'Approved Cases',
      value: approvedProjects.length,
      icon: ThumbsUp,
      color: 'success' as const,
    },
    {
      title: 'Rejected Cases',
      value: rejectedProjects.length,
      icon: ThumbsDown,
      color: 'secondary' as const,
    },
  ];

  const columns = [
    { key: 'project_id', label: 'Project ID', sortable: true },
    {
      key: 'title',
      label: 'Project Title',
      sortable: true,
      render: (_val: any, row: any) => row.title || row.name || 'N/A',
    },
    { key: 'institution', label: 'Institution', sortable: true },
    { key: 'purpose', label: 'Purpose', sortable: true },
    {
      key: 'landArea',
      label: 'Land Area (A-R-P)',
      render: (_val: any, row: any) =>
        `${row.land_area_to_be_acquired_acers ?? 0} A, ${row.land_area_to_be_acquired_roods ?? 0} R, ${row.land_area_to_be_acquired_perches ?? 0} P`,
    },
    {
      key: 'hob_status',
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
          title="Review details"
        >
          <Eye className="h-4.5 w-4.5 text-muted-foreground" />
        </button>
        {row.hob_status === 'pending' && (
          <>
            <button
              onClick={() => openActionModal('approve', target)}
              className="rounded p-1.5 text-[#2E7D32] transition-colors hover:bg-[#2E7D32]/10"
              title="Approve case"
            >
              <CheckCircle className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => openActionModal('query', target)}
              className="rounded p-1.5 text-[#FF9800] transition-colors hover:bg-[#FF9800]/10"
              title="Return with query"
            >
              <MessageSquare className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => openActionModal('reject', target)}
              className="hover:bg-destructive/10 text-destructive rounded p-1.5 transition-colors"
              title="Reject case"
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
        <h1>Pending Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review, query, or approve land acquisition projects submitted for Head
          of Branch verification.
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
            { id: 'all', label: 'All Cases', count: projects.length },
            {
              id: 'pending',
              label: 'Pending HOB Action',
              count: pendingProjects.length,
            },
            {
              id: 'approved',
              label: 'Approved',
              count: approvedProjects.length,
            },
            {
              id: 'rejected',
              label: 'Rejected',
              count: rejectedProjects.length,
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
              {tab.label} ({tab.count})
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
              <h3>Confirm Approval</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Are you sure you want to approve the project{' '}
              <strong>{actionTarget.displayId}</strong> ({actionTarget.title})?
              This will forward it to the Administrative Officer (AO) for legal
              notice clearance.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={closeModal}
                className="border-border bg-muted hover:bg-muted/80 rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('approve')}
                className="flex items-center gap-1.5 rounded-lg bg-[#2E7D32] px-4 py-2 text-sm text-white hover:bg-[#2E7D32]/90"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Query Modal */}
      {activeModal === 'query' && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="bg-card border-border relative max-h-[90vh] w-full max-w-md space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#FF9800]">
              <MessageSquare className="h-7 w-7" />
              <h3>Return with Query</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The case <strong>{actionTarget.displayId}</strong> will be
              returned to the Development Officer (DO) as a draft for revisions.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                Query comments / instructions for DO
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="E.g., Please re-verify lot 2 boundaries. Upload missing survey plan document..."
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
                Cancel
              </button>
              <button
                onClick={() => handleAction('query')}
                disabled={!comment.trim()}
                className="rounded-lg bg-[#FF9800] px-4 py-2 text-sm text-white hover:bg-[#FF9800]/90 disabled:opacity-50"
              >
                Send Query
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {activeModal === 'reject' && actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="bg-card border-border relative max-h-[90vh] w-full max-w-md space-y-4 rounded-xl border p-6 shadow-2xl">
            <div className="text-destructive flex items-center gap-3">
              <XCircle className="h-7 w-7" />
              <h3>Reject Request</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Are you sure you want to reject project{' '}
              <strong>{actionTarget.displayId}</strong>? Rejections will halt
              this case completely.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-muted-foreground text-xs font-semibold">
                Rejection reason
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="State the justification details for this rejection..."
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
                Cancel
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={!comment.trim()}
                className="bg-destructive hover:bg-destructive/90 rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Reject Case
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
                  PROJECT ACQUISITION VERIFICATION
                </span>
                <h3 className="text-foreground mt-0.5 text-xl font-bold">
                  Review Case - {actionTarget.displayId}
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
                      Project Title
                    </span>
                    <p className="mt-0.5 text-base font-semibold">
                      {actionTarget.data.title ||
                        actionTarget.data.name ||
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      Purpose / Objective
                    </span>
                    <p className="text-foreground mt-0.5 leading-relaxed">
                      {actionTarget.data.purpose || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      Requesting Institution
                    </span>
                    <p className="mt-0.5 font-medium">
                      {actionTarget.data.institution || 'N/A'}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {actionTarget.data.institution_address || ''}
                    </p>
                  </div>
                </div>

                <div className="border-border space-y-4 border-l pl-6">
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      Proposed Acquisition Area
                    </span>
                    <p className="mt-0.5 text-base font-semibold">
                      {actionTarget.data.land_area_to_be_acquired_acers ?? 0}{' '}
                      Acres,{' '}
                      {actionTarget.data.land_area_to_be_acquired_roods ?? 0}{' '}
                      Roods,{' '}
                      {actionTarget.data.land_area_to_be_acquired_perches ?? 0}{' '}
                      Perches
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                      Total Area:{' '}
                      {actionTarget.data.full_land_area_to_be_acquired ?? 0}{' '}
                      Perches
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      Resettlement Required
                    </span>
                    <p className="mt-0.5 font-medium">
                      {actionTarget.data.are_residents_moved_temp
                        ? 'Yes, Temporary Resettlement Required'
                        : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-bold uppercase">
                      Status Remarks / History
                    </span>
                    <p className="text-muted-foreground bg-muted mt-0.5 whitespace-pre-line rounded p-2 text-xs">
                      {actionTarget.data.remarks || 'No prior remarks.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Linked Land Parcels Section */}
              <div className="border-border border-t pt-4">
                <span className="text-muted-foreground text-xs font-bold uppercase">
                  Associated Land Parcels
                </span>
                <div className="border-border mt-2 overflow-x-auto rounded-lg border">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-border border-b">
                        <th className="p-3 font-semibold">Parcel ID</th>
                        <th className="p-3 font-semibold">Land Name</th>
                        <th className="p-3 font-semibold">Location</th>
                        <th className="p-3 font-semibold">Extent (A-R-P)</th>
                        <th className="p-3 font-semibold">Estimated Value</th>
                        <th className="p-3 font-semibold">Status</th>
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
                            <td className="p-3">{parcel.land_name || 'N/A'}</td>
                            <td className="p-3">
                              {parcel.village
                                ? `${parcel.village}, ${parcel.district}`
                                : 'N/A'}
                            </td>
                            <td className="p-3">
                              {`${parcel.land_size_acers ?? 0} A, ${parcel.land_size_roods ?? 0} R, ${parcel.land_size_perches ?? 0} P`}
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
                            No land parcels are currently registered under this
                            project.
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
                  Submitted Supporting Documents
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
                            {doc.document_category} • {doc.file_size || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleDownload(doc.id, doc.original_filename)
                          }
                          className="bg-primary/10 text-primary hover:bg-primary/20 shrink-0 rounded p-2 transition-colors"
                          title="Download document"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground col-span-2 text-xs">
                      No documents have been uploaded for verification.
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
                Close Review
              </button>
              {actionTarget.data.hob_status === 'pending' && (
                <>
                  <button
                    onClick={() => openActionModal('query', actionTarget)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#FF9800] px-4 py-2 text-sm text-white hover:bg-[#FF9800]/90"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Return Query
                  </button>
                  <button
                    onClick={() => openActionModal('reject', actionTarget)}
                    className="bg-destructive hover:bg-destructive/90 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-white"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Case
                  </button>
                  <button
                    onClick={() => openActionModal('approve', actionTarget)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#2E7D32] px-4 py-2 text-sm text-white hover:bg-[#2E7D32]/90"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Case
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

HOBApprovals.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
