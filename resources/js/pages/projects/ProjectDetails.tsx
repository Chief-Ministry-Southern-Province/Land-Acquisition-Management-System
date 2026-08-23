import { Link, router, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  DollarSign,
  Download,
  Edit,
  Send,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import WorkflowTimeline from '@/components/ui/WorkflowTimeline';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { confirmDialog, confirmAction, toastError, toastSuccess } from '@/lib/alerts';
import api from '@/services/api';
import {
  deleteDocument,
  downloadDocument,
  uploadDocument,
} from '@/services/documentManagementService';
import {
  exportProjects,
  getProject,
  submitProject,
} from '@/services/projectsManagementService';
import type { Project } from '@/services/projectsManagementService';

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) {
    return 'N/A';
  }

  try {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

interface ProjectDetailsProps {
  id: string;
}

export default function ProjectDetails({ id }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [project, setProject] = useState<Project | null>(null);
  const [dbCompensations, setDbCompensations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const { locale } = useTranslation();

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userId = user?.id;
  const userRole = user?.role?.role_name || 'User';

  const fetchProjectDetails = useCallback(async () => {
    try {
      const data = await getProject(id);
      setProject(data);

      try {
        const compResponse = await api.get('/api/compensation');
        setDbCompensations(compResponse.data.compensations || []);
      } catch (err) {
        console.error(
          'Failed to fetch compensations for project details:',
          err,
        );
      }
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
      toastError('Failed to download document.');
    }
  };

  const handleDelete = async (docId: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete Document',
      text: 'Are you sure you want to delete this document?',
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await deleteDocument(docId);
      await fetchProjectDetails();
      toastSuccess('Document deleted successfully.');
    } catch (error) {
      console.error('Failed to delete document:', error);
      toastError('Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportProjects(format, id, locale);
    } catch (error) {
      console.error(`Failed to export project details as ${format}:`, error);
      toastError(`Failed to export project details.`);
    }
  };

  const handleSubmitProject = async () => {
    if (!project) {
      return;
    }

    const confirmed = await confirmAction({
      title: 'Submit Project',
      text: 'Are you sure you want to submit this project? This will change status to Pending.',
      confirmButtonText: 'Submit',
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await submitProject(project.id);
      await fetchProjectDetails();
      toastSuccess('Project submitted successfully!');
    } catch (error) {
      console.error('Failed to submit project:', error);
      toastError('Failed to submit project.');
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
      {userRole === 'DO' && (
        <button
          onClick={() => handleDelete(row.id)}
          className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
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

  const valuations =
    project?.landParcels?.flatMap(
      (p) =>
        p.valuations?.map((v: any) => ({
          id: `VAL-${v.id}`,
          parcel: p.parcel_id,
          marketValue: `₨ ${Number(v.land_value).toLocaleString()}`,
          assessed: `₨ ${Number(v.total_valuation).toLocaleString()}`,
          status: v.status,
        })) || [],
    ) || [];

  const compensations =
    project?.landParcels?.flatMap(
      (p) =>
        p.compensations?.map((c: any) => ({
          id: `COMP-${c.id}`,
          owner: c.owner?.name || 'N/A',
          amount: `₨ ${Number(c.amount).toLocaleString()}`,
          approved: c.approved_date ? c.approved_date.split('T')[0] : 'N/A',
          status: c.status,
        })) || [],
    ) || [];

  const totalEstimatedValue =
    project?.landParcels?.reduce(
      (sum, p) => sum + Number(p.estimated_value || 0),
      0,
    ) || 0;
  const totalValuationAssessed =
    project?.landParcels?.reduce((sum, p) => {
      return (
        sum +
        (p.valuations?.reduce(
          (s: number, v: any) => s + Number(v.total_valuation || 0),
          0,
        ) || 0)
      );
    }, 0) || 0;
  const totalCompensationCalculated =
    project?.landParcels?.reduce((sum, p) => {
      return (
        sum +
        (p.compensations?.reduce(
          (s: number, c: any) => s + Number(c.amount || 0),
          0,
        ) || 0)
      );
    }, 0) || 0;
  const totalDisbursedPayments =
    project?.landParcels?.reduce((sum, p) => {
      return (
        sum +
        (p.compensations?.reduce((s: number, c: any) => {
          return (
            s +
            (c.payments?.reduce(
              (sp: number, pay: any) => sp + Number(pay.amount_paid || 0),
              0,
            ) || 0)
          );
        }, 0) || 0)
      );
    }, 0) || 0;

  const documents = project?.documents
    ? project.documents.map((doc) => ({
        id: doc.id,
        name: doc.original_filename,
        type: doc.file_type.replace('.', '').toUpperCase(),
        category: doc.document_category,
        uploadDate: formatDate(doc.upload_date),
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
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            {showExportDropdown && (
              <div className="bg-card border-border absolute right-0 z-50 mt-2 w-36 rounded-lg border py-1 shadow-lg">
                <button
                  onClick={() => {
                    handleExport('pdf');
                    setShowExportDropdown(false);
                  }}
                  className="text-foreground hover:bg-muted w-full px-4 py-2 text-left text-sm font-medium transition-colors"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    handleExport('excel');
                    setShowExportDropdown(false);
                  }}
                  className="text-foreground hover:bg-muted w-full px-4 py-2 text-left text-sm font-medium transition-colors"
                >
                  Export Excel
                </button>
                <button
                  onClick={() => {
                    handleExport('csv');
                    setShowExportDropdown(false);
                  }}
                  className="text-foreground hover:bg-muted w-full px-4 py-2 text-left text-sm font-medium transition-colors"
                >
                  Export CSV
                </button>
              </div>
            )}
          </div>
          {project &&
            userRole === 'DO' &&
            ((project.caseStatus || project.status || '').toLowerCase() ===
              'draft' ||
              (project.doStatus || '').toLowerCase() === 'draft') && (
              <button
                onClick={() => router.visit(`/projects/new?edit=${project.id}`)}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Project</span>
              </button>
            )}
          {project &&
            project.doStatus === 'draft' &&
            (userRole === 'DO' || userRole === 'Admin') && (
              <button
                onClick={handleSubmitProject}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
                <span>Submit Project</span>
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
        <div className="space-y-6">
          {/* Financial Aggregations Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card border-border shadow-xs flex flex-col justify-between rounded-lg border p-5">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                Total Estimated Value
              </span>
              <span className="text-foreground mt-2 font-mono text-xl font-bold">
                ₨ {totalEstimatedValue.toLocaleString()}
              </span>
            </div>
            <div className="bg-card border-border shadow-xs flex flex-col justify-between rounded-lg border p-5">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                Total Valuation Assessed
              </span>
              <span className="mt-2 font-mono text-xl font-bold text-emerald-600">
                ₨ {totalValuationAssessed.toLocaleString()}
              </span>
            </div>
            <div className="bg-card border-border shadow-xs flex flex-col justify-between rounded-lg border p-5">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                Total Compensation Calculated
              </span>
              <span className="text-primary mt-2 font-mono text-xl font-bold">
                ₨ {totalCompensationCalculated.toLocaleString()}
              </span>
            </div>
            <div className="bg-card border-border shadow-xs flex flex-col justify-between rounded-lg border p-5">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                Total Disbursed Payments
              </span>
              <span className="mt-2 font-mono text-xl font-bold text-emerald-700">
                ₨ {totalDisbursedPayments.toLocaleString()}
              </span>
            </div>
          </div>

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
                  <dt className="text-muted-foreground">
                    Institution Address:
                  </dt>
                  <dd className="text-right">
                    {project.institutionAddress || 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Purpose:</dt>
                  <dd className="text-right">{project.purpose}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Land Area Breakdown:
                  </dt>
                  <dd className="font-mono">
                    {project.landAreaAcers ?? 0} A, {project.landAreaRoods ?? 0}{' '}
                    R, {project.landAreaPerches ?? 0} P
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Total Acquired Area:
                  </dt>
                  <dd className="font-semibold">
                    {project.fullLandArea ?? 0} Perches
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Temporary Relocation:
                  </dt>
                  <dd>{project.areResidentsMovedTemp ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Approval Date:</dt>
                  <dd>{formatDate(project.approvalDate)}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-card border-border rounded-lg border p-6">
              <h3 className="mb-4">Statutory Compliance Details</h3>
              <div className="space-y-4">
                {/* Section 20 */}
                <div className="border-border/60 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Whether the proposed land is a land allocated to land
                        owners under statutory notifications under the Land
                        Reform Act:
                      </p>
                    </div>
                    <div className="mt-1 shrink-0">
                      {project.section20Observation !== null ? (
                        project.section20Observation ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge variant="danger">No</Badge>
                        )
                      ) : (
                        <Badge variant="default">N/A</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 21 */}
                <div className="border-border/60 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Whether there are alternative State lands or lands
                        belonging to the Land Reform Commission that can be
                        utilized for the proposed public purpose?
                      </p>
                    </div>
                    <div className="mt-1 shrink-0">
                      {project.section21SecretaryReport !== null ? (
                        project.section21SecretaryReport ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge variant="danger">No</Badge>
                        )
                      ) : (
                        <Badge variant="default">N/A</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 22 */}
                <div className="border-border/60 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Name and designation of the officer who selected this land
                      as suitable for the proposed public purpose:
                    </p>
                    <div className="bg-muted/40 border-border/50 flex items-center gap-2.5 rounded-lg border p-3 text-sm">
                      <User className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-foreground font-semibold">
                        {project.section22SecretaryRecommendation || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 23 */}
                <div className="border-border/60 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Name and designation of the officer who recommended that
                      this land is suitable to be acquired for the proposed
                      public purpose:
                    </p>
                    <div className="bg-muted/40 border-border/50 flex items-center gap-2.5 rounded-lg border p-3 text-sm">
                      <User className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-foreground font-semibold">
                        {project.section23ValuationRecommendation || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 24 */}
                <div className="border-border/60 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Whether it was inquired if there are other suitable
                        State or private lands in this area for this purpose:
                      </p>
                    </div>
                    <div className="mt-1 shrink-0">
                      {project.section24DecisionRemarks !== null ? (
                        project.section24DecisionRemarks ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge variant="danger">No</Badge>
                        )
                      ) : (
                        <Badge variant="default">N/A</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 25 */}
                <div className="border-border/60 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Clearly specify the source of funds allocated to bear the
                      acquisition, compensation, and other necessary expenses:
                    </p>
                    <div className="bg-muted/40 border-border/50 flex items-center gap-2.5 rounded-lg border p-3 text-sm">
                      <DollarSign className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="text-foreground font-semibold">
                        {project.section25AdditionalConditions || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 26 */}
                <div className="border-border/60 border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Whether the selection of the proposed land for public
                        purpose complies with the general development plan of
                        the area, and whether agreement/consent was obtained
                        from the relevant Local Authority / Urban Development
                        Department or relevant institute:
                      </p>
                    </div>
                    <div className="mt-1 shrink-0">
                      {project.section26FinalRecommendation !== null ? (
                        project.section26FinalRecommendation ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge variant="danger">No</Badge>
                        )
                      ) : (
                        <Badge variant="default">N/A</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workflow' && project && (
        <div className="space-y-6">
          <WorkflowTimeline project={project} compensations={dbCompensations} />

          <div className="bg-card border-border space-y-4 rounded-lg border p-6">
            <div>
              <h3 className="text-foreground text-base font-bold">
                Parcel Workflow Progress Checklist
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Milestone tracking mapping the data logging progress of each
                land parcel under this project.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground border-border border-b text-xs font-bold uppercase">
                    <th className="px-4 py-3">Parcel ID</th>
                    <th className="px-4 py-3">Name / Location</th>
                    <th className="px-4 py-3 text-center">Land Registered</th>
                    <th className="px-4 py-3 text-center">Survey Plan</th>
                    <th className="px-4 py-3 text-center">Valuation Report</th>
                    <th className="px-4 py-3 text-center">
                      Compensation Setup
                    </th>
                    <th className="px-4 py-3">Payment Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y text-xs">
                  {project.landParcels?.map((p: any) => {
                    const hasSurvey = p.surveys && p.surveys.length > 0;
                    const hasValuation =
                      p.valuations && p.valuations.length > 0;
                    const hasComp =
                      p.compensations && p.compensations.length > 0;

                    // Payment progress
                    let paymentProgressText = 'Pending (0%)';

                    if (hasComp) {
                      const totalComp = p.compensations.reduce(
                        (sum: number, c: any) => sum + Number(c.amount || 0),
                        0,
                      );
                      const totalPaid = p.compensations.reduce(
                        (sum: number, c: any) => {
                          return (
                            sum +
                            (c.payments?.reduce(
                              (s: number, pay: any) =>
                                s + Number(pay.amount_paid || 0),
                              0,
                            ) || 0)
                          );
                        },
                        0,
                      );

                      if (totalComp === 0) {
                        paymentProgressText = 'Fully Paid (100%)';
                      } else {
                        const pct = Math.round((totalPaid / totalComp) * 100);

                        if (pct >= 100) {
                          paymentProgressText = 'Fully Paid (100%)';
                        } else if (pct === 0) {
                          paymentProgressText = 'Pending (0%)';
                        } else {
                          paymentProgressText = `In Progress (${pct}%)`;
                        }
                      }
                    }

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-muted/10 cursor-pointer"
                        onClick={() => router.visit(`/land-parcels/${p.id}`)}
                      >
                        <td className="text-primary px-4 py-3 font-semibold">
                          {p.parcel_id}
                        </td>
                        <td className="px-4 py-3">
                          {p.land_name || 'N/A'}
                          <span className="text-muted-foreground block text-[10px]">
                            {p.village}, {p.district}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-emerald-600">
                          ✅
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasSurvey ? '✅' : '❌'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasValuation ? '✅' : '❌'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {hasComp ? '✅' : '❌'}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <span
                            className={
                              paymentProgressText.startsWith('Fully')
                                ? 'font-bold text-green-600'
                                : 'text-amber-600'
                            }
                          >
                            {paymentProgressText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {(!project.landParcels ||
                    project.landParcels.length === 0) && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-muted-foreground px-4 py-6 text-center"
                      >
                        No land parcels registered under this project.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
            {userRole === 'DO' && (
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
            )}
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
