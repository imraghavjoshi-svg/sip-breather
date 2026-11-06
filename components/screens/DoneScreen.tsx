"use client";

// Screen 8: Done. Green tick + a message for the chosen option.
// No returns or growth claims: only "stays invested".

import type { ReactNode } from "react";
import { Bell, CalendarDays, Check, Layers, RotateCcw, Wallet } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import {
  daysBefore,
  formatDayMonth,
  formatFullDate,
  instalmentAfterNext,
  nextInstalment,
  pauseRestart,
} from "@/lib/dates";
import { formatRupees, invested } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Disclaimer } from "../phone/parts";
import { PrimaryButton } from "../phone/Sheet";
import { InfoRow } from "../phone/InfoRow";

export default function DoneScreen() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const device = useDevice();
  const decision = state.decision;
  if (!decision) return null;

  const sip = getSip(decision.sipId);
  const next = nextInstalment(sip.instalmentDay, today);
  const investedText = <b className="font-semibold text-gray-900">{formatRupees(invested(sip))}</b>;

  let title: string;
  let subtitle: string;
  let rows: ReactNode;

  switch (decision.option) {
    case "skip": {
      const continues = instalmentAfterNext(sip.instalmentDay, 1, today);
      title = `Your ${formatDayMonth(next)} instalment is skipped`;
      subtitle = "Only this one instalment is not taken.";
      rows = (
        <InfoRow Icon={CalendarDays} last>
          Your SIP continues on <b className="font-semibold text-gray-900">{formatFullDate(continues)}</b>.
        </InfoRow>
      );
      break;
    }
    case "pause": {
      const restart = pauseRestart(sip.instalmentDay, decision.pauseMonths ?? 1, today);
      title = `Your SIP is paused till ${formatDayMonth(restart)}`;
      subtitle = "It restarts on its own at the same amount.";
      rows = (
        <>
          <InfoRow Icon={CalendarDays}>
            Next instalment on <b className="font-semibold text-gray-900">{formatFullDate(restart)}</b>.
          </InfoRow>
          <InfoRow Icon={Bell} last>
            We&apos;ll remind you on {formatDayMonth(daysBefore(restart, 3))}, 3 days before, with all options again.
          </InfoRow>
        </>
      );
      break;
    }
    case "lower": {
      const amount = formatRupees(decision.newAmount ?? sip.monthlyAmount);
      title = `Your SIP is now ${amount} a month`;
      subtitle = "Your SIP stays active at the lower amount.";
      rows = (
        <InfoRow Icon={CalendarDays} last>
          From your next instalment on <b className="font-semibold text-gray-900">{formatFullDate(next)}</b>.
        </InfoRow>
      );
      break;
    }
    case "cancel":
      title = "Your SIP is cancelled";
      subtitle = "Only future instalments stop.";
      rows = (
        <InfoRow Icon={RotateCcw} last>
          You can start a new SIP anytime.
        </InfoRow>
      );
      break;
  }

  return (
    <div className="flex h-full flex-col bg-white" style={{ paddingTop: device.safeTop }}>
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pt-10">
        <div className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-full bg-accent-tint">
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#C6F4E8]">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-accent">
              <Check size={32} strokeWidth={3} color="white" aria-hidden />
            </div>
          </div>
        </div>

        <h1 className="mt-7 text-center text-[26px] font-bold leading-tight tracking-tight text-gray-900" role="status">
          {title}
        </h1>
        <p className="mt-2 text-center text-[16px] text-gray-500">{subtitle}</p>

        <div className="mt-8 rounded-2xl border border-gray-200 px-4">
          <div className="flex items-center gap-3 border-b border-gray-100 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF1E3] text-[#F07A1A]">
              <Layers size={20} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Fund name</p>
              <p className="text-[16px] font-semibold leading-snug text-gray-900">{sip.fundName}</p>
            </div>
          </div>
          <InfoRow Icon={Wallet}>Your {investedText} stays invested.</InfoRow>
          {rows}
        </div>

        <div className="flex-1" />
        <div className="mt-6">
          <PrimaryButton onClick={() => dispatch({ type: "backToSip" })}>Back to my SIP</PrimaryButton>
        </div>
        <Disclaimer className="mt-3" />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}
