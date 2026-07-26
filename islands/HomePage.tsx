import '../styles/home.css';
import { Image, Link } from '../components/home/NextCompat';
import { HeroCommandTabs } from '../components/home/HeroCommandTabs';
import { SiteScrollEffects } from '../components/home/SiteScrollEffects';
import { ThemeSwitcher } from '../components/home/ThemeSwitcher';

const heroDemoFrames = [
  {
    command: 'lenso app compose ./acme-support --blueprint support-desk --apply',
    items: [
      { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: 'acme-support/', trail: true },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'lenso.system.json' },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'lenso.workspace.json' },
      { depth: 1, icon: '/lenso-assets/tree-folder.svg', label: '.lenso/' },
      { depth: 2, icon: '/lenso-assets/tree-file.svg', label: 'launchpad.json' },
    ],
  },
  {
    command: 'lenso app compose --pack support-sla --apply',
    items: [
      { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: 'capabilities/', trail: true },
      { depth: 1, icon: '/lenso-assets/tree-folder.svg', label: 'support-sla/' },
      { depth: 2, icon: '/lenso-assets/tree-file.svg', label: 'lenso.capability.json' },
      { depth: 2, icon: '/lenso-assets/tree-folder.svg', label: 'modules/' },
      { depth: 2, icon: '/lenso-assets/tree-folder.svg', label: 'services/' },
    ],
  },
  {
    command: 'lenso app verify --write-proof',
    items: [
      { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: '.lenso/', trail: true },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'app-proof.json' },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'dev-doctor.json' },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'app-change-plan.json' },
    ],
  },
];

const lifecycleSteps = [
  {
    index: '1',
    title: 'Compose from a product blueprint',
    tag: 'blueprint',
    text: 'Start from a real product shape with a host, services, modules, local processes, and Launchpad state already connected.',
    links: [{ label: 'Product Blueprints', icon: '/lenso-assets/lifecycle-starter-host-a.svg' }],
  },
  {
    index: '2',
    title: 'Extend with explicit capabilities',
    tag: 'compose',
    text: 'Add modules, services, addons, or team-owned capability packs through a reviewable App Change Plan.',
    links: [{ label: 'Capability Packs', icon: '/lenso-assets/lifecycle-chat-sdk.svg' }],
  },
  {
    index: '3',
    title: 'Verify the generated system',
    tag: 'app proof',
    text: 'Doctor, App Proof, contracts, checks, and Runtime Console turn generated state into evidence humans and agents can review.',
    links: [{ label: 'Runtime Console', icon: '/lenso-assets/lifecycle-runtime-console-a.svg' }],
  },
  {
    index: '4',
    title: 'Evolve stable boundaries into services',
    tag: 'service system',
    text: 'Keep one deployable app while boundaries are changing, then move selected capabilities into independently delivered services.',
    links: [{ label: 'Service System', icon: '/lenso-assets/lifecycle-starter-host-b.svg' }],
  },
];

const lifecyclePanels = [
  {
    folder: '.lenso/',
    file: 'launchpad.json',
    lines: ['{', '"blueprint": "support-desk"', '"services": ["api", "notifications"]', '"nextCommand": "lenso dev up"'],
  },
  {
    folder: 'capabilities/support-sla/',
    file: 'lenso.capability.json',
    lines: ['{', '"name": "support-sla"', '"modules": ["sla-policy"]', '"services": ["notifications"]'],
  },
  {
    folder: '.lenso/',
    file: 'app-proof.json',
    lines: ['{', '"status": "verified"', '"generatedState": "current"', '"doctor": "passing"'],
  },
  {
    folder: './',
    file: 'lenso.system.json',
    lines: ['{', '"services": ["host", "notifications"]', '"modules": ["tickets", "sla-policy"]', '"contracts": "explicit"'],
  },
];

const runtimeCards = [
  {
    title: 'Generated app',
    text: 'A runnable host, service workspace, system graph, and Launchpad state from one product blueprint.',
    icon: '/lenso-assets/runtime-release-checks.png',
  },
  {
    title: 'Module manifest',
    text: 'Explicit routes, data, actions, lifecycle, dependencies, and console surfaces.',
    icon: '/lenso-assets/runtime-starter-models.svg',
  },
  {
    title: 'Capability packs',
    text: 'Reusable product slices that can carry modules, services, docs, and agent context.',
    icon: '/lenso-assets/runtime-starter-manifest.svg',
  },
  {
    title: 'Runtime Console',
    text: 'Inspect App Lifecycle, modules, service state, runtime stories, and operational evidence.',
    icon: '/lenso-assets/runtime-console-card.svg',
  },
  {
    title: 'Agent rails',
    text: 'Bounded planning, generation, checks, proof, and concrete next actions.',
    icon: '/lenso-assets/runtime-proof-skills.svg',
  },
];

