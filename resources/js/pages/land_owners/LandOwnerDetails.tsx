import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';
import { getPropertyOwner } from '@/services/propertyOwnerManagement';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';

interface Props {
  id: string;
}

export default function LandOwnerDetails({ id }: Props) {
  const [owner, setOwner] = useState<PropertyOwner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        setLoading(true);
        const data = await getPropertyOwner(id);
        setOwner(data);
      } catch (error) {
        console.error('Failed to fetch property owner:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [id]);

  const parcels = owner?.landParcels
    ? owner.landParcels.map((p) => ({
        id: p.id,
        parcelId: p.parcel_id,
        surveyNo: p.parcel_id,
        village: p.village,
        extent: `${p.extent_acers} acres, ${p.extent_perches} perches`,
        status: p.status,
      }))
    : [];

  const compensation = owner?.compensations
    ? owner.compensations.map((c) => ({
        id: c.id,
        compensationId: c.compensation_id,
        parcel: c.landParcel?.parcel_id || 'N/A',
        amount: `₨ ${Number(c.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`,
        approvedDate: c.approved_date || '-',
        paymentDate: c.payment_date || '-',
        status: c.status,
      }))
    : [];

  const documents = [
    { name: 'National Identity Card', type: 'PDF', uploadDate: '2024-02-05' },
    {
      name: `Deed of Ownership${owner?.landParcels && owner.landParcels.length > 0 ? ` - ${owner.landParcels[0].parcel_id}` : ''}`,
      type: 'PDF',
      uploadDate: '2024-02-05',
    },
    { name: 'Bank Account Details', type: 'PDF', uploadDate: '2024-05-10' },
  ];

  if (loading) {
    return (
      <div className="text-muted-foreground flex h-96 items-center justify-center">
        Loading property owner details...
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="text-muted-foreground flex h-96 flex-col items-center justify-center gap-4">
        <p>Property owner not found.</p>
        <Link href="/land-owners" className="text-primary hover:underline">
          Back to Property Owners
        </Link>
      </div>
    );
  }

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
            <p className="text-muted-foreground">Owner ID: {owner.ownerId}</p>
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
              <dd>{owner.dateOfBirth ?? "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Occupation:</dt>
              <dd>{owner.occupation ?? "-"}</dd>
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
              { key: 'parcelId', label: 'Parcel ID', sortable: true },
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
            onRowClick={(row) => router.visit(`/land-parcels/${row.id}`)}
            searchable={false}
            filterable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">Compensation History</h3>
          <DataTable
            columns={[
              { key: 'compensationId', label: 'Compensation ID', sortable: true },
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
