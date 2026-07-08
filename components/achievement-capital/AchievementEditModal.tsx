"use client";

import { useEffect, useState } from "react";
import {
  AchievementCardData,
  AchievementEvidence,
  AchievementGoal,
  AchievementGoalMilestone,
  AchievementMissingEvidence,
  AchievementStatus,
} from "./types";
import {
  normalizeCard,
  normalizeEvidence,
  normalizeGoal,
  normalizeGoalMilestone,
  normalizeMissingEvidence,
} from "./cardStore";

type Props = {
  card: AchievementCardData | null;
  open: boolean;
  mode: "create" | "edit";
  canDelete: boolean;
  onClose: () => void;
  onSave: (updatedCard: AchievementCardData) => void;
  onDelete?: (cardId: string) => void;
};

export function AchievementEditModal({ card, open, mode, canDelete, onClose, onSave, onDelete }: Props) {
  const [draft, setDraft] = useState<AchievementCardData | null>(card);

  useEffect(() => {
    setDraft(card);
  }, [card]);

  if (!open || !draft) return null;

  const updateField = <K extends keyof AchievementCardData>(
    key: K,
    value: AchievementCardData[K]
  ) => {
    setDraft({ ...draft, [key]: value });
  };

  const handleSave = () => {
    onSave(
      normalizeCard({
        ...draft,
        updatedAt: new Date().toISOString(),
      })
    );
    onClose();
  };

  const handleDelete = () => {
    if (!onDelete || !canDelete) return;
    const confirmed = window.confirm("Delete this achievement card?");
    if (!confirmed) return;
    onDelete(draft.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-[760px] overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              {mode === "create" ? "Create Achievement Card" : "Edit Achievement Card"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "create"
                ? "Add a new card with the details you already know. We can refine it later."
                : "Modify each field manually. Changes are tracked in the card timeline."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4">
          <Field label="Title">
            <input className="input" value={draft.title} onChange={(e) => updateField("title", e.target.value)} />
          </Field>

          <Field label="Subtitle">
            <input className="input" value={draft.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} />
          </Field>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Category">
              <input className="input" value={draft.category} onChange={(e) => updateField("category", e.target.value)} />
            </Field>

            <Field label="Status">
              <select
                className="input"
                value={draft.status}
                onChange={(e) => updateField("status", e.target.value as AchievementStatus)}
              >
                <option>Idea</option>
                <option>In Progress</option>
                <option>Developing</option>
                <option>Validated</option>
                <option>Exported</option>
              </select>
            </Field>

            <Field label="Progress">
              <input
                className="input"
                type="number"
                min={0}
                max={100}
                value={draft.progress}
                onChange={(e) => updateField("progress", Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Tags">
            <input
              className="input"
              value={draft.tags.join(", ")}
              onChange={(e) => updateField("tags", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))}
            />
          </Field>

          <Field label="Current Value">
            <textarea className="textarea" value={draft.currentValue} onChange={(e) => updateField("currentValue", e.target.value)} />
          </Field>

          <Field label="Skills Demonstrated">
            <input
              className="input"
              value={draft.skills.join(", ")}
              onChange={(e) => updateField("skills", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))}
            />
          </Field>

          <Field label="Next Fill Action">
            <textarea className="textarea" value={draft.nextFillAction} onChange={(e) => updateField("nextFillAction", e.target.value)} />
          </Field>

          <Field label="Resume Bullet">
            <textarea className="textarea" value={draft.resumeBullet} onChange={(e) => updateField("resumeBullet", e.target.value)} />
          </Field>

          <Field label="Evidence (one item per line)">
            <textarea
              className="textarea"
              value={serializeEvidence(draft.evidence)}
              onChange={(e) => updateField("evidence", parseEvidence(e.target.value))}
            />
          </Field>

          <Field label="Missing Evidence (one item per line)">
            <textarea
              className="textarea"
              value={serializeMissingEvidence(draft.missingEvidence)}
              onChange={(e) => updateField("missingEvidence", parseMissingEvidence(e.target.value))}
            />
          </Field>

          <Field label="LinkedIn Version">
            <textarea className="textarea" value={draft.linkedinVersion} onChange={(e) => updateField("linkedinVersion", e.target.value)} />
          </Field>

          <Field label="Interview Story">
            <textarea className="textarea" value={draft.interviewStory} onChange={(e) => updateField("interviewStory", e.target.value)} />
          </Field>

          <Field label="Portfolio Description">
            <textarea className="textarea" value={draft.portfolioDescription} onChange={(e) => updateField("portfolioDescription", e.target.value)} />
          </Field>

          <Field label="Target Career Paths">
            <textarea
              className="textarea"
              value={draft.targetCareerPaths.join("\n")}
              onChange={(e) =>
                updateField(
                  "targetCareerPaths",
                  e.target.value
                    .split("\n")
                    .map((value) => value.trim())
                    .filter(Boolean)
                )
              }
            />
          </Field>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Goal Card</p>
                <p className="mt-1 text-sm text-slate-500">Optional long-range goal linked to this achievement.</p>
              </div>
              {!draft.goal && (
                <button
                  onClick={() => updateField("goal", createBlankGoal())}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Add Goal
                </button>
              )}
            </div>

            {draft.goal && (
              <div className="grid gap-4">
                <Field label="Goal Title">
                  <input
                    className="input"
                    value={draft.goal.title}
                    onChange={(e) => updateGoalField(draft, setDraft, "title", e.target.value)}
                  />
                </Field>
                <Field label="Goal Type">
                  <input
                    className="input"
                    value={draft.goal.type}
                    onChange={(e) => updateGoalField(draft, setDraft, "type", e.target.value)}
                  />
                </Field>
                <Field label="Why It Matters">
                  <textarea
                    className="textarea"
                    value={draft.goal.whyItMatters}
                    onChange={(e) => updateGoalField(draft, setDraft, "whyItMatters", e.target.value)}
                  />
                </Field>
                <Field label="Success Metric">
                  <textarea
                    className="textarea"
                    value={draft.goal.successMetric}
                    onChange={(e) => updateGoalField(draft, setDraft, "successMetric", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Timeline Start">
                    <input
                      className="input"
                      value={draft.goal.timelineStart}
                      onChange={(e) => updateGoalField(draft, setDraft, "timelineStart", e.target.value)}
                    />
                  </Field>
                  <Field label="Target Review Date">
                    <input
                      className="input"
                      type="date"
                      value={draft.goal.targetReviewDate}
                      onChange={(e) => updateGoalField(draft, setDraft, "targetReviewDate", e.target.value)}
                    />
                  </Field>
                  <Field label="Long-term Target Date">
                    <input
                      className="input"
                      type="date"
                      value={draft.goal.longTermTargetDate}
                      onChange={(e) => updateGoalField(draft, setDraft, "longTermTargetDate", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="First Milestone">
                  <input
                    className="input"
                    value={draft.goal.firstMilestone}
                    onChange={(e) => updateGoalField(draft, setDraft, "firstMilestone", e.target.value)}
                  />
                </Field>
                <Field label="Current Blocker">
                  <textarea
                    className="textarea"
                    value={draft.goal.currentBlocker}
                    onChange={(e) => updateGoalField(draft, setDraft, "currentBlocker", e.target.value)}
                  />
                </Field>
                <Field label="Goal Next Action">
                  <textarea
                    className="textarea"
                    value={draft.goal.nextAction}
                    onChange={(e) => updateGoalField(draft, setDraft, "nextAction", e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Energy Level Required">
                    <input
                      className="input"
                      value={draft.goal.energyLevelRequired}
                      onChange={(e) => updateGoalField(draft, setDraft, "energyLevelRequired", e.target.value)}
                    />
                  </Field>
                  <Field label="Strategic Value">
                    <input
                      className="input"
                      value={draft.goal.strategicValue}
                      onChange={(e) => updateGoalField(draft, setDraft, "strategicValue", e.target.value)}
                    />
                  </Field>
                  <Field label="Income Potential">
                    <input
                      className="input"
                      value={draft.goal.incomePotential}
                      onChange={(e) => updateGoalField(draft, setDraft, "incomePotential", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Identity Signal">
                  <textarea
                    className="textarea"
                    value={draft.goal.identitySignal}
                    onChange={(e) => updateGoalField(draft, setDraft, "identitySignal", e.target.value)}
                  />
                </Field>
                <Field label="Goal Milestones">
                  <textarea
                    className="textarea min-h-[180px]"
                    value={serializeMilestones(draft.goal.milestones)}
                    onChange={(e) =>
                      updateGoalField(draft, setDraft, "milestones", parseMilestones(e.target.value))
                    }
                  />
                </Field>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            {mode === "edit" && onDelete && (
              <button
                onClick={handleDelete}
                disabled={!canDelete}
                className="rounded-2xl border border-red-200 px-5 py-3 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Delete Card
              </button>
            )}
          </div>

          <div className="flex gap-3">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSave} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
            {mode === "create" ? "Create Card" : "Save Changes"}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function parseEvidence(value: string): AchievementEvidence[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, description = ""] = line.split("::").map((item) => item.trim());
      return normalizeEvidence({ title, description, type: "note" });
    });
}

function serializeEvidence(items: AchievementEvidence[]) {
  return items.map((item) => `${item.title}${item.description ? ` :: ${item.description}` : ""}`).join("\n");
}

function parseMissingEvidence(value: string): AchievementMissingEvidence[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, description = ""] = line.split("::").map((item) => item.trim());
      return normalizeMissingEvidence({ title, description, status: "missing" });
    });
}

function serializeMissingEvidence(items: AchievementMissingEvidence[]) {
  return items.map((item) => `${item.title}${item.description ? ` :: ${item.description}` : ""}`).join("\n");
}

function createBlankGoal(): AchievementGoal {
  return normalizeGoal({
    title: "New Goal",
    type: "",
    milestones: [],
  });
}

function updateGoalField<K extends keyof AchievementGoal>(
  draft: AchievementCardData,
  setDraft: React.Dispatch<React.SetStateAction<AchievementCardData | null>>,
  key: K,
  value: AchievementGoal[K]
) {
  if (!draft.goal) return;
  setDraft({
    ...draft,
    goal: normalizeGoal({
      ...draft.goal,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }),
  });
}

function parseMilestones(value: string): AchievementGoalMilestone[] {
  return value
    .split("\n---\n")
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [header = "", ...criteria] = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const [title = "", deadline = "", contribution = "0"] = header.split("::").map((item) => item.trim());
      return normalizeGoalMilestone({
        title,
        deadline,
        progressContribution: Number(contribution.replace("+", "").replace("%", "")),
        completionCriteria: criteria.map((line) => line.replace(/^- /, "")),
      });
    });
}

function serializeMilestones(items: AchievementGoalMilestone[]) {
  return items
    .map(
      (item) =>
        `${item.title} :: ${item.deadline} :: +${item.progressContribution}%\n${item.completionCriteria
          .map((criterion) => `- ${criterion}`)
          .join("\n")}`
    )
    .join("\n---\n");
}
