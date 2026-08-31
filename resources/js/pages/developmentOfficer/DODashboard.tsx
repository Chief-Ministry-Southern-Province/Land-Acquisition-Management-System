import { router, usePage } from '@inertiajs/react';
import {
  AlertTriangle,
  Clock,
  Edit,
  Eye,
  FileText,
  FolderKanban,
  Map,
  MapPin,
  Plus,
  Send,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { confirmAction, toastError, toastSuccess } from '@/lib/alerts';
import { getLandParcels } from '@/services/landParcelManagementService';
import {
  getProjects,
  submitProject,
} from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';

export default function DODashboard() {
  const { t } = useTranslation();
  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const username = user?.name || t('officer', 'Officer');

  const [projects, setProjects] = useState<Project[]>([]);
  const [landParcelsCount, setLandParcelsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all projects, land parcels, and owners
  const loadDashboardData = async () => {
    try {
      const [projectsData, parcelsData] = await Promise.all([
        getProjects(),
        getLandParcels(),
      ]);

      setProjects(projectsData);
      setLandParcelsCount(parcelsData.length);
    } catch (error) {
      console.error('Failed to load DO dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadDashboardData();
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [projectsData, parcelsData] = await Promise.all([
          getProjects(),
          getLandParcels(),
        ]);
        setProjects(projectsData);
        setLandParcelsCount(parcelsData.length);
      } catch (error) {
        console.error('Failed to load DO dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Filter project categories for the DO
  const draftProjects = projects.filter(
    (p) =>
      (p.doStatus === 'draft' ||
        p.status === 'draft' ||
        p.caseStatus === 'draft') &&
      (!p.remarks || !p.remarks.includes('[Query')),
  );

  const queriedProjects = projects.filter(
    (p) => p.doStatus === 'draft' && p.remarks && p.remarks.includes('[Query'),
  );

  const submittedProjects = projects.filter(
    (p) =>
      p.doStatus === 'submitted' &&
      p.caseStatus !== 'completed' &&
      p.caseStatus !== 'rejected',
  );

  const completedProjects = projects.filter(
    (p) => p.caseStatus === 'completed' || p.secStatus === 'approved',
  );

  // Submit project to HOB review
  const handleSubmit = async (id: string, title: string) => {
    const confirmed = await confirmAction({
      title: t('submit_project', 'Submit Project'),
      text: t(
        'submit_project_confirm_text',
        'Are you sure you want to submit the project ":title" to the Head of Branch (HOB) for review?',
      ).replace(':title', title),
      confirmButtonText: t('submit_btn', 'Submit'),
    });

    if (confirmed) {
      try {
        await submitProject(id);
        toastSuccess(
          t('project_submitted_success', 'Project submitted successfully!'),
        );
        handleRefresh();
      } catch (error) {
        console.error('Failed to submit project:', error);
        toastError(
          t(
            'failed_submit_project_try_again',
            'Failed to submit project. Please try again.',
          ),
        );
      }
    }
  };

  // Stepper helper for approval progress tracking
  const getApprovalStage = (project: Project) => {
    if (
      project.caseStatus === 'completed' ||
      project.secStatus === 'approved'
    ) {
      return { label: t('approved', 'Approved'), variant: 'success' as const };
    }

    if (project.caseStatus === 'rejected') {
      return { label: t('rejected', 'Rejected'), variant: 'danger' as const };
    }

    if (project.hobStatus === 'pending') {
      return {
        label: t('pending_hob_review', 'Pending HOB Review'),
        variant: 'info' as const,
      };
    }

    if (project.aoStatus === 'pending') {
      return {
        label: t('pending_ao_review', 'Pending AO Review'),
        variant: 'info' as const,
      };
    }

    if (project.asStatus === 'pending') {
      return {
        label: t('pending_as_review', 'Pending AS Review'),
        variant: 'info' as const,
      };
    }

    if (project.sasStatus === 'pending') {
      return {
        label: t('pending_sas_review', 'Pending SAS Review'),
        variant: 'info' as const,
      };
    }

    if (project.secStatus === 'pending') {
      return {
        label: t('pending_sec_review', 'Pending SEC Review'),
        variant: 'info' as const,
      };
    }

    return { label: t('in_review', 'In Review'), variant: 'info' as const };
  };

  // Chart data calculations
  const statusDistributionData = [
    {
      name: t('drafts', 'Drafts'),
      value: draftProjects.length,
      color: '#1565C0',
    },
    {
      name: t('queried_action_req', 'Queried (Action Req)'),
      value: queriedProjects.length,
      color: '#FF9800',
    },
    {
      name: t('in_review_chain', 'In Review Chain'),
      value: submittedProjects.length,
      color: '#0288D1',
    },
    {
      name: t('completed_approved', 'Completed/Approved'),
      value: completedProjects.length,
      color: '#2E7D32',
    },
  ].filter((d) => d.value > 0);

  const purposeDistribution = projects.reduce(
    (acc: Record<string, number>, curr) => {
      const purpose = curr.purpose || t('other', 'Other');
      acc[purpose] = (acc[purpose] || 0) + 1;

      return acc;
    },
    {},
  );

  const purposeDistributionData = Object.keys(purposeDistribution).map(
    (key, idx) => ({
      name: key,
      value: purposeDistribution[key],
      color: ['#1565C0', '#2E7D32', '#FF9800', '#7C3AED', '#0891B2', '#DC2626'][
        idx % 6
      ],
    }),
  );

  // Table Columns config
  const draftColumns = [
    { key: 'projectId', label: t('project_id', 'Project ID'), sortable: true },
    {
      key: 'title',
      label: t('title', 'Title'),
      sortable: true,
      render: (_val: any, row: Project) =>
        row.title || row.name || t('n_a', 'N/A'),
    },
    { key: 'purpose', label: t('purpose', 'Purpose'), sortable: true },
    {
      key: 'landArea',
      label: t('land_area', 'Land Area'),
      render: (_val: any, row: Project) =>
        `${row.landAreaAcers ?? 0}${t('ac_abbr', 'A')}, ${row.landAreaRoods ?? 0}${t('rd_abbr', 'R')}, ${row.landAreaPerches ?? 0}${t('per_abbr', 'P')}`,
    },
    {
      key: 'updated_at',
      label: t('last_edited', 'Last Edited'),
      sortable: true,
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString() : t('n_a', 'N/A'),
    },
  ];

  const inFlightColumns = [
    { key: 'projectId', label: t('project_id', 'Project ID'), sortable: true },
    {
      key: 'title',
      label: t('title', 'Title'),
      sortable: true,
      render: (_val: any, row: Project) =>
        row.title || row.name || t('n_a', 'N/A'),
    },
    {
      key: 'institution',
      label: t('requesting_institution', 'Requesting Institution'),
      sortable: true,
    },
    {
      key: 'workflowStatus',
      label: t('pipeline_position', 'Pipeline Position'),
      sortable: true,
      render: (_val: any, row: Project) => {
        const stage = getApprovalStage(row);

        return <StatusBadge status={stage.label} />;
      },
    },
    {
      key: 'updated_at',
      label: t('submitted_date', 'Submitted Date'),
      sortable: true,
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString() : t('n_a', 'N/A'),
    },
  ];

  const handleRowClick = (row: any) => {
    router.visit(`/projects/${row.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="bg-primary/5 border-primary/10 rounded-xl border p-6">
        <h1 className="text-primary text-2xl font-bold">
          {t('welcome_back_do', 'Welcome Back, ')} {username}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t(
            'do_dashboard_subtitle',
            'Development Officer Dashboard • Southern Province Land Acquisition Management System',
          )}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('draft_cases', 'Draft Cases')}
          value={loading ? '...' : draftProjects.length}
          icon={FolderKanban}
          color="primary"
        />
        <StatCard
          title={t('action_required_queries', 'Action Required (Queries)')}
          value={loading ? '...' : queriedProjects.length}
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title={t('under_review', 'Under Review')}
          value={loading ? '...' : submittedProjects.length}
          icon={Clock}
          color="info"
        />
        <StatCard
          title={t('total_land_parcels', 'Total Land Parcels')}
          value={loading ? '...' : landParcelsCount}
          icon={Map}
          color="success"
        />
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <button
          onClick={() => router.visit('/projects/new')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-primary/10 text-primary mb-2 rounded-full p-3">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">
            {t('initiate_case', 'Initiate Case')}
          </span>
        </button>

        <button
          onClick={() => router.visit('/land-parcels/create')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-success/10 text-success mb-2 rounded-full p-3">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">
            {t('initiate_land_parcel', 'Initiate Land Parcel')}
          </span>
        </button>

        <button
          onClick={() => router.visit('/land-owners')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-info/10 text-info mb-2 rounded-full p-3">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">
            {t('land_owners_btn', 'Land Owners')}
          </span>
        </button>

        <button
          onClick={() => router.visit('/documents')}
          className="bg-card hover:bg-muted border-border flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-all hover:scale-[1.02]"
        >
          <div className="bg-warning/10 text-warning mb-2 rounded-full p-3">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium">
            {t('case_documents', 'Case Documents')}
          </span>
        </button>
      </div>

      {/* Query Banner / Action Queue (High Priority) */}
      {!loading && queriedProjects.length > 0 && (
        <div className="bg-warning/5 border-warning/20 rounded-lg border p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-pulse text-[#FF9800]" />
            <h3 className="text-base font-bold text-[#FF9800]">
              {t(
                'action_required_queries_title',
                'Action Required: Queries returned for correction (:count)',
              ).replace(':count', queriedProjects.length.toString())}
            </h3>
          </div>
          <div className="space-y-4">
            {queriedProjects.map((project) => {
              const remarks = project.remarks || '';
              const queryLines = remarks
                .split('\n')
                .filter((line) => line.includes('[Query'));
              const lastQuery =
                queryLines[queryLines.length - 1] ||
                t(
                  'revision_requested_by_supervisor',
                  'Revision requested by supervisor.',
                );

              return (
                <div
                  key={project.id}
                  className="bg-card border-border flex flex-col justify-between gap-4 rounded-lg border p-4 shadow-sm md:flex-row md:items-center"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-mono text-xs font-semibold">
                        {project.projectId}
                      </span>
                      <h4 className="text-sm font-bold">{project.title}</h4>
                    </div>
                    <div className="bg-warning/10 text-warning border-warning rounded-r border-l-4 px-3 py-2 text-xs">
                      <span className="font-semibold">
                        {t('correction_note', 'Correction Note')}:
                      </span>{' '}
                      {lastQuery.replace(/\[Query [A-Z]+\]:\s*/, '')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.visit(`/projects/${project.id}`)}
                      className="hover:bg-muted border-border flex cursor-pointer items-center gap-1.5 rounded border px-3 py-1.5 text-xs transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t('view', 'View')}
                    </button>
                    <button
                      onClick={() =>
                        router.visit(`/projects/new?edit=${project.id}`)
                      }
                      className="bg-warning hover:bg-warning/90 flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      {t('edit_re_submit', 'Edit & Re-submit')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Workspace Tables */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Draft Projects Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {t('my_draft_projects', 'My Draft Projects')}
            </h3>
            <span className="text-muted-foreground text-xs font-medium">
              {draftProjects.length} {t('drafts_count', 'Drafts')}
            </span>
          </div>
          {loading ? (
            <div className="bg-card border-border text-muted-foreground flex h-48 items-center justify-center rounded-lg border text-sm">
              {t('loading_draft_projects', 'Loading draft projects...')}
            </div>
          ) : draftProjects.length === 0 ? (
            <div className="bg-card border-border text-muted-foreground flex h-48 flex-col items-center justify-center rounded-lg border text-sm">
              <FolderKanban className="text-muted-foreground/30 mb-2 h-8 w-8" />
              {t(
                'no_drafts_in_progress',
                'No drafts in progress. Click "Initiate Case" to create one.',
              )}
            </div>
          ) : (
            <DataTable
              columns={draftProjects.length > 0 ? draftColumns : []}
              data={draftProjects}
              onRowClick={handleRowClick}
              actions={(row: Project) => (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.visit(`/projects/new?edit=${row.id}`);
                    }}
                    className="hover:bg-muted cursor-pointer rounded p-1.5 transition-colors"
                    title={t('edit', 'Edit')}
                  >
                    <Edit className="text-muted-foreground hover:text-foreground h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmit(row.id, row.title || row.name);
                    }}
                    className="hover:bg-success/15 hover:text-success cursor-pointer rounded p-1.5 transition-colors"
                    title={t('submit_for_approval', 'Submit for Approval')}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            />
          )}
        </div>

        {/* In-Flight review list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {t('in_flight_projects', 'Active Approval Tracking')}
            </h3>
            <span className="text-muted-foreground text-xs font-medium">
              {submittedProjects.length}{' '}
              {t('pending_approval_count', 'Pending Approval')}
            </span>
          </div>
          {loading ? (
            <div className="bg-card border-border text-muted-foreground flex h-48 items-center justify-center rounded-lg border text-sm">
              {t('loading_in_flight_projects', 'Loading in-flight projects...')}
            </div>
          ) : submittedProjects.length === 0 ? (
            <div className="bg-card border-border text-muted-foreground flex h-48 flex-col items-center justify-center rounded-lg border text-sm">
              <Clock className="text-muted-foreground/30 mb-2 h-8 w-8" />
              {t(
                'no_submitted_cases_under_review',
                'No submitted cases are currently under review.',
              )}
            </div>
          ) : (
            <DataTable
              columns={submittedProjects.length > 0 ? inFlightColumns : []}
              data={submittedProjects}
              onRowClick={handleRowClick}
              actions={(row: Project) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.visit(`/projects/${row.id}`);
                  }}
                  className="hover:bg-muted cursor-pointer rounded p-1.5 transition-colors"
                  title={t('view_progress_details', 'View Progress details')}
                >
                  <Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
                </button>
              )}
            />
          )}
        </div>
      </div>

      {/* Analytics Visualizers */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Status Breakdown */}
          {statusDistributionData.length > 0 && (
            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4 text-sm font-semibold">
                {t('case_portfolio_breakdown', 'Case Portfolio Breakdown')}
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
                      name={t('projects_count', 'Projects Count')}
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

          {/* Acquisition Purpose */}
          {purposeDistributionData.length > 0 && (
            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4 text-sm font-semibold">
                {t(
                  'land_acquisition_by_purpose',
                  'Land Acquisition by Purpose',
                )}
              </h3>
              <div className="flex h-64 flex-col items-center justify-center sm:flex-row">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={purposeDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {purposeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:ml-6 sm:mt-0">
                  {purposeDistributionData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs font-medium">
                        {entry.name}: {entry.value}{' '}
                        {t('cases_plural', 'Case(s)')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DODashboard.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
