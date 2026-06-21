import { router } from '@inertiajs/react';
import { Edit, Plus, Trash2, Eye } from 'lucide-react';
import React from 'react';
import { DataTable } from '@/components/ui/DataTable';
import MainLayout from '@/layouts/MainLayout';

interface Employee {
  id: number;
  name: string;
  email: string;
  designation: string;
  created_at?: string;
}

export default function Index({ employees }: { employees: Employee[] }) {
  const columns = [
    { key: 'id', label: 'Employee ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'designation', label: 'Designation', sortable: true },
  ];

  const actions = (row: Employee) => (
    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => router.visit(`/employees/${row.id}`)}
        className="hover:bg-muted rounded p-1.5 transition-colors text-muted-foreground hover:text-foreground"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={() => router.visit(`/employees/${row.id}/edit`)}
        className="hover:bg-muted rounded p-1.5 transition-colors text-primary hover:text-primary/80"
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          if (confirm(`Are you sure you want to delete ${row.name}?`)) {
            router.delete(`/employees/${row.id}`);
          }
        }}
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
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground mt-1">
            Manage system employees, designations, and contact details
          </p>
        </div>
        <div>
          <button
            onClick={() => router.visit('/employees/create')}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        actions={actions}
        onRowClick={(row) => router.visit(`/employees/${row.id}`)}
      />
    </div>
  );
}

Index.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;