"use client";

// Screen 4: Pause. Choose 1, 2 or 3 months, see which instalments are skipped,
// the restart date and the reminder line. Dates start from the next instalment.

import { Bell, CalendarX2, CircleQuestionMark, CirclePlay, ShieldCheck } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { formatDayMonth, formatFullDate, pausedInstalments, pauseRestart } from "@/lib/dates";
import { formatRupees, invested } from "@/lib/sip";
import { useToday } from "@/lib/today";
import type { PauseMonths } from "@/lib/types";
import { Disclaimer, ScreenHeader } from "../phone/parts";
import { InfoRow } from "../phone/InfoRow";
import { PrimaryButton } from "../phone/Sheet";

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
        onBack={() => dispatch({ type: "back" })}
        right={
          <button
            type="button"
            onClick={() => dispatch({ type: "openGr1" })}
            aria-label="Ask GR-1 about pausing"
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-800 hover:bg-gray-100"
          >
            <CircleQuestionMark size={24} />
          </button>
        }
      />

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-3">
        <p className="text-[16px] leading-relaxed text-gray-600">
          Choose how long you want to pause instalments for{" "}
          <span className="font-medium text-gray-900">{sip.fundName}</span>.
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
                className={`h-12 whitespace-nowrap rounded-full border text-[19px] transition-colors ${
                  selected
                    ? "border-button bg-button font-bold text-white"
                    : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                {m} {m === 1 ? "month" : "months"}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-gray-200 px-4" aria-live="polite">
          <InfoRow Icon={CalendarX2}>
            No instalments on <b className="font-semibold text-gray-900">{skipped.map(formatDayMonth).join(", ")}</b>
          </InfoRow>
          <InfoRow Icon={CirclePlay}>
            Restarts on <b className="font-semibold text-gray-900">{formatFullDate(restart)}</b> at{" "}
            {formatRupees(sip.monthlyAmount)}
          </InfoRow>
          <InfoRow Icon={Bell} last>
            We&apos;ll remind you 3 days before, with all options again
          </InfoRow>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#B3F0DF] bg-accent-tint px-4 py-3.5">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden />
          <p className="text-[15px] leading-snug text-gray-700">
            Your <b className="font-semibold text-gray-900">{formatRupees(invested(sip))}</b> already invested stays
            invested during the pause.
          </p>
        </div>

        <div className="flex-1" />

        <div className="mt-6">
          <PrimaryButton onClick={() => dispatch({ type: "confirm", option: "pause" })}>Confirm pause</PrimaryButton>
        </div>
        <Disclaimer className="mt-3" />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}
