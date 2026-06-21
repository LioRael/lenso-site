'use client';

import Link from 'next/link';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const workflow = [
  {
    step: '01',
    title: 'Scaffold the host',
    short: 'Create a new Lenso host',
    command: 'lenso host init my-lenso-app',
    details: [
      ['What this creates', 'API, worker, migrations, Postgres defaults, and hosted Console'],
      ['Minimum to run', 'copy env, start services, open /console'],
      ['Agent checks', 'host boots, Console is served, manifest loads'],
    ],
  },
  {
    step: '02',
    title: 'Add a business module',
    short: 'Declare surfaces and checks',
    command: 'lenso module create support --with-console',
    details: [
      ['What this creates', 'manifest, data surface, action, route, console page'],
      ['Minimum to run', 'migration, host wiring, module smoke'],
      ['Agent checks', 'surfaces loaded, story passes, command is reproducible'],
    ],
  },
  {
    step: '03',
    title: 'Verify in Console',
    short: 'Inspect and prove the loop',
    command: 'checks -> /console',
    details: [
      ['What this proves', 'manifest health, proxy evidence, actions, runtime stories'],
      ['Minimum to run', 'open /console and inspect module surface'],
      ['Agent checks', 'smoke fails when wiring drifts'],
    ],
  },
];

const features = [
  {
    title: 'Deployable host',
    text: 'API, worker, migrations, Postgres defaults, and the hosted Console stay together while the product is young.',
    href: '/docs/quickstart',
  },
  {
    title: 'Explicit module surface',
    text: 'Data surfaces, actions, routes, runtime functions, events, and console pages are declared instead of hidden.',
    href: '/docs/module-authoring',
  },
  {
    title: 'Console-backed proof',
    text: 'Operators can inspect loaded modules, proxy evidence, runtime stories, and module-owned admin surfaces.',
    href: '/docs/runtime-console',
  },
  {
    title: 'Hardening path',
    text: 'Start with module boundaries in-process, then split only the boundaries that have earned it.',
    href: '/docs/architecture',
  },
];

const examples = [
  {
    title: 'Support-ticket',
    command: 'lenso module create support --with-console',
    checks: ['One data surface: tickets', 'One action: create_ticket', 'One runtime story: happy path', 'One smoke check: manifest + surfaces + story'],
  },
  {
    title: 'Account-profile',
    command: 'lenso module create account_profile',
    checks: ['One data surface: profiles', 'One action: update_profile', 'One console page: profile admin', 'One smoke check: profile surface loads'],
  },
];

