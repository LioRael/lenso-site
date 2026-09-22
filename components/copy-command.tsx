'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyCommand({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="copy-command" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }} type="button">{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? 'Copied' : 'Copy'}</button>;
}
