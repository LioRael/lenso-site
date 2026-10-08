import { getMDXComponents } from '@/components/mdx';
import { source } from '@/lib/source';
import { frameworkDocIdentity } from '@/lib/framework-docs';
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
  const identity = await frameworkDocIdentity(page);
  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <section className="docs-provenance" aria-label={chinese ? '文档版本信息' : 'Documentation version'} data-document-channel={identity.channel} data-content-revision={identity.revision}>
        <strong>{chinese ? '开发预览 · 尚未对应已发布框架版本' : 'Development preview · Not a published framework version'}</strong>
        <p>{chinese ? '此页不会替代缺失的已发布版本。' : 'This page does not substitute for an unavailable published version.'} <a href={chinese ? '/docs/zh/versions' : '/docs/versions'}>{chinese ? '查询确切版本' : 'Check an exact version'}</a></p>
        <dl><div><dt>{chinese ? '语言' : 'Locale'}</dt><dd>{identity.locale}</dd></div><div><dt>{chinese ? '内容修订' : 'Content revision'}</dt><dd><code>{identity.revision}</code></dd></div></dl>
      </section>
      <div className="docs-actions"><MarkdownCopyButton markdownUrl={markdownUrl} /><ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`} /><a href={localeUrl} hrefLang={chinese ? 'en' : 'zh-CN'}>{chinese ? 'English' : '简体中文'}</a></div>
      <DocsBody><MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} /></DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() { return source.generateParams(); }

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const page = source.getPage((await props.params).slug);
  if (!page) notFound();
  const chinese = page.url === '/docs/zh' || page.url.startsWith('/docs/zh/');
  const localeUrl = chinese ? page.url.replace(/^\/docs\/zh/, '/docs') : page.url.replace(/^\/docs/, '/docs/zh');
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url, languages: chinese ? { 'zh-CN': page.url, en: localeUrl } : { en: page.url, 'zh-CN': localeUrl } },
  };
}
