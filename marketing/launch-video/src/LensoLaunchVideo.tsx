import {Audio} from "@remotion/media";
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";

const fps = 30;
const totalFrames = 42 * fps;
const ink = "#11110f";
const paper = "#f5f4f0";
const muted = "#74736d";
const rule = "#d3d2cc";
const font = "Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
const mono = "'SFMono-Regular', 'SF Mono', Menlo, Consolas, monospace";
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const scenes = {
  brief: {from: 0, duration: 105},
  scaffold: {from: 105, duration: 105},
  declaration: {from: 210, duration: 180},
  ticket: {from: 390, duration: 270},
  source: {from: 660, duration: 180},
  smoke: {from: 840, duration: 150},
  install: {from: 990, duration: 120},
  thesis: {from: 1110, duration: 90},
  end: {from: 1200, duration: 60},
} as const;

export function LensoLaunchVideo() {
  return (
    <AbsoluteFill style={{backgroundColor: ink, color: paper, fontFamily: font}}>
      <Audio
        src={staticFile("audio/lenso-intro.wav")}
        volume={(frame) => interpolate(frame, [0, 24, totalFrames - 45, totalFrames], [0, 0.72, 0.72, 0], clamp)}
      />
      <Sequence {...scenes.brief}><BriefScene duration={scenes.brief.duration} /></Sequence>
      <Sequence {...scenes.scaffold}><ScaffoldScene duration={scenes.scaffold.duration} /></Sequence>
      <Sequence {...scenes.declaration}><DeclarationScene duration={scenes.declaration.duration} /></Sequence>
      <Sequence {...scenes.ticket}><TicketFlowScene duration={scenes.ticket.duration} /></Sequence>
      <Sequence {...scenes.source}><SourceScene duration={scenes.source.duration} /></Sequence>
      <Sequence {...scenes.smoke}><SmokeScene duration={scenes.smoke.duration} /></Sequence>
      <Sequence {...scenes.install}><InstallScene duration={scenes.install.duration} /></Sequence>
      <Sequence {...scenes.thesis}><ThesisScene duration={scenes.thesis.duration} /></Sequence>
      <Sequence {...scenes.end}><EndCard duration={scenes.end.duration} /></Sequence>
    </AbsoluteFill>
  );
}

export function LensoSocialCut() {
  const duration = 15 * fps;
  return (
    <AbsoluteFill style={{backgroundColor: ink, color: paper, fontFamily: font}}>
      <Audio
        src={staticFile("audio/lenso-intro.wav")}
        volume={(frame) => interpolate(frame, [0, 12, duration - 18, duration], [0, 0.78, 0.78, 0], clamp)}
      />
      <Sequence from={0} durationInFrames={75}><BriefScene duration={75} compact /></Sequence>
      <Sequence from={75} durationInFrames={105}><DeclarationScene duration={105} compact /></Sequence>
      <Sequence from={180} durationInFrames={150}><TicketFlowScene duration={150} compact /></Sequence>
      <Sequence from={330} durationInFrames={60}><SmokeScene duration={60} compact /></Sequence>
      <Sequence from={390} durationInFrames={60}><SocialEndCard duration={60} /></Sequence>
    </AbsoluteFill>
  );
}

function BriefScene({duration, compact = false}: {duration: number; compact?: boolean}) {
  const frame = useCurrentFrame();
  const prompt = "Build a support ticket module for a Lenso app.";
  const visible = Math.max(0, Math.floor((frame - 10) / (compact ? 0.74 : 0.9)));
  return (
    <AbsoluteFill style={{backgroundColor: ink, opacity: cutOpacity(frame, duration), padding: "82px 92px"}}>
      <Eyebrow dark>PRODUCT BRIEF</Eyebrow>
      <div style={{fontSize: compact ? 76 : 88, fontWeight: 500, letterSpacing: -4.8, lineHeight: 1.04, marginTop: 176, maxWidth: 1540}}>
        {prompt.slice(0, visible)}
        <span style={{backgroundColor: paper, display: "inline-block", height: 82, marginLeft: 8, opacity: Math.floor(frame / 14) % 2 === 0 ? 0.9 : 0, translate: "0 12px", width: 3}} />
      </div>
      <div style={{backgroundColor: "#3b3a35", bottom: 82, height: 1, left: 92, position: "absolute", right: 92}} />
    </AbsoluteFill>
  );
}

