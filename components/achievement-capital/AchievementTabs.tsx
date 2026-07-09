"use client";

import { useState } from "react";
import { AchievementCardData } from "./types";

type Props = {
  card: AchievementCardData;
  onPromoteActivity: (cardId: string, activityId: string) => void;
};

export function AchievementTabs({ card, onPromoteActivity }: Props) {
  const [tab, setTab] = useState<"overview" | "activity" | "milestones" | "goal" | "proof" | "timeline">("overview");

  return (
    <section className="mx-auto mt-6 max-w-[1040px] rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm md:mt-8 md:rounded-[2rem] md:p-6">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {[
          ["overview", "Overview"],
          ["activity", "Activity Log"],
          ["milestones", "Milestones"],
          ["goal", "Goal"],
          ["proof", "Proof"],
          ["timeline", "Capital Timeline"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
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
          <Block title="Water Level">{card.progress}% · {card.stage}</Block>
          <Block title="Time Invested">{formatMinutes(card.timeInvestedMinutes)}</Block>
          <Block title="Last Filled">{card.lastFilledAt || "Not filled yet"}</Block>
          <Block title="Next Gate">{card.nextGate}% · {card.gateStatus}</Block>
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

      {tab === "activity" && (
        <div className="space-y-3">
          {card.activities.length === 0 && <p className="text-sm text-slate-500">No activities logged yet.</p>}
          {[...card.activities].reverse().map((activity) => (
            <div key={activity.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{activity.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {activity.date} · {activity.activityType} · {activity.durationMinutes}m · +{activity.waterImpact}%
                  </p>
                </div>
                <button
                  disabled={activity.promotedToMilestone}
                  onClick={() => onPromoteActivity(card.id, activity.id)}
                  className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {activity.promotedToMilestone ? "Promoted" : "Promote to Milestone"}
                </button>
              </div>
              {activity.note && <p className="mt-3 text-sm leading-6 text-slate-600">{activity.note}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === "milestones" && (
        <div className="space-y-3">
          {card.milestones.length === 0 && <p className="text-sm text-slate-500">No milestones promoted yet.</p>}
          {[...card.milestones].reverse().map((milestone) => (
            <div key={milestone.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{milestone.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{milestone.date} · {milestone.milestoneType}</p>
                </div>
                {milestone.evidenceUrl && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">Evidence</span>}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{milestone.description}</p>
              {milestone.significance && <p className="mt-2 text-sm leading-6 text-slate-500">{milestone.significance}</p>}
            </div>
          ))}
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
                        <p className="mt-1 text-xs text-slate-400">
                          Deadline {milestone.deadline || "Not set"} · {milestone.type.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {milestone.status.replace("_", " ")}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          +{milestone.progressContribution}%
                        </span>
                      </div>
                    </div>
                    {milestone.nextAction && (
                      <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                        Next: {milestone.nextAction}
                      </p>
                    )}
                    <ul className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                      {milestone.completionCriteria.map((criterion) => (
                        <li key={criterion}>• {criterion}</li>
                      ))}
                    </ul>
                    {milestone.reviewNote && (
                      <p className="mt-3 text-sm leading-6 text-slate-500">Review: {milestone.reviewNote}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "proof" && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Block title="Evidence">
              {card.evidence.length === 0 && <p>No evidence added yet.</p>}
              {card.evidence.map((item) => (
                <div key={item.id} className="mb-3 rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              ))}
            </Block>
          </div>
          <div className="space-y-3">
            <Block title="Missing Evidence">
              {card.missingEvidence.length === 0 && <p>No missing evidence items.</p>}
              {card.missingEvidence.map((item) => (
                <div key={item.id} className="mb-3 rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              ))}
            </Block>
          </div>
          <Block title="Resume Bullet">{card.resumeBullet || "No resume bullet generated yet."}</Block>
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

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest}m`;
}
