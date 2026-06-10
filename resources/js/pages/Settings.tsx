import { Bell, Building2, FileText, Save, User } from 'lucide-react';
import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('organization');

  const tabs = [
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'workflow', label: 'Workflow', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  return (
    <div className="space-y-6">
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
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Admin User"
                        className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm">Email</label>
                      <input
                        type="email"
                        defaultValue="admin@lams.gov.lk"
                        className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        defaultValue="+94 77 123 4567"
                        className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm">Role</label>
                      <input
                        type="text"
                        defaultValue="System Administrator"
                        disabled
                        className="bg-muted border-border w-full cursor-not-allowed rounded-lg border px-4 py-2 opacity-60"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3">Change Password</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-sm">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="bg-input-background border-border w-full rounded-lg border px-4 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="border-border mt-6 border-t pt-6">
              <button className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 text-white transition-colors">
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Settings.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
