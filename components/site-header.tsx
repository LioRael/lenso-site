import Link from 'next/link';
import { Menu, Search } from 'lucide-react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <span aria-hidden="true" className="brand-mark"><i /><i /></span>
      <span className={compact ? 'sr-only' : undefined}>Lenso</span>
    </span>
  );
}

const links = [
  ['Build apps', '/docs/core/quickstart'],
  ['Develop plugins', '/docs/core/plugin-authoring'],
  ['Extend the framework', '/docs/core/architecture'],
  ['Plugins', '/plugins'],
  ['Docs', '/docs'],
] as const;

export function SiteHeader({ active }: { active?: 'build' | 'plugins' | 'docs' }) {
  return (
    <header className="site-header">
      <Link className="brand-link" href="/"><Brand /></Link>
      <nav aria-label="Primary navigation" className="site-nav">
        {links.map(([label, href], index) => {
          const selected = active === 'plugins' ? index === 3 : active === 'docs' ? index === 4 : active === 'build' ? index === 0 : false;
          return <Link aria-current={selected ? 'page' : undefined} className={selected ? 'is-active' : undefined} href={href} key={href}>{label}</Link>;
        })}
      </nav>
      <details className="mobile-nav">
        <summary aria-label="Open primary navigation"><Menu aria-hidden="true" size={21} /></summary>
        <nav aria-label="Mobile primary navigation">
          {links.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
      </details>
      <Link aria-label="Search documentation" className="header-icon" href="/docs"><Search size={19} strokeWidth={1.8} /></Link>
    </header>
  );
}
