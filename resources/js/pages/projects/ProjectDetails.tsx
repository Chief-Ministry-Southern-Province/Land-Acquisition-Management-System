import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Edit, Trash2, Upload } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import WorkflowTimeline from '@/components/ui/WorkflowTimeline';
import MainLayout from '@/layouts/MainLayout';
import {
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from '@/services/documentManagementService';
import { getProject } from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';

interface ProjectDetailsProps {
  id: string;
}

export default function ProjectDetails({ id }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userId = user?.id;
  const userRole = user?.role?.role_name || 'User';

  const fetchProjectDetails = useCallback(async () => {
    try {
      const data = await getProject(id);
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    }
  }, [id]);

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true);
        await fetchProjectDetails();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initialFetch();
    }
  }, [id, fetchProjectDetails]);

  const getCategoryFromModule = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;

      if (pathname.includes('/projects')) {
        return 'Acquisition Case';
      }

      if (pathname.includes('/land-parcels')) {
        return 'Land Parcels';
      }

      if (pathname.includes('/land-owners')) {
        return 'Property Owners';
      }
    }

    return 'Acquisition Case';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    try {
      setLoading(true);
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        await uploadDocument(
          file,
          String(userId),
          String(project?.id),
          getCategoryFromModule(),
        );
      }

      await fetchProjectDetails();
    } catch (error) {
      console.error('Failed to upload documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      await downloadDocument(docId, filename);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document.');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteDocument(docId);
      await fetchProjectDetails();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  const documentActions = (row: any) => (
    <div
      className="flex justify-end gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => handleDownload(row.id, row.name)}
        className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
        title="Download"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const parcels = project?.landParcels
    ? project.landParcels.map((p) => ({
        id: p.id,
        parcelId: p.parcel_id,
        landNo: p.parcel_id,
        village: p.village,
        extent: `${p.extent_acers} acres, ${p.extent_perches} perches`,
        status: p.status,
      }))
    : [];

  const owners = project?.landParcels
    ? Array.from(
        new Map(
          project.landParcels
            .flatMap((p) => p.owners || [])
            .map((o) => [o.id, o]),
        ).values(),
      ).map((o) => ({
        id: o.id,
        ownerId: o.ownerId,
        name: o.name,
        nic: o.nic,
        contact: o.contact,
        parcels:
          project.landParcels?.filter((p) =>
            p.owners?.some((po) => po.id === o.id),
          ).length || 0,
      }))
    : [];

  const valuations = [
    {
      id: 'VAL-5678',
      parcel: 'PCL-8934',
      marketValue: '₨ 12,500,000',
      assessed: '₨ 15,000,000',
      status: 'approved',
    },
    {
      id: 'VAL-5679',
      parcel: 'PCL-8935',
      marketValue: '₨ 9,000,000',
      assessed: '₨ 10,800,000',
      status: 'pending',
    },
  ];

  const compensations = [
    {
      id: 'COMP-3456',
      owner: 'W.A. Perera',
      amount: '₨ 15,000,000',
      approved: '2024-05-10',
      status: 'paid',
    },
    {
      id: 'COMP-3457',
      owner: 'S.M. Fernando',
      amount: '₨ 10,800,000',
      approved: '2024-05-15',
      status: 'pending',
    },
  ];

  const documents = project?.documents
    ? project.documents.map((doc) => ({
        id: doc.id,
        name: doc.original_filename,
        type: doc.file_type.replace('.', '').toUpperCase(),
        category: doc.document_category,
        uploadDate: doc.upload_date,
        size: doc.file_size,
      }))
    : [];

  const legalCases = [
    {
      caseNo: 'LEG-2024-023',
      court: 'District Court - Galle',
      parcel: 'PCL-8935',
      status: 'active',
    },
  ];

  const auditTrail = [
    {
      date: '2024-05-15 10:30',
      user: 'Land Officer',
      action: 'Updated parcel status',
      details: 'PCL-8935: In Progress',
    },
    {
      date: '2024-05-10 14:20',
      user: 'Finance Officer',
      action: 'Approved compensation',
      details: 'COMP-3456: ₨ 15,000,000',
    },
    {
      date: '2024-04-28 09:15',
      user: 'Valuation Officer',
      action: 'Submitted valuation',
      details: 'VAL-5678: ₨ 15,000,000',
    },
  ];

  const tabs = [
    { id: 'general', label: 'General Information' },
    { id: 'workflow', label: 'Acquisition Workflow' },
    { id: 'parcels', label: 'Land Parcels' },
    { id: 'owners', label: 'Owners' },
    { id: 'valuations', label: 'Valuations' },
    { id: 'compensation', label: 'Compensation' },
    { id: 'documents', label: 'Documents' },
    { id: 'legal', label: 'Legal Cases' },
    { id: 'audit', label: 'Audit Trail' },
  ];

  if (loading) {
    return (
      <div className="bg-card border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border">
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-card border-border text-destructive flex h-64 items-center justify-center rounded-lg border">
        Project not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className="hover:bg-muted rounded-lg p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1>{project.title || project.name}</h1>
              <StatusBadge status={(project.status || 'draft').toLowerCase()} />
            </div>
            <p className="text-muted-foreground">
              Project ID: {project.projectId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          {project &&
            (userRole !== 'DO' ||
              (project.caseStatus || project.status || '').toLowerCase() ===
                'draft') && (
              <button
                onClick={() => router.visit(`/projects/new?edit=${project.id}`)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Project</span>
              </button>
            )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-border border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="mb-4">Project Overview</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Project Title:</dt>
                <dd className="font-semibold">
                  {project.title || project.name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Institution:</dt>
                <dd>{project.institution || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Institution Address:</dt>
                <dd className="text-right">
                  {project.institutionAddress || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Purpose:</dt>
                <dd className="text-right">{project.purpose}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Land Area Breakdown:</dt>
                <dd className="font-mono">
                  {project.landAreaAcers ?? 0} A, {project.landAreaRoods ?? 0}{' '}
                  R, {project.landAreaPerches ?? 0} P
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Acquired Area:</dt>
                <dd className="font-semibold">
                  {project.fullLandArea ?? 0} Perches
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Temporary Relocation:</dt>
                <dd>{project.areResidentsMovedTemp ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Approval Date:</dt>
                <dd>{project.approvalDate || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="mb-4">Legal Sections (Items 20 - 26)</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sec 20 Observation:</dt>
                <dd>
                  {project.section20Observation !== null
                    ? project.section20Observation
                      ? 'Passed'
                      : 'Pending'
                    : 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Sec 21 Secretary Report:
                </dt>
                <dd>
                  {project.section21SecretaryReport !== null
                    ? project.section21SecretaryReport
                      ? 'Completed'
                      : 'Pending'
                    : 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Sec 22 Recommendation:
                </dt>
                <dd className="text-right">
                  {project.section22SecretaryRecommendation || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sec 23 Valuation Rec:</dt>
                <dd className="text-right">
                  {project.section23ValuationRecommendation || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Sec 24 Decision Remarks:
                </dt>
                <dd>
                  {project.section24DecisionRemarks !== null
                    ? project.section24DecisionRemarks
                      ? 'Approved'
                      : 'Pending'
                    : 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sec 25 Conditions:</dt>
                <dd className="text-right">
                  {project.section25AdditionalConditions || 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sec 26 Final Rec:</dt>
                <dd>
                  {project.section26FinalRecommendation !== null
                    ? project.section26FinalRecommendation
                      ? 'Approved'
                      : 'Pending'
                    : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'workflow' && (
        <WorkflowTimeline
          projectId={project.projectId}
          projectName={project.name}
        />
      )}

      {activeTab === 'parcels' && (
        <DataTable
          columns={[
            { key: 'parcelId', label: 'Parcel ID', sortable: true },
            { key: 'landNo', label: 'Land No', sortable: true },
            { key: 'village', label: 'Village', sortable: true },
            { key: 'extent', label: 'Extent', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => <StatusBadge status={value} />,
            },
          ]}
          data={parcels}
          onRowClick={(row) => router.visit(`/land-parcels/${row.id}`)}
        />
      )}

      {activeTab === 'owners' && (
        <DataTable
          columns={[
            { key: 'ownerId', label: 'Owner ID', sortable: true },
            { key: 'name', label: 'Name', sortable: true },
            { key: 'nic', label: 'NIC', sortable: true },
            { key: 'contact', label: 'Contact', sortable: true },
            { key: 'parcels', label: 'Parcels', sortable: true },
          ]}
          data={owners}
          onRowClick={(row) => router.visit(`/land-owners/${row.id}`)}
        />
      )}

      {activeTab === 'valuations' && (
        <DataTable
          columns={[
            { key: 'id', label: 'Valuation ID', sortable: true },
            { key: 'parcel', label: 'Parcel', sortable: true },
            { key: 'marketValue', label: 'Market Value', sortable: true },
            { key: 'assessed', label: 'Assessed Value', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => <StatusBadge status={value} />,
            },
          ]}
          data={valuations}
        />
      )}

      {activeTab === 'compensation' && (
        <DataTable
          columns={[
            { key: 'id', label: 'Compensation ID', sortable: true },
            { key: 'owner', label: 'Owner', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
            { key: 'approved', label: 'Approved Date', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => <StatusBadge status={value} />,
            },
          ]}
          data={compensations}
        />
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="text-base font-semibold">Project Documents</h3>
              <p className="text-muted-foreground text-sm">
                Manage and upload documents related to this project.
              </p>
            </div>
            <div>
              <label className="bg-primary hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors">
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.docx,.dwg"
                  multiple
                />
              </label>
            </div>
          </div>

          <DataTable
            columns={[
              { key: 'name', label: 'Document Name', sortable: true },
              { key: 'type', label: 'Type', sortable: true },
              { key: 'category', label: 'Category', sortable: true },
              { key: 'uploadDate', label: 'Upload Date', sortable: true },
              { key: 'size', label: 'Size', sortable: true },
            ]}
            data={documents}
            actions={documentActions}
          />
        </div>
      )}

      {activeTab === 'legal' && (
        <DataTable
          columns={[
            { key: 'caseNo', label: 'Case Number', sortable: true },
            { key: 'court', label: 'Court', sortable: true },
            { key: 'parcel', label: 'Related Parcel', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => <StatusBadge status={value} />,
            },
          ]}
          data={legalCases}
        />
      )}

      {activeTab === 'audit' && (
        <DataTable
          columns={[
            { key: 'date', label: 'Date & Time', sortable: true },
            { key: 'user', label: 'User', sortable: true },
            { key: 'action', label: 'Action', sortable: true },
            { key: 'details', label: 'Details', sortable: true },
          ]}
          data={auditTrail}
          searchable={false}
          filterable={false}
          exportable={false}
        />
      )}
    </div>
  );
}

ProjectDetails.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