const runtimeChannels = [
  'App Lifecycle',
  'System Graph',
  'Service Workspace',
  'App Proof',
  'Runtime Console',
  'Capability Packs',
  'Module Manifests',
  'Runtime Stories',
  'Service Contracts',
  'Agent Tasks',
];

const channelRows = [
  [
    { label: 'Product Blueprints', icon: '/lenso-assets/brand-api.svg', iconWidth: 23 },
    { label: 'Runtime Console', icon: '/lenso-assets/runtime-console-card.svg' },
    { label: 'App Proof', icon: '/lenso-assets/feature-contract.svg' },
    { label: 'Launchpad', icon: '/lenso-assets/feature-evidence.svg' },
  ],
  [
    { label: 'Capability Packs', icon: '/lenso-assets/runtime-starter-manifest.svg' },
    { label: 'Service System', icon: '/lenso-assets/lifecycle-release-checks.svg' },
    { label: 'Module Contracts', icon: '/lenso-assets/feature-proof.svg' },
  ],
  [
    { label: 'Doctor', icon: '/lenso-assets/lifecycle-release-checks.svg' },
    { label: 'Change Plans', icon: '/lenso-assets/feature-contract.svg' },
    { label: 'Runtime Stories', icon: '/lenso-assets/lifecycle-starter-host-a.svg' },
    { label: 'Agent Skills', icon: '/lenso-assets/runtime-proof-skills.svg' },
    { label: 'Delivery', icon: '/lenso-assets/runtime-release-checks.png' },
  ],
];

const proofRows = [
  ['app_plan', -0.1875, 9],
  ['doctor', 5.75, 8],
  ['contract_check', 68.765625, 35],
  ['app_proof', 224.328125, 8],
  ['delivery_gate', 218.7109375, 63],
] as const;

const proofAxisWidth = 287.609375;

const agentRows = [
  ['blueprint: support-desk', 'Ready', 'app'],
  ['capability: support-sla', 'Ready', 'pack'],
  ['change plan', 'Review', 'plan'],
  ['module contracts', 'Verified', 'check'],
  ['doctor state', 'Verified', 'proof'],
  ['app proof', 'Verified', 'json'],
  ['runtime stories', 'Running', 'live'],
  ['service delivery', 'Queued', 'gate'],
  ['generated drift', 'Clear', 'diff'],
  ['next action', 'Ready', 'agent'],
];

const featureCards = [
  {
    title: 'Product blueprints',
    text: 'Begin with a working business-system shape instead of an empty host and a list of infrastructure choices.',
    icon: '/lenso-assets/feature-contract.svg',
  },
  {
    title: 'Explicit contracts',
    text: 'Routes, actions, data, events, service dependencies, and operator surfaces stay named and inspectable.',
    icon: '/lenso-assets/feature-evidence.svg',
  },
  {
    title: 'Verification loop',
    text: 'Plans, Doctor, App Proof, contract checks, and Runtime Console make generated changes reviewable.',
    icon: '/lenso-assets/feature-channel.svg',
  },
  {
    title: 'Capability packs',
    text: 'Carry reusable business slices across modules, services, documentation, and bounded agent handoffs.',
    icon: '/lenso-assets/feature-human.svg',
  },
  {
    title: 'Runtime Console',
    text: 'See App Lifecycle, installed modules, service state, runtime stories, data surfaces, and delivery evidence.',
    icon: '/lenso-assets/feature-console.svg',
  },
  {
    title: 'Service-ready evolution',
    text: 'Build modular first, then move stable boundaries into independently delivered services without rewriting the product model.',
    icon: '/lenso-assets/feature-proof.svg',
  },
];

