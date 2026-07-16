import { router } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import MainLayout from '@/layouts/MainLayout';
import { getPropertyOwners } from '@/services/propertyOwnerManagement';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';

export default function LandOwnerList() {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);
        const data = await getPropertyOwners();
        setOwners(data);
      } catch (error) {
        console.error('Failed to fetch property owners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  const columns = [
    { key: 'ownerId', label: 'Owner ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'nic', label: 'NIC', sortable: true },
    { key: 'contact', label: 'Contact Number', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'parcelsCount',
      label: 'Parcel Count',
      sortable: true,
      render: (_val: any, row: any) => row.landParcels?.length || 0,
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      key: 'updated_at',
      label: 'Updated At',
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : 'N/A',
    },
  ];

  const actions = (row: any) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        router.visit(`/land-owners/${row.id}`);
      }}
      className="hover:bg-muted rounded p-1.5 transition-colors"
      title="View Profile"
    >
      <Eye className="h-4 w-4" />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Property Owners</h1>
          <p className="text-muted-foreground mt-1">
            Manage property owner information
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border">
          Loading property owners...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={owners}
          onRowClick={(row) => router.visit(`/land-owners/${row.id}`)}
          actions={actions}
        />
      )}
    </div>
  );
}

LandOwnerList.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
