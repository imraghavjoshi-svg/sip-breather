"use client";

// Redeem step b: copy of Groww's redeem summary (groww_redeem_summary).
// Left out on purpose: "Prime recommends", "Why these funds?" ratings, and the
// bank row (no bank names or account numbers anywhere).

import { ChevronsLeftRight } from "lucide-react";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { formatDayMonth, redemptionByDate } from "@/lib/dates";
import { formatRupees2, splitRedemption } from "@/lib/redeem";
import { useToday } from "@/lib/today";
import { Disclaimer, ScreenHeader } from "../phone/parts";
import { PrimaryButton } from "../phone/Sheet";

const TEXT = "text-[#44475B]";
const MUTED = "text-[#7C7E8C]";
const LOGO_COLORS: Record<string, string> = { sip_flexi: "#1E6FB8", sip_mid: "#D93A3A" };

/** "₹1,000" for whole rupees, "₹250.50" otherwise (Groww's title style). */
export function redeemTitleAmount(amount: number): string {
  return Number.isInteger(amount) ? `₹${amount.toLocaleString("en-IN")}` : formatRupees2(amount);
}

export default function RedeemSummaryScreen() {
  const { state, dispatch } = useDemo();
  const device = useDevice();
  const now = useToday();
  const amount = Number(state.redeemInput);
  const parts = splitRedemption(amount);

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader onBack={() => dispatch({ type: "back" })} />

      <div className="flex-1 overflow-y-auto">
        <h1 className={`mt-6 px-6 text-center text-[22px] font-medium ${TEXT}`}>
          Redeem {redeemTitleAmount(amount)} from {parts.length} fund{parts.length > 1 ? "s" : ""}
        </h1>

        <div className="mx-4 mt-8 rounded-2xl border border-gray-200 px-5 pb-5 pt-5">
          <div className="flex items-center justify-between">
            <span className={`text-[12px] font-medium uppercase tracking-[0.16em] ${TEXT}`}>Fund</span>
            <span className={`flex items-center gap-1.5 text-[14px] font-medium ${TEXT}`}>
              <ChevronsLeftRight size={14} aria-hidden />
              <span className="border-b border-dotted border-[#44475B]">Amount</span>
            </span>
          </div>
          <p className={`mt-6 text-[12px] font-medium uppercase tracking-[0.12em] ${MUTED}`}>
            Redemption by {formatDayMonth(redemptionByDate(now))}
          </p>
          <ul className="mt-3 flex flex-col gap-4">
            {parts.map((p) => (
              <li key={p.sipId} className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white"
                  style={{ background: LOGO_COLORS[p.sipId] }}
                  aria-hidden
                >
                  S
                </span>
                <span className={`min-w-0 flex-1 text-[14px] leading-snug ${TEXT}`}>{p.fundName}</span>
                <span className={`shrink-0 text-[14px] ${MUTED}`}>{formatRupees2(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Groww's wavy divider */}
        <svg viewBox="0 0 400 12" className="mt-10 h-3 w-full" preserveAspectRatio="none" aria-hidden>
          <path
            d={`M0 6 ${Array.from({ length: 40 }, (_, i) => `Q ${i * 10 + 5} ${i % 2 ? 11 : 1} ${i * 10 + 10} 6`).join(" ")}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={1.2}
          />
        </svg>
      </div>

      <div className="border-t border-gray-100 px-4 pt-3">
        <PrimaryButton tone="blue" onClick={() => dispatch({ type: "go", screen: "redeemSheet" })}>
          Confirm
        </PrimaryButton>
        <Disclaimer className="mt-2" />
        <div style={{ height: device.safeBottom + 6 }} aria-hidden />
      </div>
    </div>
  );
}
