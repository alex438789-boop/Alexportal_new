"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AchievementCardData } from "./types";

type Props = {
  card: AchievementCardData;
  active?: boolean;
  side?: "left" | "right" | "hidden";
  onEdit: () => void;
  onAiAction: (action: string) => void;
};

type CardDensity = "comfortable" | "compact" | "compressed";

export function AchievementCard({ card, active = false, side, onEdit, onAiAction }: Props) {
  const [aiOpen, setAiOpen] = useState(false);
  const progress = Math.min(Math.max(card.progress, 0), 100);
  const isComplete = progress >= 100;
  const waterHeight = `${progress}%`;
  const waterMaxHeight = isComplete ? "100%" : active ? "calc(100% - 170px)" : "calc(100% - 150px)";
  const tone = getCardTone(card.category, card.tags);
  const completeStyle = {
    "--complete-edge": tone.completeEdge,
    "--complete-glow": tone.completeGlow,
    "--complete-sheen": tone.completeSheen,
  } as CSSProperties;
  const waterImpulseKey = `${card.id}-${active ? "active" : "side"}`;
  const density = getCardDensity(card, active);
  const titleSpacing = active
    ? density === "compressed"
      ? "mt-4"
      : density === "compact"
        ? "mt-6"
        : "mt-8"
    : "mt-10";
  const panelPadding = active
    ? density === "compressed"
      ? "p-3.5"
      : density === "compact"
        ? "p-4"
        : "p-5"
    : "p-5";
  const paragraphClass = active
    ? density === "compressed"
      ? "leading-[1.38rem] text-slate-700"
      : "leading-[1.48rem] text-slate-700"
    : "line-clamp-3 leading-6 text-slate-700";

  if (side === "hidden") return null;

  return (
    <article
      className={`liquid-glass-card relative shrink-0 overflow-hidden rounded-[2rem] transition-all duration-500 ${
        isComplete ? "liquid-glass-card-complete" : ""
      } ${
        active
          ? "h-[720px] w-[470px] opacity-100"
          : "h-[575px] w-[315px] opacity-65 blur-[0.9px]"
      }`}
      style={completeStyle}
    >
      <div
        className="liquid-water-sim pointer-events-none absolute bottom-0 left-0 right-0 z-0 overflow-hidden transition-all duration-500 ease-out"
        style={{
          height: waterHeight,
          maxHeight: waterMaxHeight,
          background: `linear-gradient(to top, ${tone.waveFill} 0%, ${tone.waveFillSoft} 72%, transparent 100%)`,
        }}
        aria-hidden="true"
      >
        <WaterSimulationCanvas
          active={active}
          impulseKey={waterImpulseKey}
          fill={tone.waveFill}
          fillSoft={tone.waveFillSoft}
          complete={isComplete}
        />
      </div>

      <div className={`relative z-10 flex h-full flex-col ${active ? "p-7" : "p-6"}`}>
        <div className="flex items-start justify-between gap-3">
          <span className={`liquid-glass-chip rounded-xl px-3.5 py-1.5 text-xs font-semibold ${tone.tag}`}>
            {card.category}
          </span>

          <div className="relative flex items-center gap-2">
            {active && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                className="liquid-glass-icon-button flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:text-slate-950"
                aria-label="Manual edit"
              >
                <PencilIcon />
              </button>
            )}

            <span
              className={`whitespace-nowrap text-right font-semibold ${
                isComplete && active ? "liquid-complete-label text-[13px]" : active ? "text-[22px]" : "text-[18px]"
              } ${tone.number}`}
            >
              {isComplete && active ? "100% · Export Ready" : `${card.progress}%`}
            </span>

            {active && (
              <div className="relative">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setAiOpen((value) => !value);
                  }}
                  className="liquid-glass-button rounded-xl px-2.5 py-1 text-xs font-semibold text-violet-600 transition"
                  aria-label="AI actions"
                >
                  ✦ AI
                </button>

                {aiOpen && (
                  <div className="liquid-glass-menu absolute right-0 top-10 z-30 w-56 rounded-2xl p-2 text-sm">
                    {[
                      "Fill This Card",
                      "Extract Skills",
                      "Find Missing Evidence",
                      "Reframe for Target Role",
                      "Generate Resume Bullet",
                    ].map((item) => (
                      <button
                        key={item}
                        className="block w-full rounded-xl px-4 py-2.5 text-left text-slate-700 transition hover:bg-white/55"
                        onClick={(event) => {
                          event.stopPropagation();
                          setAiOpen(false);
                          onAiAction(item);
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`${titleSpacing} ${isComplete ? "liquid-complete-title-zone" : ""}`}>
          <h2 className={`${active ? "text-[24px]" : "text-[21px]"} font-semibold leading-tight tracking-tight text-slate-950`}>
            {card.title}
          </h2>
          <p className={`${active ? "mt-2 text-[15px]" : "mt-2 text-sm"} text-slate-600`}>
            {card.subtitle}
          </p>
        </div>

        <div className={`liquid-glass-panel relative mt-auto overflow-hidden rounded-[1.45rem] ${panelPadding}`}>
          <div className="liquid-glass-panel-sheen" aria-hidden="true" />

          <div className="relative z-10">
            <InfoSection title="Current Value" colorClass={tone.section}>
              <p className={paragraphClass}>{card.currentValue}</p>
            </InfoSection>

            <Divider dense={density !== "comfortable"} />

            <InfoSection title="Skills Demonstrated" colorClass={tone.section}>
              <div className="flex flex-wrap gap-2">
                {card.skills.slice(0, active ? 5 : 2).map((skill) => (
                  <span
                    key={skill}
                    className={`liquid-glass-skill rounded-full border px-2.5 py-1 text-[11px] font-medium ${tone.skill}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </InfoSection>

            <Divider dense={density !== "comfortable"} />

            <InfoSection title="Next Fill Action" colorClass={tone.section}>
              <p className={paragraphClass}>{card.nextFillAction}</p>
            </InfoSection>

            <Divider dense={density !== "comfortable"} />

            <InfoSection title="Timeline" icon={<Clock3Icon />} colorClass={tone.section}>
              <p className="text-xs leading-5 text-slate-600">
                Created {formatDate(card.createdAt)}
                {active && <span> ｜ Last Updated {formatDate(card.updatedAt)}</span>}
              </p>
            </InfoSection>
          </div>
        </div>
      </div>
    </article>
  );
}

function WaterSimulationCanvas({
  active,
  impulseKey,
  fill,
  fillSoft,
  complete,
}: {
  active: boolean;
  impulseKey: string;
  fill: string;
  fillSoft: string;
  complete: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef(active);
  const completeRef = useRef(complete);
  const pendingImpulseRef = useRef(0);
  const lastImpulseKeyRef = useRef(impulseKey);

  activeRef.current = active;
  completeRef.current = complete;
  if (lastImpulseKeyRef.current !== impulseKey) {
    pendingImpulseRef.current += complete ? 0.34 : active ? 1 : -0.72;
    lastImpulseKeyRef.current = impulseKey;
  }

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    completeRef.current = complete;
  }, [complete]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const pointCount = 44;
    const heights = new Array<number>(pointCount).fill(0);
    const velocities = new Array<number>(pointCount).fill(0);
    const leftDeltas = new Array<number>(pointCount).fill(0);
    const rightDeltas = new Array<number>(pointCount).fill(0);
    const bubbles = Array.from({ length: 9 }, (_, index) => ({
      x: ((index * 17 + 11) % 100) / 100,
      y: ((index * 23 + 37) % 100) / 100,
      r: 1.8 + (index % 4),
      speed: 0.12 + (index % 5) * 0.025,
    }));

    let width = 1;
    let height = 1;
    let deviceScale = 1;
    let frame = 0;
    let animationFrame = 0;
    let mounted = true;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      deviceScale = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * deviceScale);
      canvas.height = Math.round(height * deviceScale);
      context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const splash = (strength: number) => {
      const center = activeRef.current ? Math.floor(pointCount * 0.68) : Math.floor(pointCount * 0.28);
      for (let index = 0; index < pointCount; index += 1) {
        const distance = Math.abs(index - center);
        const force = Math.max(0, 1 - distance / 11) * strength;
        velocities[index] += force * (index < center ? -1 : 1);
      }
    };

    const drawWaterPath = (offset: number) => {
      const step = width / (pointCount - 1);
      context.beginPath();
      context.moveTo(-8, height);
      context.lineTo(-8, offset + heights[0]);

      for (let index = 0; index < pointCount - 1; index += 1) {
        const x = index * step;
        const nextX = (index + 1) * step;
        const y = offset + heights[index];
        const nextY = offset + heights[index + 1];
        context.quadraticCurveTo(x + step * 0.5, y, nextX, (y + nextY) * 0.5);
      }

      context.lineTo(width + 8, height);
      context.closePath();
    };

    const tick = () => {
      frame += 1;

      if (pendingImpulseRef.current !== 0) {
        splash(pendingImpulseRef.current * (completeRef.current ? 6.2 : activeRef.current ? 13.5 : 9.5));
        pendingImpulseRef.current = 0;
      }

      for (let index = 0; index < pointCount; index += 1) {
        const spring = (completeRef.current ? -0.055 : -0.035) * heights[index];
        velocities[index] += spring;
        velocities[index] *= completeRef.current ? 0.91 : 0.955;
        heights[index] += velocities[index];
      }

      for (let pass = 0; pass < (completeRef.current ? 9 : 7); pass += 1) {
        for (let index = 0; index < pointCount; index += 1) {
          if (index > 0) {
            leftDeltas[index] = (completeRef.current ? 0.16 : 0.215) * (heights[index] - heights[index - 1]);
            velocities[index - 1] += leftDeltas[index];
          }
          if (index < pointCount - 1) {
            rightDeltas[index] = (completeRef.current ? 0.16 : 0.215) * (heights[index] - heights[index + 1]);
            velocities[index + 1] += rightDeltas[index];
          }
        }
        for (let index = 0; index < pointCount; index += 1) {
          if (index > 0) heights[index - 1] += leftDeltas[index];
          if (index < pointCount - 1) heights[index + 1] += rightDeltas[index];
        }
      }

      const surfaceBase = completeRef.current ? Math.max(2, Math.min(18, height * 0.025)) : Math.max(18, Math.min(72, height * 0.18));
      const idleRipple = Math.sin(frame / (completeRef.current ? 72 : 42)) * (completeRef.current ? 0.58 : 1.4);

      context.clearRect(0, 0, width, height);

      const fillGradient = context.createLinearGradient(0, surfaceBase - 10, 0, height);
      fillGradient.addColorStop(0, fillSoft);
      fillGradient.addColorStop(0.34, fill);
      fillGradient.addColorStop(1, fill.replace(/0\.\d+\)/, "0.50)"));

      drawWaterPath(surfaceBase + idleRipple);
      context.fillStyle = fillGradient;
      context.fill();

      drawWaterPath(surfaceBase + 13 + idleRipple * 0.5);
      context.fillStyle = fillSoft;
      context.globalAlpha = 0.56;
      context.fill();
      context.globalAlpha = 1;

      const crestGradient = context.createLinearGradient(0, surfaceBase - 18, 0, surfaceBase + 16);
      crestGradient.addColorStop(0, "rgba(255,255,255,0.78)");
      crestGradient.addColorStop(1, "rgba(255,255,255,0.18)");

      context.beginPath();
      const step = width / (pointCount - 1);
      context.moveTo(0, surfaceBase + heights[0] + idleRipple);
      for (let index = 1; index < pointCount; index += 1) {
        context.lineTo(index * step, surfaceBase + heights[index] + idleRipple);
      }
      context.strokeStyle = crestGradient;
      context.lineWidth = completeRef.current ? 1.45 : 2.4;
      context.lineCap = "round";
      context.stroke();

      context.save();
      context.globalAlpha = completeRef.current ? 0.24 : 0.44;
      for (const bubble of bubbles) {
        bubble.y -= bubble.speed / Math.max(80, height);
        bubble.x += Math.sin(frame / 70 + bubble.r) * 0.0008;
        if (bubble.y < 0.08) bubble.y = 0.92;
        context.beginPath();
        context.arc(bubble.x * width, surfaceBase + bubble.y * (height - surfaceBase), bubble.r, 0, Math.PI * 2);
        context.fillStyle = "rgba(255,255,255,0.42)";
        context.fill();
      }
      context.restore();

      const sheen = context.createRadialGradient(width * 0.22, surfaceBase + 8, 0, width * 0.22, surfaceBase + 8, width * 0.62);
      sheen.addColorStop(0, completeRef.current ? "rgba(255,255,255,0.48)" : "rgba(255,255,255,0.34)");
      sheen.addColorStop(0.5, "rgba(255,255,255,0.08)");
      sheen.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = sheen;
      context.fillRect(0, 0, width, height);

      if (mounted) animationFrame = requestAnimationFrame(tick);
    };

    pendingImpulseRef.current += completeRef.current ? 0.2 : activeRef.current ? 0.68 : -0.42;
    tick();

    return () => {
      mounted = false;
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [fill, fillSoft, complete]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

function getCardTone(category: string, tags: string[]) {
  const haystack = `${category} ${tags.join(" ")}`.toLowerCase();

  if (haystack.includes("product") || haystack.includes("portal")) {
    return {
      tag: "bg-amber-100/90 text-amber-700",
      number: "text-amber-600",
      section: "text-amber-700",
      water: "bg-gradient-to-t from-amber-200/70 via-yellow-100/58 to-amber-50/22",
      waveFill: "rgba(245, 158, 11, 0.32)",
      waveFillSoft: "rgba(253, 224, 71, 0.26)",
      completeEdge: "rgba(245, 158, 11, 0.54)",
      completeGlow: "rgba(251, 191, 36, 0.2)",
      completeSheen: "rgba(255, 251, 235, 0.72)",
      skill: "border-amber-200 bg-amber-50/85 text-amber-700",
    };
  }

  if (haystack.includes("finance")) {
    return {
      tag: "bg-violet-100/90 text-violet-700",
      number: "text-violet-600",
      section: "text-violet-700",
      water: "bg-gradient-to-t from-violet-200/70 via-purple-100/58 to-violet-50/22",
      waveFill: "rgba(139, 92, 246, 0.32)",
      waveFillSoft: "rgba(196, 181, 253, 0.26)",
      completeEdge: "rgba(139, 92, 246, 0.52)",
      completeGlow: "rgba(167, 139, 250, 0.2)",
      completeSheen: "rgba(245, 243, 255, 0.72)",
      skill: "border-violet-200 bg-violet-50/85 text-violet-700",
    };
  }

  if (
    haystack.includes("sustainability") ||
    haystack.includes("sustainable") ||
    haystack.includes("climate") ||
    haystack.includes("consulting") ||
    haystack.includes("永續")
  ) {
    return {
      tag: "bg-teal-100/90 text-teal-700",
      number: "text-teal-600",
      section: "text-teal-700",
      water: "bg-gradient-to-t from-cyan-200/70 via-teal-100/58 to-cyan-50/22",
      waveFill: "rgba(20, 184, 166, 0.32)",
      waveFillSoft: "rgba(125, 211, 252, 0.26)",
      completeEdge: "rgba(20, 184, 166, 0.5)",
      completeGlow: "rgba(34, 211, 238, 0.18)",
      completeSheen: "rgba(240, 253, 250, 0.72)",
      skill: "border-teal-200 bg-teal-50/85 text-teal-700",
    };
  }

  if (
    haystack.includes("sidebusiness") ||
    haystack.includes("side business") ||
    haystack.includes("softfurnishing") ||
    haystack.includes("interiorstyling") ||
    haystack.includes("aestheticcapital") ||
    haystack.includes("副業")
  ) {
    return {
      tag: "bg-rose-100/90 text-rose-700",
      number: "text-rose-600",
      section: "text-rose-700",
      water: "bg-gradient-to-t from-rose-200/66 via-orange-100/48 to-rose-50/20",
      waveFill: "rgba(225, 29, 72, 0.27)",
      waveFillSoft: "rgba(251, 146, 60, 0.22)",
      completeEdge: "rgba(225, 29, 72, 0.46)",
      completeGlow: "rgba(251, 113, 133, 0.18)",
      completeSheen: "rgba(255, 241, 242, 0.74)",
      skill: "border-rose-200 bg-rose-50/85 text-rose-700",
    };
  }

  if (haystack.includes("writing") || haystack.includes("market")) {
    return {
      tag: "bg-blue-100/90 text-blue-700",
      number: "text-blue-600",
      section: "text-blue-700",
      water: "bg-gradient-to-t from-blue-200/70 via-sky-100/58 to-blue-50/22",
      waveFill: "rgba(59, 130, 246, 0.30)",
      waveFillSoft: "rgba(147, 197, 253, 0.26)",
      completeEdge: "rgba(59, 130, 246, 0.5)",
      completeGlow: "rgba(96, 165, 250, 0.18)",
      completeSheen: "rgba(239, 246, 255, 0.72)",
      skill: "border-blue-200 bg-blue-50/85 text-blue-700",
    };
  }

  return {
    tag: "bg-sky-100/90 text-blue-700",
    number: "text-blue-600",
    section: "text-blue-700",
    water: "bg-gradient-to-t from-blue-200/68 via-sky-100/56 to-blue-50/20",
    waveFill: "rgba(37, 99, 235, 0.29)",
    waveFillSoft: "rgba(125, 211, 252, 0.24)",
    completeEdge: "rgba(37, 99, 235, 0.48)",
    completeGlow: "rgba(56, 189, 248, 0.18)",
    completeSheen: "rgba(239, 246, 255, 0.76)",
    skill: "border-blue-200 bg-sky-50/85 text-blue-700",
  };
}

function getCardDensity(card: AchievementCardData, active: boolean): CardDensity {
  if (!active) return "comfortable";

  const textLoad =
    card.currentValue.length +
    card.nextFillAction.length +
    card.subtitle.length +
    card.skills.slice(0, 5).join("").length;

  if (textLoad > 430) return "compressed";
  if (textLoad > 300) return "compact";
  return "comfortable";
}

function InfoSection({
  title,
  icon,
  colorClass,
  children,
}: {
  title: string;
  icon?: ReactNode;
  colorClass: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className={`mb-1.5 flex items-center gap-2 ${colorClass}`}>
        {icon && <span className="flex h-4 w-4 items-center justify-center">{icon}</span>}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="text-[13px]">{children}</div>
    </section>
  );
}

function PencilIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function Clock3Icon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function Divider({ dense = false }: { dense?: boolean }) {
  return <div className={`${dense ? "my-2.5" : "my-3.5"} h-px bg-slate-200/85`} />;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
