import { Link } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';

export default function ViewAllPayments() {
  const payments = [
    {
      id: 'PAY-3456',
      owner: 'W.A. Perera',
      parcel: 'PCL-8934',
      amount: '₨ 15,000,000',
      approvedDate: '2024-05-10',
      paymentDate: '2024-05-20',
      method: 'Bank Transfer',
      status: 'paid',
    },
    {
      id: 'PAY-3457',
      owner: 'S.M. Fernando',
      parcel: 'PCL-8935',
      amount: '₨ 10,800,000',
      approvedDate: '2024-05-15',
      paymentDate: '2024-05-25',
      method: 'Bank Transfer',
      status: 'paid',
    },
    {
      id: 'PAY-3458',
      owner: 'R.K. Silva',
      parcel: 'PCL-8936',
      amount: '₨ 19,440,000',
      approvedDate: '2024-05-20',
      paymentDate: '-',
      method: 'Bank Transfer',
      status: 'pending',
    },
    {
      id: 'PAY-3459',
      owner: 'A.P. Jayawardena',
      parcel: 'PCL-8937',
      amount: '₨ 25,200,000',
      approvedDate: '2024-05-25',
      paymentDate: '-',
      method: 'Bank Transfer',
      status: 'approved',
    },
    {
      id: 'PAY-3460',
      owner: 'K.D. Wijesinghe',
      parcel: 'PCL-8938',
      amount: '₨ 12,960,000',
      approvedDate: '2024-05-28',
      paymentDate: '-',
      method: 'Cheque',
      status: 'pending',
    },
  ];

  const columns = [
    { key: 'id', label: 'Payment ID', sortable: true },
    { key: 'owner', label: 'Owner Name', sortable: true },
    { key: 'parcel', label: 'Parcel', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'approvedDate', label: 'Approved Date', sortable: true },
    { key: 'paymentDate', label: 'Payment Date', sortable: true },
    { key: 'method', label: 'Payment Method', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/compensation"
            className="hover:bg-muted rounded-lg p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1>Payment Tracking</h1>
            <p className="text-muted-foreground">
              Track compensation payment status
            </p>
          </div>
        </div>
        <button className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors">
          <Download className="h-4 w-4" />
          <span>Export Payments</span>
        </button>
      </div>

      <DataTable columns={columns} data={payments} />
    </div>
  );
}

ViewAllPayments.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
