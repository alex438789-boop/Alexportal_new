export type AchievementStatus = "Idea" | "In Progress" | "Developing" | "Validated" | "Exported";

export type AchievementEventType =
  | "card_created"
  | "manual_edit"
  | "progress_changed"
  | "ai_action"
  | "resume_bullet_generated"
  | "resume_bullet_updated"
  | "evidence_updated"
  | "missing_evidence_updated";

export type AchievementEvidenceType =
  | "note"
  | "link"
  | "file"
  | "metric"
  | "document"
  | "screenshot"
  | "report"
  | "publication"
  | "project"
  | "verification";

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
  resumeBullet: string;
  linkedinVersion: string;
  interviewStory: string;
  portfolioDescription: string;
  targetCareerPaths: string[];
  createdAt: string;
  updatedAt: string;
  timeline: AchievementEvent[];
  evidence: AchievementEvidence[];
  missingEvidence: AchievementMissingEvidence[];
  goal?: AchievementGoal;
};

export type AchievementEvent = {
  id: string;
  type: AchievementEventType;
  label: string;
  description: string;
  createdAt: string;
  actor: "user" | "ai" | "system";
  oldProgress?: number;
  newProgress?: number;
};

export type AchievementEvidence = {
  id: string;
  title: string;
  description?: string;
  type: AchievementEvidenceType;
  source?: string;
  createdAt: string;
  updatedAt: string;
};

export type AchievementMissingEvidence = {
  id: string;
  title: string;
  description: string;
  status: "missing" | "in_progress" | "resolved";
  createdAt: string;
  updatedAt: string;
};

export type AchievementGoal = {
  id: string;
  title: string;
  type: string;
  whyItMatters: string;
  successMetric: string;
  firstMilestone: string;
  currentBlocker: string;
  nextAction: string;
  energyLevelRequired: string;
  strategicValue: string;
  incomePotential: string;
  identitySignal: string;
  timelineStart: string;
  targetReviewDate: string;
  longTermTargetDate: string;
  milestones: AchievementGoalMilestone[];
  createdAt: string;
  updatedAt: string;
};

export type AchievementGoalMilestone = {
  id: string;
  title: string;
  deadline: string;
  completionCriteria: string[];
  progressContribution: number;
  createdAt: string;
  updatedAt: string;
};
