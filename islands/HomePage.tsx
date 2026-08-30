import '../styles/home.css';
import { Image, Link } from '../components/home/NextCompat';
import { HeroCommandTabs } from '../components/home/HeroCommandTabs';
import { SiteScrollEffects } from '../components/home/SiteScrollEffects';
import { ThemeSwitcher } from '../components/home/ThemeSwitcher';

const heroDemoFrames = [
  {
    command: 'lenso plugin new example.echo',
    items: [
      { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: 'example.echo/', trail: true },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'plugin-package.json' },
      { depth: 1, icon: '/lenso-assets/tree-folder.svg', label: 'src/' },
      { depth: 1, icon: '/lenso-assets/tree-folder.svg', label: 'generated/' },
    ],
  },
  {
    command: 'lenso app init --host ./host --host-catalog ./host-catalog.json',
    items: [
      { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: 'my-app/', trail: true },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'plugin-root.json' },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'host-catalog.json' },
      { depth: 1, icon: '/lenso-assets/tree-folder.svg', label: 'plugins/' },
    ],
  },
  {
    command: 'lenso app check && lenso run',
    items: [
      { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: 'my-app/', trail: true },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'Resolved Plan · valid' },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'Ready Gate · passed' },
      { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'Host · running' },
    ],
  },
];

const lifecycleSteps = [
  {
    index: '1',
    title: 'Author',
    tag: 'plugin new',
    text: 'Create one typed Plugin, edit its business Provider, and check it against generated Capability contracts.',
    links: [{ label: 'Plugin authoring', icon: '/lenso-assets/runtime-starter-manifest.svg' }],
  },
  {
    index: '2',
    title: 'Package',
    tag: 'plugin pack',
    text: 'Build and verify one portable .lenso-plugin archive with content digests and an explicit execution class.',
    links: [{ label: 'Portable Plugin', icon: '/lenso-assets/runtime-starter-models.svg' }],
  },
  {
    index: '3',
    title: 'Compose',
    tag: 'app init',
    text: 'Initialize a Plugin Root from one reviewed Host Catalog, then add, configure, enable, or disable explicit Plugin instances.',
    links: [{ label: 'Plugin composition', icon: '/lenso-assets/runtime-console-card.svg' }],
  },
  {
    index: '4',
    title: 'Run',
    tag: 'app check',
    text: 'Resolve and validate the complete Plan before boot. The Host starts only after the Ready Gate passes.',
    links: [{ label: 'Runtime lifecycle', icon: '/lenso-assets/feature-console.svg' }],
  },
];

const lifecyclePanels = [
  {
    folder: './',
    file: 'src/plugin.rs',
    lines: ['impl ToolProvider for ExampleEcho', 'generated request type', 'generated domain error'],
  },
  {
    folder: '$',
    file: 'lenso plugin pack',
    lines: ['Descriptor derived', 'Bundle closure verified', 'dist/example.echo-0.1.0.lenso-plugin'],
  },
  {
    folder: 'app init',
    file: 'plugin-root.json',
    lines: ['Host Catalog copied', 'Plugin Root initialized', 'no partial workspace on failure'],
  },
  {
    folder: 'app check',
    file: 'Resolved Plan',
    lines: ['dependencies selected', 'bindings resolved', 'Ready Gate passed'],
  },
];

const runtimeCards = [
  {
    title: 'App Composition',
    text: 'One content-bound selection of Plugin Releases, dependencies, and implementation bindings.',
    icon: '/lenso-assets/runtime-starter-manifest.svg',
  },
  {
    title: 'Plugin manifest',
    text: 'Explicit Business API operations, runtime behavior, dependencies, and Console Surfaces.',
    icon: '/lenso-assets/runtime-starter-models.svg',
  },
  {
    title: 'Business API',
    text: 'Generated clients call declared Plugin operations through scoped Surface Grants.',
    icon: '/lenso-assets/brand-api.svg',
  },
  {
    title: 'Console',
    text: 'Connect an exact System, load receipt-bound Surfaces, and report direct object states.',
    icon: '/lenso-assets/runtime-console-card.svg',
  },
  {
    title: 'Service tiers',
    text: 'Provider and Autonomous Service contracts make ownership and language support explicit.',
    icon: '/lenso-assets/feature-contract.svg',
  },
];

const runtimeChannels = [
  'System ID',
  'Topology Digest',
  'Connection Status',
  'Services',
  'Plugins',
  'Workloads',
  'Control Adapters',
  'Management Binding',
  'Plugin Surfaces',
  'Surface Grants',
];

