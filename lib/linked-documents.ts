import generated from './.generated/linked-documents.json';

export type VerifiedLinkedDocument = {
  pluginId: string;
  version: string;
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

export const verifiedLinkedDocuments = generated as Record<string, VerifiedLinkedDocument>;

export function staticLinkedDocumentParams() {
  const documents = Object.values(verifiedLinkedDocuments).map(({ pluginId, version, slug }) => ({ pluginId, version, slug }));
  // Next static export requires one generated path even when no catalog is configured.
  // A leading underscore cannot be a valid signed Plugin ID.
  return documents.length > 0 ? documents : [{ pluginId: '_no-signed-document', version: '_none', slug: '_none' }];
}
