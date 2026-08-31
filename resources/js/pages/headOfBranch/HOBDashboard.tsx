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
import { getPendingApprovals } from '@/services/hobApprovalService';

export default function HOBDashboard() {
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
      console.error('Failed to fetch HOB dashboard data:', err);
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
  const pendingProjects = projects.filter((p) => p.hob_status === 'pending');
  const approvedProjects = projects.filter((p) => p.hob_status === 'approved');
  const rejectedProjects = projects.filter((p) => p.hob_status === 'rejected');

  const totalLandParcels = projects.reduce(
    (sum, p) => sum + (p.land_parcels ? p.land_parcels.length : 0),
    0,
  );

  // Status Distribution for BarChart
  const statusDistributionData = [
    {
      name: t('chart_pending_review', 'Pending Review'),
      value: pendingProjects.length,
      color: '#FF9800',
    },
    {
      name: t('approved', 'Approved'),
      value: approvedProjects.length,
      color: '#2E7D32',
    },
    {
      name: t('rejected', 'Rejected'),
      value: rejectedProjects.length,
      color: '#DC2626',
    },
  ].filter((d) => d.value > 0);

  // Department / Requesting Institution Distribution for PieChart
  const institutionDistribution = projects.reduce(
    (acc: Record<string, number>, curr) => {
      const inst = curr.institution || t('chart_other', 'Other');
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
    {
      key: 'project_id',
      label: t('col_project_id', 'Project ID'),
      sortable: true,
    },
    {
      key: 'title',
      label: t('col_project_title', 'Project Title'),
      sortable: true,
      render: (_val: any, row: any) => row.title || row.name || t('n_a', 'N/A'),
    },
    {
      key: 'institution',
      label: t('col_institution', 'Institution'),
      sortable: true,
    },
    {
      key: 'landArea',
      label: t('col_land_area_arp', 'Land Area (A-R-P)'),
      render: (_val: any, row: any) =>
        `${row.land_area_to_be_acquired_acers ?? 0} ${t('acres', 'A')}, ${row.land_area_to_be_acquired_roods ?? 0} ${t('roods', 'R')}, ${row.land_area_to_be_acquired_perches ?? 0} ${t('perches', 'P')}`,
    },
    {
      key: 'created_at',
      label: t('created_at', 'Date Submitted'),
      sortable: true,
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString() : t('n_a', 'N/A'),
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
          {t('welcome_back_hob', 'Welcome Back, ')} {username}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t(
            'hob_dashboard_subtitle',
            'Head of Branch Dashboard • Southern Province Land Acquisition Management System',
          )}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('kpi_pending_my_action', 'Pending My Action')}
          value={loading ? '...' : pendingProjects.length}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title={t('kpi_approved_cases', 'Approved Cases')}
          value={loading ? '...' : approvedProjects.length}
          icon={ThumbsUp}
          color="success"
        />
        <StatCard
          title={t('kpi_rejected_cases', 'Rejected Cases')}
          value={loading ? '...' : rejectedProjects.length}
          icon={ThumbsDown}
          color="secondary"
        />
        <StatCard
          title={t(
            'kpi_land_parcels_under_review',
            'Land Parcels Under Review',
          )}
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
          <span className="text-xs font-medium">
            {t('action_review_pipeline', 'Review Pipeline')}
          </span>
        </button>

        <button
          onClick={() => router.visit('/gis-maps')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-primary/10 text-primary mb-2 rounded-full p-3">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">
            {t('action_gis_map_viewer', 'GIS Map Viewer')}
          </span>
        </button>

        <button
          onClick={() => router.visit('/compensation')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-success/10 text-success mb-2 rounded-full p-3">
            <DollarSign className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">
            {t('action_compensation', 'Compensation')}
          </span>
        </button>

        <button
          onClick={() => router.visit('/documents')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-info/10 text-info mb-2 rounded-full p-3">
            <FolderOpen className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">
            {t('action_documents', 'Documents')}
          </span>
        </button>
      </div>

      {/* Analytics Visualizers */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Case Status Distribution */}
          {statusDistributionData.length > 0 && (
            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4 text-sm font-semibold">
                {t(
                  'chart_status_distribution_title',
                  'Branch Case Status Distribution',
                )}
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
                      name={t('chart_projects_count_label', 'Projects Count')}
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
                {t(
                  'chart_institution_distribution_title',
                  'Acquisitions by Requesting Institution',
                )}
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
                        {entry.name}:{' '}
                        {t('chart_cases_label', ':count Case(s)').replace(
                          ':count',
                          String(entry.value),
                        )}
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
            {t('count_pending', ':count Pending').replace(
              ':count',
              String(pendingProjects.length),
            )}
          </span>
        </div>
        {loading ? (
          <div className="bg-card border-border text-muted-foreground flex h-48 items-center justify-center rounded-lg border text-sm">
            {t('loading_approvals_queue', 'Loading approvals queue...')}
          </div>
        ) : pendingProjects.length === 0 ? (
          <div className="bg-card border-border text-muted-foreground flex h-48 flex-col items-center justify-center rounded-lg border text-sm">
            <FolderKanban className="text-muted-foreground/30 mb-2 h-8 w-8" />
            {t(
              'no_pending_hob_action',
              'No pending submissions awaiting HOB action.',
            )}
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

HOBDashboard.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
