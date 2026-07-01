import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { HeroCommandTabs } from '@/components/hero-command-tabs';
import { SiteScrollEffects } from '@/components/site-scroll-effects';
import { ThemeSwitcher } from '@/components/theme-switcher';

const navItems = [
  { label: 'Product', href: '/', menu: true },
  { label: 'Docs', href: '/docs', menu: true },
  { label: 'Examples', href: 'https://github.com/LioRael/lenso-examples' },
  { label: 'Runtime', href: '/docs/runtime-console' },
];

const actionItems = [
  { label: 'Console', href: '/docs/runtime-console' },
  { label: 'GitHub', href: 'https://github.com/LioRael/lenso' },
];

const heroDemoFrames = [
  {
    command: 'lenso host init support-desk',
    items: [
      { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: 'host/', trail: true },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'host.toml' },
      { depth: 1, icon: '/lenso-assets/tree-folder.svg', label: 'modules/' },
      { depth: 2, icon: '/lenso-assets/tree-file.svg', label: 'auth.toml' },
    ],
  },
  {
    command: 'lenso module create support-ticket',
    items: [
      { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: 'modules/', trail: true },
      { depth: 1, icon: '/lenso-assets/tree-folder.svg', label: 'support-ticket/' },
      { depth: 2, icon: '/lenso-assets/tree-file.svg', label: 'manifest.toml' },
      { depth: 2, icon: '/lenso-assets/tree-ts.svg', label: 'console.tsx' },
      { depth: 2, icon: '/lenso-assets/tree-file.svg', label: 'routes.rs' },
    ],
  },
  {
    command: 'open /console',
    items: [
      { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: 'console/', trail: true },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'modules.json' },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'runtime-stories.json' },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'smoke-evidence.json' },
    ],
  },
];

const lifecycleSteps = [
  {
    index: '1',
    title: 'Keep Axum for HTTP',
    tag: 'host.toml',
    text: 'Start from one deployable Rust app that still uses Axum for routes, extractors, and middleware.',
  },
  {
    index: '2',
    title: 'Add business modules',
    tag: 'module.toml',
    text: 'Each module declares routes, data, actions, runtime functions, dependencies, and optional console surfaces before the host loads it.',
    links: [{ label: 'Starter Host', icon: '/lenso-assets/lifecycle-starter-host-a.svg' }],
  },
  {
    index: '3',
    title: 'Keep auth host-owned',
    tag: 'auth/',
    text: 'First-party auth anchors identity in the host while password, device, or future providers stay modular.',
  },
  {
    index: '4',
    title: 'Run the real system',
    tag: 'serve',
    text: 'Local development uses the same generated host shape that release checks and examples exercise.',
  },
  {
    index: '5',
    title: 'Move boundaries later',
    tag: 'remote/',
    text: 'When a boundary hardens, move the module out of process while the host still owns loading, proxying, and receipts.',
    links: [{ label: 'Starter Host', icon: '/lenso-assets/lifecycle-starter-host-b.svg' }],
  },
  {
    index: '6',
    title: 'Inspect Runtime Console',
    tag: 'console/',
    text: 'Operators see module health, admin data, runtime stories, manifest lints, and install state from the running host.',
    links: [
      { label: 'Runtime Console', icon: '/lenso-assets/lifecycle-runtime-console-a.svg' },
      { label: 'Admin APIs', icon: '/lenso-assets/lifecycle-chat-sdk.svg' },
    ],
  },
  {
    index: '7',
    title: 'Give agents rails',
    tag: 'skills/',
    text: 'Public skills, scaffolds, and contracts let coding agents build modules without guessing the project shape.',
    links: [{ label: 'Runtime Console', icon: '/lenso-assets/lifecycle-runtime-console-b.svg' }],
  },
  {
    index: '8',
    title: 'Capture proof',
    tag: 'checks/',
    text: 'Smoke checks, generated contracts, and console evidence stay reviewable beside the code they validate.',
  },
  {
    index: '9',
    title: 'Ship when facts agree',
    tag: 'release/',
    text: 'Release readiness ties the crate, CLI starter, Runtime Console bundle, and runnable examples back to the same contract surface.',
    links: [{ label: 'Release Checks', icon: '/lenso-assets/lifecycle-release-checks.svg' }],
  },
];

