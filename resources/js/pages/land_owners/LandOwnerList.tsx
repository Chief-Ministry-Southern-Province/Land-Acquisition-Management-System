import { router } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import MainLayout from '@/layouts/MainLayout';

export default function LandOwnerList() {
  const owners = [
    {
      id: 'OWN-1247',
      name: 'W.A. Perera',
      nic: '722345678V',
      contact: '+94 71 234 5678',
      address: '123, Galle Road, Unawatuna',
      parcels: 2,
    },
    {
      id: 'OWN-1248',
      name: 'S.M. Fernando',
      nic: '801234567V',
      contact: '+94 77 345 6789',
      address: '45, Main Street, Galle',
      parcels: 1,
    },
    {
      id: 'OWN-1249',
      name: 'R.K. Silva',
      nic: '691234567V',
      contact: '+94 76 456 7890',
      address: '78, Beach Road, Habaraduwa',
      parcels: 1,
    },
    {
      id: 'OWN-1250',
      name: 'A.P. Jayawardena',
      nic: '851234567V',
      contact: '+94 75 567 8901',
      address: '12, Temple Road, Matara',
      parcels: 3,
    },
    {
      id: 'OWN-1251',
      name: 'K.D. Wijesinghe',
      nic: '771234567V',
      contact: '+94 72 678 9012',
      address: '56, Station Road, Tangalle',
      parcels: 2,
    },
  ];

  const columns = [
    { key: 'id', label: 'Owner ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'nic', label: 'NIC', sortable: true },
    { key: 'contact', label: 'Contact Number', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'parcels', label: 'Parcel Count', sortable: true },
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
        {/* <button className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors">
          <Plus className="h-5 w-5" />
          <span>Add Owner</span>
        </button> */}
        {/*REMOVE: doesn't need*/}
      </div>

      <DataTable
        columns={columns}
        data={owners}
        onRowClick={(row) => router.visit(`/land-owners/${row.id}`)}
        actions={actions}
      />
    </div>
  );
}

LandOwnerList.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
