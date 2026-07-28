import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, MapPin, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';
import { getAuditLogs } from '@/services/auditLogService';
import {
  deleteDocument,
  downloadDocument,
} from '@/services/documentManagementService';
import {
  getLandParcel,
  exportLandParcels,
} from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';

interface Props {
  id: string;
}

export default function LandParcelDetails({ id }: Props) {
  const [parcel, setParcel] = useState<LandParcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const handleExportPdf = async () => {
    try {
      setLoading(true);
      await exportLandParcels('pdf', id);
    } catch (error) {
      console.error('Failed to export land parcel as PDF:', error);
      alert('Failed to export land parcel.');
    } finally {
      setLoading(false);
    }
  };

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userRole = user?.role?.role_name || 'User';

  const fetchParcelDetails = useCallback(async () => {
    try {
      const data = await getLandParcel(id);
      setParcel(data);

      try {
        const logs = await getAuditLogs({ module: 'Land Parcels' });
        const filtered = logs.filter((log) =>
          log.details.includes(data.parcel_id),
        );
        const mapped = filtered.map((log) => {
          let formattedDate = 'N/A';

          if (log.timestamp) {
            try {
              formattedDate = new Date(log.timestamp)
                .toISOString()
                .split('T')[0];
            } catch {
              formattedDate = log.timestamp;
            }
          }

          return {
            date: formattedDate,
            event: log.details,
            user: log.user,
          };
        });
        setHistory(mapped);
      } catch (err) {
        console.error('Failed to fetch audit logs for land parcel:', err);
      }
    } catch (error) {
      console.error('Failed to fetch land parcel:', error);
    }
  }, [id]);

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true);
        await fetchParcelDetails();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initialFetch();
    }
  }, [id, fetchParcelDetails]);

  const handleDownload = async (docId: string, filename: string) => {
    if (!docId || docId.startsWith('mock-')) {
      alert('This is a placeholder document and cannot be downloaded.');

      return;
    }

    try {
      await downloadDocument(docId, filename);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document.');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!docId || docId.startsWith('mock-')) {
      alert('This is a placeholder document and cannot be deleted.');

      return;
    }

    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteDocument(docId);
      await fetchParcelDetails();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  // Keep other tables mock/placeholder since their services are not implemented
  const owners =
    parcel?.owners && parcel.owners.length > 0
      ? parcel.owners.map((o) => ({
          name: o.name,
          nic: o.nic,
          share: '100%',
          type: 'Full Owner',
        }))
      : [];

  // const structures = [
  //   {
  //     type: 'Residential Building',
  //     area: '1,200 sq ft',
  //     condition: 'Good',
  //     value: '₨ 5,000,000',
  //   },
  //   {
  //     type: 'Boundary Wall',
  //     length: '150 ft',
  //     condition: 'Fair',
  //     value: '₨ 300,000',
  //   },
  // ];

  // const crops = [
  //   {
  //     type: 'Coconut Trees',
  //     quantity: 25,
  //     age: '15 years',
  //     value: '₨ 250,000',
  //   },
  //   { type: 'Mango Trees', quantity: 12, age: '8 years', value: '₨ 120,000' },
  //   { type: 'Banana Plants', quantity: 50, age: '2 years', value: '₨ 50,000' },
  // ];

  // Real history logs are fetched from backend and stored in state

  const documents =
    parcel?.documents && parcel.documents.length > 0
      ? parcel.documents.map((d: any) => {
          const fileTypeStr = d.fileType || d.file_type || 'N/A';

          return {
            id: d.id,
            name:
              d.originalFilename || d.original_filename || 'Unnamed Document',
            type: fileTypeStr.toUpperCase().replace('.', ''),
            date: d.uploadDate || d.upload_date || 'N/A',
          };
        })
      : [
          {
            id: 'mock-1',
            name: 'Survey Plan',
            type: 'PDF',
            date: '2024-03-10',
          },
          {
            id: 'mock-2',
            name: 'Valuation Report',
            type: 'PDF',
            date: '2024-04-20',
          },
          {
            id: 'mock-3',
            name: 'Ownership Certificate',
            type: 'PDF',
            date: '2024-02-05',
          },
          {
            id: 'mock-4',
            name: 'Site Photographs',
            type: 'ZIP',
            date: '2024-03-10',
          },
        ];

  if (loading) {
    return (
      <div className="text-muted-foreground flex h-96 items-center justify-center">
        Loading parcel details...
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="text-muted-foreground flex h-96 flex-col items-center justify-center gap-4">
        <p>Land parcel not found.</p>
        <Link href="/land-parcels" className="text-primary hover:underline">
          Back to Land Parcels
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/land-parcels"
            className="hover:bg-muted rounded-lg p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1>Land Number: {parcel.parcel_id}</h1>
              <StatusBadge status={parcel.status} />
            </div>
            <p className="text-muted-foreground">{parcel.land_name || ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userRole === 'DO' && parcel.status === 'available' && (
            <button
              onClick={() => router.visit(`/land-parcels/${parcel.id}/edit`)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit Parcel</span>
            </button>
          )}
          <button
            onClick={() => setIsMapModalOpen(true)}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>View on Map</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors"
            title="Export Land Acquisition Application Form (PDF)"
          >
            <Download className="h-4 w-4" />
            <span>Export Form (PDF)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Parcel Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Land Name:</dt>
              <dd className="font-medium">{parcel.land_name || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Province / District:</dt>
              <dd>
                {parcel.province || 'Southern'} / {parcel.district}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Divisional Secretariat:</dt>
              <dd>
                {parcel.divisional_secretariat || parcel.division || 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Grama Niladhari Division:
              </dt>
              <dd>{parcel.grama_niladari_division || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Village / Town:</dt>
              <dd>{parcel.village}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Extent Breakdown:</dt>
              <dd className="font-mono">
                {parcel.land_size_acers ?? parcel.extent_acers ?? 0} A,{' '}
                {parcel.land_size_roods ?? 0} R,{' '}
                {parcel.land_size_perches ?? parcel.extent_perches ?? 0} P
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total Land Size:</dt>
              <dd className="font-medium">
                {parcel.full_land_size ?? 0} Perches
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Plan Status / No:</dt>
              <dd>
                {parcel.has_plan ? parcel.plan_number || 'Yes' : 'No Plan'}
              </dd>
            </div>
            {parcel.parcel_numbers && parcel.parcel_numbers.length > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Parcel Numbers:</dt>
                <dd className="font-mono">
                  {parcel.parcel_numbers.join(', ')}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cultivation & Status:</dt>
              <dd>
                {parcel.cultivation || 'N/A'} (
                {parcel.cultivation_status || 'fertile'})
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Annual Income:</dt>
              <dd>₨ {Number(parcel.annual_income || 0).toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Land Type:</dt>
              <dd>{parcel.land_type || 'Standard'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Estimated Value:</dt>
              <dd className="font-medium">
                ₨ {Number(parcel.estimated_value || 0).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Residential / Owner Living:
              </dt>
              <dd>
                {parcel.has_residential_houses ? 'Yes' : 'No'} /{' '}
                {parcel.is_resident_owner ? 'Yes' : 'No'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Associated Project:</dt>
              <dd>
                {parcel.project ? (
                  <Link
                    href={`/projects/${parcel.project.id}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {parcel.project.title || parcel.project.name}
                  </Link>
                ) : (
                  'None'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Remarks:</dt>
              <dd className="text-right">{parcel.remarks || 'No remarks'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created At:</dt>
              <dd>
                {parcel.created_at
                  ? new Date(parcel.created_at).toLocaleString()
                  : 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Last Updated:</dt>
              <dd>
                {parcel.updated_at
                  ? new Date(parcel.updated_at).toLocaleString()
                  : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Ownership</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Owner Name' },
              { key: 'nic', label: 'NIC' },
              { key: 'share', label: 'Share' },
              { key: 'type', label: 'Type' },
            ]}
            data={owners}
            searchable={false}
            filterable={false}
            exportable={false}
          />
        </div>

        {/* <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Structures</h3>
          <DataTable
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'area', label: 'Area/Length' },
              { key: 'condition', label: 'Condition' },
              { key: 'value', label: 'Estimated Value' },
            ]}
            data={structures}
            searchable={false}
            filterable={false}
            exportable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6">
          <h3 className="mb-4">Trees and Crops</h3>
          <DataTable
            columns={[
              { key: 'type', label: 'Type' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'age', label: 'Age' },
              { key: 'value', label: 'Estimated Value' },
            ]}
            data={crops}
            searchable={false}
            filterable={false}
            exportable={false}
          />
        </div> */}

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">Documents</h3>
          <DataTable
            columns={[
              { key: 'name', label: 'Document Name' },
              { key: 'type', label: 'Type' },
              { key: 'date', label: 'Date' },
              {
                key: 'actions',
                label: 'Actions',
                render: (_val: any, row: any) => {
                  const isAvailable = parcel?.status === 'available';

                  return (
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleDownload(row.id, row.name)}
                        className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {isAvailable && (
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
                },
              },
            ]}
            data={documents}
            searchable={false}
            filterable={false}
          />
        </div>

        <div className="bg-card border-border rounded-lg border p-6 lg:col-span-2">
          <h3 className="mb-4">History</h3>
          <DataTable
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'event', label: 'Event' },
              { key: 'user', label: 'User' },
            ]}
            data={history}
            searchable={false}
            filterable={false}
            exportable={false}
          />
        </div>
      </div>

      {/* Google Maps Location Popup Dialog */}
      {isMapModalOpen && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border-border animate-in fade-in zoom-in w-full max-w-2xl overflow-hidden rounded-xl border shadow-xl duration-200">
            <div className="border-border bg-muted/20 flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
                <MapPin className="h-5 w-5 text-[#2E7D32]" />
                Map Location: {parcel.land_name || 'Parcel GPS Location'}
              </h3>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="border-border relative h-96 w-full overflow-hidden rounded-lg border bg-[#cce4f2]">
                {parcel.latitude && parcel.longitude ? (
                  <iframe
                    title={`Google Map for ${parcel.parcel_id}`}
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY || ''}&q=${Number(parcel.latitude)},${Number(parcel.longitude)}&zoom=16`}
                    className="absolute inset-0 h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                ) : (
                  <div className="bg-linear-to-br absolute inset-0 flex items-center justify-center from-[#4a9f8f]/90 to-[#2d6b5f]/95 p-6 text-center text-white">
                    <div className="max-w-sm">
                      <MapPin className="mx-auto mb-3 h-12 w-12 animate-bounce text-white/90" />
                      <p className="mb-1 text-lg font-bold">
                        No GPS Coordinates Set
                      </p>
                      <p className="text-xs text-white/80">
                        This land parcel does not have latitude and longitude
                        details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  Coordinates:{' '}
                  {parcel.latitude && parcel.longitude
                    ? `${Number(parcel.latitude).toFixed(6)}, ${Number(parcel.longitude).toFixed(6)}`
                    : 'None'}
                </span>
                {parcel.latitude && parcel.longitude && (
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${parcel.latitude},${parcel.longitude}`,
                        '_blank',
                      )
                    }
                    className="flex items-center gap-1 font-bold text-[#2E7D32] hover:underline"
                  >
                    Open in Google Maps
                  </button>
                )}
              </div>
              <div className="border-border flex justify-end border-t pt-4">
                <button
                  onClick={() => setIsMapModalOpen(false)}
                  className="rounded-lg bg-[#2E7D32] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]/95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

LandParcelDetails.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
