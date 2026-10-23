const configuredBasePath = import.meta.env.VITE_APP_BASE_PATH || '';

export const appBasePath = `/${configuredBasePath}`
  .replace(/\/+/g, '/')
  .replace(/\/$/, '');

/**
 * Prefix an application-relative URL with the configured deployment path.
 * Absolute/external URLs and URLs which already contain the prefix are kept.
 */
export function appUrl(url: string): string {
  if (!url || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) {
    return url;
  }

  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

  if (
    !appBasePath ||
    normalizedUrl === appBasePath ||
    normalizedUrl.startsWith(`${appBasePath}/`)
  ) {
    return normalizedUrl;
  }

  return `${appBasePath}${normalizedUrl}`;
}
