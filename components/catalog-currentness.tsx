'use client';

import { useEffect, useState } from 'react';
import { adoptionIsCurrent } from '../scripts/catalog-currentness.mjs';
import { CopyCommand } from '@/components/copy-command';

function useCurrentCatalog(expirations: readonly (number | null)[]) {
  const [current, setCurrent] = useState(false);
  const key = JSON.stringify(expirations);
  useEffect(() => {
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

export function CatalogCurrentness({ expirations }: { expirations: readonly (number | null)[] }) {
  const current = useCurrentCatalog(expirations);
  return <p className="signed-release-note" role="status">{current
    ? 'Signature verified at Site build. Catalog validity window is open; the CLI must still verify the current catalog before adoption.'
    : 'Signature verified at Site build. Current availability is not confirmed. This historical record remains readable; new adoption requires a current verified catalog.'}</p>;
}

export function AdoptionCommandPanel({ command, expirations, label = 'Local project · replace paths with verified files' }: {
  command: string; expirations: readonly (number | null)[]; label?: string;
}) {
  const current = useCurrentCatalog(expirations);
  if (!current) return <p className="signed-release-note" role="status">Adoption command unavailable: current catalog status is not confirmed. Obtain a current verified catalog before adding or copying this release. Existing locked Apps are unchanged.</p>;
  return <div className="code-panel"><div className="code-panel-head"><span>{label}</span><CopyCommand value={command} canCopy={() => adoptionIsCurrent(expirations)} /></div><pre><code>{command}</code></pre></div>;
}
