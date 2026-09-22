import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/plugins', ...source.getPages().map((page) => page.url)].map((path) => ({ url: new URL(path, 'https://lenso.dev').toString() }));
}
