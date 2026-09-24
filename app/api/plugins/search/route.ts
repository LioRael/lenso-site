import { createSearchAPI } from 'fumadocs-core/search/server';
import { verifiedSignedDocuments } from '@/lib/linked-documents';
import { linkedDocumentPath } from '@/lib/linked-document-paths';

export const dynamic = 'force-static';

const indexes = Object.values(verifiedSignedDocuments).map((document) => ({
  title: document.topic,
  description: `${document.pluginId}@${document.version} · ${document.language} · ${document.channel}`,
  breadcrumbs: ['Plugins', `${document.pluginId}@${document.version}`],
  content: document.content,
  keywords: `${document.pluginId} ${document.version} ${document.documentId} ${document.revision} ${document.language} ${document.target ?? ''}`,
  url: linkedDocumentPath(document.pluginId, document.version, document.slug),
  locale: document.language,
}));

export const { staticGET: GET } = createSearchAPI('simple', { indexes });
