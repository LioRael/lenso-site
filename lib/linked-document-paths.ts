export function linkedDocumentPath(pluginId: string, version: string, slug: string) {
  return `/plugins/${encodeURIComponent(pluginId)}/${encodeURIComponent(version)}/docs/${slug}`;
}

export function linkedReleasePath(pluginId: string, version: string) {
  return `/plugins/${encodeURIComponent(pluginId)}/${encodeURIComponent(version)}`;
}

export function linkedDocumentApiPath(pluginId: string, version: string, slug: string) {
  return `/api/plugins/${encodeURIComponent(pluginId)}/${encodeURIComponent(version)}/docs/${slug}/content.md`;
}

export function versionedDocumentIndexApiPath(pluginId: string, version: string) {
  return `/api/plugins/releases/${encodeURIComponent(pluginId)}/${encodeURIComponent(version)}/docs.json`;
}
