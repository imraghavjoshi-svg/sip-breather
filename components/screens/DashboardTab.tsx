"use client";

// Dashboard tab: copy of classic Groww's MF Dashboard (classic_dashboard).
// Returns are allowed here because this is Groww's existing screen.
// Tapping a fund opens the fund sheet (Redeem / Investment details).

import { ChartNoAxesColumnIncreasing, ChevronDown, ChevronsLeftRight, Download, Eye, ListFilter } from "lucide-react";
import { SIPS } from "@/data/sips";
import { FUND_XIRR, HOLDINGS, PORTFOLIO_XIRR } from "@/data/holdings";
import { useDemo } from "@/lib/demoState";
import { formatRupees, invested } from "@/lib/sip";
import { Disclaimer, SipFundSquare } from "../phone/parts";

function pct(part: number, whole: number): string {
  return `${((part / whole) * 100).toFixed(2)}%`;
}

function signed(amount: number): string {
  return `${amount >= 0 ? "+" : "-"}${formatRupees(Math.abs(amount))}`;
}

export default function DashboardTab() {
  const { dispatch } = useDemo();

  const totalInvested = SIPS.reduce((s, sip) => s + invested(sip), 0);
  const currentValue = HOLDINGS.reduce((s, h) => s + h.currentValue, 0);
  const totalReturns = currentValue - totalInvested;
  const oneDay = HOLDINGS.reduce((s, h) => s + h.oneDayChange, 0);

  return (
    <div className="pb-6">
      {/* Holdings card */}
      <div className="mx-4 mt-4 rounded-2xl border border-line px-[15px] pb-1.5 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-2">Holdings ({HOLDINGS.length})</p>
            <p className="mt-1 text-[22px] font-medium text-ink">{formatRupees(currentValue)}</p>
          </div>
          <div className="mt-2 flex gap-2.5 text-ink">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line" aria-hidden>
              <Eye size={16} />
            </span>
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-line" aria-hidden>
              <ChartNoAxesColumnIncreasing size={15} />
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-dashed border-line" />

        <dl className="py-1">
          <StatRow label="1D returns" value={`${signed(oneDay)} (${pct(oneDay, currentValue - oneDay)})`} tone="gain" />
          <StatRow label="Total returns" value={`${signed(totalReturns)} (${pct(totalReturns, totalInvested)})`} tone="gain" />
          <StatRow label="Invested" value={formatRupees(totalInvested)} />
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

      {/* Filter + XIRR toggle */}
      <div className="mt-5 flex items-center justify-between px-4 text-ink">
        <ListFilter size={18} aria-hidden />
        <span className="flex items-center gap-1 text-[13px] font-medium">
          <ChevronsLeftRight size={14} aria-hidden />
          <span className="border-b border-dashed border-ink-3">XIRR</span>
        </span>
      </div>

      {/* Fund rows: tap opens the fund sheet */}
      <ul className="mt-3">
        {SIPS.map((sip) => (
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
              <span className="shrink-0 pt-2 text-[15px] text-ink">{FUND_XIRR[sip.id]}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-center">
        <span className="flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-[15px] font-medium text-ink">
          <Download size={17} aria-hidden /> Import external funds.
        </span>
      </div>

      <Disclaimer className="mt-8" />
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
