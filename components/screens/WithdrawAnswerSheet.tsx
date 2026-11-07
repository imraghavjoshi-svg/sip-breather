"use client";

// NEW (green "New" tag): answer to "Want to withdraw money" on the cancel
// reasons screen. Explains that withdrawing and cancelling are different,
// then four equal options. "Continue to cancel" has the same size and weight
// as the others.

import { ArrowUpRight, CalendarX2, CirclePause, CircleX } from "lucide-react";
import { useDemo } from "@/lib/demoState";
import { NewTag } from "../phone/parts";
import { OptionRow } from "../phone/OptionRow";
import { Sheet } from "../phone/Sheet";

export default function WithdrawAnswerSheet() {
  const { dispatch } = useDemo();
  return (
    <Sheet label="Withdrawing and cancelling are different" onDismiss={() => dispatch({ type: "back" })}>
      <NewTag />
      <h2 className="mt-2 text-[20px] font-medium leading-snug text-ink">Withdrawing and cancelling are different</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
        You can take out some or all of your invested money and keep your SIP running. Or skip just the next
        instalment.
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        <OptionRow Icon={ArrowUpRight} chevron onClick={() => dispatch({ type: "startRedeem" })}>
          Withdraw money, keep SIP
        </OptionRow>
        <OptionRow Icon={CalendarX2} chevron onClick={() => dispatch({ type: "go", screen: "skipConfirm" })}>
          Skip next instalment
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
