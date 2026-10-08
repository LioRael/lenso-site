import { FrameworkDocVersionsPage } from '@/components/framework-doc-versions-page';

export const metadata = {
  title: '框架文档版本',
  alternates: { canonical: '/docs/zh/versions', languages: { en: '/docs/versions', 'zh-CN': '/docs/zh/versions' } },
};

export default function Page() {
  return <FrameworkDocVersionsPage chinese />;
}
