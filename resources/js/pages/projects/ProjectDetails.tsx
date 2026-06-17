import { Link } from '@inertiajs/react';
import { ArrowLeft, Download, Edit } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import WorkflowTimeline from '@/components/ui/WorkflowTimeline';
import MainLayout from '@/layouts/MainLayout';

export default function ProjectDetails() {
  const [activeTab, setActiveTab] = useState('general');

  const project = {
    id: 'PRJ-2024-045',
    name: 'Southern Highway Expansion Phase 2',
    ministry: 'Ministry of Highways',
    district: 'Galle',
    division: 'Galle Four Gravets',
    type: 'Highway',
    purpose: 'Construction of 4-lane highway from Galle to Matara',
    startDate: '2024-01-15',
    estimatedCompletion: '2026-12-31',
    budget: '₨ 2,500,000,000',
    status: 'Active',
    projectManager: 'Eng. K.P. Silva',
    contactNumber: '+94 77 123 4567',
    email: 'kpsilva@highways.gov.lk',
  };

  const parcels = [
    {
      id: 'PCL-8934',
      surveyNo: '123/4A',
      village: 'Unawatuna',
      extent: '2.5 acres',
      status: 'acquired',
    },
    {
      id: 'PCL-8935',
      surveyNo: '124/1B',
      village: 'Galle',
      extent: '1.8 acres',
      status: 'in-progress',
    },
    {
      id: 'PCL-8936',
      surveyNo: '125/3',
      village: 'Habaraduwa',
      extent: '3.2 acres',
      status: 'pending',
    },
  ];

  const owners = [
    {
      id: 'OWN-1247',
      name: 'W.A. Perera',
      nic: '722345678V',
      contact: '+94 71 234 5678',
      parcels: 2,
    },
    {
      id: 'OWN-1248',
      name: 'S.M. Fernando',
      nic: '801234567V',
      contact: '+94 77 345 6789',
      parcels: 1,
    },
    {
      id: 'OWN-1249',
      name: 'R.K. Silva',
      nic: '691234567V',
      contact: '+94 76 456 7890',
      parcels: 1,
    },
  ];

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

  const documents = [
    {
      name: 'Project Approval Letter',
      type: 'PDF',
      uploadDate: '2024-01-15',
      size: '2.3 MB',
    },
    {
      name: 'Environmental Impact Assessment',
      type: 'PDF',
      uploadDate: '2024-01-20',
      size: '15.7 MB',
    },
    {
      name: 'Survey Plans',
      type: 'DWG',
      uploadDate: '2024-02-05',
      size: '8.2 MB',
    },
  ];

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
              <h1>{project.name}</h1>
              <StatusBadge status={project.status.toLowerCase()} />
            </div>
            <p className="text-muted-foreground">Project ID: {project.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors">
            <Edit className="h-4 w-4" />
            <span>Edit Project</span>
          </button>
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
            <h3 className="mb-4">Project Details</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ministry:</dt>
                <dd>{project.ministry}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">District:</dt>
                <dd>{project.district}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Division:</dt>
                <dd>{project.division}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type:</dt>
                <dd>{project.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Purpose:</dt>
                <dd className="text-right">{project.purpose}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Budget:</dt>
                <dd>{project.budget}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-card border-border rounded-lg border p-6">
            <h3 className="mb-4">Timeline & Contact</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Start Date:</dt>
                <dd>{project.startDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Est. Completion:</dt>
                <dd>{project.estimatedCompletion}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Project Manager:</dt>
                <dd>{project.projectManager}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Contact:</dt>
                <dd>{project.contactNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email:</dt>
                <dd>{project.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'workflow' && (
        <WorkflowTimeline projectId={project.id} projectName={project.name} />
      )}

      {activeTab === 'parcels' && (
        <DataTable
          columns={[
            { key: 'id', label: 'Parcel ID', sortable: true },
            { key: 'surveyNo', label: 'Survey No', sortable: true },
            { key: 'village', label: 'Village', sortable: true },
            { key: 'extent', label: 'Extent', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (value: string) => <StatusBadge status={value} />,
            },
          ]}
          data={parcels}
        />
      )}

      {activeTab === 'owners' && (
        <DataTable
          columns={[
            { key: 'id', label: 'Owner ID', sortable: true },
            { key: 'name', label: 'Name', sortable: true },
            { key: 'nic', label: 'NIC', sortable: true },
            { key: 'contact', label: 'Contact', sortable: true },
            { key: 'parcels', label: 'Parcels', sortable: true },
          ]}
          data={owners}
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
        <DataTable
          columns={[
            { key: 'name', label: 'Document Name', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'uploadDate', label: 'Upload Date', sortable: true },
            { key: 'size', label: 'Size', sortable: true },
          ]}
          data={documents}
        />
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
