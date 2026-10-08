import { FrameworkDocVersionLookup } from '@/components/framework-doc-version-lookup';
import { frameworkDocsManifest } from '@/lib/framework-docs';
import { source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import Link from 'next/link';
import { Suspense } from 'react';

const content = {
  en: {
    title: 'Framework documentation versions',
    description: 'Look up an exact version. Missing versions never resolve to newer content.',
    selfPath: '/docs/versions',
    alternatePath: '/docs/zh/versions',
    alternateLanguage: 'zh-CN',
    alternateLabel: '简体中文',
    publishedTitle: 'Published versions',
    publishedEmpty: 'This Site build contains no published framework-version snapshots.',
    versionLabel: 'Exact framework version',
    findVersion: 'Find version',
    previewTitle: 'Development preview',
    previewDescription: 'The current documentation is a development preview, not a published version.',
    previewPath: '/docs',
    previewLink: 'Read the preview documentation',
    previewRevision: 'Preview corpus revision: ',
    inventory: 'Machine-readable version inventory: ',
  },
  zh: {
    title: '框架文档版本',
    description: '按确切版本查询；缺失时不会跳到最新内容。',
    selfPath: '/docs/zh/versions',
    alternatePath: '/docs/versions',
    alternateLanguage: 'en',
    alternateLabel: 'English',
    publishedTitle: '已发布版本',
    publishedEmpty: '此站点构建尚未包含已发布框架版本的文档快照。',
    versionLabel: '确切框架版本',
    findVersion: '查询',
    previewTitle: '开发预览',
    previewDescription: '当前文档是开发预览，不代表任何已发布版本。',
    previewPath: '/docs/zh',
    previewLink: '阅读预览文档',
    previewRevision: '预览内容修订：',
    inventory: '机器可读版本清单：',
  },
} as const;

export async function FrameworkDocVersionsPage({ chinese }: { chinese: boolean }) {
  const manifest = await frameworkDocsManifest(source.getPages());
  const copy = chinese ? content.zh : content.en;
  return (
    <DocsPage toc={[]}>
      <DocsTitle>{copy.title}</DocsTitle>
      <DocsDescription>{copy.description}</DocsDescription>
      <DocsBody>
        <p><Link href={copy.alternatePath} hrefLang={copy.alternateLanguage}>{copy.alternateLabel}</Link></p>
        <h2>{copy.publishedTitle}</h2>
        <p>{copy.publishedEmpty}</p>
        <div className="docs-version-lookup">
          <form action={copy.selfPath} method="get">
            <label htmlFor="framework-doc-version">{copy.versionLabel}</label>
            <div><input id="framework-doc-version" name="version" maxLength={80} required placeholder="0.1.0" /><button type="submit">{copy.findVersion}</button></div>
          </form>
          <Suspense fallback={null}><FrameworkDocVersionLookup chinese={chinese} /></Suspense>
        </div>
        <h2>{copy.previewTitle}</h2>
        <p>{copy.previewDescription} <Link href={copy.previewPath}>{copy.previewLink}</Link>.</p>
        <p>{copy.previewRevision}<code className="docs-revision">{manifest.preview.revision}</code></p>
        <p>{copy.inventory}<a href="/api/docs/versions">/api/docs/versions</a></p>
      </DocsBody>
    </DocsPage>
  );
}
