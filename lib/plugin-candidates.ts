import generated from './.generated/linked-catalog.json';

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
export const signedLinkedCatalog: SignedLinkedCatalog = generated;

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
} as const;
