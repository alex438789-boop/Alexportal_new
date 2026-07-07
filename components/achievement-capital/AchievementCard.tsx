"use client";

import { useState } from "react";
import { AchievementCardData } from "./types";

type Props = {
  card: AchievementCardData;
  active?: boolean;
  side?: "left" | "right" | "hidden";
  onEdit: () => void;
};

export function AchievementCard({ card, active = false, side, onEdit }: Props) {
  const [aiOpen, setAiOpen] = useState(false);
  const progress = Math.min(Math.max(card.progress, 0), 100);
  const waterHeight = `${progress}%`;
  const tone = getCardTone(card.category, card.tags);

  if (side === "hidden") return null;

  return (
    <article
      className={`relative shrink-0 overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.10)] transition-all duration-500 ${
        active
          ? "h-[720px] w-[470px] opacity-100"
          : "h-[575px] w-[315px] opacity-55 blur-[1.4px]"
      }`}
    >
      {/* Water zone begins below the title/subtitle area, so the wave never cuts through text. */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 overflow-hidden"
        style={{ top: active ? "238px" : "190px" }}
        aria-hidden="true"
      >
        {/* Filled water body. Height follows progress inside the lower content zone. */}
        <div
          className={`absolute bottom-0 left-0 right-0 overflow-hidden transition-all duration-700 ease-out ${tone.water}`}
          style={{ height: waterHeight }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-white/12 to-white/22" />
          <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_16%_30%,rgba(255,255,255,.60)_0_2px,transparent_2px),radial-gradient(circle_at_62%_52%,rgba(255,255,255,.42)_0_3px,transparent_3px),radial-gradient(circle_at_78%_74%,rgba(255,255,255,.32)_0_2px,transparent_2px)]" />

          <svg
            className="career-wave-svg career-wave-a"
            viewBox="0 0 1440 140"
            preserveAspectRatio="none"
          >
            <path
              d="M0,62 C160,118 290,14 452,63 C620,114 730,50 890,42 C1040,34 1170,100 1440,44 L1440,140 L0,140 Z"
              fill={tone.waveFill}
            />
          </svg>
          <svg
            className="career-wave-svg career-wave-b"
            viewBox="0 0 1440 140"
            preserveAspectRatio="none"
          >
            <path
              d="M0,78 C190,22 345,92 520,58 C700,24 850,100 1030,62 C1190,28 1290,70 1440,54 L1440,140 L0,140 Z"
              fill={tone.waveFillSoft}
            />
          </svg>
        </div>
      </div>

      {/* Light wash preserves the clean white card while allowing the lower water zone to remain visible. */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-white/94 via-white/46 to-white/8" />

      <div className={`relative z-10 flex h-full flex-col ${active ? "p-7" : "p-6"}`}>
        <div className="flex items-start justify-between gap-3">
          <span className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold ${tone.tag}`}>
            {card.category}
          </span>

          <div className="relative flex items-center gap-2">
            {active && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                className="rounded-full p-1 text-base text-slate-500 transition hover:bg-white/85 hover:text-slate-950"
                aria-label="Manual edit"
              >
                ✎
              </button>
            )}
            <span className={`font-semibold ${active ? "text-[22px]" : "text-[18px]"} ${tone.number}`}>
              {card.progress}%
            </span>
            {active && (
              <div className="relative">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setAiOpen((value) => !value);
                  }}
                  className="rounded-xl border border-slate-200 bg-white/82 px-2.5 py-1 text-xs font-semibold text-violet-600 shadow-sm backdrop-blur-md transition hover:bg-violet-50"
                  aria-label="AI actions"
                >
                  ✦ AI
                </button>

                {aiOpen && (
                  <div className="absolute right-0 top-10 z-30 w-56 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-2xl">
                    {[
                      "Fill This Card",
                      "Extract Skills",
                      "Find Missing Evidence",
                      "Reframe for Target Role",
                      "Generate Resume Bullet",
                    ].map((item) => (
                      <button
                        key={item}
                        className="block w-full rounded-xl px-4 py-2.5 text-left text-slate-700 transition hover:bg-slate-100"
                        onClick={(event) => event.stopPropagation()}
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

        <div className={active ? "mt-8" : "mt-10"}>
          <h2 className={`${active ? "text-[24px]" : "text-[21px]"} font-semibold leading-tight tracking-tight text-slate-950`}>
            {card.title}
          </h2>
          <p className={`${active ? "mt-2 text-[15px]" : "mt-2 text-sm"} text-slate-600`}>
            {card.subtitle}
          </p>
        </div>

        <div className="mt-auto rounded-[1.45rem] border border-white/75 bg-white/64 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <InfoSection title="Current Value" icon="▣">
            <p className="line-clamp-3 leading-6 text-slate-700">{card.currentValue}</p>
          </InfoSection>

          <Divider />

          <InfoSection title="Skills Demonstrated" icon="◎">
            <div className="flex flex-wrap gap-2">
              {card.skills.slice(0, active ? 5 : 2).map((skill) => (
                <span
                  key={skill}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${tone.skill}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </InfoSection>

          <Divider />

          <InfoSection title="Next Fill Action" icon="✦">
            <p className="line-clamp-3 leading-6 text-slate-700">{card.nextFillAction}</p>
          </InfoSection>

          <Divider />

          <InfoSection title="Timeline" icon="◷">
            <p className="text-xs leading-5 text-slate-600">
              Created {formatDate(card.createdAt)}
              {active && <span> ｜ Last Updated {formatDate(card.updatedAt)}</span>}
            </p>
          </InfoSection>
        </div>
      </div>
    </article>
  );
}

function getCardTone(category: string, tags: string[]) {
  const haystack = `${category} ${tags.join(" ")}`.toLowerCase();

  if (haystack.includes("product") || haystack.includes("portal")) {
    return {
      tag: "bg-teal-100/90 text-teal-700",
      number: "text-teal-600",
      water: "bg-gradient-to-t from-teal-200/74 via-cyan-100/66 to-cyan-50/24",
      waveFill: "rgba(20, 184, 166, 0.42)",
      waveFillSoft: "rgba(125, 211, 252, 0.34)",
      skill: "border-teal-200 bg-teal-50/85 text-teal-700",
    };
  }

  if (haystack.includes("finance")) {
    return {
      tag: "bg-violet-100/90 text-violet-700",
      number: "text-violet-600",
      water: "bg-gradient-to-t from-violet-200/74 via-purple-100/60 to-violet-50/22",
      waveFill: "rgba(139, 92, 246, 0.42)",
      waveFillSoft: "rgba(196, 181, 253, 0.34)",
      skill: "border-violet-200 bg-violet-50/85 text-violet-700",
    };
  }

  if (haystack.includes("writing") || haystack.includes("market")) {
    return {
      tag: "bg-blue-100/90 text-blue-700",
      number: "text-blue-600",
      water: "bg-gradient-to-t from-blue-200/74 via-sky-100/62 to-blue-50/22",
      waveFill: "rgba(59, 130, 246, 0.40)",
      waveFillSoft: "rgba(147, 197, 253, 0.34)",
      skill: "border-blue-200 bg-blue-50/85 text-blue-700",
    };
  }

  return {
    tag: "bg-teal-100/90 text-teal-700",
    number: "text-teal-600",
    water: "bg-gradient-to-t from-cyan-200/74 via-teal-100/62 to-cyan-50/22",
    waveFill: "rgba(20, 184, 166, 0.42)",
    waveFillSoft: "rgba(125, 211, 252, 0.34)",
    skill: "border-teal-200 bg-teal-50/85 text-teal-700",
  };
}

function InfoSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-1.5 flex items-center gap-2 text-teal-700">
        <span className="text-sm">{icon}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="text-[13px]">{children}</div>
    </section>
  );
}

function Divider() {
  return <div className="my-3.5 h-px bg-slate-200/85" />;
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
