import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { SiteHeader } from '@/components/site-header';
import { signedLinkedCatalog, signedPackageCatalog, signedPortableCatalog } from '@/lib/plugin-candidates';
import { linkedDocumentApiPath, linkedReleasePath } from '@/lib/linked-document-paths';
import { staticVerifiedDocumentParams, verifiedSignedDocuments } from '@/lib/linked-documents';

type Params = Promise<{ pluginId: string; version: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return staticVerifiedDocumentParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { pluginId, version, slug } = await params;
  const document = verifiedSignedDocuments[slug];
  if (!document || document.pluginId !== pluginId || document.version !== version) return {};
  return { title: `${document.topic} · ${pluginId} ${version}`, description: `${document.topic} for ${pluginId}@${version}` };
}

export default async function SignedDocumentationPage({ params }: { params: Params }) {
  const { pluginId, version, slug } = await params;
  const document = verifiedSignedDocuments[slug];
  if (!document || document.pluginId !== pluginId || document.version !== version) notFound();
  const catalog = document.channel === 'portable' ? signedPortableCatalog
    : document.channel === 'package' ? signedPackageCatalog : signedLinkedCatalog;
  const revision = document.channel === 'portable' ? signedPortableCatalog.detailsRevision : catalog.revision;
  const expiresAt = document.channel === 'portable' ? signedPortableCatalog.detailsExpiresAt : catalog.expiresAt;
  const channelLabel = document.channel === 'portable' ? 'Portable'
    : document.channel === 'package' ? 'npm-only package' : 'linked Cargo';
  return <div className="linked-doc-shell">
    <SiteHeader active="plugins" />
    <main className="linked-doc-main">
      <nav aria-label="Breadcrumb" className="linked-doc-breadcrumb"><Link href="/plugins">Plugins</Link><span>/</span><Link href={linkedReleasePath(pluginId, version)}>{pluginId}@{version}</Link></nav>
      <header className="linked-doc-header">
        <p className="linked-doc-eyebrow">Verified {channelLabel} versioned Markdown · {document.language}</p>
        <h1>{document.topic}</h1>
        <p>{pluginId}@{version} · document {document.documentId}@{document.revision}</p>
        {document.target && <p>Target: {document.target}</p>}
      </header>
      <aside className="linked-doc-provenance">
        <strong>Content verified at Site build</strong>
        <p>The signed {document.channel === 'portable' ? 'release details and exact Portable base' : `${channelLabel} catalog`} name this exact revision, size and SHA-256. This third-party Markdown is displayed as data; HTML, images and executable MDX are disabled.</p>
        <dl><div><dt>Digest</dt><dd><code>{document.digest}</code></dd></div><div><dt>Catalog</dt><dd>{catalog.catalogId}</dd></div><div><dt>{document.channel === 'portable' ? 'Details revision' : 'Catalog revision'}</dt><dd>{revision}</dd></div><div><dt>{document.channel === 'portable' ? 'Signed details expire' : 'Signed catalog expires'}</dt><dd>{expiresAt ? new Date(expiresAt * 1000).toISOString() : 'unknown'}</dd></div></dl>
        <a href={linkedDocumentApiPath(pluginId, version, slug)}>Read verified Markdown API</a>
      </aside>
      <article className="linked-doc-body">
        <ReactMarkdown
          allowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'pre', 'code', 'a', 'hr', 'br']}
          skipHtml
          components={{
            // The page title owns H1; publisher headings remain nested beneath it.
            h1: ({ children }) => <h2>{children}</h2>,
            h2: ({ children }) => <h3>{children}</h3>,
            h3: ({ children }) => <h4>{children}</h4>,
            h4: ({ children }) => <h5>{children}</h5>,
            h5: ({ children }) => <h6>{children}</h6>,
            a: ({ href, children }) => {
              try {
                const url = new URL(href ?? '');
                if (url.protocol === 'https:' && !url.username && !url.password) {
                  return <a href={url.toString()} rel="nofollow noopener noreferrer" target="_blank">{children}</a>;
                }
              } catch { /* Relative and malformed third-party links are not navigable. */ }
              return <span>{children}</span>;
            },
          }}
        >{document.content}</ReactMarkdown>
      </article>
      <p className="linked-doc-footer">Publisher-authored content may contain errors. Review code, permissions and external service requirements before adoption.</p>
    </main>
  </div>;
}
