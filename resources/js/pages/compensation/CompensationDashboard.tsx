import { router } from '@inertiajs/react';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';

export default function CompensationDashboard() {
  const stats = [
    {
      title: 'Total Budget',
      value: '₨ 250M',
      icon: DollarSign,
      color: 'primary' as const,
    },
    {
      title: 'Approved Compensation',
      value: '₨ 185M',
      icon: CheckCircle,
      color: 'success' as const,
    },
    {
      title: 'Paid Compensation',
      value: '₨ 145M',
      icon: DollarSign,
      color: 'info' as const,
    },
    {
      title: 'Pending Compensation',
      value: '₨ 40M',
      icon: Clock,
      color: 'warning' as const,
    },
  ];

  const monthlyData = [
    { month: 'Jan', approved: 24, paid: 20 },
    { month: 'Feb', approved: 32, paid: 28 },
    { month: 'Mar', approved: 28, paid: 25 },
    { month: 'Apr', approved: 45, paid: 38 },
    { month: 'May', approved: 38, paid: 34 },
    { month: 'Jun', approved: 18, paid: 0 },
  ];

  const recentPayments = [
    {
      id: 'PAY-3456',
      owner: 'W.A. Perera',
      parcel: 'PCL-8934',
      amount: '₨ 15,000,000',
      date: '2024-05-20',
      status: 'paid',
    },
    {
      id: 'PAY-3457',
      owner: 'S.M. Fernando',
      parcel: 'PCL-8935',
      amount: '₨ 10,800,000',
      date: '2024-05-25',
      status: 'paid',
    },
    {
      id: 'PAY-3458',
      owner: 'R.K. Silva',
      parcel: 'PCL-8936',
      amount: '₨ 19,440,000',
      date: '-',
      status: 'pending',
    },
    {
      id: 'PAY-3459',
      owner: 'A.P. Jayawardena',
      parcel: 'PCL-8937',
      amount: '₨ 25,200,000',
      date: '-',
      status: 'approved',
    },
  ];

  const columns = [
    { key: 'id', label: 'Payment ID', sortable: true },
    { key: 'owner', label: 'Owner', sortable: true },
    { key: 'parcel', label: 'Parcel', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'date', label: 'Payment Date', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Compensation Management</h1>
          <p className="text-muted-foreground mt-1">
            Overview of compensation budget and payments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.visit('/compensation/calculate')}
            className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white transition-colors"
          >
            Calculate Compensation
          </button>
          <button
            onClick={() => router.visit('/compensation/all')}
            className="border-border hover:bg-muted rounded-lg border px-4 py-2 transition-colors"
          >
            View All Payments
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="bg-card border-border rounded-lg border p-6">
        <h3 className="mb-4">Monthly Compensation (₨ Millions)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="approved" fill="#1565C0" name="Approved" />
            <Bar dataKey="paid" fill="#2E7D32" name="Paid" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="mb-4">Recent Payments</h3>
        <DataTable
          columns={columns}
          data={recentPayments}
          onRowClick={(/*row*/) => router.visit(`/compensation/payments`)} //IMPLEMENT view payment details
        />
      </div>
    </div>
  );
}

CompensationDashboard.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
