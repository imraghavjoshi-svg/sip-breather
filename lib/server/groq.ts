// SERVER ONLY. Builds the GR-1 prompt and calls Groq (ai_rules.md section 2).
// The key is read here from process.env.GROQ_API_KEY and is never sent to the
// browser, never logged, never returned.

import { RULES } from "../../data/rules";
import { getSip } from "../../data/sips";
import { formatRupees, invested } from "../sip";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = "openai/gpt-oss-120b";
const TIMEOUT_MS = 8000;

// Instruction copied word for word from ai_rules.md.
const INSTRUCTION =
  "You are GR-1. Answer only questions about how this SIP and its options work, using only the rules given. Reply in 2 to 4 short, plain sentences. Never name, compare or recommend any fund. Never say what the user should do with their money. Never predict returns or markets. Never use fear or urgency. If the question asks for advice, a recommendation or a prediction, set type to refuse_advice. If it is not about SIP mechanics, set type to out_of_scope. If the rules do not cover it, say you are not sure and suggest checking with the fund house or Groww support.";

export function buildSystemPrompt(sipId: string): string {
  const sip = getSip(sipId);
  const sipDetails = [
    `Fund: ${sip.fundName}`,
    `Monthly amount: ${formatRupees(sip.monthlyAmount)}`,
    `Instalment day: ${sip.instalmentDay} of every month`,
    `Invested so far: ${formatRupees(invested(sip))} (${sip.instalmentsDone} instalments)`,
    sip.goalName && sip.goalTarget ? `Goal: ${sip.goalName}, ${formatRupees(sip.goalTarget)}` : "Goal: none",
  ].join("\n");
  const rules = RULES.map((r) => `${r.id} (${r.title}): ${r.text}`).join("\n");

  return `${INSTRUCTION}

How to choose the type (check in this order):
1. refuse_advice: the question asks for a judgement or a prediction. That includes what to do with money; which fund to pick, buy, sell, switch to or compare; whether to stop, keep or take money out; and any forecast about markets, prices, NAV, returns or the economy, for any time frame. It does not matter whether the question names a fund, this SIP or nothing at all.
2. answer: the question is about how this SIP and its options work (skip, pause, lower, cancel, missed payments, mandates, exit load, tax on redemption, restarting).
3. out_of_scope: the question asks for help with a different product or task, such as shares, IPOs, loans or insurance. Never use out_of_scope for a question that asks for a judgement or a prediction.
If a question could be either refuse_advice or out_of_scope, choose refuse_advice.

These are general rules written for this demo. Exact limits differ by fund house and bank, so say "usually" or "in this demo" where a number depends on them. Use the wording of the rules where you can. Never say that money will grow, keeps growing, compounds or earns returns; say it stays invested. If the question is in Hinglish, answer in simple English.

The user's SIP:
${sipDetails}

Rules (the only facts you may use):
${rules}

Reply with JSON only, no other text, in exactly this shape:
{"type": "answer" | "refuse_advice" | "out_of_scope", "text": "...", "rule_ids": ["R1", ...]}
For "answer", rule_ids lists every rule you used. For "refuse_advice" and "out_of_scope", rule_ids is [].`;
}

export type GroqResult =
  | { ok: true; content: string }
  | { ok: false; rateLimited: true; retryAfterSeconds: number | null; reason: string }
  | { ok: false; rateLimited: false; reason: string };

export async function callGroq(question: string, sipId: string): Promise<GroqResult> {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return { ok: false, rateLimited: false, reason: "GROQ_API_KEY is not set on the server" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        reasoning_effort: "low",
        max_completion_tokens: 1024,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt(sipId) },
          { role: "user", content: question },
        ],
      }),
      signal: controller.signal,
    });

    if (res.status === 429) {
      const header = Number(res.headers.get("retry-after"));
      return {
        ok: false,
        rateLimited: true,
        retryAfterSeconds: Number.isFinite(header) && header > 0 ? header : null,
        reason: "Groq rate limit (429)",
      };
    }
    if (!res.ok) return { ok: false, rateLimited: false, reason: `Groq error ${res.status}` };

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { ok: false, rateLimited: false, reason: "Groq returned no content" };
    return { ok: true, content };
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "AbortError";
    return { ok: false, rateLimited: false, reason: timedOut ? "Groq timeout (8 seconds)" : "Could not reach Groq" };
  } finally {
    clearTimeout(timer);
  }
}
