"use client";

// How the chat sheet asks GR-1 a question: it calls the server route
// /api/ask (which holds the key and runs the safety check). If the route
// cannot be reached at all, the chat still shows the safe fallback: the most
// relevant rule, word for word.

import { getRule } from "../data/rules";
import { compareOptions, comparisonFallbackText } from "./compare";
import { matchRule, type AskResponse, type CompareRequest } from "./gr1";
import type { PauseMonths } from "./types";

const CLIENT_TIMEOUT_MS = 12000; // a little longer than the server's 8-second Groq limit

/**
 * compare: set when GR-1 was opened from "Compare your options". Only the
 * user's two choices and today's date are sent; the server recalculates.
 */
export async function askGr1(
  question: string,
  sipId: string,
  simulateFailure = false,
  compare?: CompareRequest,
): Promise<AskResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, sipId, simulateFailure, compare }),
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => null)) as AskResponse | null;
    // Friendly messages (too many questions, too long) come back with an error status but a text to show.
    if (data && typeof data.text === "string") return data;
    throw new Error(`ask failed: ${res.status}`);
  } catch {
    if (compare) {
      const [y, m, d] = compare.today.split("-").map(Number);
      const c = compareOptions(
        sipId,
        { pauseMonths: compare.pauseMonths as PauseMonths, lowerAmount: compare.lowerAmount },
        new Date(y, m - 1, d),
      );
      return {
        type: null,
        status: "fallback",
        text: comparisonFallbackText(c),
        ruleIds: [],
        compareFallback: true,
        check: { passed: false, reason: "Could not reach /api/ask" },
      };
    }
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
