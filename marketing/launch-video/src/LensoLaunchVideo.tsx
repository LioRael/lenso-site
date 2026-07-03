import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const scenes = [
  {
    eyebrow: "Lenso",
    headline: "Routes are not the product.",
    subline: "Lenso wraps Axum with modules, admin surfaces, contracts, and proof.",
    command: "Build Rust business apps that agents can safely change and prove.",
    visual: "rails",
    duration: 330,
  },
  {
    eyebrow: "Create",
    headline: "Start from a real app.",
    subline: "Launchpad creates the service shape before you edit code.",
    command: "lenso app create support-desk",
    visual: "home",
    duration: 360,
  },
  {
    eyebrow: "Compose",
    headline: "Every addon becomes a plan.",
    subline: "Services, modules, and generated state stay in one reviewable change.",
    command: "lenso app compose support-sla",
    visual: "plan",
    duration: 360,
  },
  {
    eyebrow: "Prove",
    headline: "Check the runtime before shipping.",
    subline: "Runtime Console turns generated work into visible evidence.",
    command: "lenso app verify",
    visual: "console",
    duration: 390,
  },
  {
    eyebrow: "Agent handoff",
    headline: "Agents get context, not guesses.",
    subline: "Skills, manifests, plans, and proof define the next safe change.",
    command: "lenso agent task from-plan",
    visual: "handoff",
    duration: 360,
  },
] as const;

type Scene = (typeof scenes)[number];

const starts = scenes.reduce<number[]>((acc, scene, index) => {
  acc.push(index === 0 ? 0 : acc[index - 1] + scenes[index - 1].duration);
  return acc;
}, []);

export function LensoLaunchVideo() {
  return (
    <AbsoluteFill style={{ background: ink, color: bone, fontFamily }}>
      <BackgroundGrid />
      {scenes.map((scene, index) => (
        <Sequence durationInFrames={scene.duration} from={starts[index]} key={scene.headline}>
          <SceneFrame scene={scene} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

function SceneFrame({ scene }: { scene: Scene }) {
  const frame = useCurrentFrame();
  const opacity =
    progress(frame, 0, 24) *
    interpolate(frame, [scene.duration - 22, scene.duration], [1, 0], clamp);

  if (scene.visual === "console") {
    return <ConsoleSceneFrame opacity={opacity} scene={scene} />;
  }

  return (
    <AbsoluteFill
      style={{
        opacity,
        padding: "88px 96px",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: 58,
          gridTemplateColumns: "0.78fr 1.22fr",
          height: "100%",
        }}
      >
        <CopyBlock scene={scene} />
        <Visual type={scene.visual} />
      </div>
    </AbsoluteFill>
  );
}

function ConsoleSceneFrame({ opacity, scene }: { opacity: number; scene: Scene }) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ opacity, padding: "70px 84px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 30, height: "100%" }}>
        <div
          style={{
            alignItems: "end",
            display: "grid",
            gap: 42,
            gridTemplateColumns: "1fr 520px",
          }}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                color: moss,
                fontSize: 32,
                fontWeight: 780,
                letterSpacing: 0,
                opacity: progress(frame, 4, 24),
                textTransform: "uppercase",
                translate: `0 ${slide(frame, 4, 24)}px`,
              }}
            >
              {scene.eyebrow}
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 840,
                letterSpacing: 0,
                lineHeight: 0.98,
                opacity: progress(frame, 12, 30),
                translate: `0 ${slide(frame, 12, 30)}px`,
              }}
            >
              {scene.headline}
            </div>
          </div>
          <CommandBlock command={scene.command} />
        </div>

        <div
          style={{
            alignItems: "stretch",
            display: "grid",
            flex: 1,
            gap: 28,
            gridTemplateColumns: "1fr 390px",
            minHeight: 0,
          }}
        >
          <ConsoleShot />
          <ConsoleCallouts />
        </div>
      </div>
    </AbsoluteFill>
  );
}

function CopyBlock({ scene }: { scene: Scene }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 34,
        minWidth: 0,
      }}
    >
      <div
        style={{
          color: moss,
          fontSize: 34,
          fontWeight: 760,
          letterSpacing: 0,
          opacity: progress(frame, 4, 24),
          textTransform: "uppercase",
          translate: `0 ${slide(frame, 4, 24)}px`,
        }}
      >
        {scene.eyebrow}
      </div>
      <div
        style={{
          fontSize: 98,
          fontWeight: 820,
          letterSpacing: 0,
          lineHeight: 0.98,
          opacity: progress(frame, 12, 30),
          textWrap: "balance",
          translate: `0 ${slide(frame, 12, 30)}px`,
        }}
      >
        {scene.headline}
      </div>
      <div
        style={{
          color: fog,
          fontSize: 42,
          lineHeight: 1.24,
          maxWidth: 770,
          opacity: progress(frame, 24, 34),
          textWrap: "balance",
          translate: `0 ${slide(frame, 24, 34)}px`,
        }}
      >
        {scene.subline}
      </div>
      <CommandBlock command={scene.command} />
    </div>
  );
}

