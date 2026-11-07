"use client";

// Explore tab: copy of classic Groww's Explore page (classic_explore_1/2/3),
// one scrollable page in the same order. Groww's existing screen, so return
// numbers may stay. Sample fund names and plain "S" squares only.
// Removed on purpose: "Upgrade to Prime / Get fund recommendations",
// "Funds by Groww" and star ratings. Collection tiles renamed (PM, 7 Nov):
// "High return" → "All categories", "Best SIP funds" → "SIP funds",
// "5 Star Funds" → "Index funds". Nothing on this page does anything.

import type { ComponentType } from "react";
import {
  ArrowDownToLine,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  ChevronsLeftRight,
  Coins,
  LayoutGrid,
  ListFilter,
  Megaphone,
  Percent,
  Scale,
  ShoppingBasket,
  SlidersHorizontal,
  Store,
  TrendingUp,
  type LucideProps,
} from "lucide-react";
import { Disclaimer, FundSquare } from "../phone/parts";

const POPULAR = [
  { name: "Sample Silver ETF FoF Direct-Growth", ret: "+36.22%" },
  { name: "Sample Mid Cap Fund", ret: "+23.72%" },
  { name: "Sample Small Cap Fund", ret: "+22.90%" },
  { name: "Sample Flexi Cap Direct Plan-Growth", ret: "+17.31%" },
];

const COLLECTIONS: { label: string; Icon: ComponentType<LucideProps> }[] = [
  { label: "All categories", Icon: LayoutGrid },
  { label: "SIP funds", Icon: CalendarClock },
  { label: "Gold & Silver Funds", Icon: Coins },
  { label: "Index funds", Icon: TrendingUp },
  { label: "Mid Cap", Icon: Building2 },
  { label: "Small Cap", Icon: Store },
];

const TOOLS: { label: string; Icon: ComponentType<LucideProps>; badge?: number }[] = [
  { label: "Import funds", Icon: ArrowDownToLine },
  { label: "NFOs", Icon: Megaphone, badge: 2 },
  { label: "SIP calculator", Icon: Percent },
  { label: "Compare funds", Icon: Scale },
  { label: "Cart", Icon: ShoppingBasket, badge: 4 },
];

const CHIPS = ["Index only", "Flexi Cap", "Sectoral", "Large Cap"];

const ALL_FUNDS = [
  { name: "Sample Small Cap Fund", category: "Equity Small Cap", ret: "+22.90%" },
  { name: "Sample Flexi Cap Fund", category: "Equity Flexi Cap", ret: "+13.40%" },
  { name: "Sample Silver ETF FoF Direct-Growth", category: "Commodities Silver", ret: "+36.22%" },
  { name: "Sample Midcap Fund", category: "Equity Mid Cap", ret: "+18.74%" },
  { name: "Sample Flexi Cap Direct Plan-Growth", category: "Equity Flexi Cap", ret: "+17.31%" },
  { name: "Sample Defence Fund", category: "Equity Thematic", ret: "+35.52%" },
  { name: "Sample Mid Cap Fund", category: "Equity Mid Cap", ret: "+23.72%" },
];

function SectionTitle({ children, viewAll = false }: { children: string; viewAll?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4">
      <h2 className="text-[20px] font-medium text-ink">{children}</h2>
      {viewAll && (
        <span className="flex items-center gap-1 text-[15px] text-ink-2">
          View all <ChevronRight size={17} aria-hidden />
        </span>
      )}
    </div>
  );
}

/** Two-tone line drawing in classic Groww's teal, in place of its 3D illustrations. */
function Illustration({ Icon, size }: { Icon: ComponentType<LucideProps>; size: number }) {
  return (
    <span
      className="relative flex items-center justify-center rounded-2xl bg-[#DDF7EE]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Icon size={size * 0.56} strokeWidth={1.4} color="#1E5A52" />
    </span>
  );
}

