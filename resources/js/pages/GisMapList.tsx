import { Layers, MapPin, Maximize, Search, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBridge';
import MainLayout from '@/layouts/MainLayout';

export default function GisMapList() {
  const [selectedParcel, setSelectedParcel] = useState("PCL-8934");

  const parcels = [
    { id: "PCL-8934", name: "Unawatuna - 123/4A", status: "acquired", coordinates: "6.0104, 80.2502" },
    { id: "PCL-8935", name: "Galle - 124/1B", status: "in-progress", coordinates: "6.0328, 80.2170" },
    { id: "PCL-8936", name: "Habaraduwa - 125/3", status: "pending", coordinates: "6.0708, 80.2420" },
  ];

  const parcelInfo = parcels.find((p) => p.id === selectedParcel);
  
  return (
    <div className="space-y-6">
      <div>
        <h1>GIS / Map View</h1>
        <p className="text-muted-foreground mt-1">Interactive map of land parcels and acquisition areas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Controls Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="mb-3">Search Parcel</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter parcel ID..."
                className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg"
              />
            </div>
          </div>

          {/* Layers */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Map Layers
            </h3>
            <div className="space-y-2">
              {["Parcel Boundaries", "Satellite View", "Survey Layers", "Roads", "Water Bodies"].map((layer) => (
                <label key={layer} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm">{layer}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Parcel List */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="mb-3">Parcels</h3>
            <div className="space-y-2">
              {parcels.map((parcel) => (
                <button
                  key={parcel.id}
                  onClick={() => setSelectedParcel(parcel.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedParcel === parcel.id ? "bg-primary text-white" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
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
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {/* Map Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Zoom In">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Zoom Out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Full Screen">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-muted-foreground">
                Coordinates: {parcelInfo?.coordinates}
              </div>
            </div>

            {/* Map Container */}
            <div className="relative h-150 bg-linear-to-br from-[#4a9f8f] to-[#2d6b5f]">
              {/* Placeholder Map */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/80">
                  <MapPin className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg mb-2">Interactive GIS Map</p>
                  <p className="text-sm">Parcel boundaries and acquisition areas would be displayed here</p>
                  <p className="text-sm mt-2">Integration with mapping services like Google Maps or OpenStreetMap</p>
                </div>
              </div>

              {/* Sample Parcel Overlay */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-primary bg-primary/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-white mx-auto mb-1" />
                  <p className="text-white text-sm">{selectedParcel}</p>
                </div>
              </div>
            </div>

            {/* Parcel Info Panel */}
            {parcelInfo && (
              <div className="p-4 border-t border-border">
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
