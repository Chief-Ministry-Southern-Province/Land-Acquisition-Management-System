import { useEffect, useState } from 'react';

export type MapProvider = 'google' | 'leaflet';

let globalProvider: MapProvider | null = null;
let detectionPromise: Promise<MapProvider> | null = null;

export const detectMapProvider = (): Promise<MapProvider> => {
  if (detectionPromise) {
    return detectionPromise;
  }

  detectionPromise = new Promise<MapProvider>((resolve) => {
    const apiKey = (import.meta as any).env.VITE_GOOGLE_MAP_API_KEY || '';

    if (!apiKey) {
      console.warn(
        'Google Maps API key is missing. Falling back to LeafletJS.',
      );
      globalProvider = 'leaflet';
      resolve('leaflet');

      return;
    }

    // Capture auth failures globally
    (window as any).gm_authFailure = () => {
      console.warn(
        'Google Maps authentication failed (gm_authFailure). Falling back to LeafletJS.',
      );
      globalProvider = 'leaflet';
      resolve('leaflet');
      window.dispatchEvent(new CustomEvent('map-provider-failed'));
    };

    const scriptId = 'google-maps-detection-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Wait briefly to allow gm_authFailure to be triggered if there is an auth issue
        setTimeout(() => {
          if (globalProvider !== 'leaflet' && (window as any).google?.maps) {
            globalProvider = 'google';
            resolve('google');
          }
        }, 1000);
      };

      script.onerror = () => {
        console.warn(
          'Google Maps script failed to load. Falling back to LeafletJS.',
        );
        globalProvider = 'leaflet';
        resolve('leaflet');
      };

      document.head.appendChild(script);
    } else {
      if ((window as any).google?.maps && globalProvider !== 'leaflet') {
        globalProvider = 'google';
        resolve('google');
      } else if (globalProvider === 'leaflet') {
        resolve('leaflet');
      }
    }

    // Set a timeout of 5 seconds for slow network / connectivity issues
    setTimeout(() => {
      if (globalProvider === null) {
        console.warn('Google Maps load timed out. Falling back to LeafletJS.');
        globalProvider = 'leaflet';
        resolve('leaflet');
        window.dispatchEvent(new CustomEvent('map-provider-failed'));
      }
    }, 5000);
  });

  return detectionPromise;
};

export const useMapProvider = () => {
  const [provider, setProvider] = useState<MapProvider>('leaflet');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    detectMapProvider().then((p) => {
      if (active) {
        setProvider(p);
        setLoading(false);
      }
    });

    const handleFailure = () => {
      if (active) {
        setProvider('leaflet');
        setLoading(false);
      }
    };

    window.addEventListener('map-provider-failed', handleFailure);

    return () => {
      active = false;
      window.removeEventListener('map-provider-failed', handleFailure);
    };
  }, []);

  return { provider, loading };
};
