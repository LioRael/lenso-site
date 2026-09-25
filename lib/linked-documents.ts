import generated from './.generated/linked-documents.json';

export type VerifiedSignedDocument = {
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

export const verifiedSignedDocuments = generated as Record<string, VerifiedSignedDocument>;

export function staticVerifiedDocumentParams() {
  const documents = Object.values(verifiedSignedDocuments).map(({ pluginId, version, slug }) => ({ pluginId, version, slug }));
  // Next static export requires one generated path even when no catalog is configured.
  // A leading underscore cannot be a valid signed Plugin ID.
  return documents.length > 0 ? documents : [{ pluginId: '_no-signed-document', version: '_none', slug: '_none' }];
}
