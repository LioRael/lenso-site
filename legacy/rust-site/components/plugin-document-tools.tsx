import { PluginDocumentToolsClient } from '@/components/plugin-document-tools-client';
import { linkedDocumentPath } from '@/lib/linked-document-paths';
import { verifiedSignedDocuments } from '@/lib/linked-documents';
import { languageChoices, versionChoices, exactVersionDocuments, type PluginDocumentLink } from '@/lib/plugin-document-navigation';
import { signedPluginReleases } from '@/lib/signed-plugin-directory';

export function PluginDocumentTools({ pluginId, version, documentSlug }: {
  pluginId: string; version: string; documentSlug?: string;
}) {
  const documents: PluginDocumentLink[] = Object.values(verifiedSignedDocuments)
    .filter((document) => document.pluginId === pluginId)
    .map((document) => ({
      pluginId: document.pluginId,
      version: document.version,
      slug: document.slug,
      documentId: document.documentId,
      revision: document.revision,
      language: document.language,
      topic: document.topic,
      channel: document.channel,
      target: document.target,
      url: linkedDocumentPath(document.pluginId, document.version, document.slug),
    }));
  const currentDocuments = exactVersionDocuments(documents, pluginId, version);
  const currentDocument = currentDocuments.find((document) => document.slug === documentSlug);
  const versions = signedPluginReleases.filter((release) => release.pluginId === pluginId)
    .map((release) => release.version);

  return <PluginDocumentToolsClient
    key={`${pluginId}\0${version}\0${documentSlug ?? ''}`}
    pluginId={pluginId}
    version={version}
    documents={currentDocuments}
    indexedDocumentCount={Object.keys(verifiedSignedDocuments).length}
    versions={versionChoices(versions, documents, pluginId, currentDocument)}
    languages={currentDocument ? languageChoices(documents, currentDocument) : []}
    currentDocumentSlug={currentDocument?.slug}
  />;
}
