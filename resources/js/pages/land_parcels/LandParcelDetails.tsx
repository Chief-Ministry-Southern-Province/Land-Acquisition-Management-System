import { Link } from '@inertiajs/react';
import { ArrowLeft, Download, MapPin } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';

export default function LandParcelDetails() {
  const parcel = {
    id: 'PCL-8934',
    surveyNo: '123/4A',
    district: 'Galle',
    division: 'Galle Four Gravets',
    village: 'Unawatuna',
    extent: '2.5 acres',
    boundaries:
      'North: Road Reserve, South: PCL-8933, East: River, West: PCL-8935',
    landUse: 'Agricultural',
    status: 'Acquired',
  };

  const owners = [
    {
      name: 'W.A. Perera',
      nic: '722345678V',
      share: '100%',
      type: 'Full Owner',
    },
  ];

  const structures = [
    {
      type: 'Residential Building',
      area: '1,200 sq ft',
      condition: 'Good',
      value: '₨ 5,000,000',
    },
    {
      type: 'Boundary Wall',
      length: '150 ft',
      condition: 'Fair',
      value: '₨ 300,000',
    },
  ];

  const crops = [
    {
      type: 'Coconut Trees',
      quantity: 25,
      age: '15 years',
      value: '₨ 250,000',
    },
    { type: 'Mango Trees', quantity: 12, age: '8 years', value: '₨ 120,000' },
    { type: 'Banana Plants', quantity: 50, age: '2 years', value: '₨ 50,000' },
  ];

  const history = [
    {
      date: '2024-05-15',
      event: 'Status changed to Acquired',
      user: 'Land Officer',
    },
    {
      date: '2024-04-20',
      event: 'Valuation completed',
      user: 'Valuation Officer',
    },
    { date: '2024-03-10', event: 'Survey completed', user: 'Survey Officer' },
    {
      date: '2024-02-05',
      event: 'Parcel registered',
      user: 'Data Entry Operator',
    },
  ];

  const documents = [
    { name: 'Survey Plan', type: 'PDF', date: '2024-03-10' },
    { name: 'Valuation Report', type: 'PDF', date: '2024-04-20' },
    { name: 'Ownership Certificate', type: 'PDF', date: '2024-02-05' },
    { name: 'Site Photographs', type: 'ZIP', date: '2024-03-10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/parcels"
            className="hover:bg-muted rounded-lg p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1>Parcel {parcel.id}</h1>
              <StatusBadge status={parcel.status.toLowerCase()} />
            </div>
            <p className="text-muted-foreground">
              Survey No: {parcel.surveyNo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors">
            <MapPin className="h-4 w-4" />
            <span>View on Map</span>
          </button>
          <button className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Parcel Information</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">District:</dt>
              <dd>{parcel.district}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Division:</dt>
              <dd>{parcel.division}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Village:</dt>
              <dd>{parcel.village}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Extent:</dt>
              <dd>{parcel.extent}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Land Use:</dt>
              <dd>{parcel.landUse}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Boundaries:</dt>
              <dd className="text-right">{parcel.boundaries}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Ownership</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Owner Name' },
              { key: 'nic', label: 'NIC' },
              { key: 'share', label: 'Share' },
              { key: 'type', label: 'Type' },
            ]}
            data={owners}
            searchable={false}
            filterable={false}
            exportable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Structures</h3>
          <DataTable
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'area', label: 'Area/Length' },
              { key: 'condition', label: 'Condition' },
              { key: 'value', label: 'Estimated Value' },
            ]}
            data={structures}
            searchable={false}
            filterable={false}
            exportable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Trees and Crops</h3>
          <DataTable
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'age', label: 'Age' },
              { key: 'value', label: 'Estimated Value' },
            ]}
            data={crops}
            searchable={false}
            filterable={false}
            exportable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">Documents</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Document Name' },
              { key: 'type', label: 'Type' },
              { key: 'date', label: 'Date' },
            ]}
            data={documents}
            searchable={false}
            filterable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">History</h3>
          <DataTable
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'event', label: 'Event' },
              { key: 'user', label: 'User' },
            ]}
            data={history}
            searchable={false}
            filterable={false}
            exportable={false}
          />
        </div>
      </div>
    </div>
  );
}

LandParcelDetails.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
