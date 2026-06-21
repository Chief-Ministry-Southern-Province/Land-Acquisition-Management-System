import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, User, Mail, ShieldAlert } from 'lucide-react';
import React from 'react';
import MainLayout from '@/layouts/MainLayout';

interface Employee {
  id: number;
  name: string;
  email: string;
  designation: string;
  created_at?: string;
  updated_at?: string;
}

export default function Show({ employee }: { employee: Employee }) {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
      router.delete(`/employees/${employee.id}`);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className="hover:bg-muted rounded-lg p-2 transition-colors text-foreground"
            title="Back to Employees"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Employee Details</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              View comprehensive records for this system employee
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.visit(`/employees/${employee.id}/edit`)}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
          >
            <Edit className="h-4 w-4" /> Edit Employee
          </button>
          <button
            onClick={handleDelete}
            className="hover:bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full shrink-0">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-4 flex-1 w-full">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{employee.name}</h2>
              <p className="text-muted-foreground text-sm">{employee.designation}</p>
            </div>

            <hr className="border-border" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-lg text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Email Address</p>
                  <a href={`mailto:${employee.email}`} className="text-sm hover:underline text-foreground">
                    {employee.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-lg text-muted-foreground">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Employee ID</p>
                  <p className="text-sm font-semibold text-foreground">EMP-{String(employee.id).padStart(4, '0')}</p>
                </div>
              </div>
            </div>

            {(employee.created_at || employee.updated_at) && (
              <>
                <hr className="border-border" />
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  {employee.created_at && (
                    <p>
                      Created at: <span className="text-foreground">{new Date(employee.created_at).toLocaleString()}</span>
                    </p>
                  )}
                  {employee.updated_at && (
                    <p>
                      Last updated: <span className="text-foreground">{new Date(employee.updated_at).toLocaleString()}</span>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Show.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
