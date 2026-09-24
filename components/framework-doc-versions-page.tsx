import { FrameworkDocVersionLookup } from '@/components/framework-doc-version-lookup';
import { frameworkDocsManifest } from '@/lib/framework-docs';
import { source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { Suspense } from 'react';

export async function FrameworkDocVersionsPage({ chinese }: { chinese: boolean }) {
  const manifest = await frameworkDocsManifest(source.getPages());
  return (
    <DocsPage toc={[]}>
      <DocsTitle>{chinese ? '框架文档版本' : 'Framework documentation versions'}</DocsTitle>
      <DocsDescription>{chinese ? '按确切版本查询；缺失时不会跳到最新内容。' : 'Look up an exact version. Missing versions never resolve to newer content.'}</DocsDescription>
      <DocsBody>
        <p><a href={chinese ? '/docs/versions' : '/docs/zh/versions'} hrefLang={chinese ? 'en' : 'zh-CN'}>{chinese ? 'English' : '简体中文'}</a></p>
        <h2>{chinese ? '已发布版本' : 'Published versions'}</h2>
        <p>{chinese ? '此站点构建尚未包含已发布框架版本的文档快照。' : 'This Site build contains no published framework-version snapshots.'}</p>
        <div className="docs-version-lookup">
          <form action={chinese ? '/docs/zh/versions' : '/docs/versions'} method="get">
            <label htmlFor="framework-doc-version">{chinese ? '确切框架版本' : 'Exact framework version'}</label>
            <div><input id="framework-doc-version" name="version" maxLength={80} required placeholder="0.1.0" /><button type="submit">{chinese ? '查询' : 'Find version'}</button></div>
          </form>
          <Suspense fallback={null}><FrameworkDocVersionLookup chinese={chinese} /></Suspense>
        </div>
        <h2>{chinese ? '开发预览' : 'Development preview'}</h2>
        <p>{chinese ? '当前文档是开发预览，不代表任何已发布版本。' : 'The current documentation is a development preview, not a published version.'} <a href={chinese ? '/docs/zh' : '/docs'}>{chinese ? '阅读预览文档' : 'Read the preview documentation'}</a>.</p>
        <p>{chinese ? '预览内容修订：' : 'Preview corpus revision: '}<code className="docs-revision">{manifest.preview.revision}</code></p>
        <p>{chinese ? '机器可读版本清单：' : 'Machine-readable version inventory: '}<a href="/api/docs/versions">/api/docs/versions</a></p>
      </DocsBody>
    </DocsPage>
  );
}
