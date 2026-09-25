'use client';

import Link from 'next/link';
import { staticClient } from 'fumadocs-core/search/client/orama-static';
import { useEffect, useState } from 'react';
import { signedLinkedCatalog, signedPackageCatalog, signedPortableCatalog, type SignedLinkedRelease, type SignedPackageRelease, type SignedPortableRelease } from '@/lib/plugin-candidates';
import { linkedDocumentPath } from '@/lib/linked-document-paths';

const searchClient = staticClient({ from: '/api/plugins/search', search: { limit: 512 } });
type SearchDocument = SignedLinkedRelease['documentation'][number];
type SearchEntry = { release: SignedLinkedRelease; document: SearchDocument; channel: 'linked' }
  | { release: SignedPortableRelease; document: SearchDocument; channel: 'portable' }
  | { release: SignedPackageRelease; document: SearchDocument; channel: 'package' };
const documentDetails = new Map<string, SearchEntry>([
  ...signedLinkedCatalog.releases.flatMap((release) => release.documentation.map((document) => [
    linkedDocumentPath(release.pluginId, release.version, document.slug),
    { release, document, channel: 'linked' as const },
  ] as const)),
  ...signedPortableCatalog.releases.flatMap((release) => release.documentation.map((document) => [
    linkedDocumentPath(release.pluginId, release.version, document.slug),
    { release, document, channel: 'portable' as const },
  ] as const)),
  ...signedPackageCatalog.releases.flatMap((release) => release.documentation.map((document) => [
    linkedDocumentPath(release.pluginId, release.version, document.slug),
    { release, document, channel: 'package' as const },
  ] as const)),
]);

type CompletedSearch = { query: string; urls: string[]; error: boolean };
type Props = {
  query: string;
  target?: string;
  distribution?: string;
  catalogStatus?: string;
  currentSigned: { linked: boolean; portableDetails: boolean; package: boolean };
};

export function SignedDocumentSearch({ query, target, distribution, catalogStatus, currentSigned }: Props) {
  const term = query.trim();
  const searchable = currentSigned.linked || currentSigned.portableDetails || currentSigned.package;
  const [completed, setCompleted] = useState<CompletedSearch | null>(null);
  useEffect(() => {
    if (!term || !searchable || catalogStatus === 'Candidate') return;
    let active = true;
    const timer = window.setTimeout(() => {
      Promise.resolve(searchClient.search(term)).then((results) => {
        if (active) setCompleted({ query: term, urls: results.map((result) => result.url), error: false });
      }).catch(() => {
        if (active) setCompleted({ query: term, urls: [], error: true });
      });
    }, 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [term, searchable, catalogStatus]);

  if (!term || catalogStatus === 'Candidate') return null;

  const matches = (completed?.query === term ? completed.urls : []).flatMap<SearchEntry & { url: string }>((url) => {
    const entry = documentDetails.get(url);
    if (!entry) return [];
    if (entry.channel === 'portable') {
      return currentSigned.portableDetails && !target && (!distribution || distribution === 'Portable') ? [{ url, ...entry }] : [];
    }
    if (entry.channel === 'package') {
      const targets = entry.release.distributions.flatMap((item) => item.targets);
      const targetMatches = !target || (target === 'Native'
        ? targets.some((value) => /-(?:apple-darwin|unknown-linux-gnu|pc-windows-msvc)$/.test(value))
        : targets.some((value) => value === 'workers' || value === 'cloudflare-workers'));
      return currentSigned.package && targetMatches && (!distribution || distribution === 'npm package') ? [{ url, ...entry }] : [];
    }
    const native = entry.release.targets.some((value) => /-(?:apple-darwin|unknown-linux-gnu|pc-windows-msvc)$/.test(value));
    return currentSigned.linked && (!target || (target === 'Native' && native))
      && (!distribution || distribution === 'Linked Rust') ? [{ url, ...entry }] : [];
  }).slice(0, 24);

  return <section className="signed-document-search" aria-labelledby="signed-document-search-heading">
    <h2 id="signed-document-search-heading">Versioned documentation</h2>
    {!searchable ? <p role="status">No current signed documentation is available. Existing version pages remain historical build records.</p>
      : completed?.query !== term ? <p role="status">Searching build-verified Plugin Markdown…</p>
        : completed.error ? <p role="alert">The verified-document search index could not load. Refresh this page or follow the release links below.</p>
          : matches.length === 0 ? <p role="status">No versioned documentation matches this search and the selected filters.</p>
            : <ul>{matches.map(({ url, release, document, channel }) => <li key={url}>
              <Link href={url}>{document.topic}</Link>
              <span>{release.pluginId}@{release.version} · {channel === 'portable' ? 'Portable' : channel === 'package' ? 'npm package' : 'Linked Rust'} · {document.language} · revision {document.revision}</span>
            </li>)}</ul>}
  </section>;
}
