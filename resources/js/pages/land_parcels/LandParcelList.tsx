import { router } from '@inertiajs/react';
import { Eye, MapPin, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';

export default function LandParcelList() {
  const parcels = [
    {
      id: 'PCL-8934',
      surveyNo: '123/4A',
      district: 'Galle',
      division: 'Galle Four Gravets',
      village: 'Unawatuna',
      extent: '2.5 acres',
      status: 'acquired',
    },
    {
      id: 'PCL-8935',
      surveyNo: '124/1B',
      district: 'Galle',
      division: 'Galle Four Gravets',
      village: 'Galle',
      extent: '1.8 acres',
      status: 'in-progress',
    },
    {
      id: 'PCL-8936',
      surveyNo: '125/3',
      district: 'Galle',
      division: 'Habaraduwa',
      village: 'Habaraduwa',
      extent: '3.2 acres',
      status: 'pending',
    },
    {
      id: 'PCL-8937',
      surveyNo: '89/2C',
      district: 'Hambantota',
      division: 'Tangalle',
      village: 'Tangalle',
      extent: '4.1 acres',
      status: 'active',
    },
    {
      id: 'PCL-8938',
      surveyNo: '156/7',
      district: 'Colombo',
      division: 'Dehiwala',
      village: 'Mount Lavinia',
      extent: '1.2 acres',
      status: 'completed',
    },
    {
      id: 'PCL-8939',
      surveyNo: '234/5B',
      district: 'Kandy',
      division: 'Kandy Central',
      village: 'Peradeniya',
      extent: '2.8 acres',
      status: 'active',
    },
    {
      id: 'PCL-8940',
      surveyNo: '78/3A',
      district: 'Jaffna',
      division: 'Jaffna',
      village: 'Nallur',
      extent: '3.5 acres',
      status: 'pending',
    },
  ];

  const columns = [
    { key: 'id', label: 'Parcel Number', sortable: true },
    { key: 'surveyNo', label: 'Survey Plan No', sortable: true },
    { key: 'district', label: 'District', sortable: true },
    { key: 'division', label: 'Division', sortable: true },
    { key: 'village', label: 'Village', sortable: true },
    { key: 'extent', label: 'Extent', sortable: true },
    {
      key: 'status',
      label: 'Current Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  const actions = (row: any) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.visit(`/parcels/${row.id}`); //IMPLEMENT
        }}
        className="hover:bg-muted rounded p-1.5 transition-colors"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.visit(`/gis?parcel=${row.id}`); //IMPLEMENT
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
            router.visit('land-parcels/create');
          }}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Parcel</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={parcels}
        onRowClick={(row) => router.visit(`/land-parcels/${row.id}`)} //IMPLEMENT
        actions={actions}
      />
    </div>
  );
}

LandParcelList.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
