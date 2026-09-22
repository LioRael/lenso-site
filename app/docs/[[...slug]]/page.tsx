import { getMDXComponents } from '@/components/mdx';
import { source } from '@/lib/source';
import { getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { DocsBody, DocsDescription, DocsPage, DocsTitle, MarkdownCopyButton, ViewOptionsPopover } from 'fumadocs-ui/layouts/docs/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const chinese = page.url === '/docs/zh' || page.url.startsWith('/docs/zh/');
  const localeUrl = chinese ? page.url.replace(/^\/docs\/zh/, '/docs') : page.url.replace(/^\/docs/, '/docs/zh');
  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="docs-actions"><MarkdownCopyButton markdownUrl={markdownUrl} /><ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`} /><a href={localeUrl} hrefLang={chinese ? 'en' : 'zh-CN'}>{chinese ? 'English' : '简体中文'}</a></div>
      <DocsBody><MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} /></DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() { return source.generateParams(); }

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const page = source.getPage((await props.params).slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}
