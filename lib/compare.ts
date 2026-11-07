// "Compare your options": the five results for one SIP over the next 12
// months. Plain code, shared by the Compare screen, the server (/api/ask
// recalculates it itself, never trusting numbers from the browser), the
// number check on GR-1's answer, and the fallback sentence.
//
// Contributions only: money already put in plus new instalments. No returns.
//
//   window      = instalment dates after today, up to and including the same
//                 date 12 months later (e.g. 7 Nov 2026 → 7 Nov 2027)
//   keep        = every instalment in the window
//   skip        = one fewer (the next instalment is not taken)
//   pause N     = N fewer (the next N instalments are not taken)
//   lower to X  = every instalment, at X instead of the current amount
//   cancel      = no more instalments
//
// Example, Sample Flexi Cap (₹500 on the 5th, ₹3,000 invested), today 7 Nov 2026:
//   keep 12 → ₹9,000 · skip 11 → ₹8,500 · pause 2 months 10 → ₹8,000 ·
//   lower to ₹200 12 → ₹5,400 · cancel 0 → ₹3,000 (by Nov 2027)

import { getSip } from "../data/sips";
import { instalmentAfterNext } from "./dates";
import { formatRupees, invested } from "./sip";
import type { PauseMonths, Sip } from "./types";

export type CompareOptionId = "keep" | "skip" | "pause" | "lower" | "cancel";

/** What the user chose on the Compare screen. */
export type CompareInputs = { pauseMonths: PauseMonths; lowerAmount: number };

export const DEFAULT_COMPARE: CompareInputs = { pauseMonths: 2, lowerAmount: 200 };

export type CompareResult = {
  id: CompareOptionId;
  label: string; // "Pause 2 months", "Lower to ₹200"
  instalments: number; // instalments paid in the next 12 months
  monthlyAmount: number; // amount of each of those instalments (0 for cancel)
  newMoney: number; // instalments × monthlyAmount
  totalPutIn: number; // already invested + newMoney
  runningAtMonth12: boolean;
};