export function HomeLowerSections() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [activeExample, setActiveExample] = useState(0);
  const [copied, setCopied] = useState('');
  const selectedStep = workflow[activeStep];
  const selectedExample = examples[activeExample];

  useEffect(() => {
    let ctx: { revert(): void } | undefined;
    let observer: IntersectionObserver | undefined;
    let cancelled = false;

    void import('gsap').then(({ gsap }) => {
      const root = rootRef.current;
      if (!root || cancelled) return;

      ctx = gsap.context(() => {
        const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion) {
          gsap.set(sections, { autoAlpha: 1, y: 0 });
          return;
        }

        gsap.set(sections, { autoAlpha: 0, y: 18 });
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;

              gsap.fromTo(
                entry.target,
                { autoAlpha: 0, y: 18 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.48,
                  ease: 'power3.out',
                  overwrite: 'auto',
                  willChange: 'transform,opacity',
                  clearProps: 'transform,opacity,visibility,willChange',
                },
              );
              observer?.unobserve(entry.target);
            });
          },
          { rootMargin: '0px 0px -4% 0px', threshold: 0.05 },
        );
        sections.forEach((section) => observer?.observe(section));
      }, root);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      ctx?.revert();
    };
  }, []);

  async function copy(text: string) {
    await navigator.clipboard?.writeText(text);
    setCopied(text);
  }

  return (
    <div ref={rootRef}>
      <section data-reveal className="border-b border-[#ebebeb] bg-[#fafafa] dark:border-[#2e2e2e] dark:bg-[#0a0a0a]">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 lg:grid-cols-[0.58fr_1fr] lg:px-8">
          <div className="max-w-[430px]">
            <div className="font-mono text-[12px] leading-5 text-[#7d7d7d] dark:text-[#8f8f8f]">01 / Workflow</div>
            <h2 className="mt-4 text-[32px] font-semibold leading-10 tracking-normal">Author modules in one visible loop</h2>
            <p className="mt-4 text-[16px] leading-6 text-[#4d4d4d] dark:text-[#a1a1a1]">
              The public path stays small on purpose: scaffold, declare, then verify. That gives agents a narrow surface and teams a clear review point.
            </p>
            <Link
              href="/docs/module-authoring"
              className="mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-[6px] border border-[#00000024] bg-white px-3 text-[14px] font-medium leading-5 text-[#171717] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[#fafafa] active:scale-[0.98] dark:border-[#ffffff2e] dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-[#171717]"
            >
              Module Authoring
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid overflow-hidden rounded-[6px] border border-[#ebebeb] bg-white md:grid-cols-[292px_1fr] dark:border-[#2e2e2e] dark:bg-[#0a0a0a]">
            <div className="border-b border-[#ebebeb] md:border-r md:border-b-0 dark:border-[#2e2e2e]">
              {workflow.map((item, index) => (
                <button
                  key={item.step}
                  type="button"
                  aria-pressed={activeStep === index}
                  onClick={() => setActiveStep(index)}
                  className={`block w-full border-b border-[#ebebeb] px-5 py-5 text-left transition-[background-color,box-shadow,transform] duration-150 ease-out last:border-b-0 active:scale-[0.99] dark:border-[#2e2e2e] ${
                    activeStep === index ? 'bg-white shadow-[inset_3px_0_0_#171717] dark:bg-[#171717] dark:shadow-[inset_3px_0_0_#fff]' : 'hover:bg-white dark:hover:bg-[#171717]'
                  }`}
                >
                  <div className="font-mono text-[12px] leading-5 text-[#8f8f8f]">{item.step}</div>
                  <div className="mt-2 text-[17px] font-semibold leading-6">{item.title}</div>
                  <div className="mt-1 text-[14px] leading-5 text-[#4d4d4d] dark:text-[#a1a1a1]">{item.short}</div>
                </button>
              ))}
            </div>

            <div className="min-w-0 p-5">
              <div className="font-mono text-[13px] leading-5 text-[#7d7d7d] dark:text-[#8f8f8f]">
                {selectedStep.step} / {selectedStep.title}
              </div>
              <h3 className="mt-2 text-[22px] font-semibold leading-7 tracking-normal">{selectedStep.title}</h3>
              <div className="mt-5 flex min-w-0 items-center gap-2 rounded-[6px] bg-[#171717] p-3 font-mono text-[13px] leading-5 text-white">
                <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{selectedStep.command}</code>
                <button type="button" onClick={() => copy(selectedStep.command)} className="rounded-[4px] p-1 text-white/80 transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.94]" aria-label="Copy command">
                  <Copy className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-5 overflow-hidden rounded-[6px] border border-[#ebebeb] dark:border-[#2e2e2e]">
                {selectedStep.details.map(([label, value]) => (
                  <div key={label} className="grid gap-2 border-b border-[#ebebeb] px-4 py-3 text-[14px] leading-5 last:border-b-0 sm:grid-cols-[132px_1fr] dark:border-[#2e2e2e]">
                    <div className="font-medium">{label}</div>
                    <div className="text-[#4d4d4d] dark:text-[#a1a1a1]">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-reveal className="border-b border-[#ebebeb] dark:border-[#2e2e2e]">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-16 lg:grid-cols-[0.58fr_1fr] lg:px-8">
          <div className="max-w-[430px]">
            <div className="font-mono text-[12px] leading-5 text-[#7d7d7d] dark:text-[#8f8f8f]">02 / Architecture</div>
            <h2 className="mt-4 text-[32px] font-semibold leading-10 tracking-normal">Modular first, split later</h2>
            <p className="mt-4 text-[16px] leading-6 text-[#4d4d4d] dark:text-[#a1a1a1]">
              Lenso avoids early infrastructure ceremony. Keep one boring deployment until the module boundary is real enough to move.
            </p>
          </div>
          <div className="grid border-t border-l border-[#ebebeb] sm:grid-cols-2 dark:border-[#2e2e2e]">
            {features.map((feature) => (
              <Link key={feature.title} href={feature.href} className="group border-r border-b border-[#ebebeb] bg-white p-6 transition-[background-color,transform] duration-150 ease-out hover:bg-[#fafafa] active:scale-[0.99] dark:border-[#2e2e2e] dark:bg-[#0a0a0a] dark:hover:bg-[#171717]">
                <h3 className="text-[16px] font-semibold leading-6 tracking-normal">{feature.title}</h3>
                <p className="mt-2 text-[14px] leading-5 text-[#4d4d4d] dark:text-[#a1a1a1]">{feature.text}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium leading-5">
                  Learn more
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-reveal className="bg-[#fafafa] dark:bg-[#0a0a0a]">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-6 py-16 md:grid-cols-[0.58fr_1fr] md:px-8">
          <div>
            <div className="font-mono text-[12px] leading-5 text-[#7d7d7d] dark:text-[#8f8f8f]">03 / Examples</div>
            <h2 className="mt-4 text-[28px] font-semibold leading-9 tracking-normal">Concrete first slices</h2>
            <p className="mt-3 max-w-[420px] text-[16px] leading-6 text-[#4d4d4d] dark:text-[#a1a1a1]">
              Examples are meant to prove the framework surface, not hide it behind a demo app.
            </p>
          </div>
          <div className="overflow-hidden rounded-[6px] border border-[#ebebeb] bg-white dark:border-[#2e2e2e] dark:bg-[#0a0a0a]">
            <div className="grid grid-cols-2 border-b border-[#ebebeb] p-2 dark:border-[#2e2e2e]">
              {examples.map((example, index) => (
                <button
                  key={example.title}
                  type="button"
                  onClick={() => setActiveExample(index)}
                  className={`h-9 rounded-[6px] text-[14px] font-medium leading-5 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98] ${
                    activeExample === index ? 'bg-[#171717] text-white dark:bg-white dark:text-[#171717]' : 'text-[#4d4d4d] hover:bg-[#fafafa] dark:text-[#a1a1a1] dark:hover:bg-[#171717]'
                  }`}
                >
                  {example.title}
                </button>
              ))}
            </div>
            <div className="grid gap-0 md:grid-cols-2">
              <div className="border-b border-[#ebebeb] p-5 md:border-r md:border-b-0 dark:border-[#2e2e2e]">
                <div className="text-[14px] font-medium leading-5">Module command</div>
                <div className="mt-3 flex min-w-0 items-center gap-2 rounded-[6px] bg-[#171717] p-3 font-mono text-[13px] leading-5 text-white">
                  <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{selectedExample.command}</code>
                  <button type="button" onClick={() => copy(selectedExample.command)} className="rounded-[4px] p-1 text-white/80 transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.94]" aria-label="Copy example command">
                    <Copy className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-5 space-y-3 text-[14px] leading-5">
                  {selectedExample.checks.map((item) => (
                    <div key={item} className="flex gap-3">
                      <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      <span className="text-[#4d4d4d] dark:text-[#a1a1a1]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="text-[14px] font-medium leading-5">Console evidence</div>
                <div className="mt-3 overflow-hidden rounded-[6px] border border-[#ebebeb] text-[14px] leading-5 dark:border-[#2e2e2e]">
                  {['Manifest', 'Data surfaces', 'Actions', 'Proxy / Routes', 'Runtime stories'].map((item) => (
                    <div key={item} className="flex items-center justify-between border-b border-[#ebebeb] px-3 py-2 last:border-b-0 dark:border-[#2e2e2e]">
                      <span>{item}</span>
                      <span className="rounded-[4px] border border-[#ebebeb] px-2 py-0.5 text-[12px] leading-4 text-[#4d4d4d] dark:border-[#2e2e2e] dark:text-[#a1a1a1]">ok</span>
                    </div>
                  ))}
                </div>
                {copied ? (
                  <div className="mt-3 text-[13px] leading-5 text-[#4d4d4d] dark:text-[#a1a1a1]" aria-live="polite">
                    Copied command.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
