import { NextResponse } from "next/server";
import type { Spark } from "@/components/achievement-capital/types";

type ResetSparkCardSummary = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  progress: number;
  stage: string;
  currentValue: string;
  nextFillAction: string;
  recentActivityTypes: string[];
  recentActivityTitles: string[];
  recentMilestones: string[];
  evidenceTitles: string[];
  missingEvidenceTitles: string[];
};

type RequestBody = {
  cards?: ResetSparkCardSummary[];
};

type GeminiSparkResult = {
  title: string;
  inspiration: string;
  collision: string;
};

const GEMINI_MODEL = "gemini-2.5-flash";

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const cards = Array.isArray(body.cards) ? body.cards.slice(0, 8).map(sanitizeCardSummary) : [];
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      spark: createFallbackSpark(cards),
      provider: "local-fallback",
    });
  }

  try {
    const result = await callGeminiSpark({ apiKey, cards });
    return NextResponse.json({
      spark: sanitizeSpark(result, cards),
      provider: GEMINI_MODEL,
    });
  } catch (error) {
    return NextResponse.json({
      spark: createFallbackSpark(cards),
      provider: "local-fallback",
      warning: error instanceof Error ? error.message : "Gemini reset spark request failed.",
    });
  }
}

async function callGeminiSpark({
  apiKey,
  cards,
}: {
  apiKey: string;
  cards: ResetSparkCardSummary[];
}): Promise<GeminiSparkResult> {
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
                text: buildPrompt(cards),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.82,
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

  return JSON.parse(stripJsonFence(text)) as GeminiSparkResult;
}

function buildPrompt(cards: ResetSparkCardSummary[]) {
  return `你是 Alex Career OS 裡的 Reset / Perspective Spark 產生器。

產品定位：
把零碎努力，轉成看得見、可累積、可展示的職涯資本。

任務：
從使用者現有 Achievement Cards 中挑一個具體專案，再由你自行選一個不同領域，讓兩者碰撞，產生一個「晃一晃」跨領域靈感。

請嚴格遵守：
- 只使用台灣繁體中文。
- 只產生一個 Spark，不要產生任務清單。
- 不要叫使用者新增卡片、安排時間、建立待辦或改變人生方向。
- 不要稱讚使用者，不要使用「你很會」「你正在累積」「你的能力很強」這類鼓勵句。
- 語氣要清醒、精準、有一點刺激感；像一個聰明的反問或視角衝撞，不像心理諮商。
- Spark 的目的不是安慰，而是讓使用者用一個陌生領域重新看待某個專案。
- 你自選的不同領域要有創意，而且避免落入常見管理學比喻。
- 不要偏食任何單一領域；醫療、分診、診斷可以使用，但只有在它真的比其他領域更有張力時才使用，不能當成預設答案。
- 優先尋找更陌生、更具畫面感、更能刺激思考的領域。
- 可選領域例子：舞台調度、港口物流、情報分析、廚房出餐、交易策略、博物館策展、遊戲關卡設計、建築動線、電影剪接、DJ set 編排、航空塔台、災害應變、棋局中盤、服裝打版、地圖製圖、城市夜市攤位流動、拍賣市場、軍事後勤、供應鏈瓶頸、餐廳尖峰營運、深海探勘、考古修復、劇本殺設計、香水調香、賽車進站、太空任務控制、爵士即興、法庭交叉詰問。
- 如果第一個想到的領域太直覺，請換成第二或第三個更意外的領域，但仍要能形成清楚洞察。
- 回傳 strict JSON only。

JSON schema:
{
  "title": "一句 18 字以內的繁中標題，要有刺激感，不要像標語",
  "inspiration": "90 到 150 字繁中說明。先點名一個專案，再用你自選的不同領域挑戰它的看法。不要稱讚，不要列任務。",
  "collision": "使用格式：專案名稱 × 你自選的不同領域"
}

Cards summary:
${JSON.stringify(cards, null, 2)}`;
}

function sanitizeSpark(result: GeminiSparkResult, cards: ResetSparkCardSummary[]): Spark {
  const fallback = createFallbackSpark(cards);

  return {
    id: `spark-${Date.now()}`,
    title: cleanText(result.title, fallback.title, 80),
    inspiration: cleanText(result.inspiration, fallback.inspiration, 420),
    collision: cleanText(result.collision, fallback.collision, 180),
    sourceContextSummary: cards.map((card) => card.title).join(" × "),
    saved: false,
    createdAt: new Date().toISOString(),
  };
}

function createFallbackSpark(cards: ResetSparkCardSummary[]): Spark {
  const card = cards[0];
  const project = card?.title || "Achievement Card";
  const externalField = "餐廳尖峰營運";

  return {
    id: `spark-${Date.now()}`,
    title: "把專案當成尖峰現場",
    inspiration:
      `${project} 可以先不要被看成一份成果，而是看成餐廳尖峰時段的現場調度：真正的問題不是材料夠不夠，而是哪個環節最容易塞車、哪個輸出會讓外部使用者最快理解價值。這個角度會逼你檢查流程，而不是只堆內容。`,
    collision: `${project} × ${externalField}`,
    sourceContextSummary: project,
    saved: false,
    createdAt: new Date().toISOString(),
  };
}

function sanitizeCardSummary(card: ResetSparkCardSummary): ResetSparkCardSummary {
  return {
    id: String(card.id ?? ""),
    title: cleanText(card.title, "Untitled card", 120),
    category: cleanText(card.category, "", 120),
    tags: normalizeList(card.tags, 8, 60),
    progress: clampNumber(card.progress, 0, 100, 0),
    stage: cleanText(card.stage, "", 40),
    currentValue: cleanText(card.currentValue, "", 420),
    nextFillAction: cleanText(card.nextFillAction, "", 260),
    recentActivityTypes: normalizeList(card.recentActivityTypes, 8, 40),
    recentActivityTitles: normalizeList(card.recentActivityTitles, 6, 120),
    recentMilestones: normalizeList(card.recentMilestones, 6, 120),
    evidenceTitles: normalizeList(card.evidenceTitles, 6, 120),
    missingEvidenceTitles: normalizeList(card.missingEvidenceTitles, 6, 120),
  };
}

function normalizeList(value: unknown, limit: number, itemLimit: number) {
  return Array.isArray(value)
    ? value.map((item) => cleanText(String(item), "", itemLimit)).filter(Boolean).slice(0, limit)
    : [];
}

function cleanText(value: unknown, fallback: string, maxLength: number) {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  if (!text) return fallback;
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function stripJsonFence(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}
