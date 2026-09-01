import { router, usePage } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { confirmDialog, toastError, toastSuccess } from '@/lib/alerts';
import {
  getProjects,
  deleteProject,
  exportProjects,
} from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';

export default function ProjectList() {
  const { locale, t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userRole = user?.role?.role_name || 'User';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportProjects(format, undefined, locale);
    } catch (error) {
      console.error(`Failed to export projects as ${format}:`, error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirmDialog({
      title: t('delete_project'),
      text: `${t('delete_project_confirm')} "${name}"?`,
    });

    if (confirmed) {
      try {
        await deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toastSuccess(t('project_deleted_success'));
      } catch (error) {
        console.error('Failed to delete project:', error);
        toastError(t('project_delete_failed'));
      }
    }
  };

  const columns = [
    {
      key: 'projectId',
      label: t('project_id'),
      sortable: true,
      filterable: false,
    },
    {
      key: 'title',
      label: t('project_title_label'),
      sortable: true,
      filterable: false,
      render: (_val: any, row: any) => row.title || row.name || t('n_a'),
    },
    {
      key: 'institution',
      label: t('institution'),
      sortable: true,
      render: (_val: any, row: any) => (
        <div className="flex flex-col">
          <span className="text-foreground font-medium">
            {row.institution || t('n_a')}
          </span>
          {row.institutionAddress && (
            <span
              className="text-muted-foreground mt-0.5 max-w-[200px] truncate text-xs"
              title={row.institutionAddress}
            >
              {row.institutionAddress}
            </span>
          )}
        </div>
      ),
    },
    { key: 'purpose', label: t('purpose'), sortable: true },
    {
      key: 'landArea',
      label: t('land_area_arp'),
      sortable: true,
      filterable: false,
      render: (_val: any, row: any) => (
        <div className="flex flex-col">
          <span className="text-foreground font-medium">
            {row.landAreaAcers ?? 0} A, {row.landAreaRoods ?? 0} R,{' '}
            {row.landAreaPerches ?? 0} P
          </span>
          {row.fullLandArea !== undefined && row.fullLandArea !== null && (
            <span className="text-muted-foreground mt-0.5 text-xs">
              {t('total_label')}: {row.fullLandArea} {t('perches')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'approvalDate',
      label: t('approval_date'),
      sortable: true,
      filterable: false,
      render: (value: string | null) =>
        value ? new Date(value).toLocaleDateString() : t('n_a'),
    },
    {
      key: 'remarks',
      label: t('remarks'),
      sortable: true,
      filterable: false,
      render: (value: string | null) => value || t('n_a'),
    },
    {
      key: 'status',
      label: t('status'),
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'created_at',
      label: t('created_at'),
      sortable: true,
      filterable: false,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : t('n_a'),
    },
    {
      key: 'updated_at',
      label: t('updated_at'),
      sortable: true,
      filterable: false,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : t('n_a'),
    },
  ];

  const handleRowClick = (row: any) => {
    router.visit(`/projects/${row.id}`);
  };

  const actions = (row: any) => {
    const isDraft =
      (row.caseStatus || row.status || '').toLowerCase() === 'draft' ||
      (row.doStatus || '').toLowerCase() === 'draft';
    const canModify = userRole === 'DO' && isDraft;

    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.visit(`/projects/${row.id}`);
          }}
          className="hover:bg-muted rounded p-1.5 transition-colors"
          title={t('view')}
        >
          <Eye className="h-4 w-4" />
        </button>
        {canModify && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.visit(`/projects/new?edit=${row.id}`);
            }}
            className="hover:bg-muted rounded p-1.5 transition-colors"
            title={t('edit')}
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        {canModify && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id, row.name);
            }}
            className="hover:bg-destructive/10 text-destructive rounded p-1.5 transition-colors"
            title={t('delete')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>{t('projects')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('manage_land_acquisition_projects')}
          </p>
        </div>
        {userRole === 'DO' && (
          <button
            onClick={() => router.visit('/projects/new')}
            className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>{t('add_project')}</span>
          </button>
        )}
      </div>

      {/* Projects Table */}
      {loading ? (
        <div className="bg-card border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border">
          {t('loading_projects')}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          onRowClick={handleRowClick}
          onExport={handleExport}
          actions={actions}
        />
      )}
    </div>
  );
}

ProjectList.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
