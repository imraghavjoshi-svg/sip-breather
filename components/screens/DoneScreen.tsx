"use client";

// Done, in classic Groww's style. Green tick + a message for the chosen option.
// No returns or growth claims: only "stays invested".

import type { ReactNode } from "react";
import { Bell, CalendarDays, Check, RotateCcw, Wallet } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import {
  dateChangeSentence,
  dateChangeStart,
  daysBefore,
  formatDayMonth,
  formatFullDate,
  instalmentAfterNext,
  nextInstalment,
  ordinal,
  pauseRestart,
} from "@/lib/dates";
import { formatRupees, invested } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Disclaimer, SipFundSquare } from "../phone/parts";
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
  const investedText = <b className="font-medium text-ink">{formatRupees(invested(sip))}</b>;

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
          Your SIP continues on <b className="font-medium text-ink">{formatFullDate(continues)}</b>.
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
            Next instalment on <b className="font-medium text-ink">{formatFullDate(restart)}</b>.
          </InfoRow>
          <InfoRow Icon={Bell} last>
            We&apos;ll remind you on {formatDayMonth(daysBefore(restart, 3))}, 3 days before, with all options again.
          </InfoRow>
        </>
      );
      break;
    }
    case "lower":
    case "date": {
      const amount = formatRupees(decision.newAmount ?? sip.monthlyAmount);
      if (!decision.newDay) {
        title = `Your SIP is now ${amount} a month`;
        subtitle = "Your SIP stays active at the lower amount.";
        rows = (
          <InfoRow Icon={CalendarDays} last>
            From your next instalment on <b className="font-medium text-ink">{formatFullDate(next)}</b>.
          </InfoRow>
        );
        break;
      }
      const { firstOnNewDay } = dateChangeStart(sip.instalmentDay, decision.newDay, today);
      title =
        decision.option === "date"
          ? `Your SIP date is now the ${ordinal(decision.newDay)}`
          : `Your SIP is now ${amount} on the ${ordinal(decision.newDay)}`;
      subtitle = `From ${formatFullDate(firstOnNewDay)}, every month.`;
      rows = (
        <InfoRow Icon={CalendarDays} last>
          {dateChangeSentence(sip.instalmentDay, decision.newDay, today)}
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
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-14">
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent-tint">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-button">
            <Check size={28} strokeWidth={3} color="white" aria-hidden />
          </div>
        </div>

        <h1 className="mt-6 text-center text-[22px] font-medium leading-snug text-ink" role="status">
          {title}
        </h1>
        <p className="mt-2 text-center text-[15px] text-ink-2">{subtitle}</p>

        <div className="mt-8 rounded-xl border border-line px-[15px]">
          <div className="flex items-center gap-3 border-b border-line-soft py-3">
            <SipFundSquare sip={sip} size={30} />
            <p className="min-w-0 text-[14px] leading-snug text-ink">{sip.fundName}</p>
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
