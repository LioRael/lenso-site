import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
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

const treeItems = [
  { depth: 0, icon: '/lenso-assets/tree-folder.svg', label: 'host/', trail: true },
  { depth: 1, icon: '/lenso-assets/tree-file.svg', label: 'host.toml' },
  { depth: 1, icon: '/lenso-assets/tree-folder.svg', label: 'release/' },
  { depth: 2, icon: '/lenso-assets/tree-ts.svg', label: 'slack.ts' },
];

const lifecycleSteps = [
  {
    index: '1',
    title: 'Start with a host',
    tag: 'host.toml',
    text: 'A generated host declares routes, config, auth surface, and the console mount before anything runs.',
  },
  {
    index: '2',
    title: 'Attach remote modules',
    tag: 'module.toml',
    text: 'Remote modules declare dependencies, stories, and activation state before the host accepts them.',
    links: [{ label: 'Starter Host', icon: '/lenso-assets/lifecycle-starter-host-a.svg' }],
  },
  {
    index: '3',
    title: 'Expose Runtime Console',
    tag: 'modules/',
    text: 'The hosted console shows runtime status, review actions, and update paths from the real host.',
  },
  {
    index: '4',
    title: 'Verify proof output',
    tag: 'tools/',
    text: 'Add a TypeScript file to tools/ and the model can call it. The filename becomes the tool name. No registration required.',
  },
  {
    index: '5',
    title: 'Generate starter hosts',
    tag: 'examples/',
    text: 'Starter hosts and examples keep framework contracts close to the real generated output.',
    links: [{ label: 'Starter Host', icon: '/lenso-assets/lifecycle-starter-host-b.svg' }],
  },
  {
    index: '6',
    title: 'Connect every channel',
    tag: 'release/',
    text: 'The same contract facts drive scaffolds, docs, Runtime Console state, and release readiness.',
    links: [
      { label: 'Runtime Console', icon: '/lenso-assets/lifecycle-runtime-console-a.svg' },
      { label: 'Chat SDK', icon: '/lenso-assets/lifecycle-chat-sdk.svg' },
    ],
  },
  {
    index: '7',
    title: 'Connect product modules',
    tag: 'connections/',
    text: 'Connections handle authentication for services such as GitHub, Stripe, and Linear. Tools can call them without managing tokens.',
    links: [{ label: 'Runtime Console', icon: '/lenso-assets/lifecycle-runtime-console-b.svg' }],
  },
  {
    index: '8',
    title: 'Delegate to agents',
    tag: 'skills/',
    text: 'Agents can scaffold, diff, smoke check, and explain runtime changes from the same facts.',
  },
  {
    index: '9',
    title: 'Run release checks',
    tag: 'schedules/',
    text: 'Release checks run against generated hosts and modules. Evidence stays reviewable beside the runtime.',
    links: [{ label: 'Release Checks', icon: '/lenso-assets/lifecycle-release-checks.svg' }],
  },
];

const runtimeCards = [
  {
    title: 'Release Checks',
    text: 'Checkpointed steps, park between messages, resume on delivery.',
    icon: '/lenso-assets/runtime-release-checks.png',
  },
  {
    title: 'Starter Host',
    text: 'Model calls, streaming.',
    icon: '/lenso-assets/runtime-starter-models.svg',
  },
  {
    title: 'Starter Host',
    text: 'Manifest and stories.',
    icon: '/lenso-assets/runtime-starter-manifest.svg',
  },
  {
    title: 'Runtime Console',
    text: 'MCP/HTTP endpoints.',
    icon: '/lenso-assets/runtime-console-card.svg',
  },
  {
    title: 'Proof and skills',
    text: 'Checks and guidance.',
    icon: '/lenso-assets/runtime-proof-skills.svg',
  },
];

const runtimeChannels = [
  'Slack',
  'Google Chat',
  'Discord',
  'Microsoft Teams',
  'Web Chat',
  'WhatsApp',
  'API',
  'Twilio',
  'Cron',
  'Linear',
];

