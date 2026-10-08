import { existsSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';

const siteOrigin = 'https://lenso.dev';
const allowedExternalHosts = new Set(['docs.rs', 'github.com', 'www.npmjs.com']);

export function assertAllowedExternalUrl(url) {
  if (url.protocol !== 'https:' || !allowedExternalHosts.has(url.hostname) || url.port || url.username || url.password) {
    throw new Error(`host is not allowlisted for external checks: ${url.hostname}`);
  }
}

export function isPublishedSiteUrl(url, outputRoot) {
  if (url.hostname !== 'lenso.dev') return false;
  if (url.origin !== siteOrigin || url.username || url.password) {
    throw new Error(`invalid own-site URL: ${url.toString()}`);
  }

  const root = resolve(outputRoot);
  const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const candidates = extname(pathname)
    ? [pathname]
    : [join(pathname, 'index.html'), `${pathname}.html`];
  if (!candidates.some((candidate) => {
    const file = resolve(root, candidate);
    return file.startsWith(`${root}${sep}`) && existsSync(file) && statSync(file).isFile();
  })) {
    throw new Error(`own-site URL has no published target: ${url.toString()}`);
  }
  return true;
}
