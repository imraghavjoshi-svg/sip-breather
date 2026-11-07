"use client";

// "You are redeeming ₹X": copy of classic Groww's sheet (classic_redeem_sheet).
// NEW (ours, green "New" tag): a calm "YOUR SIP" card above the button. It
// mentions the SIP of this fund, offers to skip just the next instalment and
// to ask GR-1. Skipping shows a small confirm, then returns here with
// "Next instalment skipped". Nothing blocks the redemption.

import { Check, Info } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { applicableNavDate, formatDayMonth, formatDayMonth2 } from "@/lib/dates";
import { BANK_LABEL, formatRupees2, formatSignedRupees2, shortTermGain } from "@/lib/redeem";
import { formatRupees, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Gr1Swirl, NewTag } from "../phone/parts";
import { PrimaryButton, Sheet } from "../phone/Sheet";

export default function RedeemSheet() {
  const { state, dispatch } = useDemo();
  const now = useToday();
  const sip = getSip(state.sipId);
  const amount = Number(state.redeemInput);
  const stcg = shortTermGain(sip.id, amount);
  const view = sipView(sip, state.decision, now);

  return (
    <Sheet label="You are redeeming" onDismiss={() => dispatch({ type: "back" })}>
      <p className="text-[15px] text-ink-2">You are redeeming</p>
      <p className="mt-1 text-[28px] font-medium text-ink">{formatRupees2(amount)}</p>

      <dl className="mt-4 rounded-xl border border-line px-[15px] py-1">
        <Row label="Redeem bank" value={BANK_LABEL} />
        <Row label="Applicable NAV date" value={formatDayMonth2(applicableNavDate(now))} info />
        <Row label="Exit load (Approx)" value={formatRupees2(0)} />
      </dl>

      <div className="mt-3 rounded-xl border border-line">
        <p className="flex items-center gap-1.5 px-[15px] pb-3 pt-3.5 text-[15px] font-medium text-ink">
          Capital gains <Info size={15} className="text-ink-2" aria-hidden />
        </p>
        <div className="border-t border-dashed border-line" />
        <dl className="px-[15px] py-1">
          <Row label="LTCG" value={formatRupees2(0)} />
          <Row label="STCG" value={formatSignedRupees2(stcg)} loss={stcg < 0} />
        </dl>
      </div>

      {view.status === "active" || view.status === "skipping" ? <YourSipCard /> : null}

      <div className="mt-4">
        <PrimaryButton onClick={() => dispatch({ type: "confirmRedeem" })}>Continue to redeem</PrimaryButton>
      </div>
    </Sheet>
  );
}

/** NEW: the SIP of this fund, in plain words. Calm, never blocking. */
function YourSipCard() {
  const { state, dispatch } = useDemo();
  const now = useToday();
  const view = sipView(getSip(state.sipId), state.decision, now);
  const skipped = view.status === "skipping";

  return (
    <section className="mt-4 rounded-xl border border-[#CDEFE0] bg-[#F6FCF9] px-[15px] pb-3 pt-3.5" aria-labelledby="your-sip">
      <p className="flex items-center gap-2">
        <span id="your-sip" className="text-[12px] font-bold uppercase tracking-wider text-ink-2">
          Your SIP
        </span>
        <NewTag />
      </p>

      {skipped ? (
        <>
          <p className="mt-1.5 flex items-center gap-1.5 text-[15px] font-medium text-ink">
            Next instalment skipped <Check size={17} strokeWidth={2.6} className="text-accent-text" aria-label="done" />
          </p>
          <p className="mt-1 text-[14px] leading-snug text-ink-2">
            Your SIP continues on {formatDayMonth(view.nextDate!)}. Your invested money stays as it is.
          </p>
        </>
      ) : (
        <p className="mt-1.5 text-[14px] leading-snug text-ink-2">
          <b className="font-medium text-ink">
            {formatRupees(view.monthlyAmount)} due on {formatDayMonth(view.nextDate!)}.
          </b>{" "}
          If money&apos;s tight this month, you can skip just that instalment. Your SIP and your invested money stay as
          they are.
        </p>
      )}

      <div className="mt-2.5 flex items-center gap-2">
        {!skipped && (
          <button
            type="button"
            onClick={() => dispatch({ type: "go", screen: "skipConfirm" })}
            className="h-9 rounded-lg px-1 text-[15px] font-medium text-accent-text hover:underline"
          >
            Skip {formatDayMonth(view.nextDate!)} instalment
          </button>
        )}
        <button
          type="button"
          onClick={() => dispatch({ type: "openGr1", from: "redeem" })}
          className="ml-auto flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[14px] font-medium text-ink hover:bg-[#fafafa]"
        >
          <Gr1Swirl size={16} /> Ask GR-1
        </button>
      </div>
    </section>
  );
}

function Row({ label, value, info = false, loss = false }: { label: string; value: string; info?: boolean; loss?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="flex items-center gap-1.5 text-[15px] text-ink">
        {label}
        {info && <Info size={15} className="text-ink-2" aria-hidden />}
      </dt>
      <dd className={`text-[15px] ${loss ? "text-loss" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