const lifecyclePanels = [
  {
    folder: 'host/',
    file: 'host.toml',
    lines: ['[host]', 'name = "ops-host"', 'console = "bundled"', 'modules = ["auth"]'],
  },
  {
    folder: 'modules/',
    file: 'module.toml',
    lines: ['[module]', 'name = "support-ticket"', 'routes = ["tickets"]', 'actions = ["assign"]'],
  },
  {
    folder: 'auth/',
    file: 'auth.toml',
    lines: ['[auth]', 'owner = "host"', 'sessions = "redis"', 'providers = ["password"]'],
  },
  {
    folder: 'ops-host/',
    file: 'serve.log',
    lines: ['$ lenso serve', 'api = "ready"', 'worker = "ready"', 'console = "/console"'],
  },
  {
    folder: 'remote/',
    file: 'manifest.json',
    lines: ['{', '"name": "account-profile"', '"transport": "grpc"', '"hostOwned": true'],
  },
  {
    folder: 'console/',
    file: 'modules.json',
    lines: ['auth: ready', 'support-ticket: review', 'admin-data: visible', 'stories: recording'],
  },
  {
    folder: 'skills/',
    file: 'SKILL.md',
    lines: ['# Module authoring', 'read manifest first', 'generate smoke proof', 'verify in console'],
  },
  {
    folder: 'checks/',
    file: 'evidence.json',
    lines: ['manifest_lints: pass', 'host_smoke: pass', 'console_bundle: served', 'contracts: current'],
  },
  {
    folder: 'release/',
    file: 'readiness.md',
    lines: ['crate facade current', 'cli starter verified', 'console bundle attached', 'examples smoke green'],
  },
];

const runtimeCards = [
  {
    title: 'Generated host',
    text: 'API, worker, migrations, Postgres, and hosted Console in one Rust app.',
    icon: '/lenso-assets/runtime-release-checks.png',
  },
  {
    title: 'Module manifest',
    text: 'Routes, data, actions, lifecycle, and console surfaces.',
    icon: '/lenso-assets/runtime-starter-models.svg',
  },
  {
    title: 'Remote module kit',
    text: 'Move a module out of process without losing host receipts.',
    icon: '/lenso-assets/runtime-starter-manifest.svg',
  },
  {
    title: 'Runtime Console',
    text: 'Inspect modules, runtime stories, admin data, and install state.',
    icon: '/lenso-assets/runtime-console-card.svg',
  },
  {
    title: 'Skills and checks',
    text: 'Agent rails for scaffolding, smoke proof, and release review.',
    icon: '/lenso-assets/runtime-proof-skills.svg',
  },
];

const runtimeChannels = [
  'Host API',
  'Worker',
  'Migrations',
  'Postgres',
  'Runtime Console',
  'Module Catalog',
  'Admin Data',
  'Runtime Stories',
  'Remote Kit',
  'Lenso Skills',
];

const channelRows = [
  [
    { label: 'Host API', icon: '/lenso-assets/brand-api.svg', iconWidth: 23 },
    { label: 'Runtime Console', icon: '/lenso-assets/runtime-console-card.svg' },
    { label: 'Module Catalog', icon: '/lenso-assets/feature-contract.svg' },
    { label: 'Admin Data', icon: '/lenso-assets/feature-evidence.svg' },
  ],
  [
    { label: 'Remote Kit', icon: '/lenso-assets/runtime-starter-manifest.svg' },
    { label: 'Worker', icon: '/lenso-assets/lifecycle-release-checks.svg' },
    { label: 'Postgres', icon: '/lenso-assets/feature-proof.svg' },
  ],
  [
    { label: 'Smoke Checks', icon: '/lenso-assets/lifecycle-release-checks.svg' },
    { label: 'Manifest Lints', icon: '/lenso-assets/feature-contract.svg' },
    { label: 'Examples', icon: '/lenso-assets/lifecycle-starter-host-a.svg' },
    { label: 'Skills', icon: '/lenso-assets/runtime-proof-skills.svg' },
    { label: 'Release', icon: '/lenso-assets/runtime-release-checks.png' },
  ],
];

const proofRows = [
  ['manifest_lints', -0.1875, 9],
  ['host_smoke', 5.75, 8],
  ['remote_proxy', 68.765625, 35],
  ['console_bundle', 224.328125, 8],
  ['release_check', 218.7109375, 63],
] as const;

const proofAxisWidth = 287.609375;

const agentRows = [
  ['host: ops-host', 'Ready', 'host'],
  ['module: auth', 'Ready', 'linked'],
  ['module: support-ticket', 'Review', 'local'],
  ['remote: account-profile', 'Ready', 'grpc'],
  ['manifest lints', 'Verified', 'check'],
  ['console bundle', 'Verified', 'asset'],
  ['host smoke', 'Running', 'smoke'],
  ['release check', 'Queued', 'gate'],
  ['contract drift', 'Clear', 'arch'],
  ['module catalog', 'Ready', 'json'],
];

