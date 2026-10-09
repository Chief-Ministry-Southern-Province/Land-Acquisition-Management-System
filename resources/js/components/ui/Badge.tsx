import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-[#2E7D32]/10 text-[#2E7D32]',
    warning: 'bg-[#FF9800]/10 text-[#FF9800]',
    danger: 'bg-destructive/10 text-destructive',
    info: 'bg-[#0288d1]/10 text-[#0288d1]',
    outline: 'border border-border text-foreground bg-transparent',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

