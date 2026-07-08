"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/achievement-capital/Sidebar";
import { AchievementCard } from "@/components/achievement-capital/AchievementCard";
import { AchievementEditModal } from "@/components/achievement-capital/AchievementEditModal";
import { NewInputModal } from "@/components/achievement-capital/NewInputModal";
import { AchievementTabs } from "@/components/achievement-capital/AchievementTabs";
import { AchievementCardData } from "@/components/achievement-capital/types";
import {
  createEmptyCardDraft,
  createTimelineEvent,
  generateResumeBullet,
  getSeedCards,
  inferMissingEvidence,
  loadStoredCards,
  normalizeCard,
  normalizeEvidence,
  normalizeMissingEvidence,
  persistCards,
  reframeForTargetRole,
} from "@/components/achievement-capital/cardStore";

type NewInputAgentResult = {
  mode: "create" | "update";
  targetCardId?: string;
  confidence: number;
  rationale: string;
  card: Partial<AchievementCardData>;
};

type NewInputAgentResponse = {
  result?: NewInputAgentResult;
  provider?: string;
  warning?: string;
  error?: string;
};

export default function AchievementCapitalPage() {
  const [cards, setCards] = useState<AchievementCardData[]>(() => getSeedCards());
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<AchievementCardData | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("edit");
  const [resetPrompt, setResetPrompt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [newInputOpen, setNewInputOpen] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentMessage, setAgentMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadedCards = loadStoredCards();
    setCards(loadedCards);
    setActiveCardId(loadedCards[1]?.id ?? loadedCards[0]?.id ?? null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (cards.length === 0) return;
    persistCards(cards);
  }, [cards, hydrated]);

  useEffect(() => {
    if (cards.length === 0) return;
    if (!activeCardId || !cards.some((card) => card.id === activeCardId)) {
      setActiveCardId(cards[Math.min(1, cards.length - 1)]?.id ?? cards[0]?.id ?? null);
    }
  }, [cards, activeCardId]);

  const activeIndex = Math.max(
    0,
    cards.findIndex((card) => card.id === activeCardId)
  );
  const activeCard = cards[activeIndex] ?? cards[0];

  const positionedCards = useMemo(() => {
    return cards.map((card, index) => {
      const diff = index - activeIndex;
      const side = diff === 0 ? "active" : diff < 0 ? "left" : "right";
      return { card, index, side, diff };
    });
  }, [cards, activeIndex]);

  const applyCardUpdate = (
    cardId: string,
    transform: (card: AchievementCardData) => AchievementCardData
  ) => {
    setCards((prev) => prev.map((card) => (card.id === cardId ? normalizeCard(transform(card)) : card)));
  };

  const saveCard = (updatedCard: AchievementCardData) => {
    const normalizedCard = normalizeCard({
      ...updatedCard,
      updatedAt: new Date().toISOString(),
    });

    if (editorMode === "create") {
      const createdCard = normalizeCard({
        ...normalizedCard,
        timeline: [
          createTimelineEvent({
            type: "card_created",
            label: "Card created",
            description: "Created a new achievement card from New Input.",
            actor: "user",
            newProgress: normalizedCard.progress,
          }),
        ],
        missingEvidence: normalizedCard.missingEvidence.length
          ? normalizedCard.missingEvidence
          : inferMissingEvidence(normalizedCard),
      });

      setCards((prev) => [...prev, createdCard]);
      setActiveCardId(createdCard.id);
      setEditingCard(null);
      return;
    }

    applyCardUpdate(normalizedCard.id, (existingCard) => {
      const timeline = [...existingCard.timeline];
      const progressChanged = existingCard.progress !== normalizedCard.progress;
      const evidenceChanged =
        JSON.stringify(existingCard.evidence) !== JSON.stringify(normalizedCard.evidence);
      const missingEvidenceChanged =
        JSON.stringify(existingCard.missingEvidence) !== JSON.stringify(normalizedCard.missingEvidence);
      const resumeBulletChanged = existingCard.resumeBullet !== normalizedCard.resumeBullet;

      timeline.push(
        createTimelineEvent({
          type: "manual_edit",
          label: "Manual edit",
          description: progressChanged
            ? `Updated card fields. Progress changed from ${existingCard.progress}% to ${normalizedCard.progress}%.`
            : "Updated card fields manually.",
          actor: "user",
          oldProgress: existingCard.progress,
          newProgress: normalizedCard.progress,
        })
      );

      if (progressChanged) {
        timeline.push(
          createTimelineEvent({
            type: "progress_changed",
            label: "Progress changed",
            description: `Water level updated from ${existingCard.progress}% to ${normalizedCard.progress}%.`,
            actor: "user",
            oldProgress: existingCard.progress,
            newProgress: normalizedCard.progress,
          })
        );
      }

      if (evidenceChanged) {
        timeline.push(
          createTimelineEvent({
            type: "evidence_updated",
            label: "Evidence updated",
            description: "Updated the evidence list for this achievement.",
            actor: "user",
          })
        );
      }

      if (missingEvidenceChanged) {
        timeline.push(
          createTimelineEvent({
            type: "missing_evidence_updated",
            label: "Missing evidence updated",
            description: "Updated the missing evidence checklist.",
            actor: "user",
          })
        );
      }

      if (resumeBulletChanged) {
        timeline.push(
          createTimelineEvent({
            type: "resume_bullet_updated",
            label: "Resume bullet updated",
            description: "Updated the resume bullet manually.",
            actor: "user",
          })
        );
      }

      return {
        ...normalizedCard,
        timeline,
      };
    });

    setEditingCard(null);
  };

  const deleteCard = (cardId: string) => {
    if (cards.length <= 1) return;

    const index = cards.findIndex((card) => card.id === cardId);
    const fallbackCard = cards[index + 1] ?? cards[index - 1] ?? cards[0];
    setCards((prev) => prev.filter((card) => card.id !== cardId));
    setActiveCardId(fallbackCard?.id ?? null);
    setEditingCard(null);
  };

  const openManualCreate = () => {
    setNewInputOpen(false);
    setAgentMessage(null);
    setEditorMode("create");
    setEditingCard(createEmptyCardDraft());
  };

  const applyNewInputAgentResult = (result: NewInputAgentResult, provider?: string, warning?: string) => {
    const now = new Date().toISOString();
    const patch = result.card ?? {};
    const evidencePatch = Array.isArray(patch.evidence) ? patch.evidence.map(normalizeEvidence) : [];
    const missingEvidencePatch = Array.isArray(patch.missingEvidence)
      ? patch.missingEvidence.map(normalizeMissingEvidence)
      : [];
    const providerLabel = provider === "local-fallback" ? "本機備援" : "Gemini 2.5 Flash";
    const warningText = warning ? `（${warning}）` : "";

    if (result.mode === "update" && result.targetCardId) {
      const targetCard = cards.find((card) => card.id === result.targetCardId);
      const updatedTitle = patch.title?.trim() || targetCard?.title || "這張卡片";

      setCards((prev) =>
        prev.map((card) => {
          if (card.id !== result.targetCardId) return card;

          const previousProgress = card.progress;
          const progress =
            typeof patch.progress === "number" && Number.isFinite(patch.progress)
              ? Math.max(0, Math.min(100, patch.progress))
              : card.progress;
          const progressChanged = previousProgress !== progress;

          const nextCard = normalizeCard({
            ...card,
            title: patch.title?.trim() || card.title,
            subtitle: patch.subtitle?.trim() || card.subtitle,
            category: patch.category?.trim() || card.category,
            tags: mergeLists(card.tags, patch.tags),
            status: patch.status ?? card.status,
            progress,
            currentValue: patch.currentValue?.trim() || card.currentValue,
            skills: mergeLists(card.skills, patch.skills),
            nextFillAction: patch.nextFillAction?.trim() || card.nextFillAction,
            resumeBullet: patch.resumeBullet?.trim() || card.resumeBullet,
            linkedinVersion: patch.linkedinVersion?.trim() || card.linkedinVersion,
            interviewStory: patch.interviewStory?.trim() || card.interviewStory,
            portfolioDescription: patch.portfolioDescription?.trim() || card.portfolioDescription,
            targetCareerPaths: mergeLists(card.targetCareerPaths, patch.targetCareerPaths),
            evidence: evidencePatch.length ? [...card.evidence, ...evidencePatch] : card.evidence,
            missingEvidence: missingEvidencePatch.length ? missingEvidencePatch : card.missingEvidence,
            updatedAt: now,
            timeline: [
              ...card.timeline,
              createTimelineEvent({
                type: "ai_action",
                label: "New Input agent",
                description: `${providerLabel} interpreted the new input: ${result.rationale}${warningText}`,
                actor: provider === "local-fallback" ? "system" : "ai",
                oldProgress: previousProgress,
                newProgress: progress,
              }),
              ...(progressChanged
                ? [
                    createTimelineEvent({
                      type: "progress_changed" as const,
                      label: "Progress changed",
                      description: `Progress updated from ${previousProgress}% to ${progress}% from New Input.`,
                      actor: provider === "local-fallback" ? "system" : "ai",
                      oldProgress: previousProgress,
                      newProgress: progress,
                    }),
                  ]
                : []),
            ],
          });

          return nextCard;
        })
      );

      setActiveCardId(result.targetCardId);
      setAgentMessage(`${providerLabel} 已更新「${updatedTitle}」。`);
      return;
    }

    const draft = createEmptyCardDraft();
    const createdCard = normalizeCard({
      ...draft,
      ...patch,
      id: draft.id,
      title: patch.title?.trim() || draft.title,
      subtitle: patch.subtitle?.trim() || draft.subtitle,
      category: patch.category?.trim() || draft.category,
      tags: patch.tags?.filter(Boolean) ?? draft.tags,
      skills: patch.skills?.filter(Boolean) ?? draft.skills,
      evidence: evidencePatch,
      missingEvidence: missingEvidencePatch.length ? missingEvidencePatch : inferMissingEvidence(patch),
      createdAt: now,
      updatedAt: now,
      timeline: [
        createTimelineEvent({
          type: "card_created",
          label: "Card created",
          description: `${providerLabel} created this card from New Input: ${result.rationale}${warningText}`,
          actor: provider === "local-fallback" ? "system" : "ai",
          newProgress: patch.progress,
        }),
      ],
    });

    setCards((prev) => [...prev, createdCard]);
    setActiveCardId(createdCard.id);
    setAgentMessage(`${providerLabel} 已建立「${createdCard.title}」。`);
  };

  const submitNewInput = async (input: string) => {
    setAgentLoading(true);
    setAgentMessage("正在讀取你的輸入，判斷要新增卡片還是更新既有卡片...");

    try {
      const response = await fetch("/api/achievement-capital/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          cards: cards.map((card) => ({
            id: card.id,
            title: card.title,
            subtitle: card.subtitle,
            category: card.category,
            tags: card.tags,
            progress: card.progress,
            currentValue: card.currentValue,
            skills: card.skills,
            nextFillAction: card.nextFillAction,
            resumeBullet: card.resumeBullet,
          })),
        }),
      });

      const payload = (await response.json()) as NewInputAgentResponse;
      if (!response.ok || !payload.result) {
        throw new Error(payload.error || "New Input agent failed.");
      }

      applyNewInputAgentResult(payload.result, payload.provider, payload.warning);
      setNewInputOpen(false);
    } catch (error) {
      setAgentMessage(error instanceof Error ? error.message : "New Input agent 暫時無法處理這段輸入。");
    } finally {
      setAgentLoading(false);
    }
  };

  const runAiAction = (cardId: string, action: string) => {
    applyCardUpdate(cardId, (card) => {
      const nextCard = normalizeCard({ ...card });

      if (action === "Fill This Card") {
        nextCard.currentValue =
          nextCard.currentValue ||
          `${nextCard.title} is becoming a reusable career asset with clearer proof, framing, and export-ready language.`;
        nextCard.progress = Math.min(100, nextCard.progress + 10);
        nextCard.nextFillAction = "Turn one proof point into a tighter case-study style explanation.";
      }

      if (action === "Extract Skills") {
        const suggestions = [nextCard.category, ...nextCard.tags]
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 3);
        nextCard.skills = Array.from(new Set([...nextCard.skills, ...suggestions]));
        nextCard.progress = Math.min(100, nextCard.progress + 6);
      }

      if (action === "Find Missing Evidence") {
        nextCard.missingEvidence = inferMissingEvidence(nextCard);
      }

      if (action === "Reframe for Target Role") {
        const reframed = reframeForTargetRole(nextCard);
        nextCard.linkedinVersion = reframed.linkedinVersion;
        nextCard.portfolioDescription = reframed.portfolioDescription;
      }

      if (action === "Generate Resume Bullet") {
        nextCard.resumeBullet = generateResumeBullet(nextCard);
      }

      nextCard.updatedAt = new Date().toISOString();
      nextCard.timeline = [
        ...nextCard.timeline,
        createTimelineEvent({
          type: action === "Generate Resume Bullet" ? "resume_bullet_generated" : "ai_action",
          label: action === "Generate Resume Bullet" ? "Resume bullet generated" : "AI action",
          description: `${action} completed in mock mode.`,
          actor: "ai",
          newProgress: nextCard.progress,
        }),
      ];

      return nextCard;
    });
  };

  const triggerReset = () => {
    if (!cards.length) return;

    const ranked = [...cards]
      .map((card) => ({
        card,
        score:
          (100 - card.progress) +
          card.missingEvidence.length * 12 +
          (card.evidence.length === 0 ? 10 : 0) +
          (card.resumeBullet ? 0 : 8),
      }))
      .sort((a, b) => b.score - a.score)[0];

    setActiveCardId(ranked.card.id);
    setResetPrompt(`${ranked.card.title}: ${ranked.card.nextFillAction}`);
    window.setTimeout(() => setResetPrompt(null), 4200);
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden overflow-y-auto bg-[#f8fbff] text-slate-950 md:flex-row md:overflow-hidden">
      <Sidebar />

      <section className="relative flex-1 overflow-x-hidden px-4 py-5 sm:px-6 md:overflow-hidden md:px-8 md:py-8">
        <header className="mx-auto flex max-w-[1320px] flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start md:gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl text-violet-600 sm:text-3xl">✦</span>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Achievement Capital
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Turn experience, ideas, and projects into fillable career capital cards.
            </p>
          </div>

          <button
            onClick={() => {
              setAgentMessage(null);
              setNewInputOpen(true);
            }}
            className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(124,58,237,0.25)] hover:bg-violet-500 sm:self-start"
          >
            ✦ New Input
          </button>
        </header>

        <section className="relative mx-auto mt-6 h-[690px] max-w-[1320px] overflow-visible sm:h-[730px] md:mt-8 md:h-[760px]">
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
                className={`absolute left-1/2 top-1/2 transition-all duration-500 ${!isActive ? "hidden md:block" : ""}`}
                style={{
                  transform: translate,
                  zIndex: isActive ? 20 : 10,
                }}
                onClick={() => setActiveCardId(card.id)}
              >
                <AchievementCard
                  card={card}
                  active={isActive}
                  side={isActive ? undefined : diff < 0 ? "left" : "right"}
                  onEdit={() => {
                    setEditorMode("edit");
                    setEditingCard(card);
                  }}
                  onAiAction={(action) => runAiAction(card.id, action)}
                />
              </div>
            );
          })}

          <button
            onClick={() => setActiveCardId(cards[Math.max(0, activeIndex - 1)]?.id ?? activeCard?.id ?? null)}
            className="absolute left-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl text-slate-900 shadow-xl hover:bg-slate-50 sm:left-4 sm:h-14 sm:w-14 sm:text-3xl"
            aria-label="Previous card"
          >
            ‹
          </button>
          <button
            onClick={() =>
              setActiveCardId(cards[Math.min(cards.length - 1, activeIndex + 1)]?.id ?? activeCard?.id ?? null)
            }
            className="absolute right-0 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl text-slate-900 shadow-xl hover:bg-slate-50 sm:right-4 sm:h-14 sm:w-14 sm:text-3xl"
            aria-label="Next card"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 gap-3">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => setActiveCardId(card.id)}
                className={`h-3 w-3 rounded-full transition ${
                  index === activeIndex ? "bg-violet-600" : "bg-slate-300"
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {activeCard && <AchievementTabs card={activeCard} />}

        {resetPrompt && (
          <div className="fixed bottom-28 right-7 z-40 max-w-[320px] rounded-3xl border border-white/70 bg-white/82 px-4 py-3 text-sm text-slate-700 shadow-xl backdrop-blur-md">
            {resetPrompt}
          </div>
        )}

        <button
          onClick={triggerReset}
          className="fixed bottom-7 right-7 z-40 rounded-full bg-slate-950 px-6 py-5 text-sm font-semibold text-white shadow-xl hover:bg-slate-800"
        >
          Reset
        </button>
      </section>

      <AchievementEditModal
        card={editingCard}
        open={Boolean(editingCard)}
        onClose={() => setEditingCard(null)}
        onSave={saveCard}
        onDelete={editorMode === "edit" ? deleteCard : undefined}
        canDelete={cards.length > 1}
        mode={editorMode}
      />
      <NewInputModal
        open={newInputOpen}
        loading={agentLoading}
        message={agentMessage}
        onClose={() => {
          if (agentLoading) return;
          setNewInputOpen(false);
        }}
        onSubmit={submitNewInput}
        onManualCreate={openManualCreate}
      />
    </main>
  );
}

function mergeLists(existing: string[], incoming: unknown) {
  const nextItems = Array.isArray(incoming) ? incoming.map((item) => String(item).trim()).filter(Boolean) : [];
  return Array.from(new Set([...existing, ...nextItems]));
}
