import React from 'react';
import { Loader2, Compass, Layers } from 'lucide-react';

interface MapLoadingSkeletonProps {
  height?: string | number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function MapLoadingSkeleton({
  height = '100%',
  label = 'Loading Geographic Information System...',
  sublabel = 'Southern Provincial Council • Spatial Mapping Division',
  className = '',
}: MapLoadingSkeletonProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{ height: heightStyle, minHeight: '260px' }}
      className={`relative w-full overflow-hidden rounded-lg border border-border bg-slate-50/70 dark:bg-slate-900/60 select-none flex items-center justify-center ${className}`}
    >
      {/* Official Survey/Cartographic Grid Background */}
      <svg
        className="absolute inset-0 h-full w-full stroke-slate-300/40 dark:stroke-slate-700/30"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="gis-grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              strokeWidth="0.75"
              strokeDasharray="2,3"
            />
            {/* Coordinate intersection crosshair */}
            <path
              d="M 46 48 L 50 48 M 48 46 L 48 50"
              fill="none"
              strokeWidth="1"
              stroke="currentColor"
              className="stroke-slate-400/50 dark:stroke-slate-600/40"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gis-grid-pattern)" />
      </svg>

      {/* Subtle topographic contour overlay lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 40%, currentColor 1px, transparent 1px),
                            radial-gradient(ellipse at 70% 60%, currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Official Geodetic Reference Metadata (Sri Lanka Datum 99) */}
      <div
        className="pointer-events-none absolute top-3 left-3 hidden sm:flex items-center gap-2 rounded border border-border/60 bg-background/80 px-2 py-1 text-[10px] font-mono font-medium text-muted-foreground shadow-xs backdrop-blur-xs"
        aria-hidden="true"
      >
        <Compass className="h-3 w-3 text-[#2E7D32] dark:text-[#4ADE80]" />
        <span>CRS: SLD99 / EPSG:5234</span>
      </div>

      <div
        className="pointer-events-none absolute top-3 right-3 hidden sm:flex items-center gap-1.5 rounded border border-border/60 bg-background/80 px-2 py-1 text-[10px] font-mono font-medium text-muted-foreground shadow-xs backdrop-blur-xs"
        aria-hidden="true"
      >
        <Layers className="h-3 w-3 text-[#1565C0] dark:text-[#60A5FA]" />
        <span>GIS CADASTRE LAYER</span>
      </div>

      {/* Central Institutional Status Card */}
      <div className="relative z-10 flex flex-col items-center justify-center rounded-xl border border-border/80 bg-background/95 px-6 py-5 text-center shadow-sm backdrop-blur-md max-w-sm mx-4">
        <div className="mb-3.5 flex items-center justify-center">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#2E7D32]/10 dark:bg-[#4ADE80]/15 text-[#2E7D32] dark:text-[#4ADE80]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </div>

        <h4 className="text-sm font-semibold tracking-tight text-foreground">
          {label}
        </h4>
        {sublabel && (
          <p className="mt-1 text-xs font-normal text-muted-foreground">
            {sublabel}
          </p>
        )}

        {/* Discreet official progress bar */}
        <div className="mt-3.5 h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-[#2E7D32] dark:bg-[#4ADE80] animate-pulse" />
        </div>
      </div>

      {/* Bottom Scale Bar Indicator */}
      <div
        className="pointer-events-none absolute bottom-3 left-3 hidden sm:flex items-center gap-2 rounded border border-border/60 bg-background/80 px-2.5 py-1 text-[10px] font-mono text-muted-foreground shadow-xs backdrop-blur-xs"
        aria-hidden="true"
      >
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-6 border-l border-r border-b border-foreground/50"></div>
          <span>1:10,000</span>
        </div>
        <span className="text-border">|</span>
        <span>Southern Province, LK</span>
      </div>
    </div>
  );
}

export default MapLoadingSkeleton;
