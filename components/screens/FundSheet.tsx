"use client";

// Fund sheet: copy of classic Groww's sheet when a fund is tapped on the
// Dashboard (classic_fund_sheet). Only "Redeem" works in this demo.

import { ArrowUpRight, ChevronRight, List } from "lucide-react";
import type { ReactNode } from "react";
import { getSip } from "@/data/sips";
import { getHolding } from "@/data/holdings";
import { useDemo } from "@/lib/demoState";
import { formatRupees } from "@/lib/sip";
import { Sheet } from "../phone/Sheet";

export default function FundSheet() {
  const { state, dispatch } = useDemo();
  const sip = getSip(state.sipId);
  const value = getHolding(sip.id).currentValue;

  return (
    <Sheet label={sip.fundName} onDismiss={() => dispatch({ type: "back" })}>
      <div className="flex items-start justify-between gap-4 pb-4">
        <div className="min-w-0">
          <p className="text-[15px] font-medium leading-snug text-ink">{sip.fundName}</p>
          <p className="mt-2.5 text-[12px] text-ink-2">SIP</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-1">
          <ChevronRight size={17} className="text-ink-2" aria-hidden />
          <span className="text-[16px] font-medium text-ink">{formatRupees(value)}</span>
        </div>
      </div>

      <div className="-mx-4 border-t border-line" />

      <Row
        onClick={() => dispatch({ type: "startRedeem" })}
        icon={
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-ink-2 text-white">
            <ArrowUpRight size={13} strokeWidth={2.4} />
          </span>
        }
      >
        Redeem
      </Row>
      <Row icon={<List size={18} className="text-ink-2" />}>
        Investment details
      </Row>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {/* Shown as in Groww; these two do nothing in this demo. */}
        <button
          type="button"
          className="flex h-[44px] items-center justify-center rounded-lg bg-accent-tint text-[19px] font-bold text-accent-text"
        >
          One Time
        </button>
        <button type="button" className="flex h-[44px] items-center justify-center rounded-lg bg-button text-[19px] font-bold text-white">
          Start SIP
        </button>
      </div>
    </Sheet>
  );
}

function Row({
  icon,
  children,
  onClick,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-[18px] text-left hover:bg-[#fafafa]">
      <span className="flex w-[18px] justify-center" aria-hidden>
        {icon}
      </span>
      <span className="flex h-[50px] flex-1 items-center border-b border-line text-[15px] text-ink">
        {children}
      </span>
    </button>
  );
}
