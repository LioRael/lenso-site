/**
 * Resolve exact-version links produced by the legacy Marketplace UI.
 * Unknown releases stay unavailable; a Site build cannot infer catalog history.
 * @param {string} search
 * @param {readonly (readonly [string, string])[]} releases
 * @returns {{ kind: 'release', href: string } | { kind: 'unavailable', pluginId?: string, version?: string } | null}
 */
export function legacyMarketplaceDestination(search, releases) {
  const params = new URLSearchParams(search);
  const pluginIds = params.getAll('plugin');
  const versions = params.getAll('version');
  if (pluginIds.length === 0 && versions.length === 0) return null;
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
