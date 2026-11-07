// Shared GR-1 pieces used by the chat sheet and by /api/ask.

import { RULES } from "../data/rules";
import type { AnswerStatus, ExpectedType, RuleId } from "./types";

/** What /api/ask sends back. */
export type AskResponse = {
  /** Final type the user saw; null when a safe fallback was shown. */
  type: ExpectedType | null;
  status: AnswerStatus; // "ok" | "fallback" | "refused"
  text: string;
  ruleIds: RuleId[];
  /** Safety check result, for the evaluation page. */
  check?: { passed: boolean; reason: string };
  /** Groq said "too many requests"; the eval page waits and retries. */
  rateLimited?: boolean;
  retryAfterSeconds?: number | null;
  /** True when the reviewer turned on "Simulate AI failure" (Groq was not called). */
  simulated?: boolean;
  /** A friendly message (too many questions, question too long), not an answer. */
  notice?: boolean;
};

// Fixed wording from ai_rules.md, section 3.
export const REFUSE_ADVICE_TEXT =
  "I can't recommend funds or tell you what to do with your money. I can explain how skip, pause, lower and cancel work for this SIP.";
export const OUT_OF_SCOPE_TEXT = "I can only help with how this SIP and its options work.";
export const FALLBACK_LABEL = "Here's the official explanation";

/**
 * Words that point to each rule: the words in its title plus a few everyday
 * ones (including Hinglish) people use for the same thing.
 */
const RULE_KEYWORDS: Record<RuleId, string[]> = {
  R1: ["invested", "money", "units", "touch", "stays", "lose"],
  R2: ["skip", "skipping", "skipped", "miss", "this month"],
  R3: ["pause", "pausing", "paused", "break", "how long"],
  R4: ["lower", "lowering", "reduce", "less", "smaller", "minimum", "lowest", "amount", "active"],
  R5: ["cancel", "cancelling", "canceling", "cancelled", "stop", "close"],
  R6: ["fail", "fails", "failed", "missed payment", "bounce", "charge", "charged", "penalty", "fee", "balance"],
  R7: ["tomorrow", "close to", "date", "still be cut", "deducted", "today"],
  R8: ["mandate", "autopay", "auto-debit", "nach", "upi", "bank app"],
  R9: ["tax", "exit load", "load"],
  R10: ["restart", "start again", "again", "resume", "by itself", "later"],
  R11: ["returns", "return", "low", "negative", "first year", "withdraw", "withdrawing", "separate", "market"],
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * The most relevant rule for a question; R1 if nothing matches.
 * Whole words only ("cancel" does not count inside "cancelled"), each word
 * counted once, phrases count double. On a tie the later, more specific rule
 * wins (e.g. "tax if I stop" → Exit load and tax, not Cancel).
 */
export function matchRule(question: string): RuleId {
  const q = question.toLowerCase();
  let best: RuleId = "R1";
  let bestScore = 0;
  for (const rule of RULES) {
    const titleWords = rule.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const words = new Set([...RULE_KEYWORDS[rule.id], ...titleWords]);
    let score = 0;
    for (const w of words) {
      if (new RegExp(`\\b${escapeRegExp(w)}\\b`).test(q)) score += w.includes(" ") ? 2 : 1;
    }
    if (score > 0 && score >= bestScore) {
      best = rule.id;
      bestScore = score;
    }
  }
  return best;
}