function CommandBlock({ command }: { command: string }) {
  const frame = useCurrentFrame();
  const isCli = command.startsWith("lenso ");

  return (
    <div
      style={{
        background: "#050605",
        border: `1px solid ${line}`,
        borderRadius: 18,
        boxShadow: "0 24px 70px rgba(0,0,0,0.34)",
        color: "#f5f0e6",
        fontFamily: monoFont,
        fontSize: isCli && command.length > 30 ? 24 : command.length > 50 ? 25 : 31,
        lineHeight: 1.32,
        opacity: progress(frame, 40, 30),
        padding: "24px 28px",
        translate: `0 ${slide(frame, 40, 30)}px`,
        whiteSpace: isCli ? "nowrap" : "normal",
      }}
    >
      {isCli ? <span style={{ color: "#9aa49a" }}>$ </span> : null}
      {command}
    </div>
  );
}

function Visual({ type }: { type: Scene["visual"] }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        opacity: progress(frame, 28, 34),
        scale: interpolate(frame, [28, 66], [0.975, 1], {
          ...clamp,
          easing: ease,
        }),
        translate: `0 ${slide(frame, 28, 34)}px`,
      }}
    >
      {type === "rails" ? <RailsVisual /> : null}
      {type === "home" ? <ScreenshotVisual image="home" /> : null}
      {type === "plan" ? <PlanVisual /> : null}
      {type === "handoff" ? <HandoffVisual /> : null}
    </div>
  );
}

function RailsVisual() {
  return (
    <DisplayPanel>
      <div style={{ display: "grid", gap: 20 }}>
        {[
          ["Axum", "routes"],
          ["Lenso", "modules"],
          ["Lenso", "admin APIs"],
          ["Lenso", "proof"],
        ].map(([label, value], index) => (
          <RailRow index={index} key={value} label={label} value={value} />
        ))}
      </div>
    </DisplayPanel>
  );
}

function RailRow({ index, label, value }: { index: number; label: string; value: string }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        alignItems: "center",
        background: index === 0 ? "rgba(255,255,255,0.05)" : "rgba(68,173,116,0.12)",
        border: `1px solid ${index === 0 ? line : "rgba(91,211,138,0.32)"}`,
        borderRadius: 18,
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        minHeight: 92,
        opacity: progress(frame, 42 + index * 10, 24),
        padding: "0 28px",
        translate: `0 ${slide(frame, 42 + index * 10, 24)}px`,
      }}
    >
      <span style={{ color: index === 0 ? fog : moss, fontSize: 30, fontWeight: 760 }}>
        {label}
      </span>
      <span style={{ fontSize: 46, fontWeight: 820 }}>{value}</span>
    </div>
  );
}

function ScreenshotVisual({ image }: { image: "home" | "console" }) {
  const src =
    image === "home"
      ? staticFile("screenshots/lenso-home-desktop.png")
      : staticFile("screenshots/lenso-console-launchpad.png");

  return (
    <DisplayPanel>
      <div
        style={{
          background: "#101311",
          border: `1px solid ${line}`,
          borderRadius: 20,
          overflow: "hidden",
          padding: 12,
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 8,
            height: 34,
            padding: "0 8px 10px",
          }}
        >
          <Dot color="#ff6b5d" />
          <Dot color="#f2c14e" />
          <Dot color="#59c878" />
        </div>
        <Img
          src={src}
          style={{
            borderRadius: 12,
            display: "block",
            height: image === "home" ? 570 : 560,
            objectFit: "cover",
            objectPosition: image === "home" ? "left top" : "center top",
            width: "100%",
          }}
        />
      </div>
    </DisplayPanel>
  );
}

function ConsoleShot() {
  return (
    <div
      style={{
        background: "#111612",
        border: `1px solid ${lineStrong}`,
        borderRadius: 32,
        boxShadow: "0 34px 120px rgba(0,0,0,0.48)",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        overflow: "hidden",
        padding: 16,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 9,
          height: 34,
          padding: "0 8px 12px",
        }}
      >
        <Dot color="#ff6b5d" />
        <Dot color="#f2c14e" />
        <Dot color="#59c878" />
        <span style={{ color: fog, fontFamily: monoFont, fontSize: 20, marginLeft: 14 }}>
          Runtime Console / Launchpad
        </span>
      </div>
      <Img
        src={staticFile("screenshots/lenso-console-launchpad.png")}
        style={{
          background: "#f7f7f5",
          borderRadius: 16,
          display: "block",
          flex: 1,
          minHeight: 0,
          objectFit: "contain",
          objectPosition: "center",
          width: "100%",
        }}
      />
    </div>
  );
}

