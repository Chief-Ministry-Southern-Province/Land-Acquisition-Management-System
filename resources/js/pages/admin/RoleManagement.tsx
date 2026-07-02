import {
  X,
  Plus,
  Shield,
  Users,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  Save,
  Info,
} from 'lucide-react';
import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';

type Permission = {
  key: string;
  label: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  color: string;
  permissions: Record<string, boolean>;
};

const PERMISSIONS: Permission[] = [
  { key: 'create', label: 'Create', description: 'Create new records' },
  { key: 'read', label: 'Read', description: 'View records' },
  { key: 'update', label: 'Update', description: 'Edit existing records' },
  { key: 'delete', label: 'Delete', description: 'Remove records' },
  { key: 'approve', label: 'Approve', description: 'Approve workflows' },
  { key: 'export', label: 'Export', description: 'Export data' },
  { key: 'report', label: 'Reports', description: 'Generate reports' },
  { key: 'admin', label: 'Admin', description: 'Admin panel access' },
];

const ROLE_COLORS = [
  'blue',
  'green',
  'purple',
  'orange',
  'cyan',
  'red',
  'pink',
  'indigo',
];

const colorMap: Record<string, string> = {
  blue: 'bg-primary/10 text-primary border-primary/20',
  green: 'bg-secondary/10 text-secondary border-secondary/20',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  orange: 'bg-accent/10 text-accent border-accent/20',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  red: 'bg-destructive/10 text-destructive border-destructive/20',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const dotMap: Record<string, string> = {
  blue: 'bg-primary',
  green: 'bg-secondary',
  purple: 'bg-purple-600',
  orange: 'bg-accent',
  cyan: 'bg-cyan-600',
  red: 'bg-destructive',
  pink: 'bg-pink-600',
  indigo: 'bg-indigo-600',
};

const INITIAL_ROLES: Role[] = [
  {
    id: 'ROL-001',
    name: 'System Administrator',
    description: 'Full system access including admin panel',
    userCount: 2,
    isSystem: true,
    color: 'blue',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: true,
      approve: true,
      export: true,
      report: true,
      admin: true,
    },
  },
  {
    id: 'ROL-002',
    name: 'Assistant Secretary',
    description: 'Approval authority over acquisition processes',
    userCount: 3,
    isSystem: false,
    color: 'purple',
    permissions: {
      create: false,
      read: true,
      update: true,
      delete: false,
      approve: true,
      export: true,
      report: true,
      admin: false,
    },
  },
  {
    id: 'ROL-003',
    name: 'Land Officer',
    description: 'Manage land acquisition and parcel data',
    userCount: 8,
    isSystem: false,
    color: 'green',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: false,
      approve: false,
      export: true,
      report: true,
      admin: false,
    },
  },
  {
    id: 'ROL-004',
    name: 'Valuation Officer',
    description: 'Property valuation and assessment',
    userCount: 5,
    isSystem: false,
    color: 'orange',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: false,
      approve: false,
      export: true,
      report: true,
      admin: false,
    },
  },
  {
    id: 'ROL-005',
    name: 'Survey Officer',
    description: 'Land survey operations and plans',
    userCount: 6,
    isSystem: false,
    color: 'cyan',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: false,
      approve: false,
      export: true,
      report: false,
      admin: false,
    },
  },
  {
    id: 'ROL-006',
    name: 'Legal Officer',
    description: 'Legal cases and documentation',
    userCount: 4,
    isSystem: false,
    color: 'indigo',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: false,
      approve: false,
      export: true,
      report: true,
      admin: false,
    },
  },
  {
    id: 'ROL-007',
    name: 'Finance Officer',
    description: 'Compensation payments and financial management',
    userCount: 5,
    isSystem: false,
    color: 'green',
    permissions: {
      create: true,
      read: true,
      update: true,
      delete: false,
      approve: false,
      export: true,
      report: true,
      admin: false,
    },
  },
  {
    id: 'ROL-008',
    name: 'Data Entry Operator',
    description: 'Data entry and basic documentation',
    userCount: 12,
    isSystem: false,
    color: 'orange',
    permissions: {
      create: true,
      read: true,
      update: false,
      delete: false,
      approve: false,
      export: false,
      report: false,
      admin: false,
    },
  },
  {
    id: 'ROL-009',
    name: 'Read-Only Auditor',
    description: 'View-only access for audit purposes',
    userCount: 3,
    isSystem: false,
    color: 'red',
    permissions: {
      create: false,
      read: true,
      update: false,
      delete: false,
      approve: false,
      export: true,
      report: true,
      admin: false,
    },
  },
];

type FormData = {
  name: string;
  description: string;
  color: string;
  permissions: Record<string, boolean>;
};

