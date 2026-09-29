'use client';

import Link from 'next/link';
import { Button } from '@lenso/ui/button';
import { ContentState } from '@lenso/ui/content-state';
import { Check, CircleAlert, ExternalLink, Search, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { candidateRelease, signedLinkedCatalog, signedPortableCatalog, signedPackageCatalog, signedReleaseContent } from '@/lib/plugin-candidates';
import { linkedDocumentPath, linkedReleasePath } from '@/lib/linked-document-paths';
import { SignedDocumentSearch } from '@/components/signed-document-search';
import { CatalogCurrentness } from '@/components/catalog-currentness';

export function PluginDirectory() {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<string | undefined>();
  const [distribution, setDistribution] = useState<string | undefined>();
  const [catalogStatus, setCatalogStatus] = useState<string | undefined>();
  useEffect(() => {
    const queries = new URLSearchParams(window.location.search).getAll('q');
    if (queries.length === 1 && queries[0].length <= 256) setQuery(queries[0]);
  }, []);
  const signedLinked = signedLinkedCatalog.releases.filter((release) => {
    const normalized = query.trim().toLowerCase();
    return (!normalized || [release.pluginId, release.package, release.title, release.summary].some((value) => value.toLowerCase().includes(normalized)))
      && (!target || (target === 'Native' && release.targets.some((value) => /-(?:apple-darwin|unknown-linux-gnu|pc-windows-msvc)$/.test(value))))
      && (!distribution || distribution === 'Linked Rust')
      && (!catalogStatus || catalogStatus === 'Signed');
  });
  const signedPortable = signedPortableCatalog.releases.filter((release) => {
    const normalized = query.trim().toLowerCase();
    return (!normalized || [release.pluginId, release.title, release.summary, release.publisherId].some((value) => value.toLowerCase().includes(normalized)))
      && !target && (!distribution || distribution === 'Portable')
      && (!catalogStatus || catalogStatus === 'Signed');
  });
  const signedPackage = signedPackageCatalog.releases.filter((release) => {
    const normalized = query.trim().toLowerCase();
    return (!normalized || [release.pluginId, release.title, release.summary,
      release.publisherId, ...release.distributions.map((item) => item.package)].some((value) =>
      value.toLowerCase().includes(normalized)))
      && (!target || release.distributions.some((item) => item.targets.some((value) =>
        target === 'Native' && /-(?:apple-darwin|unknown-linux-gnu|pc-windows-msvc)$/.test(value))))
      && (!distribution || distribution === 'npm package')
      && (!catalogStatus || catalogStatus === 'Signed');
  });
  const signedSource = signedReleaseContent.releases.filter((release) => {
    if (release.baseKind !== 'content_only' || !release.metadata) return false;
    const normalized = query.trim().toLowerCase();
    return (!normalized || [
      release.pluginId, release.metadata.title, release.metadata.summary,
      release.metadata.publisherId, ...release.content.map((item) => item.id),
    ].some((value) => value.toLowerCase().includes(normalized)))
      && !target && (!distribution || distribution === 'Source content')
      && (!catalogStatus || catalogStatus === 'Signed');
  });
  const candidateSuperseded = (signedLinkedCatalog.releases.some((release) =>
    release.pluginId === candidateRelease.pluginId && release.version === candidateRelease.version))
    || (signedPortableCatalog.releases.some((release) =>
      release.pluginId === candidateRelease.pluginId && release.version === candidateRelease.version))
    || (signedPackageCatalog.releases.some((release) =>
      release.pluginId === candidateRelease.pluginId && release.version === candidateRelease.version))
    || (signedReleaseContent.releases.some((release) =>
      release.baseKind === 'content_only' && release.pluginId === candidateRelease.pluginId
      && release.version === candidateRelease.version));
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matchesQuery = !normalized || [candidateRelease.pluginId, candidateRelease.package, candidateRelease.summary, 'http ingress web linked rust native']
      .some((value) => value.toLowerCase().includes(normalized));
    return !candidateSuperseded && (!catalogStatus || catalogStatus === 'Candidate') && matchesQuery
      && (!target || target === candidateRelease.target)
      && (!distribution || distribution === candidateRelease.distribution);
  }, [candidateSuperseded, catalogStatus, distribution, query, target]);

  const updateQuery = (value: string) => {
    setQuery(value);
    const url = new URL(window.location.href);
    if (value) url.searchParams.set('q', value);
    else url.searchParams.delete('q');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const clearFilters = () => {
    updateQuery('');
    setTarget(undefined);
    setDistribution(undefined);
    setCatalogStatus(undefined);
  };

  return (
    <div className={visible ? 'directory-layout' : 'directory-layout directory-layout-signed-only'}>
      <section className="directory-main">
        <div className="directory-intro">
          <h1>Plugins</h1>
          <p>Find a compatible release, inspect its exact distribution, then adopt it through the same reviewed project path.</p>
        </div>
        <label className="directory-search"><Search size={20} /><span className="sr-only">Search Plugins</span><input maxLength={256} onChange={(event) => updateQuery(event.target.value)} placeholder="Search Plugin IDs, packages, or verified docs" value={query} /></label>
        <div aria-label="Directory filters" className="filter-rail">
          <Filter label="Target" onSelect={setTarget} options={['Native', 'Workers']} selected={target} />
          <Filter label="Distribution" onSelect={setDistribution} options={['Linked Rust', 'Portable', 'npm package', 'Source content']} selected={distribution} />
          <Filter label="Catalog status" onSelect={setCatalogStatus} options={['Signed', 'Candidate']} selected={catalogStatus} />
          <Button onClick={clearFilters} size="default" type="button" variant="ghost">Clear filters</Button>
        </div>
        <SignedDocumentSearch query={query} target={target} distribution={distribution} catalogStatus={catalogStatus} />
        <section className="signed-release-state" aria-labelledby="signed-release-heading">
          <h2 id="signed-release-heading">Signed releases</h2>
          {signedLinked.length === 0 && signedPortable.length === 0 && signedPackage.length === 0 && signedSource.length === 0 && <ContentState.Root align="start" role="status">
            <ContentState.Title as="h3">No signed releases to show</ContentState.Title>
            <ContentState.Description>{signedLinkedCatalog.releases.length || signedPortableCatalog.releases.length || signedPackageCatalog.releases.length || signedReleaseContent.releases.length ? 'No verified signed release matches the current filters.' : 'No verified signed Plugin catalog is available. Candidate claims are separate.'}</ContentState.Description>
          </ContentState.Root>}
          {signedPackage.map((release) => <article className="signed-release" key={`package:${release.pluginId}@${release.version}`}>
            <CatalogCurrentness expirations={[signedPackageCatalog.expiresAt]} />
            <h3><Link href={linkedReleasePath(release.pluginId, release.version)}><code>{release.pluginId}</code> <span>{release.version}</span></Link></h3>
            <p>{release.summary}</p>
            <dl><div><dt>Distribution</dt><dd>npm package</dd></div><div><dt>Publisher</dt><dd>{release.publisherId}</dd></div><div><dt>Package</dt><dd>{release.distributions.map((item) => <code key={item.id}>{item.package}@{item.version}</code>)}</dd></div><div><dt>Catalog</dt><dd>Signed revision {signedPackageCatalog.revision}</dd></div></dl>
            <p className="signed-release-note">This exact version is listed in a signed npm-only snapshot verified when Site was built. Verify the current snapshot and exact tarball digest before adoption. This listing does not install the package.</p>
            <Link href={linkedReleasePath(release.pluginId, release.version)}>Inspect exact signed npm version</Link>
          </article>)}
          {signedSource.map((release) => <article className="signed-release" key={`content:${release.pluginId}@${release.version}`}>
            <CatalogCurrentness expirations={[signedReleaseContent.expiresAt]} />
            <h3><Link href={linkedReleasePath(release.pluginId, release.version)}><code>{release.pluginId}</code> <span>{release.version}</span></Link></h3>
            <p>{release.metadata?.summary}</p>
            <dl><div><dt>Distribution</dt><dd>Editable source content</dd></div><div><dt>Publisher</dt><dd>{release.metadata?.publisherId}</dd></div><div><dt>Content</dt><dd>{release.content.map((item) => item.kind.replaceAll('_', ' ')).join(', ')}</dd></div><div><dt>Catalog</dt><dd>Signed revision {signedReleaseContent.revision}</dd></div></dl>
            <p className="signed-release-note">This exact version contains signed archive references for App-owned source. Review each archive before copying it; the listing does not install or activate a runtime Plugin.</p>
            <Link href={linkedReleasePath(release.pluginId, release.version)}>Inspect exact signed source version</Link>
          </article>)}
          {signedPortable.map((release) => <article className="signed-release" key={`portable:${release.pluginId}@${release.version}`}>
            <CatalogCurrentness expirations={[signedPortableCatalog.expiresAt]} />
            <h3><Link href={linkedReleasePath(release.pluginId, release.version)}><code>{release.pluginId}</code> <span>{release.version}</span></Link></h3>
            <p>{release.summary}</p>
            <dl><div><dt>Distribution</dt><dd>Portable Bundle</dd></div><div><dt>Publisher</dt><dd>{release.publisherId}</dd></div><div><dt>Bundle SHA-256</dt><dd><code>{release.artifactDigest}</code></dd></div><div><dt>Source revision</dt><dd><code>{release.sourceRevision}</code></dd></div><div><dt>Catalog</dt><dd>Signed revision {signedPortableCatalog.revision}</dd></div></dl>
            <p className="signed-release-note">This exact version is listed in a signed Portable snapshot verified when Site was built. Target compatibility is not declared here; verify the current snapshot and Bundle before installation. This listing does not install the Plugin.</p>
            <Link href={linkedReleasePath(release.pluginId, release.version)}>Inspect exact signed Portable version</Link>
            {release.documentation.length > 0 && <div className="signed-release-documents">
              <h4>Portable versioned documentation</h4>
              <ul>{release.documentation.map((document) => <li key={`${document.id}@${document.revision}`}>
                <Link href={linkedDocumentPath(release.pluginId, release.version, document.slug)}>{document.topic}</Link> · {document.language} · {document.id}@{document.revision}
                {document.target && <> · {document.target}</>}
                <small>Signed release-details reference and Site-verified body: {document.digest}.</small>
              </li>)}</ul>
            </div>}
          </article>)}
          {signedLinked.map((release) => <article className="signed-release" key={`linked:${release.pluginId}@${release.version}`}>
            <CatalogCurrentness expirations={[signedLinkedCatalog.expiresAt]} />
            <h3><Link href={linkedReleasePath(release.pluginId, release.version)}><code>{release.pluginId}</code> <span>{release.version}</span></Link></h3>
            <p>{release.summary}</p>
            <dl><div><dt>Distribution</dt><dd>Linked Rust · {release.integration === 'host_provided' ? 'Host-provided integration' : 'linked Plugin'}</dd></div><div><dt>Package</dt><dd><code>{release.package}</code></dd></div><div><dt>Exact targets</dt><dd>{release.targets.join(', ')}</dd></div><div><dt>Catalog</dt><dd>Signed revision {signedLinkedCatalog.revision}</dd></div></dl>
            <p className="signed-release-note">{release.integration === 'host_provided'
              ? 'Requires a product Host-specific adapter; not a generic lenso app add candidate.'
              : <>Verify the signed catalog and exact crate digest in <code>lenso app add</code> before adoption. This Site listing does not install the package.</>}</p>
            <Link href={linkedReleasePath(release.pluginId, release.version)}>Inspect exact signed version</Link>
            {release.documentation.length > 0 && <div className="signed-release-documents">
              <h4>Versioned documentation references</h4>
              <ul>{release.documentation.map((document) => <li key={`${document.id}@${document.revision}`}>
                <Link href={linkedDocumentPath(release.pluginId, release.version, document.slug)}>{document.topic}</Link> · {document.language} · {document.id}@{document.revision}
                {document.target && <> · {document.target}</>}
                <small>Signed reference and Site-verified body: {document.digest}.</small>
              </li>)}</ul>
            </div>}
          </article>)}
        </section>
        <h2>Candidate releases</h2>
        <p>The unsigned Web 0.4.5 candidate is a migration-era example from the former <code>lenso-web</code> repository. <a href={candidateRelease.maintainedSourceUrl}>Current Web source lives in the consolidated Rust repository</a>; this historical entry is not a current signed release.</p>
        <div className="release-table" role="table" aria-label="Candidate Plugin releases">
          <div className="release-row release-head" role="row">
            <span role="columnheader">Plugin ID</span><span role="columnheader">Description</span><span role="columnheader">Version</span><span role="columnheader">Distribution</span><span role="columnheader">Target</span><span role="columnheader">Catalog status</span><span role="columnheader">Action</span>
          </div>
          {visible ? (
            <div className="release-row is-selected" role="row">
              <code data-label="Plugin ID" role="cell">{candidateRelease.pluginId}</code><span data-label="Description" role="cell">{candidateRelease.summary}</span><code data-label="Version" role="cell">{candidateRelease.version}</code><span data-label="Distribution" role="cell">{candidateRelease.distribution}</span><span data-label="Target" role="cell">{candidateRelease.target}</span><span data-label="Catalog status" role="cell">{candidateRelease.catalogStatus}</span>
              <span data-label="Action" role="cell"><Link className="button button-primary button-small" href="/plugins/lenso.web-ingress/0.4.5">Inspect candidate</Link></span>
            </div>
          ) : <p className="no-results" role="status">{candidateSuperseded ? 'This Plugin ID and version have a verified signed record above; candidate claims remain separate.' : 'No candidate matches the current search and filters.'}</p>}
        </div>
        <p className="compatibility-note"><CircleAlert size={23} />Unknown compatibility is never treated as available.</p>
      </section>
      {visible && <aside className="result-rail">
        <h2>Candidate evidence</h2>
        <ul>
          <li><ExternalLink size={21} /><a href={candidateRelease.registryUrl}>Published crate documentation</a></li>
          <li><Check size={21} />Declares Native at the pinned source tag</li>
          <li><Wrench size={21} />Requires Host build</li>
          <li><CircleAlert size={21} />No implicit portable fallback</li>
        </ul>
        <Link className="button button-primary" href="/plugins/lenso.web-ingress/0.4.5">Open candidate docs</Link>
        <p className="candidate-isolation"><CircleAlert size={21} />Candidate claims remain separate from verified signed releases.</p>
      </aside>}
    </div>
  );
}

function Filter({ label, onSelect, options, selected }: { label: string; onSelect: (value: string | undefined) => void; options: readonly string[]; selected?: string }) {
  return <fieldset><legend>{label}</legend><div>{options.map((option) => <Button aria-pressed={option === selected} key={option} onClick={() => onSelect(option === selected ? undefined : option)} size="default" type="button" variant={option === selected ? 'primary' : 'secondary'}>{option}</Button>)}</div></fieldset>;
}
