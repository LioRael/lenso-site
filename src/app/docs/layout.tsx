import { source } from '@/lib/source';
import Image from 'next/image';
import Link from 'next/link';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { DocsTopbar } from '@/components/docs-topbar';
import { Rss, Sun } from 'lucide-react';
import type { CSSProperties } from 'react';

const docsLayoutStyle = {
  '--fd-docs-row-1': '4rem',
} as CSSProperties & Record<string, string>;

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <>
      <DocsLayout
        tree={source.getPageTree()}
        {...baseOptions()}
        containerProps={{ className: 'docs-eve-layout', style: docsLayoutStyle }}
        githubUrl={undefined}
        links={[]}
        nav={{ component: <DocsTopbar /> }}
        searchToggle={{ enabled: false }}
        sidebar={{ collapsible: false }}
        tabMode="auto"
        themeSwitch={{ enabled: false }}
      >
        {children}
      </DocsLayout>
      <footer className="docs-eve-site-footer">
        <div>
          <Link href="/docs">Responsible Use</Link>
          <span />
          <p>© 2026 Lenso</p>
          <a href="/llms.txt" aria-label="RSS">
            <Rss aria-hidden="true" />
          </a>
          <a href="https://github.com/LioRael/lenso" aria-label="GitHub">
            <Image alt="" height={16} src="/lenso-assets/brand-github.png" width={16} />
          </a>
          <button type="button" aria-label="Theme">
            <Sun aria-hidden="true" />
          </button>
        </div>
      </footer>
    </>
  );
}
