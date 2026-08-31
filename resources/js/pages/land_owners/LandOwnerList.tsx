import { router } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { getPropertyOwners } from '@/services/propertyOwnerManagement';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';

export default function LandOwnerList() {
  const { t } = useTranslation();
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
    { key: 'ownerId', label: t('owner_id', 'Owner ID'), sortable: true },
    { key: 'name', label: t('full_name', 'Name'), sortable: true },
    {
      key: 'nic',
      label: t('nic', 'NIC'),
      sortable: true,
      render: (value: string | null) => value || t('n_a', 'N/A'),
    },
    {
      key: 'contact',
      label: t('contact_number', 'Contact Number'),
      sortable: true,
      render: (value: string | null) => value || t('n_a', 'N/A'),
    },
    { key: 'address', label: t('address', 'Address'), sortable: true },
    {
      key: 'parcelsCount',
      label: t('parcel_count_header', 'Parcel Count'),
      sortable: true,
      render: (_val: any, row: any) => row.landParcels?.length || 0,
    },
    {
      key: 'created_at',
      label: t('created_at_header', 'Created At'),
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : t('n_a', 'N/A'),
    },
    {
      key: 'updated_at',
      label: t('updated_at_header', 'Updated At'),
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : t('n_a', 'N/A'),
    },
  ];

  const actions = (row: any) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        router.visit(`/land-owners/${row.id}`);
      }}
      className="hover:bg-muted rounded p-1.5 transition-colors"
      title={t('view_profile_tooltip', 'View Profile')}
    >
      <Eye className="h-4 w-4" />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>{t('land_owners', 'Property Owners')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('manage_property_owners_desc', 'Manage property owner information')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border">
          {t('loading_property_owners', 'Loading property owners...')}
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
