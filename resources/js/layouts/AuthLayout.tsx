import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="from-primary to-secondary flex min-h-screen items-center justify-center bg-linear-to-br px-4 py-10">
      <div className="absolute right-4 top-4 flex gap-2">
        <Link
          href="/lang/en"
          className="rounded bg-white/20 px-3 py-1 text-sm text-white transition-colors hover:bg-white/30"
        >
          EN
        </Link>
        <Link
          href="/lang/si"
          className="rounded bg-white/20 px-3 py-1 text-sm text-white transition-colors hover:bg-white/30"
        >
          SI
        </Link>
      </div>

      <section className="w-full max-w-md rounded-lg border border-white/20 bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="bg-primary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <span className="text-3xl font-semibold text-white">LA</span>
          </div>
          <h1 className="mb-2 text-2xl">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>

        {children}
      </section>
    </div>
  );
}
