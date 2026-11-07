"use client";

// Small confirm after "Continue" on "Change amount/date" (PM decision: every
// option gets one confirm step). Sits over the dimmed screen. Shows the new
// amount, the new date, or both when both were changed in the same visit.

import { CalendarDays, CircleCheck, IndianRupee, Wallet } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { dateChangeStart, formatDayMonth, formatFullDate, nextInstalment, ordinal } from "@/lib/dates";
import { checkNewAmount, formatRupees, invested, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { InfoRow } from "../phone/InfoRow";
import { PrimaryButton, Sheet, TextButton } from "../phone/Sheet";

export default function LowerConfirmSheet() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const sip = getSip(state.sipId);
  const view = sipView(sip, state.decision, today);
  const current = view.monthlyAmount;
  const amountChanged = checkNewAmount(state.draft.amountInput, current, sip.minAmount).ok;
  const newAmount = Number(state.draft.amountInput);
  const newDay = state.draft.newDay !== undefined && state.draft.newDay !== view.instalmentDay ? state.draft.newDay : undefined;
  const start = newDay ? dateChangeStart(view.instalmentDay, newDay, today) : null;

  const title =
    amountChanged && newDay
      ? `Change to ${formatRupees(newAmount)} on the ${ordinal(newDay)}?`
      : newDay
        ? `Change SIP date to the ${ordinal(newDay)}?`
        : `Lower to ${formatRupees(newAmount)} a month?`;

  return (
    <Sheet label="Confirm change" onDismiss={() => dispatch({ type: "back" })}>
      <h2 className="text-[20px] font-medium text-ink">{title}</h2>
      {start && (
        <p className="mt-1 text-[14px] text-ink-2">From {formatDayMonth(start.firstOnNewDay)}, every month</p>
      )}

      <div className="mt-4 rounded-xl border border-line px-[15px]">
        {amountChanged && (
          <InfoRow Icon={IndianRupee}>
            Amount: from {formatRupees(current)} to <b className="font-medium text-ink">{formatRupees(newAmount)}</b>
            {!start && (
              <>
                , starting with your next instalment on{" "}
                <b className="font-medium text-ink">{formatFullDate(nextInstalment(view.instalmentDay, today))}</b>
              </>
            )}
            .
          </InfoRow>
        )}
        {start && (
          <InfoRow Icon={CalendarDays}>
            Date: from the {ordinal(view.instalmentDay)} to <b className="font-medium text-ink">the {ordinal(newDay!)}</b>.{" "}
            {start.oldInstalmentStays ? (
              <>
                Your next instalment on {formatDayMonth(start.oldInstalmentStays)} stays as it is. The new date starts from{" "}
                <b className="font-medium text-ink">{formatFullDate(start.firstOnNewDay)}</b>.
              </>
            ) : (
              <>
                Next instalment on <b className="font-medium text-ink">{formatFullDate(start.firstOnNewDay)}</b>.
              </>
            )}
          </InfoRow>
        )}
        <InfoRow Icon={CircleCheck}>Your SIP stays active.</InfoRow>
        <InfoRow Icon={Wallet} last>
          Your <b className="font-medium text-ink">{formatRupees(invested(sip))}</b> stays invested.
        </InfoRow>
      </div>

      <div className="mt-5 flex flex-col gap-1">
        <PrimaryButton onClick={() => dispatch({ type: "confirm", option: amountChanged ? "lower" : "date" })}>
          Confirm
        </PrimaryButton>
        <TextButton onClick={() => dispatch({ type: "back" })}>Go back</TextButton>
      </div>
    </Sheet>
  );
}
