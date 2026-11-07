"use client";

// Pause, in classic Groww's style. Choose 1, 2 or 3 months, see which
// instalments are skipped, the restart date and the reminder line. Dates
// start from the next instalment. When reached from "Choose your reason to
// cancel", a "Cancel instead" link is shown under the button.

import { Bell, CalendarX2, CirclePlay, ShieldCheck } from "lucide-react";
import { getSip } from "@/data/sips";
import { inCancelPath, useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { formatDayMonth, formatFullDate, pausedInstalments, pauseRestart } from "@/lib/dates";
import { formatRupees, invested } from "@/lib/sip";
import { useToday } from "@/lib/today";
import type { PauseMonths } from "@/lib/types";
import { Disclaimer, Gr1Swirl, ScreenHeader } from "../phone/parts";
import { InfoRow } from "../phone/InfoRow";
import { PrimaryButton, TextButton } from "../phone/Sheet";

export default function PauseScreen() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const device = useDevice();
  const sip = getSip(state.sipId);
  const months = state.draft.pauseMonths;
  const choices = Array.from({ length: sip.maxPauseMonths }, (_, i) => (i + 1) as PauseMonths);

  const skipped = pausedInstalments(sip.instalmentDay, months, today);
  const restart = pauseRestart(sip.instalmentDay, months, today);

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader
        title="Pause your SIP"
        large
        onBack={() => dispatch({ type: "back" })}
        right={
          <button
            type="button"
            onClick={() => dispatch({ type: "openGr1" })}
            aria-label="Ask GR-1 about pausing"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-line-soft"
          >
            <Gr1Swirl size={22} />
          </button>
        }
      />

      <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-2">
        <p className="text-[15px] leading-relaxed text-ink-2">
          Choose how long you want to pause instalments for <span className="text-ink">{sip.fundName}</span>.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Pause length">
          {choices.map((m) => {
            const selected = m === months;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => dispatch({ type: "setPauseMonths", months: m })}
                className={`h-11 whitespace-nowrap rounded-lg border text-[19px] transition-colors ${
                  selected ? "border-button bg-button font-bold text-white" : "border-line bg-white text-ink hover:bg-[#fafafa]"
                }`}
              >
                {m} {m === 1 ? "month" : "months"}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-line px-[15px]" aria-live="polite">
          <InfoRow Icon={CalendarX2}>
            No instalments on <b className="font-medium text-ink">{skipped.map(formatDayMonth).join(", ")}</b>
          </InfoRow>
          <InfoRow Icon={CirclePlay}>
            Restarts on <b className="font-medium text-ink">{formatFullDate(restart)}</b> at {formatRupees(sip.monthlyAmount)}
          </InfoRow>
          <InfoRow Icon={Bell} last>
            We&apos;ll remind you 3 days before, with all options again
          </InfoRow>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#F6FCF9] px-[15px] py-3">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-accent-text" aria-hidden />
          <p className="text-[14px] leading-snug text-ink-2">
            Your <b className="font-medium text-ink">{formatRupees(invested(sip))}</b> already invested stays invested
            during the pause.
          </p>
        </div>

        <div className="flex-1" />

        <div className="mt-6 flex flex-col gap-1">
          <PrimaryButton onClick={() => dispatch({ type: "confirm", option: "pause" })}>Confirm pause</PrimaryButton>
          {inCancelPath(state) && (
            <TextButton onClick={() => dispatch({ type: "go", screen: "cancelConfirm" })}>Cancel instead</TextButton>
          )}
        </div>
        <Disclaimer className="mt-2" />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}
