import { router } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Info, Save, UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';

export interface RoleOption {
  id: number;
  role_name: string;
  description: string;
}

export interface DepartmentOption {
  id: number;
  department_name: string;
}

export interface AddUserFormValues {
  userName: string;
  username: string;
  role: string;
  department: string;
  email: string;
  password: string;
  confirmPassword: string;
  status: 'Active' | 'Inactive';
}

export interface AddUserFormProps {
  /** Called with the form values when the user submits a valid form */
  onSubmit?: (values: AddUserFormValues) => void;
  /** Called when the user cancels / closes the form */
  onCancel?: () => void;
  /** Whether a submit is currently in progress (disables the form) */
  isSubmitting?: boolean;
}

type FormErrors = Partial<Record<keyof AddUserFormValues, string>>;

const EMPTY_VALUES: AddUserFormValues = {
  userName: '',
  username: '',
  role: '',
  department: '',
  email: '',
  password: '',
  confirmPassword: '',
  status: 'Active',
};

function validate(values: AddUserFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.userName.trim()) {
    errors.userName = 'User name is required.';
  }

  if (!values.username.trim()) {
    errors.username = 'Username is required.';
  } else if (!/^[a-zA-Z0-9._-]{3,}$/.test(values.username.trim())) {
    errors.username =
      'Username must be at least 3 characters (letters, numbers, . _ -).';
  }

  if (!values.role) {
    errors.role = 'Please select a role.';
  }

  if (!values.department) {
    errors.department = 'Please select a department.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

// ── Sub-components ──────────────────────────────────────────────────────────

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
    <div className="border-border mb-5 flex items-start gap-3 border-b pb-3">
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

export default function AddUserForm({
  onSubmit,
  onCancel,
  isSubmitting: isSubmittingProp,
}: AddUserFormProps) {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isSubmitting =
    isSubmittingProp !== undefined ? isSubmittingProp : isSubmittingInternal;

  const [values, setValues] = useState<AddUserFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    let active = true;
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {
          Accept: 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const [rolesRes, deptsRes] = await Promise.all([
          fetch('/api/roles', { headers }),
          fetch('/api/departments', { headers }),
        ]);

        if (!rolesRes.ok || !deptsRes.ok) {
          throw new Error('Failed to fetch roles or departments');
        }

        const rolesData = await rolesRes.json();
        const deptsData = await deptsRes.json();

        if (active) {
          setRoles(rolesData.roles || []);
          setDepartments(deptsData.departments || []);
          setIsLoadingOptions(false);
        }
      } catch (err: any) {
        if (active) {
          setOptionsError(err.message || 'Error loading roles/departments.');
          setIsLoadingOptions(false);
        }
      }
    };

    fetchOptions();

    return () => {
      active = false;
    };
  }, []);

  const handleChange =
    (field: keyof AddUserFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError(null);
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      if (onSubmit) {
        onSubmit(values);

        return;
      }

      setIsSubmittingInternal(true);

      try {
        const token = localStorage.getItem('auth_token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const payload = {
          name: values.userName,
          email: values.email,
          password: values.password,
          password_confirmation: values.confirmPassword,
          department_id: Number(values.department),
          role_id: Number(values.role),
        };

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.errors) {
            const formErrors: FormErrors = {};

            if (data.errors.name) {
              formErrors.userName = data.errors.name[0];
            }

            if (data.errors.email) {
              formErrors.email = data.errors.email[0];
            }

            if (data.errors.password) {
              formErrors.password = data.errors.password[0];
            }

            if (data.errors.department_id) {
              formErrors.department = data.errors.department_id[0];
            }

            if (data.errors.role_id) {
              formErrors.role = data.errors.role_id[0];
            }

            setErrors(formErrors);
          } else {
            setGeneralError(data.message || 'Failed to register user.');
          }

          setIsSubmittingInternal(false);

          return;
        }

        // Successfully registered! Redirect to user management page
        router.visit('/user-management');
      } catch (err: any) {
        setGeneralError(
          err.message || 'A network error occurred. Please try again.',
        );
        setIsSubmittingInternal(false);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.visit('/user-management');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            title="Back to User Management"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1>Add User</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Create a new system user and assign access
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            type="submit"
            form="add-user-form"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Adding...' : 'Add User'}
          </button>
        </div>
      </div>

      {/* ── Form Card ── */}
      <form
        id="add-user-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        {generalError && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
            {generalError}
          </div>
        )}

        {optionsError && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
            {optionsError}
          </div>
        )}

        <div className="bg-card border-border rounded-xl border p-6">
          <SectionHeader
            icon={UserPlus}
            title="User Information"
            subtitle="Basic details and credentials for the new user"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* User Name – full width */}
            <div className="md:col-span-2">
              <Field label="Full Name" required>
                <input
                  id="userName"
                  className={inputCls}
                  type="text"
                  placeholder="e.g. K.P. Silva"
                  value={values.userName}
                  onChange={handleChange('userName')}
                  disabled={isSubmitting}
                />
                {errors.userName && (
                  <span className={errCls}>{errors.userName}</span>
                )}
              </Field>
            </div>

            {/* Username */}
            <Field label="Username" required>
              <input
                id="username"
                className={inputCls}
                type="text"
                placeholder="e.g. kpsilva"
                value={values.username}
                onChange={handleChange('username')}
                disabled={isSubmitting}
              />
              {errors.username && (
                <span className={errCls}>{errors.username}</span>
              )}
            </Field>

            {/* Email */}
            <Field label="Email" required>
              <input
                id="email"
                className={inputCls}
                type="email"
                placeholder="e.g. kpsilva@lams.gov.lk"
                value={values.email}
                onChange={handleChange('email')}
                disabled={isSubmitting}
              />
              {errors.email && <span className={errCls}>{errors.email}</span>}
            </Field>

            {/* Role */}
            <Field label="Role" required>
              <select
                id="role"
                className={inputCls}
                value={values.role}
                onChange={handleChange('role')}
                disabled={isSubmitting || isLoadingOptions}
              >
                <option value="">
                  {isLoadingOptions ? 'Loading roles...' : 'Select role'}
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}{' '}
                    {role.description ? `(${role.description})` : ''}
                  </option>
                ))}
              </select>
              {errors.role && <span className={errCls}>{errors.role}</span>}
            </Field>

            {/* Department */}
            <Field label="Department" required>
              <select
                id="department"
                className={inputCls}
                value={values.department}
                onChange={handleChange('department')}
                disabled={isSubmitting || isLoadingOptions}
              >
                <option value="">
                  {isLoadingOptions
                    ? 'Loading departments...'
                    : 'Select department'}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <span className={errCls}>{errors.department}</span>
              )}
            </Field>

            {/* Password */}
            <Field
              label="Password"
              required
              hint="Must be at least 8 characters"
            >
              <div className="relative">
                <input
                  id="password"
                  className={`${inputCls} pr-10`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={values.password}
                  onChange={handleChange('password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className={errCls}>{errors.password}</span>
              )}
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" required>
              <input
                id="confirmPassword"
                className={inputCls}
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={values.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className={errCls}>{errors.confirmPassword}</span>
              )}
            </Field>

            {/* Status – full width */}
            <div className="md:col-span-2">
              <Field label="Status">
                <div className="mt-1 flex items-center gap-5">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={values.status === 'Active'}
                      onChange={() =>
                        setValues((prev) => ({ ...prev, status: 'Active' }))
                      }
                      className="text-primary focus:ring-primary h-4 w-4"
                      disabled={isSubmitting}
                    />
                    <span className="bg-success/10 text-success inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      Active
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={values.status === 'Inactive'}
                      onChange={() =>
                        setValues((prev) => ({ ...prev, status: 'Inactive' }))
                      }
                      className="text-primary focus:ring-primary h-4 w-4"
                      disabled={isSubmitting}
                    />
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      Inactive
                    </span>
                  </label>
                </div>
              </Field>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

AddUserForm.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
