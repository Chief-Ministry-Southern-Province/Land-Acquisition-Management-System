import { Link } from '@inertiajs/react';
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';
import { getCompensations } from '@/services/compensationService';
import type { Compensation } from '@/services/compensationService';
import { getPayments } from '@/services/paymentService';
import type { Payment } from '@/services/paymentService';

export default function ViewAllPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [payData, compData] = await Promise.all([
          getPayments(),
          getCompensations(),
        ]);

        if (isMounted) {
          setPayments(payData || []);
          setCompensations(compData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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

  // Build combined items from payments & compensations
  const paymentItems = payments.map((p) => ({
    id: p.payment_reference || `PAY-${p.id}`,
    owner: p.compensation?.owner?.name || 'N/A',
    parcel:
      p.compensation?.landParcel?.parcel_id ||
      p.compensation?.landParcel?.land_name ||
      'N/A',
    amount: `₨ ${Number(p.amount_paid).toLocaleString()}`,
    approvedDate: p.compensation?.approved_date || '-',
    paymentDate: p.payment_date || '-',
    method: p.payment_method || 'N/A',
    status: p.status === 'completed' ? 'paid' : p.status || 'paid',
    type: 'Payment',
    raw: p,
  }));

  const compensationItems = compensations.map((c) => ({
    id: c.compensation_id || `CMP-${c.id}`,
    owner: c.owner?.name || 'N/A',
    parcel: c.landParcel?.parcel_id || c.landParcel?.land_name || 'N/A',
    amount: `₨ ${Number(c.amount).toLocaleString()}`,
    approvedDate: c.approved_date || '-',
    paymentDate: c.payment_date || '-',
    method: 'N/A',
    status: c.status || 'pending',
    type: 'Compensation',
    raw: null,
  }));

  const allItems = [...compensationItems, ...paymentItems];

  // Filtering
  const filteredItems = allItems.filter((item) => {
    const ownerName = item.owner || '';
    const parcelId = item.parcel || '';
    const ref = item.id || '';

    const matchesSearch =
      ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parcelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.toLowerCase().includes(searchQuery.toLowerCase());

    const itemStatus = item.status?.toLowerCase() || '';
    const filterStatus = selectedStatus.toLowerCase();

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'paid' &&
        (itemStatus === 'paid' || itemStatus === 'completed')) ||
      itemStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'id', label: 'Reference / ID', sortable: true },
    { key: 'owner', label: 'Owner Name', sortable: true },
    { key: 'parcel', label: 'Parcel', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'approvedDate', label: 'Approved Date', sortable: true },
    { key: 'paymentDate', label: 'Payment Date', sortable: true },
    { key: 'method', label: 'Method', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  // CSV Export
  const exportToCSV = () => {
    if (filteredItems.length === 0) {
      return;
    }

    const headers = [
      'Reference ID',
      'Owner Name',
      'Parcel ID',
      'Amount (LKR)',
      'Approved Date',
      'Payment Date',
      'Method',
      'Status',
    ];

    const rows = filteredItems.map((p) => [
      `"${p.id || ''}"`,
      `"${p.owner || ''}"`,
      `"${p.parcel || ''}"`,
      `"${p.amount || ''}"`,
      `"${p.approvedDate || ''}"`,
      `"${p.paymentDate || ''}"`,
      `"${p.method || ''}"`,
      `"${p.status || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `compensation_records_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/compensation"
            className="hover:bg-muted border-border rounded-lg border p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1>Compensation & Payment Tracking</h1>
            <p className="text-muted-foreground">
              Track and manage all compensation and payment records
            </p>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredItems.length === 0}
          className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>Export Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border-border flex flex-col items-center justify-between gap-4 rounded-lg border p-4 sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, owner, parcel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background border-border focus:ring-primary w-full rounded-md border py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2"
          />
        </div>

        <div className="flex w-full items-center gap-2 overflow-x-auto sm:w-auto">
          {['all', 'approved', 'pending', 'paid', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                selectedStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <span className="text-muted-foreground ml-2">Loading records...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          onRowClick={(row) => {
            if (row.raw) {
              setSelectedPayment(row.raw as Payment);
            }
          }}
        />
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card text-card-foreground border-border w-full max-w-lg space-y-4 rounded-lg border p-6 shadow-xl">
            <div className="border-border flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold">
                Payment Details: {selectedPayment.payment_reference}
              </h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="hover:bg-muted text-muted-foreground rounded-md p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Owner</p>
                <p className="font-semibold">
                  {selectedPayment.compensation?.owner?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Land Parcel</p>
                <p className="font-semibold">
                  {selectedPayment.compensation?.landParcel?.parcel_id ||
                    selectedPayment.compensation?.landParcel?.land_name ||
                    'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Amount Paid</p>
                <p className="text-primary font-semibold">
                  ₨ {Number(selectedPayment.amount_paid).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedPayment.status} />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">
                  Payment Date
                </p>
                <p>{selectedPayment.payment_date || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">
                  Payment Method
                </p>
                <p className="capitalize">{selectedPayment.payment_method}</p>
              </div>
              {selectedPayment.bank_name && (
                <div>
                  <p className="text-muted-foreground font-medium">Bank</p>
                  <p>{selectedPayment.bank_name}</p>
                </div>
              )}
              {selectedPayment.account_number && (
                <div>
                  <p className="text-muted-foreground font-medium">
                    Account Number
                  </p>
                  <p>{selectedPayment.account_number}</p>
                </div>
              )}
            </div>

            {selectedPayment.remarks && (
              <div className="border-border border-t pt-3 text-sm">
                <p className="text-muted-foreground font-medium">Remarks</p>
                <p className="mt-1">{selectedPayment.remarks}</p>
              </div>
            )}

            {selectedPayment.document && (
              <div className="border-border flex items-center justify-between border-t pt-3 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary h-4 w-4" />
                  <span>{selectedPayment.document.original_filename}</span>
                </div>
                <a
                  href={`/api/documents/${selectedPayment.document.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  <Download className="h-3 w-3" /> Download Receipt
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPayment(null)}
                className="bg-muted hover:bg-muted/80 rounded-md px-4 py-2 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ViewAllPayments.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
