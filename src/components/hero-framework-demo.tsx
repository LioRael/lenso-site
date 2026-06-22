import { Check, ChevronDown, FileCode2, Folder, Terminal } from 'lucide-react';

const files = [
  ['0s', 'lenso.toml'],
  ['0.35s', 'crates/app-api/'],
  ['0.7s', 'crates/app-worker/'],
  ['1.05s', 'modules/support-ticket/'],
  ['1.4s', 'manifest.toml'],
  ['1.75s', 'console/'],
];

const checks = [
  ['2.1s', 'module manifest'],
  ['2.45s', 'admin data surface'],
  ['2.8s', 'runtime story'],
  ['3.15s', '/console proof'],
];

export function HeroFrameworkDemo() {
  return (
    <div className="relative hidden min-h-[430px] lg:block" aria-label="Animated Lenso framework demo">
      <div className="absolute left-[8%] top-[22%] h-8 w-[35%] border border-[#c9c9c9] bg-white/60 dark:border-[#454545] dark:bg-black/60" />
      <div className="absolute left-[20%] top-[41%] h-8 w-[18%] border border-[#c9c9c9] bg-white/70 dark:border-[#454545] dark:bg-black/70" />
      <div className="absolute right-[4%] top-[41%] h-8 w-[22%] border border-[#c9c9c9] bg-white/60 dark:border-[#454545] dark:bg-black/60" />
      <div className="absolute right-[4%] top-[60%] h-8 w-[27%] border border-[#e6e6e6] bg-white/40 dark:border-[#292929] dark:bg-black/40" />
      <div className="absolute right-[24%] top-[23%] h-32 w-32 rotate-[38deg] border-t border-l border-[#c9c9c9] dark:border-[#454545]" />

      <div className="absolute left-[38%] top-[40%] w-[260px] -translate-y-1/2 overflow-hidden rounded-[8px] border border-[#ebebeb] bg-white shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)] dark:border-[#2e2e2e] dark:bg-[#0a0a0a]">
        <div className="flex h-11 items-center justify-between border-b border-[#ebebeb] px-4 dark:border-[#2e2e2e]">
          <div className="flex items-center gap-2 text-[14px] font-medium leading-5 text-[#171717] dark:text-[#ededed]">
            <Folder className="size-4" aria-hidden="true" />
            lenso-app/
          </div>
          <ChevronDown className="size-4 text-[#7d7d7d]" aria-hidden="true" />
        </div>
        <div className="grid gap-3 p-4">
          {files.map(([delay, file]) => (
            <div
              key={file}
              className="lenso-demo-row flex items-center gap-2 text-[13px] leading-5 text-[#4d4d4d] dark:text-[#a0a0a0]"
              style={{ animationDelay: delay }}
            >
              <FileCode2 className="size-4 text-[#8f8f8f]" aria-hidden="true" />
              {file}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute left-[38%] top-[65%] w-[260px] overflow-hidden rounded-[8px] border border-[#ebebeb] bg-white shadow-[0_18px_45px_-30px_rgba(0,0,0,0.45)] dark:border-[#2e2e2e] dark:bg-[#0a0a0a]">
        <div className="flex h-11 items-center gap-2 border-b border-[#ebebeb] px-4 font-mono text-[13px] leading-5 text-[#171717] dark:border-[#2e2e2e] dark:text-[#ededed]">
          <Terminal className="size-4 text-[#7d7d7d]" aria-hidden="true" />
          lenso module create support
        </div>
        <div className="grid gap-2 p-4">
          {checks.map(([delay, check]) => (
            <div
              key={check}
              className="lenso-demo-row flex items-center gap-2 text-[13px] leading-5 text-[#4d4d4d] dark:text-[#a0a0a0]"
              style={{ animationDelay: delay }}
            >
              <Check className="size-4 text-[#171717] dark:text-[#ededed]" aria-hidden="true" />
              {check}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .lenso-demo-row {
          opacity: .35;
          transform: translateY(0);
          animation: lenso-demo-in 4.8s cubic-bezier(.16,1,.3,1) infinite;
        }

        @keyframes lenso-demo-in {
          0%, 8% {
            opacity: .35;
            transform: translateY(0);
          }
          18%, 78% {
            opacity: 1;
            transform: translateY(0);
          }
          90%, 100% {
            opacity: .35;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lenso-demo-row {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