const EMPTY_PERM = Object.fromEntries(PERMISSIONS.map((p) => [p.key, false]));
const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  color: 'blue',
  permissions: { ...EMPTY_PERM },
};

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`bg-card border-border relative w-full rounded-xl border shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}
      >
        <div className="border-border bg-card sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4">
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

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>(INITIAL_ROLES[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingMatrix, setEditingMatrix] = useState(false);
  const [matrixDraft, setMatrixDraft] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, permissions: { ...EMPTY_PERM } });
    setErrors({});
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (role: Role) => {
    setForm({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: { ...role.permissions },
    });
    setErrors({});
    setEditingId(role.id);
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) {
      errs.name = 'Role name is required';
    }

    if (!form.description.trim()) {
      errs.description = 'Description is required';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    if (editingId) {
      const updated = roles.map((r) =>
        r.id === editingId ? { ...r, ...form } : r,
      );
      setRoles(updated);

      if (selectedRole.id === editingId) {
        setSelectedRole({ ...selectedRole, ...form });
      }
    } else {
      const newRole: Role = {
        id: `ROL-${String(roles.length + 1).padStart(3, '0')}`,
        name: form.name,
        description: form.description,
        color: form.color,
        userCount: 0,
        isSystem: false,
        permissions: form.permissions,
      };
      setRoles((prev) => [...prev, newRole]);
    }

    setShowModal(false);
  };

  const toggleFormPerm = (key: string) =>
    setForm((f) => ({
      ...f,
      permissions: { ...f.permissions, [key]: !f.permissions[key] },
    }));

  const startEditMatrix = () => {
    const draft: Record<string, Record<string, boolean>> = {};
    roles.forEach((r) => {
      draft[r.id] = { ...r.permissions };
    });
    setMatrixDraft(draft);
    setEditingMatrix(true);
  };

  const saveMatrix = () => {
    setRoles((prev) =>
      prev.map((r) => ({
        ...r,
        permissions: matrixDraft[r.id] ?? r.permissions,
      })),
    );

    if (matrixDraft[selectedRole.id]) {
      setSelectedRole((s) => ({
        ...s,
        permissions: matrixDraft[s.id] ?? s.permissions,
      }));
    }

    setEditingMatrix(false);
  };

  const toggleMatrixPerm = (roleId: string, key: string) => {
    setMatrixDraft((d) => ({
      ...d,
      [roleId]: { ...d[roleId], [key]: !d[roleId][key] },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Role Management</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Configure roles, permissions and access levels
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Role
        </button>
      </div>

      {/* Two-panel layout: role list + detail */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: role cards */}
        <div className="space-y-2">
          <p className="text-muted-foreground mb-3 px-1 text-xs uppercase tracking-wide">
            {roles.length} Roles
          </p>
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                selectedRole.id === role.id
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[role.color]}`}
              >
                <Shield className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{role.name}</p>
                  {role.isSystem && (
                    <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                      System
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {role.userCount} users
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: role detail */}
        <div className="bg-card border-border overflow-hidden rounded-xl border lg:col-span-2">
          {/* Role header */}
          <div
            className={`border-border flex items-start justify-between gap-3 border-b px-6 py-5`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`rounded-xl border p-3 ${colorMap[selectedRole.color]}`}
              >
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3>{selectedRole.name}</h3>
                  {selectedRole.isSystem && (
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                      System Role
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {selectedRole.description}
                </p>
                <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
                  <Users className="h-4 w-4" />
                  <span>
                    {selectedRole.userCount} users assigned to this role
                  </span>
                </div>
              </div>
            </div>
            {!selectedRole.isSystem && (
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  onClick={() => openEdit(selectedRole)}
                  className="border-border hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(selectedRole.id)}
                  className="border-destructive/30 text-destructive hover:bg-destructive/5 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Permissions grid */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
                Permissions
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PERMISSIONS.map((perm) => {
                const granted = selectedRole.permissions[perm.key];

                return (
                  <div
                    key={perm.key}
                    className={`flex items-start gap-2.5 rounded-lg border p-3 ${granted ? 'bg-secondary/5 border-secondary/30' : 'bg-muted/30 border-border'}`}
                  >
                    {granted ? (
                      <CheckSquare className="text-secondary mt-0.5 h-4 w-4 flex-shrink-0" />
                    ) : (
                      <Square className="text-muted-foreground/50 mt-0.5 h-4 w-4 flex-shrink-0" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${granted ? 'text-foreground' : 'text-muted-foreground'}`}
                      >
                        {perm.label}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Full permissions matrix */}
      <div className="bg-card border-border overflow-hidden rounded-xl border">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3>Permissions Matrix</h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Compare and edit permissions across all roles
            </p>
          </div>
          {editingMatrix ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingMatrix(false)}
                className="border-border hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
              <button
                onClick={saveMatrix}
                className="bg-primary hover:bg-primary/90 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white transition-colors"
              >
                <Save className="h-3.5 w-3.5" /> Save Matrix
              </button>
            </div>
          ) : (
            <button
              onClick={startEditMatrix}
              className="border-border hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Permissions
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-border border-b">
              <tr>
                <th className="text-muted-foreground bg-muted/50 sticky left-0 min-w-[180px] px-4 py-3 text-left text-xs uppercase tracking-wide">
                  Role
                </th>
                {PERMISSIONS.map((p) => (
                  <th
                    key={p.key}
                    className="text-muted-foreground min-w-[80px] px-3 py-3 text-center text-xs uppercase tracking-wide"
                    title={p.description}
                  >
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className={`hover:bg-muted/20 transition-colors ${selectedRole.id === role.id ? 'bg-primary/3' : ''}`}
                >
                  <td className="bg-card sticky left-0 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 flex-shrink-0 rounded-full ${dotMap[role.color]}`}
                      />
                      <span className="truncate font-medium">{role.name}</span>
                      {role.isSystem && (
                        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                          Sys
                        </span>
                      )}
                    </div>
                  </td>
                  {PERMISSIONS.map((perm) => {
                    const granted = editingMatrix
                      ? matrixDraft[role.id]?.[perm.key]
                      : role.permissions[perm.key];

                    return (
                      <td key={perm.key} className="px-3 py-3 text-center">
                        {editingMatrix && !role.isSystem ? (
                          <button
                            type="button"
                            onClick={() => toggleMatrixPerm(role.id, perm.key)}
                            className="mx-auto block"
                          >
                            {granted ? (
                              <CheckSquare className="text-secondary h-5 w-5" />
                            ) : (
                              <Square className="text-muted-foreground/40 h-5 w-5" />
                            )}
                          </button>
                        ) : (
                          <span className="flex items-center justify-center">
                            {granted ? (
                              <CheckSquare className="text-secondary h-4 w-4" />
                            ) : (
                              <Square className="text-muted-foreground/30 h-4 w-4" />
                            )}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editingMatrix && (
          <div className="border-border bg-muted/20 text-muted-foreground flex items-center gap-2 border-t px-4 py-3 text-xs">
            <Info className="h-3.5 w-3.5 flex-shrink-0" />
            Click checkboxes to toggle permissions. System roles cannot be
            modified.
          </div>
        )}
      </div>

      {/* Add / Edit role modal */}
      {showModal && (
        <Modal
          title={editingId ? 'Edit Role' : 'Create Role'}
          onClose={() => setShowModal(false)}
          wide
        >
          <div className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">
                  Role Name <span className="text-destructive">*</span>
                </label>
                <input
                  className={`${inputCls} mt-1`}
                  placeholder="e.g. Gazette Officer"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                {errors.name && (
                  <span className="text-destructive text-xs">
                    {errors.name}
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  className={`${inputCls} mt-1 resize-none`}
                  rows={2}
                  placeholder="Brief description of this role's responsibilities"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
                {errors.description && (
                  <span className="text-destructive text-xs">
                    {errors.description}
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Badge Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${dotMap[c]} ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Permissions in modal */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSIONS.map((perm) => {
                  const granted = form.permissions[perm.key];

                  return (
                    <label
                      key={perm.key}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-colors ${granted ? 'bg-secondary/5 border-secondary/30' : 'bg-muted/20 border-border hover:border-muted-foreground/30'}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={granted}
                        onChange={() => toggleFormPerm(perm.key)}
                      />
                      {granted ? (
                        <CheckSquare className="text-secondary h-4 w-4 flex-shrink-0" />
                      ) : (
                        <Square className="text-muted-foreground/50 h-4 w-4 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{perm.label}</p>
                        <p className="text-muted-foreground text-xs">
                          {perm.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border-border flex justify-end gap-2 border-t pt-2">
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
                {editingId ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete Role" onClose={() => setDeleteId(null)}>
          <div className="p-6">
            <p className="text-muted-foreground mb-2 text-sm">
              Delete{' '}
              <strong>{roles.find((r) => r.id === deleteId)?.name}</strong>?
            </p>
            <p className="text-destructive bg-destructive/5 border-destructive/20 mb-5 rounded-lg border p-3 text-xs">
              Warning: {roles.find((r) => r.id === deleteId)?.userCount} user(s)
              are currently assigned this role. They must be reassigned first.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="border-border hover:bg-muted rounded-lg border px-4 py-2 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setRoles((prev) => prev.filter((r) => r.id !== deleteId));

                  if (selectedRole.id === deleteId) {
                    setSelectedRole(INITIAL_ROLES[0]);
                  }

                  setDeleteId(null);
                }}
                disabled={
                  (roles.find((r) => r.id === deleteId)?.userCount ?? 0) > 0
                }
                className="bg-destructive hover:bg-destructive/90 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete Role
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

RoleManagement.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
