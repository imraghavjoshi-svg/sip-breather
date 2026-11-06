"use client";

// Small confirm after "Skip next instalment" (no design; same style as the other sheets).

import { CalendarDays, Wallet } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { formatDayMonth, formatFullDate, instalmentAfterNext, nextInstalment } from "@/lib/dates";
import { formatRupees, invested } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { InfoRow } from "../phone/InfoRow";
import { PrimaryButton, Sheet, TextButton } from "../phone/Sheet";

export default function SkipConfirmSheet() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const sip = getSip(state.sipId);
  const skipped = nextInstalment(sip.instalmentDay, today);
  const continues = instalmentAfterNext(sip.instalmentDay, 1, today);

  return (
    <Sheet label="Skip next instalment" onDismiss={() => dispatch({ type: "back" })} stacked>
      <h2 className="text-[22px] font-bold tracking-tight text-gray-900">
        Skip the {formatDayMonth(skipped)} instalment?
      </h2>
      <p className="mt-1.5 text-[15px] text-gray-500">Only this one instalment is not taken.</p>

      <div className="mt-4 rounded-2xl border border-gray-200 px-4">
        <InfoRow Icon={CalendarDays}>
          Your SIP continues on <b className="font-semibold text-gray-900">{formatFullDate(continues)}</b> at{" "}
          {formatRupees(sip.monthlyAmount)}.
        </InfoRow>
        <InfoRow Icon={Wallet} last>
          Your <b className="font-semibold text-gray-900">{formatRupees(invested(sip))}</b> stays invested.
        </InfoRow>
      </div>

      <div className="mt-5 flex flex-col gap-1">
        <PrimaryButton onClick={() => dispatch({ type: "confirm", option: "skip" })}>Confirm skip</PrimaryButton>
        <TextButton onClick={() => dispatch({ type: "back" })}>Go back</TextButton>
      </div>
    </Sheet>
  );
}
