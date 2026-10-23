const appBasePath = import.meta.env.BASE_URL.replace(/\/build\/?$/, '').replace(
  /\/$/,
  '',
);

export function appUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${appBasePath}${normalizedPath}`;
}
