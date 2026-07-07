"use client";

import { useState } from "react";
import { Sidebar } from "@/components/achievement-capital/Sidebar";
import { AchievementCard } from "@/components/achievement-capital/AchievementCard";
import { AchievementEditModal } from "@/components/achievement-capital/AchievementEditModal";
import { AchievementTabs } from "@/components/achievement-capital/AchievementTabs";
import { mockAchievementCards } from "@/components/achievement-capital/mockData";
import { AchievementCardData } from "@/components/achievement-capital/types";

export default function AchievementCapitalPage() {
  const [cards, setCards] = useState<AchievementCardData[]>(mockAchievementCards);
  const [activeIndex, setActiveIndex] = useState(1);
  const [editingCard, setEditingCard] = useState<AchievementCardData | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const activeCard = cards[activeIndex];

  const saveCard = (updatedCard: AchievementCardData) => {
    setCards((previousCards) =>
      previousCards.map((card) => {
        if (card.id !== updatedCard.id) return card;

        const progressChanged = card.progress !== updatedCard.progress;

        return {
          ...updatedCard,
          timeline: [
            ...card.timeline,
            {
              id: `event-${Date.now()}`,
              type: "Manual edit",
              description: progressChanged
                ? `Updated card fields. Progress changed from ${card.progress}% to ${updatedCard.progress}%.`
                : "Updated card fields manually.",
              oldProgress: card.progress,
              newProgress: updatedCard.progress,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const goPrevious = () => setActiveIndex((index) => Math.max(index - 1, 0));
  const goNext = () => setActiveIndex((index) => Math.min(index + 1, cards.length - 1));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfcff] text-slate-950">
      <Sidebar />

      <section className="ml-[260px] min-h-screen px-12 py-9">
        <header className="mx-auto flex max-w-[1320px] items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl text-violet-600">✦</span>
              <h1 className="text-[34px] font-semibold tracking-tight text-slate-950">
                Achievement Capital
              </h1>
            </div>
            <p className="mt-2 text-lg text-slate-600">
              Turn experience, ideas, and projects into fillable career capital cards.
            </p>
          </div>

          <button className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700">
            ✦ New Input
          </button>
        </header>

        <section className="relative mx-auto mt-12 h-[680px] max-w-[1320px] overflow-visible">
          <button
            onClick={goPrevious}
            className="absolute left-2 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-slate-900 shadow-lg transition hover:scale-105 disabled:opacity-35"
            aria-label="Previous card"
            disabled={activeIndex === 0}
          >
            ‹
          </button>

          <div className="absolute inset-0 flex items-center justify-center overflow-visible">
            {cards.map((card, index) => {
              const delta = index - activeIndex;
              const visible = Math.abs(delta) <= 1;
              if (!visible) return null;

              const transform =
                delta === 0
                  ? "translate(-50%, -50%) scale(1)"
                  : delta < 0
                    ? "translate(calc(-50% - 470px), -50%) scale(.95)"
                    : "translate(calc(-50% + 470px), -50%) scale(.95)";

              return (
                <button
                  key={card.id}
                  onClick={() => setActiveIndex(index)}
                  className="absolute left-1/2 top-1/2 text-left transition-all duration-500"
                  style={{ transform, zIndex: delta === 0 ? 10 : 4 }}
                >
                  <AchievementCard
                    card={card}
                    active={delta === 0}
                    side={delta < 0 ? "left" : delta > 0 ? "right" : undefined}
                    onEdit={() => setEditingCard(card)}
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-slate-900 shadow-lg transition hover:scale-105 disabled:opacity-35"
            aria-label="Next card"
            disabled={activeIndex === cards.length - 1}
          >
            ›
          </button>

          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 justify-center gap-3">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => setActiveIndex(index)}
                className={`h-3 w-3 rounded-full transition ${
                  index === activeIndex ? "bg-violet-600" : "bg-slate-300"
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-[1120px]">
          <AchievementTabs card={activeCard} />
        </div>

        <button
          onClick={() => setResetOpen(true)}
          className="fixed bottom-7 right-7 rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white shadow-2xl transition hover:bg-slate-800"
        >
          Reset
        </button>
      </section>

      {resetOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/25 p-5 backdrop-blur-sm">
          <div className="w-[460px] rounded-[2rem] bg-white p-7 shadow-2xl">
            <h2 className="text-2xl font-semibold text-slate-950">Reset Mode</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Recommended now: fill one card by 5%. Start with the active card’s next fill action.
            </p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Suggested Card</p>
              <p className="mt-2 font-semibold text-slate-950">{activeCard.title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{activeCard.nextFillAction}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-slate-600" onClick={() => setResetOpen(false)}>
                Close
              </button>
              <button className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white" onClick={() => setResetOpen(false)}>
                Open Card
              </button>
            </div>
          </div>
        </div>
      )}

      <AchievementEditModal
        card={editingCard}
        open={Boolean(editingCard)}
        onClose={() => setEditingCard(null)}
        onSave={saveCard}
      />
    </main>
  );
}
