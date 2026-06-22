const nodes = [
  {
    kind: 'host',
    label: '01',
    title: 'Host shell',
    text: 'routes, config, console mount',
    position: 'left-[58px] top-24 h-[118px] w-[190px]',
  },
  {
    kind: 'module',
    label: '02',
    title: 'Remote module',
    text: 'manifest, stories, dependencies',
    position: 'left-[314px] top-[138px] h-[124px] w-[214px]',
  },
  {
    kind: 'console',
    label: '03',
    title: 'Runtime console',
    text: 'status, evidence, update path',
    position: 'left-[98px] top-[326px] h-[124px] w-[220px]',
  },
  {
    kind: 'proof',
    label: '04',
    title: 'Proof log',
    text: 'smoke check output',
    position: 'left-[364px] top-[348px] h-[102px] w-[166px]',
  },
];

const nodeClass =
  'system-node absolute z-[1] min-h-0 rounded-lg border border-[rgb(0_0_0_/_16%)] bg-white px-[18px] py-4 max-[720px]:static max-[720px]:h-auto max-[720px]:w-auto';

const connectorClass =
  "absolute z-[1] max-[720px]:hidden after:absolute after:h-2 after:w-2 after:rounded-full after:bg-[var(--site-ink)] after:content-['']";

export function HeroFrameworkDemo() {
  return (
    <figure
      className="relative h-[540px] w-[586px] min-w-0 border-0 border-l border-t border-solid border-l-[rgb(0_0_0_/_10%)] border-t-[rgb(0_0_0_/_14%)] bg-[var(--site-bg)] shadow-[1px_0_0_rgb(0_0_0_/_10%),0_1px_0_rgb(0_0_0_/_14%)] before:pointer-events-none before:absolute before:left-10 before:top-[38px] before:z-0 before:h-[430px] before:w-[485px] before:bg-[repeating-linear-gradient(90deg,rgb(0_0_0_/_4%)_0_1px,transparent_1px_44px)] before:content-[''] after:pointer-events-none after:absolute after:left-7 after:top-[60px] after:z-0 after:h-[337px] after:w-[520px] after:bg-[repeating-linear-gradient(180deg,rgb(0_0_0_/_4%)_0_1px,transparent_1px_48px)] after:content-[''] max-[720px]:h-auto max-[720px]:w-full max-[720px]:p-4 max-[720px]:before:hidden max-[720px]:after:hidden"
      aria-label="Lenso host, module, console, and proof map"
    >
      <div className="absolute left-7 right-7 top-[26px] z-[1] block font-mono text-xs font-[560] uppercase leading-4 text-[#777777] max-[720px]:static max-[720px]:mb-4 max-[720px]:flex max-[720px]:justify-between">
        <span className="absolute left-0 top-0 w-[220px] max-[720px]:static">
          Shared contract surface
        </span>
        <span className="absolute right-0 top-0 w-[104px] font-normal normal-case text-[#555555] max-[720px]:static">
          verified path
        </span>
      </div>

      <div className="static max-[720px]:grid max-[720px]:gap-3">
        {nodes.map((node) => (
          <div
            className={`${nodeClass} system-node-${node.kind} ${node.position}`}
            key={node.label}
          >
            <span className="mb-2 block font-mono text-[11px] font-[560] leading-[14px] text-[#777777]">
              {node.label}
            </span>
            <h2 className="text-lg font-[560] leading-6 text-[var(--site-ink)]">
              {node.title}
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-[#5f5f5f]">
              {node.text}
            </p>
          </div>
        ))}
      </div>

      <span
        className={`${connectorClass} left-[248px] top-[153px] h-px w-[66px] bg-[rgb(0_0_0_/_22%)] after:-right-1 after:-top-1`}
      />
      <span
        className={`${connectorClass} left-[154px] top-[214px] h-28 w-px bg-[rgb(0_0_0_/_18%)] after:-bottom-1 after:-left-1`}
      />
      <span
        className={`${connectorClass} left-[432px] top-[262px] h-[86px] w-px bg-[rgb(0_0_0_/_18%)] after:-bottom-1 after:-left-1`}
      />
      <span
        className={`${connectorClass} left-[318px] top-[390px] h-px w-[46px] bg-[rgb(0_0_0_/_20%)] after:-right-1 after:-top-1`}
      />
      <p className="absolute left-[58px] top-[488px] m-0 w-[470px] text-[15px] leading-[23px] text-[#5d5d5d] max-[720px]:static max-[720px]:mt-4 max-[720px]:w-auto">
        A generated host and every remote module publish the same inspectable contract.
      </p>
    </figure>
  );
}
