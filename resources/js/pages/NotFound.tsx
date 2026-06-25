import { router } from '@inertiajs/react';
import { Home, LogIn, ArrowLeft, Unlink } from 'lucide-react';

function NotFound() {
  return (
    <div className="from-primary to-primary/80 bg-linear-to-br flex min-h-screen items-center justify-center relative overflow-hidden">
      {/* Decorative floating circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5 animate-pulse" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5 animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-white/5 animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="bg-card rounded-2xl p-10 shadow-2xl text-center">
          {/* Icon */}
          <div className="bg-primary/10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
            <Unlink className="h-12 w-12 text-primary" />
          </div>

          {/* 404 Heading */}
          <h1 className="text-8xl font-extrabold text-primary/20 select-none leading-none mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-2">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
            Sorry, the page you are looking for doesn't exist or has been moved.
            Please check the URL or navigate back using one of the options below.
          </p>

          {/* Divider */}
          <div className="border-border border-t mb-8" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
              <strong>Land Acquisition Management System</strong> — Government of Sri Lanka
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;