"use client";

// Dashboard tab: copy of Groww's MF Dashboard (groww_dashboard.png).
// Returns are allowed here because this is Groww's existing screen.
// Sample funds only; no "Best Pick" / "Average" tags.

import { ChartNoAxesColumnIncreasing, ChevronDown, ChevronsLeftRight, Download, Eye, ListFilter } from "lucide-react";
import { SIPS } from "@/data/sips";
import { getHolding, HOLDINGS, PORTFOLIO_XIRR } from "@/data/holdings";
import { useDemo } from "@/lib/demoState";
import { formatRupees, invested } from "@/lib/sip";
import { DiamondIcon, Disclaimer } from "../phone/parts";

const TEXT = "text-[#44475B]";
const MUTED = "text-[#7C7E8C]";

function pct(part: number, whole: number): string {
  return `${((part / whole) * 100).toFixed(1)}%`;
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
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-gray-200">
        <div className="flex items-start justify-between px-5 pt-4">
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-[0.16em] ${MUTED}`}>
              Holdings ({HOLDINGS.length})
            </p>
            <p className={`mt-1 text-[24px] font-medium tracking-tight ${TEXT}`}>{formatRupees(currentValue)}</p>
          </div>
          <div className={`mt-1 flex gap-2.5 ${TEXT}`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200" aria-hidden>
              <Eye size={18} />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200" aria-hidden>
              <ChartNoAxesColumnIncreasing size={18} />
            </span>
          </div>
        </div>

        <div className="mx-5 mt-4 border-t border-dashed border-gray-300" />

        <dl className="px-5 py-2">
          <StatRow label="1D returns" value={`${signed(oneDay)} (${pct(oneDay, currentValue - oneDay)})`} positive />
          <StatRow label="Total returns" value={`${signed(totalReturns)} (${pct(totalReturns, totalInvested)})`} positive />
          <StatRow label="Invested" value={formatRupees(totalInvested)} />
          <StatRow
            label={
              <span className="flex items-center gap-1.5">
                XIRR <ChevronDown size={17} />
              </span>
            }
            value={PORTFOLIO_XIRR}
          />
        </dl>

        <div className={`grid grid-cols-2 border-t border-gray-200 ${TEXT}`}>
          <button
            type="button"
            onClick={() => dispatch({ type: "startRedeem" })}
            className="flex h-[52px] items-center justify-center gap-2.5 border-r border-gray-200 text-[15px] font-medium hover:bg-gray-50"
          >
            <span className="text-groww-blue">
              <DiamondIcon symbol="up" size={20} />
            </span>
            Redeem
          </button>
          <button
            type="button"
            className="flex h-[52px] items-center justify-center gap-2.5 text-[15px] font-medium hover:bg-gray-50"
          >
            <span className="text-groww-blue">
              <DiamondIcon symbol="plus" size={20} />
            </span>
            Invest more
          </button>
        </div>
      </div>

      {/* Filter + sort toggle */}
      <div className="mt-6 flex items-center justify-between px-4">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 ${TEXT}`}
          aria-hidden
        >
          <ListFilter size={18} />
        </span>
        <span className={`flex items-center gap-1.5 text-[14px] font-medium ${TEXT}`}>
          <ChevronsLeftRight size={15} aria-hidden />
          <span className="border-b border-dashed border-[#44475B]">Returns (%)</span>
        </span>
      </div>

      {/* Fund rows: tap opens that SIP's details */}
      <ul className="mt-3 border-t border-gray-100">
        {SIPS.map((sip) => {
          const h = getHolding(sip.id);
          const gain = h.currentValue - invested(sip);
          return (
            <li key={sip.id}>
              <button
                type="button"
                onClick={() => dispatch({ type: "openSip", sipId: sip.id })}
                className="flex w-full items-start justify-between gap-4 border-b border-gray-200 px-4 py-4 text-left hover:bg-gray-50"
              >
                <span className="min-w-0">
                  <span className={`block text-[16px] leading-snug ${TEXT}`}>{sip.fundName}</span>
                  <span className={`mt-1 block text-[13px] ${MUTED}`}>SIP</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`block text-[16px] font-medium ${TEXT}`}>{signed(gain)}</span>
                  <span className="mt-0.5 block text-[14px] text-accent-text">
                    ({gain >= 0 ? "+" : ""}
                    {pct(gain, invested(sip))})
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex justify-center">
        <span
          className={`flex items-center gap-2.5 rounded-lg border border-gray-200 px-5 py-2.5 text-[15px] font-medium ${TEXT}`}
        >
          <Download size={18} aria-hidden /> Import external funds.
        </span>
      </div>

      <Disclaimer className="mt-8" />
    </div>
  );
}

function StatRow({ label, value, positive = false }: { label: React.ReactNode; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className={`text-[15px] ${MUTED}`}>{label}</dt>
      <dd className={`text-[15px] font-medium ${positive ? "text-accent-text" : TEXT}`}>{value}</dd>
    </div>
  );
}