const featureCards = [
  {
    title: 'Module contracts',
    text: 'Every route, action, data source, lifecycle hook, and console contribution has a named manifest home.',
    icon: '/lenso-assets/feature-contract.svg',
  },
  {
    title: 'Evidence table',
    text: 'Proof rows capture manifest lint results, generated-host smokes, release checks, and console delivery state.',
    icon: '/lenso-assets/feature-evidence.svg',
  },
  {
    title: 'Service-ready modules',
    text: 'Start in one deployable host, then move selected modules across process boundaries when the contract is stable.',
    icon: '/lenso-assets/feature-channel.svg',
  },
  {
    title: 'Human review',
    text: 'Generated edits stay inspectable through manifests, code diffs, Runtime Console state, and smoke-check evidence.',
    icon: '/lenso-assets/feature-human.svg',
  },
  {
    title: 'Runtime Console',
    text: 'The host-served operator UI shows module health, data surfaces, runtime stories, and install status.',
    icon: '/lenso-assets/feature-console.svg',
  },
  {
    title: 'Agent rails',
    text: 'Public skills, scaffolds, generated contracts, and checks give coding agents a repeatable module path.',
    icon: '/lenso-assets/feature-proof.svg',
  },
];

const footerColumns: Array<[string, string[]]> = [
  ['Lenso Stack', ['Framework', 'Starter Host', 'Modules', 'Remote Modules', 'Runtime Console', 'CLI']],
  ['Build', ['Host Quickstart', 'Module Authoring', 'Remote Kit', 'Support Ticket Demo']],
  ['Operate', ['Runtime Stories', 'Admin Data', 'Manifest Lints', 'Release Checks']],
  ['Architecture', ['Modular Monolith', 'Service-Ready Path', 'Contracts', 'Outbox']],
  ['Packages', ['lenso crate', 'lenso-cli', 'remote-module-kit', 'auth modules']],
  ['Examples', ['Support Ticket', 'Account Profile', 'Hello Action', 'gRPC Notes']],
  ['Skills', ['lenso-start', 'starter-host', 'module-authoring', 'remote-module-authoring']],
  ['Repositories', ['lenso', 'lenso-cli', 'runtime-console', 'lenso-examples']],
  ['Docs', ['Overview', 'Quickstart', 'Architecture', 'Runtime Console', 'Examples']],
  ['Community', ['GitHub', 'Issues', 'Discussions', 'Examples']],
  ['Trust', ['Host Ownership', 'Contract Checks', 'Manifest Lints', 'Console Boundaries']],
  ['Social', ['GitHub']],
];

const newLabels = new Set([
  'Support Ticket Demo',
  'remote-module-kit',
  'Module Catalog',
  'lenso-start',
  'Runtime Console',
]);

const borderMaskClass =
  'pointer-events-none absolute -inset-px rounded-[inherit] p-px';

const borderMaskStyle = {
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
};

const hostBorderMaskStyle = {
  ...borderMaskStyle,
  background: 'var(--site-host-border-mask)',
};

function SectionIntro({
  title,
  copy,
  titleWidth = 'w-[520px]',
}: {
  title: string;
  copy: string;
  titleWidth?: string;
}) {
  return (
    <div
      className="grid min-h-24 grid-cols-[minmax(0,560px)_minmax(0,566px)] justify-between gap-12 max-[900px]:grid-cols-1"
      data-scroll-reveal
    >
      <h2 className={`${titleWidth} max-w-full text-[40px] font-normal leading-[48px] text-[var(--site-ink)] max-[560px]:text-[32px] max-[560px]:leading-[38px]`}>
        {title}
      </h2>
      <p className="max-w-[566px] text-lg leading-7 text-[var(--site-muted)]">{copy}</p>
    </div>
  );
}

