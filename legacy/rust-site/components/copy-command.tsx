'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyCommand({ value, canCopy }: { value: string; canCopy?: () => boolean | Promise<boolean> }) {
  const [copied, setCopied] = useState(false);
  return <button className="copy-command" onClick={async () => { if (canCopy && !await canCopy()) return; await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }} type="button">{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Copied' : 'Copy'}</button>;
}
