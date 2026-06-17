import { Link } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';

export default function LandOwnerDetails() {
  // IMPLEMENT: Get id from route params and fetch owner details from backend
  const owner = {
    id: 'OWN-1247',
    name: 'W.A. Perera',
    nic: '722345678V',
    contact: '+94 71 234 5678',
    email: 'waperera@email.com',
    address: '123, Galle Road, Unawatuna, Galle',
    dateOfBirth: '1972-05-15',
    occupation: 'Business Owner',
  };

  const parcels = [
    {
      id: 'PCL-8934',
      surveyNo: '123/4A',
      village: 'Unawatuna',
      extent: '2.5 acres',
      status: 'acquired',
    },
    {
      id: 'PCL-8940',
      surveyNo: '124/2',
      village: 'Galle',
      extent: '1.2 acres',
      status: 'pending',
    },
  ];

  const compensation = [
    {
      id: 'COMP-3456',
      parcel: 'PCL-8934',
      amount: '₨ 15,000,000',
      approvedDate: '2024-05-10',
      paymentDate: '2024-05-20',
      status: 'paid',
    },
    {
      id: 'COMP-3460',
      parcel: 'PCL-8940',
      amount: '₨ 8,500,000',
      approvedDate: '-',
      paymentDate: '-',
      status: 'pending',
    },
  ];

  const documents = [
    { name: 'National Identity Card', type: 'PDF', uploadDate: '2024-02-05' },
    {
      name: 'Deed of Ownership - PCL-8934',
      type: 'PDF',
      uploadDate: '2024-02-05',
    },
    { name: 'Bank Account Details', type: 'PDF', uploadDate: '2024-05-10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/land-owners"
            className="hover:bg-muted rounded-lg p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1>{owner.name}</h1>
            <p className="text-muted-foreground">Owner ID: {owner.id}</p>
          </div>
        </div>
        <button className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors">
          <Download className="h-4 w-4" />
          <span>Export Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Personal Information</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Full Name:</dt>
              <dd>{owner.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">NIC:</dt>
              <dd>{owner.nic}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date of Birth:</dt>
              <dd>{owner.dateOfBirth}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Occupation:</dt>
              <dd>{owner.occupation}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Contact Details</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Contact:</dt>
              <dd>{owner.contact}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email:</dt>
              <dd>{owner.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Address:</dt>
              <dd className="text-right">{owner.address}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">Owned Parcels</h3>
          <DataTable
            columns={[
              { key: 'id', label: 'Parcel ID', sortable: true },
              { key: 'surveyNo', label: 'Survey No', sortable: true },
              { key: 'village', label: 'Village', sortable: true },
              { key: 'extent', label: 'Extent', sortable: true },
              {
                key: 'status',
                label: 'Status',
                render: (value: string) => <StatusBadge status={value} />,
              },
            ]}
            data={parcels}
            searchable={false}
            filterable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">Compensation History</h3>
          <DataTable
            columns={[
              { key: 'id', label: 'Compensation ID', sortable: true },
              { key: 'parcel', label: 'Parcel', sortable: true },
              { key: 'amount', label: 'Amount', sortable: true },
              { key: 'approvedDate', label: 'Approved Date', sortable: true },
              { key: 'paymentDate', label: 'Payment Date', sortable: true },
              {
                key: 'status',
                label: 'Status',
                render: (value: string) => <StatusBadge status={value} />,
              },
            ]}
            data={compensation}
            searchable={false}
            filterable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">Documents</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Document Name', sortable: true },
              { key: 'type', label: 'Type', sortable: true },
              { key: 'uploadDate', label: 'Upload Date', sortable: true },
            ]}
            data={documents}
            searchable={false}
            filterable={false}
          />
        </div>
      </div>
    </div>
  );
}

LandOwnerDetails.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
