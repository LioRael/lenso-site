'use client';

import Link from 'next/link';
import { Check, CircleAlert, ExternalLink, Search, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { candidateRelease, signedReleaseDetails } from '@/lib/plugin-candidates';

export function PluginDirectory() {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<string | undefined>('Native');
  const [distribution, setDistribution] = useState<string | undefined>('Linked Rust');
  const [catalogStatus, setCatalogStatus] = useState<string | undefined>('Candidate');
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matchesQuery = !normalized || [candidateRelease.pluginId, candidateRelease.package, candidateRelease.summary, 'http ingress web linked rust native']
      .some((value) => value.toLowerCase().includes(normalized));
    return matchesQuery
      && (!target || target === candidateRelease.target)
      && (!distribution || distribution === candidateRelease.distribution)
      && (!catalogStatus || catalogStatus === 'Candidate');
  }, [catalogStatus, distribution, query, target]);

  const clearFilters = () => {
    setQuery('');
    setTarget(undefined);
    setDistribution(undefined);
    setCatalogStatus(undefined);
  };

  return (
    <div className="directory-layout">
      <section className="directory-main">
        <div className="directory-intro">
          <h1>Plugins</h1>
          <p>Find a compatible release, inspect its exact distribution, then adopt it through the same reviewed project path.</p>
        </div>
        <label className="directory-search"><Search size={20} /><span className="sr-only">Search Plugins</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Search by capability, Plugin ID, or package" value={query} /></label>
        <div aria-label="Directory filters" className="filter-rail">
          <Filter label="Target" onSelect={setTarget} options={['Native', 'Workers']} selected={target} />
          <Filter label="Distribution" onSelect={setDistribution} options={['Linked Rust', 'Portable']} selected={distribution} />
          <Filter label="Catalog status" onSelect={setCatalogStatus} options={['Signed', 'Candidate']} selected={catalogStatus} />
          <button className="clear-filter" onClick={clearFilters} type="button">Clear filters</button>
        </div>
        <section className="signed-release-state" aria-labelledby="signed-release-heading">
          <h2 id="signed-release-heading">Signed releases</h2>
          {signedReleaseDetails.length === 0 && <p>No signed release details are available. Marketplace adoption of the signed W6 protocol is still required.</p>}
        </section>
        <h2>Candidate releases</h2>
        <div className="release-table" role="table" aria-label="Candidate Plugin releases">
          <div className="release-row release-head" role="row">
            <span role="columnheader">Plugin ID</span><span role="columnheader">Description</span><span role="columnheader">Version</span><span role="columnheader">Distribution</span><span role="columnheader">Target</span><span role="columnheader">Catalog status</span><span role="columnheader">Action</span>
          </div>
          {visible ? (
            <div className="release-row is-selected" role="row">
              <code data-label="Plugin ID" role="cell">{candidateRelease.pluginId}</code><span data-label="Description" role="cell">{candidateRelease.summary}</span><code data-label="Version" role="cell">{candidateRelease.version}</code><span data-label="Distribution" role="cell">{candidateRelease.distribution}</span><span data-label="Target" role="cell">{candidateRelease.target}</span><span data-label="Catalog status" role="cell">{candidateRelease.catalogStatus}</span>
              <span data-label="Action" role="cell"><Link className="button button-primary button-small" href="/plugins/lenso.web-ingress/0.4.5">Inspect candidate</Link></span>
            </div>
          ) : <p className="no-results" role="status">No candidate matches the current search and filters.</p>}
        </div>
        <p className="compatibility-note"><CircleAlert size={23} />Unknown compatibility is never treated as available.</p>
      </section>
      <aside className="result-rail">
        <h2>Candidate evidence</h2>
        <ul>
          <li><ExternalLink size={21} /><a href={candidateRelease.registryUrl}>Published crate documentation</a></li>
          <li><Check size={21} />Declares Native at the pinned source tag</li>
          <li><Wrench size={21} />Requires Host build</li>
          <li><CircleAlert size={21} />No implicit portable fallback</li>
        </ul>
        <Link className="button button-primary" href="/plugins/lenso.web-ingress/0.4.5">Open candidate docs</Link>
        <p className="candidate-isolation"><CircleAlert size={21} />Candidate claims are isolated from the empty signed-results channel.</p>
      </aside>
    </div>
  );
}

function Filter({ label, onSelect, options, selected }: { label: string; onSelect: (value: string | undefined) => void; options: readonly string[]; selected?: string }) {
  return <fieldset><legend>{label}</legend><div>{options.map((option) => <button aria-pressed={option === selected} key={option} onClick={() => onSelect(option === selected ? undefined : option)} type="button">{option}</button>)}</div></fieldset>;
}
