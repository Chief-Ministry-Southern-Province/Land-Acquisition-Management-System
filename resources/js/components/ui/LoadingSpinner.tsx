import React, { useEffect, useState } from 'react';
import {
  BarLoader,
  BeatLoader,
  ClipLoader,
  ClockLoader,
  GridLoader,
  PropagateLoader,
  PuffLoader,
  PulseLoader,
  RingLoader,
  ScaleLoader,
  SyncLoader,
} from 'react-spinners';
import { useTheme } from '@/hooks/useTheme';

export type SpinnerType =
  | 'sync'
  | 'pulse'
  | 'clip'
  | 'grid'
  | 'ring'
  | 'beat'
  | 'bar'
  | 'clock'
  | 'propagate'
  | 'scale'
  | 'puff';

export type SpinnerVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'white'
  | 'muted';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingSpinnerProps {
  type?: SpinnerType;
  variant?: SpinnerVariant;
  size?: SpinnerSize | number;
  color?: string;
  label?: string;
  sublabel?: string;
  centered?: boolean;
  className?: string;
}

const SIZE_MAP: Record<SpinnerSize, { numeric: number; barHeight?: number }> = {
  xs: { numeric: 4, barHeight: 2 },
  sm: { numeric: 8, barHeight: 3 },
  md: { numeric: 12, barHeight: 4 },
  lg: { numeric: 18, barHeight: 6 },
  xl: { numeric: 24, barHeight: 8 },
};

export function LoadingSpinner({
  type = 'sync',
  variant = 'secondary',
  size = 'md',
  color: customColor,
  label,
  sublabel,
  centered = false,
  className = '',
}: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      if (typeof window === 'undefined') return false;
      const rootDark = document.documentElement.classList.contains('dark');
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      return (
        rootDark || window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    };

    setIsDark(checkDark());

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [theme]);

  // Determine standard theme color palette matching government UI standards
  const resolveColor = (): string => {
    if (customColor) return customColor;

    switch (variant) {
      case 'primary':
        // Government Blue (#1565C0 in light, #60A5FA in dark)
        return isDark ? '#60a5fa' : '#1565c0';
      case 'secondary':
        // Government Emerald Green (#2E7D32 in light, #4ADE80 in dark)
        return isDark ? '#4ade80' : '#2e7d32';
      case 'accent':
        // Government Gold/Amber (#D97706 in light, #FBBF24 in dark)
        return isDark ? '#fbbf24' : '#d97706';
      case 'white':
        return '#ffffff';
      case 'muted':
      default:
        return isDark ? '#94a3b8' : '#64748b';
    }
  };

  const activeColor = resolveColor();

  const numSize =
    typeof size === 'number'
      ? size
      : (SIZE_MAP[size] || SIZE_MAP.md).numeric;

  const barHeight =
    typeof size === 'number'
      ? Math.max(2, Math.round(size / 3))
      : (SIZE_MAP[size] || SIZE_MAP.md).barHeight || 4;

  const renderSpinnerComponent = () => {
    switch (type) {
      case 'pulse':
        return <PulseLoader size={numSize} color={activeColor} />;
      case 'clip':
        return <ClipLoader size={numSize * 2.5} color={activeColor} />;
      case 'grid':
        return <GridLoader size={Math.max(6, numSize - 4)} color={activeColor} />;
      case 'ring':
        return <RingLoader size={numSize * 3} color={activeColor} />;
      case 'beat':
        return <BeatLoader size={numSize} color={activeColor} />;
      case 'bar':
        return (
          <BarLoader
            width={numSize * 8}
            height={barHeight}
            color={activeColor}
          />
        );
      case 'clock':
        return <ClockLoader size={numSize * 2.5} color={activeColor} />;
      case 'propagate':
        return <PropagateLoader size={numSize} color={activeColor} />;
      case 'scale':
        return <ScaleLoader height={numSize * 2} width={4} color={activeColor} />;
      case 'puff':
        return <PuffLoader size={numSize * 3} color={activeColor} />;
      case 'sync':
      default:
        return <SyncLoader size={numSize} color={activeColor} />;
    }
  };

  const containerClasses = [
    'flex flex-col items-center justify-center transition-all duration-200',
    centered ? 'w-full h-full py-6' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {renderSpinnerComponent()}
      {label && (
        <span className="mt-3 text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {sublabel}
        </span>
      )}
    </div>
  );
}

export default LoadingSpinner;
