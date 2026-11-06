"use client";

// "Which SIP?" picker, shown over the redeem sheet when the redemption covers
// both funds and "See SIP options" is tapped. Two plain rows in Groww's list
// style; choosing one opens that SIP's options (Back returns to the redeem sheet).

import { ChevronRight } from "lucide-react";
import { useDemo } from "@/lib/demoState";
import { formatDayMonth } from "@/lib/dates";
import { sipsWithInstalmentDue, splitRedemption } from "@/lib/redeem";
import { formatRupees } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Sheet } from "../phone/Sheet";

const TEXT = "text-[#44475B]";
const MUTED = "text-[#7C7E8C]";

export default function SipPickerSheet() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const due = sipsWithInstalmentDue(splitRedemption(Number(state.redeemInput)), state.decision, today);

  return (
    <Sheet label="Which SIP?" onDismiss={() => dispatch({ type: "back" })} stacked>
      <h2 className={`text-[20px] font-semibold ${TEXT}`}>Which SIP?</h2>
      <p className={`mt-1 text-[14px] ${MUTED}`}>See the options for one SIP at a time.</p>

      <ul className="mt-3">
        {due.map((v, i) => (
          <li key={v.sip.id}>
            <button
              type="button"
              onClick={() => dispatch({ type: "pickSip", sipId: v.sip.id })}
              className={`flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-gray-50 ${
                i < due.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <span className="min-w-0">
                <span className={`block text-[16px] leading-snug ${TEXT}`}>{v.sip.fundName}</span>
                <span className={`mt-1 block text-[14px] ${MUTED}`}>
                  {formatRupees(v.monthlyAmount)} monthly · Next on {formatDayMonth(v.nextDate!)}
                </span>
              </span>
              <ChevronRight size={20} className={`shrink-0 ${MUTED}`} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
