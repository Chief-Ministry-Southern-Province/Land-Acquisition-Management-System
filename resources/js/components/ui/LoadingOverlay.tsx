import React from 'react';
import { Building2 } from 'lucide-react';
import { LoadingSpinner, SpinnerType, SpinnerVariant } from './LoadingSpinner';

export interface LoadingOverlayProps {
  show?: boolean;
  message?: string;
  subMessage?: string;
  type?: SpinnerType;
  variant?: SpinnerVariant;
  fullScreen?: boolean;
  blur?: boolean;
}

export function LoadingOverlay({
  show = true,
  message = 'Loading data...',
  subMessage = 'Southern Province Land Acquisition Portal',
  type = 'sync',
  variant = 'secondary',
  fullScreen = false,
  blur = true,
}: LoadingOverlayProps) {
  if (!show) return null;

  const baseClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center p-4'
    : 'absolute inset-0 z-40 flex items-center justify-center p-4 rounded-xl';

  const backdropClasses = blur
    ? 'bg-background/80 dark:bg-background/85 backdrop-blur-sm'
    : 'bg-background dark:bg-background';

  return (
    <div
      className={`${baseClasses} ${backdropClasses} transition-all duration-300`}
      role="alert"
      aria-busy="true"
    >
      <div className="bg-card border-border/60 flex flex-col items-center justify-center rounded-2xl border px-8 py-7 shadow-xl max-w-sm w-full text-center space-y-4 transition-all duration-300">
        <div className="bg-secondary/10 dark:bg-secondary/20 p-3 rounded-full text-secondary dark:text-emerald-400">
          <Building2 className="h-7 w-7 animate-pulse" />
        </div>

        <LoadingSpinner
          type={type}
          variant={variant}
          size="md"
        />

        <div className="space-y-1">
          <p className="text-foreground font-bold text-sm tracking-wide">
            {message}
          </p>
          {subMessage && (
            <p className="text-muted-foreground text-xs font-medium">
              {subMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoadingOverlay;
