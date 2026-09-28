import {
  signedLinkedCatalog,
  signedPortableCatalog,
  signedPackageCatalog,
  signedReleaseContent,
  type SignedLinkedRelease,
  type SignedPortableRelease,
  type SignedPackageRelease,
} from '@/lib/plugin-candidates';
import { linkedDocumentApiPath, linkedDocumentPath, linkedReleasePath } from '@/lib/linked-document-paths';

type Document = SignedLinkedRelease['documentation'][number];

function documents(pluginId: string, version: string, items: Document[]) {
  return items.map((document) => ({
    ...document,
    pageUrl: linkedDocumentPath(pluginId, version, document.slug),
    markdownUrl: linkedDocumentApiPath(pluginId, version, document.slug),
  }));
}

function linkedDistribution(release: SignedLinkedRelease) {
  return {
    kind: 'linked_cargo' as const,
    catalogId: signedLinkedCatalog.catalogId,
    catalogRevision: signedLinkedCatalog.revision,
    expiresAt: signedLinkedCatalog.expiresAt,
    release: {
      ...release,
      documentation: documents(release.pluginId, release.version, release.documentation),
    },
  };
}

function portableDistribution(release: SignedPortableRelease) {
  return {
    kind: 'portable_bundle' as const,
    catalogId: signedPortableCatalog.catalogId,
    catalogRevision: signedPortableCatalog.revision,
    expiresAt: signedPortableCatalog.expiresAt,
    detailsRevision: signedPortableCatalog.detailsRevision,
    detailsExpiresAt: signedPortableCatalog.detailsExpiresAt,
    release: {
      ...release,
      documentation: documents(release.pluginId, release.version, release.documentation),
    },
  };
}

function packageDistribution(release: SignedPackageRelease) {
  return {
    kind: 'npm_package' as const,
    catalogId: signedPackageCatalog.catalogId,
    catalogRevision: signedPackageCatalog.revision,
    expiresAt: signedPackageCatalog.expiresAt,
    release: {
      ...release,
      documentation: documents(release.pluginId, release.version, release.documentation),
    },
  };
}

const releases = new Map<string, {
  pluginId: string;
  version: string;
  pageUrl: string;
  apiUrl: string;
  distributions: (ReturnType<typeof linkedDistribution> | ReturnType<typeof portableDistribution>
    | ReturnType<typeof packageDistribution>)[];
  optionalSourceContent: {
    catalogId: string | null;
    catalogRevision: number | null;
    expiresAt: number | null;
    release: (typeof signedReleaseContent.releases)[number];
  }[];
}>();

for (const release of signedLinkedCatalog.releases) {
  const key = `${release.pluginId}\0${release.version}`;
  releases.set(key, {
    pluginId: release.pluginId,
    version: release.version,
    pageUrl: linkedReleasePath(release.pluginId, release.version),
    apiUrl: `/api/plugins/releases/${encodeURIComponent(release.pluginId)}/${encodeURIComponent(release.version)}/release.json`,
    distributions: [linkedDistribution(release)],
    optionalSourceContent: [],
  });
}
for (const release of signedPortableCatalog.releases) {
  const key = `${release.pluginId}\0${release.version}`;
  const existing = releases.get(key);
  if (existing) existing.distributions.push(portableDistribution(release));
  else releases.set(key, {
    pluginId: release.pluginId,
    version: release.version,
    pageUrl: linkedReleasePath(release.pluginId, release.version),
    apiUrl: `/api/plugins/releases/${encodeURIComponent(release.pluginId)}/${encodeURIComponent(release.version)}/release.json`,
    distributions: [portableDistribution(release)],
    optionalSourceContent: [],
  });
}
for (const release of signedPackageCatalog.releases) {
  const key = `${release.pluginId}\0${release.version}`;
  const existing = releases.get(key);
  if (existing) existing.distributions.push(packageDistribution(release));
  else releases.set(key, {
    pluginId: release.pluginId,
    version: release.version,
    pageUrl: linkedReleasePath(release.pluginId, release.version),
    apiUrl: `/api/plugins/releases/${encodeURIComponent(release.pluginId)}/${encodeURIComponent(release.version)}/release.json`,
    distributions: [packageDistribution(release)],
    optionalSourceContent: [],
  });
}
for (const content of signedReleaseContent.releases) {
  const key = `${content.pluginId}\0${content.version}`;
  let release = releases.get(key);
  if (release && content.baseKind === 'content_only') {
    throw new Error(`content_only identity collides with a listed base release: ${content.pluginId}@${content.version}`);
  }
  if (!release && content.baseKind === 'content_only') {
    release = {
      pluginId: content.pluginId,
      version: content.version,
      pageUrl: linkedReleasePath(content.pluginId, content.version),
      apiUrl: `/api/plugins/releases/${encodeURIComponent(content.pluginId)}/${encodeURIComponent(content.version)}/release.json`,
      distributions: [],
      optionalSourceContent: [],
    };
    releases.set(key, release);
  }
  if (release) release.optionalSourceContent.push({
    catalogId: signedReleaseContent.catalogId,
    catalogRevision: signedReleaseContent.revision,
    expiresAt: signedReleaseContent.expiresAt,
    release: content,
  });
}

export const signedPluginReleases = [...releases.values()]
  .sort((left, right) => {
    const leftKey = `${left.pluginId}\0${left.version}`;
    const rightKey = `${right.pluginId}\0${right.version}`;
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  });

export function signedPluginRelease(pluginId: string, version: string) {
  return releases.get(`${pluginId}\0${version}`);
}

export function signedPluginDirectory() {
  return {
    schema: 'lenso.site.signed-plugin-directory.v1',
    verification: 'signature-verified-at-build',
    note: 'Snapshot expiry, registry availability, and project compatibility must be checked before adoption. Unsigned candidates are excluded.',
    catalogs: {
      linkedCargo: { catalogId: signedLinkedCatalog.catalogId, revision: signedLinkedCatalog.revision, expiresAt: signedLinkedCatalog.expiresAt },
      portable: { catalogId: signedPortableCatalog.catalogId, revision: signedPortableCatalog.revision, expiresAt: signedPortableCatalog.expiresAt,
        detailsRevision: signedPortableCatalog.detailsRevision, detailsExpiresAt: signedPortableCatalog.detailsExpiresAt },
      package: { catalogId: signedPackageCatalog.catalogId, revision: signedPackageCatalog.revision,
        expiresAt: signedPackageCatalog.expiresAt },
      optionalSourceContent: { catalogId: signedReleaseContent.catalogId, revision: signedReleaseContent.revision,
        expiresAt: signedReleaseContent.expiresAt },
    },
    releases: signedPluginReleases,
  };
}
