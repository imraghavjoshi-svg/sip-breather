// SERVER ONLY. The safety check from ai_rules.md section 2, step 2.
// Plain code, not AI. An answer that fails is never shown to the user.

import { RULE_IDS } from "../../data/rules";
import { findUnsafeText, MAX_ANSWER_LENGTH } from "../safetyWords";
import type { ExpectedType, RuleId } from "../types";

export type ModelReply = { type: ExpectedType; text: string; ruleIds: RuleId[] };
export type CheckResult = { passed: true; reply: ModelReply } | { passed: false; reason: string };

const TYPES: ExpectedType[] = ["answer", "refuse_advice", "out_of_scope"];

/** Parses the model output and runs every check. */
export function checkModelOutput(raw: string): CheckResult {
  // 1. Valid JSON with a known type.
  let data: unknown;
  try {
    data = JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    return { passed: false, reason: "Output is not valid JSON" };
  }
  if (typeof data !== "object" || data === null) return { passed: false, reason: "Output is not a JSON object" };
  const obj = data as Record<string, unknown>;
  if (typeof obj.type !== "string" || !TYPES.includes(obj.type as ExpectedType)) {
    return { passed: false, reason: "Type is missing or unknown" };
  }
  const type = obj.type as ExpectedType;
  const text = typeof obj.text === "string" ? obj.text.trim() : "";
  const ruleIds = Array.isArray(obj.rule_ids) ? obj.rule_ids.filter((x): x is string => typeof x === "string") : [];

  // Refusals are shown with fixed wording, so the model's own text never reaches the user.
  if (type !== "answer") return { passed: true, reply: { type, text, ruleIds: [] } };

  // 2. An answer must cite at least one real rule.
  if (!text) return { passed: false, reason: "Answer text is empty" };
  if (ruleIds.length === 0) return { passed: false, reason: "Answer has no rule_ids" };
  const unknown = ruleIds.find((id) => !RULE_IDS.includes(id as RuleId));
  if (unknown) return { passed: false, reason: `Unknown rule id "${unknown}"` };

  // 3–6. Fund names, advice, predictions, urgency, length.
  const unsafe = findUnsafeText(text);
  if (unsafe) return { passed: false, reason: unsafe };
  if (text.length > MAX_ANSWER_LENGTH) return { passed: false, reason: `Too long (${text.length} characters)` };

  return { passed: true, reply: { type, text, ruleIds: [...new Set(ruleIds)] as RuleId[] } };
}
