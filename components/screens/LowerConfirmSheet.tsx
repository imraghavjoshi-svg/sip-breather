"use client";

// Small confirm after "Continue" on Lower the amount (PM decision: every option
// gets one confirm step). Sits over the dimmed keypad screen.

import { CalendarDays, CircleCheck, Wallet } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { formatFullDate, nextInstalment } from "@/lib/dates";
import { formatRupees, invested, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { InfoRow } from "../phone/InfoRow";
import { PrimaryButton, Sheet, TextButton } from "../phone/Sheet";

export default function LowerConfirmSheet() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const sip = getSip(state.sipId);
  const current = sipView(sip, state.decision, today).monthlyAmount;
  const newAmount = Number(state.draft.amountInput);

  return (
    <Sheet label="Lower the amount" onDismiss={() => dispatch({ type: "back" })}>
      <h2 className="text-[22px] font-bold tracking-tight text-gray-900">
        Lower to {formatRupees(newAmount)} a month?
      </h2>
      <p className="mt-1.5 text-[15px] text-gray-500">
        From {formatRupees(current)} to {formatRupees(newAmount)}.
      </p>

      <div className="mt-4 rounded-2xl border border-gray-200 px-4">
        <InfoRow Icon={CalendarDays}>
          Starts with your next instalment on{" "}
          <b className="font-semibold text-gray-900">{formatFullDate(nextInstalment(sip.instalmentDay, today))}</b>.
        </InfoRow>
        <InfoRow Icon={CircleCheck}>Your SIP stays active.</InfoRow>
        <InfoRow Icon={Wallet} last>
          Your <b className="font-semibold text-gray-900">{formatRupees(invested(sip))}</b> stays invested.
        </InfoRow>
      </div>

      <div className="mt-5 flex flex-col gap-1">
        <PrimaryButton onClick={() => dispatch({ type: "confirm", option: "lower" })}>Confirm new amount</PrimaryButton>
        <TextButton onClick={() => dispatch({ type: "back" })}>Go back</TextButton>
      </div>
    </Sheet>
  );
}
