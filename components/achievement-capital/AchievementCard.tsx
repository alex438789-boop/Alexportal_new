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
          ? "h-[690px] w-[500px] opacity-100"
          : "h-[560px] w-[320px] opacity-52 blur-[1.3px]"
      }`}
    >
      {/* Dynamic water level. Height follows the card progress exactly. */}
      <div
        className={`absolute bottom-0 left-0 right-0 overflow-visible transition-all duration-700 ${tone.water}`}
        style={{ height: waterHeight }}
        aria-hidden="true"
      >
        <div className={`career-water-surface career-water-a ${tone.wave}`} />
        <div className={`career-water-surface career-water-b ${tone.waveSoft}`} />
        <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_16%_30%,rgba(255,255,255,.55)_0_2px,transparent_2px),radial-gradient(circle_at_62%_52%,rgba(255,255,255,.38)_0_3px,transparent_3px),radial-gradient(circle_at_78%_74%,rgba(255,255,255,.28)_0_2px,transparent_2px)]" />
      </div>

      {/* Clean white wash so the card still feels light. */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/50 to-white/20" />

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

        <div className="mt-auto rounded-[1.45rem] border border-white/75 bg-white/72 p-5 shadow-sm backdrop-blur-xl">
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
      water: "bg-gradient-to-t from-teal-200/72 via-cyan-100/64 to-cyan-50/10",
      wave: "bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,.34)_0%,rgba(125,211,252,.20)_52%,transparent_74%)]",
      waveSoft: "bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,.22)_0%,rgba(165,243,252,.16)_55%,transparent_76%)]",
      skill: "border-teal-200 bg-teal-50/85 text-teal-700",
    };
  }

  if (haystack.includes("finance")) {
    return {
      tag: "bg-violet-100/90 text-violet-700",
      number: "text-violet-600",
      water: "bg-gradient-to-t from-violet-200/72 via-purple-100/56 to-violet-50/10",
      wave: "bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,.34)_0%,rgba(196,181,253,.20)_52%,transparent_74%)]",
      waveSoft: "bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,.22)_0%,rgba(221,214,254,.16)_55%,transparent_76%)]",
      skill: "border-violet-200 bg-violet-50/85 text-violet-700",
    };
  }

  if (haystack.includes("writing") || haystack.includes("market")) {
    return {
      tag: "bg-blue-100/90 text-blue-700",
      number: "text-blue-600",
      water: "bg-gradient-to-t from-blue-200/72 via-sky-100/60 to-blue-50/10",
      wave: "bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,.32)_0%,rgba(147,197,253,.20)_52%,transparent_74%)]",
      waveSoft: "bg-[radial-gradient(ellipse_at_center,rgba(96,165,250,.22)_0%,rgba(191,219,254,.16)_55%,transparent_76%)]",
      skill: "border-blue-200 bg-blue-50/85 text-blue-700",
    };
  }

  return {
    tag: "bg-teal-100/90 text-teal-700",
    number: "text-teal-600",
    water: "bg-gradient-to-t from-cyan-200/72 via-teal-100/58 to-cyan-50/10",
    wave: "bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,.34)_0%,rgba(125,211,252,.20)_52%,transparent_74%)]",
    waveSoft: "bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,.22)_0%,rgba(165,243,252,.16)_55%,transparent_76%)]",
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
