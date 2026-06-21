import '../css/app.css';

import type { Page } from '@inertiajs/core';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const appElement =
  typeof document === 'undefined' ? null : document.getElementById('app');
const initialPage = appElement?.dataset.page
  ? (JSON.parse(appElement.dataset.page) as Page)
  : undefined;

createInertiaApp({
  id: 'app',
  page: initialPage,
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob('./pages/**/*.tsx'),
    ) as Promise<ComponentType>,
  setup({ el, App, props }) {
    if (!el) {
      throw new Error('Inertia root element #app was not found.');
    }

    createRoot(el).render(<App {...props} />);
  },
  progress: {
    color: '#4B5563',
  },
});
