"use client";

// Watchlist tab: copy of groww_watchlist.png. PM decision (7 Nov): keep the
// empty state and the fund list, but no return numbers on this tab, and the
// list is headed "Explore funds" instead of "High returns". Sample names only.

import { Binoculars, Bookmark } from "lucide-react";
import { Disclaimer } from "../phone/parts";

const TEXT = "text-[#44475B]";
const MUTED = "text-[#7C7E8C]";

const FUNDS = [
  "Sample Silver FoF -Growth",
  "Sample Silver ETF FoF -Growth",
  "Sample Gold ETF FoF -Growth",
  "Sample Gold Savings FoF -Growth",
  "Sample Global Equity Overseas FoF -Growth",
];

export default function WatchlistTab() {
  return (
    <div className="pb-6">
      <div className="flex flex-col items-center px-6 pb-4 pt-14">
        <span className="relative flex h-20 w-44 items-center justify-center" aria-hidden>
          <span className="absolute bottom-3 h-px w-48 bg-[#C9D3FF]" />
          <span className="relative flex h-16 w-28 items-center justify-center rounded-full bg-gradient-to-r from-[#E3E9FF] to-[#CCD7FF] text-groww-blue">
            <Binoculars size={36} strokeWidth={1.4} />
          </span>
        </span>
        <p className={`mt-6 text-[17px] ${MUTED}`}>Start adding funds to Watchlist</p>
      </div>

      <h2 className={`mx-4 mt-12 text-[16px] font-medium ${TEXT}`}>Explore funds</h2>
      <ul className="mt-3">
        {FUNDS.map((name) => (
          <li key={name} className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-6">
            <span className={`text-[15px] leading-snug ${TEXT}`}>{name}</span>
            <Bookmark size={19} className="shrink-0 text-groww-blue" aria-hidden />
          </li>
        ))}
      </ul>

      <Disclaimer className="mt-8" />
    </div>
  );
}
