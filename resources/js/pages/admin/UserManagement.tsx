import { router } from '@inertiajs/react';
import { Edit, Plus, Shield, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { SyncLoader } from 'react-spinners';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';
import {
  deleteUser,
  getAllUsers,
  updateUser,
} from '@/services/userManagementService';
import AddUserForm from './AddUserForm';

interface UserData {
  id: number;
  name: string;
  email: string;
  role?: {
    id: number;
    role_name: string;
  };
  department?: {
    id: number;
    department_name: string;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllUsers();
      const rawUsers: UserData[] = data.users || [];
      const mapped = rawUsers.map((u: any) => ({
        id: `USR-${String(u.id).padStart(3, '0')}`,
        name: u.name,
        username: u.email.split('@')[0],
        role: u.role?.role_name || 'N/A',
        department: u.department?.department_name || 'N/A',
        email: u.email,
        status: 'active',
        rawId: u.id,
        roleId: u.role?.id || 0,
        departmentId: u.department?.id || 0,
      }));
      setUsers(mapped);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading users.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      await Promise.resolve();

      if (active) {
        await fetchUsers();
      }
    };
    init();

    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (rawId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setError(null);
      await deleteUser(rawId);
      setUsers((prev) => prev.filter((u) => u.rawId !== rawId));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete user.');
    }
  };

  const handleUpdate = (row: any) => {
    setEditingUser(row);
  };

  const handleUpdateSubmit = async (values: any) => {
    if (!editingUser) {
      return;
    }

    try {
      setError(null);
      const payload = {
        name: values.userName,
        email: values.email,
        role_id: Number(values.role),
        department_id: Number(values.department),
      };
      await updateUser(editingUser.rawId, payload);
      await fetchUsers();
      setEditingUser(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update user.');
    }
  };

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
        onClick={() => handleUpdate(row)}
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        className="hover:bg-destructive/10 text-destructive rounded p-1.5 transition-colors"
        title="Delete"
        onClick={() => handleDelete(row.rawId)}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  if (editingUser) {
    const userToEdit = {
      id: editingUser.rawId,
      name: editingUser.name,
      email: editingUser.email,
      role_id: editingUser.roleId,
      department_id: editingUser.departmentId,
      status: editingUser.status,
    };

    return (
      <AddUserForm
        userToEdit={userToEdit}
        onCancel={() => setEditingUser(null)}
        onSubmit={handleUpdateSubmit}
      />
    );
  }

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
          <button
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
            onClick={() => router.visit('/user-management/add')}
          >
            <Plus className="h-5 w-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-muted-foreground flex h-40 items-center justify-center gap-3 text-lg">
          <SyncLoader size={14} color="#494949" />
          <span>Loading users</span>
        </div>
      ) : (
        <DataTable columns={columns} data={users} actions={actions} />
      )}
    </div>
  );
}

UserManagement.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
