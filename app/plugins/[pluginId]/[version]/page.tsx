import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DescriptionListDescription, DescriptionListItem, DescriptionListRoot, DescriptionListTerm } from '@lenso/ui/description-list';
import { CandidateDocumentation } from '@/components/candidate-documentation';
import { CopyCommand } from '@/components/copy-command';
import { SiteHeader } from '@/components/site-header';
import { candidateRelease, signedLinkedCatalog, signedPortableCatalog, type SignedLinkedRelease, type SignedPortableRelease } from '@/lib/plugin-candidates';
import { linkedDocumentPath, linkedReleasePath } from '@/lib/linked-document-paths';

type Params = Promise<{ pluginId: string; version: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  const releases = new Map<string, { pluginId: string; version: string }>();
  for (const { pluginId, version } of [...signedLinkedCatalog.releases, ...signedPortableCatalog.releases]) {
    releases.set(`${pluginId}\0${version}`, { pluginId, version });
  }
  const candidateKey = `${candidateRelease.pluginId}\0${candidateRelease.version}`;
  if (!releases.has(candidateKey)) {
    releases.set(candidateKey, { pluginId: candidateRelease.pluginId, version: candidateRelease.version });
  }
  return [...releases.values()];
}

function findLinked(pluginId: string, version: string) {
  return signedLinkedCatalog.releases.find((release) => release.pluginId === pluginId && release.version === version);
}

function findPortable(pluginId: string, version: string) {
  return signedPortableCatalog.releases.find((release) => release.pluginId === pluginId && release.version === version);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { pluginId, version } = await params;
  const release = findLinked(pluginId, version) ?? findPortable(pluginId, version);
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
  const linked = findLinked(pluginId, version);
  const portable = findPortable(pluginId, version);
  if (linked) return <SignedReleasePage release={linked} portable={portable} />;
  if (portable) return <SignedPortableReleasePage release={portable} />;
  if (pluginId === candidateRelease.pluginId && version === candidateRelease.version) return <CandidateDocumentation />;
  notFound();
}

function SignedReleasePage({ release, portable }: { release: SignedLinkedRelease; portable?: SignedPortableRelease }) {
  const otherVersions = signedLinkedCatalog.releases.filter((item) => item.pluginId === release.pluginId && item.version !== release.version);
  const genericAdoption = release.integration === 'linked_plugin' && release.registryUrl === 'https://crates.io';
  const adoptCommand = `lenso app add ${release.pluginId}@${release.version} --linked-snapshot ./linked-cargo-snapshot.json --trust ./catalog-trust.json --crate ./${release.package}-${release.version}.crate`;
  return <div className="linked-release-shell">
    <SiteHeader active="plugins" />
    <main className="linked-doc-main">
      <nav aria-label="Breadcrumb" className="linked-doc-breadcrumb"><Link href="/plugins">Plugins</Link><span>/</span><span>{release.pluginId}@{release.version}</span></nav>
      <header className="linked-doc-header">
        <p className="linked-doc-eyebrow">{portable ? 'Listed in signed Portable and linked Cargo catalogs' : 'Listed in signed linked Cargo catalog'}</p>
        <h1>{release.title}</h1>
        <p>{release.summary}</p>
        {portable && <p>This identifier and version appear in two independently signed channels. Site does not claim their artifacts are interchangeable or derived from one another.</p>}
      </header>
      <aside className="linked-doc-provenance">
        <strong>Catalog evidence, not an installation</strong>
        <p>This exact release was verified against the configured catalog public key when Site was built. The snapshot expires {signedLinkedCatalog.expiresAt ? new Date(signedLinkedCatalog.expiresAt * 1000).toISOString() : 'at an unknown time'}. Reverify it locally before adoption; a signed listing does not establish source-code safety or compatibility with your Host.</p>
        <ProvenanceFacts items={[
          ['Plugin ID', <code>{release.pluginId}</code>],
          ['Version', release.version],
          ['Publisher ID', release.publisherId],
          ['Catalog', <>{signedLinkedCatalog.catalogId} · revision {signedLinkedCatalog.revision}</>],
          ['Distribution', <>Linked Cargo · {release.integration === 'host_provided' ? 'Host-provided integration' : 'linked Plugin'}</>],
          ['Package', <code>{release.package}</code>],
          ['Crate SHA-256', <code>{release.crateDigest}</code>],
          ['Declared targets', release.targets.join(', ')],
          ['Source revision', <code>{release.sourceRevision}</code>],
          ['License', release.license],
        ]} />
        <p><a href={release.sourceUrl} rel="noopener noreferrer" target="_blank">Source</a> · <a href={release.registryUrl} rel="noopener noreferrer" target="_blank">Registry</a></p>
      </aside>
      {portable && <PortableProvenance release={portable} />}
      {otherVersions.length > 0 && <section className="linked-release-section"><h2>Other listed versions</h2><ul>{otherVersions.map((item) => <li key={item.version}><Link href={linkedReleasePath(item.pluginId, item.version)}>{item.version}</Link></li>)}</ul></section>}
      <section className="linked-release-section" aria-labelledby="adoption-heading">
        <h2 id="adoption-heading">{portable ? 'Adopt the linked Cargo distribution' : 'Adopt this exact version'}</h2>
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
      {portable && <PortableDocumentationState release={portable} />}
    </main>
  </div>;
}

