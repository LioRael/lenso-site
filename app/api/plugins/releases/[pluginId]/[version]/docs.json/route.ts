import { verifiedSignedDocuments } from '@/lib/linked-documents';
import { signedPluginRelease, staticSignedPluginReleaseParams } from '@/lib/signed-plugin-directory';
import { versionedPluginDocuments } from '@/lib/versioned-plugin-documents';

type Params = Promise<{ pluginId: string; version: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return staticSignedPluginReleaseParams();
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const { pluginId, version } = await params;
  const index = versionedPluginDocuments(signedPluginRelease(pluginId, version), verifiedSignedDocuments);
  return index ? Response.json(index) : new Response('Release not found', { status: 404 });
}
