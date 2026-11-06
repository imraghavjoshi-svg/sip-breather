// The only facts GR-1 may use (ai_rules.md, section 1). Text copied word for word.

import type { Rule, RuleId, RuleSource } from "../lib/types";

// Every rule has both sources (data_model.md). Shown under each answer as
// "Sources: AMFI investor education · Groww Help Centre".
export const SOURCES: RuleSource[] = [
  { label: "AMFI investor education", url: "https://www.amfiindia.com/investor-corner" },
  { label: "Groww Help Centre", url: "https://groww.in/help" },
];

export const RULES: Rule[] = [
  {
    id: "R1",
    title: "Invested money stays invested",
    text: "Skipping, pausing, lowering or cancelling a SIP only changes future instalments. Units you already bought stay invested in the fund and keep moving with the market. Taking money out is a separate action called redemption.",
    sources: SOURCES,
  },
  {
    id: "R2",
    title: "Skip one instalment",
    text: "Skipping means only the next instalment is not taken. The SIP continues as normal the month after. Not every fund house allows skipping; in this demo it is allowed.",
    sources: SOURCES,
  },
  {
    id: "R3",
    title: "Pause",
    text: "Pausing stops instalments for a set number of months, then the SIP restarts on its own at the same amount. In this demo you can pause for 1 to 3 months. Limits differ by fund house.",
    sources: SOURCES,
  },
  {
    id: "R4",
    title: "Lower the amount",
    text: "You can keep the SIP going with a smaller monthly amount, as long as it is not below the fund's minimum. In this demo the minimum is ₹100. A lower amount still keeps your SIP active.",
    sources: SOURCES,
  },
  {
    id: "R5",
    title: "Cancel",
    text: "Cancelling stops all future instalments. Your invested money stays invested (see R1). You can start a new SIP at any time later.",
    sources: SOURCES,
  },
  {
    id: "R6",
    title: "Failed or missed payment",
    text: "If an auto-debit fails, for example because of low balance, the fund house does not charge a penalty, but your bank may charge a fee for the failed debit. The amount depends on your bank. Several failed instalments in a row can lead the fund house to cancel the SIP.",
    sources: SOURCES,
  },
  {
    id: "R7",
    title: "Cancelling close to the date",
    text: "If you cancel or pause very close to the instalment date, that instalment may still be processed because the request takes a few working days.",
    sources: SOURCES,
  },
  {
    id: "R8",
    title: "Mandate",
    text: "The mandate (e-NACH or UPI AutoPay) is your permission for automatic debits and is held by your bank. Cancelling the mandate at your bank without changing the SIP makes the next instalments fail (see R6). Changing the SIP in the app is the cleaner way.",
    sources: SOURCES,
  },
  {
    id: "R9",
    title: "Exit load and tax only on redemption",
    text: "Stopping, pausing or skipping a SIP does not trigger exit load or tax. Those can apply only when you redeem (sell) units.",
    sources: SOURCES,
  },
  {
    id: "R10",
    title: "Restarting",
    text: "After a pause the SIP restarts by itself. After cancelling, you start a new SIP, which may need a new mandate.",
    sources: SOURCES,
  },
];

export const RULE_IDS = RULES.map((r) => r.id);

export function getRule(id: RuleId): Rule {
  const rule = RULES.find((r) => r.id === id);
  if (!rule) throw new Error(`Unknown rule id: ${id}`);
  return rule;
}
