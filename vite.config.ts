import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appUrl = env.VITE_APP_URL || env.APP_URL || 'http://localhost/lams';
  const appBasePath = new URL(appUrl, 'http://localhost').pathname.replace(
    /\/+$/,
    '',
  );

  return {
    base: `${appBasePath}/build/`,
    plugins: [
      laravel({
        input: ['resources/css/app.css', 'resources/js/app.tsx'],
        refresh: true,
        fonts: [
          bunny('Instrument Sans', {
            weights: [400, 500, 600],
          }),
        ],
      }),
      inertia(),
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      tailwindcss(),
      wayfinder({
        formVariants: true,
      }),
      {
        name: 'prefix-font-asset-urls',
        enforce: 'post',
        generateBundle(_options, bundle) {
          const buildBase = `${appBasePath}/build/`;

          for (const file of Object.values(bundle)) {
            if (
              file.type !== 'asset' ||
              !file.fileName.endsWith('.css') ||
              typeof file.source !== 'string'
            ) {
              continue;
            }

            file.source = file.source
              .replaceAll('url("/build/', `url("${buildBase}`)
              .replaceAll("url('/build/", `url('${buildBase}`)
              .replaceAll('url(/build/', `url(${buildBase}`);
          }
        },
      },
    ],
  };
});
