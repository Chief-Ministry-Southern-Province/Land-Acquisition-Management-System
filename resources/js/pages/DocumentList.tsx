import { Download, FileText, Folder, Upload } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import MainLayout from '@/layouts/MainLayout';

export default function DocumentList() {
  const [selectedFolder, setSelectedFolder] = useState('all');

  const folders = [
    { id: 'all', name: 'All Documents', count: 156 },
    { id: 'projects', name: 'Projects', count: 48 },
    { id: 'surveys', name: 'Surveys', count: 32 },
    { id: 'valuations', name: 'Valuations', count: 28 },
    { id: 'compensation', name: 'Compensation', count: 24 },
    { id: 'legal', name: 'Legal', count: 18 },
    { id: 'gazette', name: 'Gazette Notices', count: 6 },
  ];

  const documents = [
    {
      id: 1,
      name: 'Project Approval - PRJ-2024-045',
      type: 'PDF',
      category: 'Projects',
      size: '2.3 MB',
      uploadDate: '2024-01-15',
      uploadedBy: 'Admin User',
    },
    {
      id: 2,
      name: 'Survey Plan - PCL-8934',
      type: 'PDF',
      category: 'Surveys',
      size: '8.2 MB',
      uploadDate: '2024-03-10',
      uploadedBy: 'Survey Officer',
    },
    {
      id: 3,
      name: 'Valuation Report - VAL-5678',
      type: 'PDF',
      category: 'Valuations',
      size: '1.5 MB',
      uploadDate: '2024-04-20',
      uploadedBy: 'Valuation Officer',
    },
    {
      id: 4,
      name: 'Compensation Calculation - COMP-3456',
      type: 'XLSX',
      category: 'Compensation',
      size: '450 KB',
      uploadDate: '2024-05-10',
      uploadedBy: 'Finance Officer',
    },
    {
      id: 5,
      name: 'Legal Petition - LEG-2024-023',
      type: 'PDF',
      category: 'Legal',
      size: '3.1 MB',
      uploadDate: '2024-04-15',
      uploadedBy: 'Legal Officer',
    },
    {
      id: 6,
      name: 'Gazette Notice - GAZ-2024-045',
      type: 'PDF',
      category: 'Gazette',
      size: '1.8 MB',
      uploadDate: '2024-05-01',
      uploadedBy: 'Land Officer',
    },
    {
      id: 7,
      name: 'Environmental Impact Assessment',
      type: 'PDF',
      category: 'Projects',
      size: '15.7 MB',
      uploadDate: '2024-01-20',
      uploadedBy: 'Admin User',
    },
    {
      id: 8,
      name: 'Ownership Certificate - OWN-1247',
      type: 'PDF',
      category: 'Legal',
      size: '890 KB',
      uploadDate: '2024-02-05',
      uploadedBy: 'Data Entry Operator',
    },
  ];

  const filteredDocs =
    selectedFolder === 'all'
      ? documents
      : documents.filter(
          (doc) =>
            doc.category === folders.find((f) => f.id === selectedFolder)?.name,
        );

  const columns = [
    {
      key: 'name',
      label: 'Document Name',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="text-primary h-4 w-4" />
          <span>{value}</span>
        </div>
      ),
    },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'size', label: 'Size', sortable: true },
    { key: 'uploadDate', label: 'Upload Date', sortable: true },
    { key: 'uploadedBy', label: 'Uploaded By', sortable: true },
  ];

  const actions = () => (
    <button
      className="hover:bg-muted rounded p-1.5 transition-colors"
      title="Download"
    >
      <Download className="h-4 w-4" />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Document Management</h1>
          <p className="text-muted-foreground mt-1">
            Organize and manage project documents
          </p>
        </div>
        <button className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors">
          <Upload className="h-5 w-5" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Folder Sidebar */}
        <div className="bg-card border-border rounded-lg border p-4">
          <h3 className="mb-4">Folders</h3>
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span className="text-sm">{folder.name}</span>
                </div>
                <span className="text-xs">{folder.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Document List */}
        <div className="lg:col-span-3">
          <DataTable columns={columns} data={filteredDocs} actions={actions} />
        </div>
      </div>
    </div>
  );
}

DocumentList.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
