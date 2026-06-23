'use client';

import Link from 'next/link';
import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const heroCommands = [
  {
    id: 'humans',
    label: 'For humans',
    command: 'lenso host init my-lenso-app',
    href: '/docs/quickstart',
  },
  {
    id: 'agents',
    label: 'For agents',
    command: 'npx skills add lenso-dev/skills',
    href: '/docs/module-authoring',
  },
] as const;

type HeroCommandId = (typeof heroCommands)[number]['id'];

export function HeroCommandTabs() {
  const [activeId, setActiveId] = useState<HeroCommandId>('humans');
  const [commandWidth, setCommandWidth] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const commandMeasureRef = useRef<HTMLDivElement>(null);
  const hasMeasuredCommand = useRef(false);
  const copiedResetRef = useRef<number | null>(null);
  const activeCommand = useMemo(
    () => heroCommands.find((command) => command.id === activeId) ?? heroCommands[0],
    [activeId],
  );

  const measureCommand = useCallback(() => {
    const measuredWidth = commandMeasureRef.current?.getBoundingClientRect().width;

    if (!measuredWidth) return;

    setCommandWidth(Math.ceil(measuredWidth));
  }, []);

  useLayoutEffect(() => {
    if (hasMeasuredCommand.current) return;

    measureCommand();
    hasMeasuredCommand.current = true;
  }, [measureCommand]);

  useEffect(() => {
    if (!hasMeasuredCommand.current) return undefined;

    const frame = window.requestAnimationFrame(measureCommand);

    return () => window.cancelAnimationFrame(frame);
  }, [activeCommand.command, measureCommand]);

  const clearCopiedState = useCallback(() => {
    if (copiedResetRef.current !== null) {
      window.clearTimeout(copiedResetRef.current);
      copiedResetRef.current = null;
    }

    setCopied(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const measureIfMounted = () => {
      if (!cancelled) measureCommand();
    };

    window.addEventListener('resize', measureCommand);
    void document.fonts?.ready.then(measureIfMounted);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', measureCommand);
    };
  }, [measureCommand]);

  useEffect(() => () => {
    if (copiedResetRef.current !== null) {
      window.clearTimeout(copiedResetRef.current);
    }
  }, []);

  const copyCommand = async () => {
    if (copiedResetRef.current !== null) {
      window.clearTimeout(copiedResetRef.current);
    }

    await navigator.clipboard?.writeText(activeCommand.command).catch(() => undefined);
    setCopied(true);
    copiedResetRef.current = window.setTimeout(() => {
      setCopied(false);
      copiedResetRef.current = null;
    }, 1200);
  };

  return (
    <>
      <div
        aria-label="Choose a Lenso starting path"
        className="ml-6 mt-6 flex h-8 w-fit items-center text-[13px] leading-4 max-[900px]:ml-0"
        role="tablist"
      >
        {heroCommands.map((command, index) => {
          const isActive = command.id === activeId;

          return (
            <span className="flex items-center" key={command.id}>
              <button
                aria-selected={isActive}
                className={`h-8 cursor-pointer rounded px-3 ${isActive ? 'font-medium text-[var(--site-ink)]' : 'text-[var(--site-muted)]'}`}
                onClick={() => {
                  clearCopiedState();
                  setActiveId(command.id);
                }}
                role="tab"
                type="button"
              >
                {command.label}
              </button>
              {index < heroCommands.length - 1 ? (
                <span className="h-3 w-px bg-[var(--site-border-muted)]" />
              ) : null}
            </span>
          );
        })}
      </div>

      <div className="ml-6 mt-2 flex h-10 w-fit max-w-full items-center gap-3 max-[900px]:ml-0 max-[560px]:h-auto max-[560px]:flex-wrap">
        <div className="relative max-w-full">
          <div
            className="flex h-10 max-w-full min-w-0 items-center overflow-hidden rounded-full bg-[var(--site-surface)] py-1.5 pl-3 pr-2 font-mono text-sm leading-5 shadow-[var(--site-shadow-control)] transition-[width] duration-[360ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none max-[560px]:w-full"
            style={commandWidth === null ? undefined : { width: commandWidth }}
          >
            <span className="mr-2 text-base leading-6 text-[var(--site-faint)]">$</span>
            <code className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-[var(--site-ink)]">
              {activeCommand.command}
            </code>
            <button
              aria-label={copied ? 'Command copied' : 'Copy command'}
              className="relative ml-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--site-ink)] transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--site-surface-muted)] active:scale-95 motion-reduce:transition-none"
              onClick={copyCommand}
              type="button"
            >
              <span
                className={`absolute inset-0 flex items-center justify-center transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}
              >
                <Copy aria-hidden="true" size={16} strokeWidth={2} />
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
              >
                <Check aria-hidden="true" className="-mt-0.5" size={16} strokeWidth={2.25} />
              </span>
            </button>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none invisible absolute left-0 top-0 flex h-10 w-max items-center rounded-full py-1.5 pl-3 pr-2 font-mono text-sm leading-5"
            ref={commandMeasureRef}
          >
            <span className="mr-2 text-base leading-6 text-[var(--site-faint)]">$</span>
            <code className="whitespace-nowrap">{activeCommand.command}</code>
            <span className="ml-1 h-7 w-7 shrink-0" />
          </div>
        </div>
        <Link
          className="inline-flex h-10 w-[105px] items-center justify-center rounded-full bg-[var(--site-ink)] px-3 text-sm font-medium leading-[21px] text-[var(--site-inverse)] max-[560px]:w-full"
          href={activeCommand.href}
        >
          Read docs
        </Link>
      </div>
    </>
  );
}
