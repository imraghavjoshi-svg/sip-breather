// Shared types. Field names and values follow data_model.md exactly.

export type DeviceKind = "iphone" | "pixel" | "frameless";
export type Zoom = 1 | 0.9 | 0.8;

/** The four step tabs in the desktop toolbar. */
export type StepTab = "dashboard" | "redeem" | "reasons" | "answer";

/** The four top tabs inside the app. */
export type HomeTab = "explore" | "dashboard" | "sips" | "watchlist";

/** Where a test run started (for the test log): the redeem flow, Cancel SIP, or SIP details (Skip / Change amount). */
export type Entry = "redeem" | "cancel" | "sip_details";

/** What the run ended with (for the test log). */
export type FinalChoice = "redeem_only" | "skip" | "pause" | "lower" | "cancel";

// ---------- Seed data ----------

export type Sip = {
  id: string;
  fundName: string; // always a "Sample …" name
  monthlyAmount: number; // ₹
  instalmentDay: number; // day of month
  instalmentsDone: number;
  minAmount: number;
  skipAllowed: boolean;
  maxPauseMonths: number;
  goalName?: string;
  goalTarget?: number;
};

/**
 * Current value of a SIP's holding, for Groww's existing screens only
 * (Dashboard). Our new screens never show returns.
 */
export type Holding = {
  sipId: string;
  currentValue: number; // ₹
  oneDayChange: number; // ₹ change today
};

export type RuleId = "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8" | "R9" | "R10" | "R11";

export type RuleSource = { label: string; url: string };

export type Rule = {
  id: RuleId;
  title: string;
  text: string;
  sources: RuleSource[];
};

export type ExpectedType = "answer" | "refuse_advice" | "out_of_scope";

export type GoldenItem = {
  id: string;
  question: string;
  expected: ExpectedType;
  mustMention?: string[];
  mustNotMention?: string[];
};

// ---------- Session data (in memory only) ----------

export type DecisionOption = "skip" | "pause" | "lower" | "cancel";
/** The six reasons on classic Groww's "Choose your reason to cancel this SIP" screen. */
export type CancelReason = "returns" | "withdraw" | "pause" | "change" | "goal" | "other";
export type PauseMonths = 1 | 2 | 3;

export type Decision = {
  sipId: string;
  option: DecisionOption;
  pauseMonths?: PauseMonths; // only for pause
  newAmount?: number; // only for lower
  cancelReason?: CancelReason;
};

export type AnswerStatus = "ok" | "fallback" | "refused";

export type ChatMessage =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; ruleIds: RuleId[]; status: AnswerStatus; simulated?: boolean; notice?: boolean };

export type EvalResult = {
  goldenId: string;
  answer: string;
  /** What GR-1 finally did: answer / refuse_advice / out_of_scope, or null for a safe fallback. */
  type: ExpectedType | null;
  status: AnswerStatus;
  passed: boolean;
  reason: string;
};
