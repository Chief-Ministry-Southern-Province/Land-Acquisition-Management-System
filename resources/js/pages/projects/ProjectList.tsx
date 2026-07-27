import { router, usePage } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';
import {
  getProjects,
  deleteProject,
} from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';

export default function ProjectList() {
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

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete project "${name}"?`)) {
      try {
        await deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const columns = [
    { key: 'projectId', label: 'Project ID', sortable: true },
    {
      key: 'title',
      label: 'Project Title',
      sortable: true,
      render: (_val: any, row: any) => row.title || row.name || 'N/A',
    },
    {
      key: 'institution',
      label: 'Institution',
      sortable: true,
      render: (_val: any, row: any) => row.institution || 'N/A',
    },
    { key: 'purpose', label: 'Purpose', sortable: true },
    {
      key: 'landArea',
      label: 'Land Area (A-R-P)',
      sortable: true,
      render: (_val: any, row: any) =>
        `${row.landAreaAcers ?? 0} A, ${row.landAreaRoods ?? 0} R, ${row.landAreaPerches ?? 0} P`,
    },
    {
      key: 'approvalDate',
      label: 'Approval Date',
      sortable: true,
      render: (value: string | null) => value || 'N/A',
    },
    {
      key: 'remarks',
      label: 'Remarks',
      sortable: true,
      render: (value: string | null) => value || 'N/A',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      key: 'updated_at',
      label: 'Updated At',
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : 'N/A',
    },
  ];

  const handleRowClick = (row: any) => {
    router.visit(`/projects/${row.id}`);
  };

  const actions = (row: any) => {
    const isDraft =
      (row.caseStatus || row.status || '').toLowerCase() === 'draft' ||
      (row.doStatus || '').toLowerCase() === 'draft';
    const canModify = userRole !== 'DO' || isDraft;

    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.visit(`/projects/${row.id}`);
          }}
          className="hover:bg-muted rounded p-1.5 transition-colors"
          title="View"
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
            title="Edit"
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
            title="Delete"
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
          <h1>Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage land acquisition projects
          </p>
        </div>
        <button
          onClick={() => router.visit('/projects/new')}
          className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Projects Table */}
      {loading ? (
        <div className="bg-card border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border">
          Loading projects...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          onRowClick={handleRowClick}
          actions={actions}
        />
      )}
    </div>
  );
}

ProjectList.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
