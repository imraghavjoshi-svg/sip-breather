"use client";

// SIP details: copy of classic Groww's screen (classic_sip_details).
// Working: "Cancel SIP" (top right, opens the reasons screen), "Change amount/date" (our lower-amount
// screen), "Skip" on the Upcoming row (small confirm, then "Skipped" on that
// row), "Details" (opens and closes), and "Need help" (NEW: opens GR-1).
// "Add step-up" and the fund name link are shown for realism only.
// No returns, NAV or units on this screen.

import { useState } from "react";
import { CalendarDays, ChartBar, ChartNoAxesColumn, ChevronDown, ChevronRight, CircleHelp, Pencil } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { formatDayMonth, formatDayMonthYear, nextInstalment, ordinal, pastInstalments } from "@/lib/dates";
import { formatRupees, goalProgress, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Disclaimer, DottedLink, NewTag, ScreenHeader } from "../phone/parts";

export default function SipDetails() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const device = useDevice();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const sip = getSip(state.sipId);
  const view = sipView(sip, state.decision, today);
  const cancelled = view.status === "cancelled";
  const progress = goalProgress(sip);
  const nextNumber = ordinal(sip.instalmentsDone + 1);
  const firstInstalment = pastInstalments(sip.instalmentDay, sip.instalmentsDone, today).at(-1)!;

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader
        title="SIP details"
        large
        onBack={() => dispatch({ type: "back" })}
        right={
          !cancelled && (
            <DottedLink onClick={() => dispatch({ type: "go", screen: "cancelReasons" })}>Cancel SIP</DottedLink>
          )
        }
      />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Amount, schedule, fund */}
        <div className="px-4 pt-4">
          <p className="text-[26px] font-medium leading-tight text-ink">{formatRupees(view.monthlyAmount)}</p>
          <p className="mt-1 text-[13px] font-medium text-ink">
            {cancelled ? "Cancelled" : `Monthly SIP on ${ordinal(sip.instalmentDay)}`}
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-[15px] text-ink-2">
            <span className="truncate">{sip.fundName}</span>
            <ChevronRight size={16} className="shrink-0" aria-hidden />
          </p>

          {!cancelled && (
            <div className="mt-[18px] flex gap-3">
              {/* Shown as in Groww; does nothing in this demo. */}
              <button
                type="button"
                className="flex h-[38px] items-center gap-2 rounded-lg bg-accent-tint px-3.5 text-[15px] font-medium text-accent-text"
              >
                <ChartNoAxesColumn size={17} strokeWidth={2.4} aria-hidden /> Add step-up
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "go", screen: "lower" })}
                className="flex h-[38px] items-center gap-2 rounded-lg border border-line px-3.5 text-[15px] font-medium text-ink hover:bg-[#fafafa]"
              >
                <Pencil size={16} aria-hidden /> Change amount/date
              </button>
            </div>
          )}
        </div>

        {/* Upcoming */}
        <section className="mt-6 border-t border-line px-4 pb-4 pt-6" aria-labelledby="upcoming">
          <h2 id="upcoming" className="text-[18px] font-medium text-ink">
            Upcoming
          </h2>
          {cancelled ? (
            <p className="mt-3 text-[14px] leading-snug text-ink-2">
              No upcoming instalments. Your invested money stays invested until you redeem it.
            </p>
          ) : view.status === "skipping" ? (
            <>
              <UpcomingRow
                label="Next instalment"
                date={nextInstalment(sip.instalmentDay, today)}
                right={<span className="rounded bg-line-soft px-2 py-0.5 text-[13px] font-medium text-ink-2">Skipped</span>}
              />
              <UpcomingRow label={`${nextNumber} instalment`} date={view.nextDate!} />
            </>
          ) : view.status === "paused" ? (
            <UpcomingRow
              label={`${nextNumber} instalment`}
              date={view.nextDate!}
              right={<span className="text-[13px] text-ink-2">{view.statusLabel}</span>}
            />
          ) : (
            <UpcomingRow
              label={`${nextNumber} instalment`}
              date={view.nextDate!}
              right={<DottedLink onClick={() => dispatch({ type: "go", screen: "skipConfirm" })}>Skip</DottedLink>}
            />
          )}
          {!cancelled && (
            <button
              type="button"
              onClick={() => dispatch({ type: "openCompare" })}
              className="mt-4 flex w-full items-center gap-3 rounded-lg border border-line px-3.5 py-3 text-left hover:bg-[#fafafa]"
            >
              <ChartBar size={18} className="shrink-0 text-ink" aria-hidden />
              <span className="flex-1 text-[15px] text-ink">Compare options</span>
              <NewTag />
              <ChevronRight size={17} className="shrink-0 text-ink-2" aria-hidden />
            </button>
          )}
        </section>

        {/* Details (opens and closes) */}
        <section className="border-t border-line">
          <button
            type="button"
            onClick={() => setDetailsOpen((o) => !o)}
            aria-expanded={detailsOpen}
            className="flex w-full items-center justify-between px-4 py-5 text-left"
          >
            <span className="text-[18px] font-medium text-ink">Details</span>
            <ChevronDown size={20} className={`text-ink transition-transform ${detailsOpen ? "rotate-180" : ""}`} aria-hidden />
          </button>
          {detailsOpen && (
            <dl className="px-4 pb-4">
              <DetailRow label="Start date" value={formatDayMonthYear(firstInstalment)} />
              <DetailRow label="Instalments done" value={String(sip.instalmentsDone)} />
              <DetailRow label="Invested" value={formatRupees(view.invested)} />
              {progress !== null && (
                <DetailRow
                  label={`Goal: ${sip.goalName}`}
                  value={`${formatRupees(view.invested)} of ${formatRupees(sip.goalTarget!)} (${Math.round(progress * 100)}%)`}
                />
              )}
            </dl>
          )}
        </section>

        {/* Need help → GR-1 (NEW) */}
        <div className="border-t border-line px-4 pt-4">
          <button
            type="button"
            onClick={() => dispatch({ type: "openGr1", from: "other" })}
            className="flex h-[32px] items-center gap-1.5 rounded-lg border border-line px-2.5 text-[13px] font-medium text-ink hover:bg-[#fafafa]"
          >
            <CircleHelp size={15} aria-hidden /> Need help
            <NewTag className="ml-1" />
          </button>
        </div>

        <div className="flex-1" />
        {view.status === "skipping" && (
          <p className="sr-only" role="status">
            {formatDayMonth(nextInstalment(sip.instalmentDay, today))} instalment skipped
          </p>
        )}
        <Disclaimer className="mt-6" />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}

function UpcomingRow({ label, date, right }: { label: string; date: Date; right?: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-center gap-4">
      <CalendarDays size={19} className="shrink-0 text-ink" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] text-ink">{label}</p>
        <p className="mt-0.5 text-[13px] text-ink-2">{formatDayMonthYear(date)}</p>
      </div>
      {right}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-[14px] text-ink-2">{label}</dt>
      <dd className="text-right text-[14px] text-ink">{value}</dd>
    </div>
  );
}
