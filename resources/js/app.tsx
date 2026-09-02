import { createInertiaApp } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import Swal from 'sweetalert2';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Intercept server-side HTML/JSON crash pages and present them cleanly with SweetAlert2
(router as any).on('invalid', (event: any) => {
  const response = event.detail.response;
  const status = response.status;

  if (
    import.meta.env.PROD ||
    status === 500 ||
    status === 403 ||
    status === 404 ||
    status === 419
  ) {
    event.preventDefault();

    if (status === 401) {
      Swal.fire({
        title: 'Session Expired',
        text: 'Your session has expired. Please login again.',
        icon: 'warning',
        confirmButtonText: 'OK',
      }).then(() => {
        window.location.href = '/';
      });
    } else if (status === 403) {
      Swal.fire({
        title: 'Access Denied',
        text: 'You do not have permission to perform this action.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } else if (status === 404) {
      Swal.fire({
        title: 'Not Found',
        text: 'The requested resource was not found.',
        icon: 'question',
        confirmButtonText: 'OK',
      });
    } else if (status === 419) {
      Swal.fire({
        title: 'Session Expired',
        text: 'Session expired. Please refresh the page.',
        icon: 'warning',
        confirmButtonText: 'Refresh',
      }).then(() => {
        window.location.reload();
      });
    } else {
      Swal.fire({
        title: 'Server Error',
        text: 'A server error occurred. Our team has been notified.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
});

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  setup({ el, App, props }) {
    if (el) {
      const root = createRoot(el);
      root.render(
        <GlobalErrorBoundary>
          <App {...props} />
        </GlobalErrorBoundary>,
      );
    }
  },
  progress: {
    color: '#1565C0',
  },
});
