// POST /api/ask: GR-1's only door to the AI (ai_rules.md section 2).
// 1. Ask Groq (8-second limit). 2. Run the safety check in code.
// 3. Decide what the user sees. 4. Log the request on the server.
// The Groq key stays on the server (lib/server/groq.ts).

import { getRule } from "@/data/rules";
import { SIPS } from "@/data/sips";
import { matchRule, OUT_OF_SCOPE_TEXT, REFUSE_ADVICE_TEXT, type AskResponse } from "@/lib/gr1";
import { callGroq } from "@/lib/server/groq";
import { takeAskSlot, visitorKey } from "@/lib/server/rateLimit";
import { checkModelOutput } from "@/lib/server/safety";

const MAX_QUESTION_LENGTH = 300;

/** The safe fallback: the most relevant rule, word for word (never the failed answer). */
function fallback(question: string, reason: string, extra: Partial<AskResponse> = {}): AskResponse {
  const id = matchRule(question);
  return { type: null, status: "fallback", text: getRule(id).text, ruleIds: [id], check: { passed: false, reason }, ...extra };
}

function log(question: string, reply: AskResponse) {
  // No key, no personal data: just what the evaluation needs.
  console.log(
    "[ask]",
    JSON.stringify({
      question,
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
  } = (body ?? {}) as { question?: unknown; sipId?: unknown; simulateFailure?: unknown };
  const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";
  if (!question) return Response.json({ error: "question is required" }, { status: 400 });
  if (question.length > MAX_QUESTION_LENGTH) {
    return notice(
      `That question is a bit long. Please keep it under ${MAX_QUESTION_LENGTH} characters and ask again.`,
      400,
    );
  }
  const sipId = SIPS.some((s) => s.id === rawSipId) ? (rawSipId as string) : SIPS[0].id;

  let reply: AskResponse;

  // Reviewer switch "Simulate AI failure": skip Groq and show the safe fallback.
  if (simulateFailure === true) {
    reply = fallback(question, "AI failure simulated", { simulated: true });
    log(question, reply);
    return Response.json(reply);
  }

  const groq = await callGroq(question, sipId);

  if (!groq.ok) {
    reply = groq.rateLimited
      ? fallback(question, groq.reason, { rateLimited: true, retryAfterSeconds: groq.retryAfterSeconds })
      : fallback(question, groq.reason);
  } else {
    const result = checkModelOutput(groq.content);
    if (!result.passed) {
      reply = fallback(question, result.reason);
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

  log(question, reply);
  return Response.json(reply);
}