function ConsoleCallouts() {
  const frame = useCurrentFrame();
  const callouts = [
    ["Lifecycle", "ready / attention"],
    ["Doctor", "next command"],
    ["Proof", "visible evidence"],
  ];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {callouts.map(([label, value], index) => (
        <div
          key={label}
          style={{
            background: index === 0 ? "rgba(115,224,155,0.16)" : "rgba(255,255,255,0.055)",
            border: `1px solid ${index === 0 ? "rgba(115,224,155,0.42)" : lineStrong}`,
            borderRadius: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: progress(frame, 48 + index * 12, 24),
            padding: "0 28px",
            translate: `0 ${slide(frame, 48 + index * 12, 24)}px`,
          }}
        >
          <div style={{ color: moss, fontSize: 28, fontWeight: 780 }}>{label}</div>
          <div style={{ fontSize: 40, fontWeight: 840, lineHeight: 1.05, marginTop: 10 }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanVisual() {
  const frame = useCurrentFrame();
  const steps = ["add support-sla", "wire customer profile", "write app-change-plan.json"];

  return (
    <DisplayPanel>
      <div style={{ display: "grid", gap: 22 }}>
        <div style={{ color: moss, fontFamily: monoFont, fontSize: 28 }}>app-change-plan.json</div>
        {steps.map((step, index) => (
          <div
            key={step}
            style={{
              background: "rgba(255,255,255,0.055)",
              border: `1px solid ${line}`,
              borderRadius: 18,
              display: "grid",
              gap: 10,
              opacity: progress(frame, 54 + index * 12, 24),
              padding: "24px 28px",
              translate: `0 ${slide(frame, 54 + index * 12, 24)}px`,
            }}
          >
            <div style={{ color: fog, fontFamily: monoFont, fontSize: 26 }}>step {index + 1}</div>
            <div style={{ fontSize: 42, fontWeight: 800 }}>{step}</div>
          </div>
        ))}
      </div>
    </DisplayPanel>
  );
}

function HandoffVisual() {
  const frame = useCurrentFrame();
  const nodes = ["skills", "manifest", "plan", "proof"];

  return (
    <DisplayPanel>
      <div style={{ display: "grid", gap: 26 }}>
        {nodes.map((node, index) => (
          <div
            key={node}
            style={{
              alignItems: "center",
              display: "grid",
              gap: 18,
              gridTemplateColumns: "58px 1fr",
              opacity: progress(frame, 52 + index * 10, 22),
              translate: `0 ${slide(frame, 52 + index * 10, 22)}px`,
            }}
          >
            <div
              style={{
                alignItems: "center",
                background: moss,
                borderRadius: 999,
                color: ink,
                display: "flex",
                fontSize: 28,
                fontWeight: 860,
                height: 58,
                justifyContent: "center",
                width: 58,
              }}
            >
              {index + 1}
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.055)",
                border: `1px solid ${line}`,
                borderRadius: 18,
                fontSize: 44,
                fontWeight: 820,
                padding: "22px 28px",
              }}
            >
              {node}
            </div>
          </div>
        ))}
      </div>
    </DisplayPanel>
  );
}

function DisplayPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: panel,
        border: `1px solid ${lineStrong}`,
        borderRadius: 34,
        boxShadow: "0 34px 120px rgba(0,0,0,0.48)",
        overflow: "hidden",
        padding: 30,
      }}
    >
      {children}
    </div>
  );
}

function BackgroundGrid() {
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(244,238,226,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(244,238,226,0.04) 1px, transparent 1px)",
        backgroundSize: "54px 54px",
        opacity: 0.58,
      }}
    />
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{ background: color, borderRadius: 999, height: 12, width: 12 }} />;
}

function progress(frame: number, start: number, duration: number) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: ease,
  });
}

function slide(frame: number, start: number, duration: number) {
  return interpolate(frame, [start, start + duration], [26, 0], {
    ...clamp,
    easing: ease,
  });
}

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const ink = "#080a08";
const bone = "#f6f0e6";
const fog = "#babfb8";
const moss = "#73e09b";
const line = "rgba(246,240,230,0.14)";
const lineStrong = "rgba(246,240,230,0.2)";
const panel = "rgba(16,20,17,0.92)";
const fontFamily =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const monoFont =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