function ScaffoldScene({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const command = "lenso module create support --with-console";
  const visible = Math.max(0, Math.floor((frame - 8) / 0.68));
  return (
    <AbsoluteFill style={{backgroundColor: paper, color: ink, opacity: cutOpacity(frame, duration), padding: "76px 92px"}}>
      <Eyebrow>01 / SCAFFOLD</Eyebrow>
      <div style={{fontFamily: mono, fontSize: 46, marginTop: 190, whiteSpace: "pre"}}>
        <span style={{color: muted, marginRight: 20}}>$</span>{command.slice(0, visible)}
      </div>
      <div style={{borderTop: `1px solid ${rule}`, display: "grid", fontFamily: mono, fontSize: 28, gap: 22, gridTemplateColumns: "1fr 1fr", marginTop: 110, paddingTop: 32}}>
        <span>modules/support-ticket</span><span style={{color: muted}}>business capability</span>
        <span>lenso.module.json</span><span style={{color: muted}}>explicit contract</span>
        <span>console surface</span><span style={{color: muted}}>operations included</span>
      </div>
    </AbsoluteFill>
  );
}

function DeclarationScene({duration, compact = false}: {duration: number; compact?: boolean}) {
  const frame = useCurrentFrame();
  const rows = [
    ["HTTP", "GET · POST · PATCH /tickets"],
    ["ADMIN", "assign_ticket"],
    ["RUNTIME", "support-ticket.escalate-ticket.v1"],
    ["CONSOLE", "tickets data surface"],
  ];
  return (
    <AbsoluteFill style={{backgroundColor: paper, color: ink, opacity: cutOpacity(frame, duration), padding: "72px 92px"}}>
      <Eyebrow>SUPPORT-TICKET · 0.1.0</Eyebrow>
      <div style={{fontSize: compact ? 64 : 76, fontWeight: 520, letterSpacing: -4, lineHeight: 1.02, marginTop: 22}}>
        One module declaration.
        <br />Four working surfaces.
      </div>
      <div style={{bottom: 70, left: 92, position: "absolute", right: 92}}>
        {rows.map(([kind, value], index) => (
          <div key={kind} style={{alignItems: "center", borderTop: `1px solid ${rule}`, display: "grid", gridTemplateColumns: "260px 1fr", opacity: interpolate(frame, [14 + index * 9, 26 + index * 9], [0, 1], clamp), padding: compact ? "17px 0" : "22px 0"}}>
            <span style={{color: muted, fontFamily: mono, fontSize: 22}}>{kind}</span>
            <span style={{fontFamily: mono, fontSize: compact ? 27 : 32}}>{value}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function TicketFlowScene({duration, compact = false}: {duration: number; compact?: boolean}) {
  const frame = useCurrentFrame();
  const phase = frame < duration / 3 ? 0 : frame < (duration * 2) / 3 ? 1 : 2;
  const actions = ["POST /tickets", "admin / assign_ticket", "runtime / escalate-ticket.v1"];
  const notes = ["created ticket_2", "assigned to alex", "priority high · escalated"];
  const state = [
    {assignee: "triage", priority: "normal", status: "open"},
    {assignee: "alex", priority: "normal", status: "open"},
    {assignee: "alex", priority: "high", status: "escalated"},
  ][phase];
  return (
    <AbsoluteFill style={{backgroundColor: ink, opacity: cutOpacity(frame, duration), padding: "76px 92px"}}>
      <div style={{alignItems: "baseline", display: "flex", justifyContent: "space-between"}}>
        <Eyebrow dark>REAL MODULE · REAL BEHAVIOR</Eyebrow>
        <div style={{color: "#8d8c85", fontFamily: mono, fontSize: 22}}>0{phase + 1} / 03</div>
      </div>
      <div style={{fontFamily: mono, fontSize: compact ? 32 : 38, marginTop: 92}}>{actions[phase]}</div>
      <div style={{fontSize: compact ? 56 : 68, fontWeight: 520, letterSpacing: -3.5, marginTop: 18}}>{notes[phase]}</div>
      <div style={{borderBottom: "1px solid #3b3a35", borderTop: "1px solid #3b3a35", display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", marginTop: 82, padding: "32px 0"}}>
        <TicketValue label="TICKET" value="ticket_2" />
        <TicketValue label="ASSIGNEE" value={state.assignee} changed={phase === 1} />
        <TicketValue label="PRIORITY" value={state.priority} changed={phase === 2} />
        <TicketValue label="STATUS" value={state.status} changed={phase === 2} />
      </div>
      <div style={{bottom: 70, color: "#aaa9a2", fontFamily: mono, fontSize: 26, position: "absolute"}}>Billing export failed</div>
    </AbsoluteFill>
  );
}

function TicketValue({label, value, changed = false}: {label: string; value: string; changed?: boolean}) {
  return (
    <div>
      <div style={{color: "#77766f", fontFamily: mono, fontSize: 19, letterSpacing: 1.2}}>{label}</div>
      <div style={{color: changed ? "#71d2af" : paper, fontFamily: mono, fontSize: 31, marginTop: 14}}>{value}</div>
    </div>
  );
}

function SourceScene({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const code = [
    ["name", '"support-ticket"'],
    ["capabilities", "read · write · escalate"],
    ["httpRoutes", "GET · POST · PATCH /tickets"],
    ["admin", "assign_ticket"],
    ["runtimeFunctions", "escalate-ticket.v1"],
  ];
  return (
    <AbsoluteFill style={{backgroundColor: paper, color: ink, opacity: cutOpacity(frame, duration), padding: "72px 92px"}}>
      <Eyebrow>EXPLICIT BY DESIGN</Eyebrow>
      <div style={{fontSize: 72, fontWeight: 520, letterSpacing: -3.8, marginTop: 22}}>The product shape is inspectable.</div>
      <div style={{borderTop: `1px solid ${rule}`, marginTop: 70}}>
        {code.map(([key, value], index) => (
          <div key={key} style={{borderBottom: `1px solid ${rule}`, display: "flex", fontFamily: mono, fontSize: 27, opacity: interpolate(frame, [14 + index * 8, 25 + index * 8], [0, 1], clamp), padding: "18px 0"}}>
            <span style={{color: muted, flex: "0 0 420px"}}>{key}</span><span>{value}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function SmokeScene({duration, compact = false}: {duration: number; compact?: boolean}) {
  const frame = useCurrentFrame();
  const passed = frame > (compact ? 14 : 42);
  return (
    <AbsoluteFill style={{backgroundColor: ink, opacity: cutOpacity(frame, duration), padding: "76px 92px"}}>
      <Eyebrow dark>FOCUSED CHECK</Eyebrow>
      <div style={{fontFamily: mono, fontSize: compact ? 31 : 38, marginTop: 180}}>
        <span style={{color: "#77766f", marginRight: 18}}>$</span>pnpm --filter @lenso/example-support-ticket smoke
      </div>
      <div style={{alignItems: "center", borderTop: "1px solid #3b3a35", display: "flex", fontSize: compact ? 50 : 64, fontWeight: 510, gap: 22, letterSpacing: -2.8, marginTop: 72, opacity: passed ? 1 : 0, paddingTop: 42}}>
        <span style={{color: "#71d2af"}}>✓</span> Support Ticket service smoke passed
      </div>
    </AbsoluteFill>
  );
}

function InstallScene({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: paper, color: ink, opacity: cutOpacity(frame, duration), padding: "76px 92px"}}>
      <Eyebrow>WHEN THE BOUNDARY IS READY</Eyebrow>
      <div style={{fontSize: 72, fontWeight: 520, letterSpacing: -3.8, lineHeight: 1.02, marginTop: 28}}>The same module can ship as a service.</div>
      <div style={{borderBottom: `1px solid ${rule}`, borderTop: `1px solid ${rule}`, fontFamily: mono, fontSize: 31, lineHeight: 1.55, marginTop: 130, padding: "34px 0"}}>
        lenso service install
        <br />http://127.0.0.1:4110/lenso/service/v1/manifest
      </div>
    </AbsoluteFill>
  );
}

function ThesisScene({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: "center", backgroundColor: ink, display: "flex", justifyContent: "center", opacity: cutOpacity(frame, duration), padding: "0 120px", textAlign: "center"}}>
      <div>
        <div style={{fontSize: 82, fontWeight: 500, letterSpacing: -4.5, lineHeight: 1.04}}>A business capability.<br />Structured, runnable, proven.</div>
        <div style={{color: "#8d8c85", fontFamily: mono, fontSize: 23, marginTop: 38}}>Agent-ready Rust business systems.</div>
      </div>
    </AbsoluteFill>
  );
}

function EndCard({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [5, 18, duration - 12, duration], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: "center", backgroundColor: ink, display: "flex", justifyContent: "center"}}>
      <div style={{alignItems: "center", display: "flex", flexDirection: "column", opacity}}>
        <Img src={staticFile("brand/lenso-wordmark.svg")} style={{filter: "invert(1)", height: 90, objectFit: "contain", width: 421}} />
        <div style={{color: "#9a9992", fontFamily: mono, fontSize: 22, marginTop: 28}}>lenso.dev</div>
      </div>
    </AbsoluteFill>
  );
}

function SocialEndCard({duration}: {duration: number}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [4, 14, duration - 10, duration], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: "center", backgroundColor: ink, display: "flex", justifyContent: "center"}}>
      <div style={{alignItems: "center", display: "flex", flexDirection: "column", opacity}}>
        <Img src={staticFile("brand/lenso-wordmark.svg")} style={{filter: "invert(1)", height: 82, objectFit: "contain", width: 384}} />
        <div style={{fontSize: 35, fontWeight: 460, letterSpacing: -1, marginTop: 28}}>Business capability in. Proven system out.</div>
      </div>
    </AbsoluteFill>
  );
}

function Eyebrow({children, dark = false}: {children: React.ReactNode; dark?: boolean}) {
  return <div style={{color: dark ? "#8d8c85" : muted, fontFamily: mono, fontSize: 21, fontWeight: 600, letterSpacing: 1.7}}>{children}</div>;
}

function cutOpacity(frame: number, duration: number) {
  return interpolate(frame, [0, 5, duration - 5, duration], [0, 1, 1, 0], clamp);
}
