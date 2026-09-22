import Link from 'next/link';
import { ArrowRight, Boxes, Braces, Cog, Copy, FileCode2, Folder, Terminal } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

const paths = [
  { title: 'Build an app', body: 'Start with ordinary business code and one observable request.', href: '/docs/core/quickstart', Icon: Braces },
  { title: 'Develop a Plugin', body: 'Choose linked Rust, portable Rust, or JavaScript from the same identity.', href: '/docs/core/plugin-authoring', Icon: Boxes },
  { title: 'Extend the framework', body: 'Add Engine or Host mechanics without moving business ownership into Core.', href: '/docs/core/architecture', Icon: Cog },
];

export default function Home() {
  return (
    <div className="marketing-shell">
      <SiteHeader active="build" />
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <h1>Build the system.<br />Keep every boundary explicit.</h1>
            <p>Create a normal application, add removable Plugins, and run the same reviewed contracts by hand or with an agent.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/docs/core/quickstart">Create an app</Link>
              <Link className="button button-secondary" href="/plugins">Browse plugins</Link>
            </div>
          </div>
          <div aria-label="Example project creation result" className="terminal-card">
            <div className="terminal-bar"><span className="terminal-lights"><i /><i /><i /></span><span>lenso — app</span><Copy aria-hidden="true" size={16} /></div>
            <div className="terminal-body">
              <p><span>$</span> lenso app create knowledge-base --web</p>
              <p className="terminal-success">✓ Created App · run lenso app dev</p>
              <div className="file-tree">
                <p><Folder size={16} /> knowledge-base/</p>
                <p className="depth"><Folder size={16} /> app/</p>
                <p className="depth-two"><Folder size={16} /> local.starter/</p>
                <p className="depth-two"><FileCode2 size={16} /> Cargo.toml</p>
                <p className="depth-two"><FileCode2 size={16} /> src/lib.rs</p>
                <p className="depth"><Folder size={16} /> plugins/</p>
                <p className="depth"><FileCode2 size={16} /> README.md</p>
              </div>
              <p><span>$</span> <span className="cursor" /></p>
            </div>
          </div>
        </section>
        <section className="path-section">
          <h2>Choose the shortest path</h2>
          <div className="path-grid">
            {paths.map(({ title, body, href, Icon }) => (
              <Link className="path-item" href={href} key={title}>
                <Icon aria-hidden="true" size={32} strokeWidth={1.6} />
                <h3>{title}</h3><p>{body}</p><ArrowRight aria-hidden="true" className="path-arrow" size={21} />
              </Link>
            ))}
          </div>
          <Link className="architecture-link" href="/docs/core/architecture"><Terminal size={19} />Read the architecture boundary<ArrowRight size={18} /></Link>
        </section>
      </main>
    </div>
  );
}
