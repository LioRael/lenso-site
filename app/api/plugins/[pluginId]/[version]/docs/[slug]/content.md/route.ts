import { staticVerifiedDocumentParams, verifiedSignedDocuments } from '@/lib/linked-documents';

type Params = Promise<{ pluginId: string; version: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return staticVerifiedDocumentParams();
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const { pluginId, version, slug } = await params;
  const document = verifiedSignedDocuments[slug];
  if (!document || document.pluginId !== pluginId || document.version !== version) {
    return new Response('Document not found', { status: 404 });
  }
  return new Response(document.content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Lenso-Document-Digest': document.digest,
    },
  });
}
