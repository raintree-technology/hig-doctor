import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import reportData from "./data/report-data.json";

/* ── Design Tokens ───────────────────────────────────────────────────── */

const S = { xs: 6, sm: 12, md: 20, lg: 32, xl: 48, xxl: 64 };

const palette = {
  bg: "#0a0b0e",
  fg: "#f5f5f7",
  secondary: "rgba(245, 245, 247, 0.68)",
  tertiary: "rgba(245, 245, 247, 0.42)",
  card: "rgba(28, 30, 38, 0.58)",
  border: "rgba(255, 255, 255, 0.08)",
  borderSubtle: "rgba(255, 255, 255, 0.05)",
  green: "#8fbf9a",
  blue: "#8faabf",
  amber: "#bfaa8f",
  purple: "#a68fbf",
  rose: "#bf8f9a",
  cyan: "#8fbfb5",
};

const font = {
  ui: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif",
  mono: "SF Mono, SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, monospace",
};

const cardStyle = {
  background: palette.card,
  border: `1px solid ${palette.border}`,
  borderRadius: 24,
  backdropFilter: "blur(32px) saturate(140%)",
  boxShadow: "0 0 0 0.5px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12), 0 12px 32px rgba(0,0,0,0.22)",
};

const pill = {
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${palette.borderSubtle}`,
  borderRadius: 14,
};

/* ── Page wrapper — fills the 1080x1920 frame ────────────────────────── */

const Page = ({ children }) => (
  <AbsoluteFill
    style={{
      padding: `${S.xxl}px ${S.xl}px 90px`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {children}
    </div>
  </AbsoluteFill>
);

/* ── Backdrop ────────────────────────────────────────────────────────── */

const Backdrop = () => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 100) * 10;
  const dy = Math.cos(frame / 110) * 8;

  return (
    <AbsoluteFill style={{ background: palette.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -40,
          transform: `translate(${dx}px, ${dy}px) scale(1.02)`,
          backgroundImage: `url(${staticFile("orchard.png")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(60%) contrast(85%) brightness(50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(10,11,14,0.80) 0%, rgba(10,11,14,0.88) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ── Footer ──────────────────────────────────────────────────────────── */

const BrandFooter = () => (
  <div
    style={{
      position: "absolute",
      left: S.xl,
      right: S.xl,
      bottom: S.lg,
      ...cardStyle,
      borderRadius: 16,
      padding: `${S.sm}px ${S.md}px`,
      background: "rgba(18, 20, 26, 0.72)",
      display: "flex",
      alignItems: "center",
      gap: S.md,
    }}
  >
    <Img
      src={staticFile("raintree-icon.png")}
      style={{ width: 26, height: 26, objectFit: "contain", filter: "invert(1) opacity(0.72)" }}
    />
    <span style={{ fontFamily: font.ui, fontSize: 18, fontWeight: 500, color: palette.secondary }}>
      Raintree Technology
    </span>
    <span style={{ flex: 1 }} />
    <span style={{ fontFamily: font.mono, fontSize: 15, color: palette.tertiary }}>
      raintree.technology
    </span>
  </div>
);

/* ── Scene 1: Intro ──────────────────────────────────────────────────── */

const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const project = reportData.project;
  const total = project.totals.positives + project.totals.patterns + project.totals.concerns;

  const h = spring({ frame, fps, config: { damping: 200 } });
  const sub = spring({ frame, fps, delay: 6, config: { damping: 200 } });
  const term = spring({ frame, fps, delay: 14, config: { damping: 200 } });

  const lines = [
    { t: "$ bun run audit ./my-app", c: palette.fg },
    { t: "", c: "transparent" },
    { t: `Scanning ${project.files.code} code + ${project.files.style} style files...`, c: palette.tertiary },
    { t: "", c: "transparent" },
    { t: `  HIG Audit   ${project.score}/100  Excellent`, c: palette.green },
    { t: `  ${project.frameworks.join(", ")}  ·  ${total} detections`, c: palette.secondary },
    { t: "", c: "transparent" },
    { t: `  ${project.totals.positives} positives   ${project.totals.patterns} patterns   ${project.totals.concerns} concerns`, c: palette.secondary },
  ];

  return (
    <Page>
      {/* Kicker */}
      <div
        style={{
          fontFamily: font.ui, fontSize: 18, fontWeight: 600, color: palette.blue,
          textTransform: "uppercase", letterSpacing: "0.12em",
          opacity: h, transform: `translateY(${interpolate(h, [0, 1], [12, 0])}px)`,
        }}
      >
        HIG Audit — Universal Scanner
      </div>

      {/* Headline */}
      <div
        style={{
          fontFamily: font.ui, fontSize: 88, fontWeight: 600, color: palette.fg,
          lineHeight: 0.94, letterSpacing: "-0.03em", marginTop: S.lg,
          whiteSpace: "pre-line",
          opacity: h, transform: `translateY(${interpolate(h, [0, 1], [16, 0])}px)`,
        }}
      >
        {"349 rules.\n12 frameworks.\nOne score."}
      </div>

      {/* Subhead */}
      <div
        style={{
          fontFamily: font.ui, fontSize: 28, color: palette.secondary,
          lineHeight: 1.36, marginTop: S.lg,
          opacity: sub, transform: `translateY(${interpolate(sub, [0, 1], [8, 0])}px)`,
        }}
      >
        Scans code, stylesheets, and config for Apple HIG compliance across
        accessibility, color systems, typography, dark mode, layout, and motion.
      </div>

      {/* Stat pills */}
      <div
        style={{
          display: "flex", gap: S.sm, marginTop: S.xl, flexWrap: "wrap",
          opacity: sub,
        }}
      >
        {[
          { l: "Score", v: `${project.score}`, c: palette.green },
          { l: "Detections", v: String(total), c: palette.blue },
          { l: "Framework", v: project.frameworks[0] || "—", c: palette.amber },
          { l: "Categories", v: String(project.categories.length), c: palette.purple },
        ].map((s) => (
          <div key={s.l} style={{ ...pill, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.c }} />
            <span style={{ fontFamily: font.ui, fontSize: 18, color: palette.tertiary }}>{s.l}</span>
            <span style={{ fontFamily: font.ui, fontSize: 18, fontWeight: 600, color: palette.fg }}>{s.v}</span>
          </div>
        ))}
      </div>

      {/* Terminal */}
      <div
        style={{
          ...cardStyle, borderRadius: 20, overflow: "hidden", marginTop: S.xl,
          opacity: term, transform: `translateY(${interpolate(term, [0, 1], [10, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: `${S.sm}px ${S.md}px`,
            borderBottom: `1px solid ${palette.border}`,
            background: "rgba(255,255,255,0.025)",
          }}
        >
          {["#e5534b", "#d4a04b", "#54a84f"].map((c) => (
            <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
          <span style={{ flex: 1, textAlign: "center", fontFamily: font.ui, fontSize: 15, fontWeight: 600, color: palette.tertiary, letterSpacing: "0.04em" }}>
            hig-doctor audit
          </span>
          <span style={{ width: 39 }} />
        </div>
        <div style={{ background: "rgba(12,13,16,0.9)", padding: S.md, fontFamily: font.mono, fontSize: 19, lineHeight: 1.6 }}>
          {lines.map((line, i) => {
            const d = 20 + i * 4;
            const o = interpolate(frame, [d, d + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const y = interpolate(frame, [d, d + 10], [5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
            return (
              <div key={i} style={{ color: line.c, opacity: o, transform: `translateY(${y}px)`, whiteSpace: "pre" }}>
                {line.t || "\u00A0"}
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
};

/* ── Scene 2: Categories ─────────────────────────────────────────────── */

const CategoriesScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const categories = reportData.topCategories;
  const max = Math.max(...categories.map((c) => c.detections), 1);
  const project = reportData.project;
  const total = project.totals.positives + project.totals.patterns + project.totals.concerns;
  const scoreTimeline = reportData.scoreTimeline;

  const donutStats = [
    { label: "Positives", value: project.totals.positives, color: palette.green },
    { label: "Patterns", value: project.totals.patterns, color: palette.amber },
    { label: "Concerns", value: project.totals.concerns, color: palette.rose },
  ].filter((s) => s.value > 0);
  const donutTotal = Math.max(1, donutStats.reduce((a, s) => a + s.value, 0));
  const R = 110, SW = 28, C = 2 * Math.PI * R;

  return (
    <Page>
      <div style={{ fontFamily: font.ui, fontSize: 18, fontWeight: 600, color: palette.green, textTransform: "uppercase", letterSpacing: "0.12em" }}>
        Detections by HIG Category
      </div>
      <div style={{ fontFamily: font.ui, fontSize: 52, fontWeight: 600, color: palette.fg, lineHeight: 1.05, letterSpacing: "-0.02em", marginTop: S.sm }}>
        {total} detections
      </div>
      <div style={{ fontFamily: font.ui, fontSize: 24, color: palette.secondary, marginTop: S.xs }}>
        across {categories.length} categories · {project.totals.positives} positive patterns
      </div>

      {/* Donut + legend */}
      <div style={{ display: "flex", alignItems: "center", gap: S.xl, marginTop: S.xl }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={R} stroke="rgba(255,255,255,0.06)" strokeWidth={SW} fill="none" />
            {(() => {
              let consumed = 0;
              const p = interpolate(frame, [0, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
              return donutStats.map((item) => {
                const frac = item.value / donutTotal;
                const seg = C * frac;
                const off = interpolate(p, [0, 1], [seg, 0]);
                const rot = (consumed / donutTotal) * 360 - 90;
                consumed += item.value;
                return (
                  <circle key={item.label} cx="140" cy="140" r={R} stroke={item.color} strokeWidth={SW}
                    fill="none" strokeLinecap="round"
                    strokeDasharray={`${seg} ${C}`} strokeDashoffset={off}
                    transform={`rotate(${rot} 140 140)`} />
                );
              });
            })()}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: font.ui, fontSize: 48, fontWeight: 600, color: palette.fg }}>{total}</span>
            <span style={{ fontFamily: font.ui, fontSize: 16, color: palette.tertiary, marginTop: -2 }}>total</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
          {donutStats.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
              <span style={{ fontFamily: font.ui, fontSize: 20, color: palette.secondary }}>{s.label}</span>
              <span style={{ fontFamily: font.ui, fontSize: 20, fontWeight: 600, color: palette.fg }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ marginTop: S.xl, display: "grid", gap: S.md }}>
        {categories.map((cat, i) => {
          const grow = spring({ frame, fps, delay: i * 5, config: { damping: 200 } });
          const pct = interpolate(grow, [0, 1], [0, (cat.detections / max) * 100]);
          const posPct = cat.detections > 0 ? (cat.positives / cat.detections) * pct : 0;
          return (
            <div key={cat.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: S.xs }}>
                <span style={{ fontFamily: font.ui, fontSize: 20, color: palette.secondary }}>{cat.name}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: font.ui, fontSize: 26, fontWeight: 600, color: palette.fg }}>{cat.detections}</span>
                  {cat.positives > 0 && (
                    <span style={{ fontFamily: font.ui, fontSize: 16, color: palette.green }}>{cat.positives} good</span>
                  )}
                </div>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden", display: "flex" }}>
                <div style={{ height: "100%", width: `${posPct}%`, background: palette.green, borderRadius: "999px 0 0 999px" }} />
                <div style={{ height: "100%", width: `${pct - posPct}%`, background: `${palette.amber}66`, borderRadius: "0 999px 999px 0" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Score timeline */}
      <div style={{ display: "flex", gap: S.sm, marginTop: S.xl }}>
        {scoreTimeline.map((pt, i) => {
          const color = i === 0 ? palette.rose : i === scoreTimeline.length - 1 ? palette.green : palette.amber;
          return (
            <div key={pt.label} style={{ ...pill, padding: `${S.sm}px ${S.md}px`, flex: 1 }}>
              <div style={{ fontFamily: font.ui, fontSize: 14, fontWeight: 600, color: palette.tertiary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {pt.label}
              </div>
              <div style={{ fontFamily: font.ui, fontSize: 32, fontWeight: 600, color, marginTop: 4 }}>
                {pt.score}/100
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

/* ── Scene 3: Frameworks ─────────────────────────────────────────────── */

const FrameworksScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frameworks = reportData.frameworkRuleCounts;

  const checks = [
    { area: "Accessibility", detail: "ARIA roles, alt text, focus management, touch targets" },
    { area: "Color Systems", detail: "Semantic tokens, dark mode support, CSS custom properties" },
    { area: "Typography", detail: "Dynamic Type, relative units, font scale compliance" },
    { area: "Layout", detail: "Responsive breakpoints, logical properties, RTL support" },
    { area: "Motion", detail: "prefers-reduced-motion, transitions, scroll behavior" },
    { area: "Internationalization", detail: "lang attributes, RTL layout, i18n framework detection" },
    { area: "Forms & Input", detail: "Labels, fieldset/legend, autocomplete, input validation" },
  ];

  return (
    <Page>
      <div style={{ fontFamily: font.ui, fontSize: 18, fontWeight: 600, color: palette.purple, textTransform: "uppercase", letterSpacing: "0.12em" }}>
        Framework Coverage
      </div>
      <div style={{ fontFamily: font.ui, fontSize: 56, fontWeight: 600, color: palette.fg, lineHeight: 1.02, letterSpacing: "-0.02em", marginTop: S.sm }}>
        12 frameworks.{"\n"}349 rules.
      </div>
      <div style={{ fontFamily: font.ui, fontSize: 24, color: palette.secondary, lineHeight: 1.36, marginTop: S.sm }}>
        Each detection classified as positive, concern, or neutral pattern.
      </div>

      {/* Framework grid — 2 columns for readability */}
      <div style={{ marginTop: S.xl, display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.sm }}>
        {frameworks.map((fw, i) => {
          const rise = spring({ frame, fps, delay: i * 2, config: { damping: 200 } });
          return (
            <div
              key={fw.framework}
              style={{
                ...pill, padding: `${S.sm}px ${S.md}px`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                opacity: rise, transform: `translateY(${interpolate(rise, [0, 1], [4, 0])}px)`,
              }}
            >
              <span style={{ fontFamily: font.ui, fontSize: 19, color: palette.secondary }}>{fw.framework}</span>
              <span style={{ fontFamily: font.mono, fontSize: 17, fontWeight: 600, color: palette.blue }}>{fw.rules}</span>
            </div>
          );
        })}
      </div>

      {/* What it checks */}
      <div style={{ fontFamily: font.ui, fontSize: 28, fontWeight: 600, color: palette.fg, marginTop: S.xxl }}>
        What it checks
      </div>
      <div style={{ marginTop: S.md, display: "grid", gap: S.sm }}>
        {checks.map((item, i) => {
          const rise = spring({ frame, fps, delay: i * 4 + 10, config: { damping: 200 } });
          return (
            <div
              key={item.area}
              style={{
                ...pill, padding: `${S.sm}px ${S.md}px`,
                display: "flex", alignItems: "baseline", gap: S.sm,
                opacity: rise, transform: `translateY(${interpolate(rise, [0, 1], [6, 0])}px)`,
              }}
            >
              <span style={{ fontFamily: font.ui, fontSize: 18, fontWeight: 600, color: palette.blue, flexShrink: 0 }}>{item.area}</span>
              <span style={{ fontFamily: font.ui, fontSize: 17, color: palette.tertiary }}>—</span>
              <span style={{ fontFamily: font.ui, fontSize: 17, color: palette.secondary }}>{item.detail}</span>
            </div>
          );
        })}
      </div>
    </Page>
  );
};

/* ── Scene 4: Outro ──────────────────────────────────────────────────── */

const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const project = reportData.project;
  const pop = spring({ frame, fps, delay: 4, config: { damping: 14, stiffness: 160 } });
  const fadeIn = spring({ frame, fps, config: { damping: 200 } });
  const statsIn = spring({ frame, fps, delay: 10, config: { damping: 200 } });

  return (
    <Page>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {/* Score badge */}
        <div
          style={{
            width: 180, height: 180, borderRadius: "50%",
            background: "rgba(143,191,154,0.12)", border: `3px solid ${palette.green}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})`, opacity: pop,
          }}
        >
          <span style={{ fontFamily: font.ui, fontSize: 68, fontWeight: 700, color: palette.green }}>{project.score}</span>
          <span style={{ fontFamily: font.ui, fontSize: 18, fontWeight: 600, color: palette.secondary, marginTop: -6 }}>/ 100</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: font.ui, fontSize: 88, fontWeight: 600, color: palette.fg,
            lineHeight: 0.94, letterSpacing: "-0.03em", marginTop: S.xxl,
            opacity: fadeIn,
          }}
        >
          Ship with{"\n"}confidence.
        </div>
        <div
          style={{
            fontFamily: font.ui, fontSize: 28, color: palette.secondary,
            lineHeight: 1.3, marginTop: S.lg, opacity: fadeIn,
          }}
        >
          One command. 349 rules.{"\n"}Every framework. Zero configuration.
        </div>

        {/* CTA */}
        <div
          style={{
            fontFamily: font.mono, fontSize: 24, fontWeight: 500, color: palette.blue,
            marginTop: S.xxl, padding: `${S.sm + 4}px ${S.lg}px`,
            borderRadius: 14, background: "rgba(143,170,191,0.08)",
            border: `1px solid ${palette.border}`,
          }}
        >
          bun run audit ./my-app
        </div>

        {/* Stats — 2x2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.md, marginTop: S.xxl, opacity: statsIn, width: "100%", maxWidth: 600 }}>
          {[
            { l: "Score", v: `${project.score}/100`, c: palette.green },
            { l: "Rules", v: String(reportData.totalRules), c: palette.blue },
            { l: "Positives", v: String(project.totals.positives), c: palette.cyan },
            { l: "Frameworks", v: String(reportData.totalFrameworks), c: palette.purple },
          ].map((item) => (
            <div key={item.l} style={{ ...pill, padding: `${S.md}px`, textAlign: "center" }}>
              <div style={{ fontFamily: font.ui, fontSize: 14, fontWeight: 600, color: palette.tertiary, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.l}</div>
              <div style={{ fontFamily: font.ui, fontSize: 40, fontWeight: 600, color: item.c, marginTop: 4 }}>{item.v}</div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
};

/* ── Scene Wrapper (fade in/out) ──────────────────────────────────────── */

const FadeScene = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  const f = 16;
  const opacity = interpolate(
    frame,
    [0, f, durationInFrames - f, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/* ── Composition ─────────────────────────────────────────────────────── */

const scenes = [
  { component: IntroScene,      duration: 186, from: 0   },
  { component: CategoriesScene, duration: 200, from: 160 },
  { component: FrameworksScene, duration: 186, from: 334 },
  { component: OutroScene,      duration: 138, from: 494 },
];

export const HigDoctorShowcase = () => {
  return (
    <AbsoluteFill style={{ fontFamily: font.ui }}>
      <Backdrop />
      {scenes.map(({ component: Scene, duration, from }) => (
        <Sequence key={from} from={from} durationInFrames={duration} premountFor={30}>
          <FadeScene durationInFrames={duration}>
            <Scene />
          </FadeScene>
        </Sequence>
      ))}
      <BrandFooter />
    </AbsoluteFill>
  );
};
