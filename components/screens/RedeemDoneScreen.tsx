"use client";

// "Redemption placed" (no OTP screen in this demo). Classic Groww style.
// The last line says what happens to the SIP of this fund, so it is clear
// that withdrawing did not stop it.

import { Check } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { expectedTransferDate, formatDayMonth, formatFullDate } from "@/lib/dates";
import { BANK_LABEL, formatRupees2 } from "@/lib/redeem";
import { sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Disclaimer } from "../phone/parts";
import { PrimaryButton } from "../phone/Sheet";

export default function RedeemDoneScreen() {
  const { state, dispatch } = useDemo();
  const device = useDevice();
  const today = useToday();
  const sip = getSip(state.sipId);
  const view = sipView(sip, state.decision, today);
  const amount = Number(state.redeemInput);

  let sipLine: string | null = null;
  if (view.status === "active") {
    sipLine = `Your SIP continues on ${formatDayMonth(view.nextDate!)}.`;
  } else if (view.status === "skipping") {
    sipLine = `Your next instalment is skipped. Your SIP continues on ${formatDayMonth(view.nextDate!)}.`;
  }

  return (
    <div className="flex h-full flex-col bg-white" style={{ paddingTop: device.safeTop }}>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-14">
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent-tint">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-button">
            <Check size={28} strokeWidth={3} color="white" aria-hidden />
          </div>
        </div>

        <h1 className="mt-6 text-center text-[22px] font-medium text-ink" role="status">
          Redemption placed
        </h1>
        <p className="mt-2 text-center text-[15px] leading-snug text-ink-2">
          Money usually reaches your bank by {formatFullDate(expectedTransferDate(today))}.
        </p>

        <dl className="mt-8 rounded-xl border border-line px-[15px]">
          <div className="flex items-start justify-between gap-4 border-b border-line-soft py-3">
            <dt className="text-[14px] leading-snug text-ink">{sip.fundName}</dt>
            <dd className="shrink-0 text-[14px] font-medium text-ink">{formatRupees2(amount)}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-[14px] text-ink-2">To</dt>
            <dd className="text-[14px] text-ink">{BANK_LABEL}</dd>
          </div>
        </dl>

        {sipLine && <p className="mt-4 rounded-xl bg-[#F6FCF9] px-[15px] py-3 text-[14px] leading-snug text-ink-2">{sipLine}</p>}

        <div className="flex-1" />
        <div className="mt-6">
          <PrimaryButton onClick={() => dispatch({ type: "backToDashboard" })}>Back to Dashboard</PrimaryButton>
        </div>
        <Disclaimer className="mt-3" />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}
