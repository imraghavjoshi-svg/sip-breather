"use client";

// "Choose your reason to cancel this SIP": exact copy of classic Groww's
// screen (classic_cancel_reasons). Six bordered rows with icons. What each
// reason opens is NEW (see demoState REASON_SCREEN): withdraw and returns get
// a short answer sheet, pause and change amount open those screens, goal and
// other go straight to cancel confirm.
// NEW (fix 4): the two facts (R1, R5, R10) in a box above the reasons.

import { ArrowUpRight, Check, CirclePause, List, Pencil, Percent } from "lucide-react";
import type { ComponentType } from "react";
import { getSip } from "@/data/sips";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import type { CancelReason } from "@/lib/types";
import { Disclaimer, ScreenHeader } from "../phone/parts";
import { CancelFactsNote } from "../phone/CancelFacts";
import { OptionRow } from "../phone/OptionRow";

const REASONS: { id: CancelReason; Icon: ComponentType<{ size?: number; strokeWidth?: number }>; label: React.ReactNode }[] = [
  { id: "returns", Icon: Percent, label: <>Not satisfied with <b className="font-medium">returns</b></> },
  { id: "withdraw", Icon: ArrowUpRight, label: <>Want to <b className="font-medium">withdraw</b> money</> },
  { id: "pause", Icon: CirclePause, label: <>Want to <b className="font-medium">pause</b> investing</> },
  { id: "change", Icon: Pencil, label: <>Want to <b className="font-medium">change SIP amount/date</b></> },
  { id: "goal", Icon: Check, label: <>Goal is completed</> },
  { id: "other", Icon: List, label: <>Other reason to cancel</> },
];

export default function CancelReasonsScreen() {
  const { state, dispatch } = useDemo();
  const device = useDevice();
  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader onBack={() => dispatch({ type: "back" })} />
      <div className="flex flex-1 flex-col overflow-y-auto px-4">
        <h1 className="mt-2 text-[20px] font-medium text-ink">Choose your reason to cancel this SIP</h1>
        <CancelFactsNote sip={getSip(state.sipId)} className="mt-4" />
        <ul className="mt-4 flex flex-col gap-2.5">
          {REASONS.map((r) => (
            <li key={r.id}>
              <OptionRow Icon={r.Icon} onClick={() => dispatch({ type: "pickReason", reason: r.id })}>
                {r.label}
              </OptionRow>
            </li>
          ))}
        </ul>
        <div className="flex-1" />
        <Disclaimer className="mt-6" />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}
