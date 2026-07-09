"use client";

import { useEffect, useState } from "react";
import { DEFAULT_ACTIVITY_WATER_IMPACT } from "./cardStore";
import {
  AchievementActivityType,
  AchievementCardData,
  AchievementEnergyLevel,
  AchievementProductivityType,
} from "./types";

type Props = {
  open: boolean;
  loading: boolean;
  message: string | null;
  cards: AchievementCardData[];
  activeCardId?: string;
  onClose: () => void;
  onSubmit: (input: string) => void;
  onManualCreate: () => void;
  onLogActivity: (input: {
    cardId: string;
    title: string;
    note: string;
    durationMinutes: number;
    activityType: AchievementActivityType;
    productivityType?: AchievementProductivityType;
    energyLevel?: AchievementEnergyLevel;
    waterImpact: number;
  }) => void;
};

export function NewInputModal({
  open,
  loading,
  message,
  cards,
  activeCardId,
  onClose,
  onSubmit,
  onManualCreate,
  onLogActivity,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-[920px] overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">New Input</h2>
            <p className="mt-1 text-sm text-slate-500">
              貼上一段想法、專案更新、證據線索或進度紀錄，系統會判斷要新增卡片或更新既有卡片。
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500 hover:bg-slate-200"
          >
            關閉
          </button>
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-900">New Input 有兩種用法</p>
          <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-2">
            <p>
              <span className="font-medium text-slate-800">Generate / Update：</span>
              貼上一整段想法或專案更新，讓系統判斷要新增卡片或更新既有卡片。
            </p>
            <p>
              <span className="font-medium text-slate-800">Quick Capture：</span>
              記錄今天做了什麼，替指定卡片新增 Activity、投入時間，並依活動類型加水。
            </p>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);
            const input = String(formData.get("input") ?? "").trim();
            if (!input) return;
            onSubmit(input);
          }}
        >
          <textarea
            name="input"
            className="textarea min-h-[180px]"
            placeholder="例如：今天把 YardenPORTAL 的 RSS topic scoring 做完，也整理了 prototype workflow，感覺可以把 progress 提到 82%，但還缺一張流程截圖和使用者測試證據。"
            disabled={loading}
          />

          {message && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              {message}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onManualCreate}
              disabled={loading}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              手動新增
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "判斷中..." : "自動生成 / 更新"}
            </button>
          </div>
        </form>

        <QuickCaptureInsideModal
          cards={cards}
          activeCardId={activeCardId}
          onLogActivity={(input) => {
            onLogActivity(input);
            onClose();
          }}
        />
      </div>
    </div>
  );
}

function QuickCaptureInsideModal({
  cards,
  activeCardId,
  onLogActivity,
}: {
  cards: AchievementCardData[];
  activeCardId?: string;
  onLogActivity: Props["onLogActivity"];
}) {
  const [cardId, setCardId] = useState(activeCardId ?? cards[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [activityType, setActivityType] = useState<AchievementActivityType>("input");
  const [productivityType, setProductivityType] = useState<AchievementProductivityType | "">("");
  const [energyLevel, setEnergyLevel] = useState<AchievementEnergyLevel | "">("");
  const [waterImpact, setWaterImpact] = useState(DEFAULT_ACTIVITY_WATER_IMPACT.input);

  useEffect(() => {
    if (activeCardId) setCardId(activeCardId);
  }, [activeCardId]);

  const updateActivityType = (value: AchievementActivityType) => {
    setActivityType(value);
    setWaterImpact(DEFAULT_ACTIVITY_WATER_IMPACT[value]);
  };

  return (
    <section className="mt-6 border-t border-slate-200 pt-5">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quick Capture</p>
        <p className="mt-1 text-sm text-slate-500">
          用來記錄日常投入。Activity 會增加時間投入，並依類型替卡片加水；這不是新任務，也不是待辦清單。
        </p>
      </div>

      <div className="grid gap-3">
        <select className="input" value={cardId} onChange={(event) => setCardId(event.target.value)}>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.title}
            </option>
          ))}
        </select>
        <input
          className="input"
          value={title}
          placeholder="What did you do today? 例如：今天查了 EU CBAM 和台灣碳費"
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className="grid gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          <MiniField label="投入時間" helper="分鐘">
            <input
              className="input"
              type="number"
              min={0}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
            />
          </MiniField>
          <MiniField label="活動類型" helper="決定預設加水幅度">
            <select
              className="input"
              value={activityType}
              onChange={(event) => updateActivityType(event.target.value as AchievementActivityType)}
            >
              <option value="input">input</option>
              <option value="processing">processing</option>
              <option value="structuring">structuring</option>
              <option value="output">output</option>
              <option value="proof">proof</option>
            </select>
          </MiniField>
          <MiniField label="產出性質" helper="選填">
            <select
              className="input"
              value={productivityType}
              onChange={(event) => setProductivityType(event.target.value as AchievementProductivityType | "")}
            >
              <option value="">productivity</option>
              <option value="output">output</option>
              <option value="learning">learning</option>
              <option value="strategic">strategic</option>
              <option value="recovery">recovery</option>
              <option value="identity">identity</option>
            </select>
          </MiniField>
          <MiniField label="能量需求" helper="選填">
            <select
              className="input"
              value={energyLevel}
              onChange={(event) => setEnergyLevel(event.target.value as AchievementEnergyLevel | "")}
            >
              <option value="">energy</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </MiniField>
          <MiniField label="加水幅度" helper="% 可手動調整">
            <input
              className="input"
              type="number"
              min={0}
              max={25}
              value={waterImpact}
              onChange={(event) => setWaterImpact(Number(event.target.value))}
            />
          </MiniField>
        </div>
        <p className="text-xs leading-5 text-slate-500">
          Activity type：input 資料蒐集、processing 整理理解、structuring 架構成形、output 產出成果、proof 證據驗證。加水幅度會依活動類型預填；你可以手動調整，但系統仍會用水位上限避免假進度。
        </p>
        <button
          type="button"
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          onClick={() => {
            if (!cardId || !title.trim()) return;
            onLogActivity({
              cardId,
              title,
              note: title,
              durationMinutes,
              activityType,
              productivityType: productivityType || undefined,
              energyLevel: energyLevel || undefined,
              waterImpact,
            });
            setTitle("");
          }}
        >
          Log Activity
        </button>
      </div>
    </section>
  );
}

function MiniField({
  label,
  helper,
  children,
}: {
  label: string;
  helper: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </span>
      {children}
      <span className="mt-1 block text-[11px] leading-4 text-slate-400">{helper}</span>
    </label>
  );
}
