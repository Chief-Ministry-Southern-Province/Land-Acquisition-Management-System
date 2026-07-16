import { router } from '@inertiajs/react';
import { Eye, MapPin, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';
import { getLandParcels } from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';

export default function LandParcelList() {
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        setLoading(true);
        const data = await getLandParcels();
        setParcels(data);
      } catch (error) {
        console.error('Failed to fetch land parcels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, []);

  const columns = [
    { key: 'parcel_id', label: 'Parcel Number', sortable: true },
    {
      key: 'project',
      label: 'Associated Project',
      sortable: true,
      render: (_val: any, row: any) => row.project?.name || 'N/A',
    },
    { key: 'lot_no', label: 'Lot No', sortable: true },
    { key: 'district', label: 'District', sortable: true },
    { key: 'division', label: 'Division', sortable: true },
    { key: 'village', label: 'Village', sortable: true },
    {
      key: 'owners',
      label: 'Owner Name',
      sortable: true,
      render: (_val: any, row: any) => {
        if (row.owners && row.owners.length > 0) {
          return row.owners.map((o: any) => o.name).join(', ');
        }

        return 'N/A';
      },
    },
    {
      key: 'extent_acers',
      label: 'Extent',
      sortable: true,
      render: (_val: any, row: any) =>
        `${row.extent_acers} ac, ${row.extent_perches} per`,
    },
    {
      key: 'remarks',
      label: 'Remarks',
      sortable: true,
      render: (value: string | null) => value || 'N/A',
    },
    {
      key: 'status',
      label: 'Current Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
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
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.visit(`/land-parcels/${row.id}`);
        }}
        className="hover:bg-muted rounded p-1.5 transition-colors"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.visit(`/gis-maps?parcel=${row.id}`);
        }}
        className="hover:bg-muted rounded p-1.5 transition-colors"
        title="View on Map"
      >
        <MapPin className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Land Parcels</h1>
          <p className="text-muted-foreground mt-1">
            Manage land parcel information
          </p>
        </div>
        <button
          onClick={() => {
            router.visit('/land-parcels/create');
          }}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Parcel</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-card border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border">
          Loading land parcels...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={parcels}
          onRowClick={(row) => router.visit(`/land-parcels/${row.id}`)}
          actions={actions}
        />
      )}
    </div>
  );
}

LandParcelList.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
