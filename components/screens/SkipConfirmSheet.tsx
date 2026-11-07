"use client";

// Small confirm after "Skip" (YOUR SIP card on the redeem sheet, the
// Upcoming row on SIP details, or the withdraw answer). From the first two,
// confirming returns to that screen, which then shows the instalment as
// skipped; from the withdraw answer it goes to the Done screen.

import { CalendarDays, Wallet } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { formatDayMonth, formatFullDate, instalmentAfterNext, nextInstalment } from "@/lib/dates";
import { formatRupees, invested } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { InfoRow } from "../phone/InfoRow";
import { PrimaryButton, Sheet, TextButton } from "../phone/Sheet";

export default function SkipConfirmSheet({ stacked = false }: { stacked?: boolean }) {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const sip = getSip(state.sipId);
  const skipped = nextInstalment(sip.instalmentDay, today);
  const continues = instalmentAfterNext(sip.instalmentDay, 1, today);

  return (
    <Sheet label="Skip next instalment" onDismiss={() => dispatch({ type: "back" })} stacked={stacked}>
      <h2 className="text-[20px] font-medium text-ink">Skip the {formatDayMonth(skipped)} instalment?</h2>
      <p className="mt-1 text-[14px] text-ink-2">Only this one instalment is not taken.</p>

      <div className="mt-4 rounded-xl border border-line px-[15px]">
        <InfoRow Icon={CalendarDays}>
          Your SIP continues on <b className="font-medium text-ink">{formatFullDate(continues)}</b> at{" "}
          {formatRupees(sip.monthlyAmount)}.
        </InfoRow>
        <InfoRow Icon={Wallet} last>
          Your <b className="font-medium text-ink">{formatRupees(invested(sip))}</b> stays invested.
        </InfoRow>
      </div>

      <div className="mt-5 flex flex-col gap-1">
        <PrimaryButton onClick={() => dispatch({ type: "confirmSkip" })}>Skip instalment</PrimaryButton>
        <TextButton onClick={() => dispatch({ type: "back" })}>Go back</TextButton>
      </div>
    </Sheet>
  );
}