export default function ExploreTab() {
  return (
    <div className="pb-6 pt-6">
      {/* Recently viewed */}
      <SectionTitle>Recently viewed</SectionTitle>
      <div className="mx-4 mt-3.5 flex h-[52px] w-fit min-w-[183px] items-center gap-2.5 rounded-xl border border-line px-3.5">
        <FundSquare index={1} size={22} />
        <span className="truncate text-[14px] text-ink">Sample Midcap Fund</span>
      </div>

      {/* Popular Funds */}
      <div className="mt-11">
        <SectionTitle viewAll>Popular Funds</SectionTitle>
      </div>
      <div className="mx-4 mt-4 grid grid-cols-2 gap-[13px]">
        {POPULAR.map((f, i) => (
          <div key={f.name} className="flex h-[147px] flex-col rounded-xl border border-line px-[15px] pb-3.5 pt-[15px]">
            <FundSquare index={i + 2} size={30} />
            <p className="mt-3 line-clamp-2 text-[15px] leading-snug text-ink">{f.name}</p>
            <div className="mt-auto flex items-baseline justify-between">
              <span className="text-[16px] font-medium text-gain">{f.ret}</span>
              <span className="text-[12px] text-ink-3">3Y</span>
            </div>
          </div>
        ))}
      </div>

      {/* Collections */}
      <div className="mt-9">
        <SectionTitle>Collections</SectionTitle>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-y-6 px-2">
        {COLLECTIONS.map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-2.5">
            <Illustration Icon={Icon} size={60} />
            <span className="text-center text-[13px] text-ink">{label}</span>
          </div>
        ))}
      </div>

      {/* Products & tools */}
      <div className="mt-11">
        <SectionTitle>Products &amp; tools</SectionTitle>
      </div>
      <div className="mt-5 grid grid-cols-5 px-2">
        {TOOLS.map(({ label, Icon, badge }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <span className="relative" aria-hidden>
              <Icon size={30} strokeWidth={1.5} color="#1E5A52" />
              {badge && (
                <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-white">
                  {badge}
                </span>
              )}
            </span>
            <span className="w-16 text-center text-[13px] leading-tight text-ink">{label}</span>
          </div>
        ))}
      </div>

      {/* All Mutual Funds */}
      <div className="mt-10">
        <SectionTitle>All Mutual Funds</SectionTitle>
      </div>
      <div className="mt-4 flex items-center gap-2.5 overflow-x-hidden pl-4">
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-line text-ink" aria-hidden>
          <SlidersHorizontal size={15} />
        </span>
        <span className="h-6 w-px shrink-0 bg-line" aria-hidden />
        <span className="flex h-[30px] shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 text-[14px] text-ink">
          <ListFilter size={15} aria-hidden /> Sort by <ChevronDown size={15} aria-hidden />
        </span>
        {CHIPS.map((c) => (
          <span key={c} className="flex h-[30px] shrink-0 items-center rounded-full border border-line px-3.5 text-[14px] text-ink">
            {c}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between px-4">
        <span className="text-[13px] font-medium text-ink">1,700 funds</span>
        <span className="flex items-center gap-1 text-[14px] text-ink-2">
          <ChevronsLeftRight size={14} aria-hidden />
          <span className="border-b border-dashed border-ink-3">3Y Returns</span>
        </span>
      </div>

      <ul className="mt-2">
        {ALL_FUNDS.map((f, i) => (
          <li key={f.name} className="flex items-center gap-3.5 pl-4">
            <FundSquare index={i} size={30} />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 border-b border-line-soft py-3 pr-4">
              <div className="min-w-0">
                <p className="truncate text-[15px] text-ink">{f.name}</p>
                <p className="mt-0.5 text-[13px] text-ink-2">{f.category}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[15px] font-medium text-gain">{f.ret}</p>
                <p className="mt-0.5 text-[12px] text-ink-3">3Y</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-b border-line-soft px-4 py-4">
        <span className="text-[15px] font-medium text-ink">View all</span>
        <ChevronRight size={18} className="text-ink-2" aria-hidden />
      </div>
      <p className="mt-8 flex items-center justify-center gap-1 text-[13px] text-ink-2">
        About Groww <ChevronDown size={15} aria-hidden />
      </p>

      <Disclaimer className="mt-6" />
    </div>
  );
}
