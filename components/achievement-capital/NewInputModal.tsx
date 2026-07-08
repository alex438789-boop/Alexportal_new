"use client";

type Props = {
  open: boolean;
  loading: boolean;
  message: string | null;
  onClose: () => void;
  onSubmit: (input: string) => void;
  onManualCreate: () => void;
};

export function NewInputModal({ open, loading, message, onClose, onSubmit, onManualCreate }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[720px] rounded-[2rem] bg-white p-6 shadow-2xl">
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
      </div>
    </div>
  );
}
