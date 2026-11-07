"use client";

// NEW (green "New" tag): answer to "Not satisfied with returns" on the cancel
// reasons screen. Rule R11 word for word (no predictions, no fund names),
// "Ask GR-1 about this", then three equal options.

import { CircleMinus, CirclePause, CircleX } from "lucide-react";
import { getRule, SOURCES } from "@/data/rules";
import { useDemo } from "@/lib/demoState";
import { Gr1Swirl, NewTag } from "../phone/parts";
import { OptionRow } from "../phone/OptionRow";
import { Sheet } from "../phone/Sheet";

export default function ReturnsAnswerSheet() {
  const { dispatch } = useDemo();
  return (
    <Sheet label="How SIP returns work" onDismiss={() => dispatch({ type: "back" })}>
      <NewTag />
      <h2 className="mt-2 text-[20px] font-medium leading-snug text-ink">How SIP returns work</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{getRule("R11").text}</p>
      <p className="mt-2 text-[12px] text-ink-3">Source: {SOURCES.map((s) => s.label).join(" · ")}</p>

      <button
        type="button"
        onClick={() => dispatch({ type: "openGr1", from: "returns" })}
        className="mt-3 flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[14px] font-medium text-ink hover:bg-[#fafafa]"
      >
        <Gr1Swirl size={16} /> Ask GR-1 about this
      </button>

      <div className="mt-5 flex flex-col gap-2.5">
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
