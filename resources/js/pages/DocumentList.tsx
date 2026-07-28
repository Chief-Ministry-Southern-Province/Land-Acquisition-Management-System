import { usePage } from '@inertiajs/react';
import {
  Download,
  FileText,
  Folder,
  Upload,
  Trash2,
  Filter,
  Plus,
  Search,
  X,
  Building,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SyncLoader } from 'react-spinners';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from '@/services/documentManagementService';
import { getLandParcels } from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';
import type { Project } from '@/services/projectsManagementService';
import { getProjects } from '@/services/projectsManagementService';

export default function DocumentList() {
  const { props: pageProps } = usePage();
  const loggedInUser = (pageProps.auth as any)?.user;
  const userId = loggedInUser?.id || '';

  // Data states
  const [documents, setDocuments] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [landParcels, setLandParcels] = useState<LandParcel[]>([]);

  // Filter/Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [parcelFilter, setParcelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  // Upload Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('Approvals');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [uploadProjectId, setUploadProjectId] = useState<string>('');
  const [uploadParcelId, setUploadParcelId] = useState<string>('');

  // Available categories
  const categoriesList = [
    'Approvals',
    'Reports',
    'Survey Plan',
    'Valuation',
    'Compensation',
    'Legal',
    'Gazette Notice',
    'Other',
  ];

  // Load all initial data on mount
  const loadPageData = async () => {
    try {
      setLoading(true);
      const [docsData, projsData, parcelsData] = await Promise.all([
        getDocuments(),
        getProjects(),
        getLandParcels(),
      ]);
      setDocuments(docsData);
      setProjects(projsData);
      setLandParcels(parcelsData);
    } catch (error) {
      console.error('Failed to load document list page data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  // Normalizer to classify category into folders
  const getCategoryKey = (cat: string) => {
    const c = cat ? cat.toLowerCase() : '';

    if (c.includes('approval')) {
      return 'approvals';
    }

    if (c.includes('report') || c.includes('assessment')) {
      return 'reports';
    }

    if (c.includes('survey') || c.includes('plan')) {
      return 'survey';
    }

    if (c.includes('valuation')) {
      return 'valuation';
    }

    if (c.includes('compensation') || c.includes('payment')) {
      return 'compensation';
    }

    if (
      c.includes('legal') ||
      c.includes('court') ||
      c.includes('petition') ||
      c.includes('ownership')
    ) {
      return 'legal';
    }

    if (c.includes('gazette') || c.includes('notice')) {
      return 'gazette';
    }

    return 'other';
  };

  const categories = [
    { id: 'all', name: 'All Documents' },
    { id: 'approvals', name: 'Approvals' },
    { id: 'reports', name: 'Reports' },
    { id: 'survey', name: 'Survey Plans' },
    { id: 'valuation', name: 'Valuations' },
    { id: 'compensation', name: 'Compensation' },
    { id: 'legal', name: 'Legal Cases' },
    { id: 'gazette', name: 'Gazette Notices' },
    { id: 'other', name: 'Others' },
  ];

  // Dynamic counts for each folder
  const categoryCounts = categories.reduce(
    (acc, cat) => {
      if (cat.id === 'all') {
        acc[cat.id] = documents.length;
      } else {
        acc[cat.id] = documents.filter(
          (doc) => getCategoryKey(doc.document_category) === cat.id,
        ).length;
      }

      return acc;
    },
    {} as Record<string, number>,
  );

  // Handle file deletion
  const handleDeleteDoc = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteDocument(id);
      await loadPageData();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document. Please try again.');
      setLoading(false);
    }
  };

  // Handle file download
  const handleDownloadDoc = async (id: string, name: string) => {
    try {
      await downloadDocument(id, name);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document.');
    }
  };

  // Handle file upload submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a file to upload.');

      return;
    }

    const finalCategory =
      uploadCategory === 'Other' ? customCategory : uploadCategory;

    if (!finalCategory) {
      alert('Please specify a document category.');

      return;
    }

    try {
      setUploadLoading(true);
      await uploadDocument(
        selectedFile,
        String(userId),
        uploadProjectId || null,
        finalCategory,
        uploadParcelId || null,
      );

      // Reset form states
      setSelectedFile(null);
      setUploadProjectId('');
      setUploadParcelId('');
      setCustomCategory('');
      setUploadCategory('Approvals');
      setIsUploadModalOpen(false);

      // Refresh list
      await loadPageData();
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert(
        'Failed to upload document. Please verify project or parcel details.',
      );
    } finally {
      setUploadLoading(false);
    }
  };

  // Filter land parcels based on selected project (in filters and modal)
  const filteredParcelsForFilter = projectFilter
    ? landParcels.filter((p) => String(p.project_id) === String(projectFilter))
    : landParcels;

  const filteredParcelsForUpload = uploadProjectId
    ? landParcels.filter(
        (p) => String(p.project_id) === String(uploadProjectId),
      )
    : landParcels;

  // Filter documents to display in the data table
  const filteredDocs = documents.filter((doc) => {
    // 1. Folder Sidebar filter
    if (selectedCategory !== 'all') {
      const catKey = getCategoryKey(doc.document_category);

      if (catKey !== selectedCategory) {
        return false;
      }
    }

    // 2. Project Filter
    if (projectFilter && String(doc.project_id) !== String(projectFilter)) {
      return false;
    }

    // 3. Land Parcel Filter
    if (parcelFilter && String(doc.land_parcel_id) !== String(parcelFilter)) {
      return false;
    }

    // 4. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = doc.original_filename?.toLowerCase().includes(query);
      const catMatch = doc.document_category?.toLowerCase().includes(query);

      if (!nameMatch && !catMatch) {
        return false;
      }
    }

    return true;
  });

  // Table Columns config
  const columns = [
    {
      key: 'original_filename',
      label: 'Document Name',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-red-500" />
          <div className="min-w-0">
            <p
              className="text-foreground max-w-xs truncate text-sm font-semibold md:max-w-md"
              title={value}
            >
              {value}
            </p>
            <p className="text-muted-foreground mt-0.5 text-[10px]">
              {row.file_size} • {row.file_type.toUpperCase()}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'document_category',
      label: 'Category',
      sortable: true,
      render: (value: string) => (
        <span className="bg-muted border-border inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold">
          {value}
        </span>
      ),
    },
    {
      key: 'project_id',
      label: 'Project Link',
      sortable: true,
      render: (value: any) => {
        if (!value) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }

        const proj = projects.find((p) => String(p.id) === String(value));

        return (
          <div
            className="text-foreground flex items-center gap-1 text-xs font-medium"
            title={proj?.title}
          >
            <Building className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[120px] truncate">
              {proj?.title || `ID: ${value}`}
            </span>
          </div>
        );
      },
    },
    {
      key: 'land_parcel_id',
      label: 'Land Parcel Link',
      sortable: true,
      render: (value: any) => {
        if (!value) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }

        const parcel = landParcels.find((p) => String(p.id) === String(value));

        return (
          <div
            className="text-foreground flex items-center gap-1 text-xs font-medium"
            title={parcel?.land_name || parcel?.parcel_id}
          >
            <MapPin className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[120px] truncate">
              {parcel?.land_name || parcel?.parcel_id || `ID: ${value}`}
            </span>
          </div>
        );
      },
    },
    {
      key: 'upload_date',
      label: 'Uploaded On',
      sortable: true,
      render: (value: string) => (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{value}</span>
        </div>
      ),
    },
  ];

  // Table row actions (Download & Delete)
  const actions = (row: any) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => handleDownloadDoc(row.id, row.original_filename)}
        className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
        title="Download File"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDeleteDoc(row.id, row.original_filename)}
        className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50"
        title="Delete Document"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
      {/* Top Header Section */}
      <div className="border-border flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Document Management
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            Upload, download, and catalog project-specific files and land parcel
            diagrams.
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2E7D32]/95"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-card border-border space-y-4 rounded-xl border p-5 shadow-sm">
        <div className="border-border mb-3 flex items-center gap-2 border-b pb-3">
          <Filter className="text-muted-foreground h-4 w-5" />
          <h4 className="text-foreground text-sm font-bold uppercase tracking-wider">
            Search & Filters
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
            <input
              type="text"
              placeholder="Search filename, category..."
              className="bg-input-background border-border w-full rounded-lg border px-4 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Project filter */}
          <div>
            <select
              title="Filter by Project"
              className="bg-input-background border-border w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setParcelFilter(''); // reset parcel filter when project changes
              }}
            >
              <option value="">-- All Projects --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title || p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Land parcel filter */}
          <div>
            <select
              title="Filter by Land Parcel"
              className="bg-input-background border-border w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
              value={parcelFilter}
              onChange={(e) => setParcelFilter(e.target.value)}
            >
              <option value="">-- All Land Parcels --</option>
              {filteredParcelsForFilter.map((lp) => (
                <option key={lp.id} value={lp.id}>
                  {lp.land_name || lp.parcel_id} ({lp.parcel_id})
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {(projectFilter || parcelFilter || searchQuery) && (
            <button
              onClick={() => {
                setProjectFilter('');
                setParcelFilter('');
                setSearchQuery('');
              }}
              className="border-border hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="bg-card border-border flex min-h-[350px] flex-col items-center justify-center gap-3 rounded-xl border">
          <SyncLoader size={12} color="#2E7D32" />
          <p className="text-muted-foreground text-sm">
            Loading documents inventory...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
          {/* Sidebar folders */}
          <div className="bg-card border-border space-y-4 rounded-xl border p-4 shadow-sm">
            <div className="border-border flex items-center gap-2 border-b px-2 pb-2">
              <Folder className="text-muted-foreground h-4 w-4" />
              <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                Sidebar Categories
              </h3>
            </div>
            <div className="space-y-1">
              {categories.map((folder) => {
                const isActive = selectedCategory === folder.id;

                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedCategory(folder.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#2E7D32] font-bold text-white shadow-sm'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder
                        className={`h-4 w-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                      />
                      <span>{folder.name}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/20 font-bold text-white' : 'bg-muted border-border text-muted-foreground border'}`}
                    >
                      {categoryCounts[folder.id] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table display */}
          <div className="lg:col-span-3">
            <DataTable
              columns={columns}
              data={filteredDocs}
              actions={actions}
            />
          </div>
        </div>
      )}

      {/* Dialog Overlay Modal for File Uploads */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card border-border animate-in fade-in zoom-in w-full max-w-lg overflow-hidden rounded-xl border shadow-xl duration-200">
            <div className="border-border bg-muted/20 flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
                <Upload className="h-5 w-5 text-[#2E7D32]" />
                Upload New Document
              </h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                  setUploadProjectId('');
                  setUploadParcelId('');
                  setCustomCategory('');
                }}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 p-6">
              {/* File selector */}
              <div>
                <label className="text-muted-foreground mb-1.5 block text-xs font-semibold uppercase tracking-wider">
                  Select Document File
                </label>
                <input
                  type="file"
                  required
                  title="Document File"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="bg-input-background border-border file:bg-muted file:text-foreground file:hover:bg-muted/80 w-full rounded-lg border px-4 py-2 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-semibold focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              {/* Category picker */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-muted-foreground mb-1.5 block text-xs font-semibold uppercase tracking-wider">
                    Document Category
                  </label>
                  <select
                    title="Category Selection"
                    className="bg-input-background border-border w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {uploadCategory === 'Other' && (
                  <div>
                    <label className="text-muted-foreground mb-1.5 block text-xs font-semibold uppercase tracking-wider">
                      Specify Category
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Resettlement Plan"
                      className="bg-input-background border-border w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Project picker */}
              <div>
                <label className="text-muted-foreground mb-1.5 block text-xs font-semibold uppercase tracking-wider">
                  Associate with Project (Optional)
                </label>
                <select
                  title="Project Association"
                  className="bg-input-background border-border w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  value={uploadProjectId}
                  onChange={(e) => {
                    setUploadProjectId(e.target.value);
                    setUploadParcelId(''); // reset parcel when project changes
                  }}
                >
                  <option value="">-- No Project Association --</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.title || proj.name} ({proj.projectId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parcel picker */}
              <div>
                <label className="text-muted-foreground mb-1.5 block text-xs font-semibold uppercase tracking-wider">
                  Associate with Land Parcel (Optional)
                </label>
                <select
                  title="Land Parcel Association"
                  className="bg-input-background border-border w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  value={uploadParcelId}
                  onChange={(e) => setUploadParcelId(e.target.value)}
                >
                  <option value="">-- No Land Parcel Association --</option>
                  {filteredParcelsForUpload.map((parcel) => (
                    <option key={parcel.id} value={parcel.id}>
                      {parcel.land_name || parcel.parcel_id} ({parcel.parcel_id}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="border-border mt-6 flex items-center justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                    setUploadProjectId('');
                    setUploadParcelId('');
                    setCustomCategory('');
                  }}
                  className="border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg border px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95 disabled:opacity-50"
                >
                  {uploadLoading ? (
                    <>
                      <SyncLoader size={4} color="#ffffff" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

DocumentList.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
