"use client";

// Small building blocks shared by the screens inside the phone.

import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Banknote,
  ChartCandlestick,
  ChartLine,
  ChartPie,
  ChevronLeft,
  LoaderPinwheel,
  Search,
} from "lucide-react";
import { useDevice } from "@/lib/device";
import type { HomeTab } from "@/lib/types";

// Accent colours live in app/globals.css (bg-accent, text-accent-text, ...).
export const ACCENT = "#00D09C";

/** Round logo icon only, cropped from the full logo in code. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src="/logo.png"
        alt=""
        width={800}
        height={220}
        className="absolute left-0 top-0 max-w-none"
        style={{ height: size, width: "auto" }}
      />
    </span>
  );
}

/** Groww's Prime diamond (blue), used next to "MF Prime" and on Prime items. */
export function PrimeDiamond({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2 L21 12 L12 22 L3 12 Z" fill="#5367FF" />
      <path d="M12 2 L21 12 L12 12 Z" fill="#8C9BFF" />
      <path d="M3 12 L12 12 L12 22 Z" fill="#3446D6" />
    </svg>
  );
}

/** Outlined diamond with a symbol inside, like Groww's Redeem / Invest more buttons. */
export function DiamondIcon({ symbol, size = 20 }: { symbol: "up" | "plus" | "plain"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path d="M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z" strokeLinejoin="round" />
      {symbol === "up" && (
        <path d="M12 16 V8.5 M8.8 11.5 L12 8.3 L15.2 11.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {symbol === "plus" && <path d="M12 8 V16 M8 12 H16" strokeLinecap="round" />}
      {symbol === "plain" && <path d="M2.5 12 H21.5 M12 2.5 L9 12 L12 21.5 L15 12 Z" strokeLinejoin="round" />}
    </svg>
  );
}

const HOME_TABS: { id: HomeTab; label: string }[] = [
  { id: "foryou", label: "For you" },
  { id: "dashboard", label: "Dashboard" },
  { id: "sips", label: "SIPs" },
  { id: "watchlist", label: "Watchlist" },
];

/** Groww MF header row: logo, "MF Prime" + Prime diamond, search, GR-1 swirl, avatar. */
export function HeaderBar({ onOpenGr1 }: { onOpenGr1: () => void }) {
  return (
    <div className="flex items-center justify-between bg-white px-4 pb-1.5 pt-2">
      <div className="flex items-center gap-2.5">
        <LogoMark size={38} />
        <span className="text-[19px] font-medium tracking-tight text-[#44475B]">MF Prime</span>
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-groww-blue-tint">
          <PrimeDiamond size={13} />
        </span>
      </div>
      <div className="flex items-center gap-5 text-[#44475B]">
        <Search size={21} strokeWidth={2.2} aria-hidden />
        <button type="button" onClick={onOpenGr1} aria-label="Ask GR-1" className="rounded-full">
          <LoaderPinwheel size={22} />
        </button>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E7C66] text-[16px] font-medium text-white"
          aria-hidden
        >
          R
        </span>
      </div>
    </div>
  );
}

/** For you / Dashboard / SIPs / Watchlist. Active tab: bold with a black underline. */
export function HomeTabs({ tab, onTab }: { tab: HomeTab; onTab: (t: HomeTab) => void }) {
  return (
    <div
      className="flex justify-between border-b border-gray-200 bg-white px-5"
      role="tablist"
      aria-label="Mutual funds sections"
    >
      {HOME_TABS.map((t) => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTab(t.id)}
            className={`whitespace-nowrap border-b-[3px] px-1 pb-2.5 pt-2 text-[16px] transition-colors ${
              active
                ? "border-[#44475B] font-semibold text-[#44475B]"
                : "border-transparent text-[#7C7E8C] hover:text-[#44475B]"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/** Bottom navigation (shown, not clickable). Active item in Groww blue. */
export function BottomNav() {
  const device = useDevice();
  const items = [
    { label: "Stocks", Icon: ChartLine },
    { label: "F&O", Icon: ChartCandlestick },
    { label: "Mutual Funds", Icon: ChartPie, active: true },
    { label: "Loans", Icon: Banknote },
  ];
  return (
    <nav
      className="flex shrink-0 justify-around border-t border-gray-100 bg-white pt-2"
      style={{ paddingBottom: device.safeBottom + 4 }}
      aria-label="App sections"
    >
      {items.map(({ label, Icon, active }) => (
        <span
          key={label}
          className={`flex w-20 flex-col items-center gap-1 text-[12px] ${
            active ? "font-semibold text-groww-blue-text" : "text-[#7C7E8C]"
          }`}
        >
          <Icon size={22} strokeWidth={1.8} aria-hidden />
          {label}
        </span>
      ))}
    </nav>
  );
}

/** Back button + title, in the style of the current device ("<" on iOS, "←" on Android). */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title?: string;
  subtitle?: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  const device = useDevice();
  const BackIcon = device.backStyle === "chevron" ? ChevronLeft : ArrowLeft;
  return (
    <div className="bg-white" style={{ paddingTop: device.safeTop }}>
      <div className="flex min-h-14 items-center gap-2 px-2 py-1">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-900 hover:bg-gray-100"
        >
          <BackIcon size={device.backStyle === "chevron" ? 28 : 24} />
        </button>
        {title && (
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="truncate text-[14px] text-gray-500">{subtitle}</p>}
          </div>
        )}
        {right}
      </div>
    </div>
  );
}

/** The line every screen must show. */
export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-[12px] text-gray-400 ${className}`}>Information only, not investment advice.</p>
  );
}