const footerColumns: Array<[string, Array<[string, string]>]> = [
  ['Start', [['Overview', '/docs'], ['Quickstart', '/docs/quickstart'], ['Product Blueprints', '/docs/product-blueprints'], ['CLI Reference', '/docs/cli-reference']]],
  ['Build', [['Host Composition', '/docs/host-composition'], ['Module Authoring', '/docs/module-authoring'], ['Module Installation', '/docs/module-installation'], ['Console Packages', '/docs/console-packages']]],
  ['Extend', [['Capability Surfaces', '/docs/admin-surfaces'], ['Remote Modules', '/docs/remote-modules'], ['Remote Protocol', '/docs/remote-protocol'], ['Auth Capabilities', '/docs/auth-capabilities']]],
  ['Operate', [['Runtime Console', '/docs/runtime-console'], ['Reliability', '/docs/reliability-and-recovery'], ['Observability', '/docs/observability'], ['Deployment', '/docs/deployment']]],
  ['Concepts', [['Platform Concepts', '/docs/platform-concepts'], ['Runtime Stories', '/docs/runtime-stories'], ['Service System', '/docs/service-system-plane'], ['Autonomous Services', '/docs/autonomous-services']]],
  ['Agents', [['Agent Development', '/docs/agent-development'], ['Contracts and Checks', '/docs/contracts-and-checks'], ['Checks and Release', '/docs/checks-and-release'], ['API Clients', '/docs/api-clients']]],
  ['Reference', [['Manifest Reference', '/docs/manifest-reference'], ['Architecture', '/docs/architecture'], ['API Reference', '/docs/api'], ['Troubleshooting', '/docs/troubleshooting']]],
  ['Modules', [['Built-in Modules', '/docs/built-in-modules'], ['Module Catalogs', '/docs/module-catalogs'], ['Admin Surfaces', '/docs/admin-surfaces'], ['Runtime Lifecycle', '/docs/runtime-lifecycle']]],
  ['Community', [['GitHub', 'https://github.com/LioRael/lenso'], ['Issues', 'https://github.com/LioRael/lenso/issues'], ['Discussions', 'https://github.com/LioRael/lenso/discussions'], ['Examples', 'https://github.com/LioRael/lenso-examples']]],
];

