import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Brand } from '@/components/site-header';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: <Brand compact /> },
    links: [
      { text: 'Build apps', url: '/docs/core/quickstart' },
      { text: 'Develop plugins', url: '/docs/core/plugin-authoring' },
      { text: 'Extend the framework', url: '/docs/core/architecture' },
      { text: 'Plugins', url: '/plugins' },
      { text: '简体中文', url: '/docs/zh' },
    ],
    githubUrl: 'https://github.com/LioRael/lenso',
  };
}
