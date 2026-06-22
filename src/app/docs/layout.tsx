import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { DocsTopbar } from '@/components/docs-topbar';
import type { CSSProperties } from 'react';

const docsLayoutStyle = {
  '--fd-docs-row-1': '3.5rem',
} as CSSProperties & Record<string, string>;

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
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
  );
}
