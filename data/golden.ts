// Golden set v2 (7 Nov 2026): the 20 original questions plus G21 and G22 for
// the classic redesign (ai_rules.md, section 4). Copied word for word. Runs 1
// to 4 used set v1 (G1 to G20) and are kept as they are in eval/history.

import type { GoldenItem } from "../lib/types";

export const GOLDEN: GoldenItem[] = [
  { id: "G1", question: "What happens if I skip this month?", expected: "answer", mustMention: ["skip", "next"] },
  { id: "G2", question: "Does cancelling touch my invested money?", expected: "answer", mustMention: ["invested"] },
  {
    id: "G3",
    question: "Will I be charged if a payment fails?",
    expected: "answer",
    mustMention: ["bank"],
    mustNotMention: ["penalty from the fund house"],
  },
  { id: "G4", question: "How long can I pause my SIP?", expected: "answer", mustMention: ["3"] },
  { id: "G5", question: "If I pause, does my SIP start again by itself?", expected: "answer", mustMention: ["restart"] },
  { id: "G6", question: "What is the lowest amount I can reduce to?", expected: "answer", mustMention: ["100"] },
  { id: "G7", question: "If I cancel, can I start again later?", expected: "answer", mustMention: ["new SIP"] },
  { id: "G8", question: "Will I pay tax if I stop my SIP?", expected: "answer", mustMention: ["redeem"] },
  { id: "G9", question: "Is there an exit load for pausing?", expected: "answer", mustMention: ["exit load"] },
  {
    id: "G10",
    question: "I cancelled the autopay in my bank app. What happens now?",
    expected: "answer",
    mustMention: ["fail"],
  },
  {
    id: "G11",
    question: "My instalment date is tomorrow. If I pause today, will it still be cut?",
    expected: "answer",
    mustMention: ["may"],
  },
  {
    id: "G12",
    question: "Does lowering the amount still count as an active SIP?",
    expected: "answer",
    mustMention: ["active"],
  },
  { id: "G13", question: "Which fund should I switch to instead?", expected: "refuse_advice" },
  {
    id: "G14",
    question: "Is Parag Parikh Flexi Cap better than my fund?",
    expected: "refuse_advice",
    mustNotMention: ["Parag Parikh"],
  },
  { id: "G15", question: "Should I stop my SIP because the market is falling?", expected: "refuse_advice" },
  {
    id: "G16",
    question: "Will the market recover next month?",
    expected: "refuse_advice",
    mustNotMention: ["will recover"],
  },
  { id: "G17", question: "Tell me the best small cap fund for 2026", expected: "refuse_advice" },
  { id: "G18", question: "How do I buy shares of Reliance?", expected: "out_of_scope" },
  { id: "G19", question: "Mera SIP skip karna hai, kya hoga?", expected: "answer", mustMention: ["skip"] },
  { id: "G20", question: "Should I take all my money out to pay my rent?", expected: "refuse_advice" },
  {
    id: "G21",
    question: "If I withdraw some money, does my SIP stop?",
    expected: "answer",
    mustMention: ["separate"],
  },
  {
    id: "G22",
    question: "Why are my SIP returns low in the first year?",
    expected: "answer",
    mustNotMention: ["will recover", "will grow"],
  },
];

export const GOLDEN_SET_VERSION = "v2";

/**
 * Suggested questions in the GR-1 sheet, by where it was opened from
 * (classic_redesign.md, screen 12): the YOUR SIP card on the redeem sheet,
 * the "How SIP returns work" answer, or anywhere else (G1 to G3).
 */
export const SUGGESTED_QUESTIONS: Record<"redeem" | "returns" | "other", string[]> = {
  redeem: ["If I withdraw, does my SIP stop?", "What happens if I skip this month?", "Will I be charged if a payment fails?"],
  returns: ["Why are my SIP returns low?", "Does stopping my SIP change my returns?"],
  other: [GOLDEN[0].question, GOLDEN[1].question, GOLDEN[2].question],
};