const channelRows = [
  [
    { label: 'GitHub', icon: '/lenso-assets/brand-github.png' },
    { label: 'Slack', icon: '/lenso-assets/brand-slack.png' },
    { label: 'Discord', icon: '/lenso-assets/brand-discord.png' },
    { label: 'Messenger', icon: '/lenso-assets/brand-messenger.png' },
  ],
  [
    { label: 'Microsoft Teams', icon: '/lenso-assets/brand-teams.png' },
    { label: 'Google Chat', icon: '/lenso-assets/brand-google-chat.png' },
    { label: 'WhatsApp', icon: '/lenso-assets/brand-whatsapp.png' },
  ],
  [
    { label: 'Linear', icon: '/lenso-assets/brand-linear.png' },
    { label: 'Twilio', icon: '/lenso-assets/brand-twilio.png' },
    { label: 'Cron', icon: '/lenso-assets/brand-cron.svg' },
    { label: 'Web Chat', icon: '/lenso-assets/brand-web-chat.svg' },
    { label: 'API', icon: '/lenso-assets/brand-api.svg', iconWidth: 23 },
  ],
];

const proofRows = [
  ['resolve_identity', -0.1875, 9],
  ['customer_summary', 5.75, 8],
  ['search_context', 68.765625, 35],
  ['execute_sql', 224.328125, 8],
  ['data_integrity', 218.7109375, 63],
] as const;

const proofAxisWidth = 287.609375;

const agentRows = [
  ['agent_JKdWWzHCUoj7gKBqnT', 'Running', '4xCPU 8GB'],
  ['agent_yN8upsY7Kgh4DFTiYHyx', 'Stopped', '2xCPU 4GB'],
  ['agent_zDiBp4lFo7hYyv35y06Df', 'Running', '2xCPU 8GB'],
  ['agent_fORPyGtLtxG4VdlDtRnpr', 'Stopping', '4xCPU 8GB'],
  ['agent_T0BqwUg0ierWhp6cD2T', 'Stopped', '2xCPU 8GB'],
  ['agent_SxbECNxlPDoaAFSOZzw', 'Running', '4xCPU 8GB'],
  ['agent_Qm2vTnLx8RpKdWe3BfHa', 'Running', '2xCPU 4GB'],
  ['agent_Hs9YpZcV4NtLmQr7XaPo', 'Stopping', '4xCPU 8GB'],
  ['agent_Lk4BdWnGpY6xTfRoZ2Uy', 'Stopped', '2xCPU 8GB'],
  ['agent_Vc8MqJhDsK1uNbWp5Yeo', 'Running', '4xCPU 8GB'],
];

const featureCards = [
  {
    title: 'Contract ownership',
    text: 'Contract ownership survives generated edits. Every route, module, and proof surface has a named place.',
    icon: '/lenso-assets/feature-contract.svg',
  },
  {
    title: 'Evidence table',
    text: 'Proof rows capture module installs, smoke checks, release checks, and console delivery state.',
    icon: '/lenso-assets/feature-evidence.svg',
  },
  {
    title: 'Multi-channel delivery',
    text: 'One hosted console follows the generated host into local dev, examples, and release checks.',
    icon: '/lenso-assets/feature-channel.svg',
  },
  {
    title: 'Human-in-the-loop',
    text: 'Tools that need confirmation trigger approval gates. Sessions park until resolved, then resume seamlessly.',
    icon: '/lenso-assets/feature-human.svg',
  },
  {
    title: 'Runtime Console',
    text: 'Delegate scaffold, diff, smoke check, and release review to agents using the same runtime facts.',
    icon: '/lenso-assets/feature-console.svg',
  },
  {
    title: 'Agent proof',
    text: 'Define test suites with scoring rubrics. Run evals on every deployment and on a schedule.',
    icon: '/lenso-assets/feature-proof.svg',
  },
];

