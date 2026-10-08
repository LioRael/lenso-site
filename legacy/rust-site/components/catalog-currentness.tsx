'use client';

import { useEffect, useState } from 'react';
import { adoptionIsCurrent } from '../scripts/catalog-currentness.mjs';
import { CopyCommand } from '@/components/copy-command';
import { signedLinkedCatalog } from '@/lib/plugin-candidates';
import { confirmVerifiedHead, marketplaceCommand } from '../scripts/keyless-currentness.mjs';

const provenance = signedLinkedCatalog.provenance;

function useCurrentCatalog(expirations: readonly (number | null)[]) {
  const [current, setCurrent] = useState(false);
  const key = JSON.stringify(expirations);
  useEffect(() => {
    if (provenance) {
      let active = true;
      let request = 0;
      const update = async () => {
        const sequence = ++request;
        setCurrent(false);
        const confirmed = await confirmVerifiedHead(provenance);
        if (active && sequence === request) setCurrent(confirmed);
      };
      void update();
      const onVisibility = () => { void update(); };
      document.addEventListener('visibilitychange', onVisibility);
      const timer = window.setInterval(onVisibility, 60_000);
      return () => { active = false; document.removeEventListener('visibilitychange', onVisibility); window.clearInterval(timer); };
    }
    const values = JSON.parse(key) as (number | null)[];
    let timer: number | undefined;
    const update = () => {
      window.clearTimeout(timer);
      const now = Date.now();
      setCurrent(adoptionIsCurrent(values, now));
      const remaining = values.flatMap((expiry) => expiry && expiry * 1000 > now ? [expiry * 1000 - now] : []);
      if (remaining.length) timer = window.setTimeout(update, Math.min(...remaining, 2_147_483_647));
    };
    update();
    document.addEventListener('visibilitychange', update);
    return () => { window.clearTimeout(timer); document.removeEventListener('visibilitychange', update); };
  }, [key]);
  return current;
}

export function CatalogCurrentness({ expirations, status }: { expirations: readonly (number | null)[]; status?: string }) {
  const current = useCurrentCatalog(expirations);
  if (provenance) return <p className="signed-release-note" role="status">{status && status !== 'listed'
    ? `Publisher provenance verified at Site build. Release is ${status}; new adoption is unavailable.`
    : current ? 'Publisher provenance verified at Site build. The official current catalog matches this record; the CLI verifies it again before adoption.'
      : 'Publisher provenance verified at Site build. Current availability is not confirmed. This historical record remains readable.'}</p>;
  return <p className="signed-release-note" role="status">{current
    ? 'Signature verified at Site build. Catalog validity window is open; the CLI must still verify the current catalog before adoption.'
    : 'Signature verified at Site build. Current availability is not confirmed. This historical record remains readable; new adoption requires a current verified catalog.'}</p>;
}

export function AdoptionCommandPanel({ command, expirations, status, label = 'Local project · replace paths with verified files' }: {
  command: string; expirations: readonly (number | null)[]; label?: string; status?: string;
}) {
  return <AdoptionCommandGroup commands={[{ command, label }]} expirations={expirations} status={status} />;
}

export function AdoptionCommandGroup({ commands, expirations, status }: {
  commands: readonly { command: string; label: string }[]; expirations: readonly (number | null)[]; status?: string;
}) {
  const current = useCurrentCatalog(expirations);
  const [blocked, setBlocked] = useState(false);
  if (provenance) {
    if (!current || blocked || status !== 'listed') return <p className="signed-release-note" role="status">Adoption unavailable: {status === 'revoked' || status === 'yanked' ? `this release is ${status}` : 'current catalog status is not confirmed'}. Existing locked Apps are unchanged.</p>;
    return <>{commands.map(({ command, label }) => {
      const value = marketplaceCommand(command);
      return <div className="code-panel" key={label}><div className="code-panel-head"><span>{label === 'Local project · replace paths with verified files' ? 'Local project · official Marketplace' : label}</span><CopyCommand value={value} canCopy={async () => {
        const confirmed = await confirmVerifiedHead(provenance);
        if (!confirmed) setBlocked(true);
        return confirmed && status === 'listed';
      }} /></div><pre><code>{value}</code></pre></div>;
    })}</>;
  }
  if (!current) return <p className="signed-release-note" role="status">Adoption command unavailable: current catalog status is not confirmed. Obtain a current verified catalog before adding or copying this release. Existing locked Apps are unchanged.</p>;
  return <>{commands.map(({ command, label }) => <div className="code-panel" key={label}><div className="code-panel-head"><span>{label}</span><CopyCommand value={command} canCopy={() => adoptionIsCurrent(expirations)} /></div><pre><code>{command}</code></pre></div>)}</>;
}
