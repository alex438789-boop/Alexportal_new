"use client";

import { useState, type ReactNode } from "react";
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

        <div className="relative mt-auto overflow-hidden rounded-[1.45rem] border border-white/75 bg-white/56 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          {/* Water inside the information block */}
          <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 z-0 overflow-hidden transition-all duration-700 ease-out ${tone.water}`}
            style={{ height: waterHeight }}
            aria-hidden="true"
          >
            {/* Full water body */}
            <svg
              className="absolute left-0 top-0 h-full w-[125%]"
              viewBox="0 0 1440 600"
              preserveAspectRatio="none"
            >
              <path
                d="M0,72 C160,126 300,18 470,72 C650,126 760,48 930,54 C1100,60 1210,112 1440,58 L1440,600 L0,600 Z"
                fill={tone.waveFill}
              />
            </svg>

            <svg
              className="absolute left-0 top-0 h-full w-[125%] opacity-70"
              viewBox="0 0 1440 600"
              preserveAspectRatio="none"
            >
              <path
                d="M0,92 C180,34 340,110 520,70 C700,30 860,118 1040,74 C1200,36 1300,82 1440,66 L1440,600 L0,600 Z"
                fill={tone.waveFillSoft}
              />
            </svg>

            <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-white/10 to-white/25" />
          </div>

          {/* Text layer above water */}
          <div className="relative z-10">
            <InfoSection title="Current Value" icon="▣" colorClass={tone.section}>
              <p className="line-clamp-3 leading-6 text-slate-700">{card.currentValue}</p>
            </InfoSection>

            <Divider />

            <InfoSection title="Skills Demonstrated" icon="◎" colorClass={tone.section}>
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

            <InfoSection title="Next Fill Action" icon="✦" colorClass={tone.section}>
              <p className="line-clamp-3 leading-6 text-slate-700">{card.nextFillAction}</p>
            </InfoSection>

            <Divider />

            <InfoSection title="Timeline" icon="◷" colorClass={tone.section}>
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
      skill: "border-violet-200 bg-violet-50/85 text-violet-700",
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
      skill: "border-blue-200 bg-blue-50/85 text-blue-700",
    };
  }

  return {
    tag: "bg-teal-100/90 text-teal-700",
    number: "text-teal-600",
    section: "text-teal-700",
    water: "bg-gradient-to-t from-cyan-200/70 via-teal-100/58 to-cyan-50/22",
    waveFill: "rgba(20, 184, 166, 0.32)",
    waveFillSoft: "rgba(125, 211, 252, 0.26)",
    skill: "border-teal-200 bg-teal-50/85 text-teal-700",
  };
}

function InfoSection({
  title,
  icon,
  colorClass,
  children,
}: {
  title: string;
  icon: string;
  colorClass: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className={`mb-1.5 flex items-center gap-2 ${colorClass}`}>
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