const footerColumns: Array<[string, string[]]> = [
  ['Lenso Stack', ['Framework', 'Starter Host', 'Starter Host', 'Modules', 'lenso', 'Connect']],
  ['Runtime Platform', ['Release Checks', 'Console Delivery', 'Remote Modules', 'Observability']],
  ['Security', ['Platform Security', 'WAF', 'Bot Management', 'Bot ID']],
  ['Remote module', ['Lenso Release', 'Runtime Console', 'Module Catalog', 'Lenso Skills', 'CLI', 'Starter Host', 'Skills']],
  ['Frameworks', ['lenso', 'Nuxt', 'SvelteKit', 'Nitro', 'Turborepo', 'Tanstack Start', 'FastAPI', 'xmcp', 'All frameworks']],
  ['SDKs', ['Lenso CLI', 'Workflow SDK', 'Flags SDK', 'Chat SDK', 'Queues SDK', 'Streamdown']],
  ['Build', ['AI Apps', 'Web Apps', 'Marketing Sites', 'Platforms', 'Commerce', 'Platform Engineers', 'Design Engineers']],
  ['Learn', ['Docs', 'Blog', 'Changelog', 'Knowledge Base', 'Academy', 'Articles', 'Community']],
  ['Explore', ['Customers', 'Catalog', 'Examples', 'Partner Finder', 'Lenso + Rust']],
  ['Company', ['About', 'Careers', 'Press', 'Events', 'Startups', 'Shipped with Lenso', 'Open Source Program', 'Examples', 'Runtime', 'Help']],
  ['Legal & Trust', ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'DPA', 'Acceptable Use Policy', 'Legal (all documents)', 'Trust Center', 'Status']],
  ['Social', ['GitHub', 'X', 'LinkedIn', 'YouTube', 'Instagram']],
];

