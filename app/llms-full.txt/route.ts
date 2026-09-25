import { docsLlms, source } from '@/lib/source';
import { frameworkDocsManifest } from '@/lib/framework-docs';

export const dynamic = 'force-static';
export async function GET() {
  const manifest = await frameworkDocsManifest(source.getPages());
  return new Response(`# Lenso framework documentation\n\nChannel: ${manifest.preview.channel}\nPublished framework versions: none in this Site build\nPreview corpus revision: ${manifest.preview.revision}\nExact version inventory: /api/docs/versions\nSigned Plugin directory: /api/plugins/catalog.json (build-verified records; check each snapshot expiry before adoption)\n\n${await docsLlms.full()}`);
}
