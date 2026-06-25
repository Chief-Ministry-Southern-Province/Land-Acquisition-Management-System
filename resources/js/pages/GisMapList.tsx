import {
  Layers,
  MapPin,
  Maximize,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';

export default function GisMapList() {
  const [selectedParcel, setSelectedParcel] = useState('PCL-8934');

  const parcels = [
    {
      id: 'PCL-8934',
      name: 'Unawatuna - 123/4A',
      status: 'acquired',
      coordinates: '6.0104, 80.2502',
    },
    {
      id: 'PCL-8935',
      name: 'Galle - 124/1B',
      status: 'in-progress',
      coordinates: '6.0328, 80.2170',
    },
    {
      id: 'PCL-8936',
      name: 'Habaraduwa - 125/3',
      status: 'pending',
      coordinates: '6.0708, 80.2420',
    },
  ];

  const parcelInfo = parcels.find((p) => p.id === selectedParcel);

  return (
    <div className="space-y-6">
      <div>
        <h1>GIS / Map View</h1>
        <p className="text-muted-foreground mt-1">
          Interactive map of land parcels and acquisition areas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Map Controls Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-card border-border rounded-lg border p-4">
            <h3 className="mb-3">Search Parcel</h3>
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter parcel ID..."
                className="bg-input-background border-border w-full rounded-lg border py-2 pl-10 pr-4"
              />
            </div>
          </div>

          {/* Layers */}
          <div className="bg-card border-border rounded-lg border p-4">
            <h3 className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Map Layers
            </h3>
            <div className="space-y-2">
              {[
                'Parcel Boundaries',
                'Satellite View',
                'Survey Layers',
                'Roads',
                'Water Bodies',
              ].map((layer) => (
                <label
                  key={layer}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                  <span className="text-sm">{layer}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Parcel List */}
          <div className="bg-card border-border rounded-lg border p-4">
            <h3 className="mb-3">Parcels</h3>
            <div className="space-y-2">
              {parcels.map((parcel) => (
                <button
                  key={parcel.id}
                  onClick={() => setSelectedParcel(parcel.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                    selectedParcel === parcel.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm">{parcel.id}</span>
                    <StatusBadge status={parcel.status} />
                  </div>
                  <p className="text-xs opacity-80">{parcel.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Display */}
        <div className="lg:col-span-3">
          <div className="bg-card border-border overflow-hidden rounded-lg border">
            {/* Map Toolbar */}
            <div className="border-border bg-muted/30 flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  className="hover:bg-muted rounded-lg p-2 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  className="hover:bg-muted rounded-lg p-2 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  className="hover:bg-muted rounded-lg p-2 transition-colors"
                  title="Full Screen"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
              <div className="text-muted-foreground text-sm">
                Coordinates: {parcelInfo?.coordinates}
              </div>
            </div>

            {/* Map Container */}
            <div className="h-150 bg-linear-to-br relative from-[#4a9f8f] to-[#2d6b5f]">
              {/* Placeholder Map */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/80">
                  <MapPin className="mx-auto mb-4 h-16 w-16" />
                  <p className="mb-2 text-lg">Interactive GIS Map</p>
                  <p className="text-sm">
                    Parcel boundaries and acquisition areas would be displayed
                    here
                  </p>
                  <p className="mt-2 text-sm">
                    Integration with mapping services like Google Maps or
                    OpenStreetMap
                  </p>
                </div>
              </div>

              {/* Sample Parcel Overlay */}
              <div className="border-primary bg-primary/20 absolute left-1/2 top-1/3 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border-4">
                <div className="text-center">
                  <MapPin className="mx-auto mb-1 h-8 w-8 text-white" />
                  <p className="text-sm text-white">{selectedParcel}</p>
                </div>
              </div>
            </div>

            {/* Parcel Info Panel */}
            {parcelInfo && (
              <div className="border-border border-t p-4">
                <h4 className="mb-3">Selected Parcel: {parcelInfo.id}</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p>{parcelInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coordinates:</span>
                    <p>{parcelInfo.coordinates}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      <StatusBadge status={parcelInfo.status} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

GisMapList.layout = (page: React.ReactNode) => <MainLayout>{page}</MainLayout>;
