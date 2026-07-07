"use client";

import { useState } from "react";
import { AchievementCardData } from "./types";

type Props = {
  card: AchievementCardData;
  active?: boolean;
  onEdit: () => void;
};

export function AchievementCard({ card, active = false, onEdit }: Props) {
  const [aiOpen, setAiOpen] = useState(false);
  const waterHeight = `${Math.min(Math.max(card.progress, 0), 100)}%`;

  return (
    <article
      className={`relative h-[620px] shrink-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft transition-all duration-500 ${
        active ? "w-[520px] scale-100 opacity-100" : "w-[310px] scale-95 opacity-62 blur-[1.5px]"
      }`}
    >
      <div
        className="card-water absolute bottom-0 left-0 right-0 transition-all duration-700"
        style={{ height: waterHeight }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/35 to-white/8" />

      <div className="relative z-10 flex h-full flex-col p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-xl bg-teal-100/90 px-4 py-2 text-sm font-semibold text-teal-700">
            {card.category}
          </span>

          <div className="flex items-center gap-2 text-[22px] font-semibold text-teal-600">
            {active && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                className="rounded-full p-1 text-lg text-slate-500 transition hover:bg-white/80 hover:text-slate-950"
                aria-label="Manual edit"
              >
                ✎
              </button>
            )}
            <span>{card.progress}%</span>
            {active && (
              <div className="relative">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setAiOpen((value) => !value);
                  }}
                  className="rounded-xl border border-slate-200 bg-white/80 px-3 py-1 text-sm font-semibold text-violet-600 shadow-sm backdrop-blur-md transition hover:bg-violet-50"
                  aria-label="AI actions"
                >
                  ✦ AI
                </button>

                {aiOpen && (
                  <div className="absolute right-0 top-11 z-30 w-64 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-2xl">
                    {[
                      "Fill This Card",
                      "Extract Skills",
                      "Find Missing Evidence",
                      "Reframe for Target Role",
                      "Generate Resume Bullet",
                    ].map((item) => (
                      <button
                        key={item}
                        className="block w-full rounded-xl px-4 py-3 text-left text-slate-700 transition hover:bg-slate-100"
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
          <h2 className={`${active ? "text-[30px]" : "text-[25px]"} font-semibold leading-tight tracking-tight text-slate-950`}>
            {card.title}
          </h2>
          <p className="mt-3 text-lg text-slate-600">{card.subtitle}</p>
        </div>

        <div className="mt-auto rounded-[1.6rem] border border-white/70 bg-white/66 p-6 shadow-sm backdrop-blur-xl">
          <InfoSection title="Current Value" icon="▣">
            <p className="line-clamp-3 leading-7 text-slate-700">{card.currentValue}</p>
          </InfoSection>

          <Divider />

          <InfoSection title="Skills Demonstrated" icon="◎">
            <div className="flex flex-wrap gap-2">
              {card.skills.slice(0, active ? 5 : 2).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-teal-200 bg-teal-50/85 px-3 py-1 text-xs font-medium text-teal-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </InfoSection>

          <Divider />

          <InfoSection title="Next Fill Action" icon="✦">
            <p className="leading-7 text-slate-700">{card.nextFillAction}</p>
          </InfoSection>

          <Divider />

          <InfoSection title="Timeline" icon="◷">
            <p className="text-sm text-slate-600">
              Created {formatDate(card.createdAt)}
              {active && <span> ｜ Last Updated {formatDate(card.updatedAt)}</span>}
            </p>
          </InfoSection>
        </div>
      </div>
    </article>
  );
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
      <div className="mb-2 flex items-center gap-2 text-teal-700">
        <span>{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="text-sm">{children}</div>
    </section>
  );
}

function Divider() {
  return <div className="my-4 h-px bg-slate-200/85" />;
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
