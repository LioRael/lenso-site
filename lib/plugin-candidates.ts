import generated from './.generated/linked-catalog.json';
import portableGenerated from './.generated/portable-catalog.json';
import packageGenerated from './.generated/package-catalog.json';
import contentGenerated from './.generated/release-content.json';

export type SignedLinkedRelease = {
  pluginId: string;
  version: string;
  title: string;
  summary: string;
  publisherId: string;
  sourceUrl: string;
  sourceRevision: string;
  license: string;
  package: string;
  registryUrl: string;
  integration: 'linked_plugin' | 'host_provided';
  targets: string[];
  crateDigest: string;
  documentation: {
    id: string;
    revision: string;
    language: string;
    topic: string;
    target?: string;
    url: string;
    digest: string;
    size: number;
    media_type: 'text/markdown';
    slug: string;
  }[];
};
export type SignedLinkedCatalog = {
  catalogId: string | null;
  revision: number | null;
  expiresAt: number | null;
  releases: SignedLinkedRelease[];
};
// Build-time ingestion validates the signed wire payload before writing this JSON.
export const signedLinkedCatalog = generated as SignedLinkedCatalog;

export type SignedPortableRelease = {
  pluginId: string;
  version: string;
  title: string;
  summary: string;
  publisherId: string;
  sourceUrl: string;
  sourceRevision: string;
  license: string;
  artifactUrl: string;
  artifactDigest: string;
  artifactSize: number;
  manifestDigest: string;
  documentation: SignedLinkedRelease['documentation'];
};
export type SignedPortableCatalog = {
  catalogId: string | null;
  revision: number | null;
  expiresAt: number | null;
  detailsRevision: number | null;
  detailsExpiresAt: number | null;
  releases: SignedPortableRelease[];
};
export const signedPortableCatalog = portableGenerated as SignedPortableCatalog;

export type SignedPackageRelease = {
  pluginId: string;
  version: string;
  title: string;
  summary: string;
  publisherId: string;
  sourceUrl: string;
  sourceRevision: string;
  license: string;
  distributions: {
    id: string;
    kind: 'npm_package';
    package: string;
    version: string;
    integrity: string;
    registryUrl: string;
    targets: string[];
  }[];
  documentation: SignedLinkedRelease['documentation'];
};
export type SignedPackageCatalog = {
  catalogId: string | null;
  revision: number | null;
  expiresAt: number | null;
  linkedDetailsRevision: number | null;
  linkedDetailsExpiresAt: number | null;
  joinedLinkedBaseIdentities: Record<string, string>;
  releases: SignedPackageRelease[];
};
export const signedPackageCatalog = packageGenerated as SignedPackageCatalog;

export type SignedReleaseContent = {
  pluginId: string;
  version: string;
  baseKind: 'linked_cargo' | 'portable';
  baseReleaseIdentity: string;
  content: {
    id: string;
    kind: 'editable_template' | 'development_extension';
    url: string;
    digest: string;
    size: number;
  }[];
};
export type SignedReleaseContentCatalog = {
  catalogId: string | null;
  revision: number | null;
  expiresAt: number | null;
  releases: SignedReleaseContent[];
};
export const signedReleaseContent = contentGenerated as SignedReleaseContentCatalog;

export const candidateRelease = {
  pluginId: 'lenso.web-ingress',
  package: 'lenso-web-ingress-plugin',
  version: '0.4.5',
  summary: 'General-purpose linked Rust HTTP Ingress Plugin for Lenso backends.',
  distribution: 'Linked Rust',
  target: 'Native',
  catalogStatus: 'Not yet catalog-signed',
  registryUrl: 'https://docs.rs/crate/lenso-web-ingress-plugin/0.4.5',
  sourceTag: 'lenso-web-ingress-plugin-v0.4.5',
  sourceRevision: '0e93f1149ac1b0905a51d76692d369a028f3a532',
  sourceUrl: 'https://github.com/LioRael/lenso-web/commit/0e93f1149ac1b0905a51d76692d369a028f3a532',
  maintainedSourceUrl: 'https://github.com/LioRael/lenso/tree/main/crates/lenso-web-ingress-plugin',
} as const;
