import type { Metadata } from 'next';
import { PluginDirectory } from '@/components/plugin-directory';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = { title: 'Plugins', description: 'Inspect exact Lenso Plugin distributions and compatibility.' };

export default function PluginsPage() {
  return <div className="marketing-shell"><SiteHeader active="plugins" /><main><PluginDirectory /></main></div>;
}
