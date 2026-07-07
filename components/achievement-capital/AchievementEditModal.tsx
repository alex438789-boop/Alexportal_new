"use client";

import { useEffect, useState } from "react";
import { AchievementCardData, AchievementStatus } from "./types";

type Props = {
  card: AchievementCardData | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedCard: AchievementCardData) => void;
};

export function AchievementEditModal({ card, open, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<AchievementCardData | null>(card);

  useEffect(() => {
    setDraft(card);
  }, [card]);

  if (!open || !draft) return null;

  const updateField = <K extends keyof AchievementCardData>(
    key: K,
    value: AchievementCardData[K]
  ) => setDraft({ ...draft, [key]: value });

  const handleSave = () => {
    onSave({ ...draft, updatedAt: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-5 backdrop-blur-sm">
      <div className="max-h-[90vh] w-[760px] overflow-y-auto rounded-[2rem] bg-white p-7 shadow-2xl">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Manual Edit
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Edit each field directly. Saved changes are recorded in the Capital Timeline.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5">
          <Field label="Title">
            <input className="input" value={draft.title} onChange={(e) => updateField("title", e.target.value)} />
          </Field>

          <Field label="Subtitle">
            <input className="input" value={draft.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} />
          </Field>

          <div className="grid grid-cols-3 gap-4">
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
                <option>Developing</option>
                <option>Validated</option>
                <option>Exported</option>
              </select>
            </Field>

            <Field label="Water Level">
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
              onChange={(e) => updateField("tags", toList(e.target.value))}
            />
          </Field>

          <Field label="Current Value">
            <textarea className="textarea" value={draft.currentValue} onChange={(e) => updateField("currentValue", e.target.value)} />
          </Field>

          <Field label="Skills Demonstrated">
            <input
              className="input"
              value={draft.skills.join(", ")}
              onChange={(e) => updateField("skills", toList(e.target.value))}
            />
          </Field>

          <Field label="Next Fill Action">
            <textarea className="textarea" value={draft.nextFillAction} onChange={(e) => updateField("nextFillAction", e.target.value)} />
          </Field>

          <Field label="Resume Bullet">
            <textarea className="textarea" value={draft.resumeBullet ?? ""} onChange={(e) => updateField("resumeBullet", e.target.value)} />
          </Field>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSave} className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function toList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
