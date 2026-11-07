"use client";

// Small building blocks shared by the screens inside the phone.

import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, ChevronLeft, Search } from "lucide-react";
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

/**
 * GR-1's icon in the header: a simple swirl drawn here (not Groww's own
 * artwork), in the same place as the swirl in classic Groww.
 */
export function Gr1Swirl({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <path key={deg} d="M12 3 Q17.5 4.5 16.4 10.2" strokeLinecap="round" transform={`rotate(${deg} 12 12)`} />
      ))}
    </svg>
  );
}

const HOME_TABS: { id: HomeTab; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "dashboard", label: "Dashboard" },
  { id: "sips", label: "SIPs" },
  { id: "watchlist", label: "Watchlist" },
];

/**
 * Classic Groww header row (classic_dashboard): logo, "Mutual Funds", search,
 * GR-1 swirl (opens GR-1), green avatar "R". Sizes measured from the
 * screenshots (575 px wide = 412 px here).
 */
export function HeaderBar({ onOpenGr1 }: { onOpenGr1: () => void }) {
  return (
    <div className="flex h-[54px] items-center justify-between bg-white pl-[18px] pr-[22px]">
      <div className="flex items-center gap-3">
        <LogoMark size={38} />
        <span className="text-[18px] font-medium text-ink">Mutual Funds</span>
      </div>
      <div className="flex items-center gap-[22px] text-ink">
        <Search size={22} strokeWidth={2.4} aria-hidden />
        <button type="button" onClick={onOpenGr1} aria-label="Ask GR-1" className="rounded-full">
          <Gr1Swirl size={25} />
        </button>
        <span
          className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-avatar text-[15px] text-white"
          aria-hidden
        >
          R
        </span>
      </div>
    </div>
  );
}

/** Explore / Dashboard / SIPs / Watchlist. Active tab: dark, medium weight, dark underline. */
export function HomeTabs({ tab, onTab }: { tab: HomeTab; onTab: (t: HomeTab) => void }) {
  return (
    <div className="flex border-b border-line-soft bg-white pl-[15px]" role="tablist" aria-label="Mutual funds sections">
      {HOME_TABS.map((t) => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTab(t.id)}
            className={`whitespace-nowrap border-b-[3px] px-[15px] pb-2.5 pt-3 text-[16px] transition-colors ${
              active ? "border-ink font-medium text-ink" : "border-transparent text-ink-2 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* Bottom-bar icons, drawn to match classic Groww's outline style. */
function StocksIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M6.5 15 L10 11 L13 13.5 L17.5 8.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FnoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M6 16 L10.5 9 L13 12.5 L15 10 L18 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MutualFundsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path d="M12 3.5 A8.5 8.5 0 1 1 3.5 12 H12 Z" fill="#D8E0FF" strokeLinejoin="round" />
      <path d="M10 2.2 A8.5 8.5 0 0 0 2.2 10 H10 Z" strokeLinejoin="round" />
    </svg>
  );
}
function LoansIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path d="M3 7 Q5 5.5 7 7 Q12 5 17 7 Q19 5.5 21 7 V17 Q19 18.5 17 17 Q12 19 7 17 Q5 18.5 3 17 Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M7 12 H7.5 M16.5 12 H17" strokeLinecap="round" />
    </svg>
  );
}

/** Bottom navigation (shown, not clickable). Active item in classic Groww's own blue. */
export function BottomNav() {
  const device = useDevice();
  const items = [
    { label: "Stocks", Icon: StocksIcon },
    { label: "F&O", Icon: FnoIcon },
    { label: "Mutual Funds", Icon: MutualFundsIcon, active: true },
    { label: "Loans", Icon: LoansIcon },
  ];
  return (
    <nav
      className="grid shrink-0 grid-cols-4 border-t border-line-soft bg-white px-1 pt-2.5"
      style={{ paddingBottom: device.safeBottom + 4 }}
      aria-label="App sections"
    >
      {items.map(({ label, Icon, active }) => (
        <span
          key={label}
          className={`flex flex-col items-center gap-1 text-[11px] ${active ? "font-medium text-nav-active" : "text-ink-3"}`}
        >
          <Icon />
          {label}
        </span>
      ))}
    </nav>
  );
}

/**
 * Back button + title, classic Groww style. The back icon follows the device
 * ("<" on iOS, "←" on Android). Title 16px (redeem) or 18px (SIP details).
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  large = false,
}: {
  title?: string;
  subtitle?: ReactNode;
  onBack: () => void;
  right?: ReactNode;
  large?: boolean;
}) {
  const device = useDevice();
  const BackIcon = device.backStyle === "chevron" ? ChevronLeft : ArrowLeft;
  return (
    <div className="bg-white" style={{ paddingTop: device.safeTop }}>
      <div className="flex min-h-[60px] items-center gap-1.5 py-1 pl-1 pr-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-line-soft"
        >
          <BackIcon size={device.backStyle === "chevron" ? 28 : 24} strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          {title && (
            <h1 className={`truncate font-medium text-ink ${large ? "text-[18px]" : "text-[16px]"}`}>{title}</h1>
          )}
          {subtitle && <div className="truncate text-[12px] text-ink-2">{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}

/** The line every screen must show. */
export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-[12px] text-ink-3 ${className}`}>Information only, not investment advice.</p>
  );
}

/**
 * Green "New" tag on every part this concept adds to classic Groww.
 * Dark green text on the light tint (about 5:1, readable at 11px).
 */
export function NewTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded bg-accent-tint px-1.5 py-[1px] text-[11px] font-bold uppercase tracking-wide text-[#077a57] ${className}`}
    >
      New
    </span>
  );
}

const SQUARE_COLOURS = ["#3F6FD8", "#E0563B", "#2E9E83", "#8A5CD0", "#D9922B", "#3B8FC2", "#C2477A"];

/** Plain coloured "S" square used instead of real fund logos. */
export function FundSquare({ index = 0, size = 30 }: { index?: number; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-md font-semibold text-white"
      style={{ width: size, height: size, background: SQUARE_COLOURS[index % SQUARE_COLOURS.length], fontSize: size * 0.5 }}
      aria-hidden
    >
      S
    </span>
  );
}

/** Text with a dotted underline, as on classic Groww's small links ("Cancel SIP", "Skip"). */
export function DottedLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-b border-dashed border-ink-3 pb-[1px] text-[15px] font-medium leading-tight text-ink hover:border-ink"
    >
      {children}
    </button>
  );
}
