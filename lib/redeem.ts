// Redeem flow numbers (copy of Groww's existing redeem screens).
// Everything is worked out from the sample holdings; nothing is stored.

import { HOLDINGS, getHolding } from "../data/holdings";
import { getSip } from "../data/sips";
import { invested, sipView, type SipView } from "./sip";
import type { Decision } from "./types";

export const MIN_REDEEM = 100;

/** Total that can be redeemed: the current value of both holdings (₹7,084). */
export function availableToRedeem(): number {
  return HOLDINGS.reduce((sum, h) => sum + h.currentValue, 0);
}

export type RedeemPart = { sipId: string; fundName: string; amount: number };

/**
 * Which funds the money comes from (PM decision, 7 Nov):
 * up to the Flexi Cap value → 1 fund (Flexi Cap);
 * above that → Flexi Cap in full plus the rest from Midcap.
 */
export function splitRedemption(amount: number): RedeemPart[] {
  const flexi = getHolding("sip_flexi").currentValue;
  const part = (sipId: string, amt: number): RedeemPart => ({
    sipId,
    fundName: getSip(sipId).fundName,
    amount: Math.round(amt * 100) / 100,
  });
  if (amount <= flexi) return [part("sip_flexi", amount)];
  return [part("sip_flexi", flexi), part("sip_mid", amount - flexi)];
}

/**
 * Short-term capital gain in the amount redeemed: the gain share of each
 * fund's current value. All units are under a year old, so long-term is ₹0.
 */
export function shortTermGain(parts: RedeemPart[]): number {
  const total = parts.reduce((sum, p) => {
    const h = getHolding(p.sipId);
    const gainShare = (h.currentValue - invested(getSip(p.sipId))) / h.currentValue;
    return sum + p.amount * gainShare;
  }, 0);
  return Math.round(total * 100) / 100;
}

/** Most digits before the decimal point on the redeem keypad. */
export const MAX_REDEEM_DIGITS = 6;

/** Adds one keypad press to the typed amount (digits, one ".", up to 2 decimals). */
export function pressRedeemKey(input: string, key: string): string {
  if (key === "back") return input.slice(0, -1);
  const [whole, decimals] = input.split(".");
  if (key === ".") {
    if (input.includes(".")) return input;
    return input === "" ? "0." : input + ".";
  }
  if (decimals !== undefined) return decimals.length >= 2 ? input : input + key;
  if (whole.length >= MAX_REDEEM_DIGITS) return input;
  if (input === "0") return key; // replace a lone leading zero
  if (input === "" && key === "0") return "0";
  return input + key;
}

export function checkRedeemAmount(input: string): { ok: boolean; error: string | null } {
  if (input === "" || input === "0" || input === "0.") return { ok: false, error: null };
  const amount = Number(input);
  if (amount < MIN_REDEEM) return { ok: false, error: `Minimum required is ₹${MIN_REDEEM}` };
  const max = availableToRedeem();
  if (amount > max) return { ok: false, error: `You can redeem up to ₹${max.toLocaleString("en-IN")}` };
  return { ok: true, error: null };
}

/** "₹1,000.00" */
export function formatRupees2(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * The SIPs of the funds being redeemed that still have an instalment coming
 * (not paused or cancelled). Used by the "YOUR SIP" card and the SIP picker.
 */
export function sipsWithInstalmentDue(parts: RedeemPart[], decision: Decision | null, today: Date): SipView[] {
  return parts
    .map((p) => sipView(getSip(p.sipId), decision, today))
    .filter((v) => v.status !== "cancelled" && v.status !== "paused" && v.nextDate !== null);
}