const channelGroups = [
  {
    label: 'Authoring inputs',
    items: [
      { label: 'Product Blueprints', icon: '/lenso-assets/brand-api.svg', iconWidth: 23 },
      { label: 'Capability Packs', icon: '/lenso-assets/runtime-starter-manifest.svg' },
      { label: 'Agent Skills', icon: '/lenso-assets/runtime-starter-manifest.svg' },
    ],
  },
  {
    label: 'Owner-local contracts',
    items: [
      { label: 'Plugin Contracts', icon: '/lenso-assets/feature-contract.svg' },
      { label: 'Business APIs', icon: '/lenso-assets/brand-api.svg' },
      { label: 'Service Contracts', icon: '/lenso-assets/runtime-starter-models.svg' },
    ],
  },
  {
    label: 'Connected runtime',
    items: [
      { label: 'Services', icon: '/lenso-assets/runtime-starter-models.svg' },
      { label: 'Plugins', icon: '/lenso-assets/feature-contract.svg' },
      { label: 'Workloads', icon: '/lenso-assets/feature-console.svg' },
      { label: 'Control Adapters', icon: '/lenso-assets/runtime-console-card.svg' },
    ],
  },
];

const statusRows = [
  ['compose', -0.1875, 9],
  ['run_local', 5.75, 8],
  ['connect', 68.765625, 35],
  ['status', 224.328125, 8],
  ['control', 218.7109375, 63],
] as const;

const statusAxisWidth = 287.609375;

const agentRows = [
  ['app: support-desk', 'Composed', 'json'],
  ['system: support-desk', 'Running', 'local'],
  ['console', 'Connected', 'system'],
  ['Plugin contracts', 'Current', 'lock'],
  ['surface: support-tickets', 'Connected', 'Plugin'],
  ['service: support-suite-provider', 'Running', 'service'],
  ['runtime stories', 'Running', 'live'],
  ['local control', 'Connected', 'adapter'],
  ['workload', 'Running', 'state'],
  ['next action', 'Available', 'agent'],
];

const featureCards = [
  {
    title: 'Product blueprints',
    text: 'Materialize the initial exact App Composition, then remain only as informational provenance.',
    icon: '/lenso-assets/feature-contract.svg',
  },
  {
    title: 'Explicit contracts',
    text: 'Business APIs, events, service dependencies, and operator surfaces stay named and inspectable.',
    icon: '/lenso-assets/feature-contract.svg',
  },
  {
    title: 'Public lifecycle',
    text: 'Compose, Run locally, Connect, and Status keep every developer and operator on the same path.',
    icon: '/lenso-assets/feature-channel.svg',
  },
  {
    title: 'Capability packs',
    text: 'Materialize reusable business slices into the App Composition instead of becoming parallel runtime state.',
    icon: '/lenso-assets/feature-human.svg',
  },
  {
    title: 'Console',
    text: 'See the connected System, Plugin Surfaces, direct object states, runtime stories, and local workload operations.',
    icon: '/lenso-assets/feature-console.svg',
  },
  {
    title: 'Service-ready evolution',
    text: 'Build modular first, then move stable boundaries into independently delivered services without rewriting the product model.',
    icon: '/lenso-assets/feature-contract.svg',
  },
];

const footerColumns: Array<[string, Array<[string, string]>]> = [
  ['Start', [['Overview', '/docs'], ['Quickstart', '/docs/core/quickstart'], ['Product Blueprints', '/docs/product-blueprints'], ['CLI Reference', '/docs/cli-reference']]],
  ['Build', [['Product Blueprints', '/docs/product-blueprints'], ['Plugin Authoring', '/docs/core/plugin-authoring'], ['Business API Surfaces', '/docs/admin-surfaces'], ['Plugin Console UI', '/docs/console-packages']]],
  ['Extend', [['Business API Surfaces', '/docs/admin-surfaces'], ['Service Capability Tiers', '/docs/autonomous-services'], ['Service System', '/docs/service-system-plane'], ['Auth Capabilities', '/docs/auth-capabilities']]],
  ['Operate', [['Console', '/docs/runtime-console'], ['Service System', '/docs/service-system-plane'], ['Troubleshooting', '/docs/troubleshooting'], ['Examples', '/docs/examples']]],
  ['Concepts', [['Platform Concepts', '/docs/platform-concepts'], ['Runtime Stories', '/docs/runtime-stories'], ['Service System', '/docs/service-system-plane'], ['Service Capability Tiers', '/docs/autonomous-services']]],
  ['Agents', [['Agent Development', '/docs/agent'], ['Contracts and Checks', '/docs/contracts-and-checks'], ['Service System', '/docs/service-system-plane'], ['Examples', '/docs/examples']]],
  ['Reference', [['Manifest Reference', '/docs/manifest-reference'], ['Service Capability Tiers', '/docs/autonomous-services'], ['API Reference', '/docs/api'], ['Troubleshooting', '/docs/troubleshooting']]],
  ['Plugins', [['Plugin Authoring', '/docs/core/plugin-authoring'], ['Plugin Console UI', '/docs/console-packages'], ['Business API Surfaces', '/docs/admin-surfaces'], ['Runtime Lifecycle', '/docs/core/runtime-lifecycle']]],
  ['Community', [['GitHub', 'https://github.com/LioRael/lenso'], ['Issues', 'https://github.com/LioRael/lenso/issues'], ['Discussions', 'https://github.com/LioRael/lenso/discussions'], ['Examples', 'https://github.com/LioRael/lenso-examples']]],
];

