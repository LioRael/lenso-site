import { createSearchAPI } from 'fumadocs-core/search/server';
import { verifiedSignedDocuments } from '@/lib/linked-documents';
import { linkedDocumentPath } from '@/lib/linked-document-paths';

export const dynamic = 'force-static';

const documents = Object.values(verifiedSignedDocuments);
const indexedBytes = documents.reduce((total, document) => total + Buffer.byteLength(document.content, 'utf8'), 0);
if (documents.length > 512 || indexedBytes > 32 * 1024 * 1024) {
  throw new Error('signed Plugin documentation exceeds the static search index limits');
}

const indexes = documents.map((document) => ({
  title: document.topic,
  description: `${document.pluginId}@${document.version} · ${document.language} · ${document.channel}`,
  breadcrumbs: ['Plugins', document.pluginId, document.version],
  content: document.content,
  keywords: `${document.pluginId} ${document.pluginId}@${document.version} ${document.version} ${document.documentId} ${document.revision} ${document.language} ${document.target ?? ''}`,
  url: linkedDocumentPath(document.pluginId, document.version, document.slug),
  locale: document.language,
}));

export const { staticGET: GET } = createSearchAPI('simple', { indexes });
