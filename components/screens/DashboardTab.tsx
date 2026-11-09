"use client";

// Dashboard tab: copy of classic Groww's MF Dashboard (classic_dashboard).
// Returns are allowed here because this is Groww's existing screen.
// Tapping a fund opens the fund sheet (Redeem / Investment details).
// Eye icon hides ₹ amounts, "<> XIRR" switches rows to returns in ₹, chart icon shows a toast.

import { useEffect, useState } from "react";
import { ChartNoAxesColumnIncreasing, ChevronDown, ChevronsLeftRight, Download, Eye, EyeOff, ListFilter } from "lucide-react";
import { SIPS } from "@/data/sips";
import { FUND_XIRR, getHolding, HOLDINGS, PORTFOLIO_XIRR } from "@/data/holdings";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { formatRupees, invested } from "@/lib/sip";
import { Disclaimer, SipFundSquare } from "../phone/parts";

/** Shown in place of a ₹ amount while the eye icon hides amounts. */
const HIDDEN_AMOUNT = "₹••••";
const ANALYTICS_TOAST = "Analytics isn't part of this prototype";
const TOAST_MS = 2000;

function pct(part: number, whole: number): string {
  return `${((part / whole) * 100).toFixed(2)}%`;
}

function signed(amount: number): string {
  return `${amount >= 0 ? "+" : "-"}${formatRupees(Math.abs(amount))}`;
}

export default function DashboardTab() {
  const { state, dispatch } = useDemo();
  const device = useDevice();
  const { amountsHidden, showReturns } = state.dashboard;
  const [toast, setToast] = useState<string | null>(null);

  // The toast hides itself after 2 seconds; the timer is cleared if the screen closes.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  const money = (text: string) => (amountsHidden ? HIDDEN_AMOUNT : text);

  const totalInvested = SIPS.reduce((s, sip) => s + invested(sip), 0);
  const currentValue = HOLDINGS.reduce((s, h) => s + h.currentValue, 0);
  const totalReturns = currentValue - totalInvested;
  const oneDay = HOLDINGS.reduce((s, h) => s + h.oneDayChange, 0);

  const iconButton =
    "flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line hover:bg-line-soft";

  return (
    <div className="pb-6">
      {/* Holdings card */}
      <div className="mx-4 mt-4 rounded-2xl border border-line px-[15px] pb-1.5 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-2">Holdings ({HOLDINGS.length})</p>
            <p className="mt-1 text-[22px] font-medium text-ink">{money(formatRupees(currentValue))}</p>
          </div>
          <div className="mt-2 flex gap-2.5 text-ink">
            <button
              type="button"
              onClick={() => dispatch({ type: "toggleAmounts" })}
              aria-label={amountsHidden ? "Show amounts" : "Hide amounts"}
              aria-pressed={amountsHidden}
              className={iconButton}
            >
              {amountsHidden ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => setToast(ANALYTICS_TOAST)}
              aria-label="Analytics"
              className={iconButton}
            >
              <ChartNoAxesColumnIncreasing size={15} aria-hidden />
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-dashed border-line" />

        <dl className="py-1">
          <StatRow
            label="1D returns"
            value={`${money(signed(oneDay))} (${pct(oneDay, currentValue - oneDay)})`}
            tone="gain"
          />
          <StatRow
            label="Total returns"
            value={`${money(signed(totalReturns))} (${pct(totalReturns, totalInvested)})`}
            tone="gain"
          />
          <StatRow label="Invested" value={money(formatRupees(totalInvested))} />
          <StatRow
            label={
              <span className="flex items-center gap-2">
                XIRR <ChevronDown size={16} />
              </span>
            }
            value={PORTFOLIO_XIRR}
          />
        </dl>
      </div>

      {/* Filter + XIRR / Returns toggle */}
      <div className="mt-5 flex items-center justify-between px-4 text-ink">
        <ListFilter size={18} aria-hidden />
        <button
          type="button"
          onClick={() => dispatch({ type: "toggleReturnsView" })}
          aria-label={showReturns ? "Showing returns. Switch to XIRR" : "Showing XIRR. Switch to returns"}
          className="flex items-center gap-1 text-[13px] font-medium"
        >
          <ChevronsLeftRight size={14} aria-hidden />
          <span className="border-b border-dashed border-ink-3">{showReturns ? "Returns" : "XIRR"}</span>
        </button>
      </div>

      {/* Fund rows: tap opens the fund sheet */}
      <ul className="mt-3">
        {SIPS.map((sip) => {
          const fundReturns = getHolding(sip.id).currentValue - invested(sip);
          return (
            <li key={sip.id}>
              <button
                type="button"
                onClick={() => dispatch({ type: "openFund", sipId: sip.id })}
                className="flex w-full items-start justify-between gap-4 border-b border-line-soft px-4 py-4 text-left hover:bg-[#fafafa]"
              >
                <span className="flex min-w-0 items-start gap-3.5">
                  <SipFundSquare sip={sip} size={30} />
                  <span className="min-w-0">
                    <span className="block text-[15px] leading-snug text-ink">{sip.fundName}</span>
                    <span className="mt-2.5 block text-[12px] text-ink-2">SIP</span>
                  </span>
                </span>
                {showReturns ? (
                  <span className={`shrink-0 pt-2 text-[15px] ${fundReturns >= 0 ? "text-gain" : "text-loss"}`}>
                    {money(signed(fundReturns))}
                  </span>
                ) : (
                  <span className="shrink-0 pt-2 text-[15px] text-ink">{FUND_XIRR[sip.id]}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex justify-center">
        <span className="flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-[15px] font-medium text-ink">
          <Download size={17} aria-hidden /> Import external funds.
        </span>
      </div>

      <Disclaimer className="mt-8" />

      {/* Toast: pinned to the bottom of the phone screen, just above the bottom nav. */}
      <div
        className="pointer-events-none absolute inset-x-0 z-[6] flex justify-center px-4"
        style={{ bottom: device.safeBottom + 76 }}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <span className="rounded-lg bg-ink px-4 py-2.5 text-[13px] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            {toast}
          </span>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, tone }: { label: React.ReactNode; value: string; tone?: "gain" | "loss" }) {
  const colour = tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-ink";
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-[14px] text-ink-2">{label}</dt>
      <dd className={`text-[14px] ${colour}`}>{value}</dd>
    </div>
  );
}
