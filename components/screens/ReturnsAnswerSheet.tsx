"use client";

// NEW (green "New" tag): answer to "Not satisfied with returns" on the cancel
// reasons screen. Starts with the two facts (R1, R5, R10), one short line from
// R11 (no predictions, no fund names), the sources, then three equal options:
// the only screen of suggestions in the cancel path. "Continue to cancel" goes
// straight to cancel confirm.

import { CircleMinus, CirclePause, CircleX } from "lucide-react";
import { SOURCES } from "@/data/rules";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { CancelFactsNote } from "../phone/CancelFacts";
import { NewTag } from "../phone/parts";
import { OptionRow } from "../phone/OptionRow";
import { Sheet } from "../phone/Sheet";

/** First sentence of rule R11, word for word. */
const R11_SHORT = "SIP returns move with the market and can be low or negative in the first months or years.";

export default function ReturnsAnswerSheet() {
  const { state, dispatch } = useDemo();
  return (
    <Sheet label="How SIP returns work" onDismiss={() => dispatch({ type: "back" })}>
      <NewTag />
      <h2 className="mt-2 text-[20px] font-medium leading-snug text-ink">How SIP returns work</h2>
      <CancelFactsNote sip={getSip(state.sipId)} className="mt-3" />
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{R11_SHORT}</p>
      <p className="mt-1.5 text-[12px] text-ink-3">Source: {SOURCES.map((s) => s.label).join(" · ")}</p>

      <div className="mt-4 flex flex-col gap-2.5">
        <OptionRow Icon={CircleMinus} chevron onClick={() => dispatch({ type: "go", screen: "lower" })}>
          Lower the amount
        </OptionRow>
        <OptionRow Icon={CirclePause} chevron onClick={() => dispatch({ type: "go", screen: "pause" })}>
          Pause for 1–3 months
        </OptionRow>
        <OptionRow Icon={CircleX} chevron onClick={() => dispatch({ type: "go", screen: "cancelConfirm" })}>
          Continue to cancel
        </OptionRow>
      </div>
    </Sheet>
  );
}
