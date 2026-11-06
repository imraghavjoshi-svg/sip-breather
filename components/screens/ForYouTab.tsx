"use client";

// For you tab: copy of Groww's For you page (groww_for_you_1/_2/_3) as one
// scrollable page. Real fund names replaced with sample names; "Best Picks
// by Prime" renamed "Explore funds"; no Best Pick / Average / rating labels;
// "Get fund recommendations" replaced by "Start a SIP" (PM decision, 7 Nov).
// Nothing on this page does anything (by design), and nothing shows an error.

import type { ComponentType } from "react";
import {
  ArrowDownToLine,
  Atom,
  Building,
  ChevronRight,
  ChevronUp,
  Funnel,
  Landmark,
  Pencil,
  Percent,
  PiggyBank,
  ShoppingBasket,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { DiamondIcon, Disclaimer } from "../phone/parts";

const TEXT = "text-[#44475B]";
const MUTED = "text-[#7C7E8C]";

type ExploreFund = { category: string; name: string; returns3y: string; seed: number; volatility: number; logo: string };

// Sample names; return figures are sample numbers for this concept.
const EXPLORE_FUNDS: ExploreFund[] = [
  { category: "Flexi cap", name: "Sample Flexi Cap Fund", returns3y: "+17.03%", seed: 3, volatility: 1, logo: "#1E6FB8" },
  { category: "Mid cap", name: "Sample Midcap Fund", returns3y: "+20.57%", seed: 7, volatility: 1.1, logo: "#D93A3A" },
  { category: "Arbitrage", name: "Sample Arbitrage Fund", returns3y: "+6.58%", seed: 11, volatility: 0.08, logo: "#2E7D5B" },
  { category: "Small cap", name: "Sample Small Cap Fund", returns3y: "+20.33%", seed: 5, volatility: 1.2, logo: "#E2512E" },
];

const COLLECTIONS: { label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { label: "All categories", Icon: TrendingUp }, // was "High return" (PM decision, 7 Nov)
  { label: "SIP funds", Icon: PiggyBank },
  { label: "Flexi Cap", Icon: Wallet },
  { label: "Large Cap", Icon: Landmark },
  { label: "Mid Cap", Icon: Building },
  { label: "Small Cap", Icon: Store },
];

const TOOLS: { label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { label: "Import funds", Icon: ArrowDownToLine },
  { label: "SIP calculator", Icon: Percent },
  { label: "Cart", Icon: ShoppingBasket },
];

// Heights of the amount slider bars (₹100 … ₹10k), tallest at ₹2,000.
const BARS = [36, 26, 26, 30, 26, 36, 30, 26, 30, 40, 34, 52, 40, 34, 30, 34, 40, 30, 26, 34, 30, 26, 34, 26];
const SELECTED_BAR = 11;

export default function ForYouTab() {
  return (
    <div className="pb-6">
      {/* Smart-invest with Prime */}
      <h2 className={`mx-4 mt-6 text-[20px] font-medium ${TEXT}`}>Smart-invest with Prime</h2>
      <div className="mx-4 mt-4 rounded-2xl border border-gray-200 px-5 pb-5 pt-5">
        <div className="mx-auto flex w-fit rounded-full border border-gray-200 p-1 text-[14px]">
          <span className={`rounded-full border border-gray-400 bg-gray-100 px-3.5 py-1.5 font-medium ${TEXT}`}>SIP</span>
          <span className={`px-3.5 py-1.5 ${TEXT}`}>One time</span>
        </div>
        <p className={`mt-5 text-center text-[13px] ${MUTED}`}>Monthly investment amount</p>
        <div className="mt-1 flex items-center justify-center gap-3">
          <span className={`text-[34px] font-medium tracking-tight ${TEXT}`}>₹2,000</span>
          <span className={`flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 ${TEXT}`}>
            <Pencil size={15} aria-hidden />
          </span>
        </div>

        <div className="mt-4 flex h-[60px] items-end justify-center gap-[7px]" aria-hidden>
          {BARS.map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full"
              style={{
                height: h,
                background: i <= SELECTED_BAR ? "#5367FF" : "#9A9CA8",
                opacity: i === 0 ? 0.4 : i > BARS.length - 6 ? 0.25 + (BARS.length - i) * 0.12 : i < SELECTED_BAR ? 0.55 + i * 0.04 : 1,
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between px-1 text-[11px] text-[#B6B8C3]" aria-hidden>
          <span>₹100</span>
          <span>₹500</span>
          <span>₹1k</span>
          <span>₹3k</span>
          <span>₹5k</span>
          <span>₹10k</span>
        </div>

        <button
          type="button"
          className="mt-5 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-groww-blue text-[19px] font-bold text-white hover:bg-groww-blue-hover"
        >
          <DiamondIcon symbol="plain" size={18} />
          Start a SIP
        </button>
      </div>

      {/* Explore funds (was "Best Picks by Prime") */}
      <div className="mx-4 mt-9 flex items-center justify-between">
        <h2 className={`text-[20px] font-medium ${TEXT}`}>Explore funds</h2>
        <span className={`flex items-center gap-1 text-[15px] ${MUTED}`}>
          View all <ChevronRight size={18} aria-hidden />
        </span>
      </div>
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {EXPLORE_FUNDS.map((f) => (
          <div key={f.name} className="rounded-2xl border border-gray-200 px-4 pb-3 pt-4">
            <p className={`text-[11px] font-medium uppercase tracking-[0.16em] ${MUTED}`}>{f.category}</p>
            <div className="mt-2 flex items-start justify-between gap-2">
              <p className={`text-[15px] leading-snug ${TEXT}`}>{f.name}</p>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[13px] font-bold text-white"
                style={{ background: f.logo }}
                aria-hidden
              >
                S
              </span>
            </div>
            <Sparkline seed={f.seed} volatility={f.volatility} />
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-[17px] font-medium text-accent-text">{f.returns3y}</span>
              <span className={`text-[13px] ${MUTED}`}>3Y</span>
            </div>
          </div>
        ))}
      </div>

      {/* Collections */}
      <h2 className={`mx-4 mt-10 text-[20px] font-medium ${TEXT}`}>Collections</h2>
      <div className="mx-4 mt-6 grid grid-cols-3 gap-y-7">
        {COLLECTIONS.map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-3">
            <IllustratedIcon Icon={Icon} />
            <span className={`text-[14px] ${TEXT}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* All Mutual Funds */}
      <div className="mx-4 mt-8 flex items-center justify-between rounded-2xl border border-gray-200 px-5 py-5">
        <span className="flex items-center gap-3">
          <Funnel size={20} className="text-groww-blue" aria-hidden />
          <span className={`text-[16px] font-medium ${TEXT}`}>All Mutual Funds</span>
        </span>
        <span className={`flex items-center gap-2 text-[15px] ${MUTED}`}>
          1,616 <ChevronRight size={18} aria-hidden />
        </span>
      </div>

      {/* Products & tools */}
      <h2 className={`mx-4 mt-10 text-[20px] font-medium ${TEXT}`}>Products &amp; tools</h2>
      <div className="mx-4 mt-6 grid grid-cols-3">
        {TOOLS.map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-3">
            <IllustratedIcon Icon={Icon} />
            <span className={`w-20 text-center text-[14px] font-medium leading-snug ${TEXT}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* About Prime */}
      <h2 className={`mx-4 mt-10 text-[20px] font-medium ${TEXT}`}>About Prime</h2>
      <div className="mx-4 mt-4 flex items-center justify-between rounded-2xl border border-gray-200 px-5 py-4">
        <span className="flex items-center gap-4">
          <Atom size={24} className={MUTED} aria-hidden />
          <span>
            <span className={`block text-[13px] ${MUTED}`}>Your Prime Strategy</span>
            <span className={`block text-[15px] font-medium ${TEXT}`}>Balanced · Long term</span>
          </span>
        </span>
        <ChevronRight size={18} className={MUTED} aria-hidden />
      </div>
      <div className="mx-4 mt-3 flex items-center justify-between rounded-2xl border border-gray-200 px-5 py-4">
        <span className="flex items-center gap-4">
          <span className={MUTED}>
            <DiamondIcon symbol="plain" size={24} />
          </span>
          <span className={`text-[15px] font-medium ${TEXT}`}>
            See your <span className="text-groww-blue-text">Prime Benefits</span>
          </span>
        </span>
        <ChevronRight size={18} className={MUTED} aria-hidden />
      </div>

      {/* Market-risk disclaimer and About Groww (as in the screenshot) */}
      <p className={`mx-4 mt-8 text-[13px] leading-relaxed ${MUTED}`}>
        Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Past
        performance of the schemes is neither an indicator nor a guarantee of future performance. You hereby
        acknowledge that your transaction is execution only transaction.
      </p>
      <div className="mt-8 border-t border-gray-200 px-4 pt-6 text-center">
        <p className={`flex items-center justify-center gap-1.5 text-[14px] ${MUTED}`}>
          About Groww <ChevronUp size={16} aria-hidden />
        </p>
        <p className={`mt-3 text-[13px] leading-relaxed ${MUTED}`}>
          Groww Invest Tech Pvt. Ltd.
          <br />
          (Formerly known as Nextbillion Technology Pvt. Ltd.)
          <br />
          AMFI registered Mutual Fund Distributor
          <br />
          ARN-111686
        </p>
      </div>

      <Disclaimer className="mt-6" />
    </div>
  );
}

/** Groww-style illustrated icon: blue line icon over a soft tinted shape. */
function IllustratedIcon({ Icon }: { Icon: ComponentType<{ size?: number; strokeWidth?: number }> }) {
  return (
    <span className="relative flex h-14 w-14 items-center justify-center" aria-hidden>
      <span className="absolute bottom-0 h-5 w-12 rounded-[50%] bg-groww-blue-tint" />
      <span className="relative text-groww-blue">
        <Icon size={38} strokeWidth={1.4} />
      </span>
    </span>
  );
}

/** Small green line chart, drawn from a repeatable pseudo-random walk with an upward trend. */
function Sparkline({ seed, volatility }: { seed: number; volatility: number }) {
  const W = 140;
  const H = 58;
  const N = 70;
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const values: number[] = [];
  let v = 0;
  for (let i = 0; i < N; i++) {
    v += 0.6 + (rand() - 0.5) * 6 * volatility;
    values.push(v);
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((y, i) => `${((i / (N - 1)) * W).toFixed(1)},${(H - 4 - ((y - min) / (max - min || 1)) * (H - 8)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-[58px] w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={points} fill="none" stroke="#00B386" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}
