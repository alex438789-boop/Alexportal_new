import {
  AchievementCardData,
  AchievementEvidence,
  AchievementEvent,
  AchievementEventType,
  AchievementGoal,
  AchievementGoalMilestone,
  AchievementMissingEvidence,
} from "./types";
import { mockAchievementCards } from "./mockData";

export const ACHIEVEMENT_STORAGE_KEY = "alex-career-os-achievement-cards-v1";
const ACHIEVEMENT_SCHEMA_VERSION = 2;
const FUTURE_SUSTAINABILITY_CARD_ID = "future-sustainability-consulting";
const SOFT_FURNISHING_CARD_ID = "soft-furnishing-side-business";

type StoredAchievementData = {
  schemaVersion: number;
  cards: Partial<AchievementCardData>[];
};

const DEFAULT_CAREER_PATHS = [
  "ESG / climate consulting",
  "geopolitical risk analytics",
  "finance / sustainable finance",
  "international relations / policy",
  "data analytics",
  "product / automation workflow",
] as const;

const TIMELINE_EVENT_TYPES = new Set<AchievementEventType>([
  "card_created",
  "manual_edit",
  "progress_changed",
  "ai_action",
  "resume_bullet_generated",
  "resume_bullet_updated",
  "evidence_updated",
  "missing_evidence_updated",
]);

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTimelineEvent(input: {
  type: AchievementEventType;
  label: string;
  description: string;
  actor?: AchievementEvent["actor"];
  oldProgress?: number;
  newProgress?: number;
}): AchievementEvent {
  return {
    id: createId("event"),
    createdAt: new Date().toISOString(),
    ...input,
    actor: input.actor ?? "system",
  };
}

export function normalizeEvidence(item: Partial<AchievementEvidence>): AchievementEvidence {
  const now = new Date().toISOString();

  return {
    id: item.id ?? createId("evidence"),
    title: item.title?.trim() || "Untitled evidence",
    description: item.description?.trim() || "",
    type: item.type ?? "note",
    source: item.source?.trim() || "",
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? item.createdAt ?? now,
  };
}

export function normalizeMissingEvidence(
  item: Partial<AchievementMissingEvidence>
): AchievementMissingEvidence {
  const now = new Date().toISOString();

  return {
    id: item.id ?? createId("missing-evidence"),
    title: item.title?.trim() || "Missing evidence",
    description: item.description?.trim() || "",
    status: item.status ?? "missing",
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? item.createdAt ?? now,
  };
}

export function normalizeGoalMilestone(item: Partial<AchievementGoalMilestone>): AchievementGoalMilestone {
  const now = new Date().toISOString();

  return {
    id: item.id ?? createId("goal-milestone"),
    title: item.title?.trim() || "Untitled milestone",
    deadline: item.deadline?.trim() || "",
    completionCriteria: item.completionCriteria?.map((value) => value.trim()).filter(Boolean) ?? [],
    progressContribution: Math.max(0, Math.min(100, item.progressContribution ?? 0)),
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? item.createdAt ?? now,
  };
}

export function normalizeGoal(item: Partial<AchievementGoal>): AchievementGoal {
  const now = new Date().toISOString();

  return {
    id: item.id ?? createId("goal"),
    title: item.title?.trim() || "Untitled Goal",
    type: item.type?.trim() || "",
    whyItMatters: item.whyItMatters?.trim() || "",
    successMetric: item.successMetric?.trim() || "",
    firstMilestone: item.firstMilestone?.trim() || "",
    currentBlocker: item.currentBlocker?.trim() || "",
    nextAction: item.nextAction?.trim() || "",
    energyLevelRequired: item.energyLevelRequired?.trim() || "",
    strategicValue: item.strategicValue?.trim() || "",
    incomePotential: item.incomePotential?.trim() || "",
    identitySignal: item.identitySignal?.trim() || "",
    timelineStart: item.timelineStart?.trim() || "",
    targetReviewDate: item.targetReviewDate?.trim() || "",
    longTermTargetDate: item.longTermTargetDate?.trim() || "",
    milestones: (item.milestones ?? []).map(normalizeGoalMilestone),
    createdAt: item.createdAt ?? now,
    updatedAt: item.updatedAt ?? item.createdAt ?? now,
  };
}

export function normalizeCard(card: Partial<AchievementCardData>): AchievementCardData {
  const now = new Date().toISOString();

  return {
    id: card.id ?? createId("card"),
    title: card.title?.trim() || "Untitled Achievement",
    subtitle: card.subtitle?.trim() || "",
    category: card.category?.trim() || "Research",
    tags: card.tags?.filter(Boolean) ?? [],
    status: card.status ?? "Idea",
    progress: Math.max(0, Math.min(100, card.progress ?? 0)),
    currentValue: card.currentValue?.trim() || "",
    skills: card.skills?.filter(Boolean) ?? [],
    nextFillAction: card.nextFillAction?.trim() || "Add the next smallest proof point.",
    resumeBullet: card.resumeBullet?.trim() || "",
    linkedinVersion: card.linkedinVersion?.trim() || "",
    interviewStory: card.interviewStory?.trim() || "",
    portfolioDescription: card.portfolioDescription?.trim() || "",
    targetCareerPaths:
      card.targetCareerPaths?.length ? card.targetCareerPaths.filter(Boolean) : [...DEFAULT_CAREER_PATHS],
    createdAt: card.createdAt ?? now,
    updatedAt: card.updatedAt ?? card.createdAt ?? now,
    timeline: (card.timeline ?? []).map((event) => {
      const type = coerceTimelineType(event.type);

      return {
        id: event.id ?? createId("event"),
        type,
        label: event.label ?? inferTimelineLabel(type),
        description: event.description ?? "",
        actor: event.actor ?? "system",
        createdAt: event.createdAt ?? now,
        oldProgress: event.oldProgress,
        newProgress: event.newProgress,
      };
    }),
    evidence: (card.evidence ?? []).map(normalizeEvidence),
    missingEvidence: (card.missingEvidence ?? inferMissingEvidence(card)).map(normalizeMissingEvidence),
    goal: card.goal ? normalizeGoal(card.goal) : undefined,
  };
}

