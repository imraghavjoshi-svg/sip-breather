"use client";

// Cancel confirm, restyled to classic Groww. Calm and plain: no guilt, no
// countdown, no red. No reason chips: the reason was already picked on
// "Choose your reason to cancel this SIP". "Goal is completed" adds a short
// congrats line.

import type { ReactNode } from "react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { formatFullDate, lastInstalment } from "@/lib/dates";
import { formatRupees, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { PrimaryButton, Sheet, TextButton } from "../phone/Sheet";

export default function CancelConfirmSheet({ stacked = false }: { stacked?: boolean }) {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const sip = getSip(state.sipId);
  const view = sipView(sip, state.decision, today);
  const goal = state.draft.cancelReason === "goal";

  return (
    <Sheet label="Cancel SIP" onDismiss={() => dispatch({ type: "back" })} stacked={stacked}>
      <p className="text-[15px] text-ink-2">You are cancelling</p>
      <h2 className="mt-0.5 text-[24px] font-medium text-ink">{formatRupees(view.monthlyAmount)} monthly SIP</h2>
      {goal && (
        <p className="mt-3 rounded-lg bg-[#F6FCF9] px-[15px] py-2.5 text-[14px] leading-snug text-ink">
          Congrats on reaching your goal. Your invested money stays invested until you redeem it.
        </p>
      )}
      <p className="mt-2 text-[14px] leading-snug text-ink-2">
        Your invested money stays invested. Only future instalments stop.
      </p>

      <dl className="mt-4 rounded-xl border border-line px-[15px]">
        <Row label="Invested money" value={<span className="font-medium">Stays invested</span>} />
        <Row label="Last instalment" value={formatFullDate(lastInstalment(sip.instalmentDay, today))} />
        <Row label="Restart" value={<span className="font-medium text-accent-text">Start a new SIP anytime</span>} last />
      </dl>

      <div className="mt-5 flex flex-col gap-1">
        <PrimaryButton onClick={() => dispatch({ type: "confirm", option: "cancel" })}>Cancel SIP</PrimaryButton>
        <TextButton onClick={() => dispatch({ type: "back" })}>Go back</TextButton>
      </div>
    </Sheet>
  );
}

function Row({ label, value, last = false }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${last ? "" : "border-b border-line-soft"}`}>
      <dt className="whitespace-nowrap text-[14px] text-ink-2">{label}</dt>
      <dd className="whitespace-nowrap text-right text-[14px] text-ink">{value}</dd>
    </div>
  );
}
