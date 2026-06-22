const proofSteps = [
  {
    index: '01',
    title: 'Scaffold',
    text: 'A host appears with modules, routes, and console wiring in place.',
  },
  {
    index: '02',
    title: 'Attach',
    text: 'Remote modules describe their dependencies before they can surprise the host.',
  },
  {
    index: '03',
    title: 'Inspect',
    text: 'Every install leaves a diff, proof log, and review surface.',
  },
  {
    index: '04',
    title: 'Ship',
    text: 'Humans and agents work from the same runtime facts.',
  },
];

const contractRows = [
  ['01', 'Host contract', 'Routes, config, auth surface, and console mount stay explicit in the generated shell.', 'host.toml'],
  ['02', 'Module contract', 'Manifest, dependencies, and remote stories become a reviewable install unit.', 'module.toml'],
  ['03', 'Agent proof', 'Scaffold, diff, smoke check, and release evidence live beside the runtime.', 'proof.log'],
];

const labelClass =
  'mb-[30px] font-mono text-xs font-[560] uppercase leading-4 tracking-normal text-[#858585]';

const proofStepClass =
  "relative min-h-[156px] pr-16 pt-3 max-[720px]:min-h-0 max-[720px]:border-t max-[720px]:border-[var(--site-border)] max-[720px]:py-[22px] max-[720px]:pr-0 max-[720px]:first:border-t-0 max-[720px]:after:hidden";

const proofDividerClass =
  "after:absolute after:bottom-0 after:right-[27px] after:top-0 after:w-px after:bg-[rgb(0_0_0_/_12%)] after:content-['']";

const contractRowClass =
  "relative h-[78px] before:absolute before:left-10 before:right-10 before:top-0 before:h-px before:bg-[rgb(0_0_0_/_12%)] before:content-[''] max-[720px]:grid max-[720px]:h-auto max-[720px]:gap-2.5 max-[720px]:p-5 max-[720px]:py-6 max-[720px]:before:left-5 max-[720px]:before:right-5";

export function HomeLowerSections() {
  return (
    <>
      <section className="relative after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-[min(1248px,calc(100%-32px))] after:-translate-x-1/2 after:bg-[rgb(0_0_0_/_12%)] after:content-['']">
        <div className="mx-auto max-w-[1248px] pb-[71px] pt-12 max-[1320px]:px-6 max-[720px]:px-[18px]">
          <p className={labelClass}>
            What changes when the runtime is legible
          </p>
          <div className="mt-7 grid grid-cols-4 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1">
            {proofSteps.map((step, index) => (
              <article
                className={`${proofStepClass} ${
                  index < proofSteps.length - 1 ? proofDividerClass : ''
                } ${index === 1 ? 'max-[980px]:after:hidden' : ''}`}
                key={step.title}
              >
                <span className="mb-3 block font-mono text-[13px] font-[560] leading-[18px] text-[#9a9a9a]">
                  {step.index}
                </span>
                <h2 className="text-2xl font-semibold leading-[30px] text-[var(--site-ink)]">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-[22px] text-[#6a6a6a]">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[var(--site-surface)] after:absolute after:-bottom-px after:left-1/2 after:h-px after:w-[min(1248px,calc(100%-32px))] after:-translate-x-1/2 after:bg-[rgb(0_0_0_/_14%)] after:content-['']">
        <div className="mx-auto max-w-[1248px] pb-[18px] pt-[72px] max-[1320px]:px-6 max-[720px]:px-[18px]">
          <div className="grid grid-cols-[602px_536px] gap-[78px] max-[980px]:grid-cols-1 max-[980px]:gap-[34px]">
            <div>
              <p className={`${labelClass} mb-6`}>The surface</p>
              <h2 className="text-wrap text-[50px] font-semibold leading-[60px] tracking-normal text-[var(--site-ink)] max-[720px]:text-[38px] max-[720px]:leading-[44px]">
                One map for runtime ownership, module changes, and proof.
              </h2>
            </div>
            <div className="relative h-[343px] pt-0 max-[980px]:h-auto">
              <p className="absolute left-0 top-[53px] m-0 w-[485px] text-lg leading-[29px] text-[#666666] max-[980px]:static max-[980px]:w-auto">
                The design goal is boring in the best way: every important
                fact has a named place, a visible state, and a checkable
                trace.
              </p>
              <div className="absolute left-8 top-[165px] m-0 h-[178px] w-[536px] border border-[var(--site-border)] max-[980px]:relative max-[980px]:left-auto max-[980px]:top-auto max-[980px]:w-full">
                <div className="flex h-[58px] items-start justify-between border-b border-[var(--site-border)] px-6 pt-5">
                  <span className="font-mono text-[13px] font-[560] leading-[18px] text-[#555555]">
                    install proof
                  </span>
                  <code className="w-[190px] text-right font-mono text-[13px] leading-[18px] text-[#777777]">
                    my-lenso-app / modules / auth
                  </code>
                </div>
                <p className="absolute left-[33px] top-[85px] m-0 w-[446px] p-0 font-mono text-xs leading-4 text-[#333333] max-[720px]:left-4 max-[720px]:w-[calc(100%-32px)]">
                  <span className="mr-1.5 inline-block w-[42px] text-[#8a8a8a]">
                    01
                  </span>
                  <code>{'host_api = "console.v1"'}</code>
                </p>
                <p className="absolute left-[33px] top-[115px] m-0 w-[446px] p-0 font-mono text-xs leading-4 text-[#333333] max-[720px]:left-4 max-[720px]:w-[calc(100%-32px)]">
                  <span className="mr-1.5 inline-block w-[42px] text-[#8a8a8a]">
                    02
                  </span>
                  <code>{'depends_on = ["users"]'}</code>
                </p>
                <p className="absolute left-[23px] top-[138px] m-0 h-7 w-[456px] rounded bg-[var(--site-ink)] px-2.5 pt-[7px] font-mono text-xs leading-4 text-white max-[720px]:left-4 max-[720px]:w-[calc(100%-32px)]">
                  <span className="mr-1.5 inline-block w-[42px] text-white/70">
                    03
                  </span>
                  <code className="text-white">{'proof = "runtime-checks"'}</code>
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-[42px] h-[238px] border border-[rgb(0_0_0_/_12%)] bg-white max-[720px]:h-auto">
            {contractRows.map(([index, title, text, tag]) => (
              <div className={contractRowClass} key={title}>
                <span className="absolute left-10 top-8 w-[68px] font-mono text-xs font-[560] leading-4 text-[#8a8a8a] max-[720px]:static max-[720px]:w-auto">
                  {index}
                </span>
                <h3 className="absolute left-[158px] top-[27px] w-[250px] text-2xl font-semibold leading-8 text-[var(--site-ink)] max-[720px]:static max-[720px]:w-auto">
                  {title}
                </h3>
                <p className="absolute left-[480px] top-[30px] m-0 w-[405px] text-[15px] leading-6 text-[#666666] max-[720px]:static max-[720px]:w-auto">
                  {text}
                </p>
                <em className="absolute right-10 top-[26px] flex h-[42px] w-[220px] items-center justify-start rounded-full border border-[rgb(0_0_0_/_14%)] px-[22px] font-mono text-xs not-italic leading-4 text-[#333333] max-[720px]:static max-[720px]:w-auto max-[720px]:px-3">
                  {tag}
                </em>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