function coerceTimelineType(type: unknown): AchievementEventType {
  if (typeof type === "string" && TIMELINE_EVENT_TYPES.has(type as AchievementEventType)) {
    return type as AchievementEventType;
  }

  return "manual_edit";
}

export function getSeedCards() {
  return mockAchievementCards.map(normalizeCard);
}

export function loadStoredCards() {
  if (typeof window === "undefined") return getSeedCards();

  const raw = window.localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
  if (!raw) return getSeedCards();

  try {
    const parsed = JSON.parse(raw) as Partial<AchievementCardData>[] | StoredAchievementData;
    const cards = Array.isArray(parsed) ? parsed : parsed.cards;
    if (!Array.isArray(cards) || cards.length === 0) return getSeedCards();
    return includeRequiredMockCards(cards.map(normalizeCard));
  } catch {
    return getSeedCards();
  }
}

function includeRequiredMockCards(cards: AchievementCardData[]) {
  return normalizeRequiredMockCardLabels(
    insertMockCardIfMissing(insertMockCardIfMissing(cards, FUTURE_SUSTAINABILITY_CARD_ID, 1), SOFT_FURNISHING_CARD_ID, 1)
  );
}

function normalizeRequiredMockCardLabels(cards: AchievementCardData[]) {
  return cards.map((card) => {
    if (card.id !== SOFT_FURNISHING_CARD_ID) return card;

    return {
      ...card,
      category: "Side Business Asset / Productized Service",
    };
  });
}

function insertMockCardIfMissing(cards: AchievementCardData[], cardId: string, index: number) {
  if (cards.some((card) => card.id === cardId)) return cards;

  const mockCard = mockAchievementCards.find((card) => card.id === cardId);
  if (!mockCard) return cards;
  const normalizedMockCard = normalizeCard(mockCard);
  return [...cards.slice(0, index), normalizedMockCard, ...cards.slice(index)].filter(Boolean);
}

export function persistCards(cards: AchievementCardData[]) {
  if (typeof window === "undefined") return;
  const payload: StoredAchievementData = {
    schemaVersion: ACHIEVEMENT_SCHEMA_VERSION,
    cards,
  };
  window.localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(payload));
}

export function createEmptyCardDraft(): AchievementCardData {
  const now = new Date().toISOString();
  return normalizeCard({
    id: createId("card"),
    title: "New Achievement Card",
    subtitle: "",
    category: "Research",
    tags: [],
    status: "Idea",
    progress: 12,
    currentValue: "",
    skills: [],
    nextFillAction: "Capture one concrete proof point for this card.",
    resumeBullet: "",
    linkedinVersion: "",
    interviewStory: "",
    portfolioDescription: "",
    targetCareerPaths: [...DEFAULT_CAREER_PATHS],
    createdAt: now,
    updatedAt: now,
    evidence: [],
    missingEvidence: [],
    timeline: [],
  });
}

export function inferMissingEvidence(card: Partial<AchievementCardData>) {
  const items: Partial<AchievementMissingEvidence>[] = [];

  if (!card.evidence || card.evidence.length === 0) {
    items.push({
      title: "Add one proof artifact",
      description: "Add a document, note, screenshot, metric, or external validation.",
      status: "missing",
    });
  }

  if (!card.resumeBullet?.trim()) {
    items.push({
      title: "Draft a resume bullet",
      description: "Translate the achievement into one concise resume-ready result statement.",
      status: "missing",
    });
  }

  if (!card.currentValue?.trim()) {
    items.push({
      title: "Clarify current value",
      description: "Summarize why this achievement matters and what capability it proves.",
      status: "missing",
    });
  }

  if (!card.skills || card.skills.length < 3) {
    items.push({
      title: "Extract more skills",
      description: "List at least three specific skills demonstrated by this achievement.",
      status: "missing",
    });
  }

  return items.map(normalizeMissingEvidence);
}

export function inferTimelineLabel(type: AchievementEventType) {
  switch (type) {
    case "card_created":
      return "Card created";
    case "manual_edit":
      return "Manual edit";
    case "progress_changed":
      return "Progress changed";
    case "ai_action":
      return "AI action";
    case "resume_bullet_generated":
      return "Resume bullet generated";
    case "resume_bullet_updated":
      return "Resume bullet updated";
    case "evidence_updated":
      return "Evidence updated";
    case "missing_evidence_updated":
      return "Missing evidence updated";
    default:
      return "Timeline event";
  }
}

export function generateResumeBullet(card: AchievementCardData) {
  const skillLead = card.skills.slice(0, 3).join(", ");
  const valueLead = card.currentValue || card.subtitle || card.category;
  return `Built ${card.title}, demonstrating ${skillLead || "core analytical and execution skills"} through ${valueLead}.`;
}

export function reframeForTargetRole(card: AchievementCardData) {
  return {
    linkedinVersion: `${card.title}: ${card.currentValue || card.subtitle}. Key skills: ${card.skills.join(", ")}.`,
    portfolioDescription: `${card.title} connects ${card.category.toLowerCase()} work to measurable career capital by showing ${card.currentValue || "clear execution and strategic thinking"}.`,
  };
}
