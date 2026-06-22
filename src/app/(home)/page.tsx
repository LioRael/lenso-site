import Link from 'next/link';
import { HeroFrameworkDemo } from '@/components/hero-framework-demo';
import { HomeLowerSections } from '@/components/home-lower-sections';
import {
  ArrowRight,
  Copy,
  GitBranch,
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#ebebeb] bg-white/90 backdrop-blur-md dark:border-[#2e2e2e] dark:bg-black/90">
        <nav className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3 text-[16px] font-semibold leading-6 text-[#171717] dark:text-[#ededed]">
            <span className="inline-block size-0 border-r-[9px] border-b-[16px] border-l-[9px] border-r-transparent border-b-[#171717] border-l-transparent dark:border-b-[#ededed]" aria-hidden="true" />
            <span>Lenso</span>
            <span className="hidden text-[#8f8f8f] sm:inline">/ framework</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/docs"
              className="rounded-[6px] px-3 py-2 text-[14px] leading-5 text-[#4d4d4d] transition hover:bg-[#f2f2f2] hover:text-[#171717] dark:text-[#a0a0a0] dark:hover:bg-[#1a1a1a] dark:hover:text-[#ededed]"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/LioRael/lenso-examples"
              className="hidden rounded-[6px] px-3 py-2 text-[14px] leading-5 text-[#4d4d4d] transition hover:bg-[#f2f2f2] hover:text-[#171717] sm:inline-flex dark:text-[#a0a0a0] dark:hover:bg-[#1a1a1a] dark:hover:text-[#ededed]"
            >
              Examples
            </Link>
            <Link
              href="/docs/quickstart"
              className="ml-2 inline-flex h-8 items-center rounded-[6px] border border-[#00000024] bg-white px-3 text-[14px] font-medium leading-5 text-[#171717] transition hover:bg-[#fafafa] dark:border-[#ffffff24] dark:bg-black dark:text-[#ededed] dark:hover:bg-[#1a1a1a]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="min-h-[calc(100vh-56px)] bg-white text-[#171717] dark:bg-black dark:text-[#ededed]">
        <section className="border-b border-[#ebebeb] dark:border-[#2e2e2e]">
          <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 pt-24 pb-16 md:px-8 lg:grid-cols-[minmax(0,650px)_minmax(520px,1fr)] lg:items-center lg:pt-28 lg:pb-12">
            <div className="max-w-[690px]">
              <div className="mb-8 flex h-6 items-center gap-3 text-[#171717] dark:text-[#ededed]" aria-hidden="true">
                <span className="h-[3px] w-8 bg-current" />
                <span className="h-[3px] w-8 bg-current" />
                <span className="h-[3px] w-8 bg-current" />
              </div>
              <h1 className="text-balance text-[56px] font-semibold leading-[58px] tracking-normal text-[#171717] md:text-[74px] md:leading-[76px] dark:text-[#ededed]">
                The framework for building Rust business systems
              </h1>
              <div className="mt-8 flex items-center gap-4 text-[14px] leading-5">
                <span className="font-medium text-[#171717] dark:text-[#ededed]">For teams</span>
                <span className="h-4 w-px bg-[#ebebeb] dark:bg-[#2e2e2e]" />
                <span className="text-[#7d7d7d] dark:text-[#a0a0a0]">For agents</span>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <div className="flex h-10 min-w-0 items-center rounded-[9999px] border border-[#ebebeb] bg-white px-3 font-mono text-[14px] leading-5 text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.04)] dark:border-[#2e2e2e] dark:bg-black dark:text-[#ededed]">
                  <span className="mr-2 text-[#8f8f8f]">$</span>
                  <code className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">lenso host init my-lenso-app</code>
                  <Copy className="ml-2 size-4 shrink-0 text-[#4d4d4d] dark:text-[#a0a0a0]" aria-hidden="true" />
                </div>
                <Link
                  href="/docs/quickstart"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-[#171717] px-4 text-[14px] font-medium leading-5 text-white transition hover:bg-[#4d4d4d] dark:bg-[#ededed] dark:text-black dark:hover:bg-white"
                >
                  Read Docs
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="https://github.com/LioRael/lenso-examples"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-[#00000024] bg-white px-4 text-[14px] font-medium leading-5 text-[#171717] transition hover:bg-[#fafafa] dark:border-[#ffffff24] dark:bg-black dark:text-[#ededed] dark:hover:bg-[#1a1a1a] sm:hidden"
                >
                  View Examples
                  <GitBranch className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-7 max-w-[560px] text-[20px] leading-8 text-[#4d4d4d] dark:text-[#a0a0a0]">
                Like Rails for business apps, but agent-ready: one deployable Rust
                host, explicit modules, checks, and Runtime Console proof.
              </p>
            </div>

            <HeroFrameworkDemo />
          </div>
        </section>

        <HomeLowerSections />
      </main>
    </>
  );
}
