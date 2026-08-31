import { router, usePage } from '@inertiajs/react';
import { Eye, MapPin, Plus, Upload, Pencil } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { alertInfo, toastError, toastSuccess } from '@/lib/alerts';
import {
  getLandParcels,
  exportLandParcels,
  importLandParcels,
} from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';

export default function LandParcelList() {
  const { locale, t } = useTranslation();
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
        const msg = t(
          'import_partial_success_msg',
          'Successfully imported {imported} land parcels. {failed} rows failed validation.',
        )
          .replace('{imported}', res.imported_count.toString())
          .replace('{failed}', failedCount.toString());
        setImportMessage({ type: 'success', text: msg });
        await alertInfo(
          t('import_completed_failures', 'Import Completed with Failures'),
          msg +
            '\n\n' +
            t('first_failure_label', 'First failure: ') +
            res.failures[0].errors.join(', '),
        );
      } else {
        const msg = t(
          'import_success_count',
          'Successfully imported all {count} land parcels!',
        ).replace('{count}', res.imported_count.toString());
        setImportMessage({ type: 'success', text: msg });
        toastSuccess(msg);
      }

      // Refresh list
      const data = await getLandParcels();
      setParcels(data);
    } catch (error: any) {
      console.error('Failed to import land parcels:', error);

      if (error.response?.status === 422) {
        const data = error.response.data;
        const failedCount = data.failures?.length || 0;
        const msg = t(
          'import_failed_validation',
          'Import failed: {failed} rows had validation errors. {imported} land parcels were imported successfully.',
        )
          .replace('{failed}', failedCount.toString())
          .replace('{imported}', data.imported_count.toString());
        setImportMessage({ type: 'error', text: msg });

        let failureDetails = '';

        if (data.failures && data.failures.length > 0) {
          failureDetails =
            '\n\n' +
            t('validation_failures_label', 'Validation failures:') +
            '\n' +
            data.failures
              .slice(0, 5)
              .map(
                (f: any) =>
                  `${t('row_label', 'Row')} ${f.row} (${f.attribute}): ${f.errors.join(', ')}`,
              )
              .join('\n');

          if (data.failures.length > 5) {
            failureDetails +=
              `\n` +
              t('and_more_failures', '... and {count} more failures.').replace(
                '{count}',
                (data.failures.length - 5).toString(),
              );
          }
        }

        await alertInfo(
          t('import_failed', 'Import Failed'),
          msg + failureDetails,
        );

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
          t(
            'default_import_error',
            'Failed to import land parcels. Please check the file format.',
          );
        setImportMessage({ type: 'error', text: errorMsg });
        toastError(errorMsg);
      }
    } finally {
      setImporting(false);

      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const columns = [
    {
      key: 'parcel_id',
      label: t('land_number', 'Land Number'),
      sortable: true,
    },
    {
      key: 'land_name',
      label: t('land_name_header', 'Land Name'),
      sortable: true,
      render: (value: string | null) => value || t('n_a', 'N/A'),
    },
    { key: 'district', label: t('district', 'District'), sortable: true },
    {
      key: 'divisional_secretariat',
      label: t('divisional_secretariat', 'Divisional Secretariat'),
      sortable: true,
      render: (_val: any, row: any) =>
        row.divisional_secretariat || row.division || t('n_a', 'N/A'),
    },
    {
      key: 'grama_niladari_division',
      label: t('gn_division', 'GN Division'),
      sortable: true,
      render: (value: string | null) => value || t('n_a', 'N/A'),
    },
    { key: 'village', label: t('village', 'Village'), sortable: true },
    {
      key: 'land_type',
      label: t('land_type', 'Land Type'),
      sortable: true,
      render: (value: string | null) =>
        value || t('standard_land_type', 'Standard'),
    },
    {
      key: 'owners',
      label: t('owner_name_header', 'Owner Name'),
      sortable: true,
      render: (_val: any, row: any) => {
        if (row.owners && row.owners.length > 0) {
          return row.owners.map((o: any) => o.name).join(', ');
        }

        return t('n_a', 'N/A');
      },
    },
    {
      key: 'extent',
      label: t('extent', 'Extent'),
      sortable: true,
      render: (_val: any, row: any) =>
        `${row.land_size_acers ?? row.extent_acers ?? 0} ${t('ac_abbr', 'ac')}, ${row.land_size_roods ?? 0} ${t('rd_abbr', 'rd')}, ${row.land_size_perches ?? row.extent_perches ?? 0} ${t('per_abbr', 'per')}`,
    },
    {
      key: 'cultivation_status',
      label: t('cultivation_header', 'Cultivation'),
      sortable: true,
      render: (value: string | null) => value || t('n_a', 'N/A'),
    },
    {
      key: 'estimated_value',
      label: t('estimated_value', 'Estimated Value'),
      sortable: true,
      render: (value: number | null) =>
        value !== undefined && value !== null
          ? `₨ ${Number(value).toLocaleString()}`
          : '₨ 0',
    },
    {
      key: 'project',
      label: t('associated_project', 'Associated Project'),
      sortable: true,
      render: (_val: any, row: any) =>
        row.project?.title || row.project?.name || t('n_a', 'N/A'),
    },
    {
      key: 'is_casehold',
      label: t('casehold', 'Casehold'),
      sortable: true,
      render: (value: boolean | null) => (
        <span
          className={
            value
              ? 'font-medium text-amber-600 dark:text-amber-400'
              : 'text-muted-foreground'
          }
        >
          {value ? t('yes', 'Yes') : t('no', 'No')}
        </span>
      ),
    },
    {
      key: 'is_donated',
      label: t('donated', 'Donated'),
      sortable: true,
      render: (value: boolean | null) => (
        <span
          className={
            value
              ? 'font-medium text-green-600 dark:text-green-400'
              : 'text-muted-foreground'
          }
        >
          {value ? t('yes', 'Yes') : t('no', 'No')}
        </span>
      ),
    },
    {
      key: 'status',
      label: t('current_status', 'Current Status'),
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: 'created_at',
      label: t('created_at', 'Created At'),
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : t('n_a', 'N/A'),
    },
    {
      key: 'updated_at',
      label: t('updated_at', 'Updated At'),
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : t('n_a', 'N/A'),
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
          title={t('edit_land_parcel_tooltip', 'Edit Land Parcel')}
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
        title={t('view_details_tooltip', 'View Details')}
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.visit(`/gis-maps?parcel=${row.id}`);
        }}
        className="hover:bg-muted rounded p-1.5 transition-colors"
        title={t('view_on_map_tooltip', 'View on Map')}
      >
        <MapPin className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>{t('land_parcels', 'Land Parcels')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('manage_land_parcel_info', 'Manage land parcel information')}
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
              title={t(
                'import_excel_csv_desc',
                'Import Land Parcels from Excel or CSV file',
              )}
            >
              <Upload className="h-5 w-5" />
              <span>
                {importing
                  ? t('importing', 'Importing...')
                  : t('import', 'Import')}
              </span>
            </button>
            <button
              onClick={() => {
                router.visit('/land-parcels/create');
              }}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>{t('add_parcel_btn', 'Add Parcel')}</span>
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
          {t('loading_land_parcels_msg', 'Loading land parcels...')}
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
