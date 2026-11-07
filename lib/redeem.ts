// Redeem flow numbers (copy of classic Groww's redeem screens).
// In classic Groww you redeem from one fund at a time (Dashboard → fund →
// Redeem), so everything here is for a single fund. Nothing is stored.

import { getHolding } from "../data/holdings";
import { getSip } from "../data/sips";
import { invested } from "./sip";

export const MIN_REDEEM = 100;

/** What can be redeemed from one fund: its current value (Flexi ₹3,036, Midcap ₹4,048). */
export function availableToRedeem(sipId: string): number {
  return getHolding(sipId).currentValue;
}

/**
 * Short-term capital gain in the amount redeemed: the gain share of the
 * fund's current value. All units are under a year old, so long-term is ₹0.
 */
export function shortTermGain(sipId: string, amount: number): number {
  const h = getHolding(sipId);
  const gainShare = (h.currentValue - invested(getSip(sipId))) / h.currentValue;
  return Math.round(amount * gainShare * 100) / 100;
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

/** Minimum ₹100, maximum = what is available in this fund. Empty input is not an error yet. */
export function checkRedeemAmount(input: string, max: number): { ok: boolean; error: string | null } {
  if (input === "" || input === "0" || input === "0.") return { ok: false, error: null };
  const amount = Number(input);
  if (amount < MIN_REDEEM) return { ok: false, error: `Minimum required is ₹${MIN_REDEEM}` };
  if (amount > max) return { ok: false, error: `You can redeem up to ₹${max.toLocaleString("en-IN")}` };
  return { ok: true, error: null };
}

/** "₹1,000.00" */
export function formatRupees2(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "-₹3.53" / "₹3.53" */
export function formatSignedRupees2(amount: number): string {
  return amount < 0 ? `-${formatRupees2(-amount)}` : formatRupees2(amount);
}

/** The bank shown everywhere: never a real bank name or account number. */
export const BANK_LABEL = "Your bank ••••0000";
