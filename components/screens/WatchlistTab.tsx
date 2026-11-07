"use client";

// Watchlist tab: copy of classic Groww's Watchlist (classic_watchlist): empty
// state, then a "TRENDING" list with bookmark icons. PM decision: no return
// numbers on this tab (so the "3Y Returns" column is left out). Sample names only.

import { Binoculars, Bookmark } from "lucide-react";
import { Disclaimer } from "../phone/parts";

const TRENDING = [
  "Sample Silver FoF Direct-Growth",
  "Sample Silver ETF FoF Direct-Growth",
  "Sample Defence Fund",
  "Sample Pharma And Healthcare Fund",
  "Sample Healthcare Opportunities Fund",
];

export default function WatchlistTab() {
  return (
    <div className="pb-6">
      <div className="flex flex-col items-center px-6 pt-[72px]">
        {/* Light-blue binoculars pill, drawn in the spirit of classic Groww's illustration. */}
        <span
          className="flex h-[34px] w-[134px] items-center justify-center rounded-full bg-gradient-to-r from-[#E4EEFF] to-[#B9D2FF] text-[#6E95E8]"
          aria-hidden
        >
          <Binoculars size={26} strokeWidth={1.5} />
        </span>
        <p className="mt-10 text-[16px] text-ink-2">Start adding funds to Watchlist</p>
      </div>

      <h2 className="mx-4 mt-[104px] text-[16px] font-medium uppercase tracking-wide text-ink">Trending</h2>
      <ul className="mt-3">
        {TRENDING.map((name) => (
          <li key={name} className="flex h-[72px] items-center justify-between gap-4 border-b border-line-soft px-4">
            <span className="text-[14px] text-ink">{name}</span>
            <Bookmark size={17} strokeWidth={2} className="shrink-0 text-gain" aria-hidden />
          </li>
        ))}
      </ul>

      <Disclaimer className="mt-8" />
    </div>
  );
}