const newLabels = new Set([
  'Product Blueprints',
  'Service Capability Tiers',
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
          Lenso is the Rust modular application and microservice framework for
          composing a real product, running it locally, and evolving stable boundaries.
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
        <div className="flex h-9 min-w-0 items-center gap-2 rounded-md bg-[var(--site-surface-muted)] py-2.5 pl-6 pr-3">
          <span
            className="min-w-0 truncate text-[13px] leading-4 text-[var(--site-ink)]"
            title={panel.file}
          >
            {panel.file}
          </span>
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
          copy="Materialize one app composition, run and connect it through the public local entrypoint, then read direct object status in Console."
          title="Compose, Run locally, Connect, Status"
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
        copy="Plugin packages and one reviewed Host Catalog materialize an exact App Composition; Agent Skills guide the bounded authoring path. Console projects active Plugins, Generations, and supported lifecycle controls."
        title="From authoring inputs to a connected System"
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
              Explicit product model
            </p>
            <p className="mt-1 text-sm leading-5 text-[var(--site-muted)]">
              The materialized app and owner-local contracts keep composition, APIs, and
              Console Surfaces explicit.
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
              System status
            </p>
            <p className="mt-1 text-sm leading-5 text-[var(--site-muted)]">
              Where the same facts remain observable and actionable.
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
                    Connected System
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
          Console reports the connected System
        </h2>
        <p className="max-w-[566px] text-lg leading-7 text-[var(--site-muted)]">
          The images below are illustrative mock views, not current product captures. The
          shipped Console reads exact topology, Plugin-owned Surfaces, direct object status,
          and supported local Workload operations.
        </p>
      </div>

      <div
        className="mt-10 grid grid-cols-3 gap-8 text-sm leading-5 text-[var(--site-muted)] max-[640px]:grid-cols-1 max-[640px]:gap-5"
        data-scroll-reveal
      >
        <p>
          <span className="block font-medium text-[var(--site-ink)]">See the whole app</span>
          Services, Plugins, Workloads, Adapters, and capability bindings.
        </p>
        <p>
          <span className="block font-medium text-[var(--site-ink)]">Find the gap</span>
          Every unavailable, incompatible, or unmanaged connection projection includes a direct reason.
        </p>
        <p>
          <span className="block font-medium text-[var(--site-ink)]">Take the next step</span>
          Browser actions use Console Service and never receive direct Service credentials.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-8 max-[760px]:grid-cols-1" data-scroll-reveal>
        <div>
          <Link
            aria-label="Explore Runtime Stories documentation"
            className="block overflow-hidden rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow-control)] transition-transform duration-300 hover:-translate-y-1"
            href="/docs/runtime-stories"
          >
            <Image
              alt="Illustrative mock Runtime Stories graph with example requests, functions, events, and services"
              className="block h-auto w-full"
              height={1200}
              loading="lazy"
              src="/lenso-assets/console/runtime-story-graph.png"
              width={1920}
            />
          </Link>
          <p className="mt-3 text-sm leading-5 text-[var(--site-muted)]">
            Illustrative Runtime Stories mock — use the shipped Story workbench to inspect
            correlated runtime records.
          </p>
        </div>

        <div>
          <Link
            aria-label="Explore Console status documentation"
            className="block overflow-hidden rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] shadow-[var(--site-shadow-control)] transition-transform duration-300 hover:-translate-y-1"
            href="/docs/runtime-console"
          >
            <Image
              alt="Illustrative mock operations overview with example queue pressure, failures, activity, and dead letters"
              className="block h-auto w-full"
              height={1200}
              loading="lazy"
              src="/lenso-assets/console/runtime-overview.png"
              width={1920}
            />
          </Link>
          <p className="mt-3 text-sm leading-5 text-[var(--site-muted)]">
            Illustrative operations mock — queue pressure, failures, and dead-letter signals
            are example data, not a live Console capture.
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
        copy="Lenso gives humans and coding agents explicit contracts, bounded actions, direct status, and recoverable local operations instead of hidden framework magic."
        title="Built to make change reviewable"
        titleWidth="w-[560px]"
      />

      <div
        className="mt-[72px] grid min-h-[509px] grid-cols-3 gap-y-[72px] max-[1000px]:grid-cols-1 max-[560px]:mt-12 max-[560px]:gap-y-10"
        data-scroll-reveal
      >
        <div>
          <StatusChart />
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

function StatusChart() {
  return (
    <div className="mb-6 h-[261px] rounded-l-sm border border-[var(--site-border)] p-5 font-mono text-xs leading-4 text-[var(--site-ink)] max-[560px]:h-40">
      <div className="flex h-full flex-col justify-center gap-2.5">
        {statusRows.map(([label, left, width]) => (
          <div className="grid grid-cols-[122px_1fr] items-center gap-3" key={label}>
            <span>{label}</span>
            <span className="relative h-6">
              <span className="absolute left-0 right-0 top-[11px] h-px bg-[var(--site-faint)]" />
              <span className="absolute left-0 top-1 h-4 w-px bg-[var(--site-faint)]" />
              <span className="absolute right-0 top-1 h-4 w-px bg-[var(--site-faint)]" />
              <span
                className="absolute top-0.5 h-5 rounded border border-[var(--site-success-border)] bg-[var(--site-success-bg)]"
                style={{
                  left: `${(left / statusAxisWidth) * 100}%`,
                  width: `${(width / statusAxisWidth) * 100}%`,
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
              <span className={`h-2 w-2 rounded-full ${['Composed', 'Current', 'Running', 'Connected'].includes(status) ? 'bg-[var(--site-success)]' : 'bg-[var(--site-faint)]'}`} />
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
    <div className="relative mb-6 flex h-[261px] flex-col justify-center gap-2 overflow-hidden rounded-r-sm border-y border-r border-[var(--site-border)] text-sm leading-5 text-[var(--site-ink)] max-[560px]:h-40 max-[560px]:gap-1">
      {channelGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1 text-center font-mono text-[10px] uppercase leading-3 text-[var(--site-muted)]">
            {group.label}
          </p>
          <div className="flex justify-center gap-3">
            {group.items.map((item) => (
              <span
                className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[var(--site-surface)] px-3 shadow-[var(--site-shadow-control)] max-[560px]:h-7 max-[560px]:px-2 max-[560px]:text-xs"
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
    <section className="mx-auto h-[361px] max-w-[1392px] pt-[120px] max-[1439px]:mx-6 max-[1439px]:max-w-none max-[1199px]:h-[224px] max-[900px]:!h-[240px] max-[900px]:pb-0 max-[900px]:pt-[88px] max-[560px]:!h-auto max-[560px]:pb-16 max-[560px]:pt-16">
      <div
        className="flex min-h-14 items-start justify-between gap-8 max-[760px]:flex-col"
        data-scroll-reveal
      >
        <h2 className="max-w-[540px] text-[40px] font-normal leading-[48px] text-[var(--site-ink)] max-[560px]:text-[32px] max-[560px]:leading-[38px]">
          Compose, Run locally, Connect, Status.
        </h2>
        <div className="mt-1 flex flex-wrap gap-3">
          <Link
            className="inline-flex h-12 w-[121px] items-center justify-center rounded-full bg-[var(--site-ink)] px-3 text-base font-medium leading-6 text-[var(--site-inverse)]"
            href="/docs/core/quickstart"
          >
            Start building
          </Link>
          <Link
            aria-label="Install Lenso agent skills"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--site-border)] px-5 text-base font-medium leading-6 text-[var(--site-ink)] max-[560px]:px-3"
            href="/docs/agent"
          >
            Install skills
          </Link>
        </div>
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
              {items.map(([label, href]) => (
                <li className="h-7" key={`${heading}-${href}`}>
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
      <div className="site-home bg-[var(--site-bg)] text-[var(--site-ink)]">
        <Hero />
        <LifecycleSection />
        <RuntimePrimitiveSection />
        <ConsoleShowcaseSection />
        <SystemsSection />
        <CtaSection />
        <Footer />
      </div>
    </>
  );
}