function Header() {
  return (
    <header className="site-header sticky top-0 z-50 h-16 text-[var(--site-ink)]">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6"
      >
        <div className="flex h-16 items-center">
          <Link
            aria-label="Lenso home"
            className="-ml-2 flex h-[34px] w-[37px] items-center justify-center"
            href="/"
          >
            <span className="relative h-[18px] w-[21px]">
              <Image
                alt=""
                className="site-icon absolute left-[1.5px] top-0 h-[18px] w-[18px]"
                height={18}
                src="/lenso-assets/lenso-header-mark.svg"
                width={18}
              />
            </span>
          </Link>

          <div className="ml-3 flex h-16 items-center max-[760px]:hidden">
            {navItems.map((item) => (
              <Link
                className="inline-flex h-8 items-center px-3 text-sm leading-5 text-[var(--site-muted)] first:text-[var(--site-ink)] hover:text-[var(--site-ink)]"
                href={item.href}
                key={item.label}
              >
                {item.label}
                {item.menu ? <ChevronDown className="ml-1 h-3.5 w-3.5" /> : null}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex h-8 items-center gap-3 text-sm font-medium leading-[21px]">
          {actionItems.map((item) => (
            <Link
              className="inline-flex h-8 items-center rounded-md bg-[var(--site-surface)] px-3 text-[var(--site-ink)] shadow-[var(--site-shadow-faint)] hover:text-[var(--site-muted)] max-[560px]:hidden"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="inline-flex h-8 items-center rounded-md bg-[var(--site-ink)] px-3 text-[var(--site-inverse)]"
            href="/docs/quickstart"
          >
            Start
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto h-[640px] max-w-[1392px] max-[1439px]:mx-6 max-[1439px]:max-w-none max-[1199px]:h-[760px] max-[900px]:h-[976px] max-[560px]:h-[944px]">
      <div className="absolute -left-6 top-36 h-[376px] w-[1440px] overflow-hidden max-[900px]:static max-[900px]:h-auto max-[900px]:w-full max-[900px]:overflow-visible max-[900px]:pt-20">
        <div className="ml-6 h-6 w-[75px] max-[900px]:ml-0">
          <Image
            alt="Lenso"
            className="site-icon mt-1"
            height={16}
            priority
            src="/lenso-assets/lenso-wordmark.svg"
            width={75}
          />
        </div>

        <h1 className="ml-6 mt-6 max-w-[620px] text-[72px] font-normal leading-[72px] text-[var(--site-ink)] max-[900px]:ml-0 max-[900px]:mt-10 max-[900px]:max-w-none max-[900px]:text-[64px] max-[900px]:leading-[64px] max-[560px]:mt-2 max-[560px]:text-[40px] max-[560px]:leading-[48px]">
          Beyond Axum
          <br />
          routes
        </h1>

        <HeroCommandTabs />

        <p className="ml-6 mt-6 max-w-[601px] text-lg leading-7 text-[var(--site-muted)] max-[1199px]:max-w-[559px] max-[900px]:ml-0 max-[900px]:!max-w-none max-[560px]:text-base max-[560px]:leading-7">
          Star Lenso when your Rust app needs modules, admin APIs, Runtime
          Console evidence, contracts, and checks around Axum.
        </p>

        <div
          aria-hidden="true"
          className="absolute left-[850px] top-12 h-[284px] w-[566px] max-[1199px]:left-[607px] max-[1199px]:w-[393px] max-[900px]:relative max-[900px]:left-auto max-[900px]:top-auto max-[900px]:mt-6 max-[900px]:h-[304px] max-[900px]:w-full"
        >
          <div className="hero-wordart absolute -left-11 -top-2 h-[195px] w-[622px] max-[1199px]:left-[-114.67px] max-[900px]:left-1/2 max-[900px]:top-12 max-[900px]:-translate-x-1/2">
            <span
              className="absolute inset-0 block [mask-image:url('/lenso-assets/lenso-hero-wordart-fill-mask.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/lenso-assets/lenso-hero-wordart-fill-mask.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
              style={{ background: 'var(--site-wordart-fill)' }}
            />
            <span
              className="absolute inset-0 block [mask-image:url('/lenso-assets/lenso-hero-wordart-stroke-mask.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/lenso-assets/lenso-hero-wordart-stroke-mask.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
              style={{ background: 'var(--site-wordart-stroke)' }}
            />
          </div>
          <div className="absolute left-[139px] top-8 flex w-64 flex-col gap-3 max-[1199px]:left-[68.5px] max-[900px]:left-1/2 max-[900px]:top-[38px] max-[900px]:-translate-x-1/2" data-hero-demo>
            <div className="w-64">
              <div
                className="relative mt-9 overflow-hidden rounded-lg bg-[var(--site-surface)] shadow-[var(--site-shadow-card)]"
                data-hero-demo-tree
              >
                {heroDemoFrames.map((frame, frameIndex) => (
                  <div
                    className={`${frameIndex === 0 ? 'relative' : 'absolute inset-x-0 top-0'} p-2`}
                    data-hero-demo-frame
                    key={frame.command}
                    style={{ opacity: frameIndex === 0 ? 1 : 0 }}
                  >
                    {frame.items.map((item) => (
                      <div
                        className="flex h-9 items-center gap-2 rounded px-2 text-sm leading-5 text-[var(--site-ink)]"
                        data-hero-demo-row
                        key={`${frame.command}-${item.label}`}
                        style={{ paddingLeft: 8 + item.depth * 16 }}
                      >
                        <Image alt="" className="site-icon" height={16} src={item.icon} width={16} />
                        <span>{item.label}</span>
                        {item.trail ? (
                          <Image
                            alt=""
                            className="site-icon ml-auto"
                            height={16}
                            src="/lenso-assets/tree-chevron.svg"
                            width={16}
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="flex h-11 w-64 items-center gap-3 rounded-lg bg-[var(--site-surface)] px-4 font-mono text-sm leading-5 shadow-[var(--site-shadow-float)]"
              data-hero-demo-command-shell
            >
              <span className="text-[var(--site-subtle)]">$</span>
              <span className="relative h-5 min-w-0 flex-1 overflow-hidden whitespace-nowrap">
                {heroDemoFrames.map((frame, frameIndex) => (
                  <span
                    className="absolute inset-0 overflow-hidden text-ellipsis whitespace-nowrap"
                    data-hero-demo-command
                    key={frame.command}
                    style={{ opacity: frameIndex === 0 ? 1 : 0 }}
                  >
                    {frame.command}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LifecyclePanel({
  active,
  panel,
}: {
  active: boolean;
  panel: (typeof lifecyclePanels)[number];
}) {
  return (
    <article
      className="lifecycle-panel absolute inset-0 rounded-xl"
      data-active={active ? 'true' : 'false'}
      data-lifecycle-panel
    >
      <div
        aria-hidden="true"
        className="absolute left-3 right-3 top-[88px] h-[158px] pt-4"
      >
        <div className="h-[142px] w-full" />
      </div>
      <div className="absolute left-3 right-3 top-3 z-10 flex h-[76px] flex-col gap-1">
        <div className="flex h-9 items-center px-3 py-2.5">
          <span className="text-[13px] font-medium leading-4 text-[var(--site-ink)]">
            {panel.folder}
          </span>
        </div>
        <div className="flex h-9 items-center gap-2 rounded-md bg-[var(--site-surface-muted)] py-2.5 pl-6 pr-3">
          <span className="text-[13px] leading-4 text-[var(--site-ink)]">{panel.file}</span>
        </div>
      </div>
      <div className="absolute left-3 right-3 top-[104px] z-10 h-[142px] overflow-hidden rounded-md border border-[var(--site-border-muted)]">
        <div className="absolute inset-px overflow-hidden">
          <div className="absolute left-0 top-5 h-[100px] w-full whitespace-nowrap font-mono text-[13px] leading-5 text-[var(--site-ink)]">
            <p className="absolute left-5 top-[-1px] h-5 font-bold leading-5">
              {panel.lines[0]}
            </p>
            <p className="absolute left-5 top-[39px] h-5 leading-5">
              {panel.lines[1]}
            </p>
            <p className="absolute left-5 top-[59px] h-5 leading-5">
              {panel.lines[2]}
            </p>
            <p className="absolute left-5 top-[79px] h-5 leading-5">
              {panel.lines[3]}
            </p>
          </div>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] p-px"
        style={hostBorderMaskStyle}
      />
    </article>
  );
}

function LifecycleSection() {
  return (
    <section className="mx-auto max-w-[1392px] py-[120px] max-[1439px]:mx-6 max-[1439px]:max-w-none">
      <div data-lifecycle>
        <SectionIntro
          copy="Axum gives you HTTP. Lenso keeps that, then adds the parts every serious Rust business app ends up rebuilding: modules, admin surfaces, runtime evidence, generated contracts, and checks."
          title="Why not Axum plus yourself?"
        />

        <div className="mt-11 grid grid-cols-[566px_684px] justify-between gap-12 max-[1100px]:grid-cols-[minmax(0,1fr)_minmax(0,520px)] max-[900px]:grid-cols-1">
          <div className="w-full">
            {lifecycleSteps.map((step, index) => (
              <article
                className="lifecycle-step min-h-[356px] last:min-h-[420px] max-[900px]:border-t max-[900px]:border-[var(--site-border)] max-[900px]:py-10 max-[900px]:first:border-t-0"
                data-active={index === 0 ? 'true' : 'false'}
                data-lifecycle-step
                key={step.index}
              >
                <div className="lifecycle-step-copy">
                  <div className="flex min-h-6 items-center gap-4">
                    <span className="lifecycle-step-index inline-flex h-6 w-6 items-center justify-center rounded-[2px] border border-[var(--site-ink)] font-mono text-sm font-semibold leading-5 text-[var(--site-ink)]">
                      {step.index}
                    </span>
                    <h3 className="text-base font-normal leading-6 text-[var(--site-ink)]">
                      {step.title}
                    </h3>
                    <span className="rounded-full bg-[var(--site-border-muted)] px-3 py-0.5 text-xs font-medium leading-[18px] text-[var(--site-ink)]">
                      {step.tag}
                    </span>
                  </div>
                  <p className="ml-10 mt-4 max-w-[526px] text-base leading-6 text-[var(--site-muted)]">
                    {step.text}
                  </p>
                  {step.links ? (
                    <div className="ml-10 mt-4">
                      <p className="font-mono text-xs uppercase leading-4 text-[var(--site-muted)]">
                        Leverages
                      </p>
                      <div className="mt-2 grid gap-2 text-[13px] font-medium leading-4 text-[var(--site-ink)]">
                        {step.links.map((link) => (
                          <span className="inline-flex items-center gap-1.5" key={link.label}>
                            <Image
                              alt=""
                              className="site-icon h-4 w-4 shrink-0"
                              height={16}
                              loading="eager"
                              src={link.icon}
                              width={16}
                            />
                            {link.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div aria-hidden="true" className="lifecycle-visual relative h-[258px] rounded-xl max-[900px]:max-w-full">
            {lifecyclePanels.map((panel, index) => (
              <LifecyclePanel active={index === 0} key={`${panel.folder}-${panel.file}`} panel={panel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RuntimePrimitiveSection() {
  return (
    <section className="mx-auto min-h-[588px] max-w-[1392px] pt-[120px] max-[1439px]:mx-6 max-[1439px]:max-w-none max-[1199px]:min-h-[664px] max-[900px]:min-h-[1132px] max-[560px]:!min-h-0 max-[560px]:pt-16">
      <SectionIntro
        copy="Generated hosts, module manifests, admin APIs, Runtime Console, and public skills all read from the same declarations."
        title="One contract surface across host, module, and agent"
      />

      <div className="mt-[72px] max-[560px]:mt-10" data-scroll-reveal>
        <Image
          alt="Lenso"
          className="ml-1"
          height={8}
          src="/lenso-assets/lenso-wordmark.svg"
          width={37}
        />
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_340px] gap-4 max-[1000px]:grid-cols-1">
          <div className="relative flex min-h-[268px] flex-col rounded-xl border border-transparent p-5">
            <p className="font-mono text-sm font-medium uppercase leading-5 text-[var(--site-ink)]">
              Runtime
            </p>
            <p className="mt-1 text-sm leading-5 text-[var(--site-muted)]">
              The generated app shape users actually run.
            </p>
            <div className="mt-4 grid gap-4">
              <RuntimeCard large card={runtimeCards[0]} />
              <div className="grid grid-cols-4 gap-4 max-[760px]:grid-cols-1">
                {runtimeCards.slice(1).map((card) => (
                  <RuntimeCard card={card} key={`${card.title}-${card.text}`} />
                ))}
              </div>
            </div>
            <span
              aria-hidden="true"
              className={borderMaskClass}
              style={{
                ...borderMaskStyle,
                background: 'var(--site-border-mask)',
              }}
            />
          </div>

          <div className="relative min-h-[268px] rounded-xl border border-transparent p-5">
            <p className="font-mono text-sm font-medium uppercase leading-5 text-[var(--site-ink)]">
              Surface
            </p>
            <p className="mt-1 text-sm leading-5 text-[var(--site-muted)]">
              Where the same facts become reviewable.
            </p>
            <div className="relative mt-4 min-h-[190px] flex-1 overflow-hidden rounded-lg bg-[var(--site-surface)] p-4 shadow-[var(--site-shadow-control)]">
              <div
                className="flex h-full gap-3"
                style={{
                  maskImage: 'linear-gradient(to bottom, #000 58%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, #000 58%, transparent 100%)',
                }}
              >
                <Image
                  alt=""
                  className="site-icon mt-0.5 h-[18px] w-[18px]"
                  height={18}
                  loading="eager"
                  src="/lenso-assets/runtime-chat-sdk.svg"
                  width={18}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-5 text-[var(--site-ink)]">
                    Chat SDK
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-y-0 text-sm leading-[22px] text-[var(--site-ink)]">
                    {runtimeChannels.map((channel) => (
                      <span key={channel}>{channel}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <span
              aria-hidden="true"
              className={borderMaskClass}
              style={{
                ...borderMaskStyle,
                background: 'var(--site-border-mask)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function RuntimeCard({
  large = false,
  card,
}: {
  large?: boolean;
  card: { icon: string; text: string; title: string };
}) {
  return (
    <div className={`${large ? 'min-h-[76px]' : 'min-h-[76px]'} rounded-lg bg-[var(--site-surface)] p-4 shadow-[var(--site-shadow-control)]`}>
      <div className="flex items-start gap-3">
        <Image
          alt=""
          className="site-icon mt-0.5 h-[18px] w-[18px] shrink-0"
          height={18}
          loading="eager"
          src={card.icon}
          width={18}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium leading-5 text-[var(--site-ink)]">{card.title}</p>
          <p className="mt-1 text-sm leading-5 text-[var(--site-muted)]">{card.text}</p>
        </div>
      </div>
    </div>
  );
}

function SystemsSection() {
  return (
    <section className="mx-auto min-h-[965px] max-w-[1392px] pb-[120px] pt-[168px] max-[1439px]:mx-6 max-[1439px]:max-w-none max-[1199px]:min-h-[1103px] max-[900px]:min-h-[2359px] max-[560px]:!min-h-0 max-[560px]:pb-16 max-[560px]:pt-24">
      <SectionIntro
        copy="Lenso keeps module ownership, generated contracts, and operator visibility close enough for agents to help without hiding the system."
        title="Built for business systems that need proof"
        titleWidth="w-[560px]"
      />

      <div
        className="mt-[72px] grid min-h-[509px] grid-cols-3 gap-y-[72px] max-[1000px]:grid-cols-1 max-[560px]:mt-12 max-[560px]:gap-y-10"
        data-scroll-reveal
      >
        <div>
          <ProofChart />
          <div className="pr-3">
            <FeatureCard card={featureCards[0]} />
          </div>
        </div>
        <div>
          <AgentTable />
          <div className="px-3">
            <FeatureCard card={featureCards[1]} />
          </div>
        </div>
        <div>
          <ChannelCloud />
          <div className="pl-3">
            <FeatureCard card={featureCards[2]} />
          </div>
        </div>
        {featureCards.slice(3).map((card, index) => (
          <div className={index === 0 ? 'pr-3' : index === 1 ? 'px-3' : 'pl-3'} key={card.title}>
            <FeatureCard card={card} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ProofChart() {
  return (
    <div className="mb-6 h-[261px] rounded-l-sm border border-[var(--site-border)] p-5 font-mono text-xs leading-4 text-[var(--site-ink)] max-[560px]:h-40">
      <div className="flex h-full flex-col justify-center gap-2.5">
        {proofRows.map(([label, left, width]) => (
          <div className="grid grid-cols-[122px_1fr] items-center gap-3" key={label}>
            <span>{label}</span>
            <span className="relative h-6">
              <span className="absolute left-0 right-0 top-[11px] h-px bg-[var(--site-faint)]" />
              <span className="absolute left-0 top-1 h-4 w-px bg-[var(--site-faint)]" />
              <span className="absolute right-0 top-1 h-4 w-px bg-[var(--site-faint)]" />
              <span
                className="absolute top-0.5 h-5 rounded border border-[var(--site-success-border)] bg-[var(--site-success-bg)]"
                style={{
                  left: `${(left / proofAxisWidth) * 100}%`,
                  width: `${(width / proofAxisWidth) * 100}%`,
                }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentTable() {
  return (
    <div className="relative mb-6 h-[261px] overflow-hidden border-y border-r border-[var(--site-border)] text-xs leading-4 text-[var(--site-ink)] max-[560px]:h-40">
      <div className="-mt-5">
        {agentRows.map(([agent, status, size]) => (
          <div
            className="grid h-[41px] grid-cols-[minmax(0,205px)_88px_66px] items-center gap-3 border-b border-[var(--site-border)] px-5"
            key={agent}
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{agent}</span>
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${['Ready', 'Verified', 'Running', 'Clear'].includes(status) ? 'bg-[var(--site-success)]' : 'bg-[var(--site-faint)]'}`} />
              {status}
            </span>
            <span className="text-[var(--site-muted)]">{size}</span>
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="site-fade-top pointer-events-none absolute left-0 top-0 h-10 w-full"
      />
      <div
        aria-hidden="true"
        className="site-fade-bottom pointer-events-none absolute bottom-0 left-0 h-10 w-full"
      />
    </div>
  );
}

function ChannelCloud() {
  return (
    <div className="relative mb-6 flex h-[261px] flex-col justify-center gap-3 overflow-hidden rounded-r-sm border-y border-r border-[var(--site-border)] text-sm leading-5 text-[var(--site-ink)] max-[560px]:h-40">
      {channelRows.map((row) => (
        <div className="flex justify-center gap-3" key={row.map((item) => item.label).join('-')}>
          {row.map((item) => (
            <span
              className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[var(--site-surface)] px-3 shadow-[var(--site-shadow-control)]"
              key={item.label}
            >
              <Image
                alt=""
                className="h-[18px] shrink-0"
                height={18}
                loading="eager"
                src={item.icon}
                width={item.iconWidth ?? 18}
              />
              {item.label}
            </span>
          ))}
        </div>
      ))}
      <div
        aria-hidden="true"
        className="site-fade-left pointer-events-none absolute bottom-0 left-0 top-0 w-16"
      />
      <div
        aria-hidden="true"
        className="site-fade-right pointer-events-none absolute bottom-0 right-0 top-0 w-16"
      />
    </div>
  );
}

function FeatureCard({ card }: { card: { icon: string; title: string; text: string } }) {
  return (
    <article className="flex flex-col gap-2">
      <h3 className="flex items-center gap-3 font-mono text-sm font-semibold uppercase leading-5 text-[var(--site-ink)]">
        <Image alt="" className="h-4 w-4" height={16} loading="eager" src={card.icon} width={16} />
        <span>{card.title}</span>
      </h3>
      <p className="max-w-[452px] text-base leading-6 text-[var(--site-muted)]">{card.text}</p>
    </article>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto h-[361px] max-w-[1392px] pt-[120px] max-[1439px]:mx-6 max-[1439px]:max-w-none max-[1199px]:h-[224px] max-[900px]:!h-[240px] max-[900px]:pb-0 max-[900px]:pt-[88px] max-[560px]:!h-[248px]">
      <div
        className="flex min-h-14 items-start justify-between gap-8 max-[760px]:flex-col"
        data-scroll-reveal
      >
        <h2 className="max-w-[540px] text-[40px] font-normal leading-[48px] text-[var(--site-ink)] max-[560px]:text-[32px] max-[560px]:leading-[38px]">
          Build a verified module, then let the app grow.
        </h2>
        <Link
          className="mt-1 inline-flex h-12 w-[121px] items-center justify-center rounded-full bg-[var(--site-ink)] px-3 text-base font-medium leading-6 text-[var(--site-inverse)]"
          href="/docs/quickstart"
        >
          Get started
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-[1440px] px-6 pb-11 pt-10 max-[1439px]:mx-6 max-[1439px]:max-w-none max-[1439px]:px-0">
      <nav
        aria-label="Footer"
        className="relative grid min-h-[684px] auto-rows-[288px] grid-cols-6 content-start gap-x-6 gap-y-6 max-[1100px]:grid-cols-3 max-[640px]:grid-cols-2"
      >
        {footerColumns.map(([heading, items]) => (
          <div className="min-h-[288px]" key={heading}>
            <h2 className="h-6 pt-3 font-mono text-xs font-medium uppercase leading-3 text-[var(--site-ink)]">
              {heading}
            </h2>
            <ul className="mt-3.5 text-sm leading-5 text-[var(--site-subtle)]">
              {items.map((item, index) => (
                <li className="h-7" key={`${heading}-${item}-${index}`}>
                  <Link className="-ml-0.5 inline-flex h-6 items-center gap-1.5 px-0.5 hover:text-[var(--site-ink)]" href="/docs">
                    {item}
                    {newLabels.has(item) ? (
                      <span className="rounded-full bg-[var(--site-surface-muted)] px-1 py-0.5 font-mono text-[8px] leading-4 text-[var(--site-subtle)]">
                        New
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Link aria-label="Lenso home" className="absolute bottom-0 left-0 flex h-8 w-[212px] items-center" href="/">
          <Image alt="" className="site-icon h-4 w-4" height={16} loading="eager" src="/lenso-assets/lenso-footer-mark.svg" width={16} />
        </Link>
      </nav>

      <div className="flex h-[66px] items-end justify-between pb-1 text-sm leading-5 text-[var(--site-muted)]">
        <Link className="-ml-5 inline-flex h-[34px] items-center gap-2 px-5 font-mono text-[11px] font-semibold uppercase tracking-normal text-[var(--site-subtle)]" href="/">
          <span className="h-2 w-2 rounded-full bg-[var(--site-subtle)]" />
          Loading status…
        </Link>
        <ThemeSwitcher />
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteScrollEffects />
      <Header />
      <main className="site-home bg-[var(--site-bg)] text-[var(--site-ink)]">
        <Hero />
        <LifecycleSection />
        <RuntimePrimitiveSection />
        <SystemsSection />
        <CtaSection />
        <Footer />
      </main>
    </>
  );
}
