import {
  AlertCircle,
  Bell,
  Building2,
  CheckCircle2,
  FileText,
  PenTool,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { SignatureCanvas } from '@/components/SignatureCanvas';
import { SignatureUpload } from '@/components/SignatureUpload';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { confirmDialog } from '@/lib/alerts';
import {
  getCurrentUser,
  changePassword,
  updateProfile,
  updateSignature,
  updateNotificationPreference,
} from '@/services/authService';

export default function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('organization');

  // User Profile details
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Notification preference state
  const [notifPref, setNotifPref] = useState<'email' | 'sms' | 'both' | 'none'>(
    'email',
  );

  // E-Signature state
  const [activeSignature, setActiveSignature] = useState<string | null>(null);
  const [signatureInputMode, setSignatureInputMode] = useState<
    'draw' | 'upload'
  >('draw');
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Toast feedback state
  interface ToastState {
    type: 'success' | 'error';
    text: string;
  }
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const data = await getCurrentUser();

      if (data.user) {
        setProfileData(data.user);
        setProfileName(data.user.name || '');
        setProfileEmail(data.user.email || '');
        setProfilePhone(data.user.phone || '');
        setActiveSignature(data.user.signature || null);

        if (data.user.notification_preference) {
          setNotifPref(data.user.notification_preference);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchProfile();
    });
  }, [fetchProfile]);

  const handleProfileSave = async () => {
    if (!profileName.trim()) {
      showToast(
        'error',
        t('err_profile_name_required', 'Full name is required.'),
      );

      return;
    }

    if (!profileEmail.trim()) {
      showToast(
        'error',
        t('err_profile_email_required', 'Email address is required.'),
      );

      return;
    }

    try {
      setSavingProfile(true);
      const res = await updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim() || null,
      });
      showToast(
        'success',
        res.message ||
          t(
            'msg_profile_updated_success',
            'Profile details updated successfully.',
          ),
      );
      await fetchProfile();
    } catch (err: any) {
      console.error('Failed to update profile details:', err);
      const errors = err.response?.data?.errors;
      const errorMsg = errors
        ? (Object.values(errors).flat()[0] as string)
        : err.response?.data?.message ||
          t('err_failed_update_profile', 'Failed to update profile details.');
      showToast('error', errorMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      showToast(
        'error',
        t('err_current_password_required', 'Current password is required.'),
      );

      return;
    }

    if (!newPassword) {
      showToast(
        'error',
        t('err_new_password_required', 'New password is required.'),
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

    try {
      setSavingPassword(true);
      const res = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      showToast(
        'success',
        res.message ||
          t('msg_password_changed_success', 'Password changed successfully.'),
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      const errors = err.response?.data?.errors;
      const errorMsg = errors
        ? (Object.values(errors).flat()[0] as string)
        : err.response?.data?.message ||
          t('err_failed_change_password', 'Failed to change password.');
      showToast('error', errorMsg);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveSignature = async (customSignature?: string | null) => {
    const sigToSave =
      customSignature !== undefined ? customSignature : pendingSignature;

    try {
      setSaving(true);
      const res = await updateSignature(sigToSave);

      showToast(
        'success',
        res.message ||
          t(
            'msg_signature_saved_success',
            'Electronic signature updated successfully.',
          ),
      );

      setActiveSignature(sigToSave);
      setPendingSignature(null);
      await fetchProfile();
    } catch (err: any) {
      console.error('Failed to update signature:', err);
      const errorMsg =
        err.response?.data?.message ||
        t('err_failed_save_signature', 'Failed to save signature.');

      showToast('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSignature = async () => {
    const confirmed = await confirmDialog({
      title: t('title_confirm_delete_signature', 'Delete Signature?'),
      text: t(
        'desc_confirm_delete_signature',
        'Are you sure you want to remove your electronic signature? This action cannot be undone.',
      ),
      confirmButtonText: t('btn_confirm_delete', 'Delete Signature'),
      cancelButtonText: t('btn_cancel', 'Cancel'),
    });

    if (confirmed) {
      await handleSaveSignature(null);
    }
  };

  const handleSave = async () => {
    if (activeTab === 'profile') {
      await handlePasswordChange();
    } else if (activeTab === 'notifications') {
      try {
        setSaving(true);
        const res = await updateNotificationPreference(notifPref);
        showToast(
          'success',
          res.message ||
            t(
              'msg_notif_pref_updated',
              'Notification preference saved successfully.',
            ),
        );
        await fetchProfile();
      } catch (err: any) {
        console.error('Failed to update notification preference:', err);
        showToast(
          'error',
          err.response?.data?.message ||
            t(
              'err_failed_save_notif_pref',
              'Failed to save notification preferences.',
            ),
        );
      } finally {
        setSaving(false);
      }
    } else if (activeTab === 'signature') {
      if (!pendingSignature) {
        showToast(
          'error',
          t(
            'err_no_signature_provided',
            'Please draw or upload a signature before saving.',
          ),
        );

        return;
      }

      await handleSaveSignature(pendingSignature);
    } else {
      showToast(
        'success',
        t('msg_settings_updated_success', 'Settings updated successfully.'),
      );
    }
  };

  const tabs = [
    {
      id: 'organization',
      label: t('tab_organization', 'Organization'),
      icon: Building2,
    },
    { id: 'workflow', label: t('tab_workflow', 'Workflow'), icon: FileText },
    {
      id: 'notifications',
      label: t('tab_notifications', 'Notifications'),
      icon: Bell,
    },
    { id: 'profile', label: t('tab_user_profile', 'User Profile'), icon: User },
    {
      id: 'signature',
      label: t('tab_e_signature', 'E-Signature'),
      icon: PenTool,
    },
  ];

  return (
    <div className="relative space-y-6">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 ${
            toast.type === 'success'
              ? 'border-[#2E7D32]/30 bg-[#2E7D32]/10 text-[#2E7D32]'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div>
        <h1>{t('settings_title', 'Settings')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('settings_subtitle', 'Configure system preferences')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Settings Tabs */}
        <div className="bg-card border-border rounded-lg border p-4">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-card border-border rounded-lg border p-6">
            {activeTab === 'organization' && (
              <div className="space-y-6">
                <h3>{t('org_settings_title', 'Organization Settings')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm">
                      {t('label_org_name', 'Organization Name')}
                    </label>
                    <input
                      type="text"
                      defaultValue="Land Acquisition Management Authority"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">
                      {t('label_ministry', 'Ministry')}
                    </label>
                    <input
                      type="text"
                      defaultValue="Ministry of Land and Land Development"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">
                      {t('label_address', 'Address')}
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="No. 123, Colombo Road, Colombo 07, Sri Lanka"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm">
                        {t('label_contact_number', 'Contact Number')}
                      </label>
                      <input
                        type="text"
                        defaultValue="+94 11 234 5678"
                        className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm">
                        {t('label_email', 'Email')}
                      </label>
                      <input
                        type="email"
                        defaultValue="info@lams.gov.lk"
                        className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <h3>{t('workflow_config_title', 'Workflow Configuration')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {t(
                          'label_enable_multilevel_workflow',
                          'Enable multi-level approval workflow',
                        )}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {t(
                          'label_require_legal_approval',
                          'Require legal officer approval for compensation above LKR 20M',
                        )}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {t(
                          'label_autogenerate_gazette',
                          'Auto-generate gazette notices after project approval',
                        )}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" />
                      <span className="text-sm">
                        {t(
                          'label_send_email_notifications',
                          'Send email notifications for approval requests',
                        )}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">
                      {t(
                        'label_default_disturbance_allowance',
                        'Default Disturbance Allowance (%)',
                      )}
                    </label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">
                      {t(
                        'label_default_statutory_payment',
                        'Default Statutory Payment (%)',
                      )}
                    </label>
                    <input
                      type="number"
                      defaultValue="5"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3>
                    {t('notification_settings_title', 'Notification Settings')}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t(
                      'notification_settings_subtitle',
                      'Choose how you prefer to receive automated system alerts and workflow updates.',
                    )}
                  </p>
                </div>

                {/* Preferred Delivery Method */}
                <div className="border-border bg-input-background/30 space-y-4 rounded-xl border p-5">
                  <h4 className="text-sm font-semibold">
                    {t(
                      'label_delivery_preference',
                      'Preferred Notification Channel',
                    )}
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                        notifPref === 'email'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="notification_preference"
                        value="email"
                        checked={notifPref === 'email'}
                        onChange={() => setNotifPref('email')}
                        className="text-primary mt-0.5 h-4 w-4"
                      />
                      <div>
                        <span className="block text-sm font-medium">
                          {t('option_email_only', 'Email Only')}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {t(
                            'desc_email_only',
                            'Receive approval and case alerts via email',
                          )}
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                        notifPref === 'sms'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="notification_preference"
                        value="sms"
                        checked={notifPref === 'sms'}
                        onChange={() => setNotifPref('sms')}
                        className="text-primary mt-0.5 h-4 w-4"
                      />
                      <div>
                        <span className="block text-sm font-medium">
                          {t('option_sms_only', 'SMS Only')}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {t(
                            'desc_sms_only',
                            'Receive text messages on your mobile device',
                          )}
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                        notifPref === 'both'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="notification_preference"
                        value="both"
                        checked={notifPref === 'both'}
                        onChange={() => setNotifPref('both')}
                        className="text-primary mt-0.5 h-4 w-4"
                      />
                      <div>
                        <span className="block text-sm font-medium">
                          {t('option_both', 'Both Email & SMS')}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {t(
                            'desc_both',
                            'Receive notifications on both channels',
                          )}
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                        notifPref === 'none'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="notification_preference"
                        value="none"
                        checked={notifPref === 'none'}
                        onChange={() => setNotifPref('none')}
                        className="text-primary mt-0.5 h-4 w-4"
                      />
                      <div>
                        <span className="block text-sm font-medium">
                          {t('option_none', 'None (Opt-Out)')}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {t(
                            'desc_none',
                            'Mute all automated email & SMS notifications',
                          )}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {t(
                          'label_email_notif_approval',
                          'Email notifications for approval requests',
                        )}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {t(
                          'label_sms_notif_urgent',
                          'SMS notifications for urgent matters',
                        )}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {t(
                          'label_notify_court_hearings',
                          'Notify on upcoming court hearings (3 days before)',
                        )}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {t(
                          'label_notify_pending_payments',
                          'Notify on pending compensation payments',
                        )}
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" />
                      <span className="text-sm">
                        {t('label_daily_digest_email', 'Daily digest email')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h3>{t('profile_settings_title', 'User Profile')}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t(
                      'profile_settings_subtitle',
                      'Manage your profile details and security credentials.',
                    )}
                  </p>
                </div>

                {loadingProfile ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner
                      type="pulse"
                      variant="secondary"
                      size="md"
                      label={t(
                        'msg_loading_profile',
                        'Loading profile details...',
                      )}
                      centered
                    />
                  </div>
                ) : profileData ? (
                  <div className="space-y-8">
                    {/* Profile Information Section */}
                    <div className="border-border bg-card space-y-5 rounded-xl border p-5 shadow-sm">
                      <div className="border-border border-b pb-3">
                        <h4 className="text-foreground font-semibold">
                          {t('title_profile_details', 'Profile Details')}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {t(
                            'desc_profile_details',
                            'Update your personal details and contact information.',
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            {t('label_full_name', 'Full Name')}
                          </label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="bg-input-background border-border focus:border-primary w-full rounded-lg border px-4 py-2 focus:outline-none"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            {t('label_profile_email', 'Email')}
                          </label>
                          <input
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="bg-input-background border-border focus:border-primary w-full rounded-lg border px-4 py-2 focus:outline-none"
                            placeholder="user@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            {t('label_phone_number', 'Phone Number')}
                          </label>
                          <input
                            type="text"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="bg-input-background border-border focus:border-primary w-full rounded-lg border px-4 py-2 focus:outline-none"
                            placeholder="+94 77 123 4567"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            {t('label_department', 'Department')}
                          </label>
                          <input
                            type="text"
                            value={
                              profileData.department?.department_name ||
                              t('n_a', 'N/A')
                            }
                            disabled
                            className="bg-muted border-border w-full cursor-not-allowed rounded-lg border px-4 py-2 opacity-60"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            {t('label_role', 'Role')}
                          </label>
                          <input
                            type="text"
                            value={
                              profileData.role?.description ||
                              profileData.role?.role_name ||
                              t('n_a', 'N/A')
                            }
                            disabled
                            className="bg-muted border-border w-full cursor-not-allowed rounded-lg border px-4 py-2 opacity-60"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={handleProfileSave}
                          disabled={savingProfile || loadingProfile}
                          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingProfile ? (
                            <LoadingSpinner
                              type="pulse"
                              variant="white"
                              size="xs"
                            />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>
                            {savingProfile
                              ? t('btn_saving_profile', 'Saving Profile...')
                              : t('btn_save_profile', 'Save Profile Details')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="border-border bg-card space-y-5 rounded-xl border p-5 shadow-sm">
                      <div className="border-border border-b pb-3">
                        <h4 className="text-foreground font-semibold">
                          {t('label_change_password', 'Change Password')}
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          {t(
                            'desc_change_password',
                            'Ensure your account is using a long, random password to stay secure.',
                          )}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            {t('label_current_password', 'Current Password')}
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="bg-input-background border-border focus:border-primary w-full rounded-lg border px-4 py-2 focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              {t('label_new_password_profile', 'New Password')}
                            </label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="bg-input-background border-border focus:border-primary w-full rounded-lg border px-4 py-2 focus:outline-none"
                              placeholder="••••••••"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              {t(
                                'label_confirm_new_password',
                                'Confirm New Password',
                              )}
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="bg-input-background border-border focus:border-primary w-full rounded-lg border px-4 py-2 focus:outline-none"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={handlePasswordChange}
                          disabled={savingPassword || loadingProfile}
                          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingPassword ? (
                            <LoadingSpinner
                              type="pulse"
                              variant="white"
                              size="xs"
                            />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>
                            {savingPassword
                              ? t(
                                  'btn_changing_password',
                                  'Changing Password...',
                                )
                              : t('btn_change_password', 'Update Password')}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-destructive font-medium">
                    {t(
                      'err_failed_load_profile',
                      'Failed to load user profile. Please try again.',
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'signature' && (
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center gap-2">
                    <span>
                      {t('signature_settings_title', 'Electronic Signature')}
                    </span>
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t(
                      'signature_settings_subtitle',
                      'Create and manage your digital signature for official approvals and document signing.',
                    )}
                  </p>
                </div>

                {loadingProfile ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner
                      type="pulse"
                      variant="secondary"
                      size="md"
                      label={t(
                        'msg_loading_signature',
                        'Loading signature status...',
                      )}
                      centered
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Active Saved Signature */}
                    {activeSignature ? (
                      <div className="border-border bg-input-background/50 rounded-xl border p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />
                              <span className="text-sm font-semibold">
                                {t(
                                  'label_signature_active',
                                  'Active Signature Registered',
                                )}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {t(
                                'label_signature_encrypted_note',
                                'Stored with AES-256 encryption at rest.',
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleDeleteSignature}
                            disabled={saving}
                            className="border-destructive/30 text-destructive hover:bg-destructive/10 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>
                              {t('btn_remove_signature', 'Remove Signature')}
                            </span>
                          </button>
                        </div>

                        <div className="border-border/60 bg-card mt-4 flex h-32 items-center justify-center rounded-lg border p-3 shadow-sm">
                          <img
                            src={activeSignature}
                            alt="Current E-Signature"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="border-border bg-muted/30 rounded-xl border p-4 text-center">
                        <p className="text-muted-foreground text-sm font-medium">
                          {t(
                            'msg_no_signature_yet',
                            'No electronic signature set yet.',
                          )}
                        </p>
                      </div>
                    )}

                    {/* Create / Update Signature Form */}
                    <div className="space-y-4 pt-2">
                      <div className="border-border flex items-center justify-between border-b pb-3">
                        <h4 className="text-sm font-semibold">
                          {activeSignature
                            ? t(
                                'label_update_signature',
                                'Update Your Signature',
                              )
                            : t(
                                'label_create_signature',
                                'Add Electronic Signature',
                              )}
                        </h4>

                        {/* Toggle Mode Buttons */}
                        <div className="bg-muted flex rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSignatureInputMode('draw');
                              setPendingSignature(null);
                            }}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                              signatureInputMode === 'draw'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {t('btn_mode_draw', 'Draw Signature')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSignatureInputMode('upload');
                              setPendingSignature(null);
                            }}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                              signatureInputMode === 'upload'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {t('btn_mode_upload', 'Upload Image')}
                          </button>
                        </div>
                      </div>

                      {signatureInputMode === 'draw' ? (
                        <SignatureCanvas
                          key="draw-canvas"
                          onSignatureChange={setPendingSignature}
                        />
                      ) : (
                        <SignatureUpload
                          key="upload-input"
                          onSignatureChange={setPendingSignature}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Save Button for non-profile tabs */}
            {activeTab !== 'profile' && (
              <div className="border-border mt-6 border-t pt-6">
                <button
                  onClick={handleSave}
                  disabled={
                    saving || (activeTab === 'signature' && loadingProfile)
                  }
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoadingSpinner type="pulse" variant="white" size="xs" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  <span>
                    {saving
                      ? t('btn_saving', 'Saving...')
                      : t('btn_save_changes', 'Save Changes')}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Settings.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
