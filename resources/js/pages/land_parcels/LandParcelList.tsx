import { router, usePage } from '@inertiajs/react';
import { Eye, MapPin, Plus, Upload, Pencil } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import {
  getLandParcels,
  exportLandParcels,
  importLandParcels,
} from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';

export default function LandParcelList() {
  const { locale } = useTranslation();
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { props: pageProps } = usePage();
  const user = (pageProps.auth as any)?.user;
  const userRole = user?.role?.role_name || 'User';

  useEffect(() => {
    const fetchParcels = async () => {
      try {
        setLoading(true);
        const data = await getLandParcels();
        setParcels(data);
      } catch (error) {
        console.error('Failed to fetch land parcels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, []);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportLandParcels(format, undefined, locale);
    } catch (error) {
      console.error(`Failed to export land parcels as ${format}:`, error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setImporting(true);
      setImportMessage(null);
      const res = await importLandParcels(file);

      if (res.failures && res.failures.length > 0) {
        const failedCount = res.failures.length;
        const msg = `Successfully imported ${res.imported_count} land parcels. ${failedCount} rows failed validation.`;
        setImportMessage({ type: 'success', text: msg });
        alert(msg + '\n\nFirst failure: ' + res.failures[0].errors.join(', '));
      } else {
        const msg = `Successfully imported all ${res.imported_count} land parcels!`;
        setImportMessage({ type: 'success', text: msg });
        alert(msg);
      }

      // Refresh list
      const data = await getLandParcels();
      setParcels(data);
    } catch (error: any) {
      console.error('Failed to import land parcels:', error);

      if (error.response?.status === 422) {
        const data = error.response.data;
        const failedCount = data.failures?.length || 0;
        const msg = `Import failed: ${failedCount} rows had validation errors. ${data.imported_count} land parcels were imported successfully.`;
        setImportMessage({ type: 'error', text: msg });

        let failureDetails = '';

        if (data.failures && data.failures.length > 0) {
          failureDetails =
            '\n\nValidation failures:\n' +
            data.failures
              .slice(0, 5)
              .map(
                (f: any) =>
                  `Row ${f.row} (${f.attribute}): ${f.errors.join(', ')}`,
              )
              .join('\n');

          if (data.failures.length > 5) {
            failureDetails += `\n... and ${data.failures.length - 5} more failures.`;
          }
        }

        alert(msg + failureDetails);

        // Refresh list if partial records were imported
        if (data.imported_count > 0) {
          try {
            const data = await getLandParcels();
            setParcels(data);
          } catch (fetchError) {
            console.error(
              'Failed to refresh land parcels after partial import:',
              fetchError,
            );
          }
        }
      } else {
        const errorMsg =
          error.response?.data?.message ||
          'Failed to import land parcels. Please check the file format.';
        setImportMessage({ type: 'error', text: errorMsg });
        alert(errorMsg);
      }
    } finally {
      setImporting(false);

      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const columns = [
    { key: 'parcel_id', label: 'Land Number', sortable: true },
    {
      key: 'land_name',
      label: 'Land Name',
      sortable: true,
      render: (value: string | null) => value || 'N/A',
    },
    { key: 'district', label: 'District', sortable: true },
    {
      key: 'divisional_secretariat',
      label: 'Divisional Secretariat',
      sortable: true,
      render: (_val: any, row: any) =>
        row.divisional_secretariat || row.division || 'N/A',
    },
    {
      key: 'grama_niladari_division',
      label: 'GN Division',
      sortable: true,
      render: (value: string | null) => value || 'N/A',
    },
    { key: 'village', label: 'Village', sortable: true },
    {
      key: 'land_type',
      label: 'Land Type',
      sortable: true,
      render: (value: string | null) => value || 'Standard',
    },
    {
      key: 'owners',
      label: 'Owner Name',
      sortable: true,
      render: (_val: any, row: any) => {
        if (row.owners && row.owners.length > 0) {
          return row.owners.map((o: any) => o.name).join(', ');
        }

        return 'N/A';
      },
    },
    {
      key: 'extent',
      label: 'Extent',
      sortable: true,
      render: (_val: any, row: any) =>
        `${row.land_size_acers ?? row.extent_acers ?? 0} ac, ${row.land_size_roods ?? 0} rd, ${row.land_size_perches ?? row.extent_perches ?? 0} per`,
    },
    {
      key: 'cultivation_status',
      label: 'Cultivation',
      sortable: true,
      render: (value: string | null) => value || 'N/A',
    },
    {
      key: 'estimated_value',
      label: 'Estimated Value',
      sortable: true,
      render: (value: number | null) =>
        value !== undefined && value !== null
          ? `₨ ${Number(value).toLocaleString()}`
          : '₨ 0',
    },
    {
      key: 'project',
      label: 'Associated Project',
      sortable: true,
      render: (_val: any, row: any) =>
        row.project?.title || row.project?.name || 'N/A',
    },
    {
      key: 'is_casehold',
      label: 'Casehold',
      sortable: true,
      render: (value: boolean | null) => (
        <span
          className={
            value
              ? 'font-medium text-amber-600 dark:text-amber-400'
              : 'text-muted-foreground'
          }
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'is_donated',
      label: 'Donated',
      sortable: true,
      render: (value: boolean | null) => (
        <span
          className={
            value
              ? 'font-medium text-green-600 dark:text-green-400'
              : 'text-muted-foreground'
          }
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Current Status',
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

  const actions = (row: any) => (
    <div className="flex items-center justify-end gap-2">
      {userRole === 'DO' && row.status === 'available' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.visit(`/land-parcels/${row.id}/edit`);
          }}
          className="hover:bg-muted text-primary rounded p-1.5 transition-colors"
          title="Edit Land Parcel"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.visit(`/land-parcels/${row.id}`);
        }}
        className="hover:bg-muted rounded p-1.5 transition-colors"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.visit(`/gis-maps?parcel=${row.id}`);
        }}
        className="hover:bg-muted rounded p-1.5 transition-colors"
        title="View on Map"
      >
        <MapPin className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Land Parcels</h1>
          <p className="text-muted-foreground mt-1">
            Manage land parcel information
          </p>
        </div>
        {userRole === 'DO' && (
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleImport}
              disabled={importing}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              title="Import Land Parcels from Excel or CSV file"
            >
              <Upload className="h-5 w-5" />
              <span>{importing ? 'Importing...' : 'Import'}</span>
            </button>
            <button
              onClick={() => {
                router.visit('/land-parcels/create');
              }}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Parcel</span>
            </button>
          </div>
        )}
      </div>

      {importMessage && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            importMessage.type === 'success'
              ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {importMessage.text}
        </div>
      )}

      {loading ? (
        <div className="bg-card border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border">
          Loading land parcels...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={parcels}
          onRowClick={(row) => router.visit(`/land-parcels/${row.id}`)}
          onExport={handleExport}
          actions={actions}
        />
      )}
    </div>
  );
}

LandParcelList.layout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);
