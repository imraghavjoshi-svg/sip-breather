"use client";

// Cancel confirm (fix 4, user test 1). Calm and plain: a heading, the two
// facts people want (R1/R5: invested money stays; R10: start a new SIP
// anytime), then "Cancel SIP" and "Go back". Nothing else: no guilt, no
// countdown, no red, no more suggestions.

import { RotateCcw, Wallet } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { formatRupees, invested, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { InfoRow } from "../phone/InfoRow";
import { PrimaryButton, Sheet, TextButton } from "../phone/Sheet";

export default function CancelConfirmSheet({ stacked = false }: { stacked?: boolean }) {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const sip = getSip(state.sipId);
  const view = sipView(sip, state.decision, today);

  return (
    <Sheet label="Cancel SIP" onDismiss={() => dispatch({ type: "back" })} stacked={stacked}>
      <h2 className="text-[20px] font-medium text-ink">Cancel your {formatRupees(view.monthlyAmount)} monthly SIP?</h2>

      <div className="mt-4 rounded-xl border border-line px-[15px]">
        <InfoRow Icon={Wallet}>
          Your <b className="font-medium text-ink">{formatRupees(invested(sip))}</b> stays invested
        </InfoRow>
        <InfoRow Icon={RotateCcw} last>
          You can start a new SIP anytime
        </InfoRow>
      </div>

      <div className="mt-5 flex flex-col gap-1">
        <PrimaryButton onClick={() => dispatch({ type: "confirm", option: "cancel" })}>Cancel SIP</PrimaryButton>
        <TextButton onClick={() => dispatch({ type: "back" })}>Go back</TextButton>
      </div>
    </Sheet>
  );
}
