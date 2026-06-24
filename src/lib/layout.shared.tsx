import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="docs-eve-nav-title">
          <Image
            alt=""
            className="docs-eve-nav-title-mark"
            height={18}
            priority
            src="/lenso-assets/lenso-header-mark.svg"
            width={18}
          />
          <span>{appName}</span>
        </span>
      ),
    },
    links: [
      {
        text: 'Docs',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'Examples',
        url: 'https://github.com/LioRael/lenso-examples',
        external: true,
      },
      {
        type: 'button',
        text: 'Get Started',
        url: '/docs/quickstart',
      },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
