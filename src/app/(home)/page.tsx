import Link from 'next/link';
import { HeroProductDemo } from '@/components/hero-product-demo';
import { HomeLowerSections } from '@/components/home-lower-sections';
import {
  ArrowRight,
  Check,
  GitBranch,
} from 'lucide-react';

const heroSignals = [
  ['Facade', 'lenso 0.3.8'],
  ['Console', 'served at /console'],
  ['Examples', 'runnable module loops'],
];

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#ebebeb] bg-white/80 backdrop-blur-lg dark:border-[#2e2e2e] dark:bg-[#0a0a0a]/80">
        <nav className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6 md:px-8">
          <Link href="/" className="text-[16px] font-semibold leading-6 text-[#171717] dark:text-white">
            Lenso
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/docs"
              className="rounded-[6px] px-3 py-2 text-[14px] leading-5 text-[#4d4d4d] transition hover:bg-[#f2f2f2] hover:text-[#171717] dark:text-[#a1a1a1] dark:hover:bg-[#171717] dark:hover:text-white"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/LioRael/lenso-examples"
              className="hidden rounded-[6px] px-3 py-2 text-[14px] leading-5 text-[#4d4d4d] transition hover:bg-[#f2f2f2] hover:text-[#171717] sm:inline-flex dark:text-[#a1a1a1] dark:hover:bg-[#171717] dark:hover:text-white"
            >
              Examples
            </Link>
            <Link
              href="/docs/quickstart"
              className="ml-2 inline-flex h-8 items-center rounded-[6px] border border-[#00000024] bg-white px-3 text-[14px] font-medium leading-5 text-[#171717] transition hover:bg-[#fafafa] dark:border-[#ffffff2e] dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-[#171717]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="min-h-[calc(100vh-56px)] bg-white text-[#171717] dark:bg-[#0a0a0a] dark:text-white">
        <section className="border-b border-[#ebebeb] dark:border-[#2e2e2e]">
          <div className="mx-auto w-full max-w-[1200px] px-6 pt-16 pb-10 md:px-8 md:pt-20 md:pb-12">
            <div className="grid gap-10 md:grid-cols-[minmax(0,0.92fr)_minmax(460px,1fr)] md:items-center">
              <div className="max-w-[650px]">
                <h1 className="text-balance text-[44px] font-semibold leading-[48px] tracking-normal text-[#171717] md:text-[62px] md:leading-[62px] dark:text-white">
                  Agent-ready modular app framework for Rust business systems
                </h1>
                <p className="mt-6 max-w-[580px] text-[18px] leading-7 text-[#4d4d4d] dark:text-[#a1a1a1]">
                  Lenso starts as one deployable Rust system: API, worker,
                  migrations, Postgres, and Runtime Console. Teams and agents add
                  modules through manifests, contracts, checks, and a verification
                  loop that stays visible.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/docs/quickstart"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#171717] px-4 text-[14px] font-medium leading-5 text-white transition hover:bg-[#4d4d4d] dark:bg-white dark:text-[#171717] dark:hover:bg-[#ebebeb]"
                  >
                    Get Started
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="https://github.com/LioRael/lenso-examples"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#00000024] bg-white px-4 text-[14px] font-medium leading-5 text-[#171717] transition hover:bg-[#fafafa] dark:border-[#ffffff2e] dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-[#171717]"
                  >
                    View Examples
                    <GitBranch className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <HeroProductDemo />
            </div>

            <div className="mt-12 grid border-t border-l border-[#ebebeb] bg-white sm:grid-cols-3 dark:border-[#2e2e2e] dark:bg-[#0a0a0a]">
              {heroSignals.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center gap-3 border-r border-b border-[#ebebeb] p-4 text-[14px] leading-5 dark:border-[#2e2e2e]"
                >
                  <Check className="size-4 shrink-0 text-[#171717] dark:text-white" aria-hidden="true" />
                  <div>
                    <div className="font-medium text-[#171717] dark:text-white">{label}</div>
                    <div className="text-[#4d4d4d] dark:text-[#a1a1a1]">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <HomeLowerSections />
      </main>
    </>
  );
}
