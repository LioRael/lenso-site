import Link from 'next/link';
import { ArrowLeft, CircleAlert, ExternalLink, FileText, Gauge, Play, Settings, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';
import { CopyCommand } from '@/components/copy-command';
import { SiteHeader } from '@/components/site-header';
import { candidateRelease as release } from '@/lib/plugin-candidates';

const sections = [
  ['Overview', FileText], ['Get started', Play], ['Configuration', Settings], ['Public interfaces', ExternalLink], ['Targets and limits', Gauge], ['Upgrade or remove', Trash2],
] as const;

export const metadata: Metadata = {
  title: `${release.pluginId} ${release.version}`,
  description: `${release.summary} Candidate documentation; not yet catalog-signed.`,
  robots: { index: false, follow: false },
};

export default function CandidateDocumentationPage() {
  const dependency = `${release.package} = "=${release.version}"`;
  return (
    <div className="candidate-doc-shell">
      <SiteHeader active="docs" />
      <div className="candidate-doc-grid">
        <aside className="candidate-sidebar"><p>Plugins</p><strong>{release.pluginId}</strong><nav>{sections.map(([label, Icon]) => <a className={label === 'Get started' ? 'is-active' : undefined} href={label === 'Get started' ? '#get-started' : `#${label.toLowerCase().replaceAll(' ', '-')}`} key={label}><Icon size={18} />{label}</a>)}</nav></aside>
        <article className="candidate-article">
          <p className="breadcrumbs"><Link href="/plugins">Plugins</Link><span>/</span><span>{release.pluginId}</span><span>/</span><span>{release.version}</span></p>
          <div className="candidate-title-row"><div><h1 id="overview">{release.pluginId}</h1><p>{release.summary}</p></div><div className="candidate-selectors"><label>Version<select defaultValue={release.version}><option>{release.version}</option></select></label><label>Language<select defaultValue="English"><option>English</option></select></label></div></div>
          <p className="candidate-warning"><CircleAlert size={23} />Candidate documentation · not yet catalog-signed</p>
          <hr />
          <h2 id="get-started">Get started</h2>
          <p>This candidate claims a linked Rust distribution. The Host must build and register it for the declared Native target; no signed catalog availability decision is present.</p>
          <div className="code-panel"><div className="code-panel-head"><span>Cargo.toml</span><CopyCommand value={dependency} /></div><pre><code>{`[dependencies]\n${dependency}`}</code></pre></div>
          <aside className="adopt-callout"><CircleAlert size={25} /><div><h3>Before you adopt</h3><ul><li>Requires a Host build</li><li>Native is a candidate claim</li><li>No implicit portable fallback</li></ul></div></aside>
          <h3 id="public-interfaces" className="article-subheading">Create the native factory</h3>
          <div className="code-panel"><div className="code-panel-head"><span>src/main.rs</span><CopyCommand value={'use lenso_web_ingress_plugin::WebIngressFactory;\n\nlet ingress = WebIngressFactory::new();'} /></div><pre><code>{`use lenso_web_ingress_plugin::WebIngressFactory;\n\nlet ingress = WebIngressFactory::new();`}</code></pre></div>
          <h2 id="configuration">Configuration</h2>
          <p>Configure the selected Plugin instance through its package-owned JSON Schema. The resolved App Plan, not process-global state, supplies the instance configuration to the factory.</p>
          <h2 id="targets-and-limits">Targets and limits</h2>
          <p>The pinned source tag declares a linked Rust distribution for Native Hosts. It requires a Host rebuild and does not imply a Wasm, Workers, or JavaScript implementation.</p>
          <h2 id="upgrade-or-remove">Upgrade or remove</h2>
          <p>Change or remove the exact dependency and Plugin Root selection together, rebuild the Host, then inspect the resolved plan before activation. Do not treat an unselected package or this unsigned candidate claim as available.</p>
        </article>
        <aside className="facts-rail"><h2>Candidate claims</h2><dl><Fact term="Plugin ID" value={release.pluginId} /><Fact term="Version" value={release.version} /><Fact term="Distribution" value={release.distribution} /><Fact term="Declared target" value={release.target} /><Fact term="Catalog status" value="Not yet signed" /><Fact term="Source tag" value={release.sourceTag} /><Fact term="Source revision" value={release.sourceRevision} /></dl><a href={release.sourceUrl}>Immutable source revision<ExternalLink size={15} /></a><p>Candidate content is isolated from signed catalog documentation and does not establish availability.</p><Link href="/plugins"><ArrowLeft size={18} />Back to candidate</Link><a href={release.registryUrl}>Published crate docs<ExternalLink size={17} /></a></aside>
      </div>
    </div>
  );
}

function Fact({ term, value }: { term: string; value: string }) { return <div><dt>{term}</dt><dd>{value}</dd></div>; }
