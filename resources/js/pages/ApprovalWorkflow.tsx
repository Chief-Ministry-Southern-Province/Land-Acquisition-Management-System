import { CheckCircle, MessageSquare, XCircle } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import MainLayout from '@/layouts/MainLayout';

export default function ApprovalWorkflow() {
  const [selectedTab, setSelectedTab] = useState('pending');

  const approvals = [
    {
      id: 'APR-2024-156',
      type: 'Compensation Approval',
      item: 'COMP-3458 - R.K. Silva',
      amount: '₨ 19,440,000',
      submittedBy: 'Finance Officer',
      submittedDate: '2024-05-20',
      status: 'pending',
      level: 'Assistant Secretary',
    },
    {
      id: 'APR-2024-155',
      type: 'Valuation Approval',
      item: 'VAL-5679 - PCL-8935',
      amount: '₨ 10,800,000',
      submittedBy: 'Valuation Officer',
      submittedDate: '2024-05-18',
      status: 'pending',
      level: 'Chief Approval',
    },
    {
      id: 'APR-2024-154',
      type: 'Project Approval',
      item: 'PRJ-2024-049 - Gampaha Industrial Zone',
      amount: '₨ 320,000,000',
      submittedBy: 'Land Officer',
      submittedDate: '2024-05-15',
      status: 'pending',
      level: 'Assistant Secretary',
    },
    {
      id: 'APR-2024-153',
      type: 'Compensation Approval',
      item: 'COMP-3457 - S.M. Fernando',
      amount: '₨ 10,800,000',
      submittedBy: 'Finance Officer',
      submittedDate: '2024-05-10',
      status: 'approved',
      level: 'Completed',
    },
    {
      id: 'APR-2024-152',
      type: 'Survey Approval',
      item: 'SUR-2024-154 - PCL-8936',
      amount: '-',
      submittedBy: 'Survey Officer',
      submittedDate: '2024-05-05',
      status: 'approved',
      level: 'Completed',
    },
    {
      id: 'APR-2024-151',
      type: 'Valuation Approval',
      item: 'VAL-5678 - PCL-8934',
      amount: '₨ 15,000,000',
      submittedBy: 'Valuation Officer',
      submittedDate: '2024-04-28',
      status: 'rejected',
      level: 'Rejected',
    },
  ];

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const approvedApprovals = approvals.filter((a) => a.status === 'approved');
  const rejectedApprovals = approvals.filter((a) => a.status === 'rejected');

  const currentData =
    selectedTab === 'pending'
      ? pendingApprovals
      : selectedTab === 'approved'
        ? approvedApprovals
        : rejectedApprovals;

  const columns = [
    { key: 'id', label: 'Approval ID', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'item', label: 'Item', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'submittedBy', label: 'Submitted By', sortable: true },
    { key: 'submittedDate', label: 'Submitted Date', sortable: true },
    { key: 'level', label: 'Approval Level', sortable: true },
  ];

  const actions = (row: any) => (
    <div className="flex items-center justify-end gap-2">
      {row.status === 'pending' && (
        <>
          <button
            className="rounded p-1.5 text-[#2E7D32] transition-colors hover:bg-[#2E7D32]/10"
            title="Approve"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            className="hover:bg-destructive/10 text-destructive rounded p-1.5 transition-colors"
            title="Reject"
          >
            <XCircle className="h-4 w-4" />
          </button>
          <button
            className="hover:bg-muted rounded p-1.5 transition-colors"
            title="Comment"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Approval Workflow</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve pending requests
        </p>
      </div>

      {/* Approval Levels */}
      <div className="bg-card border-border rounded-lg border p-6">
        <h3 className="mb-4">Approval Hierarchy</h3>
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
          {[
            'Data Entry',
            'Land Officer',
            'Valuation Officer',
            'Assistant Secretary',
            'Chief Approval',
          ].map((level, index) => (
            <div key={level} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    index <= 2
                      ? 'bg-[#2E7D32] text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-2 whitespace-nowrap text-center text-sm">
                  {level}
                </span>
              </div>
              {index < 4 && <div className="bg-border h-0.5 w-12"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-border border-b">
        <div className="flex gap-1">
          {[
            { id: 'pending', label: 'Pending', count: pendingApprovals.length },
            {
              id: 'approved',
              label: 'Approved',
              count: approvedApprovals.length,
            },
            {
              id: 'rejected',
              label: 'Rejected',
              count: rejectedApprovals.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`border-b-2 px-4 py-3 transition-colors ${
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

      {/* Approvals Table */}
      <DataTable columns={columns} data={currentData} actions={actions} />
    </div>
  );
}

ApprovalWorkflow.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
