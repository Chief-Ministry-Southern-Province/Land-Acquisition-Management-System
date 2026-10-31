import { Bell, Lock, Save, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/hooks/useTranslation';
import {
  changePassword,
  getCurrentUser,
  updateNotificationPreference,
  updateProfile,
} from '@/services/authService';

type NotificationPreference = 'email' | 'sms' | 'both' | 'none';

interface AdminAccountSettingsProps {
  showToast: (type: 'success' | 'error', text: string) => void;
}

const inputCls =
  'w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-70';

function errorMessage(error: any, fallback: string): string {
  const errors = error.response?.data?.errors;

  if (errors) {
    return Object.values(errors).flat()[0] as string;
  }

  return error.response?.data?.message || error.message || fallback;
}

export default function AdminAccountSettings({
  showToast,
}: AdminAccountSettingsProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notificationPreference, setNotificationPreference] =
    useState<NotificationPreference>('email');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getCurrentUser();

      if (response.user) {
        setProfile(response.user);
        setName(response.user.name || '');
        setEmail(response.user.email || '');
        setPhone(response.user.phone || '');
        setNotificationPreference(
          response.user.notification_preference || 'email',
        );
      }
    } catch (error: any) {
      showToast(
        'error',
        errorMessage(
          error,
          t('err_failed_load_profile', 'Failed to load user profile.'),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadProfile();
    });
  }, [loadProfile]);

  const handleProfileSave = async () => {
    if (!name.trim() || !email.trim()) {
      showToast(
        'error',
        t('err_profile_required', 'Full name and email address are required.'),
      );

      return;
    }

    setSavingProfile(true);

    try {
      const response = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      });
      showToast(
        'success',
        response.message ||
          t('msg_profile_updated_success', 'Profile updated successfully.'),
      );
      await loadProfile();
    } catch (error: any) {
      showToast(
        'error',
        errorMessage(
          error,
          t('err_failed_update_profile', 'Failed to update profile.'),
        ),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(
        'error',
        t('err_password_fields_required', 'All password fields are required.'),
      );

      return;
    }

    if (newPassword.length < 8) {
      showToast(
        'error',
        t(
          'err_new_password_length',
          'New password must be at least 8 characters long.',
        ),
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      showToast(
        'error',
        t('err_new_passwords_mismatch', 'New passwords do not match.'),
      );

      return;
    }

    setSavingPassword(true);

    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(
        'success',
        response.message ||
          t('msg_password_changed_success', 'Password changed successfully.'),
      );
    } catch (error: any) {
      showToast(
        'error',
        errorMessage(
          error,
          t('err_failed_change_password', 'Failed to change password.'),
        ),
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePreferenceSave = async () => {
    setSavingPreference(true);

    try {
      const response = await updateNotificationPreference(
        notificationPreference,
      );
      showToast(
        'success',
        response.message ||
          t(
            'msg_notif_pref_updated',
            'Notification preference saved successfully.',
          ),
      );
    } catch (error: any) {
      showToast(
        'error',
        errorMessage(
          error,
          t(
            'err_failed_save_notif_pref',
            'Failed to save notification preference.',
          ),
        ),
      );
    } finally {
      setSavingPreference(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border-border flex min-h-64 items-center justify-center rounded-xl border">
        <LoadingSpinner
          type="pulse"
          variant="secondary"
          size="md"
          label={t('msg_loading_profile', 'Loading account details...')}
          centered
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="bg-card border-border overflow-hidden rounded-xl border">
        <div className="border-border flex items-start gap-3 border-b px-6 py-4">
          <div className="bg-primary/10 rounded-lg p-2">
            <User className="text-primary h-4 w-4" />
          </div>
          <div>
            <h3>{t('title_profile_details', 'Profile Details')}</h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {t(
                'desc_profile_details',
                'Update your personal details and login email address.',
              )}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t('label_full_name', 'Full Name')}
            <input
              className={inputCls}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={savingProfile}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t('label_profile_email', 'Login Email')}
            <input
              className={inputCls}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={savingProfile}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t('label_phone_number', 'Phone Number')}
            <input
              className={inputCls}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={savingProfile}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t('label_role', 'Role')}
            <input
              className={inputCls}
              value={
                profile?.role?.description ||
                profile?.role?.role_name ||
                'Admin'
              }
              disabled
            />
          </label>
          <div className="flex justify-end md:col-span-2">
            <button
              type="button"
              onClick={handleProfileSave}
              disabled={savingProfile}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
            >
              {savingProfile ? (
                <LoadingSpinner type="pulse" variant="white" size="xs" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('btn_save_profile', 'Save Profile Details')}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-card border-border overflow-hidden rounded-xl border">
        <div className="border-border flex items-start gap-3 border-b px-6 py-4">
          <div className="bg-primary/10 rounded-lg p-2">
            <Lock className="text-primary h-4 w-4" />
          </div>
          <div>
            <h3>{t('label_change_password', 'Change Password')}</h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {t(
                'desc_change_password',
                'Confirm your current password before choosing a new one.',
              )}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium md:col-span-2">
            {t('label_current_password', 'Current Password')}
            <input
              className={inputCls}
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              disabled={savingPassword}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t('label_new_password_profile', 'New Password')}
            <input
              className={inputCls}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={savingPassword}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {t('label_confirm_new_password', 'Confirm New Password')}
            <input
              className={inputCls}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={savingPassword}
            />
          </label>
          <div className="flex justify-end md:col-span-2">
            <button
              type="button"
              onClick={handlePasswordSave}
              disabled={savingPassword}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
            >
              {savingPassword ? (
                <LoadingSpinner type="pulse" variant="white" size="xs" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('btn_change_password', 'Update Password')}
            </button>
          </div>
        </div>
      </section>

      <section className="bg-card border-border overflow-hidden rounded-xl border">
        <div className="border-border flex items-start gap-3 border-b px-6 py-4">
          <div className="bg-primary/10 rounded-lg p-2">
            <Bell className="text-primary h-4 w-4" />
          </div>
          <div>
            <h3>{t('notification_preference', 'Personal Notifications')}</h3>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {t(
                'notification_preference_desc',
                'Choose how you receive notifications addressed to your account.',
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
            {t('preferred_channel', 'Preferred Channel')}
            <select
              className={inputCls}
              value={notificationPreference}
              onChange={(event) =>
                setNotificationPreference(
                  event.target.value as NotificationPreference,
                )
              }
              disabled={savingPreference}
            >
              <option value="email">{t('email', 'Email')}</option>
              <option value="sms">{t('sms', 'SMS')}</option>
              <option value="both">
                {t('email_and_sms', 'Email and SMS')}
              </option>
              <option value="none">{t('none', 'None')}</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handlePreferenceSave}
            disabled={savingPreference}
            className="bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
          >
            {savingPreference ? (
              <LoadingSpinner type="pulse" variant="white" size="xs" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {t('save_preference', 'Save Preference')}
          </button>
        </div>
      </section>
    </div>
  );
}
