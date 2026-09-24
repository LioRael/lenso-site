import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { signedLinkedCatalog, signedPortableCatalog } from '@/lib/plugin-candidates';
import { linkedDocumentPath, linkedReleasePath } from '@/lib/linked-document-paths';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const linked = signedLinkedCatalog.releases.flatMap((release) => [
    linkedReleasePath(release.pluginId, release.version),
    ...release.documentation.map((document) => linkedDocumentPath(release.pluginId, release.version, document.slug)),
  ]);
  const portable = signedPortableCatalog.releases.flatMap((release) => [
    linkedReleasePath(release.pluginId, release.version),
    ...release.documentation.map((document) => linkedDocumentPath(release.pluginId, release.version, document.slug)),
  ]);
  return [...new Set(['/', '/plugins', '/docs/versions', '/docs/zh/versions', ...source.getPages().map((page) => page.url), ...linked, ...portable])]
    .map((path) => ({ url: new URL(path, 'https://lenso.dev').toString() }));
}
