import { router } from '@inertiajs/react';
import { CheckCircle, Clock, DollarSign, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { getCompensations } from '@/services/compensationService';
import type { Compensation } from '@/services/compensationService';
import { getPayments } from '@/services/paymentService';
import type { Payment } from '@/services/paymentService';

export default function CompensationDashboard() {
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [compData, payData] = await Promise.all([
          getCompensations(),
          getPayments(),
        ]);

        if (isMounted) {
          setCompensations(compData || []);
          setPayments(payData || []);
        }
      } catch (err) {
        console.error('Failed to load compensation dashboard data:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Stats
  const totalAmountSum = compensations.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0,
  );

  const approvedSum = compensations
    .filter(
      (c) =>
        c.status?.toLowerCase() === 'approved' ||
        c.status?.toLowerCase() === 'paid',
    )
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const paidSum = payments.reduce(
    (acc, curr) => acc + Number(curr.amount_paid || 0),
    0,
  );

  const pendingSum = compensations
    .filter((c) => c.status?.toLowerCase() === 'pending')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `₨ ${(val / 1000000).toFixed(1)}M`;
    }

    if (val >= 1000) {
      return `₨ ${(val / 1000).toFixed(0)}K`;
    }

    return `₨ ${val.toLocaleString()}`;
  };

  const stats = [
    {
      title: 'Total Compensation',
      value: formatCurrency(totalAmountSum),
      icon: DollarSign,
      color: 'primary' as const,
    },
    {
      title: 'Approved Compensation',
      value: formatCurrency(approvedSum),
      icon: CheckCircle,
      color: 'success' as const,
    },
    {
      title: 'Paid Compensation',
      value: formatCurrency(paidSum),
      icon: DollarSign,
      color: 'info' as const,
    },
    {
      title: 'Pending Compensation',
      value: formatCurrency(pendingSum),
      icon: Clock,
      color: 'warning' as const,
    },
  ];

  // Group monthly chart data
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const currentYear = new Date().getFullYear();

  const monthlyChartMap: { [key: string]: { approved: number; paid: number } } =
    {};
  months.forEach((m) => {
    monthlyChartMap[m] = { approved: 0, paid: 0 };
  });

  compensations.forEach((c) => {
    if (c.approved_date) {
      const d = new Date(c.approved_date);

      if (d.getFullYear() === currentYear || compensations.length < 5) {
        const m = months[d.getMonth()];

        if (m && monthlyChartMap[m]) {
          monthlyChartMap[m].approved += Number(c.amount || 0) / 1000000;
        }
      }
    }
  });

  payments.forEach((p) => {
    if (p.payment_date) {
      const d = new Date(p.payment_date);

      if (d.getFullYear() === currentYear || payments.length < 5) {
        const m = months[d.getMonth()];

        if (m && monthlyChartMap[m]) {
          monthlyChartMap[m].paid += Number(p.amount_paid || 0) / 1000000;
        }
      }
    }
  });

  const monthlyData = months.map((month) => ({
    month,
    approved: Number(monthlyChartMap[month].approved.toFixed(2)),
    paid: Number(monthlyChartMap[month].paid.toFixed(2)),
  }));

  // Status Filter for Recent Transactions Table
  const [tableFilter, setTableFilter] = useState<string>('all');

  // Build Table Rows from real data (compensations + payments)
  const compensationRows = compensations.map((comp) => ({
    id: comp.compensation_id || `CMP-${comp.id}`,
    owner: comp.owner?.name || 'N/A',
    parcel: comp.landParcel?.parcel_id || comp.landParcel?.land_name || 'N/A',
    amount: `₨ ${Number(comp.amount || 0).toLocaleString()}`,
    date: comp.approved_date || comp.payment_date || '-',
    status: comp.status || 'pending',
    type: 'Compensation',
  }));

  const paymentRows = payments.map((pay) => ({
    id: pay.payment_reference || `PAY-${pay.id}`,
    owner: pay.compensation?.owner?.name || 'N/A',
    parcel:
      pay.compensation?.landParcel?.parcel_id ||
      pay.compensation?.landParcel?.land_name ||
      'N/A',
    amount: `₨ ${Number(pay.amount_paid || 0).toLocaleString()}`,
    date: pay.payment_date || '-',
    status: pay.status === 'completed' ? 'paid' : pay.status || 'paid',
    type: 'Payment',
  }));

  const combinedTransactions = [...compensationRows, ...paymentRows];

  const filteredTransactions = combinedTransactions.filter((item) => {
    if (tableFilter === 'all') {
      return true;
    }

    const itemStatus = item.status.toLowerCase();
    const filter = tableFilter.toLowerCase();

    if (filter === 'paid' || filter === 'completed') {
      return itemStatus === 'paid' || itemStatus === 'completed';
    }

    return itemStatus === filter;
  });

  const columns = [
    { key: 'id', label: 'Comp / Payment ID', sortable: true },
    { key: 'owner', label: 'Owner', sortable: true },
    { key: 'parcel', label: 'Parcel', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
            View All Records
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="text-muted-foreground ml-2">Loading data...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Monthly Compensation Breakdown (₨ Millions)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`₨ ${value}M`, '']} />
                <Legend />
                <Bar dataKey="approved" fill="#1565C0" name="Approved (M)" />
                <Bar dataKey="paid" fill="#2E7D32" name="Paid (M)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <h3 className="text-lg font-semibold">
                Recent Transactions & Compensations
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto">
                {['all', 'approved', 'pending', 'paid'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setTableFilter(status)}
                    className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors ${
                      tableFilter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <DataTable
              columns={columns}
              data={filteredTransactions}
              onRowClick={() => router.visit('/compensation/all')}
            />
          </div>
        </>
      )}
    </div>
  );
}

CompensationDashboard.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
