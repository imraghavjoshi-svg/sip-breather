// NEW (fix 4, user test 1): the two facts people want before cancelling.
// Rules R1 (invested money stays invested), R5 (cancel stops only future
// instalments) and R10 (start a new SIP later). Shown on the cancel reasons
// screen and at the top of every reason answer.

import { Info } from "lucide-react";
import { formatRupees, invested } from "@/lib/sip";
import type { Sip } from "@/lib/types";

export function CancelFactsNote({ sip, className = "" }: { sip: Sip; className?: string }) {
  return (
    <p
      className={`flex gap-2.5 rounded-xl border border-[#CDEFE0] bg-[#F6FCF9] px-[15px] py-3 text-[14px] leading-snug text-ink ${className}`}
    >
      <Info size={17} className="mt-[1px] shrink-0 text-accent-text" aria-hidden />
      <span>
        Cancelling only stops future instalments. Your <b className="font-medium">{formatRupees(invested(sip))}</b> stays
        invested, and you can start a new SIP anytime.
      </span>
    </p>
  );
}
