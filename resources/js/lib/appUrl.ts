function extractPath(url: string | undefined): string {
  if (!url) {
    return '';
  }

  return new URL(url, 'http://localhost').pathname.replace(/\/$/, '');
}

const configuredBasePath = extractPath(import.meta.env.VITE_APP_URL);
const buildBasePath = import.meta.env.BASE_URL.replace(
  /\/build\/?$/,
  '',
).replace(/\/$/, '');

export const appBasePath = configuredBasePath || buildBasePath;

export function appUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${appBasePath}${normalizedPath}`;
}
