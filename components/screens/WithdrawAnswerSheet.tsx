"use client";

// NEW (green "New" tag): answer to "Want to withdraw money" on the cancel
// reasons screen. Starts with the two facts (R1, R5, R10), one short line,
// then four equal options: the only screen of suggestions in the cancel path.
// "Continue to cancel" has the same size and weight as the others and goes
// straight to cancel confirm. "Withdraw money, keep SIP" opens this SIP's
// "Redeem [fund]" amount screen directly; Back returns here.

import { ArrowUpRight, CalendarX2, CirclePause, CircleX } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { CancelFactsNote } from "../phone/CancelFacts";
import { NewTag } from "../phone/parts";
import { OptionRow } from "../phone/OptionRow";
import { Sheet } from "../phone/Sheet";

export default function WithdrawAnswerSheet() {
  const { state, dispatch } = useDemo();
  return (
    <Sheet label="Withdrawing and cancelling are different" onDismiss={() => dispatch({ type: "back" })}>
      <NewTag />
      <h2 className="mt-2 text-[20px] font-medium leading-snug text-ink">Withdrawing and cancelling are different</h2>
      <CancelFactsNote sip={getSip(state.sipId)} className="mt-3" />
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">You can take money out and keep your SIP running.</p>

      <div className="mt-4 flex flex-col gap-2.5">
        <OptionRow Icon={ArrowUpRight} chevron onClick={() => dispatch({ type: "withdrawKeepSip" })}>
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
