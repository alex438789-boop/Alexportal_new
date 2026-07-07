import { AchievementCardData } from "./types";

export const mockAchievementCards: AchievementCardData[] = [
  {
    id: "kinmen-dissertation",
    title: "Threat Perception and Ontological Security in Kinmen",
    subtitle: "LSE MSc IR Dissertation Project",
    category: "Research",
    tags: [
      "International Relations",
      "Taiwan Strait",
      "Borderland Security",
      "Ontological Security",
      "Qualitative Research",
    ],
    status: "Developing",
    progress: 58,
    currentValue:
      "Analyses Taiwan Strait security through borderland identity and ontological security, showing how proximity to threat can produce de-escalatory rather than hostile security reasoning.",
    skills: [
      "IR Theory",
      "Taiwan Strait Security",
      "Discourse Analysis",
      "Qualitative Research",
      "Borderland Security",
    ],
    nextFillAction:
      "Write the methodology section: case selection, data, methods, justification.",
    resumeBullet:
      "Conducted MSc dissertation research on threat perception and ontological security in Kinmen, analysing how borderland identity, historical vulnerability, and cross-Strait livelihood ties shape local security reasoning.",
    createdAt: "2026-07-07T17:42:00+08:00",
    updatedAt: "2026-07-07T17:42:00+08:00",
    timeline: [
      {
        id: "event-kinmen-1",
        type: "Card created",
        description: "Created dissertation achievement card from LSE dissertation progress.",
        createdAt: "2026-07-07T17:42:00+08:00",
        newProgress: 58,
      },
    ],
    evidence: [
      {
        id: "evidence-kinmen-1",
        title: "Discourse analysis pilot",
        description:
          "Pilot analysis of 38 Kinmen Daily editorials identifying five organising themes.",
        type: "note",
        createdAt: "2026-06-20T12:00:00+08:00",
      },
    ],
  },
  {
    id: "yardenportal-prototype",
    title: "YardenPORTAL Intelligence Desk Prototype",
    subtitle: "International News Tracking & Draft Generation Platform",
    category: "Product",
    tags: [
      "International Relations",
      "News Intelligence",
      "Automation",
      "AI Workflow",
      "Geopolitics",
      "Product",
    ],
    status: "Validated",
    progress: 75,
    currentValue:
      "Built a working prototype that turns international news monitoring, topic scoring, and AI-assisted draft generation into a structured Traditional Chinese briefing workflow.",
    skills: [
      "Product Thinking",
      "News Intelligence",
      "AI Workflow",
      "Geopolitical Analysis",
      "Content Strategy",
    ],
    nextFillAction:
      "整理一頁 prototype case study：problem, solution, workflow, features, and roadmap.",
    resumeBullet:
      "Built a working prototype of YardenPORTAL Intelligence Desk, an AI-assisted international news tracking and draft generation platform using topic scoring, RSS ingestion, and structured Traditional Chinese briefing workflows.",
    createdAt: "2026-07-07T17:45:00+08:00",
    updatedAt: "2026-07-07T17:45:00+08:00",
    timeline: [
      {
        id: "event-yarden-1",
        type: "Card created",
        description: "Created product achievement card from YardenPORTAL prototype progress.",
        createdAt: "2026-07-07T17:45:00+08:00",
        newProgress: 75,
      },
    ],
    evidence: [
      {
        id: "evidence-yarden-1",
        title: "Prototype stack",
        description:
          "Next.js, Tailwind CSS, Supabase, RSS ingest, topic scoring rules, and AI draft generation workflow.",
        type: "note",
        createdAt: "2026-06-25T12:00:00+08:00",
      },
    ],
  },
  {
    id: "cbam-investment-report",
    title: "CBAM 對台灣鋼鐵業投資研究報告",
    subtitle: "CBAM Investment Research",
    category: "ESG × Finance",
    tags: ["ESG", "Finance", "EU Policy", "CBAM", "Steel Industry"],
    status: "Developing",
    progress: 28,
    currentValue:
      "將 EU CBAM 政策轉換成台灣鋼鐵產業的投資風險分析，展現 ESG regulation、sector research 與 financial reasoning 能力。",
    skills: [
      "ESG Regulation",
      "Sector Research",
      "Financial Analysis",
      "Policy Analysis",
      "Data Interpretation",
    ],
    nextFillAction: "新增中鋼、台泥、亞泥近三年的營收與毛利率資料。",
    resumeBullet:
      "Developed an ESG investment research project analysing CBAM-related transition risks for Taiwan’s high-carbon industries.",
    createdAt: "2026-07-07T17:50:00+08:00",
    updatedAt: "2026-07-07T17:50:00+08:00",
    timeline: [
      {
        id: "event-cbam-1",
        type: "Card created",
        description: "Created CBAM investment research card from project idea.",
        createdAt: "2026-07-07T17:50:00+08:00",
        newProgress: 28,
      },
    ],
    evidence: [],
  },
];
