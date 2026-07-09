"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sidebar, type AlexOsView } from "@/components/achievement-capital/Sidebar";
import { AchievementCard } from "@/components/achievement-capital/AchievementCard";
import { AchievementEditModal } from "@/components/achievement-capital/AchievementEditModal";
import { NewInputModal } from "@/components/achievement-capital/NewInputModal";
import { AchievementTabs } from "@/components/achievement-capital/AchievementTabs";
import {
  AchievementActivityType,
  AchievementCardData,
  AchievementEnergyLevel,
  AchievementProductivityType,
  Spark,
} from "@/components/achievement-capital/types";
import {
  applyWaterRules,
  createEmptyCardDraft,
  createTimelineEvent,
  generateResumeBullet,
  getSeedCards,
  inferMissingEvidence,
  loadStoredCards,
  normalizeActivity,
  normalizeCard,
  normalizeEvidence,
  normalizeMilestone,
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
  const [resetOpen, setResetOpen] = useState(false);
  const [spark, setSpark] = useState<Spark | null>(null);
  const [savedSparks, setSavedSparks] = useState<Spark[]>([]);
  const [sparkLoading, setSparkLoading] = useState(false);
  const [activeView, setActiveView] = useState<AlexOsView>("cards");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const loadedCards = loadStoredCards();
    setCards(loadedCards);
    setActiveCardId(loadedCards[1]?.id ?? loadedCards[0]?.id ?? null);
    const rawSparks = window.localStorage.getItem("alex-career-os-saved-sparks-v1");
    if (rawSparks) {
      const parsed = JSON.parse(rawSparks) as Spark[];
      if (Array.isArray(parsed)) setSavedSparks(parsed.filter((item) => item?.saved));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (cards.length === 0) return;
    persistCards(cards);
  }, [cards, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("alex-career-os-saved-sparks-v1", JSON.stringify(savedSparks));
  }, [savedSparks, hydrated]);

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

  const logActivity = (input: {
    cardId: string;
    title: string;
    note: string;
    durationMinutes: number;
    activityType: AchievementActivityType;
    productivityType?: AchievementProductivityType;
    energyLevel?: AchievementEnergyLevel;
    waterImpact: number;
  }) => {
    applyCardUpdate(input.cardId, (card) => {
      const activity = normalizeActivity({
        cardId: card.id,
        title: input.title,
        note: input.note,
        durationMinutes: input.durationMinutes,
        activityType: input.activityType,
        productivityType: input.productivityType,
        energyLevel: input.energyLevel,
        waterImpact: input.waterImpact,
        date: new Date().toISOString().slice(0, 10),
      });
      const baseCard = normalizeCard({
        ...card,
        activities: [...card.activities, activity],
        timeInvestedMinutes: card.timeInvestedMinutes + activity.durationMinutes,
        lastFilledAt: activity.date,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...card.timeline,
          createTimelineEvent({
            type: "progress_changed",
            label: "Activity logged",
            description: `${activity.title} added ${activity.waterImpact}% water impact and ${activity.durationMinutes} minutes.`,
            actor: "user",
            oldProgress: card.progress,
            newProgress: Math.min(100, card.progress + activity.waterImpact),
          }),
        ],
      });

      return applyWaterRules(baseCard, card.progress + activity.waterImpact);
    });
  };

  const promoteActivityToMilestone = (cardId: string, activityId: string) => {
    applyCardUpdate(cardId, (card) => {
      const activity = card.activities.find((item) => item.id === activityId);
      if (!activity || activity.promotedToMilestone) return card;

      const milestone = normalizeMilestone({
        cardId: card.id,
        title: activity.title,
        description: activity.note || activity.title,
        date: activity.date,
        milestoneType: activity.activityType === "proof" ? "proof" : activity.activityType === "output" ? "output" : "skill",
        significance: "Promoted from activity because it contributes to the card's career capital story.",
        createdFromActivityId: activity.id,
      });

      return {
        ...card,
        activities: card.activities.map((item) =>
          item.id === activityId ? normalizeActivity({ ...item, promotedToMilestone: true }, card.id) : item
        ),
        milestones: [...card.milestones, milestone],
        updatedAt: new Date().toISOString(),
        timeline: [
          ...card.timeline,
          createTimelineEvent({
            type: "manual_edit",
            label: "Milestone promoted",
            description: `${activity.title} was promoted from Activity to Milestone.`,
            actor: "user",
          }),
        ],
      };
    });
  };

  const handleGateAction = (cardId: string, action: "pass" | "later" | "almost" | "not_yet" | "gemini") => {
    applyCardUpdate(cardId, (card) => {
      if (action === "gemini") {
        setResetPrompt("Mock Gemini Gate Check: Almost there. Add one output or proof item before advancing.");
        window.setTimeout(() => setResetPrompt(null), 5200);
        return card;
      }

      const adjustment = action === "almost" ? -5 : action === "not_yet" ? -12 : 0;
      const nextProgress = Math.max(0, card.progress + adjustment);

      return normalizeCard({
        ...card,
        progress: nextProgress,
        gateStatus: action === "pass" ? "passed" : action === "later" ? "dismissed" : "adjusted",
        updatedAt: new Date().toISOString(),
        timeline: [
          ...card.timeline,
          createTimelineEvent({
            type: "manual_edit",
            label: "Gate review",
            description:
              action === "pass"
                ? "Gate confirmed by Alex."
                : action === "later"
                  ? "Gate review dismissed for later."
                  : `Gate calibrated. Water level adjusted by ${adjustment}%.`,
            actor: "user",
            oldProgress: card.progress,
            newProgress: nextProgress,
          }),
        ],
      });
    });
  };

  const triggerReset = () => {
    setResetOpen(true);
  };

  const generateSpark = async () => {
    setSparkLoading(true);

    try {
      const response = await fetch("/api/achievement-capital/reset-spark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: summarizeCardsForResetSpark(cards) }),
      });
      const payload = (await response.json()) as { spark?: Spark };

      if (!response.ok || !payload.spark) {
        throw new Error("Reset Spark request failed.");
      }

      setSpark(payload.spark);
    } catch {
      setSpark(generateMockSpark(cards));
    } finally {
      setSparkLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden overflow-y-auto bg-[#f8fbff] text-slate-950 md:flex-row md:overflow-hidden">
      <Sidebar
        activeView={activeView}
        collapsed={sidebarCollapsed}
        onViewChange={(view) => {
          setActiveView(view);
        }}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />

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

        <div className="mx-auto mt-4 flex max-w-[1320px] gap-2 overflow-x-auto rounded-2xl border border-white/80 bg-white/74 p-1.5 shadow-sm backdrop-blur-md md:hidden">
          {[
            ["cards", "Cards"],
            ["activity", "Activity"],
            ["reset", "Reset + Perspective"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveView(id as AlexOsView)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                activeView === id ? "bg-slate-950 text-white" : "text-slate-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeView === "activity" && activeCard && (
          <ActivityMilestonePanel card={activeCard} onOpenNewInput={() => setNewInputOpen(true)} />
        )}

        {activeView === "reset" && (
          <ResetWorkspacePanel
            cards={cards}
            savedSparks={savedSparks}
            onOpenReset={() => setResetOpen(true)}
          />
        )}

        <section className={`${activeView === "cards" ? "block" : "hidden"} relative mx-auto mt-6 h-[735px] max-w-[1320px] overflow-visible sm:h-[770px] md:mt-8 md:h-[760px]`}>
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

          <div className="absolute bottom-2 left-1/2 z-30 flex max-w-[calc(100vw-48px)] -translate-x-1/2 items-center gap-3 overflow-x-auto rounded-full border border-white/70 bg-white/72 px-4 py-2 shadow-sm backdrop-blur-md sm:bottom-0 sm:gap-4">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => setActiveCardId(card.id)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? "w-7 bg-violet-600" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {activeView === "cards" && activeCard && activeCard.gateStatus === "pending" && (
          <GateReviewPrompt card={activeCard} onAction={(action) => handleGateAction(activeCard.id, action)} />
        )}

        {activeView === "cards" && activeCard && (
          <AchievementTabs card={activeCard} onPromoteActivity={promoteActivityToMilestone} />
        )}

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
        cards={cards}
        activeCardId={activeCard?.id}
        onClose={() => {
          if (agentLoading) return;
          setNewInputOpen(false);
        }}
        onSubmit={submitNewInput}
        onManualCreate={openManualCreate}
        onLogActivity={logActivity}
      />
      {resetOpen && (
        <ResetPerspectiveModal
          cards={cards}
          spark={spark}
          onClose={() => setResetOpen(false)}
          onLogOne={() => {
            setResetOpen(false);
            setNewInputOpen(true);
          }}
          onGenerateSpark={generateSpark}
          onSaveSpark={() => {
            setSpark((value) => {
              if (!value) return value;
              const savedSpark = { ...value, saved: true };
              setSavedSparks((items) => [savedSpark, ...items.filter((item) => item.id !== savedSpark.id)].slice(0, 12));
              return savedSpark;
            });
          }}
          sparkLoading={sparkLoading}
        />
      )}
    </main>
  );
}

function mergeLists(existing: string[], incoming: unknown) {
  const nextItems = Array.isArray(incoming) ? incoming.map((item) => String(item).trim()).filter(Boolean) : [];
  return Array.from(new Set([...existing, ...nextItems]));
}

function ActivityMilestonePanel({ card, onOpenNewInput }: { card: AchievementCardData; onOpenNewInput: () => void }) {
  return (
    <section className="mx-auto mt-6 max-w-[1040px] rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-md">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Activity + Milestone</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{card.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Activity 是日常加水紀錄；Milestone 是從 Activity 提煉出的重要成果。新增 Activity 請從 New Input 裡的 Quick Capture 進入。
          </p>
        </div>
        <button
          onClick={onOpenNewInput}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Open Quick Capture
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Activities</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{card.activities.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Milestones</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{card.milestones.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Time Invested</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatMinutes(card.timeInvestedMinutes)}</p>
        </div>
      </div>
    </section>
  );
}

function ResetWorkspacePanel({
  cards,
  savedSparks,
  onOpenReset,
}: {
  cards: AchievementCardData[];
  savedSparks: Spark[];
  onOpenReset: () => void;
}) {
  const totalProgress = cards.reduce((total, card) => total + card.progress, 0);
  const averageProgress = cards.length ? Math.round(totalProgress / cards.length) : 0;
  const totalTime = cards.reduce((total, card) => total + card.timeInvestedMinutes, 0);
  const outputCount = cards.reduce(
    (total, card) => total + card.activities.filter((activity) => activity.activityType === "output").length,
    0
  );
  const proofCount = cards.reduce(
    (total, card) => total + card.activities.filter((activity) => activity.activityType === "proof").length + card.evidence.length,
    0
  );
  const focusCards = [...cards].sort((a, b) => a.progress - b.progress).slice(0, 4);

  return (
    <section className="mx-auto mt-6 max-w-[1120px] space-y-5">
      <div className="rounded-[2rem] border border-white/80 bg-white/78 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reset + Perspective</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Progress Snapshot</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              最近累積、可展示訊號、以及被保存下來的 Spark。
            </p>
          </div>
          <button
            onClick={onOpenReset}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Open Reset
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryTile label="Average Water" value={`${averageProgress}%`} />
          <SummaryTile label="Time Invested" value={formatMinutes(totalTime)} />
          <SummaryTile label="Output Signals" value={`${outputCount}`} />
          <SummaryTile label="Proof Signals" value={`${proofCount}`} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/80 bg-white/78 p-5 shadow-sm backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Cards Progress</p>
          <div className="mt-4 space-y-3">
            {focusCards.map((card) => (
              <div key={card.id} className="rounded-2xl border border-slate-200/80 bg-white/72 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">{card.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {card.stage} · {formatMinutes(card.timeInvestedMinutes)} · next gate {card.nextGate}%
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {card.progress}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${card.progress}%` }} />
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{card.nextFillAction}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/78 p-5 shadow-sm backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Saved Sparks</p>
          <div className="mt-4 space-y-3">
            {savedSparks.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                還沒有保存 Spark。從 Reset 裡生成靈感後按 Save Spark，就會出現在這裡。
              </p>
            )}
            {savedSparks.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200/80 bg-white/72 p-4">
                <p className="font-medium text-slate-950">{item.title}</p>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{item.inspiration}</p>
                <p className="mt-3 text-xs text-slate-400">{item.collision}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function GateReviewPrompt({
  card,
  onAction,
}: {
  card: AchievementCardData;
  onAction: (action: "pass" | "later" | "almost" | "not_yet" | "gemini") => void;
}) {
  return (
    <section className="mx-auto mt-6 max-w-[1040px] rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-slate-800 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Stage Gate Reached</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-950">{card.title}</h3>
      <p className="mt-1 text-sm text-slate-600">
        Water Level {card.progress}% · Gate {card.nextGate}%. 你不是沒做事，但這張卡需要確認是否真的成熟到下一階段。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white" onClick={() => onAction("gemini")}>
          用 Gemini 檢查
        </button>
        <button className="rounded-full bg-white px-4 py-2 text-sm text-slate-700" onClick={() => onAction("pass")}>
          我已完成
        </button>
        <button className="rounded-full bg-white px-4 py-2 text-sm text-slate-700" onClick={() => onAction("almost")}>
          Almost There -5%
        </button>
        <button className="rounded-full bg-white px-4 py-2 text-sm text-slate-700" onClick={() => onAction("not_yet")}>
          Not Yet -12%
        </button>
        <button className="rounded-full bg-white px-4 py-2 text-sm text-slate-700" onClick={() => onAction("later")}>
          稍後處理
        </button>
      </div>
    </section>
  );
}

function ResetPerspectiveModal({
  cards,
  spark,
  sparkLoading,
  onClose,
  onLogOne,
  onGenerateSpark,
  onSaveSpark,
}: {
  cards: AchievementCardData[];
  spark: Spark | null;
  sparkLoading: boolean;
  onClose: () => void;
  onLogOne: () => void;
  onGenerateSpark: () => void;
  onSaveSpark: () => void;
}) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().slice(0, 10);
  const recentCards = cards
    .map((card) => {
      const activities = card.activities.filter((activity) => activity.date >= cutoff);
      const milestones = card.milestones.filter((milestone) => milestone.date >= cutoff);
      const weeklyWaterImpact = activities.reduce((total, activity) => total + activity.waterImpact, 0);
      const outputCount = activities.filter((activity) => activity.activityType === "output").length;
      const proofCount = activities.filter((activity) => activity.activityType === "proof").length;
      const activityTypes = Array.from(new Set(activities.map((activity) => activity.activityType)));

      return {
        card,
        activities,
        milestones,
        weeklyWaterImpact,
        outputCount,
        proofCount,
        activityTypes,
      };
    })
    .filter((item) => item.activities.length || item.milestones.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-[720px] overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reset / Perspective</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">你不是沒有累積。</h2>
            <p className="mt-2 text-sm text-slate-500">不是所有進度都會立刻長成可見 output。</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
            Close
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {recentCards.length === 0 && <p className="text-sm text-slate-500">最近 7 天還沒有記錄 Activity。</p>}
          {recentCards.map(({ card, activities, milestones, weeklyWaterImpact, outputCount, proofCount, activityTypes }) => (
            <div key={card.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{card.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatMinutes(activities.reduce((total, activity) => total + activity.durationMinutes, 0))} · {activities.length} activities · {milestones.length} milestones
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {card.progress}% · {card.stage}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                  本週加水 +{Math.min(100, weeklyWaterImpact)}%
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                  output {outputCount}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 font-medium text-teal-700">
                  proof {proofCount}
                </span>
                {activityTypes.length > 0 && (
                  <span className="rounded-full bg-slate-50 px-3 py-1 font-medium text-slate-500">
                    {activityTypes.join(" / ")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <p className="font-medium text-slate-900">晃一晃</p>
          <p className="mt-1 text-sm text-slate-500">從你現有的成就裡，撞出一個新的角度。</p>
          {sparkLoading ? (
            <ResetNewtonCollider />
          ) : spark && (
            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="font-semibold text-slate-950">{spark.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{spark.inspiration}</p>
              <p className="mt-3 text-xs text-slate-400">{spark.collision}</p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onGenerateSpark}
              disabled={sparkLoading}
            >
              生成一個靈感
            </button>
            {spark && (
              <button className="rounded-full bg-white px-4 py-2 text-sm text-slate-700" onClick={onSaveSpark}>
                {spark.saved ? "Saved" : "Save Spark"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white" onClick={onLogOne}>
            Log one activity
          </button>
          <button className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetNewtonCollider() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 1;
    let height = 1;
    let deviceScale = 1;
    let frame = 0;
    let animationFrame = 0;
    let mounted = true;
    const tagColors = [
      "rgba(245, 158, 11, 0.58)",
      "rgba(139, 92, 246, 0.56)",
      "rgba(37, 99, 235, 0.54)",
      "rgba(20, 184, 166, 0.52)",
      "rgba(225, 29, 72, 0.48)",
    ];

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      deviceScale = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * deviceScale);
      canvas.height = Math.round(height * deviceScale);
      context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const easeOutBack = (value: number) => {
      const c1 = 1.3;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
    };

    const drawGlassBall = (x: number, y: number, radius: number, color: string, impact: number, drift: number) => {
      const glow = context.createRadialGradient(x, y, radius * 0.35, x, y, radius * (1.22 + impact * 0.18));
      glow.addColorStop(0, color.replace(/0\.\d+\)/, `${0.12 + impact * 0.16})`));
      glow.addColorStop(1, "rgba(255,255,255,0)");
      context.beginPath();
      context.arc(x, y, radius * (1.06 + impact * 0.08), 0, Math.PI * 2);
      context.fillStyle = glow;
      context.fill();

      const glass = context.createRadialGradient(
        x - radius * 0.34,
        y - radius * 0.42,
        radius * 0.2,
        x,
        y,
        radius * 1.15
      );
      glass.addColorStop(0, "rgba(255,255,255,0.68)");
      glass.addColorStop(0.36, "rgba(255,255,255,0.42)");
      glass.addColorStop(0.74, color.replace(/0\.\d+\)/, `${0.12 + impact * 0.22})`));
      glass.addColorStop(1, "rgba(255,255,255,0.24)");

      context.beginPath();
      context.arc(x, y + drift, radius, 0, Math.PI * 2);
      context.fillStyle = glass;
      context.fill();
      context.lineWidth = 1.2;
      context.strokeStyle = "rgba(148,163,184,0.18)";
      context.stroke();
    };

    const tick = () => {
      frame += 1;
      const cycle = 86;
      const cyclePosition = (frame % cycle) / cycle;
      const direction = Math.floor(frame / cycle) % 2 === 0 ? -1 : 1;
      const activeProgress = Math.sin(cyclePosition * Math.PI);
      const swing = easeOutBack(activeProgress) * 0.92;
      const impactStrength = Math.exp(-Math.pow((cyclePosition - 0.5) / 0.09, 2));

      context.clearRect(0, 0, width, height);

      const glassBase = context.createLinearGradient(0, 0, 0, height);
      glassBase.addColorStop(0, "rgba(255,255,255,0.86)");
      glassBase.addColorStop(0.5, "rgba(248,250,252,0.68)");
      glassBase.addColorStop(1, "rgba(226,232,240,0.58)");
      context.fillStyle = glassBase;
      context.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.64;
      const radius = Math.max(12, Math.min(19, width / 30));
      const spacing = radius * 2.55;
      const arcLift = height * 0.3;
      const trailColor = tagColors[Math.floor(frame / cycle) % tagColors.length];
      const positions = [-2, -1, 0, 1, 2].map((slot, index) => {
        let x = centerX + slot * spacing;
        let y = centerY;
        let color = tagColors[index % tagColors.length];
        let impact = impactStrength * (index === 2 ? 0.55 : 0.2);

        if (direction === -1 && index === 0) {
          const angle = -swing * 0.78;
          x = centerX - spacing * 2 + Math.sin(angle) * arcLift;
          y = centerY + (1 - Math.cos(angle)) * arcLift * 0.78;
          impact = impactStrength;
          color = trailColor;
        }

        if (direction === 1 && index === 4) {
          const angle = swing * 0.78;
          x = centerX + spacing * 2 + Math.sin(angle) * arcLift;
          y = centerY + (1 - Math.cos(angle)) * arcLift * 0.78;
          impact = impactStrength;
          color = trailColor;
        }

        return { x, y, color, impact };
      });

      const rail = context.createLinearGradient(centerX - spacing * 2.7, 0, centerX + spacing * 2.7, 0);
      rail.addColorStop(0, "rgba(255,255,255,0)");
      rail.addColorStop(0.5, "rgba(148,163,184,0.18)");
      rail.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = rail;
      context.fillRect(centerX - spacing * 2.8, centerY + radius * 1.18, spacing * 5.6, 2);

      context.save();
      context.shadowColor = "rgba(15,23,42,0.08)";
      context.shadowBlur = 9;
      context.shadowOffsetY = 5;
      positions.forEach((position, index) => {
        drawGlassBall(position.x, position.y, radius, position.color, position.impact, Math.sin(frame / 20 + index) * 1.5);
      });
      context.restore();

      const glass = context.createLinearGradient(0, 0, width, height);
      glass.addColorStop(0, "rgba(255,255,255,0.42)");
      glass.addColorStop(0.44, "rgba(255,255,255,0.07)");
      glass.addColorStop(1, "rgba(255,255,255,0.24)");
      context.fillStyle = glass;
      context.fillRect(0, 0, width, height);

      context.fillStyle = "rgba(255,255,255,0.24)";
      context.fillRect(0, 0, width, height * 0.18);

      if (mounted) animationFrame = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      mounted = false;
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="liquid-glass-panel relative mt-4 h-[190px] overflow-hidden rounded-2xl border border-white/75 bg-white/60">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between">
        <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-semibold text-slate-500 backdrop-blur-md">
          Gemini 正在晃一晃
        </span>
        <span className="rounded-full bg-white/40 px-3 py-1 text-xs text-slate-400 backdrop-blur-md">
          invisible cradle
        </span>
      </div>
    </div>
  );
}

function generateMockSpark(cards: AchievementCardData[]): Spark {
  const project = cards[0]?.title ?? "Achievement Card";
  return {
    id: `spark-${Date.now()}`,
    title: "把專案當成尖峰現場",
    inspiration:
      `${project} 可以先不要被看成一份成果，而是看成餐廳尖峰時段的現場調度：真正的問題不是材料夠不夠，而是哪個環節最容易塞車、哪個輸出會讓外部使用者最快理解價值。這個角度會逼你檢查流程，而不是只堆內容。`,
    collision: `${project} × 餐廳尖峰營運`,
    sourceContextSummary: project,
    saved: false,
    createdAt: new Date().toISOString(),
  };
}

function summarizeCardsForResetSpark(cards: AchievementCardData[]) {
  return cards.slice(0, 8).map((card) => ({
    id: card.id,
    title: card.title,
    category: card.category,
    tags: card.tags.slice(0, 6),
    progress: card.progress,
    stage: card.stage,
    currentValue: card.currentValue.slice(0, 360),
    nextFillAction: card.nextFillAction.slice(0, 240),
    recentActivityTypes: card.activities.slice(-5).map((activity) => activity.activityType),
    recentActivityTitles: card.activities.slice(-5).map((activity) => activity.title).slice(0, 5),
    recentMilestones: card.milestones.slice(-4).map((milestone) => milestone.title),
    evidenceTitles: card.evidence.slice(0, 4).map((evidence) => evidence.title),
    missingEvidenceTitles: card.missingEvidence.slice(0, 4).map((item) => item.title),
  }));
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest}m`;
}
