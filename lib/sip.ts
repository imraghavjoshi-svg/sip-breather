// Values worked out from a SIP (never stored, per data_model.md).

import { formatDayMonth, instalmentAfterNext, nextInstalment, pauseRestart } from "./dates";
import type { Decision, Sip } from "./types";

/** invested = monthlyAmount × instalmentsDone */
export function invested(sip: Sip): number {
  return sip.monthlyAmount * sip.instalmentsDone;
}

/** Goal progress from 0 to 1, or null if the SIP has no goal. */
export function goalProgress(sip: Sip): number | null {
  if (!sip.goalTarget) return null;
  return Math.min(1, invested(sip) / sip.goalTarget);
}

/** "₹3,000", "₹60,000", "₹1,00,000" (Indian grouping, whole rupees). */
export function formatRupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export type SipStatus = "active" | "skipping" | "paused" | "cancelled";

/** What the SIP screens show, after applying the user's confirmed choice (if it is for this SIP). */
export type SipView = {
  sip: Sip;
  status: SipStatus;
  monthlyAmount: number;
  invested: number;
  /** null once cancelled. */
  nextDate: Date | null;
  /** Short status for cards, e.g. "Paused till 5 Feb". */
  statusLabel: string;
};

export function sipView(sip: Sip, decision: Decision | null, today: Date): SipView {
  const base: SipView = {
    sip,
    status: "active",
    monthlyAmount: sip.monthlyAmount,
    invested: invested(sip),
    nextDate: nextInstalment(sip.instalmentDay, today),
    statusLabel: "Active",
  };
  if (!decision || decision.sipId !== sip.id) return base;

  switch (decision.option) {
    case "skip": {
      const skipped = nextInstalment(sip.instalmentDay, today);
      return {
        ...base,
        status: "skipping",
        nextDate: instalmentAfterNext(sip.instalmentDay, 1, today),
        statusLabel: `Skipping ${formatDayMonth(skipped)}`,
      };
    }
    case "pause": {
      const restart = pauseRestart(sip.instalmentDay, decision.pauseMonths ?? 1, today);
      return { ...base, status: "paused", nextDate: restart, statusLabel: `Paused till ${formatDayMonth(restart)}` };
    }
    case "lower":
      return { ...base, monthlyAmount: decision.newAmount ?? sip.monthlyAmount, statusLabel: "Amount lowered" };
    case "cancel":
      return { ...base, status: "cancelled", nextDate: null, statusLabel: "Cancelled" };
  }
}

/** Most digits the keypad accepts (₹9,99,999 is far above any demo amount). */
export const MAX_AMOUNT_DIGITS = 6;

/**
 * Checks a new monthly amount typed on the keypad (whole rupees).
 * Empty input is not an error yet; it just cannot continue.
 */
export function checkNewAmount(
  input: string,
  current: number,
  minAmount: number,
): { ok: boolean; error: string | null } {
  if (input === "") return { ok: false, error: null };
  const amount = Number(input);
  if (amount < minAmount) return { ok: false, error: `Minimum required is ${formatRupees(minAmount)}` };
  if (amount >= current) return { ok: false, error: `Enter less than ${formatRupees(current)}` };
  return { ok: true, error: null };
}
