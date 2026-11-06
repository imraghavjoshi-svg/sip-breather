"use client";

// Screen 3: "You have a few options", over the dimmed SIP details.
// The four options have exactly the same look and weight; Cancel SIP is
// never hidden, smaller, greyed out or red.

import type { ComponentType } from "react";
import { ArrowDown, CalendarX2, ChevronRight, Pause, Sparkles, X } from "lucide-react";
import { getSip } from "@/data/sips";
import { useDemo, type Screen } from "@/lib/demoState";
import { formatDayMonth, formatMonthName, instalmentAfterNext, nextInstalment } from "@/lib/dates";
import { formatRupees, invested } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Sheet } from "../phone/Sheet";

type Option = { title: string; line: string; Icon: ComponentType<{ size?: number }>; screen: Screen };

export default function OptionsSheet({ stacked }: { stacked?: boolean }) {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const sip = getSip(state.sipId);
  const next = nextInstalment(sip.instalmentDay, today);
  const after = instalmentAfterNext(sip.instalmentDay, 1, today);

  const options: Option[] = [
    {
      title: "Skip next instalment",
      line: `Only ${formatDayMonth(next)} is skipped. SIP continues in ${formatMonthName(after)}.`,
      Icon: CalendarX2,
      screen: "skipConfirm",
    },
    {
      title: `Pause for 1 to ${sip.maxPauseMonths} months`,
      line: "No instalments for a while. Restarts on its own.",
      Icon: Pause,
      screen: "pause",
    },
    {
      title: "Lower the amount",
      line: `Keep investing with less, from ${formatRupees(sip.minAmount)}.`,
      Icon: ArrowDown,
      screen: "lower",
    },
    {
      title: "Cancel SIP",
      line: "Future instalments stop. Start a new SIP anytime.",
      Icon: X,
      screen: "cancelConfirm",
    },
  ];

  return (
    <Sheet label="You have a few options" onDismiss={() => dispatch({ type: "back" })} stacked={stacked}>
      <span className="inline-block rounded-full border border-[#B3F0DF] bg-accent-tint px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide text-accent-text">
        Your {formatRupees(invested(sip))} stays invested in every case
      </span>
      <h2 className="mt-3 text-[24px] font-bold tracking-tight text-gray-900">You have a few options</h2>
      <p className="mt-1 text-[15px] text-gray-500">Choose what works best for you right now.</p>

      <ul className="mt-4 flex flex-col gap-2.5">
        {options.map(({ title, line, Icon, screen }) => (
          <li key={title}>
            <button
              type="button"
              onClick={() => dispatch({ type: "go", screen })}
              className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 px-4 py-3.5 text-left transition-colors hover:bg-gray-50"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-semibold text-gray-900">{title}</span>
                <span className="mt-0.5 block text-[14px] leading-snug text-gray-500">{line}</span>
              </span>
              <ChevronRight size={20} className="shrink-0 text-gray-400" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => dispatch({ type: "openGr1" })}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent-tint text-[16px] font-semibold text-accent-text hover:bg-[#D3F6EC]"
      >
        <Sparkles size={17} aria-hidden /> Not sure? Ask GR-1
      </button>
    </Sheet>
  );
}
