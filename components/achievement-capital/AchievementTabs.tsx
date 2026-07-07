"use client";

import { useState } from "react";
import { AchievementCardData } from "./types";

type Props = {
  card: AchievementCardData;
};

export function AchievementTabs({ card }: Props) {
  const [tab, setTab] = useState<"overview" | "evidence" | "timeline">("overview");

  return (
    <section className="mx-auto mt-8 max-w-[1040px] rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex gap-2">
        {[
          ["overview", "Overview"],
          ["evidence", "Evidence"],
          ["timeline", "Capital Timeline"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500 hover:text-slate-900"
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
                <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{skill}</span>
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
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
              <p className="mt-3 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("zh-TW")}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "timeline" && (
        <div className="space-y-4">
          {card.timeline.map((event) => (
            <div key={event.id} className="flex gap-4">
              <div className="mt-1 h-3 w-3 rounded-full bg-slate-950" />
              <div>
                <p className="font-medium text-slate-900">{event.type}</p>
                <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(event.createdAt).toLocaleString("zh-TW")}</p>
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
