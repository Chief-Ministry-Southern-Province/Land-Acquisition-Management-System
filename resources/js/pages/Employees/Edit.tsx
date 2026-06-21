import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserCog, X, Info } from 'lucide-react';
import React from 'react';
import MainLayout from '@/layouts/MainLayout';

interface Employee {
  id: number;
  name: string;
  email: string;
  designation: string;
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-border pb-3 mb-5 flex items-start gap-3">
      <div className="bg-primary/10 mt-0.5 rounded-lg p-2">
        <Icon className="text-primary h-4 w-4" />
      </div>
      <div>
        <h3 className="text-foreground text-sm font-semibold uppercase tracking-wide">
          {title}
        </h3>
        {subtitle && (
          <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-foreground flex items-center gap-1 text-sm font-medium">
        {label}
        {required && <span className="text-destructive">*</span>}
        {hint && (
          <span title={hint} className="text-muted-foreground cursor-help">
            <Info className="h-3.5 w-3.5" />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors';
const errCls = 'text-xs text-destructive mt-0.5';

export default function Edit({ employee }: { employee: Employee }) {
  const { data, setData, put, processing, errors } = useForm({
    name: employee.name,
    email: employee.email,
    designation: employee.designation,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/employees/${employee.id}`);
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
            <h1 className="text-2xl font-bold tracking-tight">Edit Employee</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Update the profile and professional designation of this employee
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/employees"
            className="border border-border hover:bg-muted flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-foreground transition-colors"
          >
            <X className="h-4 w-4" /> Cancel
          </Link>
          <button
            type="submit"
            form="edit-employee-form"
            disabled={processing}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {processing ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Form Card */}
      <form
        id="edit-employee-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        <div className="bg-card border border-border rounded-xl p-6">
          <SectionHeader
            icon={UserCog}
            title="Edit Employee Details"
            subtitle="Modify contact information and professional role details"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Full Name */}
            <div className="md:col-span-2">
              <Field label="Full Name" required>
                <input
                  id="name"
                  className={inputCls}
                  type="text"
                  placeholder="e.g. K.P. Silva"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  disabled={processing}
                />
                {errors.name && (
                  <span className={errCls}>{errors.name}</span>
                )}
              </Field>
            </div>

            {/* Email */}
            <Field label="Email Address" required>
              <input
                id="email"
                className={inputCls}
                type="email"
                placeholder="e.g. kpsilva@lams.gov.lk"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                disabled={processing}
              />
              {errors.email && (
                <span className={errCls}>{errors.email}</span>
              )}
            </Field>

            {/* Designation */}
            <Field label="Designation" required>
              <input
                id="designation"
                className={inputCls}
                type="text"
                placeholder="e.g. Land Acquisition Officer"
                value={data.designation}
                onChange={(e) => setData('designation', e.target.value)}
                disabled={processing}
              />
              {errors.designation && (
                <span className={errCls}>{errors.designation}</span>
              )}
            </Field>
          </div>
        </div>
      </form>
    </div>
  );
}

Edit.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
