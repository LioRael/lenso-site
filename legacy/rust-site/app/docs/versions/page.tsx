import { FrameworkDocVersionsPage } from '@/components/framework-doc-versions-page';

export const metadata = {
  title: 'Framework documentation versions',
  alternates: { canonical: '/docs/versions', languages: { en: '/docs/versions', 'zh-CN': '/docs/zh/versions' } },
};

export default function Page() {
  return <FrameworkDocVersionsPage chinese={false} />;
}
