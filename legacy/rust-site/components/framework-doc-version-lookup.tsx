'use client';

import { useSearchParams } from 'next/navigation';

export function FrameworkDocVersionLookup({ chinese }: { chinese: boolean }) {
  const requested = useSearchParams()?.get('version')?.trim() ?? '';
  if (!requested) return null;
  return <p className="docs-version-unavailable" role="status">{chinese ? '此站点构建没有版本 ' : 'This Site build has no published documentation for version '}<code>{requested}</code>{chinese ? ' 的已发布框架文档。开发预览不会自动代替它。' : '. The development preview is not an automatic fallback.'}</p>;
}
