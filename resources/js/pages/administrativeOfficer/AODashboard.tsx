import { router, usePage } from '@inertiajs/react';
import {
  CheckSquare,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Map,
  MapPin,
  FolderOpen,
  DollarSign,
  Eye,
  FolderKanban,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/ui/StatCard';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { getPendingApprovals } from '@/services/aoApprovalService';

export default function AODashboard() {
  const { t } = useTranslation();
  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const username = user?.name || 'Officer';

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPendingApprovals();
      setProjects(res.projects || []);
    } catch (err) {
      console.error('Failed to fetch AO dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchDashboardData();
    });
  }, [fetchDashboardData]);

  // Statistics calculation
  const pendingProjects = projects.filter((p) => p.ao_status === 'pending');
  const approvedProjects = projects.filter((p) => p.ao_status === 'approved');
  const rejectedProjects = projects.filter((p) => p.ao_status === 'rejected');

  const totalLandParcels = projects.reduce(
    (sum, p) => sum + (p.land_parcels ? p.land_parcels.length : 0),
    0,
  );

  // Status Distribution for BarChart
  const statusDistributionData = [
    { name: 'Pending Review', value: pendingProjects.length, color: '#FF9800' },
    { name: 'Approved', value: approvedProjects.length, color: '#2E7D32' },
    { name: 'Rejected', value: rejectedProjects.length, color: '#DC2626' },
  ].filter((d) => d.value > 0);

  // Department / Requesting Institution Distribution for PieChart
  const institutionDistribution = projects.reduce(
    (acc: Record<string, number>, curr) => {
      const inst = curr.institution || 'Other';
      acc[inst] = (acc[inst] || 0) + 1;

      return acc;
    },
    {},
  );

  const institutionDistributionData = Object.keys(institutionDistribution).map(
    (key, idx) => ({
      name: key,
      value: institutionDistribution[key],
      color: ['#1565C0', '#2E7D32', '#FF9800', '#7C3AED', '#0891B2', '#DC2626'][
        idx % 6
      ],
    }),
  );

  // Table Columns config
  const pendingColumns = [
    { key: 'project_id', label: 'Project ID', sortable: true },
    {
      key: 'title',
      label: 'Project Title',
      sortable: true,
      render: (_val: any, row: any) => row.title || row.name || 'N/A',
    },
    { key: 'institution', label: 'Institution', sortable: true },
    {
      key: 'landArea',
      label: 'Land Area (A-R-P)',
      render: (_val: any, row: any) =>
        `${row.land_area_to_be_acquired_acers ?? 0} A, ${row.land_area_to_be_acquired_roods ?? 0} R, ${row.land_area_to_be_acquired_perches ?? 0} P`,
    },
    {
      key: 'created_at',
      label: 'Date Submitted',
      sortable: true,
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString() : 'N/A',
    },
  ];

  const handleRowClick = () => {
    router.visit('/pending-approvals');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-primary/5 border-primary/10 rounded-xl border p-6">
        <h1 className="text-primary text-2xl font-bold">
          {t('welcome_back_ao', 'Welcome Back, ')} {username}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t(
            'ao_dashboard_subtitle',
            'Administrative Officer Dashboard • Southern Province Land Acquisition Management System',
          )}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending My Action"
          value={loading ? '...' : pendingProjects.length}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Approved Cases"
          value={loading ? '...' : approvedProjects.length}
          icon={ThumbsUp}
          color="success"
        />
        <StatCard
          title="Rejected Cases"
          value={loading ? '...' : rejectedProjects.length}
          icon={ThumbsDown}
          color="secondary"
        />
        <StatCard
          title="Land Parcels Under Review"
          value={loading ? '...' : totalLandParcels}
          icon={Map}
          color="info"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <button
          onClick={() => router.visit('/pending-approvals')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-warning/10 text-warning mb-2 rounded-full p-3">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Review Pipeline</span>
        </button>

        <button
          onClick={() => router.visit('/gis-maps')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-primary/10 text-primary mb-2 rounded-full p-3">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">GIS Map Viewer</span>
        </button>

        <button
          onClick={() => router.visit('/compensation')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-success/10 text-success mb-2 rounded-full p-3">
            <DollarSign className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Compensation</span>
        </button>

        <button
          onClick={() => router.visit('/documents')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-info/10 text-info mb-2 rounded-full p-3">
            <FolderOpen className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">Documents</span>
        </button>
      </div>

      {/* Analytics Visualizers */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Case Status Distribution */}
          {statusDistributionData.length > 0 && (
            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4 text-sm font-semibold">
                Branch Case Status Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      name="Projects Count"
                      radius={[4, 4, 0, 0]}
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Requesting Institution Distribution */}
          {institutionDistributionData.length > 0 && (
            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4 text-sm font-semibold">
                Acquisitions by Requesting Institution
              </h3>
              <div className="flex h-64 flex-col items-center justify-center sm:flex-row">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={institutionDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {institutionDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex max-h-48 flex-col gap-2 overflow-y-auto sm:ml-6 sm:mt-0">
                  {institutionDistributionData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="max-w-[200px] truncate text-xs font-medium">
                        {entry.name}: {entry.value} Case(s)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Pending Approvals Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {t('recent_pending_approvals', 'Awaiting Action Queue')}
          </h3>
          <span className="text-muted-foreground text-xs font-medium">
            {pendingProjects.length} Pending
          </span>
        </div>
        {loading ? (
          <div className="bg-card border-border text-muted-foreground flex h-48 items-center justify-center rounded-lg border text-sm">
            Loading approvals queue...
          </div>
        ) : pendingProjects.length === 0 ? (
          <div className="bg-card border-border text-muted-foreground flex h-48 flex-col items-center justify-center rounded-lg border text-sm">
            <FolderKanban className="text-muted-foreground/30 mb-2 h-8 w-8" />
            No pending submissions awaiting AO action.
          </div>
        ) : (
          <DataTable
            columns={pendingColumns}
            data={pendingProjects}
            onRowClick={handleRowClick}
            actions={() => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.visit('/pending-approvals');
                }}
                className="hover:bg-muted cursor-pointer rounded p-1.5 transition-colors"
                title="Review Case"
              >
                <Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
              </button>
            )}
          />
        )}
      </div>
    </div>
  );
}

AODashboard.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
