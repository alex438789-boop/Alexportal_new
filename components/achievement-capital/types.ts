export type AchievementStatus = "Idea" | "Developing" | "Validated" | "Exported";

export type AchievementEvent = {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  oldProgress?: number;
  newProgress?: number;
};

export type AchievementEvidence = {
  id: string;
  title: string;
  description?: string;
  type: "note" | "link" | "file" | "metric";
  createdAt: string;
};

export type AchievementCardData = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  status: AchievementStatus;
  progress: number;
  currentValue: string;
  skills: string[];
  nextFillAction: string;
  resumeBullet?: string;
  createdAt: string;
  updatedAt: string;
  timeline: AchievementEvent[];
  evidence: AchievementEvidence[];
};
