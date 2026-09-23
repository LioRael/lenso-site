import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CandidateDocumentation } from '@/components/candidate-documentation';
import { CopyCommand } from '@/components/copy-command';
import { SiteHeader } from '@/components/site-header';
import { candidateRelease, signedLinkedCatalog, type SignedLinkedRelease } from '@/lib/plugin-candidates';
import { linkedDocumentPath, linkedReleasePath } from '@/lib/linked-document-paths';

type Params = Promise<{ pluginId: string; version: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  const releases = signedLinkedCatalog.releases.map(({ pluginId, version }) => ({ pluginId, version }));
  if (!releases.some(({ pluginId, version }) => pluginId === candidateRelease.pluginId && version === candidateRelease.version)) {
    releases.push({ pluginId: candidateRelease.pluginId, version: candidateRelease.version });
  }
  return releases;
}

function findSigned(pluginId: string, version: string) {
  return signedLinkedCatalog.releases.find((release) => release.pluginId === pluginId && release.version === version);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { pluginId, version } = await params;
  const release = findSigned(pluginId, version);
  if (release) {
    return { title: `${release.title} ${version}`, description: release.summary };
  }
  if (pluginId === candidateRelease.pluginId && version === candidateRelease.version) {
    return {
      title: `${candidateRelease.pluginId} ${candidateRelease.version}`,
      description: `${candidateRelease.summary} Candidate documentation; not yet catalog-signed.`,
      robots: { index: false, follow: false },
    };
  }
  return {};
}

export default async function PluginReleasePage({ params }: { params: Params }) {
  const { pluginId, version } = await params;
  const release = findSigned(pluginId, version);
  if (release) return <SignedReleasePage release={release} />;
  if (pluginId === candidateRelease.pluginId && version === candidateRelease.version) return <CandidateDocumentation />;
  notFound();
}

function SignedReleasePage({ release }: { release: SignedLinkedRelease }) {
  const otherVersions = signedLinkedCatalog.releases.filter((item) => item.pluginId === release.pluginId && item.version !== release.version);
  const genericAdoption = release.integration === 'linked_plugin' && release.registryUrl === 'https://crates.io';
  const adoptCommand = `lenso app add ${release.pluginId}@${release.version} --linked-snapshot ./linked-cargo-snapshot.json --trust ./catalog-trust.json --crate ./${release.package}-${release.version}.crate`;
  return <div className="linked-release-shell">
    <SiteHeader active="plugins" />
    <main className="linked-doc-main">
      <nav aria-label="Breadcrumb" className="linked-doc-breadcrumb"><Link href="/plugins">Plugins</Link><span>/</span><span>{release.pluginId}@{release.version}</span></nav>
      <header className="linked-doc-header">
        <p className="linked-doc-eyebrow">Listed in signed linked Cargo catalog</p>
        <h1>{release.title}</h1>
        <p>{release.summary}</p>
      </header>
      <aside className="linked-doc-provenance">
        <strong>Catalog evidence, not an installation</strong>
        <p>This exact release was verified against the configured catalog public key when Site was built. The snapshot expires {signedLinkedCatalog.expiresAt ? new Date(signedLinkedCatalog.expiresAt * 1000).toISOString() : 'at an unknown time'}. Reverify it locally before adoption; a signed listing does not establish source-code safety or compatibility with your Host.</p>
        <dl>
          <div><dt>Plugin ID</dt><dd><code>{release.pluginId}</code></dd></div>
          <div><dt>Version</dt><dd>{release.version}</dd></div>
          <div><dt>Publisher ID</dt><dd>{release.publisherId}</dd></div>
          <div><dt>Catalog</dt><dd>{signedLinkedCatalog.catalogId} · revision {signedLinkedCatalog.revision}</dd></div>
          <div><dt>Distribution</dt><dd>Linked Cargo · {release.integration === 'host_provided' ? 'Host-provided integration' : 'linked Plugin'}</dd></div>
          <div><dt>Package</dt><dd><code>{release.package}</code></dd></div>
          <div><dt>Crate SHA-256</dt><dd><code>{release.crateDigest}</code></dd></div>
          <div><dt>Declared targets</dt><dd>{release.targets.join(', ')}</dd></div>
          <div><dt>Source revision</dt><dd><code>{release.sourceRevision}</code></dd></div>
          <div><dt>License</dt><dd>{release.license}</dd></div>
        </dl>
        <p><a href={release.sourceUrl} rel="noopener noreferrer" target="_blank">Source</a> · <a href={release.registryUrl} rel="noopener noreferrer" target="_blank">Registry</a></p>
      </aside>
      {otherVersions.length > 0 && <section className="linked-release-section"><h2>Other listed versions</h2><ul>{otherVersions.map((item) => <li key={item.version}><Link href={linkedReleasePath(item.pluginId, item.version)}>{item.version}</Link></li>)}</ul></section>}
      <section className="linked-release-section" aria-labelledby="adoption-heading">
        <h2 id="adoption-heading">Adopt this exact version</h2>
        {genericAdoption ? <>
          <p>Download the signed snapshot, its independently trusted public-key configuration and the exact registry <code>.crate</code> to your own project. The CLI checks the signature, validity window, Host target, archive digest and package identity before changing your App.</p>
          <div className="code-panel"><div className="code-panel-head"><span>Local project · replace paths with verified files</span><CopyCommand value={adoptCommand} /></div><pre><code>{adoptCommand}</code></pre></div>
          <p>This is a local Host build input, not a portable runtime bundle. Inspect the resolved App and build/check it before use. The Site cannot grant local filesystem access.</p>
        </> : <p>This release requires a product Host-specific integration or a registry unsupported by generic <code>lenso app add</code>. Do not use the generic adoption command.</p>}
      </section>
      <section className="linked-release-section" aria-labelledby="release-docs-heading">
        <h2 id="release-docs-heading">Documentation for {release.version}</h2>
        {release.documentation.length === 0 ? <p>No versioned Markdown is attached to this release.</p> : <ul>{release.documentation.map((document) => <li key={`${document.id}@${document.revision}`}>
          <Link href={linkedDocumentPath(release.pluginId, release.version, document.slug)}>{document.topic}</Link> · {document.language} · revision {document.revision}{document.target ? ` · ${document.target}` : ''}
        </li>)}</ul>}
      </section>
    </main>
  </div>;
}
