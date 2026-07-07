"use client";

import { useMemo, useState } from "react";
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

  const activeCard = cards[activeIndex];

  const positionedCards = useMemo(() => {
    return cards.map((card, index) => {
      const diff = index - activeIndex;
      const side = diff === 0 ? "active" : diff < 0 ? "left" : "right";
      return { card, index, side, diff };
    });
  }, [cards, activeIndex]);

  const saveCard = (updatedCard: AchievementCardData) => {
    setCards((prev) =>
      prev.map((card) => {
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

  return (
    <main className="flex min-h-screen overflow-hidden bg-[#f8fbff] text-slate-950">
      <Sidebar />

      <section className="relative flex-1 overflow-hidden px-8 py-8">
        <header className="mx-auto flex max-w-[1320px] items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl text-violet-600">✦</span>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Achievement Capital
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Turn experience, ideas, and projects into fillable career capital cards.
            </p>
          </div>

          <button className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(124,58,237,0.25)] hover:bg-violet-500">
            ✦ New Input
          </button>
        </header>

        <section className="relative mx-auto mt-8 h-[760px] max-w-[1320px] overflow-visible">
          {positionedCards.map(({ card, index, diff }) => {
            if (Math.abs(diff) > 1) return null;
            const isActive = diff === 0;
            const translate = isActive
              ? "translate(-50%, -50%)"
              : diff < 0
                ? "translate(calc(-50% - 430px), -50%)"
                : "translate(calc(-50% + 430px), -50%)";

            return (
              <div
                key={card.id}
                className="absolute left-1/2 top-1/2 transition-all duration-500"
                style={{
                  transform: translate,
                  zIndex: isActive ? 20 : 10,
                }}
                onClick={() => setActiveIndex(index)}
              >
                <AchievementCard
                  card={card}
                  active={isActive}
                  side={isActive ? undefined : diff < 0 ? "left" : "right"}
                  onEdit={() => setEditingCard(card)}
                />
              </div>
            );
          })}

          <button
            onClick={() => setActiveIndex((value) => Math.max(0, value - 1))}
            className="absolute left-4 top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-slate-900 shadow-xl hover:bg-slate-50"
            aria-label="Previous card"
          >
            ‹
          </button>
          <button
            onClick={() => setActiveIndex((value) => Math.min(cards.length - 1, value + 1))}
            className="absolute right-4 top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-slate-900 shadow-xl hover:bg-slate-50"
            aria-label="Next card"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 gap-3">
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

        <AchievementTabs card={activeCard} />

        <button className="fixed bottom-7 right-7 z-40 rounded-full bg-slate-950 px-6 py-5 text-sm font-semibold text-white shadow-xl hover:bg-slate-800">
          Reset
        </button>
      </section>

      <AchievementEditModal
        card={editingCard}
        open={Boolean(editingCard)}
        onClose={() => setEditingCard(null)}
        onSave={saveCard}
      />
    </main>
  );
}
