import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Upload, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { confirmDialog, toastError, toastSuccess } from '@/lib/alerts';
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
  const { locale, t } = useTranslation();
  const [owner, setOwner] = useState<PropertyOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadCategory, setUploadCategory] = useState(
    'National Identity Card',
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
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
      await exportPropertyOwners(format, id, locale);
    } catch (error) {
      console.error(
        `Failed to export property owner profile as ${format}:`,
        error,
      );
      toastError(t('failed_export_owner_profile', 'Failed to export property owner profile.'));
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
      setUploadProgress(0);

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
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          }
        },
      );

      setSelectedFile(null);
      setUploadProgress(null);
      toastSuccess(t('document_uploaded_success', 'Document uploaded successfully!'));
      await fetchOwner();
    } catch (error) {
      console.error('Failed to upload document:', error);
      toastError(t('failed_upload_document', 'Failed to upload document. Please try again.'));
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDownload = async (docId: string, filename: string) => {
    try {
      await downloadDocument(docId, filename);
    } catch (error) {
      console.error('Failed to download document:', error);
      toastError(t('failed_download_document', 'Failed to download document.'));
    }
  };

  const handleDelete = async (docId: string) => {
    const confirmed = await confirmDialog({
      title: t('delete_document_title', 'Delete Document'),
      text: t('delete_document_confirm_details', 'Are you sure you want to delete this document?'),
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteDocument(docId);
      toastSuccess(t('document_deleted_success', 'Document deleted successfully!'));
      await fetchOwner();
    } catch (error) {
      console.error('Failed to delete document:', error);
      toastError(t('failed_delete_document', 'Failed to delete document.'));
    }
  };

  const getCategoryTranslation = (cat: string) => {
    switch (cat) {
      case 'National Identity Card':
        return t('nic_category', 'National Identity Card');
      case 'Deed of Ownership':
        return t('deed_of_ownership_category', 'Deed of Ownership');
      case 'Bank Account Details':
        return t('bank_details_category', 'Bank Account Details');
      default:
        return t('other_category', 'Other');
    }
  };

  const parcels = owner?.landParcels
    ? owner.landParcels.map((p) => ({
        id: p.id,
        parcelId: p.parcel_id,
        landNo: p.parcel_id,
        landName: p.land_name || t('n_a', 'N/A'),
        village: p.village,
        extent: `${p.land_size_acers ?? p.extent_acers ?? 0} ${t('acres', 'acres')}, ${p.land_size_perches ?? p.extent_perches ?? 0} ${t('perches', 'perches')}`,
        status: p.status,
      }))
    : [];

  const compensation = owner?.compensations
    ? owner.compensations.map((c) => ({
        id: c.id,
        compensationId: c.compensation_id,
        parcel: c.landParcel?.parcel_id || t('n_a', 'N/A'),
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
        category: getCategoryTranslation(d.document_category),
        type: d.file_type ? d.file_type.toUpperCase().replace('.', '') : t('n_a', 'N/A'),
        uploadDate: d.upload_date || '-',
        size: d.file_size,
        storedFilename: d.stored_filename,
      }))
    : [];

  if (loading) {
    return (
      <div className="text-muted-foreground flex h-96 items-center justify-center">
        {t('loading_property_owner_details', 'Loading property owner details...')}
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="text-muted-foreground flex h-96 flex-col items-center justify-center gap-4">
        <p>{t('property_owner_not_found', 'Property owner not found.')}</p>
        <Link href="/land-owners" className="text-primary hover:underline">
          {t('back_to_property_owners', 'Back to Property Owners')}
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
            title={t('back_to_property_owners', 'Back to Property Owners')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1>{owner.name}</h1>
            <p className="text-muted-foreground">{t('owner_id_colon', 'Owner ID:')} {owner.ownerId}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{t('export_profile', 'Export Profile')}</span>
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
                {t('export_pdf', 'Export PDF')}
              </button>
              <button
                onClick={() => {
                  handleExport('excel');
                  setShowExportDropdown(false);
                }}
                className="text-foreground hover:bg-muted w-full px-4 py-2 text-left text-sm font-medium transition-colors"
              >
                {t('export_excel', 'Export Excel')}
              </button>
              <button
                onClick={() => {
                  handleExport('csv');
                  setShowExportDropdown(false);
                }}
                className="text-foreground hover:bg-muted w-full px-4 py-2 text-left text-sm font-medium transition-colors"
              >
                {t('export_csv', 'Export CSV')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">{t('personal_information', 'Personal Information')}</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('fullname_colon', 'Full Name:')}</dt>
              <dd>{owner.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('nic_colon', 'NIC:')}</dt>
              <dd>{owner.nic || t('n_a', 'N/A')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('dob_colon', 'Date of Birth:')}</dt>
              <dd>{owner.dateOfBirth ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('occupation_colon', 'Occupation:')}</dt>
              <dd>{owner.occupation ?? '-'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">{t('contact_details', 'Contact Details')}</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('contact_colon', 'Contact:')}</dt>
              <dd>{owner.contact || t('n_a', 'N/A')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('email_colon', 'Email:')}</dt>
              <dd>{owner.email || t('n_a', 'N/A')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t('address_colon', 'Address:')}</dt>
              <dd className="text-right">{owner.address}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">{t('owned_parcels', 'Owned Parcels')}</h3>
          <DataTable
            columns={[
              { key: 'parcelId', label: t('parcel_id_header', 'Parcel ID'), sortable: true },
              { key: 'landNo', label: t('land_no_header', 'Land No'), sortable: true },
              { key: 'village', label: t('village_header', 'Village'), sortable: true },
              { key: 'extent', label: t('extent_header', 'Extent'), sortable: true },
              {
                key: 'status',
                label: t('status_header', 'Status'),
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
          <h3 className="mb-4">{t('compensation_history', 'Compensation History')}</h3>
          <DataTable
            columns={[
              {
                key: 'compensationId',
                label: t('compensation_id_header', 'Compensation ID'),
                sortable: true,
              },
              { key: 'parcel', label: t('parcel_header', 'Parcel'), sortable: true },
              { key: 'amount', label: t('amount_header', 'Amount'), sortable: true },
              { key: 'approvedDate', label: t('approved_date_header', 'Approved Date'), sortable: true },
              { key: 'paymentDate', label: t('payment_date_header', 'Payment Date'), sortable: true },
              {
                key: 'status',
                label: t('status_header', 'Status'),
                render: (value: string) => <StatusBadge status={value} />,
              },
            ]}
            data={compensation}
            searchable={false}
            filterable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">{t('documents', 'Documents')}</h3>

          {isDO && (
            <div className="bg-muted/20 border-border/80 mb-6 rounded-lg border p-4">
              <h4 className="text-foreground mb-3 text-sm font-semibold">
                {t('upload_new_document', 'Upload New Document')}
              </h4>
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-muted-foreground text-xs font-medium">
                    {t('document_category', 'Document Category')} *
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="bg-background border-border text-foreground focus:border-primary w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="National Identity Card">
                      {t('nic_category', 'National Identity Card')}
                    </option>
                    <option value="Deed of Ownership">
                      {t('deed_of_ownership_category', 'Deed of Ownership')}
                    </option>
                    <option value="Bank Account Details">
                      {t('bank_details_category', 'Bank Account Details')}
                    </option>
                    <option value="Other">{t('other_category', 'Other')}</option>
                  </select>
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-muted-foreground text-xs font-medium">
                    {t('choose_file', 'Choose File')} *
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="bg-primary hover:bg-primary/90 flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors">
                      <span>{t('select_file', 'Select File')}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              toastError(t('file_size_limit_error', 'File size exceeds the 10MB limit.'));
                              e.target.value = '';

                              return;
                            }

                            setSelectedFile(file);
                          }

                          e.target.value = '';
                        }}
                      />
                    </label>
                    <span className="text-muted-foreground max-w-xs truncate text-xs">
                      {selectedFile ? selectedFile.name : t('no_file_selected', 'No file selected')}
                    </span>
                    {selectedFile && !uploading && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="hover:bg-muted text-muted-foreground hover:text-destructive rounded-full p-1 transition-colors"
                        title={t('remove_file_tooltip', 'Remove file')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={uploading || !selectedFile}
                  onClick={handleUpload}
                  className="bg-primary hover:bg-primary/90 flex h-[38px] min-w-[100px] items-center justify-center gap-2 rounded-lg px-6 py-2 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? t('uploading', 'Uploading...') : t('upload', 'Upload')}
                </button>
              </div>

              {uploading && uploadProgress !== null && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-muted-foreground">
                      {t('uploading_document', 'Uploading document...')}
                    </span>
                    <span className="text-primary font-semibold">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DataTable
            columns={[
              { key: 'name', label: t('document_name_header', 'Document Name'), sortable: true },
              { key: 'category', label: t('category_header', 'Category'), sortable: true },
              { key: 'type', label: t('type_header', 'Type'), sortable: true },
              { key: 'uploadDate', label: t('upload_date_header', 'Upload Date'), sortable: true },
              { key: 'size', label: t('size_header', 'Size'), sortable: true },
            ]}
            data={documents}
            searchable={false}
            filterable={false}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(row.id, row.name)}
                  className="text-primary text-xs font-semibold hover:underline"
                  title={t('download_document_tooltip', 'Download Document')}
                >
                  {t('download', 'Download')}
                </button>
                {isDO && (
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="text-destructive text-xs font-semibold hover:underline"
                    title={t('delete_document_tooltip', 'Delete Document')}
                  >
                    {t('delete', 'Delete')}
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
