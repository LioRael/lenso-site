export type SignedReleaseDetails = {
  pluginId: string;
  version: string;
  revision: number;
  releaseDigest: string;
  detailsDigest: string;
};

// This channel stays empty until Marketplace consumes and verifies the W6
// release-details protocol. Candidate claims must never enter it.
export const signedReleaseDetails: readonly SignedReleaseDetails[] = [];

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
