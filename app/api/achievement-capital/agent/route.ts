import { NextResponse } from "next/server";
import type {
  AchievementCardData,
  AchievementEvidence,
  AchievementMissingEvidence,
  AchievementStatus,
} from "@/components/achievement-capital/types";

type AgentMode = "create" | "update";

type AgentCardPatch = Partial<Omit<AchievementCardData, "evidence" | "missingEvidence" | "timeline">> & {
  evidence?: Partial<AchievementEvidence>[];
  missingEvidence?: Partial<AchievementMissingEvidence>[];
};

type AgentResult = {
  mode: AgentMode;
  targetCardId?: string;
  confidence: number;
  rationale: string;
  card: AgentCardPatch;
};

type RequestBody = {
  input: string;
  cards: Array<Pick<AchievementCardData, "id" | "title" | "subtitle" | "category" | "tags" | "progress" | "currentValue" | "skills" | "nextFillAction" | "resumeBullet">>;
};

const GEMINI_MODEL = "gemini-2.5-flash";
const VALID_STATUSES: AchievementStatus[] = ["Idea", "In Progress", "Developing", "Validated", "Exported"];

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const input = body.input?.trim();

  if (!input) {
    return NextResponse.json({ error: "Input is required." }, { status: 400 });
  }

  const cards = Array.isArray(body.cards) ? body.cards : [];
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      result: createFallbackResult(input, cards),
      provider: "local-fallback",
    });
  }

  try {
    const result = await callGeminiAgent({ apiKey, input, cards });
    return NextResponse.json({ result: sanitizeAgentResult(result, input, cards), provider: GEMINI_MODEL });
  } catch (error) {
    return NextResponse.json({
      result: createFallbackResult(input, cards),
      provider: "local-fallback",
      warning: error instanceof Error ? error.message : "Gemini request failed.",
    });
  }
}

async function callGeminiAgent({
  apiKey,
  input,
  cards,
}: {
  apiKey: string;
  input: string;
  cards: RequestBody["cards"];
}): Promise<AgentResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: buildPrompt(input, cards),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.25,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini returned ${response.status}`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Gemini returned no JSON text.");
  }

  return JSON.parse(stripJsonFence(text)) as AgentResult;
}

function buildPrompt(input: string, cards: RequestBody["cards"]) {
  return `You are the Achievement Capital agent inside ALEX Career OS.

Task:
Given a raw user input, decide whether it should create a new achievement card or update one existing card.
Return strict JSON only.

JSON schema:
{
  "mode": "create" | "update",
  "targetCardId": "existing card id when mode is update",
  "confidence": number from 0 to 1,
  "rationale": "brief user-facing reason",
  "card": {
    "title": string,
    "subtitle": string,
    "category": string,
    "tags": string[],
    "status": "Idea" | "Developing" | "Validated" | "Exported",
    "progress": number 0-100,
    "currentValue": string,
    "skills": string[],
    "nextFillAction": string,
    "resumeBullet": string,
    "linkedinVersion": string,
    "interviewStory": string,
    "portfolioDescription": string,
    "evidence": [{"title": string, "description": string, "type": "note"}],
    "missingEvidence": [{"title": string, "description": string, "status": "missing"}]
  }
}

Guidelines:
- Prefer update when input clearly mentions an existing card by title, project, category, or content.
- Prefer create when it is a distinct achievement.
- Do not invent fake metrics. Keep uncertain claims as missing evidence.
- Use Traditional Chinese if the user input is Chinese; otherwise preserve English.
- progress should reflect how resume-ready the card is.

Existing cards:
${JSON.stringify(cards, null, 2)}

