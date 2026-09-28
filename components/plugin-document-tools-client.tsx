'use client';

import Link from 'next/link';
import { staticClient } from 'fumadocs-core/search/client/orama-static';
import { useEffect, useState } from 'react';
import { scopedSearchMatches, type PluginDocumentLink, type VersionChoice } from '@/lib/plugin-document-navigation';
import styles from './plugin-document-tools.module.css';

type CompletedSearch = { term: string; urls: string[]; error: boolean };

export function PluginDocumentToolsClient({ pluginId, version, documents, indexedDocumentCount, versions,
  languages, currentDocumentSlug }: {
  pluginId: string;
  version: string;
  documents: PluginDocumentLink[];
  indexedDocumentCount: number;
  versions: VersionChoice[];
  languages: PluginDocumentLink[];
  currentDocumentSlug?: string;
}) {
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState<CompletedSearch | null>(null);
  const term = query.trim();
  const currentVersion = versions.find((choice) => choice.version === version);

  useEffect(() => {
    if (!term || documents.length === 0) return;
    let active = true;
    const timer = window.setTimeout(() => {
      const client = staticClient({ from: '/api/plugins/search', search: { limit: Math.min(512, Math.max(1, indexedDocumentCount)) } });
      Promise.resolve(client.search(term)).then((results) => {
        if (active) setCompleted({ term, urls: results.map((result) => result.url), error: false });
      }).catch(() => {
        if (active) setCompleted({ term, urls: [], error: true });
      });
    }, 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [term, documents.length, indexedDocumentCount]);

  const matches = completed?.term === term && !completed.error
    ? scopedSearchMatches(completed.urls, documents, pluginId, version) : [];
  const releaseUrl = `/plugins/${encodeURIComponent(pluginId)}/${encodeURIComponent(version)}`;

  return <section aria-label={`Documentation navigation for ${pluginId}@${version}`} className={styles.tools}>
    <div className={styles.heading}>
      <div>
        <h2>Find documentation for {version}</h2>
        <p>Search only build-verified Markdown for this exact Plugin version.</p>
      </div>
      {versions.length > 1 && <label className={styles.selector}>Plugin version
        <select onChange={(event) => { window.location.assign(event.target.value); }} value={currentVersion?.url ?? releaseUrl}>
          {versions.map((choice) => <option key={choice.version} value={choice.url}>
            {choice.version}{currentDocumentSlug && !choice.sameDocument ? ' · release overview' : ''}
          </option>)}
        </select>
      </label>}
    </div>
    {currentDocumentSlug && languages.length > 1 && <label className={styles.selector}>Document language
      <select onChange={(event) => { window.location.assign(event.target.value); }} value={languages.find((document) => document.slug === currentDocumentSlug)?.url}>
        {languages.map((document) => <option key={document.slug} value={document.url}>
          {document.language} · revision {document.revision}
        </option>)}
      </select>
    </label>}
    <label className={styles.searchLabel} htmlFor={`plugin-document-search-${version}`}>Search this version</label>
    <div className={styles.searchRow}>
      <input
        autoComplete="off"
        className={styles.searchInput}
        disabled={documents.length === 0}
        id={`plugin-document-search-${version}`}
        maxLength={256}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={documents.length ? 'Search verified docs' : 'No verified docs in this version'}
        type="search"
        value={query}
      />
      {query && <button className={styles.clearButton} onClick={() => setQuery('')} type="button">Clear search</button>}
    </div>
    {documents.length === 0 ? <p className={styles.state} role="status">No build-verified Markdown is attached to this exact version.</p>
      : !term ? <p className={styles.state} role="status">Enter a term to search this release&apos;s documentation.</p>
        : completed?.term !== term ? <p className={styles.state} role="status">Searching this exact version…</p>
          : completed.error ? <p className={styles.state} role="alert">The static search index could not load. <Link href={releaseUrl}>Open this release&apos;s document list</Link>.</p>
            : matches.length === 0 ? <p className={styles.state} role="status">No verified Markdown in {pluginId}@{version} matches this term.</p>
              : <ul className={styles.results}>{matches.map((document) => <li key={document.url}>
                <Link href={document.url}>{document.topic}</Link>
                <span>{document.language} · {document.channel} · revision {document.revision}</span>
              </li>)}</ul>}
  </section>;
}
