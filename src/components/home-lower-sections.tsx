import Link from 'next/link';
import { ArrowRight, Check, FileCode2 } from 'lucide-react';

const buildSteps = [
  {
    number: '1',
    title: 'Start with one host',
    path: 'lenso host init my-lenso-app',
    text: 'API, worker, migrations, Postgres defaults, and hosted Console are created together.',
  },
  {
    number: '2',
    title: 'Add reusable modules',
    path: 'lenso module create support --with-console',
    text: 'A module declares data, actions, routes, runtime functions, and console surface in one reviewable boundary.',
  },
  {
    number: '3',
    title: 'Verify the loop',
    path: 'checks -> /console',
    text: 'Manifest health, proxy evidence, admin data, and runtime stories stay visible before the slice is called done.',
  },
];

const primitives = [
  ['Runtime', 'Rust API, worker, migrations, and Postgres defaults.'],
  ['Boundary', 'Module manifests make ownership explicit.'],
  ['Console', 'Operators inspect surfaces and proof in /console.'],
  ['Agent rails', 'Skills, scaffolds, and checks keep generation narrow.'],
  ['Evolution', 'Split modules later, after the boundary earns it.'],
  ['Examples', 'Runnable support-ticket and profile loops.'],
];

const examples = [
  {
    title: 'Support-ticket',
    command: 'lenso module create support --with-console',
    checks: ['tickets data surface', 'reply/create actions', 'runtime story', 'console proof'],
  },
  {
    title: 'Account-profile',
    command: 'lenso module create account_profile',
    checks: ['profiles data surface', 'update action', 'profile admin page', 'host smoke'],
  },
];

export function HomeLowerSections() {
  return (
    <>
      <section className="border-b border-[#ebebeb] bg-[#fafafa] dark:border-[#2e2e2e] dark:bg-black">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 lg:grid-cols-[0.55fr_1fr] lg:px-8">
          <div className="max-w-[460px]">
            <h2 className="text-[32px] font-semibold leading-10 tracking-normal text-[#171717] dark:text-[#ededed]">
              A Lenso project grows as files and manifests
            </h2>
            <p className="mt-4 text-[16px] leading-6 text-[#4d4d4d] dark:text-[#a0a0a0]">
              Business modules stay as ordinary project files, explicit enough for
              humans to review and agents to extend.
            </p>
          </div>

          <div className="overflow-hidden rounded-[6px] border border-[#ebebeb] bg-white dark:border-[#2e2e2e] dark:bg-black">
            {buildSteps.map((step) => (
              <div
                key={step.number}
                className="grid gap-4 border-b border-[#ebebeb] p-5 last:border-b-0 md:grid-cols-[88px_1fr] dark:border-[#2e2e2e]"
              >
                <div className="font-mono text-[13px] leading-5 text-[#7d7d7d] dark:text-[#8f8f8f]">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-[20px] font-semibold leading-[26px] tracking-normal text-[#171717] dark:text-[#ededed]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-5 text-[#4d4d4d] dark:text-[#a0a0a0]">
                    {step.text}
                  </p>
                  <div className="mt-4 rounded-[6px] bg-[#171717] p-3 font-mono text-[13px] leading-5 text-white dark:bg-[#1a1a1a] dark:text-[#ededed]">
                    {step.path}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#ebebeb] dark:border-[#2e2e2e]">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 lg:grid-cols-[0.55fr_1fr] lg:px-8">
          <div className="max-w-[460px]">
            <h2 className="text-[32px] font-semibold leading-10 tracking-normal text-[#171717] dark:text-[#ededed]">
              Everything needed for the first production slice
            </h2>
            <p className="mt-4 text-[16px] leading-6 text-[#4d4d4d] dark:text-[#a0a0a0]">
              The point is not a platform maze. It is a small, inspectable path from
              app scaffold to module proof.
            </p>
            <Link
              href="/docs/architecture"
              className="mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-[6px] border border-[#00000024] bg-white px-3 text-[14px] font-medium leading-5 text-[#171717] transition hover:bg-[#fafafa] dark:border-[#ffffff24] dark:bg-black dark:text-[#ededed] dark:hover:bg-[#1a1a1a]"
            >
              Architecture
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid border-t border-l border-[#ebebeb] sm:grid-cols-2 dark:border-[#2e2e2e]">
            {primitives.map(([title, text]) => (
              <div
                key={title}
                className="border-r border-b border-[#ebebeb] bg-white p-5 dark:border-[#2e2e2e] dark:bg-black"
              >
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-[#171717] dark:text-[#ededed]" aria-hidden="true" />
                  <h3 className="text-[16px] font-semibold leading-6 tracking-normal text-[#171717] dark:text-[#ededed]">
                    {title}
                  </h3>
                </div>
                <p className="mt-2 text-[14px] leading-5 text-[#4d4d4d] dark:text-[#a0a0a0]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fafafa] dark:bg-black">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-16 md:grid-cols-[0.55fr_1fr] md:px-8">
          <div>
            <h2 className="text-[28px] font-semibold leading-9 tracking-normal text-[#171717] dark:text-[#ededed]">
              Concrete module loops
            </h2>
            <p className="mt-3 max-w-[430px] text-[16px] leading-6 text-[#4d4d4d] dark:text-[#a0a0a0]">
              Examples are small on purpose: one business slice, one command, one
              visible proof path.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {examples.map((example) => (
              <div
                key={example.title}
                className="rounded-[6px] border border-[#ebebeb] bg-white p-5 dark:border-[#2e2e2e] dark:bg-black"
              >
                <div className="flex items-center gap-2">
                  <FileCode2 className="size-4 text-[#171717] dark:text-[#ededed]" aria-hidden="true" />
                  <h3 className="text-[18px] font-semibold leading-6 tracking-normal text-[#171717] dark:text-[#ededed]">
                    {example.title}
                  </h3>
                </div>
                <div className="mt-4 overflow-x-auto rounded-[6px] bg-[#171717] p-3 font-mono text-[13px] leading-5 text-white dark:bg-[#1a1a1a] dark:text-[#ededed]">
                  {example.command}
                </div>
                <div className="mt-5 grid gap-3 text-[14px] leading-5">
                  {example.checks.map((check) => (
                    <div key={check} className="flex gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-[#171717] dark:text-[#ededed]" aria-hidden="true" />
                      <span className="text-[#4d4d4d] dark:text-[#a0a0a0]">{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