Raw input:
${input}`;
}

function stripJsonFence(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function sanitizeAgentResult(result: AgentResult, input: string, cards: RequestBody["cards"]): AgentResult {
  const fallback = createFallbackResult(input, cards);
  const mode: AgentMode = result.mode === "update" && result.targetCardId ? "update" : result.mode === "create" ? "create" : fallback.mode;
  const targetExists = result.targetCardId && cards.some((card) => card.id === result.targetCardId);

  return {
    mode: mode === "update" && targetExists ? "update" : "create",
    targetCardId: targetExists ? result.targetCardId : undefined,
    confidence: clampNumber(result.confidence, 0, 1, fallback.confidence),
    rationale: result.rationale?.trim() || fallback.rationale,
    card: {
      ...result.card,
      status: VALID_STATUSES.includes(result.card?.status as AchievementStatus)
        ? result.card?.status
        : fallback.card.status,
      progress: clampNumber(result.card?.progress, 0, 100, fallback.card.progress ?? 12),
      tags: normalizeList(result.card?.tags),
      skills: normalizeList(result.card?.skills),
    },
  };
}

function createFallbackResult(input: string, cards: RequestBody["cards"]): AgentResult {
  const target = findLikelyCard(input, cards);
  const progressMatch = input.match(/(?:progress|進度|water|水位)[^\d]*(\d{1,3})/i);
  const progress = progressMatch ? clampNumber(Number(progressMatch[1]), 0, 100, target?.progress ?? 18) : target ? Math.min(100, target.progress + 8) : 18;
  const tags = extractTags(input);
  const skills = extractSkills(input, tags);

  return {
    mode: target ? "update" : "create",
    targetCardId: target?.id,
    confidence: target ? 0.72 : 0.58,
    rationale: target ? `Matched your input to ${target.title}.` : "Created a new achievement from the input.",
    card: {
      title: target?.title ?? summarizeTitle(input),
      subtitle: target?.subtitle ?? "Generated from New Input",
      category: inferCategory(input, target?.category),
      tags,
      status: progress >= 70 ? "Validated" : progress >= 30 ? "Developing" : "Idea",
      progress,
      currentValue: input,
      skills,
      nextFillAction: inferNextAction(input),
      resumeBullet: "",
      evidence: [{ title: "Raw input note", description: input, type: "note" }],
      missingEvidence: [
        {
          title: "Add supporting proof",
          description: "Attach one concrete artifact, screenshot, metric, or external validation.",
          status: "missing",
        },
      ],
    },
  };
}

function findLikelyCard(input: string, cards: RequestBody["cards"]) {
  const haystack = input.toLowerCase();
  return cards
    .map((card) => {
      const terms = [card.title, card.subtitle, card.category, ...card.tags].filter(Boolean);
      const score = terms.reduce((total, term) => {
        const normalized = term.toLowerCase();
        if (!normalized) return total;
        return total + (haystack.includes(normalized) || normalized.includes(haystack.slice(0, 18)) ? 1 : 0);
      }, 0);
      return { card, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.score
    ? cards
        .map((card) => ({
          card,
          score: [card.title, card.subtitle, card.category, ...card.tags].filter(Boolean).reduce((total, term) => {
            const normalized = term.toLowerCase();
            return total + (haystack.includes(normalized) ? 1 : 0);
          }, 0),
        }))
        .sort((a, b) => b.score - a.score)[0].card
    : undefined;
}

function summarizeTitle(input: string) {
  const clean = input.replace(/\s+/g, " ").trim();
  return clean.length > 58 ? `${clean.slice(0, 58)}...` : clean || "New Achievement";
}

function inferCategory(input: string, fallback = "Research") {
  const lower = input.toLowerCase();
  if (lower.includes("product") || lower.includes("prototype") || lower.includes("portal")) return "Product";
  if (lower.includes("finance") || lower.includes("投資") || lower.includes("cbam")) return "ESG x Finance";
  if (lower.includes("research") || lower.includes("dissertation") || lower.includes("研究")) return "Research";
  return fallback;
}

function extractTags(input: string) {
  const candidates = ["Product", "Research", "Finance", "ESG", "AI Workflow", "Automation", "Policy", "Data", "Writing"];
  const lower = input.toLowerCase();
  return candidates.filter((tag) => lower.includes(tag.toLowerCase())).slice(0, 6);
}

function extractSkills(input: string, tags: string[]) {
  const skills = new Set(tags);
  const lower = input.toLowerCase();
  if (lower.includes("prototype")) skills.add("Product Thinking");
  if (lower.includes("research") || lower.includes("研究")) skills.add("Research");
  if (lower.includes("data") || lower.includes("數據")) skills.add("Data Analysis");
  if (lower.includes("ai")) skills.add("AI Workflow");
  return Array.from(skills).slice(0, 6);
}

function inferNextAction(input: string) {
  if (input.includes("缺") || input.toLowerCase().includes("missing")) {
    return "Add the missing proof item mentioned in this input.";
  }
  return "Add one concrete evidence item and refine the resume bullet.";
}

function normalizeList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}