const newLabels = new Set([
  'lenso',
  'Connect',
  'Lenso Release',
  'Module Catalog',
  'Workflow SDK',
  'Chat SDK',
  'Queues SDK',
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
          The framework for
          <br />
          modular Rust apps
        </h1>

        <div className="ml-6 mt-6 flex h-8 w-[175px] items-center text-[13px] leading-4 max-[900px]:ml-0">
          <button className="h-8 rounded px-3 font-medium text-[var(--site-ink)]">
            For teams
          </button>
          <span className="h-3 w-px bg-[var(--site-border-muted)]" />
          <button className="h-8 rounded px-3 text-[var(--site-muted)]">For agents</button>
        </div>

        <div className="ml-6 mt-2 flex h-10 w-[423px] max-w-full items-center gap-3 max-[900px]:ml-0 max-[560px]:h-auto max-[560px]:flex-wrap">
          <div className="flex h-10 w-[306px] min-w-0 items-center rounded-full bg-[var(--site-surface)] py-1.5 pl-3 pr-2 font-mono text-sm leading-5 shadow-[var(--site-shadow-control)] max-[560px]:w-full">
            <span className="mr-2 text-base leading-6 text-[var(--site-faint)]">$</span>
            <code className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-[var(--site-ink)]">
              lenso new ops-host --with console
            </code>
            <button aria-label="Copy command" className="ml-1 flex h-7 w-7 items-center justify-center rounded-full">
              <Image alt="" className="site-icon" height={16} src="/lenso-assets/copy-icon.svg" width={16} />
            </button>
          </div>
          <Link
            className="inline-flex h-10 w-[105px] items-center justify-center rounded-full bg-[var(--site-ink)] px-3 text-sm font-medium leading-[21px] text-[var(--site-inverse)] max-[560px]:w-full"
            href="/docs"
          >
            Read docs
          </Link>
        </div>

        <p className="ml-6 mt-6 max-w-[601px] text-lg leading-7 text-[var(--site-muted)] max-[1199px]:max-w-[559px] max-[900px]:ml-0 max-[900px]:!max-w-none max-[560px]:text-base max-[560px]:leading-7">
          Like Next.js for web apps, but for Rust business systems. Hosts,
          modules, console state, and proof logs stay inspectable by default.
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
          <div className="absolute left-[139px] top-8 flex w-64 flex-col gap-3 max-[1199px]:left-[68.5px] max-[900px]:left-1/2 max-[900px]:top-[38px] max-[900px]:-translate-x-1/2">
            <div className="h-[196px] w-64">
              <div className="mt-9 h-40 rounded-lg bg-[var(--site-surface)] p-2 shadow-[var(--site-shadow-card)]">
                {treeItems.map((item) => (
                  <div
                    className="flex h-9 items-center gap-2 rounded px-2 text-sm leading-5 text-[var(--site-ink)]"
                    key={item.label}
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
            </div>
            <div className="flex h-11 w-64 items-center gap-3 rounded-lg bg-[var(--site-surface)] px-4 font-mono text-sm leading-5 shadow-[var(--site-shadow-float)]">
              <span className="text-[var(--site-subtle)]">$</span>
              <span>lenso</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LifecyclePanel() {
  return (
    <article
      className="lifecycle-panel absolute inset-0 rounded-xl"
      data-active="true"
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
            host/
          </span>
        </div>
        <div className="flex h-9 items-center gap-2 rounded-md bg-[var(--site-surface-muted)] py-2.5 pl-6 pr-3">
          <span className="text-[13px] leading-4 text-[var(--site-ink)]">host.toml</span>
        </div>
      </div>
      <div className="absolute left-3 right-3 top-[104px] z-10 h-[142px] overflow-hidden rounded-md border border-[var(--site-border-muted)]">
        <div className="absolute inset-px overflow-hidden">
          <div className="absolute left-0 top-5 h-[100px] w-full whitespace-nowrap font-mono text-[13px] leading-5 text-[var(--site-ink)]">
            <p className="absolute left-5 top-[-1px] h-5 font-bold leading-5">
              # Identity
            </p>
            <p className="absolute left-5 top-[39px] h-5 leading-5">
              You are an expert weather assistant.
            </p>
            <p className="absolute left-5 top-[59px] h-5 leading-5 text-[var(--site-subtle)]">
              You can fetch the weather for any
            </p>
            <p className="absolute left-5 top-[79px] h-5 leading-5 text-[var(--site-faint)]">
              city in the world.
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
          copy="Define hosts, modules, console state, and proof evidence in small manifest files. Lenso wires the runtime so agents and humans review the same facts."
          title="A Lenso app is a contract"
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
            <LifecyclePanel />
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
        copy="Starter hosts, remote modules, Runtime Console, proof logs, and skills share one boring contract surface. No point-solution glue."
        title="Leverages every Lenso runtime primitive"
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
          <div className="relative min-h-[268px] rounded-xl border border-transparent p-5">
            <p className="font-mono text-sm font-medium uppercase leading-5 text-[var(--site-ink)]">
              Runtime
            </p>
            <p className="mt-1 text-sm leading-5 text-[var(--site-muted)]">
              Durable execution, state persistence, event streaming.
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
              Channel
            </p>
            <p className="mt-1 text-sm leading-5 text-[var(--site-muted)]">
              Where your runtime facts are surfaced.
            </p>
            <div className="relative mt-4 h-[168px] overflow-hidden rounded-lg bg-[var(--site-surface)] p-4 shadow-[var(--site-shadow-control)]">
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
        copy="Ownership, reviewable changes, generated evidence, and hosted console delivery come standard."
        title="Everything you need for Rust business systems"
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
              <span className={`h-2 w-2 rounded-full ${status === 'Running' ? 'bg-[var(--site-success)]' : 'bg-[var(--site-faint)]'}`} />
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
          Build your first modular app today.
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
