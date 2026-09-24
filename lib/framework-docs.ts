import { createHash } from 'node:crypto';

type FrameworkPage = {
  url: string;
  data: { title: string; description?: string; getText: (type: 'processed') => Promise<string> };
};

export const frameworkDocsChannel = 'development-preview' as const;

export function frameworkDocLocale(url: string) {
  return url === '/docs/zh' || url.startsWith('/docs/zh/') ? 'zh-CN' : 'en';
}

export async function frameworkDocRevision(page: FrameworkPage) {
  const markdown = await page.data.getText('processed');
  const content = JSON.stringify([page.url, page.data.title, page.data.description ?? null, markdown]);
  return `sha256:${createHash('sha256').update(content).digest('hex')}`;
}

export async function frameworkDocIdentity(page: FrameworkPage) {
  return {
    channel: frameworkDocsChannel,
    frameworkVersion: null,
    locale: frameworkDocLocale(page.url),
    revision: await frameworkDocRevision(page),
    canonicalUrl: page.url,
  };
}

export async function frameworkDocsManifest(pages: FrameworkPage[]) {
  const revisions = await Promise.all(pages.map(async (page) => [page.url, await frameworkDocRevision(page)] as const));
  const digest = createHash('sha256');
  for (const [url, revision] of revisions.sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)) {
    digest.update(`${url}\0${revision}\n`);
  }
  return {
    schema: 'lenso.site.framework-docs.v1',
    preview: {
      channel: frameworkDocsChannel,
      frameworkVersion: null,
      route: '/docs',
      locales: ['en', 'zh-CN'],
      revision: `sha256:${digest.digest('hex')}`,
    },
    published: [],
  };
}
