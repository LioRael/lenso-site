export type PluginDocumentLink = {
  pluginId: string;
  version: string;
  slug: string;
  documentId: string;
  revision: string;
  language: string;
  topic: string;
  channel: 'linked' | 'portable' | 'package' | 'content';
  target: string | null;
  url: string;
};

export type VersionChoice = { version: string; url: string; sameDocument: boolean };

export function exactVersionDocuments(documents: PluginDocumentLink[], pluginId: string, version: string) {
  return documents.filter((document) => document.pluginId === pluginId && document.version === version);
}

export function scopedSearchMatches(
  urls: string[], documents: PluginDocumentLink[], pluginId: string, version: string, limit = 24,
) {
  const allowed = new Map(exactVersionDocuments(documents, pluginId, version)
    .map((document) => [document.url, document]));
  const seen = new Set<string>();
  const matches: PluginDocumentLink[] = [];
  for (const result of urls) {
    const url = result.split('#', 1)[0];
    const document = allowed.get(url);
    if (!document || seen.has(url)) continue;
    seen.add(url);
    matches.push(document);
    if (matches.length === limit) break;
  }
  return matches;
}

export function versionChoices(
  versions: string[], documents: PluginDocumentLink[], pluginId: string,
  currentDocument?: PluginDocumentLink,
): VersionChoice[] {
  return [...new Set(versions)].map((version) => {
    const sameDocument = currentDocument ? documents.filter((document) =>
      document.pluginId === pluginId && document.version === version
      && document.documentId === currentDocument.documentId
      && document.language === currentDocument.language
      && document.channel === currentDocument.channel
      && document.target === currentDocument.target) : [];
    return {
      version,
      url: sameDocument.length === 1 ? sameDocument[0].url
        : `/plugins/${encodeURIComponent(pluginId)}/${encodeURIComponent(version)}`,
      sameDocument: sameDocument.length === 1,
    };
  });
}

export function languageChoices(documents: PluginDocumentLink[], currentDocument: PluginDocumentLink) {
  return exactVersionDocuments(documents, currentDocument.pluginId, currentDocument.version)
    .filter((document) => document.documentId === currentDocument.documentId
      && document.channel === currentDocument.channel && document.target === currentDocument.target)
    .sort((left, right) => left.language.localeCompare(right.language)
      || left.revision.localeCompare(right.revision));
}
