import { router } from '@inertiajs/react';
import { ArrowLeft, Info, Save, UserPlus, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { register } from '@/services/authService';
import { getDepartments } from '@/services/departmentManagementService';
import { getRoles } from '@/services/roleManagementService';
import type { Role } from '@/services/roleManagementService';
import { updateUser } from '@/services/userManagementService';

export interface DepartmentOption {
  id: number;
  department_name: string;
}

export interface AddUserFormValues {
  userName: string;
  phone: string;
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
  /** User data to edit if in edit mode */
  userToEdit?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role_id: number;
    department_id: number;
    status: string;
  };
}

type FormErrors = Partial<Record<keyof AddUserFormValues, string>>;

const EMPTY_VALUES: AddUserFormValues = {
  userName: '',
  phone: '',
  role: '',
  department: '',
  email: '',
  password: '',
  confirmPassword: '',
  status: 'Active',
};

function validate(values: AddUserFormValues, t: any): FormErrors {
  const errors: FormErrors = {};

  if (!values.userName.trim()) {
    errors.userName = t('err_user_name_required', 'User name is required.');
  }

  if (values.phone.trim() && !/^\+?[0-9\s-]{7,15}$/.test(values.phone.trim())) {
    errors.phone = t(
      'err_phone_invalid',
      'Please enter a valid phone number (e.g. +94771234567 or 0771234567).',
    );
  }

  if (!values.role) {
    errors.role = t('err_select_role', 'Please select a role.');
  }

  if (!values.department) {
    errors.department = t(
      'err_select_department',
      'Please select a department.',
    );
  }

  if (!values.email.trim()) {
    errors.email = t('err_email_required', 'Email is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = t('err_email_invalid', 'Enter a valid email address.');
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
  userToEdit,
}: AddUserFormProps) {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isSubmitting =
    isSubmittingProp !== undefined ? isSubmittingProp : isSubmittingInternal;

  const isEditMode = !!userToEdit;

  const [values, setValues] = useState<AddUserFormValues>(() => {
    if (userToEdit) {
      return {
        userName: userToEdit.name,
        phone: userToEdit.phone || '',
        role: String(userToEdit.role_id),
        department: String(userToEdit.department_id),
        email: userToEdit.email,
        password: '',
        confirmPassword: '',
        status:
          userToEdit.status === 'active' || userToEdit.status === 'Active'
            ? 'Active'
            : 'Inactive',
      };
    }

    return EMPTY_VALUES;
  });
  const [errors, setErrors] = useState<FormErrors>({});

  React.useEffect(() => {
    let active = true;
    const fetchOptions = async () => {
      try {
        const [rolesList, deptsList] = await Promise.all([
          getRoles(),
          getDepartments(),
        ]);

        if (active) {
          setRoles(rolesList);
          const mappedDepts = deptsList.map((dept) => ({
            id: Number(dept.id),
            department_name: dept.name,
          }));
          setDepartments(mappedDepts);
          setIsLoadingOptions(false);
        }
      } catch (err: any) {
        if (active) {
          setOptionsError(
            err.message ||
              t('err_loading_options', 'Error loading roles/departments.'),
          );
          setIsLoadingOptions(false);
        }
      }
    };

    fetchOptions();

    return () => {
      active = false;
    };
  }, [t]);

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
    const validationErrors = validate(values, t);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      if (onSubmit) {
        onSubmit(values);

        return;
      }

      setIsSubmittingInternal(true);

      try {
        const payload = {
          name: values.userName,
          email: values.email,
          phone: values.phone.trim() || undefined,
          department_id: Number(values.department),
          role_id: Number(values.role),
        };

        if (isEditMode) {
          await updateUser(userToEdit.id, payload);
          router.visit('/user-management');
        } else {
          await register(payload);
          router.visit('/user-management');
        }
      } catch (err: any) {
        if (err.response) {
          const data = err.response.data;

          if (data.errors) {
            const formErrors: FormErrors = {};

            if (data.errors.name) {
              formErrors.userName = data.errors.name[0];
            }

            if (data.errors.email) {
              formErrors.email = data.errors.email[0];
            }

            if (data.errors.phone) {
              formErrors.phone = data.errors.phone[0];
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
            setGeneralError(
              data.message ||
                (isEditMode
                  ? t('toast_failed_user_update', 'Failed to update user.')
                  : t(
                      'toast_failed_user_registration',
                      'Failed to register user.',
                    )),
            );
          }
        } else {
          setGeneralError(
            err.message ||
              t(
                'toast_network_error',
                'A network error occurred. Please try again.',
              ),
          );
        }

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
            title={t('back_to_user_mgmt', 'Back to User Management')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1>
              {isEditMode
                ? t('edit_user', 'Edit User')
                : t('add_user', 'Add User')}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {isEditMode
                ? t(
                    'edit_user_subtitle',
                    'Update system user details and access',
                  )
                : t(
                    'add_user_subtitle',
                    'Create a new system user and assign access',
                  )}
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
            <X className="h-4 w-4" /> {t('cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            form="add-user-form"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting
              ? isEditMode
                ? t('saving', 'Saving...')
                : t('adding', 'Adding...')
              : isEditMode
                ? t('save_changes', 'Save Changes')
                : t('add_user', 'Add User')}
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
            title={t('user_information', 'User Information')}
            subtitle={
              isEditMode
                ? t('edit_user_info_subtitle', 'Basic details for the user')
                : t(
                    'add_user_info_subtitle',
                    'Basic details and credentials for the new user',
                  )
            }
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* User Name – full width */}
            <div className="md:col-span-2">
              <Field label={t('full_name', 'Full Name')} required>
                <input
                  id="userName"
                  className={inputCls}
                  type="text"
                  placeholder={t('full_name_placeholder', 'e.g. K.P. Silva')}
                  value={values.userName}
                  onChange={handleChange('userName')}
                  disabled={isSubmitting}
                />
                {errors.userName && (
                  <span className={errCls}>{errors.userName}</span>
                )}
              </Field>
            </div>

            {/* Phone Number */}
            <Field
              label={t('phone_number', 'Phone Number')}
              hint={t('hint_phone_sms', 'Used for receiving SMS notifications')}
            >
              <input
                id="phone"
                className={inputCls}
                type="tel"
                placeholder={t(
                  'phone_placeholder',
                  'e.g. +94771234567 or 0771234567',
                )}
                value={values.phone}
                onChange={handleChange('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && <span className={errCls}>{errors.phone}</span>}
            </Field>

            {/* Email */}
            <Field label={t('email', 'Email')} required>
              <input
                id="email"
                className={inputCls}
                type="email"
                placeholder={t('email_placeholder', 'e.g. kpsilva@lams.gov.lk')}
                value={values.email}
                onChange={handleChange('email')}
                disabled={isSubmitting}
              />
              {errors.email && <span className={errCls}>{errors.email}</span>}
            </Field>

            {/* Role */}
            <Field label={t('role', 'Role')} required>
              <select
                id="role"
                className={inputCls}
                value={values.role}
                onChange={handleChange('role')}
                disabled={isSubmitting || isLoadingOptions}
              >
                <option value="">
                  {isLoadingOptions
                    ? t('loading_roles', 'Loading roles...')
                    : t('select_role', 'Select role')}
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
            <Field label={t('department', 'Department')} required>
              <select
                id="department"
                className={inputCls}
                value={values.department}
                onChange={handleChange('department')}
                disabled={isSubmitting || isLoadingOptions}
              >
                <option value="">
                  {isLoadingOptions
                    ? t('loading_departments', 'Loading departments...')
                    : t('select_department', 'Select department')}
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

            {!isEditMode && (
              <div className="border-primary/20 bg-primary/5 text-foreground flex items-center gap-3 rounded-lg border p-4 md:col-span-2">
                <Info className="text-primary h-5 w-5 shrink-0" />
                <p className="text-xs font-medium">
                  {t(
                    'auto_password_notice',
                    'A random login password will be generated automatically and sent to the user via email.',
                  )}
                </p>
              </div>
            )}

            {/* Status – full width */}
            <div className="md:col-span-2">
              <Field label={t('status', 'Status')}>
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
                      {t('active', 'Active')}
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
                      {t('inactive', 'Inactive')}
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
