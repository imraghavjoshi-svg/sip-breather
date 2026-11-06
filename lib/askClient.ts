"use client";

// How the chat sheet asks GR-1 a question: it calls the server route
// /api/ask (which holds the key and runs the safety check). If the route
// cannot be reached at all, the chat still shows the safe fallback: the most
// relevant rule, word for word.

import { getRule } from "../data/rules";
import { matchRule, type AskResponse } from "./gr1";

const CLIENT_TIMEOUT_MS = 12000; // a little longer than the server's 8-second Groq limit

export async function askGr1(question: string, sipId: string, simulateFailure = false): Promise<AskResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, sipId, simulateFailure }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => null)) as AskResponse | null;
    // Friendly messages (too many questions, too long) come back with an error status but a text to show.
    if (data && typeof data.text === "string") return data;
    throw new Error(`ask failed: ${res.status}`);
  } catch {
    const id = matchRule(question);
    return {
      type: null,
      status: "fallback",
      text: getRule(id).text,
      ruleIds: [id],
      check: { passed: false, reason: "Could not reach /api/ask" },
    };
  } finally {
    clearTimeout(timer);
  }
}
