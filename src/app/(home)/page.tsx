import Link from 'next/link';
import { HeroFrameworkDemo } from '@/components/hero-framework-demo';
import { HomeLowerSections } from '@/components/home-lower-sections';

const navLinkClass =
  'absolute top-[52px] text-sm font-medium leading-[18px] text-[var(--site-muted)] hover:text-[var(--site-ink)]';

export default function HomePage() {
  return (
    <>
      <header className="site-header relative top-0 z-40 h-[97px] bg-[var(--site-bg)] max-[720px]:h-[58px]">
        <nav
          className="relative mx-auto block h-[97px] max-w-[1248px] p-0 after:absolute after:left-0 after:top-24 after:h-px after:w-[1248px] after:bg-[var(--site-border)] after:content-[''] max-[720px]:h-[58px] max-[720px]:w-full max-[720px]:max-w-none max-[720px]:after:left-4 max-[720px]:after:top-[57px] max-[720px]:after:w-[calc(100%-32px)]"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="absolute left-0 top-[42px] block h-[30px] w-[398px] text-[var(--site-ink)] max-[720px]:left-4 max-[720px]:top-[15px] max-[720px]:w-[200px]"
          >
            <span
              className="site-logo-mark absolute left-0 top-0 flex h-7 w-7 items-center justify-center bg-[var(--site-ink)] font-mono text-[0px] font-semibold leading-[18px] text-transparent"
              aria-hidden="true"
            >
              L
            </span>
            <span className="absolute left-11 top-[3px] w-[120px] text-[21px] font-bold leading-7 tracking-normal text-[#111111]">
              Lenso
            </span>
            <span className="absolute left-32 top-[9px] w-[270px] font-mono text-[11px] font-normal leading-4 tracking-[0.48px] text-[#8b8b8b] max-[720px]:hidden">
              agent-ready modular app framework
            </span>
          </Link>
          <div className="block max-[720px]:hidden">
            <Link
              href="/docs"
              className={`${navLinkClass} left-[744px] w-[60px]`}
            >
              Docs
            </Link>
            <Link
              href="https://github.com/LioRael/lenso-examples"
              className={`${navLinkClass} left-[834px] w-[90px]`}
            >
              Examples
            </Link>
            <Link
              href="/docs/architecture"
              className={`${navLinkClass} left-[949px] w-[110px]`}
            >
              Architecture
            </Link>
            <Link
              href="/docs"
              className={`${navLinkClass} left-[1040px] w-[70px]`}
            >
              Releases
            </Link>
            <Link
              href="/docs/quickstart"
              className="absolute left-[1118px] top-[42px] h-[30px] w-[130px] rounded-full border border-[var(--site-border)] pt-[7px] text-center font-mono text-[11px] font-medium leading-4 text-[#555555] hover:text-[var(--site-ink)]"
            >
              cargo add lenso
            </Link>
          </div>
        </nav>
      </header>

      <main className="site-home min-h-[calc(100vh-56px)] bg-[var(--site-bg)] text-[var(--site-ink)]">
        <section className="relative after:absolute after:-bottom-px after:left-1/2 after:h-px after:w-[min(1248px,calc(100%-32px))] after:-translate-x-1/2 after:bg-[rgb(0_0_0_/_14%)] after:content-['']">
          <div className="mx-auto grid max-w-[1248px] grid-cols-[650px_586px] gap-3 pb-10 pt-[53px] max-[1320px]:grid-cols-[minmax(0,1fr)_minmax(460px,586px)] max-[1320px]:px-6 max-[980px]:grid-cols-1 max-[980px]:gap-[42px] max-[980px]:pt-16 max-[720px]:px-[18px] max-[720px]:pb-[52px] max-[720px]:pt-[50px]">
            <div className="max-w-[650px] pt-4 max-[720px]:min-w-0 max-[720px]:max-w-full">
              <div className="mb-[30px] ml-px flex items-center gap-2 font-mono text-xs font-[560] uppercase leading-4 tracking-normal text-[#555555]">
                Lenso / Runtime contracts
              </div>
              <h1 className="text-wrap text-[68px] font-[560] leading-[76px] tracking-normal text-[#080808] max-[720px]:max-w-full max-[720px]:break-words max-[720px]:text-[42px] max-[720px]:leading-[48px]">
                Build modular Rust apps that remain inspectable.
              </h1>
              <p className="ml-1 mt-8 max-w-[560px] text-[19px] leading-[30px] text-[#5b5b5b]">
                Lenso gives every host, module, and runtime console one shared
                contract surface. Agents can scaffold it; humans can audit it.
              </p>

              <div className="ml-1 mt-[78px] flex flex-wrap items-center gap-3 max-[720px]:mt-6">
                <div
                  className="relative h-[54px] w-[520px] max-w-full overflow-hidden rounded-full border border-[rgb(0_0_0_/_15%)] bg-[var(--site-surface)] p-0 font-mono text-[13px] leading-5 text-[var(--site-ink)] max-[720px]:w-full"
                  aria-label="Lenso host init command"
                >
                  <span className="absolute left-2 top-2 inline-flex h-[38px] w-[126px] min-w-0 items-center justify-center rounded-full bg-[var(--site-ink)] font-sans text-[13px] font-semibold text-white">
                    Start host
                  </span>
                  <span className="absolute left-[164px] top-[18px] w-4 font-semibold leading-[18px] text-[#555555] max-[720px]:left-[136px]">
                    $
                  </span>
                  <code className="absolute left-[186px] top-[18px] w-[270px] overflow-hidden text-ellipsis whitespace-nowrap leading-[18px] text-[#222222] max-[720px]:left-[154px] max-[720px]:right-4 max-[720px]:w-auto">
                    lenso new ops-host --with console
                  </code>
                  <span className="absolute left-[470px] top-[19px] w-10 text-xs leading-4 text-[#777777] max-[720px]:hidden">
                    copy
                  </span>
                </div>
              </div>

              <div
                className="ml-1 mt-10 grid grid-cols-[120px_370px] items-start gap-1 text-[15px] leading-[23px] text-[var(--site-muted)] max-[720px]:ml-0 max-[720px]:grid-cols-1"
                aria-label="Lenso proof points"
              >
                <strong className="pt-2.5 font-mono text-xs font-[560] leading-4 text-[#8a8a8a]">
                  The promise
                </strong>
                <span className="pl-0 text-[#666666]">
                  No invisible runtime glue. No separate proof story. The
                  system map is the product.
                </span>
              </div>
            </div>

            <HeroFrameworkDemo />
          </div>
        </section>

        <HomeLowerSections />
      </main>
    </>
  );
}
