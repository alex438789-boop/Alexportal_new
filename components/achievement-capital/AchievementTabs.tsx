"use client";

import { useState } from "react";
import { AchievementCardData } from "./types";

type Props = {
  card: AchievementCardData;
};

export function AchievementTabs({ card }: Props) {
  const [tab, setTab] = useState<"overview" | "goal" | "evidence" | "missing" | "resume" | "timeline">("overview");

  return (
    <section className="mx-auto mt-8 max-w-[1040px] rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex gap-2">
        {[
          ["overview", "Overview"],
          ["goal", "Goal"],
          ["evidence", "Evidence"],
          ["missing", "Missing Evidence"],
          ["resume", "Resume Bullet"],
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

      {tab === "goal" && (
        <div>
          {!card.goal && <p className="text-sm text-slate-500">No goal card linked yet.</p>}
          {card.goal && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Block title="Goal Title">{card.goal.title}</Block>
                <Block title="Goal Type">{card.goal.type}</Block>
                <Block title="Why It Matters">{card.goal.whyItMatters}</Block>
                <Block title="Success Metric">{card.goal.successMetric}</Block>
                <Block title="First Milestone">{card.goal.firstMilestone}</Block>
                <Block title="Current Blocker">{card.goal.currentBlocker}</Block>
                <Block title="Next Action">{card.goal.nextAction}</Block>
                <Block title="Strategic Value">{card.goal.strategicValue}</Block>
                <Block title="Income Potential">{card.goal.incomePotential}</Block>
                <Block title="Identity Signal">{card.goal.identitySignal}</Block>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <MetaBlock label="Timeline Start" value={card.goal.timelineStart} />
                <MetaBlock label="Target Review" value={card.goal.targetReviewDate} />
                <MetaBlock label="Long-term Target" value={card.goal.longTermTargetDate} />
              </div>

              <div className="space-y-3">
                {card.goal.milestones.map((milestone) => (
                  <div key={milestone.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{milestone.title}</p>
                        <p className="mt-1 text-xs text-slate-400">Deadline {milestone.deadline}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        +{milestone.progressContribution}%
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                      {milestone.completionCriteria.map((criterion) => (
                        <li key={criterion}>• {criterion}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "evidence" && (
        <div className="space-y-3">
          {card.evidence.length === 0 && <p className="text-sm text-slate-500">No evidence added yet.</p>}
          {card.evidence.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
              {item.source && <p className="mt-2 text-xs text-slate-400">{item.source}</p>}
              <p className="mt-3 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("zh-TW")}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "missing" && (
        <div className="space-y-3">
          {card.missingEvidence.length === 0 && (
            <p className="text-sm text-slate-500">No missing evidence items. This card is closer to resume-ready.</p>
          )}
          {card.missingEvidence.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{item.title}</p>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                  {item.status.replace("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "resume" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Block title="Resume Bullet">{card.resumeBullet || "No resume bullet generated yet."}</Block>
          <Block title="LinkedIn Version">
            {card.linkedinVersion || "No LinkedIn version generated yet."}
          </Block>
          <Block title="Interview Story">
            {card.interviewStory || "No interview story drafted yet."}
          </Block>
          <Block title="Portfolio Description">
            {card.portfolioDescription || "No portfolio description drafted yet."}
          </Block>
        </div>
      )}

      {tab === "timeline" && (
        <div className="space-y-4">
          {card.timeline.map((event) => (
            <div key={event.id} className="flex gap-4">
              <div className="mt-1 h-3 w-3 rounded-full bg-slate-950" />
              <div>
                <p className="font-medium text-slate-900">{event.label}</p>
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

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value || "Not set"}</p>
    </div>
  );
}
