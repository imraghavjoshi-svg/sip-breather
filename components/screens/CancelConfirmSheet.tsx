"use client";

// Screen 7: Cancel confirm, over the dimmed options sheet (screen 3).
// Calm and plain: no guilt, no countdown, no red. Reason is optional.

import type { ReactNode } from "react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { formatFullDate, lastInstalment } from "@/lib/dates";
import { formatRupees, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import type { CancelReason } from "@/lib/types";
import { PrimaryButton, Sheet, TextButton } from "../phone/Sheet";

const REASONS: { id: CancelReason; label: string }[] = [
  { id: "money_tight", label: "Money is tight" },
  { id: "returns", label: "Returns" },
  { id: "need_money", label: "Need the money" },
  { id: "other", label: "Other" },
];

export default function CancelConfirmSheet() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const sip = getSip(state.sipId);
  const view = sipView(sip, state.decision, today);
  const chosen = state.draft.cancelReason;

  return (
    <Sheet label="Cancel SIP" onDismiss={() => dispatch({ type: "back" })} stacked>
      <p className="text-[15px] text-gray-500">You are cancelling</p>
      <h2 className="mt-0.5 text-[26px] font-bold tracking-tight text-gray-900">
        {formatRupees(view.monthlyAmount)} monthly SIP
      </h2>
      <p className="mt-2 text-[15px] leading-snug text-gray-600">
        Your invested money stays invested. Only future instalments stop.
      </p>

      <dl className="mt-4 rounded-2xl border border-gray-200 px-4">
        <Row label="Invested money" value={<span className="font-semibold text-gray-900">Stays invested</span>} />
        <Row label="Last instalment" value={formatFullDate(lastInstalment(sip.instalmentDay, today))} />
        <Row
          label="Restart"
          value={<span className="font-semibold text-accent-text">Start a new SIP anytime</span>}
          last
        />
      </dl>

      <fieldset className="mt-5">
        <legend className="text-[13px] font-semibold uppercase tracking-wide text-gray-500">
          Why are you cancelling? (optional)
        </legend>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {REASONS.map((r) => {
            const selected = chosen === r.id;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={selected}
                onClick={() => dispatch({ type: "toggleCancelReason", reason: r.id })}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-[15px] transition-colors ${
                  selected
                    ? "border-accent bg-accent-tint font-semibold text-accent-text"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 flex flex-col gap-1">
        <PrimaryButton onClick={() => dispatch({ type: "confirm", option: "cancel" })}>Cancel SIP</PrimaryButton>
        <TextButton onClick={() => dispatch({ type: "back" })}>Go back</TextButton>
      </div>
    </Sheet>
  );
}

function Row({ label, value, last = false }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3.5 ${last ? "" : "border-b border-gray-100"}`}>
      <dt className="whitespace-nowrap text-[15px] text-gray-600">{label}</dt>
      <dd className="whitespace-nowrap text-right text-[15px] text-gray-900">{value}</dd>
    </div>
  );
}
