import {
  Building2,
  CheckCircle,
  Edit2,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/services/departmentManagement';
import type { Department } from '@/services/departmentManagement';

const EMPTY_DEP: Omit<Department, 'id'> = {
  name: '',
  code: '',
  head: '',
  email: '',
  phone: '',
  status: 'active',
  userCount: 0,
};

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-card border-border relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border shadow-2xl">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            className="hover:bg-muted rounded-lg p-1.5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Department, 'id'>>(EMPTY_DEP);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.head.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(EMPTY_DEP);
    setErrors({});
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (dep: Department) => {
    setForm({
      name: dep.name,
      code: dep.code,
      head: dep.head,
      email: dep.email,
      phone: dep.phone,
      status: dep.status,
      userCount: dep.userCount,
    });
    setErrors({});
    setEditingId(dep.id);
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) {
      errs.name = 'Department name is required';
    }

    if (!form.code.trim()) {
      errs.code = 'Department code is required';
    }

    if (!form.head.trim()) {
      errs.head = 'Department head is required';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      if (editingId) {
        const updated = await updateDepartment(editingId, form);
        setDepartments((prev) =>
          prev.map((d) => (d.id === editingId ? updated : d)),
        );
      } else {
        const created = await createDepartment(form);
        setDepartments((prev) => [...prev, created]);
      }

      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to save department:', error);

      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, val]) => {
          let fieldName = key;

          if (key === 'department_name') {
            fieldName = 'name';
          }

          if (key === 'dep_code') {
            fieldName = 'code';
          }

          if (key === 'dep_head') {
            fieldName = 'head';
          }

          if (Array.isArray(val) && val.length > 0) {
            backendErrors[fieldName] = val[0];
          }
        });
        setErrors(backendErrors);
      } else if (error.response?.data?.message) {
        setErrors({ name: error.response.data.message });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  const set =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const activeDeps = departments.filter((d) => d.status === 'active').length;
  const totalUsers = departments.reduce((s, d) => s + d.userCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Department Management</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Manage organisational departments and their heads
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4">
          <div className="bg-primary/10 rounded-xl p-3">
            <Building2 className="text-primary h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Total Departments
            </p>
            <p className="text-2xl font-semibold">{departments.length}</p>
          </div>
        </div>
        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4">
          <div className="bg-secondary/10 rounded-xl p-3">
            <CheckCircle className="text-secondary h-5 w-5" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Active
            </p>
            <p className="text-2xl font-semibold">{activeDeps}</p>
          </div>
        </div>
        <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4">
          <div className="rounded-xl bg-cyan-100 p-3">
            <Users className="h-5 w-5 text-cyan-700" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Total Staff
            </p>
            <p className="text-2xl font-semibold">{totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <input
          className={`${inputCls} pl-9`}
          placeholder="Search departments…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card border-border overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-border border-b">
              <tr>
                {[
                  'Dept. ID',
                  'Name',
                  'Code',
                  'Head of Department',
                  'Email',
                  'Phone',
                  'Staff',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-muted-foreground whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-muted-foreground px-4 py-10 text-center text-sm"
                  >
                    Loading departments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-muted-foreground px-4 py-10 text-center text-sm"
                  >
                    No departments found.
                  </td>
                </tr>
              ) : (
                filtered.map((dep) => (
                  <tr
                    key={dep.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="text-muted-foreground px-4 py-3 font-mono text-sm">
                      {dep.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{dep.name}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Staff Members: {dep.userCount}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
                        {dep.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{dep.head}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {dep.email}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {dep.phone}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {dep.userCount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${dep.status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}`}
                      >
                        {dep.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(dep)}
                          className="hover:bg-muted rounded p-1.5 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(dep.id)}
                          className="hover:bg-destructive/10 text-destructive rounded p-1.5 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      {showModal && (
        <Modal
          title={editingId ? 'Edit Department' : 'Add Department'}
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Department Name" required>
                  <input
                    className={inputCls}
                    placeholder="e.g. Survey Division"
                    value={form.name}
                    onChange={set('name')}
                  />
                  {errors.name && (
                    <span className="text-destructive text-xs">
                      {errors.name}
                    </span>
                  )}
                </Field>
              </div>
              <Field label="Department Code" required>
                <input
                  className={`${inputCls} uppercase`}
                  placeholder="e.g. SD"
                  value={form.code}
                  onChange={set('code')}
                  maxLength={5}
                />
                {errors.code && (
                  <span className="text-destructive text-xs">
                    {errors.code}
                  </span>
                )}
              </Field>
              <Field label="Status">
                <select
                  className={inputCls}
                  value={form.status}
                  onChange={set('status')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
              <Field label="Head of Department" required>
                <input
                  className={inputCls}
                  placeholder="Full name"
                  value={form.head}
                  onChange={set('head')}
                />
                {errors.head && (
                  <span className="text-destructive text-xs">
                    {errors.head}
                  </span>
                )}
              </Field>
              <Field label="Email">
                <input
                  className={inputCls}
                  type="email"
                  placeholder="dept@lams.gov.lk"
                  value={form.email}
                  onChange={set('email')}
                />
              </Field>
              <div className="col-span-2">
                <Field label="Phone">
                  <input
                    className={inputCls}
                    type="tel"
                    placeholder="+94 11 234 5678"
                    value={form.phone}
                    onChange={set('phone')}
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Staff Members">
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="e.g. 10"
                    value={form.userCount}
                    onChange={set('userCount')}
                    min={0}
                  />
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
              >
                <Save className="h-4 w-4" />{' '}
                {editingId ? 'Save Changes' : 'Add Department'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Confirm Delete" onClose={() => setDeleteId(null)}>
          <div className="p-6">
            <p className="text-muted-foreground mb-5 text-sm">
              Are you sure you want to delete{' '}
              <strong>
                {departments.find((d) => d.id === deleteId)?.name}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="border-border hover:bg-muted rounded-lg border px-4 py-2 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="bg-destructive hover:bg-destructive/90 rounded-lg px-4 py-2 text-sm text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

DepartmentManagement.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
