'use client';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import Link from 'next/link';

const navItems = [
  { label: 'Product', href: '/', menu: true, active: true },
  { label: 'Docs', href: '/docs', menu: true },
  { label: 'Examples', href: 'https://github.com/LioRael/lenso-examples' },
  { label: 'Runtime', href: '/docs/runtime-console' },
];

export function DocsTopbar() {
  const { setOpenSearch } = useSearchContext();

  return (
    <header className="docs-eve-topbar">
      <nav>
        <div className="docs-eve-topbar-left">
          <Link href="/" className="docs-eve-logo-link" aria-label="Lenso home">
            <Image
              alt=""
              className="docs-eve-mark"
              height={18}
              priority
              src="/lenso-assets/lenso-header-mark.svg"
              width={18}
            />
          </Link>
          <div className="docs-eve-main-nav">
            {navItems.map((item) => (
              <Link
                className={item.active ? 'is-active' : undefined}
                href={item.href}
                key={item.label}
              >
                <span>{item.label}</span>
                {item.menu ? <ChevronDown aria-hidden="true" /> : null}
              </Link>
            ))}
          </div>
        </div>
        <div className="docs-eve-topbar-actions">
          <button type="button" className="docs-eve-search" onClick={() => setOpenSearch(true)}>
            <span>Search...</span>
            <kbd>⌘K</kbd>
          </button>
          <Link className="docs-eve-action" href="/docs/runtime-console">
            Console
          </Link>
          <Link className="docs-eve-action" href="https://github.com/LioRael/lenso">
            GitHub
          </Link>
          <Link className="docs-eve-action docs-eve-action-primary" href="/docs/quickstart">
            Start
          </Link>
        </div>
      </nav>
    </header>
  );
}
