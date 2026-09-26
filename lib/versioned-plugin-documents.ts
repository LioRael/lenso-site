import { createHash } from 'node:crypto';

type DocumentReference = {
  id: string;
  revision: string;
  language: string;
  topic: string;
  target?: string;
  url: string;
  digest: string;
  slug: string;
  pageUrl: string;
  markdownUrl: string;
};

type Distribution = {
  kind: 'linked_cargo' | 'portable_bundle' | 'npm_package';
  provenance?: 'linked_release_details';
  catalogId: string | null;
  catalogRevision: number | null;
  expiresAt: number | null;
  detailsRevision?: number | null;
  detailsExpiresAt?: number | null;
  release: {
    documentation: DocumentReference[];
    details?: {
      revision: number;
      expiresAt: number;
      documentation: DocumentReference[];
    };
  };
};

type Release = {
  pluginId: string;
  version: string;
  apiUrl: string;
  distributions: Distribution[];
};

type VerifiedDocument = {
  pluginId: string;
  version: string;
  channel: 'linked' | 'portable' | 'package' | 'linked_details';
  slug: string;
  documentId: string;
  revision: string;
  language: string;
  topic: string;
  target: string | null;
  sourceUrl: string;
  digest: string;
  content: string;
};

type Authority = {
  channel: VerifiedDocument['channel'];
  catalogId: string | null;
  catalogRevision: number | null;
  expiresAt: number | null;
};

export function versionedPluginDocuments(release: Release | undefined, verified: Record<string, VerifiedDocument>) {
  if (!release) return null;
  const selected = release;
  const indexed = new Map<string, {
    documentId: string;
    revision: string;
    language: string;
    topic: string;
    target: string | null;
    channel: VerifiedDocument['channel'];
    digest: string;
    sourceUrl: string;
    pageUrl: string;
    markdownUrl: string;
    catalogId: string | null;
    catalogRevision: number | null;
    expiresAt: number | null;
  }>();

  function add(document: DocumentReference, authority: Authority) {
    const body = verified[document.slug];
    if (!body || body.pluginId !== selected.pluginId || body.version !== selected.version
      || body.slug !== document.slug || body.channel !== authority.channel
      || body.documentId !== document.id || body.revision !== document.revision
      || body.language !== document.language || body.topic !== document.topic
      || body.target !== (document.target ?? null) || body.sourceUrl !== document.url
      || body.digest !== document.digest) {
      throw new Error(`signed document metadata and verified body differ: ${document.slug}`);
    }
    if (`sha256:${createHash('sha256').update(body.content).digest('hex')}` !== document.digest) {
      throw new Error(`verified document body changed after ingestion: ${document.slug}`);
    }
    const entry = {
      documentId: document.id,
      revision: document.revision,
      language: document.language,
      topic: document.topic,
      target: document.target ?? null,
      channel: authority.channel,
      digest: document.digest,
      sourceUrl: document.url,
      pageUrl: document.pageUrl,
      markdownUrl: document.markdownUrl,
      catalogId: authority.catalogId,
      catalogRevision: authority.catalogRevision,
      expiresAt: authority.expiresAt,
    };
    const previous = indexed.get(document.slug);
    if (previous && JSON.stringify(previous) !== JSON.stringify(entry)) {
      throw new Error(`conflicting signed document authority: ${document.slug}`);
    }
    indexed.set(document.slug, entry);
  }

  for (const distribution of release.distributions) {
    const channel: VerifiedDocument['channel'] = distribution.kind === 'linked_cargo' ? 'linked'
      : distribution.kind === 'portable_bundle' ? 'portable'
        : distribution.provenance === 'linked_release_details' ? 'linked_details' : 'package';
    const authority = {
      channel,
      catalogId: distribution.catalogId,
      catalogRevision: channel === 'portable' ? (distribution.detailsRevision ?? null) : distribution.catalogRevision,
      expiresAt: channel === 'portable' ? (distribution.detailsExpiresAt ?? null) : distribution.expiresAt,
    };
    for (const document of distribution.release.documentation) add(document, authority);
    if (distribution.kind === 'linked_cargo' && distribution.release.details) {
      const details = distribution.release.details;
      for (const document of details.documentation) add(document, {
        channel: 'linked_details',
        catalogId: distribution.catalogId,
        catalogRevision: details.revision,
        expiresAt: details.expiresAt,
      });
    }
  }
  for (const document of Object.values(verified)) {
    if (document.pluginId === release.pluginId && document.version === release.version && !indexed.has(document.slug)) {
      throw new Error(`verified document has no signed release reference: ${document.slug}`);
    }
  }
  return {
    schema: 'lenso.site.plugin-documents.v1',
    pluginId: release.pluginId,
    version: release.version,
    releaseApiUrl: release.apiUrl,
    verification: 'signed-metadata-and-sha256-body-verified-at-build',
    selection: 'exact-version-only',
    documents: [...indexed.values()].sort((left, right) => {
      const a = JSON.stringify([left.documentId, left.revision, left.channel]);
      const b = JSON.stringify([right.documentId, right.revision, right.channel]);
      return a < b ? -1 : a > b ? 1 : 0;
    }),
  };
}
