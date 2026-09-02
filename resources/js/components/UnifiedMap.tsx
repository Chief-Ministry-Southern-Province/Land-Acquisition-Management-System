import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useMapProvider } from '@/hooks/useMapProvider';
import type { LandParcel } from '@/services/landParcelManagementService';

// Sri Lanka Geographic Bounding Box Limits
export const SRI_LANKA_BOUNDS = {
  minLat: 5.7,
  maxLat: 10.0,
  minLng: 79.3,
  maxLng: 82.0,
};

export const isWithinSriLanka = (lat: number, lng: number): boolean => {
  return (
    lat >= SRI_LANKA_BOUNDS.minLat &&
    lat <= SRI_LANKA_BOUNDS.maxLat &&
    lng >= SRI_LANKA_BOUNDS.minLng &&
    lng <= SRI_LANKA_BOUNDS.maxLng
  );
};

interface UnifiedMapProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  zoom?: number;
  editable?: boolean;
  onChange?: (latitude: string, longitude: string) => void;
  showBoundaries?: boolean;
  boundaryGeoJson?: any;
  parcels?: LandParcel[];
  selectedParcelId?: string;
  onSelectParcel?: (id: string) => void;
  height?: string;
}

export default function UnifiedMap({
  latitude,
  longitude,
  zoom = 12,
  editable = false,
  onChange,
  showBoundaries = true,
  boundaryGeoJson,
  parcels = [],
  selectedParcelId,
  onSelectParcel,
  height = '100%',
}: UnifiedMapProps) {
  const { provider, loading: providerLoading } = useMapProvider();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Keep references to clean up and modify maps dynamically
  const googleMapRef = useRef<any>(null);
  const googleMarkerRef = useRef<any>(null);
  const googleMarkersMapRef = useRef<Map<string, any>>(new Map());

  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkerRef = useRef<L.Marker | null>(null);
  const leafletMarkersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const leafletGeoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [mapInitialized, setMapInitialized] = useState(false);

  // Default coordinates to Galle, Southern Province, Sri Lanka
  const defaultLat = 6.0535;
  const defaultLng = 80.221;

  const currentLat = Number(latitude) || defaultLat;
  const currentLng = Number(longitude) || defaultLng;

  // Render SVG Marker Icon for Leaflet
  const getLeafletIcon = (isSelected: boolean) => {
    const color = isSelected ? '#d32f2f' : '#2E7D32'; // Red for selected, Green for others
    const size = isSelected ? 36 : 28;
    const svgHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" style="filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.4));">
        <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-leaflet-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  };

  // Google Maps SVG Symbol helper
  const getGoogleMarkerSymbol = (isSelected: boolean) => {
    return {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: isSelected ? '#d32f2f' : '#2E7D32',
      fillOpacity: 1.0,
      strokeColor: '#FFFFFF',
      strokeWeight: 1.5,
      scale: isSelected ? 1.5 : 1.2,
      anchor: new (window as any).google.maps.Point(12, 22),
    };
  };

  // Safe GeoJSON parser helper
  const parseGeoJson = (data: any) => {
    if (!data) {
      return null;
    }

    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      console.error('Failed to parse GeoJSON boundary data:', e);

      return null;
    }
  };

  // -------------------------------------------------------------
  // LEAFLET MAP INITIALIZATION & SYNC
  // -------------------------------------------------------------
  useEffect(() => {
    if (providerLoading || provider !== 'leaflet' || !mapContainerRef.current) {
      return;
    }

    // Reset previous Leaflet instance if any
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    // Initialize Map with Sri Lanka boundary constraints
    const sriLankaBounds = L.latLngBounds(
      [SRI_LANKA_BOUNDS.minLat, SRI_LANKA_BOUNDS.minLng],
      [SRI_LANKA_BOUNDS.maxLat, SRI_LANKA_BOUNDS.maxLng],
    );

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
      maxBounds: sriLankaBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 7,
    }).setView([currentLat, currentLng], zoom);

    leafletMapRef.current = map;

    // Add Tile Layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const notifyOutOfBounds = () => {
      Swal.fire({
        title: 'Location Out of Bounds',
        text: 'Selection is restricted strictly within Sri Lanka boundaries.',
        icon: 'warning',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    };

    // If single marker (not multi-parcel list)
    if (parcels.length === 0) {
      if (latitude && longitude) {
        const marker = L.marker([currentLat, currentLng], {
          icon: getLeafletIcon(true),
          draggable: editable,
        }).addTo(map);

        if (editable && onChange) {
          marker.on('dragend', () => {
            const latLng = marker.getLatLng();

            if (!isWithinSriLanka(latLng.lat, latLng.lng)) {
              notifyOutOfBounds();

              if (latitude && longitude) {
                marker.setLatLng([currentLat, currentLng]);
              }

              return;
            }

            onChange(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
          });
        }

        leafletMarkerRef.current = marker;
      }

      // Add click listener in edit mode to relocate marker
      if (editable && onChange) {
        map.on('click', (e) => {
          const latLng = e.latlng;

          if (!isWithinSriLanka(latLng.lat, latLng.lng)) {
            notifyOutOfBounds();

            return;
          }

          onChange(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
        });
      }
    }

    setTimeout(() => {
      setMapInitialized(true);
    }, 0);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      setTimeout(() => {
        setMapInitialized(false);
      }, 0);
    };
  }, [provider, providerLoading]);

  // Sync Leaflet single marker position & zoom updates
  useEffect(() => {
    if (
      provider !== 'leaflet' ||
      !leafletMapRef.current ||
      parcels.length > 0
    ) {
      return;
    }

    const map = leafletMapRef.current;

    if (latitude && longitude) {
      const position: L.LatLngTuple = [currentLat, currentLng];

      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.setLatLng(position);

        if (editable) {
          leafletMarkerRef.current.dragging?.enable();
        } else {
          leafletMarkerRef.current.dragging?.disable();
        }
      } else {
        const marker = L.marker(position, {
          icon: getLeafletIcon(true),
          draggable: editable,
        }).addTo(map);

        if (editable && onChange) {
          marker.on('dragend', () => {
            const latLng = marker.getLatLng();
            onChange(latLng.lat.toFixed(6), latLng.lng.toFixed(6));
          });
        }

        leafletMarkerRef.current = marker;
      }

      map.setView(position, zoom);
    } else {
      if (leafletMarkerRef.current) {
        leafletMarkerRef.current.remove();
        leafletMarkerRef.current = null;
      }
    }
  }, [latitude, longitude, zoom, editable, provider, parcels.length]);

  // Sync Leaflet GeoJSON layer
  useEffect(() => {
    if (provider !== 'leaflet' || !leafletMapRef.current) {
      return;
    }

    const map = leafletMapRef.current;

    // Remove old layer
    if (leafletGeoJsonLayerRef.current) {
      leafletGeoJsonLayerRef.current.remove();
      leafletGeoJsonLayerRef.current = null;
    }

    if (showBoundaries && boundaryGeoJson) {
      const parsed = parseGeoJson(boundaryGeoJson);

      if (parsed) {
        try {
          const geoJsonLayer = L.geoJSON(parsed, {
            style: {
              fillColor: '#2E7D32',
              color: '#1B5E20',
              weight: 2,
              fillOpacity: 0.2,
            },
          }).addTo(map);
          leafletGeoJsonLayerRef.current = geoJsonLayer;

          // Auto zoom to fits boundaries if in view mode
          if (!editable && parcels.length === 0) {
            const bounds = geoJsonLayer.getBounds();

            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [20, 20] });
            }
          }
        } catch (e) {
          console.error('Error drawing Leaflet GeoJSON boundary:', e);
        }
      }
    }
  }, [boundaryGeoJson, showBoundaries, provider, mapInitialized]);

  // Sync Leaflet multi-parcel markers
  useEffect(() => {
    if (
      provider !== 'leaflet' ||
      !leafletMapRef.current ||
      parcels.length === 0
    ) {
      return;
    }

    const map = leafletMapRef.current;
    const currentMarkers = leafletMarkersMapRef.current;

    // Clear old markers that are no longer in the list
    const parcelIds = new Set(parcels.map((p) => p.id));
    currentMarkers.forEach((marker, id) => {
      if (!parcelIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Render / update markers
    parcels.forEach((parcel) => {
      if (!parcel.latitude || !parcel.longitude) {
        return;
      }

      const isSelected = parcel.id === selectedParcelId;
      const position: L.LatLngTuple = [
        Number(parcel.latitude),
        Number(parcel.longitude),
      ];
      const icon = getLeafletIcon(isSelected);

      let marker = currentMarkers.get(parcel.id);

      if (marker) {
        marker.setLatLng(position);
        marker.setIcon(icon);

        if (isSelected) {
          marker.setZIndexOffset(1000);
        } else {
          marker.setZIndexOffset(0);
        }
      } else {
        marker = L.marker(position, { icon }).addTo(map);
        marker.on('click', () => {
          if (onSelectParcel) {
            onSelectParcel(parcel.id);
          }
        });
        currentMarkers.set(parcel.id, marker);
      }

      // Add a popup on hover/click to display parcel details
      const popupContent = `
        <div class="p-1 font-sans text-xs">
          <p class="font-bold text-slate-800">${parcel.parcel_id}</p>
          <p class="text-slate-600 font-medium my-0.5">${parcel.land_name || 'Unnamed Parcel'}</p>
          <p class="text-slate-500">${parcel.village}, ${parcel.district}</p>
          <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-${
            parcel.status === 'acquired'
              ? 'red-600'
              : parcel.status === 'pending'
                ? 'yellow-600'
                : 'green-600'
          }">${parcel.status.toUpperCase()}</span>
        </div>
      `;
      marker.bindPopup(popupContent);

      if (isSelected) {
        marker.openPopup();
        map.setView(position, Math.max(map.getZoom(), 14));
      }
    });
  }, [parcels, selectedParcelId, provider, mapInitialized]);

  // -------------------------------------------------------------
  // GOOGLE MAPS INITIALIZATION & SYNC
  // -------------------------------------------------------------
  useEffect(() => {
    if (providerLoading || provider !== 'google' || !mapContainerRef.current) {
      return;
    }

    const google = (window as any).google;

    if (!google?.maps) {
      return;
    }

    // Initialize Map with Sri Lanka restriction boundaries
    const map = new google.maps.Map(mapContainerRef.current, {
      center: { lat: currentLat, lng: currentLng },
      zoom: zoom,
      mapTypeId: 'roadmap',
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: true,
      zoomControl: true,
      restriction: {
        latLngBounds: {
          north: SRI_LANKA_BOUNDS.maxLat,
          south: SRI_LANKA_BOUNDS.minLat,
          west: SRI_LANKA_BOUNDS.minLng,
          east: SRI_LANKA_BOUNDS.maxLng,
        },
        strictBounds: true,
      },
      minZoom: 7,
    });

    googleMapRef.current = map;

    const notifyGoogleOutOfBounds = () => {
      Swal.fire({
        title: 'Location Out of Bounds',
        text: 'Selection is restricted strictly within Sri Lanka boundaries.',
        icon: 'warning',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    };

    // Single Marker rendering
    if (parcels.length === 0) {
      if (latitude && longitude) {
        const marker = new google.maps.Marker({
          position: { lat: currentLat, lng: currentLng },
          map: map,
          draggable: editable,
          icon: getGoogleMarkerSymbol(true),
        });

        if (editable && onChange) {
          marker.addListener('dragend', () => {
            const pos = marker.getPosition();

            if (pos) {
              const lat = pos.lat();
              const lng = pos.lng();

              if (!isWithinSriLanka(lat, lng)) {
                notifyGoogleOutOfBounds();

                if (latitude && longitude) {
                  marker.setPosition({ lat: currentLat, lng: currentLng });
                }

                return;
              }

              onChange(lat.toFixed(6), lng.toFixed(6));
            }
          });
        }

        googleMarkerRef.current = marker;
      }

      if (editable && onChange) {
        map.addListener('click', (e: any) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            if (!isWithinSriLanka(lat, lng)) {
              notifyGoogleOutOfBounds();

              return;
            }

            onChange(lat.toFixed(6), lng.toFixed(6));
          }
        });
      }
    }

    setTimeout(() => {
      setMapInitialized(true);
    }, 0);

    const markersMap = googleMarkersMapRef.current;

    return () => {
      // Clean up listeners if any
      if (googleMapRef.current) {
        google.maps.event.clearInstanceListeners(googleMapRef.current);
      }

      googleMapRef.current = null;
      googleMarkerRef.current = null;
      markersMap.clear();
      setTimeout(() => {
        setMapInitialized(false);
      }, 0);
    };
  }, [provider, providerLoading]);

  // Sync Google single marker position and zoom
  useEffect(() => {
    if (provider !== 'google' || !googleMapRef.current || parcels.length > 0) {
      return;
    }

    const map = googleMapRef.current;
    const google = (window as any).google;

    if (latitude && longitude) {
      const position = { lat: currentLat, lng: currentLng };

      if (googleMarkerRef.current) {
        googleMarkerRef.current.setPosition(position);
        googleMarkerRef.current.setDraggable(editable);
      } else {
        const marker = new google.maps.Marker({
          position,
          map,
          draggable: editable,
          icon: getGoogleMarkerSymbol(true),
        });

        if (editable && onChange) {
          marker.addListener('dragend', () => {
            const pos = marker.getPosition();

            if (pos) {
              onChange(pos.lat().toFixed(6), pos.lng().toFixed(6));
            }
          });
        }

        googleMarkerRef.current = marker;
      }

      map.setCenter(position);
      map.setZoom(zoom);
    } else {
      if (googleMarkerRef.current) {
        googleMarkerRef.current.setMap(null);
        googleMarkerRef.current = null;
      }
    }
  }, [latitude, longitude, zoom, editable, provider, parcels.length]);

  // Sync Google Maps GeoJSON layer
  useEffect(() => {
    if (provider !== 'google' || !googleMapRef.current) {
      return;
    }

    const map = googleMapRef.current;

    // Clear old data features
    map.data.forEach((feature: any) => {
      map.data.remove(feature);
    });

    if (showBoundaries && boundaryGeoJson) {
      const parsed = parseGeoJson(boundaryGeoJson);

      if (parsed) {
        try {
          map.data.addGeoJson(parsed);
          map.data.setStyle({
            fillColor: '#2E7D32',
            strokeColor: '#1B5E20',
            strokeWeight: 2,
            fillOpacity: 0.2,
          });

          // Fit bounds
          if (!editable && parcels.length === 0) {
            const bounds = new (window as any).google.maps.LatLngBounds();
            map.data.forEach((feature: any) => {
              feature.getGeometry().forEachLatLng((latlng: any) => {
                bounds.extend(latlng);
              });
            });

            if (!bounds.isEmpty()) {
              map.fitBounds(bounds);
            }
          }
        } catch (e) {
          console.error('Error drawing Google Maps GeoJSON boundary:', e);
        }
      }
    }
  }, [boundaryGeoJson, showBoundaries, provider, mapInitialized]);

  // Sync Google Maps multi-parcel markers
  useEffect(() => {
    if (
      provider !== 'google' ||
      !googleMapRef.current ||
      parcels.length === 0
    ) {
      return;
    }

    const map = googleMapRef.current;
    const google = (window as any).google;
    const currentMarkers = googleMarkersMapRef.current;

    // Clear old markers
    const parcelIds = new Set(parcels.map((p) => p.id));
    currentMarkers.forEach((marker, id) => {
      if (!parcelIds.has(id)) {
        marker.setMap(null);
        currentMarkers.delete(id);
      }
    });

    // Render / update markers
    parcels.forEach((parcel) => {
      if (!parcel.latitude || !parcel.longitude) {
        return;
      }

      const isSelected = parcel.id === selectedParcelId;
      const position = {
        lat: Number(parcel.latitude),
        lng: Number(parcel.longitude),
      };
      const icon = getGoogleMarkerSymbol(isSelected);

      let marker = currentMarkers.get(parcel.id);

      if (marker) {
        marker.setPosition(position);
        marker.setIcon(icon);

        if (isSelected) {
          marker.setZIndex(1000);
        } else {
          marker.setZIndex(1);
        }
      } else {
        marker = new google.maps.Marker({
          position,
          map,
          icon,
        });

        // Setup info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-1 font-sans text-xs text-slate-800">
              <p class="font-bold text-slate-800">${parcel.parcel_id}</p>
              <p class="font-medium my-0.5 text-slate-600">${parcel.land_name || 'Unnamed Parcel'}</p>
              <p class="text-slate-500">${parcel.village}, ${parcel.district}</p>
              <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: ${
                parcel.status === 'acquired'
                  ? '#dc2626'
                  : parcel.status === 'pending'
                    ? '#ca8a04'
                    : '#16a34a'
              }">${parcel.status.toUpperCase()}</span>
            </div>
          `,
        });

        marker.addListener('click', () => {
          if (onSelectParcel) {
            onSelectParcel(parcel.id);
          }
        });

        currentMarkers.set(parcel.id, marker);
        (marker as any).infoWindow = infoWindow;
      }

      if (isSelected) {
        // Close other info windows
        currentMarkers.forEach((m) => m.infoWindow?.close());
        (marker as any).infoWindow?.open(map, marker);
        map.setCenter(position);
      }
    });
  }, [parcels, selectedParcelId, provider, mapInitialized]);

  // Loading indicator for provider initialization
  if (providerLoading) {
    return (
      <div className="bg-card text-foreground border-border flex h-full w-full items-center justify-center rounded-lg border p-6">
        <LoadingSpinner
          type="ring"
          variant="secondary"
          size="lg"
          label="Initializing spatial GIS maps..."
          centered
        />
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="relative z-0 overflow-hidden"
    />
  );
}
