"use client";

// Redeem step c: copy of Groww's "You are redeeming ₹X" sheet
// (groww_redeem_sheet), without the bank row.
// Step d (NEW, ours, green): a calm "YOUR SIP" card above the button, with
// "See SIP options" opening our options sheet (or, when both funds are
// redeemed, a "Which SIP?" picker first). Nothing blocks the redemption.

import { Info } from "lucide-react";
import { useDemo } from "@/lib/demoState";
import { applicableNavDate, formatDayMonth, formatDayMonth2 } from "@/lib/dates";
import { formatRupees2, shortTermGain, sipsWithInstalmentDue, splitRedemption } from "@/lib/redeem";
import { formatRupees } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { PrimaryButton, Sheet } from "../phone/Sheet";

const TEXT = "text-[#44475B]";
const MUTED = "text-[#7C7E8C]";

export default function RedeemSheet() {
  const { state, dispatch } = useDemo();
  const now = useToday();
  const amount = Number(state.redeemInput);
  const parts = splitRedemption(amount);
  const navDate = formatDayMonth2(applicableNavDate(now));

  // SIPs of the redeemed fund(s) with an instalment still coming. One SIP:
  // "See SIP options" opens its options. Two: it first asks which SIP.
  const due = sipsWithInstalmentDue(parts, state.decision, now);
  const dueText = due
    .map((v) => `${formatRupees(v.monthlyAmount)} due on ${formatDayMonth(v.nextDate!)}`)
    .join(" and ");

  function seeOptions() {
    if (due.length > 1) dispatch({ type: "go", screen: "sipPicker" });
    else dispatch({ type: "openSipOptions", sipId: due[0].sip.id });
  }

  return (
    <Sheet label="You are redeeming" onDismiss={() => dispatch({ type: "back" })}>
      <p className={`text-[14px] ${MUTED}`}>You are redeeming</p>
      <p className={`mt-1 text-[28px] font-semibold tracking-tight ${TEXT}`}>{formatRupees2(amount)}</p>
      <p className={`mt-2 text-[14px] leading-snug ${MUTED}`}>
        The actual amount you get will be determined after the fund house declares the NAV of {navDate}.
      </p>

      <dl className="mt-4 rounded-2xl border border-gray-200 px-5 py-1.5">
        <Row label="Applicable NAV Date" value={navDate} />
        <Row label="Exit load (Approx)" value={formatRupees2(0)} />
      </dl>

      <div className="mt-3 rounded-2xl border border-gray-200 px-5 pb-2 pt-3.5">
        <p className={`flex items-center gap-1.5 text-[15px] font-semibold ${TEXT}`}>
          Capital gains <Info size={15} className={MUTED} aria-hidden />
        </p>
        <div className="mt-3 border-t border-dashed border-gray-300" />
        <dl>
          <Row label="LTCG" value={formatRupees2(0)} plain />
          <Row label="STCG" value={formatRupees2(shortTermGain(parts))} plain />
        </dl>
      </div>

      {due.length > 0 && (
        <section
          className="mt-4 rounded-2xl border border-[#B3F0DF] bg-accent-tint px-4 py-3.5"
          aria-labelledby="redeem-sip-card"
        >
          <p id="redeem-sip-card" className="text-[12px] font-bold uppercase tracking-wide text-accent-text">
            {due.length > 1 ? "Your SIPs" : "Your SIP"}
          </p>
          <p className="mt-1.5 text-[15px] leading-snug text-gray-700">
            <b className="font-semibold text-gray-900">{dueText}.</b> If money&apos;s tight this month, you can also
            skip or pause {due.length > 1 ? "either SIP" : "your SIP"}. Your invested money stays invested.
          </p>
          <button
            type="button"
            onClick={seeOptions}
            className="mt-2 text-[15px] font-semibold text-accent-text hover:underline"
          >
            See SIP options
          </button>
        </section>
      )}

      <div className="mt-4">
        <PrimaryButton tone="blue" onClick={() => dispatch({ type: "confirmRedeem" })}>
          Confirm Redeem
        </PrimaryButton>
      </div>
    </Sheet>
  );
}

function Row({ label, value, plain = false }: { label: string; value: string; plain?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className={`flex items-center gap-1.5 text-[15px] ${TEXT}`}>
        {label}
        {!plain && <Info size={15} className={MUTED} aria-hidden />}
      </dt>
      <dd className={`text-[15px] ${plain ? "" : "font-medium"} ${TEXT}`}>{value}</dd>
    </div>
  );
}
