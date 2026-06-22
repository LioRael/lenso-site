'use client';

import { Search } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import Link from 'next/link';

export function DocsTopbar() {
  const { setOpenSearch } = useSearchContext();

  return (
    <header className="docs-eve-topbar">
      <nav>
        <div className="docs-eve-topbar-left">
          <Link href="/" className="docs-eve-logo" aria-label="Lenso home">
            <span aria-hidden="true" className="docs-eve-mark" />
            <span className="docs-eve-slash">/</span>
            <span>Lenso</span>
          </Link>
          <Link href="/docs">Docs</Link>
          <Link href="https://github.com/LioRael/lenso-examples">Examples</Link>
          <Link href="https://github.com/LioRael/lenso">GitHub ↗</Link>
        </div>
        <button type="button" className="docs-eve-search" onClick={() => setOpenSearch(true)}>
          <Search aria-hidden="true" />
          <span>Search...</span>
          <kbd>⌘K</kbd>
        </button>
      </nav>
    </header>
  );
}
