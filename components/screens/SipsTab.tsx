"use client";

// SIPs tab content (inside the home screen): the two sample SIP cards.
// Our screen: green accents, no returns.

import { ChevronRight } from "lucide-react";
import { SIPS } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { formatDayMonth } from "@/lib/dates";
import { formatRupees, sipView, type SipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Disclaimer } from "../phone/parts";

export default function SipsTab() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const views = SIPS.map((s) => sipView(s, state.decision, today));
  const running = views.filter((v) => v.status !== "cancelled");
  const monthlyTotal = running.reduce((sum, v) => sum + v.monthlyAmount, 0);

  return (
    <div className="min-h-full bg-[#F7F8FA]">
      <div className="px-4 pb-6 pt-5">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-gray-500">
            Active SIPs ({running.length})
          </h2>
          <span className="text-[13px] font-medium text-gray-600">Monthly {formatRupees(monthlyTotal)}</span>
        </div>

        <ul className="flex flex-col gap-3">
          {views.map((v) => (
            <li key={v.sip.id}>
              <SipCard view={v} onOpen={() => dispatch({ type: "openSip", sipId: v.sip.id })} />
            </li>
          ))}
        </ul>

        <Disclaimer className="mt-8" />
      </div>
    </div>
  );
}

function SipCard({ view, onOpen }: { view: SipView; onOpen: () => void }) {
  const { sip, status } = view;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:bg-gray-50"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-semibold leading-snug text-gray-900">{sip.fundName}</p>

        <p className="mt-1.5 text-[15px] text-gray-700">
          {status === "cancelled" ? (
            <span className="text-gray-500">Cancelled · {formatRupees(view.invested)} stays invested</span>
          ) : (
            <>
              <span className="font-semibold text-gray-900">{formatRupees(view.monthlyAmount)}</span>
              <span className="text-gray-400"> · </span>monthly<span className="text-gray-400"> · </span>
              {status === "paused" ? (
                <span className="font-medium text-gray-600">{view.statusLabel}</span>
              ) : (
                <span className="font-medium text-accent-text">
                  Next on {formatDayMonth(view.nextDate!)}
                </span>
              )}
            </>
          )}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-gray-500">{sip.instalmentsDone} instalments done</span>
          {status === "skipping" && (
            <span className="whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-0.5 text-[12px] font-medium text-gray-600">
              {view.statusLabel}
            </span>
          )}
          {sip.goalName && (
            <span className="whitespace-nowrap rounded-full border border-gray-200 bg-[#F2F4F7] px-2.5 py-0.5 text-[12px] font-medium text-gray-600">
              Goal: {sip.goalName}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={22} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
    </button>
  );
}
