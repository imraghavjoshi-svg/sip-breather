// POST /api/ask: GR-1's only door to the AI (ai_rules.md section 2).
// 1. Ask Groq (8-second limit). 2. Run the safety check in code.
// 3. Decide what the user sees. 4. Log the request on the server.
// The Groq key stays on the server (lib/server/groq.ts).

import { getRule } from "@/data/rules";
import { SIPS } from "@/data/sips";
import { compareOptions, comparisonFallbackText, findUnmatchedNumber, lowerAmountIsValid, type Comparison } from "@/lib/compare";
import { getSip } from "@/data/sips";
import { matchRule, OUT_OF_SCOPE_TEXT, REFUSE_ADVICE_TEXT, type AskResponse } from "@/lib/gr1";
import type { PauseMonths } from "@/lib/types";
import { callGroq } from "@/lib/server/groq";
import { takeAskSlot, visitorKey } from "@/lib/server/rateLimit";
import { checkModelOutput } from "@/lib/server/safety";

const MAX_QUESTION_LENGTH = 300;

/** The safe fallback: the most relevant rule, word for word (never the failed answer). */
function fallback(question: string, reason: string, extra: Partial<AskResponse> = {}): AskResponse {
  const id = matchRule(question);
  return { type: null, status: "fallback", text: getRule(id).text, ruleIds: [id], check: { passed: false, reason }, ...extra };
}

/** The safe fallback on "Compare your options": the calculated values in a fixed sentence. */
function compareFallback(c: Comparison, reason: string, extra: Partial<AskResponse> = {}): AskResponse {
  return {
    type: null,
    status: "fallback",
    text: comparisonFallbackText(c),
    ruleIds: [],
    compareFallback: true,
    check: { passed: false, reason },
    ...extra,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Rebuilds the comparison on the server from the SIP data and the user's two
 * choices. Only those choices and the browser's date come from the browser
 * (the date is accepted only within 2 days of the server's). null = not valid.
 */
function comparisonFrom(raw: unknown, sipId: string): Comparison | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { pauseMonths, lowerAmount, today } = raw as Record<string, unknown>;
  if (pauseMonths !== 1 && pauseMonths !== 2 && pauseMonths !== 3) return null;
  if (typeof lowerAmount !== "number" || !lowerAmountIsValid(getSip(sipId), lowerAmount)) return null;
  if (typeof today !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return null;
  const [y, m, d] = today.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime()) || Math.abs(date.getTime() - Date.now()) > 2 * DAY_MS) return null;
  return compareOptions(sipId, { pauseMonths: pauseMonths as PauseMonths, lowerAmount }, date);
}

function log(question: string, reply: AskResponse, compare = false) {
  // No key, no personal data: just what the evaluation needs.
  console.log(
    "[ask]",
    JSON.stringify({
      question,
      compare,
      type: reply.type ?? "fallback",
      passed: reply.check?.passed ?? false,
      reason: reply.check?.reason ?? "",
    }),
  );
}

/** A friendly message shown in the chat instead of an answer (no AI call made). */
function notice(text: string, status: number, extra: Partial<AskResponse> = {}) {
  const reply: AskResponse = { type: null, status: "refused", text, ruleIds: [], notice: true, ...extra };
  return Response.json(reply, { status });
}

export async function POST(request: Request) {
  // Public-site protection: at most 20 questions a minute per visitor.
  const slot = takeAskSlot(visitorKey(request));
  if (!slot.ok) {
    return notice(
      `You're asking questions quite fast. Please wait about ${slot.retryAfterSeconds} seconds and try again.`,
      429,
      { rateLimited: true, retryAfterSeconds: slot.retryAfterSeconds },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send JSON: {question, sipId}" }, { status: 400 });
  }
  const {
    question: rawQuestion,
    sipId: rawSipId,
    simulateFailure,
    compare: rawCompare,
  } = (body ?? {}) as { question?: unknown; sipId?: unknown; simulateFailure?: unknown; compare?: unknown };
  const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";
  if (!question) return Response.json({ error: "question is required" }, { status: 400 });
  if (question.length > MAX_QUESTION_LENGTH) {
    return notice(
      `That question is a bit long. Please keep it under ${MAX_QUESTION_LENGTH} characters and ask again.`,
      400,
    );
  }
  const sipId = SIPS.some((s) => s.id === rawSipId) ? (rawSipId as string) : SIPS[0].id;

  // Opened from "Compare your options": recalculate the five results here.
  const comparison = rawCompare === undefined ? null : comparisonFrom(rawCompare, sipId);
  if (rawCompare !== undefined && !comparison) {
    return Response.json({ error: "compare must be {pauseMonths 1-3, lowerAmount, today YYYY-MM-DD}" }, { status: 400 });
  }
  // On Compare, every safe fallback is the calculated comparison.
  const safeFallback = (reason: string, extra: Partial<AskResponse> = {}) =>
    comparison ? compareFallback(comparison, reason, extra) : fallback(question, reason, extra);

  let reply: AskResponse;

  // Reviewer switch "Simulate AI failure": skip Groq and show the safe fallback.
  if (simulateFailure === true) {
    reply = safeFallback("AI failure simulated", { simulated: true });
    log(question, reply, Boolean(comparison));
    return Response.json(reply);
  }

  const groq = await callGroq(question, sipId, comparison ?? undefined);

  if (!groq.ok) {
    reply = groq.rateLimited
      ? safeFallback(groq.reason, { rateLimited: true, retryAfterSeconds: groq.retryAfterSeconds })
      : safeFallback(groq.reason);
  } else {
    const result = checkModelOutput(groq.content);
    // New check on Compare: every ₹ amount and instalment count must match the calculation.
    const unmatched =
      result.passed && result.reply.type === "answer" && comparison
        ? findUnmatchedNumber(result.reply.text, comparison)
        : null;
    if (!result.passed) {
      reply = safeFallback(result.reason);
    } else if (unmatched) {
      reply = safeFallback(`Number not in the calculation: ${unmatched}`);
    } else if (result.reply.type === "refuse_advice") {
      reply = { type: "refuse_advice", status: "refused", text: REFUSE_ADVICE_TEXT, ruleIds: [], check: { passed: true, reason: "" } };
    } else if (result.reply.type === "out_of_scope") {
      reply = { type: "out_of_scope", status: "refused", text: OUT_OF_SCOPE_TEXT, ruleIds: [], check: { passed: true, reason: "" } };
    } else {
      reply = {
        type: "answer",
        status: "ok",
        text: result.reply.text,
        ruleIds: result.reply.ruleIds,
        check: { passed: true, reason: "" },
      };
    }
  }

  log(question, reply, Boolean(comparison));
  return Response.json(reply);
}
