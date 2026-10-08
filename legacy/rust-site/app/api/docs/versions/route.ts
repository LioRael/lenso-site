import { frameworkDocsManifest } from '@/lib/framework-docs';
import { source } from '@/lib/source';

export const dynamic = 'force-static';

export async function GET() {
  return Response.json(await frameworkDocsManifest(source.getPages()));
}
