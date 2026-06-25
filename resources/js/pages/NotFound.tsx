import { router } from '@inertiajs/react';
import { Home, LogIn, ArrowLeft, Unlink } from 'lucide-react';

function NotFound() {
  return (
    <div className="from-primary to-primary/80 bg-linear-to-br relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Decorative floating circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 animate-pulse rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-white/5 [animation-delay:1s]" />
        <div className="absolute right-1/4 top-1/3 h-40 w-40 animate-pulse rounded-full bg-white/5 [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-card rounded-2xl p-10 text-center shadow-2xl">
          {/* Icon */}
          <div className="bg-primary/10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
            <Unlink className="text-primary h-12 w-12" />
          </div>

          {/* 404 Heading */}
          <h1 className="text-primary/20 mb-2 select-none text-8xl font-extrabold leading-none">
            404
          </h1>
          <h2 className="mb-2 text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-xs text-sm">
            Sorry, the page you are looking for doesn't exist or has been moved.
            Please check the URL or navigate back using one of the options
            below.
          </p>

          {/* Divider */}
          <div className="border-border mb-8 border-t" />

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="border-border hover:bg-muted inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

            <button
              type="button"
              onClick={() => router.visit('/login')}
              className="border-border hover:bg-muted inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>

            <button
              type="button"
              onClick={() => router.visit('/dashboard')}
              className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </button>
          </div>

          {/* Footer note */}
          <div className="bg-muted/50 mt-8 rounded-lg p-4">
            <p className="text-muted-foreground text-xs">
              <strong>Land Acquisition Management System</strong> — Government
              of Sri Lanka
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
