"use client";

import { useState } from "react";
import { AchievementCardData } from "./types";

type Props = { card: AchievementCardData };

export function AchievementTabs({ card }: Props) {
  const [tab, setTab] = useState<"overview" | "evidence" | "timeline">("overview");

  return (
    <section className="mx-auto mt-8 max-w-5xl rounded-[2rem] border border-slate-200 bg-white/82 p-6 shadow-sm backdrop-blur-xl">
      <div className="mb-6 flex gap-2">
        {[
          ["overview", "Overview"],
          ["evidence", "Evidence"],
          ["timeline", "Capital Timeline"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === id
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-500 hover:text-slate-950"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Block title="Current Value">{card.currentValue}</Block>
          <Block title="Next Fill Action">{card.nextFillAction}</Block>
          <Block title="Skills">
            <div className="flex flex-wrap gap-2">
              {card.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                  {skill}
                </span>
              ))}
            </div>
          </Block>
          <Block title="Resume Bullet">{card.resumeBullet || "No resume bullet generated yet."}</Block>
        </div>
      )}

      {tab === "evidence" && (
        <div className="space-y-3">
          {card.evidence.length === 0 && <p className="text-sm text-slate-500">No evidence added yet.</p>}
          {card.evidence.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
              <p className="mt-3 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "timeline" && (
        <div className="space-y-5">
          {card.timeline.map((event) => (
            <div key={event.id} className="flex gap-4">
              <div className="mt-1.5 h-3 w-3 rounded-full bg-violet-600" />
              <div>
                <p className="font-medium text-slate-950">{event.type}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{event.description}</p>
                <p className="mt-2 text-xs text-slate-400">{formatDate(event.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="text-sm leading-6 text-slate-700">{children}</div>
    </div>
  );
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
