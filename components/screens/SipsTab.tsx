"use client";

// SIPs tab: copy of classic Groww's SIPs tab (classic_sips). Monthly SIP
// amount card, active SIPs sorted by due date with a date tile, and SIPs
// cancelled by the user. A SIP cancelled in this demo run moves to that list.
// "Restart" and "Sort by" are shown for realism and do nothing.

import { ListFilter } from "lucide-react";
import { SIPS } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { formatDayMonth } from "@/lib/dates";
import { formatRupees, sipView, type SipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Disclaimer, FundSquare } from "../phone/parts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The sample SIP the user cancelled before this demo (always shown). */
const EARLIER_CANCELLED = { name: "Sample Index Fund Direct Growth", amount: 300, cancelledOn: "24 Sep" };

export default function SipsTab() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const views = SIPS.map((s, i) => ({ view: sipView(s, state.decision, today), index: i }));
  const active = views
    .filter(({ view }) => view.status !== "cancelled")
    .sort((a, b) => a.view.nextDate!.getTime() - b.view.nextDate!.getTime());
  const cancelledNow = views.filter(({ view }) => view.status === "cancelled");
  const monthlyTotal = active.reduce((sum, { view }) => sum + view.monthlyAmount, 0);

  return (
    <div className="pb-6">
      <div className="mx-4 mt-4 rounded-2xl border border-line px-[15px] py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-2">Monthly SIP amount</p>
        <p className="mt-1 text-[22px] font-medium text-ink">{formatRupees(monthlyTotal)}</p>
      </div>

      <div className="mt-7 flex items-center justify-between px-4">
        <h2 className="text-[18px] font-medium text-ink">Active SIPs ({active.length})</h2>
        <span className="flex items-center gap-2 text-[14px] text-ink">
          <ListFilter size={16} aria-hidden />
          <span className="border-b border-dashed border-ink-3">Sort by: Due date</span>
        </span>
      </div>

      <ul className="mt-3">
        {active.map(({ view, index }, i) => (
          <li key={view.sip.id}>
            <ActiveRow
              view={view}
              index={index}
              divider={i < active.length - 1}
              onOpen={() => dispatch({ type: "openSip", sipId: view.sip.id })}
            />
          </li>
        ))}
      </ul>

      <h2 className="mt-6 px-4 text-[18px] font-medium text-ink">
        SIPs cancelled by you ({cancelledNow.length + 1})
      </h2>
      <ul className="mt-3 flex flex-col gap-4">
        {cancelledNow.map(({ view, index }) => (
          <li key={view.sip.id}>
            <CancelledRow
              name={view.sip.fundName}
              amount={view.monthlyAmount}
              cancelledOn={formatDayMonth(today)}
              index={index}
              onOpen={() => dispatch({ type: "openSip", sipId: view.sip.id })}
            />
          </li>
        ))}
        <li>
          <CancelledRow
            name={EARLIER_CANCELLED.name}
            amount={EARLIER_CANCELLED.amount}
            cancelledOn={EARLIER_CANCELLED.cancelledOn}
            index={4}
          />
        </li>
      </ul>

      <Disclaimer className="mt-10" />
    </div>
  );
}

function ActiveRow({ view, index, divider, onOpen }: { view: SipView; index: number; divider: boolean; onOpen: () => void }) {
  const date = view.nextDate!;
  return (
    <button type="button" onClick={onOpen} className="flex w-full items-start gap-3.5 pl-4 text-left hover:bg-[#fafafa]">
      <span className="pt-4">
        <FundSquare index={index} size={30} />
      </span>
      <span className={`flex min-w-0 flex-1 items-start gap-3 py-4 pr-4 ${divider ? "border-b border-line-soft" : ""}`}>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-snug text-ink">{view.sip.fundName}</span>
          <span className="mt-2 block text-[14px] text-ink-2">
            {formatRupees(view.monthlyAmount)}
            {view.status === "paused" && <> • {view.statusLabel}</>}
            {view.status === "skipping" && <> • Next instalment skipped</>}
          </span>
        </span>
        <span
          className="flex h-[50px] w-[42px] shrink-0 flex-col items-center justify-center rounded-lg border border-line"
          aria-label={`Next on ${formatDayMonth(date)}`}
        >
          <span className="text-[17px] leading-tight text-ink">{String(date.getDate()).padStart(2, "0")}</span>
          <span className="text-[12px] leading-tight text-ink-2">{MONTHS[date.getMonth()]}</span>
        </span>
      </span>
    </button>
  );
}

function CancelledRow({
  name,
  amount,
  cancelledOn,
  index,
  onOpen,
}: {
  name: string;
  amount: number;
  cancelledOn: string;
  index: number;
  onOpen?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4">
      <FundSquare index={index} size={30} />
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[15px] text-ink">{name}</span>
        <span className="mt-1 block text-[13px] text-ink-2">
          {formatRupees(amount)} <span className="mx-1">•</span> Cancelled on {cancelledOn}
        </span>
      </button>
      {/* Shown as in Groww; does nothing in this demo. */}
      <button type="button" className="h-[38px] shrink-0 rounded-lg bg-accent-tint px-4 text-[15px] font-medium text-accent-text">
        Restart
      </button>
    </div>
  );
}
