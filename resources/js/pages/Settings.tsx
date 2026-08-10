import {
  AlertCircle,
  Bell,
  Building2,
  FileText,
  Loader2,
  Save,
  User,
  X,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { getCurrentUser, changePassword } from '@/services/authService';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('organization');

  // User Profile details
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      showToast('error', 'Current password is required.');

      return;
    }

    if (!newPassword) {
      showToast('error', 'New password is required.');

      return;
    }

    if (newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 characters long.');

      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match.');

      return;
    }

    try {
      setSaving(true);
      const res = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      showToast('success', res.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      const errors = err.response?.data?.errors;
      const errorMsg = errors
        ? (Object.values(errors).flat()[0] as string)
        : err.response?.data?.message || 'Failed to change password.';
      showToast('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (activeTab === 'profile') {
      await handlePasswordChange();
    } else {
      showToast('success', 'Settings updated successfully.');
    }
  };

  const tabs = [
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'workflow', label: 'Workflow', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'User Profile', icon: User },
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
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure system preferences
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
                <h3>Organization Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Land Acquisition Management Authority"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">Ministry</label>
                    <input
                      type="text"
                      defaultValue="Ministry of Land and Land Development"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">Address</label>
                    <textarea
                      rows={3}
                      defaultValue="No. 123, Colombo Road, Colombo 07, Sri Lanka"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        defaultValue="+94 11 234 5678"
                        className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm">Email</label>
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
                <h3>Workflow Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        Enable multi-level approval workflow
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
                        Require legal officer approval for compensation above ₨
                        20M
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
                        Auto-generate gazette notices after project approval
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" />
                      <span className="text-sm">
                        Send email notifications for approval requests
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">
                      Default Disturbance Allowance (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="20"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">
                      Default Statutory Payment (%)
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
                <h3>Notification Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        Email notifications for approval requests
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
                        SMS notifications for urgent matters
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
                        Notify on upcoming court hearings (3 days before)
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
                        Notify on pending compensation payments
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" />
                      <span className="text-sm">Daily digest email</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3>User Profile</h3>
                {loadingProfile ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="text-primary h-8 w-8 animate-spin" />
                    <span className="text-muted-foreground mt-3 text-sm">
                      Loading profile details...
                    </span>
                  </div>
                ) : profileData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name || ''}
                          disabled
                          className="bg-muted border-border w-full cursor-not-allowed rounded-lg border px-4 py-2 opacity-60"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email || ''}
                          disabled
                          className="bg-muted border-border w-full cursor-not-allowed rounded-lg border px-4 py-2 opacity-60"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Department
                        </label>
                        <input
                          type="text"
                          value={
                            profileData.department?.department_name || 'N/A'
                          }
                          disabled
                          className="bg-muted border-border w-full cursor-not-allowed rounded-lg border px-4 py-2 opacity-60"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Role
                        </label>
                        <input
                          type="text"
                          value={
                            profileData.role?.description ||
                            profileData.role?.role_name ||
                            'N/A'
                          }
                          disabled
                          className="bg-muted border-border w-full cursor-not-allowed rounded-lg border px-4 py-2 opacity-60"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-3 mt-6">Change Password</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="bg-input-background border-border focus:border-primary w-full rounded-lg border px-4 py-2 focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-input-background border-border focus:border-primary w-full rounded-lg border px-4 py-2 focus:outline-none"
                            placeholder="•••••••• (min 8 characters)"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-input-background border-border focus:border-primary w-full rounded-lg border px-4 py-2 focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-destructive font-medium">
                    Failed to load user profile. Please try again.
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <div className="border-border mt-6 border-t pt-6">
              <button
                onClick={handleSave}
                disabled={saving || (activeTab === 'profile' && loadingProfile)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Settings.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