export type Comparison = {
  sipId: string;
  fundName: string;
  goalName?: string;
  goalTarget?: number;
  currentAmount: number;
  alreadyInvested: number;
  windowEnd: Date;
  /** "Nov 2027" */
  byLabel: string;
  inputs: CompareInputs;
  results: CompareResult[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Lowest and highest amounts allowed on the Lower card (minimum ₹100, less than now). */
export function lowerAmountIsValid(sip: Sip, amount: number): boolean {
  return Number.isInteger(amount) && amount >= sip.minAmount && amount < sip.monthlyAmount;
}

/** Number of instalment dates after today, up to and including the same date 12 months later. */
export function instalmentsInNext12Months(instalmentDay: number, today: Date): { count: number; windowEnd: Date } {
  const windowEnd = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  let count = 0;
  while (instalmentAfterNext(instalmentDay, count, today) <= windowEnd) count++;
  return { count, windowEnd };
}

export function compareOptions(sipId: string, inputs: CompareInputs, today: Date): Comparison {
  const sip = getSip(sipId);
  const { count, windowEnd } = instalmentsInNext12Months(sip.instalmentDay, today);
  const already = invested(sip);
  const amount = sip.monthlyAmount;
  const pauseCount = Math.min(inputs.pauseMonths, count);

  const result = (
    id: CompareOptionId,
    label: string,
    instalments: number,
    monthlyAmount: number,
    runningAtMonth12: boolean,
  ): CompareResult => ({
    id,
    label,
    instalments,
    monthlyAmount,
    newMoney: instalments * monthlyAmount,
    totalPutIn: already + instalments * monthlyAmount,
    runningAtMonth12,
  });

  return {
    sipId,
    fundName: sip.fundName,
    goalName: sip.goalName,
    goalTarget: sip.goalTarget,
    currentAmount: amount,
    alreadyInvested: already,
    windowEnd,
    byLabel: `${MONTHS[windowEnd.getMonth()]} ${windowEnd.getFullYear()}`,
    inputs,
    results: [
      result("keep", "Keep as is", count, amount, true),
      result("skip", "Skip next instalment", Math.max(0, count - 1), amount, true),
      result("pause", `Pause ${inputs.pauseMonths} ${inputs.pauseMonths === 1 ? "month" : "months"}`, count - pauseCount, amount, true),
      result("lower", `Lower to ${formatRupees(inputs.lowerAmount)}`, count, inputs.lowerAmount, true),
      result("cancel", "Cancel", 0, 0, false),
    ],
  };
}

/** "12 instalments" / "1 instalment" */
export function instalmentsText(n: number): string {
  return `${n} ${n === 1 ? "instalment" : "instalments"}`;
}

/** The comparison as plain lines, for the GR-1 prompt. */
export function comparisonForPrompt(c: Comparison): string {
  const lines = c.results.map((r) => {
    const parts = [
      `${r.label}: ${instalmentsText(r.instalments)} in the next 12 months`,
      r.instalments > 0 ? `${formatRupees(r.newMoney)} of new instalments (${formatRupees(r.monthlyAmount)} each)` : "no new instalments",
      `${formatRupees(r.totalPutIn)} put in by ${c.byLabel}`,
      `SIP running in ${c.byLabel}: ${r.runningAtMonth12 ? "yes" : "no"}`,
    ];
    if (c.goalTarget && c.goalName) parts.push(`${formatRupees(r.totalPutIn)} of ${formatRupees(c.goalTarget)} towards ${c.goalName}`);
    return `- ${parts.join("; ")}`;
  });
  return [
    `Fund: ${c.fundName}. Current amount ${formatRupees(c.currentAmount)} a month. Already invested ${formatRupees(c.alreadyInvested)}.`,
    `Results for the next 12 months (to ${c.byLabel}), money put in only, no returns:`,
    ...lines,
  ].join("\n");
}

/**
 * The fallback shown when GR-1's answer fails the number check: the
 * calculated values in one fixed sentence template.
 */
export function comparisonFallbackText(c: Comparison): string {
  const parts = c.results.map((r) =>
    r.id === "cancel"
      ? `${r.label}: no more instalments, ${formatRupees(r.totalPutIn)} put in and the SIP stopped`
      : `${r.label}: ${instalmentsText(r.instalments)}, ${formatRupees(r.totalPutIn)} put in`,
  );
  return `By ${c.byLabel}: ${parts.join("; ")}. These count only money you put in, not market returns.`;
}

/**
 * The values GR-1 may write in an answer about this comparison. Amounts: every
 * calculated total and new-instalment amount, the current and lowered monthly
 * amounts, and the money already invested. Counts (before "instalment(s)"):
 * every instalment count, 12 (the window) and the pause length (the instalments a
 * pause skips).
 */
export function allowedNumbers(c: Comparison): { amounts: Set<number>; counts: Set<number> } {
  const amounts = new Set<number>([c.currentAmount, c.alreadyInvested, c.inputs.lowerAmount]);
  const counts = new Set<number>([12, c.inputs.pauseMonths]);
  for (const r of c.results) {
    amounts.add(r.totalPutIn);
    amounts.add(r.newMoney);
    if (r.monthlyAmount) amounts.add(r.monthlyAmount);
    counts.add(r.instalments);
  }
  return { amounts, counts };
}

/** Amounts that are always allowed in the text (PM decision): the ₹100 minimum and the ₹60,000 goal. */
export const ALWAYS_ALLOWED_AMOUNTS = [100, 60000];

/**
 * The number check: every ₹ amount and every count of instalments in the text
 * must match a calculated value. Other numbers (dates, "1 to 3 months" from
 * rule R3) are not checked. Returns the first number that doesn't match, or
 * null when all match.
 */
export function findUnmatchedNumber(text: string, c: Comparison): string | null {
  const { amounts, counts } = allowedNumbers(c);
  for (const m of text.matchAll(/(?:₹|\bRs\.?|\bINR)\s?(\d[\d,]*(?:\.\d+)?)/gi)) {
    const value = Number(m[1].replace(/,/g, ""));
    if (!amounts.has(value) && !ALWAYS_ALLOWED_AMOUNTS.includes(value)) return m[0].trim();
  }
  for (const m of text.matchAll(/\b(\d+)\s+(?:more\s+|fewer\s+|monthly\s+|new\s+)?(instalments?|installments?)\b/gi)) {
    if (!counts.has(Number(m[1]))) return m[0].trim();
  }
  return null;
}

/** "2026-11-07": the date sent to the server with a Compare question. */
export function isoDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
