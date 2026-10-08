'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useSyncExternalStore } from 'react';
import { SiteHeader } from '@/components/site-header';
import { legacyMarketplaceDestination } from '@/lib/legacy-marketplace-links.mjs';

function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  return () => window.removeEventListener('popstate', listener);
}

function currentSearch() {
  return window.location.search;
}

export function LegacyMarketplaceEntry({ children, releases }: {
  children: ReactNode;
  releases: readonly (readonly [string, string])[];
}) {
  const search = useSyncExternalStore(subscribe, currentSearch, () => '');
  const destination = legacyMarketplaceDestination(search, releases);
  const redirectHref = destination?.kind === 'release' || destination?.kind === 'browse' ? destination.href : undefined;
  useEffect(() => {
    if (redirectHref) window.location.replace(redirectHref);
  }, [redirectHref]);

  if (!destination || destination.kind === 'browse') return children;
  return <div className="linked-release-shell">
    <SiteHeader active="plugins" />
    <main className="linked-doc-main">
      <nav aria-label="Breadcrumb" className="linked-doc-breadcrumb"><Link href="/plugins">Plugins</Link><span>/</span><span>Legacy link</span></nav>
      {destination.kind === 'release' ? <><h1>Opening exact Plugin release</h1><p role="status">Taking you to the same Plugin ID and version in this Site build.</p></> : <>
        <h1>Exact Plugin release unavailable</h1>
        <p role="status">{destination.pluginId && destination.version
          ? <>The exact release <code>{destination.pluginId}@{destination.version}</code> is not in this Site build. No other version is substituted.</>
          : 'This legacy link does not identify one exact Plugin ID and version.'}</p>
        <p>The Marketplace catalog remains the release authority. This page cannot establish whether an omitted release was previously published.</p>
        <Link href="/plugins">Browse releases in this Site build</Link>
      </>}
    </main>
  </div>;
}
