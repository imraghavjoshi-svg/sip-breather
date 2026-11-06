"use client";

// Screen 2: SIP details. No returns, NAV or performance numbers.

import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { useDevice } from "@/lib/device";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { formatDayMonth, formatFullDate, pastInstalments } from "@/lib/dates";
import { formatRupees, goalProgress, sipView, type SipStatus } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { ACCENT, Disclaimer, ScreenHeader } from "../phone/parts";

const STATUS_STYLE: Record<SipStatus, { dot: string; text: (label: string) => string }> = {
  active: { dot: ACCENT, text: () => "Active monthly SIP" },
  skipping: { dot: ACCENT, text: (l) => `Active · ${l}` },
  paused: { dot: "#F5A524", text: (l) => l },
  cancelled: { dot: "#9CA3AF", text: () => "Cancelled · future instalments stopped" },
};

export default function SipDetails() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const device = useDevice();
  const sip = getSip(state.sipId);
  const view = sipView(sip, state.decision, today);
  const progress = goalProgress(sip);
  const cancelled = view.status === "cancelled";
  const statusStyle = STATUS_STYLE[view.status];

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title={sip.fundName} onBack={() => dispatch({ type: "back" })} />

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-4">
        <p className="flex items-baseline gap-2">
          <span className="text-[40px] font-bold leading-none tracking-tight text-gray-900">
            {formatRupees(view.invested)}
          </span>
          <span className="text-[26px] font-semibold text-gray-500">invested</span>
        </p>
        <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-gray-600">
          <span className="h-2 w-2 rounded-full" style={{ background: statusStyle.dot }} aria-hidden />
          {statusStyle.text(view.statusLabel)}
        </p>

        <div className="mt-5 rounded-2xl border border-gray-200 px-5">
          <Row label="Monthly amount" value={formatRupees(view.monthlyAmount)} />
          <Row
            label="Next instalment"
            value={view.nextDate ? formatFullDate(view.nextDate) : "None"}
          />
          <Row label="Instalments done" value={String(sip.instalmentsDone)} last={progress === null} />
          {progress !== null && (
            <div className="py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] font-medium text-gray-800">Goal: {sip.goalName}</span>
                <span className="text-[13px] text-gray-500">
                  {formatRupees(view.invested)} of {formatRupees(sip.goalTarget!)} ({Math.round(progress * 100)}%)
                </span>
              </div>
              <div
                className="mt-2.5 h-2 overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-label={`Goal ${sip.goalName}`}
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(progress * 100, 3)}%`, background: ACCENT }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          {!cancelled && (
            <OutlineButton onClick={() => dispatch({ type: "go", screen: "lower" })}>Edit SIP</OutlineButton>
          )}
          <OutlineButton onClick={() => dispatch({ type: "openGr1" })}>
            Ask GR-1 <Sparkles size={16} color={ACCENT} aria-hidden />
          </OutlineButton>
        </div>

        {cancelled && (
          <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-[14px] text-gray-600">
            Your {formatRupees(view.invested)} stays invested. You can start a new SIP anytime.
          </p>
        )}
        {view.status === "skipping" && view.nextDate && (
          <p className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-[14px] text-gray-600">
            Next instalment skipped. Your SIP continues on {formatDayMonth(view.nextDate)}.
          </p>
        )}

        <InstalmentHistory
          dates={pastInstalments(sip.instalmentDay, Math.min(3, sip.instalmentsDone), today)}
          amount={sip.monthlyAmount}
        />

        <div className="flex-1" />

        {!cancelled && (
          <button
            type="button"
            onClick={() => dispatch({ type: "go", screen: "options" })}
            className="mx-auto mt-6 rounded-lg px-4 py-2 text-[15px] font-medium text-gray-500 hover:bg-gray-50"
          >
            Cancel SIP
          </button>
        )}
        <Disclaimer className="mt-3" />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}

/**
 * Last few instalments already taken. Past instalments were taken at the
 * original amount, so this uses the SIP's seed amount even after "lower".
 * Dates, amount and a status tag only: no returns, NAV or units.
 */
function InstalmentHistory({ dates, amount }: { dates: Date[]; amount: number }) {
  if (dates.length === 0) return null;
  return (
    <section className="mt-7" aria-labelledby="instalment-history">
      <h2 id="instalment-history" className="text-[13px] font-semibold uppercase tracking-wide text-gray-500">
        Instalment history
      </h2>
      <ul className="mt-2">
        {dates.map((d, i) => (
          <li
            key={d.toISOString()}
            className={`flex items-center justify-between py-3 ${i < dates.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            <span className="text-[15px] text-gray-800">{formatFullDate(d)}</span>
            <span className="flex items-center gap-3">
              <span className="text-[15px] font-semibold text-gray-900">{formatRupees(amount)}</span>
              <span className="whitespace-nowrap rounded-md bg-accent-tint px-2 py-0.5 text-[12px] font-semibold text-accent-text">
                Successful
              </span>
            </span>
          </li>
        ))}
      </ul>
      {/* Shown for realism; does nothing in this demo. */}
      <button type="button" className="mt-1 text-[14px] font-semibold text-accent-text hover:underline">
        View all
      </button>
    </section>
  );
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-4 ${last ? "" : "border-b border-gray-100"}`}>
      <span className="text-[16px] text-gray-500">{label}</span>
      <span className="text-[16px] font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function OutlineButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 text-[16px] font-semibold text-gray-900 hover:bg-gray-50"
    >
      {children}
    </button>
  );
}