function SignedPortableReleasePage({ release }: { release: SignedPortableRelease }) {
  const otherVersions = signedPortableCatalog.releases.filter((item) => item.pluginId === release.pluginId && item.version !== release.version);
  return <div className="linked-release-shell">
    <SiteHeader active="plugins" />
    <main className="linked-doc-main">
      <nav aria-label="Breadcrumb" className="linked-doc-breadcrumb"><Link href="/plugins">Plugins</Link><span>/</span><span>{release.pluginId}@{release.version}</span></nav>
      <header className="linked-doc-header">
        <p className="linked-doc-eyebrow">Listed in signed Portable catalog</p>
        <h1>{release.title}</h1>
        <p>{release.summary}</p>
      </header>
      <PortableProvenance release={release} />
      {otherVersions.length > 0 && <section className="linked-release-section"><h2>Other listed versions</h2><ul>{otherVersions.map((item) => <li key={item.version}><Link href={linkedReleasePath(item.pluginId, item.version)}>{item.version}</Link></li>)}</ul></section>}
      <section className="linked-release-section"><h2>Before adopting this exact version</h2><p>Obtain the current signed snapshot and exact Bundle from an approved source. The adopting Host must reverify the signature, Bundle bytes, manifest, and compatibility. This Site page is not an installation grant and does not assume a generic install command.</p></section>
      <PortableDocumentationState release={release} />
    </main>
  </div>;
}

function PortableProvenance({ release }: { release: SignedPortableRelease }) {
  return <aside className="linked-doc-provenance">
    <strong>Signed Portable catalog evidence, not an installation</strong>
    <p>This exact release was verified against the configured catalog public key when Site was built. The snapshot expires {signedPortableCatalog.expiresAt ? new Date(signedPortableCatalog.expiresAt * 1000).toISOString() : 'at an unknown time'}. Reverify it locally before adoption; the base snapshot does not establish target compatibility.</p>
    <ProvenanceFacts items={[
      ['Signed title', release.title],
      ['Signed summary', release.summary],
      ['Plugin ID', <code>{release.pluginId}</code>],
      ['Version', release.version],
      ['Publisher ID', release.publisherId],
      ['Catalog', <>{signedPortableCatalog.catalogId} · revision {signedPortableCatalog.revision}</>],
      ['Distribution', 'Portable Bundle'],
      ['Bundle SHA-256', <code>{release.artifactDigest}</code>],
      ['Bundle size', `${release.artifactSize} bytes`],
      ['Manifest SHA-256', <code>{release.manifestDigest}</code>],
      ['Source revision', <code>{release.sourceRevision}</code>],
      ['License', release.license],
    ]} />
    <p><a href={release.sourceUrl} rel="noopener noreferrer" target="_blank">Signed source reference</a> · <a href={release.artifactUrl} rel="noopener noreferrer" target="_blank">Signed Bundle reference</a></p>
  </aside>;
}

function PortableDocumentationState({ release }: { release: SignedPortableRelease }) {
  return <section className="linked-release-section"><h2>Portable documentation for {release.version}</h2>
    {release.documentation.length > 0 ? <><p>These exact revisions are named by signed release details matching this Portable base release; each Markdown body was verified at Site build.</p><ul>{release.documentation.map((document) => <li key={`${document.id}@${document.revision}`}>
      <Link href={linkedDocumentPath(release.pluginId, release.version, document.slug)}>{document.topic}</Link> · {document.language} · revision {document.revision}{document.target ? ` · ${document.target}` : ''}
    </li>)}</ul></> : <p>No versioned Markdown is attached to this Portable release. Linked Cargo or unsigned candidate documentation is not substituted.</p>}
  </section>;
}

function ProvenanceFacts({ items }: { items: readonly (readonly [string, ReactNode])[] }) {
  return <DescriptionListRoot>{items.map(([label, value]) => <DescriptionListItem key={label}>
    <DescriptionListTerm>{label}</DescriptionListTerm>
    <DescriptionListDescription>{value}</DescriptionListDescription>
  </DescriptionListItem>)}</DescriptionListRoot>;
}
