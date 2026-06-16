import { router } from '@inertiajs/react';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';

export default function ProjectList() {
    const projects = [
    {
      id: "PRJ-2024-045",
      name: "Southern Highway Expansion Phase 2",
      ministry: "Ministry of Highways",
      district: "Galle",
      type: "Highway",
      startDate: "2024-01-15",
      status: "active",
    },
    {
      id: "PRJ-2024-043",
      name: "Mattala Airport Development",
      ministry: "Ministry of Aviation",
      district: "Hambantota",
      type: "Airport",
      startDate: "2024-02-20",
      status: "in-progress",
    },
    {
      id: "PRJ-2024-041",
      name: "Colombo Metro Rail Extension",
      ministry: "Ministry of Transport",
      district: "Colombo",
      type: "Railway",
      startDate: "2023-11-10",
      status: "active",
    },
    {
      id: "PRJ-2024-038",
      name: "Trincomalee Port Expansion",
      ministry: "Ministry of Ports",
      district: "Trincomalee",
      type: "Port",
      startDate: "2024-03-05",
      status: "pending",
    },
    {
      id: "PRJ-2023-122",
      name: "Kandy Urban Infrastructure Project",
      ministry: "Ministry of Urban Development",
      district: "Kandy",
      type: "Urban Development",
      startDate: "2023-08-22",
      status: "completed",
    },
    {
      id: "PRJ-2024-047",
      name: "Jaffna Irrigation Scheme",
      ministry: "Ministry of Agriculture",
      district: "Jaffna",
      type: "Irrigation",
      startDate: "2024-04-01",
      status: "active",
    },
    {
      id: "PRJ-2024-049",
      name: "Gampaha Industrial Zone",
      ministry: "Ministry of Industry",
      district: "Gampaha",
      type: "Industrial",
      startDate: "2024-05-10",
      status: "pending",
    },
    {
      id: "PRJ-2023-115",
      name: "Anuradhapura Heritage Conservation",
      ministry: "Ministry of Cultural Affairs",
      district: "Anuradhapura",
      type: "Heritage",
      startDate: "2023-06-15",
      status: "completed",
    },
  ];

  const columns = [
    { key: "id", label: "Project ID", sortable: true },
    { key: "name", label: "Project Name", sortable: true },
    { key: "ministry", label: "Ministry", sortable: true },
    { key: "district", label: "District", sortable: true },
    { key: "type", label: "Acquisition Type", sortable: true },
    { key: "startDate", label: "Start Date", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  const handleRowClick = (row: any) => {
    router.visit(`/projects/${row.id}`);
  };

  const actions = (row: any) => (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.visit(`/projects/${row.id}`);
        }}
        className="p-1.5 hover:bg-muted rounded transition-colors"
        title="View"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 hover:bg-muted rounded transition-colors"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Projects</h1>
          <p className="text-muted-foreground mt-1">Manage land acquisition projects</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Projects Table */}
      <DataTable
        columns={columns}
        data={projects}
        onRowClick={handleRowClick}
        actions={actions}
      />
    </div>
  );
}

ProjectList.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
