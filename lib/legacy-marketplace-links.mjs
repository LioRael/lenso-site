/**
 * Collect exact release identities from the signed Site channels only.
 * @param {...readonly { pluginId: string, version: string }[]} channels
 * @returns {(readonly [string, string])[]}
 */
export function signedLegacyMarketplaceReleases(...channels) {
  return channels.flatMap((releases) => releases.map(({ pluginId, version }) => [pluginId, version]));
}

/**
 * Resolve exact-version links produced by the legacy Marketplace UI.
 * Unknown releases stay unavailable; a Site build cannot infer catalog history.
 * @param {string} search
 * @param {readonly (readonly [string, string])[]} releases
 * @returns {{ kind: 'release', href: string } | { kind: 'browse', href: string } | { kind: 'unsupported' } | { kind: 'unavailable', pluginId?: string, version?: string } | null}
 */
export function legacyMarketplaceDestination(search, releases) {
  const params = new URLSearchParams(search);
  const pluginIds = params.getAll('plugin');
  const versions = params.getAll('version');
  if (pluginIds.length === 0 && versions.length === 0) {
    const queries = params.getAll('q');
    const views = params.getAll('view');
    if (['publisher', 'license', 'offset', 'catalog'].some((key) => params.has(key))
      || views.length > 1 || (views.length === 1 && views[0] !== 'browse')
      || queries.length > 1 || queries.some((query) => query.length > 256)) {
      return { kind: 'unsupported' };
    }
    if (queries.length === 1 && queries[0]) {
      return { kind: 'browse', href: `/plugins/?q=${encodeURIComponent(queries[0])}` };
    }
    if (queries.length === 1 || views.length === 1) return { kind: 'browse', href: '/plugins/' };
    return null;
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
