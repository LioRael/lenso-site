/**
 * Resolve exact-version links produced by the legacy Marketplace UI.
 * Unknown releases stay unavailable; a Site build cannot infer catalog history.
 * @param {string} search
 * @param {readonly (readonly [string, string])[]} releases
 * @returns {{ kind: 'release', href: string } | { kind: 'browse', href: string } | { kind: 'unavailable', pluginId?: string, version?: string } | null}
 */
export function legacyMarketplaceDestination(search, releases) {
  const params = new URLSearchParams(search);
  const pluginIds = params.getAll('plugin');
  const versions = params.getAll('version');
  if (pluginIds.length === 0 && versions.length === 0) {
    const queries = params.getAll('q');
    if (queries.length !== 1 || !queries[0] || queries[0].length > 256) return null;
    if (['publisher', 'license', 'offset', 'catalog'].some((key) => params.has(key))) return null;
    if (params.has('view') && params.get('view') !== 'browse') return null;
    return { kind: 'browse', href: `/plugins/?q=${encodeURIComponent(queries[0])}` };
  }
  if (pluginIds.length !== 1 || versions.length !== 1) return { kind: 'unavailable' };
  const [pluginId] = pluginIds;
  const [version] = versions;
  if (!pluginId || !version || pluginId.length > 256 || version.length > 256) return { kind: 'unavailable' };
  if (!releases.some(([id, exactVersion]) => id === pluginId && exactVersion === version)) {
    return { kind: 'unavailable', pluginId, version };
  }
  return {
    kind: 'release',
    href: `/plugins/${encodeURIComponent(pluginId)}/${encodeURIComponent(version)}/`,
  };
}
