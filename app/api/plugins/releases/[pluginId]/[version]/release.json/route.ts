import { signedPluginRelease, signedPluginReleases } from '@/lib/signed-plugin-directory';

type Params = Promise<{ pluginId: string; version: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return signedPluginReleases.length > 0
    ? signedPluginReleases.map(({ pluginId, version }) => ({ pluginId, version }))
    : [{ pluginId: '_no-signed-release', version: '_none' }];
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const { pluginId, version } = await params;
  const release = signedPluginRelease(pluginId, version);
  return release ? Response.json(release) : new Response('Release not found', { status: 404 });
}
