import { staticLinkedDocumentParams, verifiedLinkedDocuments } from '@/lib/linked-documents';

type Params = Promise<{ pluginId: string; version: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return staticLinkedDocumentParams();
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const { pluginId, version, slug } = await params;
  const document = verifiedLinkedDocuments[slug];
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
