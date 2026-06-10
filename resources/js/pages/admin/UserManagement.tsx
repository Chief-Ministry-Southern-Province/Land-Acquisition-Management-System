import { router } from '@inertiajs/react';
import { Edit, Plus, Shield, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';

export default function UserManagement() {
  const users = [
    {
      id: 'USR-001',
      name: 'Admin User',
      username: 'admin',
      role: 'System Administrator',
      department: 'IT',
      email: 'admin@lams.gov.lk',
      status: 'active',
    },
    {
      id: 'USR-002',
      name: 'K.P. Silva',
      username: 'kpsilva',
      role: 'Land Officer',
      department: 'Land Administration',
      email: 'kpsilva@lams.gov.lk',
      status: 'active',
    },
    {
      id: 'USR-003',
      name: 'P.K. Bandara',
      username: 'pkbandara',
      role: 'Survey Officer',
      department: 'Survey',
      email: 'pkbandara@lams.gov.lk',
      status: 'active',
    },
    {
      id: 'USR-004',
      name: 'K.P. Jayasuriya',
      username: 'kpjayasuriya',
      role: 'Valuation Officer',
      department: 'Valuation',
      email: 'kpjayasuriya@lams.gov.lk',
      status: 'active',
    },
    {
      id: 'USR-005',
      name: 'S.A. Fernando',
      username: 'safernando',
      role: 'Legal Officer',
      department: 'Legal',
      email: 'safernando@lams.gov.lk',
      status: 'active',
    },
    {
      id: 'USR-006',
      name: 'R.D. Silva',
      username: 'rdsilva',
      role: 'Finance Officer',
      department: 'Finance',
      email: 'rdsilva@lams.gov.lk',
      status: 'active',
    },
    {
      id: 'USR-007',
      name: 'M.A. Perera',
      username: 'maperera',
      role: 'Data Entry Operator',
      department: 'Administration',
      email: 'maperera@lams.gov.lk',
      status: 'inactive',
    },
  ];

  const columns = [
    { key: 'id', label: 'User ID', sortable: true },
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'username', label: 'Username', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  const actions = (row: any) => (
    <div className="flex items-center justify-end gap-2">
      <button
        className="hover:bg-muted rounded p-1.5 transition-colors"
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        className="hover:bg-destructive/10 text-destructive rounded p-1.5 transition-colors"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and access
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.visit('/users-management')}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors"
          >
            <Shield className="h-5 w-5" />
            <span>Manage Roles</span>
          </button>
          <button className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={users} actions={actions} />
    </div>
  );
}

UserManagement.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