const newLabels = new Set([
  'Product Blueprints',
  'Autonomous Services',
  'Agent Development',
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
          Agent-ready Rust
          <br />
          business systems
        </h1>

        <HeroCommandTabs />

        <p className="ml-6 mt-6 max-w-[601px] text-lg leading-7 text-[var(--site-muted)] max-[1199px]:max-w-[559px] max-[900px]:ml-0 max-[900px]:!max-w-none max-[560px]:text-base max-[560px]:leading-7">
          Lenso is the modular app framework for composing real product shapes,
          verifying every change, and evolving stable boundaries into services.
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
          copy="Start with a product blueprint, add reusable business capabilities, verify the generated system, and split services only when their boundaries are ready."
          title="From product blueprint to running system"
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
        copy="App Composer, module manifests, service contracts, Runtime Console, and agent workflows all read from the same explicit system model."
        title="One system model across app, module, service, and agent"
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
              The generated product shape teams actually run.
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
              Evidence
            </p>
            <p className="mt-1 text-sm leading-5 text-[var(--site-muted)]">
              Where the same facts become reviewable and actionable.
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
                    App Lifecycle
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

function ConsoleShowcaseSection() {
  return (
    <section className="mx-auto max-w-[1392px] pb-[120px] pt-[152px] max-[1439px]:mx-6 max-[1439px]:max-w-none max-[560px]:pb-16 max-[560px]:pt-24">
      <div
        className="grid min-h-24 grid-cols-[minmax(0,560px)_minmax(0,566px)] justify-between gap-12 max-[900px]:grid-cols-1"
        data-scroll-reveal
      >
        <h2 className="w-[560px] max-w-full text-[40px] font-normal leading-[48px] text-[var(--site-ink)] max-[560px]:text-[32px] max-[560px]:leading-[38px]">
          Runtime Console turns system state into evidence
        </h2>
        <p className="max-w-[566px] text-lg leading-7 text-[var(--site-muted)]">
          Inspect what the host actually loaded, catch readiness gaps, review App Proof, and copy
          the next concrete command from one operator workspace.
        </p>
      </div>

      <div
        className="mt-10 grid grid-cols-3 gap-8 text-sm leading-5 text-[var(--site-muted)] max-[640px]:grid-cols-1 max-[640px]:gap-5"
        data-scroll-reveal
      >
        <p>
          <span className="block font-medium text-[var(--site-ink)]">See the whole app</span>
          Services, modules, addons, and capability packs.
        </p>
        <p>
          <span className="block font-medium text-[var(--site-ink)]">Find the gap</span>
          Doctor, drift, blocked plans, and missing proof.
        </p>
        <p>
          <span className="block font-medium text-[var(--site-ink)]">Take the next step</span>
          Commands and evidence that humans and agents can review.
        </p>
      </div>

      <Link
        aria-label="Explore the Runtime Console documentation"
        className="mt-12 block overflow-hidden rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow-control)] transition-transform duration-300 hover:-translate-y-1 max-[560px]:mt-8"
        data-scroll-reveal
        href="/docs/runtime-console"
      >
        <Image
          alt="Lenso Runtime Console App Lifecycle view showing services, modules, Doctor checks, App Proof, and next actions"
          className="block h-auto w-full"
          height={1200}
          loading="lazy"
          src="/lenso-assets/console/app-lifecycle.png"
          width={1920}
        />
      </Link>
      <p className="mt-3 text-sm leading-5 text-[var(--site-muted)]">
        App Lifecycle in Runtime Console — the generated app, its readiness, proof, and next action in one view.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-8 max-[760px]:grid-cols-1" data-scroll-reveal>
        <div>
          <Link
            aria-label="Explore Runtime Stories documentation"
            className="block overflow-hidden rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow-control)] transition-transform duration-300 hover:-translate-y-1"
            href="/docs/runtime-stories"
          >
            <Image
              alt="Runtime Stories execution graph showing a request fan-out across functions, events, and services"
              className="block h-auto w-full"
              height={1200}
              loading="lazy"
              src="/lenso-assets/console/runtime-story-graph.png"
              width={1920}
            />
          </Link>
          <p className="mt-3 text-sm leading-5 text-[var(--site-muted)]">
            Runtime Stories — follow one business flow across requests, functions, events, and services.
          </p>
        </div>

        <div>
          <Link
            aria-label="Explore observability documentation"
            className="block overflow-hidden rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow-control)] transition-transform duration-300 hover:-translate-y-1"
            href="/docs/observability"
          >
            <Image
              alt="Runtime Overview showing queue pressure, recent activity, failures, and dead letters"
              className="block h-auto w-full"
              height={1200}
              loading="lazy"
              src="/lenso-assets/console/runtime-overview.png"
              width={1920}
            />
          </Link>
          <p className="mt-3 text-sm leading-5 text-[var(--site-muted)]">
            Runtime Overview — inspect queue pressure, failures, activity, and operator attention.
          </p>
        </div>
      </div>
    </section>
  );
}

function SystemsSection() {
  return (
    <section className="mx-auto min-h-[965px] max-w-[1392px] pb-[120px] pt-[168px] max-[1439px]:mx-6 max-[1439px]:max-w-none max-[1199px]:min-h-[1103px] max-[900px]:min-h-[2359px] max-[560px]:!min-h-0 max-[560px]:pb-16 max-[560px]:pt-24">
      <SectionIntro
        copy="Lenso gives humans and coding agents bounded plans, explicit contracts, recoverable changes, and evidence instead of hidden framework magic."
        title="Built to make change reviewable"
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
          Compose a real product app, then grow it safely.
        </h2>
        <Link
          className="mt-1 inline-flex h-12 w-[121px] items-center justify-center rounded-full bg-[var(--site-ink)] px-3 text-base font-medium leading-6 text-[var(--site-inverse)]"
          href="/docs/quickstart"
        >
          Start building
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
              {items.map(([label, href], index) => (
                <li className="h-7" key={`${heading}-${label}-${index}`}>
                  <Link className="-ml-0.5 inline-flex h-6 items-center gap-1.5 px-0.5 hover:text-[var(--site-ink)]" href={href}>
                    {label}
                    {newLabels.has(label) ? (
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
        <Link className="-ml-5 inline-flex h-[34px] items-center gap-2 px-5 font-mono text-[11px] font-semibold uppercase tracking-normal text-[var(--site-subtle)]" href="https://github.com/LioRael/lenso">
          <span className="h-2 w-2 rounded-full bg-[var(--site-subtle)]" />
          Open source · Built in public
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
      <main className="site-home bg-[var(--site-bg)] text-[var(--site-ink)]">
        <Hero />
        <LifecycleSection />
        <RuntimePrimitiveSection />
        <ConsoleShowcaseSection />
        <SystemsSection />
        <CtaSection />
        <Footer />
      </main>
    </>
  );
}
