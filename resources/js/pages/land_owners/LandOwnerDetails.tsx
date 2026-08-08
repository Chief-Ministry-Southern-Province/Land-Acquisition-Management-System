import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';
import {
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from '@/services/documentManagementService';
import {
  getPropertyOwner,
  exportPropertyOwners,
} from '@/services/propertyOwnerManagement';
import type { PropertyOwner } from '@/services/propertyOwnerManagement';

interface Props {
  id: string;
}

export default function LandOwnerDetails({ id }: Props) {
  const [owner, setOwner] = useState<PropertyOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadCategory, setUploadCategory] = useState(
    'National Identity Card',
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userRole = user?.role?.role_name || 'User';
  const isDO = userRole === 'DO';

  const fetchOwner = useCallback(async () => {
    try {
      const data = await getPropertyOwner(id);
      setOwner(data);
    } catch (error) {
      console.error('Failed to fetch property owner:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOwner();
  }, [fetchOwner]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setLoading(true);
      await exportPropertyOwners(format, id);
    } catch (error) {
      console.error(
        `Failed to export property owner profile as ${format}:`,
        error,
      );
      alert(`Failed to export property owner profile.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);

      const projectId =
        owner?.landParcels && owner.landParcels.length > 0
          ? owner.landParcels[0].project_id
          : null;

      await uploadDocument(
        selectedFile,
        String(user.id),
        projectId,
        uploadCategory,
        null,
        owner?.id,
      );

      setSelectedFile(null);
      alert('Document uploaded successfully!');
      await fetchOwner();
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
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
      await deleteDocument(docId);
      alert('Document deleted successfully!');
      await fetchOwner();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document.');
    }
  };

  const parcels = owner?.landParcels
    ? owner.landParcels.map((p) => ({
        id: p.id,
        parcelId: p.parcel_id,
        landNo: p.parcel_id,
        landName: p.land_name || 'N/A',
        village: p.village,
        extent: `${p.land_size_acers ?? p.extent_acers ?? 0} acres, ${p.land_size_perches ?? p.extent_perches ?? 0} perches`,
        status: p.status,
      }))
    : [];

  const compensation = owner?.compensations
    ? owner.compensations.map((c) => ({
        id: c.id,
        compensationId: c.compensation_id,
        parcel: c.landParcel?.parcel_id || 'N/A',
        amount: `₨ ${Number(c.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`,
        approvedDate: c.approved_date || '-',
        paymentDate: c.payment_date || '-',
        status: c.status,
      }))
    : [];

  const documents = owner?.documents
    ? owner.documents.map((d) => ({
        id: d.id,
        name: d.original_filename,
        category: d.document_category,
        type: d.file_type.toUpperCase().replace('.', ''),
        uploadDate: d.upload_date || '-',
        size: d.file_size,
        storedFilename: d.stored_filename,
      }))
    : [];

  if (loading) {
    return (
      <div className="text-muted-foreground flex h-96 items-center justify-center">
        Loading property owner details...
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="text-muted-foreground flex h-96 flex-col items-center justify-center gap-4">
        <p>Property owner not found.</p>
        <Link href="/land-owners" className="text-primary hover:underline">
          Back to Property Owners
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/land-owners"
            className="hover:bg-muted rounded-lg p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1>{owner.name}</h1>
            <p className="text-muted-foreground">Owner ID: {owner.ownerId}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Profile</span>
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Personal Information</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Full Name:</dt>
              <dd>{owner.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">NIC:</dt>
              <dd>{owner.nic || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Date of Birth:</dt>
              <dd>{owner.dateOfBirth ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Occupation:</dt>
              <dd>{owner.occupation ?? '-'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Contact Details</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Contact:</dt>
              <dd>{owner.contact || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email:</dt>
              <dd>{owner.email || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Address:</dt>
              <dd className="text-right">{owner.address}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">Owned Parcels</h3>
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
            searchable={false}
            filterable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">Compensation History</h3>
          <DataTable
            columns={[
              {
                key: 'compensationId',
                label: 'Compensation ID',
                sortable: true,
              },
              { key: 'parcel', label: 'Parcel', sortable: true },
              { key: 'amount', label: 'Amount', sortable: true },
              { key: 'approvedDate', label: 'Approved Date', sortable: true },
              { key: 'paymentDate', label: 'Payment Date', sortable: true },
              {
                key: 'status',
                label: 'Status',
                render: (value: string) => <StatusBadge status={value} />,
              },
            ]}
            data={compensation}
            searchable={false}
            filterable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">Documents</h3>

          {isDO && (
            <div className="bg-muted/20 border-border/80 mb-6 rounded-lg border p-4">
              <h4 className="text-foreground mb-3 text-sm font-semibold">
                Upload New Document
              </h4>
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-muted-foreground text-xs font-medium">
                    Document Category *
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="National Identity Card">
                      National Identity Card
                    </option>
                    <option value="Deed of Ownership">Deed of Ownership</option>
                    <option value="Bank Account Details">
                      Bank Account Details
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-muted-foreground text-xs font-medium">
                    Choose File *
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="bg-primary hover:bg-primary/90 flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors">
                      <span>Select File</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            setSelectedFile(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-muted-foreground max-w-xs truncate text-xs">
                      {selectedFile ? selectedFile.name : 'No file selected'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={uploading || !selectedFile}
                  onClick={handleUpload}
                  className="bg-primary hover:bg-primary/90 flex h-[38px] min-w-[100px] items-center justify-center gap-2 rounded-lg px-6 py-2 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          )}

          <DataTable
            columns={[
              { key: 'name', label: 'Document Name', sortable: true },
              { key: 'category', label: 'Category', sortable: true },
              { key: 'type', label: 'Type', sortable: true },
              { key: 'uploadDate', label: 'Upload Date', sortable: true },
              { key: 'size', label: 'Size', sortable: true },
            ]}
            data={documents}
            searchable={false}
            filterable={false}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(row.id, row.name)}
                  className="text-primary text-xs font-semibold hover:underline"
                  title="Download Document"
                >
                  Download
                </button>
                {isDO && (
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-destructive text-xs font-semibold hover:underline"
                    title="Delete Document"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}

LandOwnerDetails.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
