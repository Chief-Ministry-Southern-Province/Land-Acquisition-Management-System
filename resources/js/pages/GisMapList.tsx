import {
  Layers,
  MapPin,
  Maximize,
  Search,
  ZoomIn,
  ZoomOut,
  Building,
  Compass,
  DollarSign,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SyncLoader } from 'react-spinners';
import { StatusBadge } from '@/components/ui/StatusBridge';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/layouts/MainLayout';
import { getLandParcels } from '@/services/landParcelManagementService';
import type { LandParcel } from '@/services/landParcelManagementService';

export default function GisMapList() {
  const { t } = useTranslation();
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(0.003); // bounding box delta

  // Layer switches (visual state mock toggles)
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showRoads, setShowRoads] = useState(true);

  // Load all land parcels on mount
  useEffect(() => {
    const fetchParcels = async () => {
      try {
        setLoading(true);
        const data = await getLandParcels();
        setParcels(data);

        if (data.length > 0) {
          setSelectedParcelId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch land parcels for GIS Map:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchParcels();
  }, []);

  const handleZoomIn = () =>
    setZoomLevel((prev) => Math.max(prev * 0.5, 0.0005));
  const handleZoomOut = () => setZoomLevel((prev) => Math.min(prev * 2, 0.05));

  // Find the selected parcel details
  const selectedParcel = parcels.find((p) => p.id === selectedParcelId);

  // Filter parcels for sidebar search
  const filteredParcels = parcels.filter((p) => {
    const query = searchQuery.toLowerCase();

    return (
      p.parcel_id?.toLowerCase().includes(query) ||
      p.land_name?.toLowerCase().includes(query) ||
      p.village?.toLowerCase().includes(query) ||
      p.district?.toLowerCase().includes(query)
    );
  });

  // Open full map in a new tab
  const handleFullScreen = () => {
    if (selectedParcel?.latitude && selectedParcel?.longitude) {
      const lat = Number(selectedParcel.latitude);
      const lon = Number(selectedParcel.longitude);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
        '_blank',
      );
    }
  };

  // Generate Google Maps Embed URL
  const getMapEmbedUrl = () => {
    if (
      !selectedParcel ||
      !selectedParcel.latitude ||
      !selectedParcel.longitude
    ) {
      return '';
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY || '';
    const lat = Number(selectedParcel.latitude);
    const lon = Number(selectedParcel.longitude);
    const gmapsZoom = Math.min(
      Math.max(Math.round(18 - Math.log2(zoomLevel / 0.00075)), 1),
      21,
    );

    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lon}&zoom=${gmapsZoom}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
      {/* Title Header */}
      <div className="border-border flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight">
            {t('gis_map_view_title', 'GIS / Map View')}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            {t(
              'gis_map_view_subtitle',
              'Interactive map displaying geographical locations, survey boundaries, and project association of land parcels.',
            )}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border-border flex min-h-[450px] flex-col items-center justify-center gap-3 rounded-xl border">
          <SyncLoader size={12} color="#2E7D32" />
          <p className="text-muted-foreground text-sm">
            {t('loading_gis_data', 'Loading GIS data and maps...')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
          {/* Left Column: Map Controls Sidebar */}
          <div className="space-y-5">
            {/* Search Card */}
            <div className="bg-card border-border space-y-3 rounded-xl border p-4 shadow-sm">
              <h3 className="text-foreground text-sm font-bold uppercase tracking-wider">
                {t('search_parcel_title', 'Search Parcel')}
              </h3>
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t(
                    'search_parcel_placeholder',
                    'ID, name, village...',
                  )}
                  className="bg-input-background border-border w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Map Layers Checklist */}
            <div className="bg-card border-border space-y-3 rounded-xl border p-4 shadow-sm">
              <h3 className="text-foreground flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <Layers className="text-muted-foreground h-4 w-4" />
                {t('map_layers_title', 'Map Layers')}
              </h3>
              <div className="space-y-2.5">
                <label className="text-foreground flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={showBoundaries}
                    onChange={(e) => setShowBoundaries(e.target.checked)}
                    className="border-border h-4 w-4 rounded text-[#2E7D32] focus:ring-[#2E7D32]"
                  />
                  <span>
                    {t('layer_parcel_boundaries', 'Parcel Boundaries')}
                  </span>
                </label>
                <label className="text-foreground flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={showRoads}
                    onChange={(e) => setShowRoads(e.target.checked)}
                    className="border-border h-4 w-4 rounded text-[#2E7D32] focus:ring-[#2E7D32]"
                  />
                  <span>{t('layer_survey_markings', 'Survey Markings')}</span>
                </label>
                <label className="text-muted-foreground flex cursor-pointer items-center gap-2.5 text-sm font-medium opacity-60">
                  <input
                    type="checkbox"
                    disabled
                    defaultChecked
                    className="border-border h-4 w-4 rounded"
                  />
                  <span>{t('layer_roads_highways', 'Roads & Highways')}</span>
                </label>
                <label className="text-muted-foreground flex cursor-pointer items-center gap-2.5 text-sm font-medium opacity-60">
                  <input
                    type="checkbox"
                    disabled
                    defaultChecked
                    className="border-border h-4 w-4 rounded"
                  />
                  <span>{t('layer_water_bodies', 'Water Bodies')}</span>
                </label>
              </div>
            </div>

            {/* Scrollable Land Parcels List */}
            <div className="bg-card border-border space-y-3 rounded-xl border p-4 shadow-sm">
              <h3 className="text-foreground text-sm font-bold uppercase tracking-wider">
                {t('parcels_list_title', 'Parcels (:count)').replace(
                  ':count',
                  String(filteredParcels.length),
                )}
              </h3>
              <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {filteredParcels.length > 0 ? (
                  filteredParcels.map((parcel) => {
                    const isSelected = selectedParcelId === parcel.id;

                    return (
                      <button
                        key={parcel.id}
                        onClick={() => setSelectedParcelId(parcel.id)}
                        className={`w-full rounded-lg border border-transparent p-3 text-left transition-all ${
                          isSelected
                            ? 'border-[#2E7D32] bg-[#2E7D32] text-white shadow-sm'
                            : 'hover:bg-muted bg-muted/30 border-border/40'
                        }`}
                      >
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-sm font-bold ${isSelected ? 'text-white' : 'text-foreground'}`}
                          >
                            {parcel.parcel_id}
                          </span>
                          <StatusBadge status={parcel.status} />
                        </div>
                        <p
                          className={`truncate text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground font-medium'}`}
                        >
                          {parcel.land_name ||
                            t('unnamed_parcel', 'Unnamed parcel')}
                        </p>
                        <p
                          className={`mt-1 flex items-center gap-1 text-[10px] ${isSelected ? 'text-white/70' : 'text-muted-foreground/80'}`}
                        >
                          <Compass className="h-3 w-3 shrink-0" />
                          {parcel.latitude
                            ? `${Number(parcel.latitude).toFixed(4)}, ${Number(parcel.longitude).toFixed(4)}`
                            : t('no_gps_coordinate', 'No GPS coordinate')}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-muted-foreground p-6 text-center text-xs">
                    {t('no_matching_parcels', 'No matching parcels found.')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Map Display & Selected Parcel Info */}
          <div className="space-y-6 lg:col-span-3">
            {/* Map Container */}
            <div className="bg-card border-border overflow-hidden rounded-xl border shadow-sm">
              {/* Map Toolbar */}
              <div className="border-border bg-muted/20 flex items-center justify-between border-b px-4 py-3">
                <div className="bg-card border-border flex items-center gap-1.5 rounded-lg border p-0.5 shadow-sm">
                  <button
                    onClick={handleZoomIn}
                    disabled={!selectedParcel?.latitude}
                    className="hover:bg-muted text-foreground rounded-md p-1.5 transition-colors disabled:opacity-40"
                    title={t('tooltip_zoom_in', 'Zoom In')}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    disabled={!selectedParcel?.latitude}
                    className="hover:bg-muted text-foreground rounded-md p-1.5 transition-colors disabled:opacity-40"
                    title={t('tooltip_zoom_out', 'Zoom Out')}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <div className="bg-border mx-1 my-auto h-4 w-px" />
                  <button
                    onClick={handleFullScreen}
                    disabled={!selectedParcel?.latitude}
                    className="hover:bg-muted text-foreground rounded-md p-1.5 transition-colors disabled:opacity-40"
                    title={t('tooltip_open_google_maps', 'Open in Google Maps')}
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-muted-foreground bg-card border-border flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold shadow-sm">
                  <Compass className="h-3.5 w-3.5 text-[#2E7D32]" />
                  <span>
                    GPS:{' '}
                    {selectedParcel &&
                    selectedParcel.latitude &&
                    selectedParcel.longitude
                      ? `${Number(selectedParcel.latitude).toFixed(6)}, ${Number(selectedParcel.longitude).toFixed(6)}`
                      : t('gps_none', 'None')}
                  </span>
                </div>
              </div>

              {/* Map Canvas */}
              <div className="h-140 relative overflow-hidden bg-[#cce4f2]">
                {selectedParcel &&
                selectedParcel.latitude &&
                selectedParcel.longitude ? (
                  <iframe
                    title={t(
                      'iframe_title',
                      'Map showing location of :id',
                    ).replace(':id', selectedParcel.parcel_id)}
                    src={getMapEmbedUrl()}
                    className="absolute inset-0 h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                ) : (
                  <div className="bg-linear-to-br absolute inset-0 flex items-center justify-center from-[#4a9f8f]/90 to-[#2d6b5f]/95 p-6 text-center">
                    <div className="max-w-sm text-white">
                      <MapPin className="mx-auto mb-4 h-16 w-16 animate-bounce text-white/90" />
                      <p className="mb-2 text-xl font-bold">
                        {t(
                          'no_gps_coordinates_title',
                          'No GPS Coordinates Set',
                        )}
                      </p>
                      <p className="text-sm leading-relaxed text-white/80">
                        {t(
                          'no_gps_coordinates_desc',
                          'This land parcel does not have latitude and longitude details in LAMS database. Register coordinates in properties screen to display map.',
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Optional Boundary Layer Toggles Overlay */}
                {selectedParcel &&
                  selectedParcel.latitude &&
                  selectedParcel.longitude &&
                  showBoundaries && (
                    <div className="pointer-events-none absolute right-4 top-4 z-10">
                      <span className="flex items-center gap-1 rounded border border-white/20 bg-[#2E7D32]/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                        <Layers className="h-3 w-3" />
                        {t('overlay_active', 'Overlay Active')}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Selected Parcel Details Info Panel */}
            {selectedParcel ? (
              <div className="bg-card border-border space-y-5 rounded-xl border p-6 shadow-sm">
                <div className="border-border flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-[#2E7D32]/10 p-2">
                      <MapPin className="h-6 w-6 text-[#2E7D32]" />
                    </div>
                    <div>
                      <h4 className="text-foreground text-lg font-bold">
                        {selectedParcel.land_name ||
                          t('unnamed_land_parcel', 'Unnamed land parcel')}
                      </h4>
                      <p className="text-muted-foreground font-mono text-xs">
                        ID: {selectedParcel.parcel_id}
                      </p>
                    </div>
                  </div>
                  <div className="self-start sm:self-auto">
                    <StatusBadge status={selectedParcel.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Column 1: Location hierarchy */}
                  <div className="space-y-3">
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                      <Compass className="h-4 w-4" />
                      <span>
                        {t('geo_location_title', 'Geographical Location')}
                      </span>
                    </div>
                    <dl className="space-y-1.5 text-sm">
                      <div className="flex justify-between md:block">
                        <dt className="text-muted-foreground text-xs">
                          {t('label_province', 'Province:')}
                        </dt>
                        <dd className="text-foreground font-medium">
                          {selectedParcel.province ||
                            t('value_province_southern', 'Southern')}
                        </dd>
                      </div>
                      <div className="flex justify-between md:block">
                        <dt className="text-muted-foreground text-xs">
                          {t('label_district', 'District:')}
                        </dt>
                        <dd className="text-foreground font-medium">
                          {selectedParcel.district}
                        </dd>
                      </div>
                      <div className="flex justify-between md:block">
                        <dt className="text-muted-foreground text-xs">
                          {t('label_ds_division', 'DS Division:')}
                        </dt>
                        <dd className="text-foreground font-medium">
                          {selectedParcel.divisional_secretariat ||
                            selectedParcel.division ||
                            t('n_a', 'N/A')}
                        </dd>
                      </div>
                      <div className="flex justify-between md:block">
                        <dt className="text-muted-foreground text-xs">
                          {t('label_grama_niladari', 'Grama Niladari:')}
                        </dt>
                        <dd className="text-foreground font-medium">
                          {selectedParcel.grama_niladari_division ||
                            t('n_a', 'N/A')}
                        </dd>
                      </div>
                      <div className="flex justify-between md:block">
                        <dt className="text-muted-foreground text-xs">
                          {t('label_village', 'Village:')}
                        </dt>
                        <dd className="text-foreground font-medium">
                          {selectedParcel.village}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Column 2: Details & specifications */}
                  <div className="border-border space-y-3 border-t pt-4 md:border-x md:border-t-0 md:px-6 md:pt-0">
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                      <Info className="h-4 w-4" />
                      <span>
                        {t('physical_details_title', 'Physical Details')}
                      </span>
                    </div>
                    <dl className="space-y-1.5 text-sm">
                      <div className="flex justify-between md:block">
                        <dt className="text-muted-foreground text-xs">
                          {t('label_land_size', 'Land Size (A / P):')}
                        </dt>
                        <dd className="text-foreground font-medium">
                          {selectedParcel.extent_acers ?? 0}{' '}
                          {t('acres', 'Acres')},{' '}
                          {selectedParcel.extent_perches ?? 0}{' '}
                          {t('perches', 'Perches')}
                        </dd>
                      </div>
                      <div className="flex justify-between md:block">
                        <dt className="text-muted-foreground text-xs">
                          {t('label_estimated_value', 'Estimated Value:')}
                        </dt>
                        <dd className="flex items-center gap-0.5 font-bold text-[#2E7D32]">
                          <DollarSign className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {Number(
                              selectedParcel.estimated_value || 0,
                            ).toLocaleString()}{' '}
                            {t('lkr_currency', 'LKR')}
                          </span>
                        </dd>
                      </div>
                      <div className="flex justify-between md:block">
                        <dt className="text-muted-foreground text-xs">
                          {t(
                            'label_residential_structure',
                            'Residential Structure:',
                          )}
                        </dt>
                        <dd className="text-foreground font-medium">
                          {selectedParcel.has_residential_houses
                            ? t('value_yes', 'Yes')
                            : t('value_no', 'No')}
                        </dd>
                      </div>
                      <div className="flex justify-between md:block">
                        <dt className="text-muted-foreground text-xs">
                          {t('label_cultivation_status', 'Cultivation status:')}
                        </dt>
                        <dd className="text-foreground font-medium capitalize">
                          {selectedParcel.is_cultivated
                            ? t(
                                'value_cultivated',
                                'Cultivated (:crop)',
                              ).replace(
                                ':crop',
                                selectedParcel.cultivation || '',
                              )
                            : t('value_uncultivated', 'Uncultivated')}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Column 3: Project association */}
                  <div className="border-border space-y-3 border-t pt-4 md:border-t-0 md:pt-0">
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                      <Building className="h-4 w-4" />
                      <span>
                        {t('project_association_title', 'Project Association')}
                      </span>
                    </div>
                    {selectedParcel.project ? (
                      <div className="bg-muted/40 border-border space-y-2 rounded-lg border p-3">
                        <div>
                          <p className="text-foreground line-clamp-1 text-xs font-bold">
                            {selectedParcel.project.title}
                          </p>
                          <p className="text-muted-foreground mt-0.5 font-mono text-[10px]">
                            {selectedParcel.project.project_id}
                          </p>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                          {selectedParcel.project.purpose}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted/10 border-border text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
                        {t(
                          'not_associated_project',
                          'Not associated with any project.',
                        )}
                      </div>
                    )}

                    {selectedParcel.plan_number && (
                      <div className="text-foreground bg-muted/20 border-border flex items-center justify-between rounded-lg border p-2.5 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                            {t(
                              'label_survey_plan_number',
                              'Survey Plan Number',
                            )}
                          </span>
                          <span className="font-bold">
                            {selectedParcel.plan_number}
                          </span>
                        </div>
                        {selectedParcel.latitude && (
                          <button
                            onClick={handleFullScreen}
                            className="border-border shadow-xs rounded border bg-white p-1.5 text-[#2E7D32] hover:text-[#2E7D32]/80"
                            title={t(
                              'tooltip_verify_coordinates',
                              'Verify Coordinates',
                            )}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

GisMapList.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
