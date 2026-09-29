import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DescriptionListDescription, DescriptionListItem, DescriptionListRoot, DescriptionListTerm } from '@lenso/ui/description-list';
import { CandidateDocumentation } from '@/components/candidate-documentation';
import { AdoptionCommandGroup, AdoptionCommandPanel, CatalogCurrentness } from '@/components/catalog-currentness';
import { PluginDocumentTools } from '@/components/plugin-document-tools';
import { SiteHeader } from '@/components/site-header';
import { candidateRelease, signedLinkedCatalog, signedPortableCatalog, signedPackageCatalog, signedReleaseContent, type SignedLinkedRelease, type SignedPortableRelease, type SignedPackageRelease, type SignedReleaseContent } from '@/lib/plugin-candidates';
import { linkedDocumentPath, linkedReleasePath } from '@/lib/linked-document-paths';

type Params = Promise<{ pluginId: string; version: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  const releases = new Map<string, { pluginId: string; version: string }>();
  for (const { pluginId, version } of [
    ...signedLinkedCatalog.releases, ...signedPortableCatalog.releases, ...signedPackageCatalog.releases,
    ...signedReleaseContent.releases.filter((release) => release.baseKind === 'content_only'),
  ]) {
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

function findPackage(pluginId: string, version: string) {
  return signedPackageCatalog.releases.find((release) => release.pluginId === pluginId && release.version === version);
}

function findContent(pluginId: string, version: string, baseKind: SignedReleaseContent['baseKind']) {
  return signedReleaseContent.releases.find((release) => release.pluginId === pluginId
    && release.version === version && release.baseKind === baseKind);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { pluginId, version } = await params;
  const release = findLinked(pluginId, version) ?? findPortable(pluginId, version) ?? findPackage(pluginId, version);
  if (release) {
    return { title: `${release.title} ${version}`, description: release.summary };
  }
  const contentOnly = findContent(pluginId, version, 'content_only');
  if (contentOnly?.metadata) {
    return { title: `${contentOnly.metadata.title} ${version}`, description: contentOnly.metadata.summary };
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
  const packageRelease = findPackage(pluginId, version);
  if (linked) return <SignedReleasePage release={linked} portable={portable} packageRelease={packageRelease} />;
  if (portable) return <SignedPortableReleasePage release={portable} packageRelease={packageRelease} />;
  if (packageRelease) return <SignedPackageReleasePage release={packageRelease} />;
  if (findContent(pluginId, version, 'content_only')) return <SignedContentOnlyPage pluginId={pluginId} version={version} />;
  if (pluginId === candidateRelease.pluginId && version === candidateRelease.version) return <CandidateDocumentation />;
  notFound();
}

function SignedReleasePage({ release, portable, packageRelease }: {
  release: SignedLinkedRelease; portable?: SignedPortableRelease; packageRelease?: SignedPackageRelease;
}) {
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
      <PluginDocumentTools pluginId={release.pluginId} version={release.version} />
      <aside className="linked-doc-provenance">
        <strong>Catalog evidence, not an installation</strong>
        <CatalogCurrentness expirations={[signedLinkedCatalog.expiresAt]} />
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
      {packageRelease && <PackageProvenance release={packageRelease} />}
      {otherVersions.length > 0 && <section className="linked-release-section"><h2>Other listed versions</h2><ul>{otherVersions.map((item) => <li key={item.version}><Link href={linkedReleasePath(item.pluginId, item.version)}>{item.version}</Link></li>)}</ul></section>}
      <section className="linked-release-section" aria-labelledby="adoption-heading">
        <h2 id="adoption-heading">{portable ? 'Adopt the linked Cargo distribution' : 'Adopt this exact version'}</h2>
        {genericAdoption ? <>
          <p>Download the signed snapshot, its independently trusted public-key configuration and the exact registry <code>.crate</code> to your own project. The CLI checks the signature, validity window, Host target, archive digest and package identity before changing your App.</p>
          <AdoptionCommandPanel command={adoptCommand} expirations={[signedLinkedCatalog.expiresAt]} />
          <p>This is a local Host build input, not a portable runtime bundle. Inspect the resolved App and build/check it before use. The Site cannot grant local filesystem access.</p>
        </> : <p>This release requires a product Host-specific integration or a registry unsupported by generic <code>lenso app add</code>. Do not use the generic adoption command.</p>}
      </section>
      <ReleaseContentFor pluginId={release.pluginId} version={release.version} baseKind="linked_cargo" />
      {portable && <><PortableAdoption release={portable} alongsideLinked />
        <ReleaseContentFor pluginId={portable.pluginId} version={portable.version} baseKind="portable" /></>}
      {packageRelease && <><PackageAdoption release={packageRelease} />
        <ReleaseContentFor pluginId={packageRelease.pluginId} version={packageRelease.version} baseKind="package" /></>}
      <section className="linked-release-section" aria-labelledby="release-docs-heading">
        <h2 id="release-docs-heading">Documentation for {release.version}</h2>
        {release.documentation.length === 0 ? <p>No versioned Markdown is attached to this release.</p> : <ul>{release.documentation.map((document) => <li key={`${document.id}@${document.revision}`}>
          <Link href={linkedDocumentPath(release.pluginId, release.version, document.slug)}>{document.topic}</Link> · {document.language} · revision {document.revision}{document.target ? ` · ${document.target}` : ''}
        </li>)}</ul>}
      </section>
      {portable && <PortableDocumentationState release={portable} />}
      {packageRelease && <PackageDocumentationState release={packageRelease} />}
    </main>
  </div>;
}

function SignedPortableReleasePage({ release, packageRelease }: {
  release: SignedPortableRelease; packageRelease?: SignedPackageRelease;
}) {
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
      <PluginDocumentTools pluginId={release.pluginId} version={release.version} />
      <PortableProvenance release={release} />
      {packageRelease && <PackageProvenance release={packageRelease} />}
      {otherVersions.length > 0 && <section className="linked-release-section"><h2>Other listed versions</h2><ul>{otherVersions.map((item) => <li key={item.version}><Link href={linkedReleasePath(item.pluginId, item.version)}>{item.version}</Link></li>)}</ul></section>}
      <PortableAdoption release={release} />
      <ReleaseContentFor pluginId={release.pluginId} version={release.version} baseKind="portable" />
      {packageRelease && <><PackageAdoption release={packageRelease} />
        <ReleaseContentFor pluginId={packageRelease.pluginId} version={packageRelease.version} baseKind="package" /></>}
      <PortableDocumentationState release={release} />
      {packageRelease && <PackageDocumentationState release={packageRelease} />}
    </main>
  </div>;
}

function SignedPackageReleasePage({ release }: { release: SignedPackageRelease }) {
  const otherVersions = signedPackageCatalog.releases.filter((item) =>
    item.pluginId === release.pluginId && item.version !== release.version);
  return <div className="linked-release-shell">
    <SiteHeader active="plugins" />
    <main className="linked-doc-main">
      <nav aria-label="Breadcrumb" className="linked-doc-breadcrumb"><Link href="/plugins">Plugins</Link><span>/</span><span>{release.pluginId}@{release.version}</span></nav>
      <header className="linked-doc-header">
        <p className="linked-doc-eyebrow">Listed in signed npm package catalog</p>
        <h1>{release.title}</h1>
        <p>{release.summary}</p>
      </header>
      <PluginDocumentTools pluginId={release.pluginId} version={release.version} />
      <PackageProvenance release={release} />
      {otherVersions.length > 0 && <section className="linked-release-section"><h2>Other listed versions</h2><ul>{otherVersions.map((item) =>
        <li key={item.version}><Link href={linkedReleasePath(item.pluginId, item.version)}>{item.version}</Link></li>)}</ul></section>}
      <PackageAdoption release={release} />
      <ReleaseContentFor pluginId={release.pluginId} version={release.version} baseKind="package" />
      <PackageDocumentationState release={release} />
    </main>
  </div>;
}

function SignedContentOnlyPage({ pluginId, version }: { pluginId: string; version: string }) {
  const release = findContent(pluginId, version, 'content_only');
  if (!release?.metadata) notFound();
  const metadata = release.metadata;
  return <div className="linked-release-shell">
    <SiteHeader active="plugins" />
    <main className="linked-doc-main">
      <nav aria-label="Breadcrumb" className="linked-doc-breadcrumb"><Link href="/plugins">Plugins</Link><span>/</span><span>{pluginId}@{version}</span></nav>
      <header className="linked-doc-header">
        <p className="linked-doc-eyebrow">Listed in signed source-content catalog</p>
        <h1>{metadata.title}</h1>
        <p>{metadata.summary}</p>
        <p>This release contains editable source content. The signed record does not claim a runtime Bundle, Cargo crate or npm package.</p>
      </header>
      <PluginDocumentTools pluginId={pluginId} version={version} />
      <aside className="linked-doc-provenance">
        <strong>Signed content reference, not an installation</strong>
        <p>The content snapshot was verified when Site was built. Its self-bound identity covers this exact Plugin ID, version, publisher metadata, versioned documentation, and ordered archive references. Reverify the signature and archive bytes locally before copying any files.</p>
        <ProvenanceFacts items={[
          ['Plugin ID', <code key="id">{pluginId}</code>],
          ['Version', version],
          ['Publisher ID', metadata.publisherId],
          ['Catalog', <span key="catalog">{signedReleaseContent.catalogId} · revision {signedReleaseContent.revision}</span>],
          ['Content identity', <code key="identity">{release.baseReleaseIdentity}</code>],
          ['Source revision', <code key="revision">{metadata.sourceRevision}</code>],
          ['License', metadata.license],
        ]} />
        <a href={metadata.sourceUrl} rel="noopener noreferrer" target="_blank">Signed source reference</a>
      </aside>
      <ReleaseContentFor pluginId={pluginId} version={version} baseKind="content_only" />
      <section className="linked-release-section">
        <h2>Documentation for {version}</h2>
        <p>The signed source-content record names these exact Markdown revisions; Site checks each document body before publishing this page.</p>
        <ul>{metadata.documentation.map((document) => <li key={`${document.id}@${document.revision}`}>
          <Link href={linkedDocumentPath(pluginId, version, document.slug)}>{document.topic}</Link> · {document.language} · revision {document.revision}
        </li>)}</ul>
      </section>
    </main>
  </div>;
}

function PortableAdoption({ release, alongsideLinked = false }: { release: SignedPortableRelease; alongsideLinked?: boolean }) {
  const adoptCommand = `lenso app add ${release.pluginId}@${release.version} --portable-snapshot ./portable-snapshot.json --trust ./catalog-trust.json --archive ./exact-release.lenso-plugin`;
  return <section className="linked-release-section" aria-labelledby="portable-adoption-heading">
    <h2 id="portable-adoption-heading">{alongsideLinked ? 'Adopt the Portable distribution' : 'Adopt this exact Portable version'}</h2>
    <p>Use the published <code>@lenso/cli@0.17.2</code> release with native CLI <code>0.6.3</code> to adopt an independently trusted signed Portable snapshot and the exact <code>.lenso-plugin</code> archive into a source App. Review the declared target, runtime and permissions before adoption. A native Process Bundle runs trusted code without a sandbox; the local Host still checks target and permission compatibility.</p>
    {alongsideLinked && <p>The linked Cargo snapshot and <code>.crate</code> above do not verify this Portable Bundle. Use the Portable snapshot and archive named below.</p>}
    <AdoptionCommandPanel command={adoptCommand} expirations={[signedPortableCatalog.expiresAt]} />
    <p><code>app add</code> checks the signature, freshness, exact identity, archive digest, and manifest before recording local source intent. Then build the App and use <code>app check</code>/<code>app show</code> on the new distribution, followed by a real Plugin call. The App owner can edit local sources; a later build checks archive drift against its local lock, not a new independent signature authority. This page records the signed release; local adoption and execution require your own review.</p>
  </section>;
}

function PortableProvenance({ release }: { release: SignedPortableRelease }) {
  return <aside className="linked-doc-provenance">
    <strong>Signed Portable catalog evidence, not an installation</strong>
    <CatalogCurrentness expirations={[signedPortableCatalog.expiresAt]} />
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

function PackageProvenance({ release }: { release: SignedPackageRelease }) {
  return <aside className="linked-doc-provenance">
    <strong>Signed npm package catalog evidence, not an installation</strong>
    <CatalogCurrentness expirations={[signedPackageCatalog.expiresAt]} />
    <p>This exact release was verified against the configured catalog public key when Site was built. The snapshot expires {signedPackageCatalog.expiresAt ? new Date(signedPackageCatalog.expiresAt * 1000).toISOString() : 'at an unknown time'}. Reverify it locally before adoption; the signed package digest does not establish source safety or Host compatibility.</p>
    <ProvenanceFacts items={[
      ['Signed title', release.title],
      ['Signed summary', release.summary],
      ['Plugin ID', <code key="id">{release.pluginId}</code>],
      ['Version', release.version],
      ['Publisher ID', release.publisherId],
      ['Catalog', <span key="catalog">{signedPackageCatalog.catalogId} · revision {signedPackageCatalog.revision}</span>],
      ['Distribution', 'npm package, no Portable Bundle'],
      ['Source revision', <code key="revision">{release.sourceRevision}</code>],
      ['License', release.license],
    ]} />
    <a href={release.sourceUrl} rel="noopener noreferrer" target="_blank">Signed source reference</a>
  </aside>;
}

function PackageAdoption({ release }: { release: SignedPackageRelease }) {
  return <section className="linked-release-section" aria-labelledby="package-adoption-heading">
    <h2 id="package-adoption-heading">Adopt an exact npm distribution</h2>
    <p>Choose one signed distribution, obtain its exact <code>.tgz</code> from the named registry, and verify it locally. The CLI records source intent; it does not run npm lifecycle scripts or install dependencies as part of this step. Build and check the App separately.</p>
    {release.distributions.map((distribution) => {
      const command = `lenso app add ${release.pluginId}@${release.version} --package-snapshot ./package-snapshot.json --trust ./catalog-trust.json --distribution ${shellArg(distribution.id)} --tgz ./exact-package.tgz`;
      return <div key={distribution.id} className="linked-release-section release-content-entry">
        <h3><code>{distribution.package}@{distribution.version}</code></h3>
        <ProvenanceFacts items={[
          ['Distribution ID', distribution.id],
          ['npm tarball SHA-256', <code key="digest">{distribution.integrity}</code>],
          ['Declared targets', distribution.targets.length ? distribution.targets.join(', ') : 'None declared'],
          ['Registry', <a key="registry" href={distribution.registryUrl} rel="noopener noreferrer" target="_blank">{distribution.registryUrl}</a>],
        ]} />
        <AdoptionCommandPanel command={command} expirations={[signedPackageCatalog.expiresAt]} />
      </div>;
    })}
  </section>;
}

function PackageDocumentationState({ release }: { release: SignedPackageRelease }) {
  return <section className="linked-release-section"><h2>npm package documentation for {release.version}</h2>
    {release.documentation.length ? <ul>{release.documentation.map((document) =>
      <li key={`${document.id}@${document.revision}`}><Link href={linkedDocumentPath(release.pluginId, release.version, document.slug)}>{document.topic}</Link> · {document.language} · revision {document.revision}</li>)}</ul>
      : <p>No versioned Markdown is attached to this npm package release.</p>}
  </section>;
}

function shellArg(value: string) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function ReleaseContentFor({ pluginId, version, baseKind }: {
  pluginId: string; version: string; baseKind: SignedReleaseContent['baseKind'];
}) {
  const release = findContent(pluginId, version, baseKind);
  if (!release) return null;
  const baseFlag = release.baseKind === 'linked_cargo' ? ' --linked-snapshot ./linked-cargo-snapshot.json'
    : release.baseKind === 'portable' ? ' --portable-snapshot ./portable-snapshot.json'
      : release.baseKind === 'package' ? ' --package-snapshot ./package-snapshot.json' : '';
  const baseName = release.baseKind === 'linked_cargo' ? 'linked Cargo'
    : release.baseKind === 'portable' ? 'Portable'
      : release.baseKind === 'package' ? 'npm package' : 'source-only';
  const expirations = [signedReleaseContent.expiresAt, ...(release.baseKind === 'linked_cargo'
    ? [signedLinkedCatalog.expiresAt] : release.baseKind === 'portable'
      ? [signedPortableCatalog.expiresAt] : release.baseKind === 'package'
        ? [signedPackageCatalog.expiresAt] : [])];
  return <section className="linked-release-section" aria-labelledby={`release-content-${release.baseKind}`}>
    <h2 id={`release-content-${release.baseKind}`}>{release.baseKind === 'content_only' ? 'Editable source content' : 'Optional source content'}</h2>
    <CatalogCurrentness expirations={expirations} />
    <p>These archive references come from a signed content snapshot for this exact {baseName} release. Site does not download or inspect the archives. Download the exact archive, review its source, and use the CLI to verify it locally. A listing does not activate an extension or install a runtime Plugin.</p>
    <p>Content snapshot revision {signedReleaseContent.revision}; expires {signedReleaseContent.expiresAt ? new Date(signedReleaseContent.expiresAt * 1000).toISOString() : 'at an unknown time'}. Reverify {release.baseKind === 'content_only' ? 'the content snapshot' : 'both snapshots'} when copying content.</p>
    {release.content.map((item) => {
      const destination = item.kind === 'editable_template' ? `examples/${item.id}` : `extensions/${item.id}`;
      const command = `lenso app add ${release.pluginId}@${release.version}${baseFlag} --trust ./catalog-trust.json --content-snapshot ./release-content-snapshot.json --content-id ${item.id} --content-archive ./${item.id}.tar.gz --content-destination ${destination}`;
      return <div key={item.id} className="linked-release-section release-content-entry">
        <h3>{item.kind === 'editable_template' ? 'Editable template' : 'Development extension'}: <code>{item.id}</code></h3>
        <p>{item.kind === 'editable_template'
          ? 'The CLI copies this template into a new App-owned directory. You can edit those files; the catalog does not manage your copy.'
          : <>The CLI copies this opt-in source into a new App-owned directory without running or selecting it. Review it before explicitly adding <code>{destination}</code> as a development Plugin.</>}</p>
        <ProvenanceFacts items={[
          ['Signed archive reference', <a key="url" href={item.url} rel="noopener noreferrer" target="_blank">{item.url}</a>],
          ['Archive SHA-256', <code key="digest">{item.digest}</code>],
          ['Archive size', `${item.size} bytes`],
        ]} />
        <AdoptionCommandGroup commands={[
          { command: `${command} --content-preview`, label: 'CLI preview command' },
          { command, label: 'CLI copy command' },
        ]} expirations={expirations} />
      </div>;
    })}
  </section>;
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
