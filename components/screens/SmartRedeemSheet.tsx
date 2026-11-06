"use client";

// Copy of Groww's "Smart Redeem" intro sheet (groww_smart_redeem.png), over
// the dimmed "Enter redeem amount" screen. Groww's existing screen: blue.
// Opens by itself the first time the amount screen opens in a demo run, and
// whenever "How Smart Redeem works" is tapped. Continue / dim area close it.

import type { ReactNode } from "react";
import { IndianRupee } from "lucide-react";
import { useDemo } from "@/lib/demoState";
import { DiamondIcon } from "../phone/parts";
import { PrimaryButton, Sheet } from "../phone/Sheet";

const TEXT = "text-[#44475B]";

type Card = { kind: "white" | "peach"; offset: string; width: string };

// One loop of placeholder cards (positions follow the screenshot).
const CARDS: Card[] = [
  { kind: "white", offset: "ml-[88px]", width: "w-[200px]" },
  { kind: "peach", offset: "-ml-3", width: "w-[104px]" },
  { kind: "white", offset: "ml-[88px]", width: "w-[200px]" },
  { kind: "peach", offset: "ml-[88px]", width: "w-[200px]" },
];

export default function SmartRedeemSheet() {
  const { dispatch } = useDemo();
  const close = () => dispatch({ type: "back" });

  return (
    <Sheet label="Smart Redeem with expert guidance" onDismiss={close} handle={false}>
      <p className="flex items-center justify-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.18em] text-groww-blue-text">
        <DiamondIcon symbol="plain" size={14} />
        Prime exclusive
      </p>
      <h2 className={`mt-1.5 text-center text-[20px] font-medium ${TEXT}`}>Smart Redeem with expert guidance</h2>

      {/* Animated placeholder cards */}
      <div className="relative mt-5 h-[170px] overflow-hidden rounded-2xl border border-gray-200" aria-hidden>
        <div className="smart-redeem-ticker">
          {[...CARDS, ...CARDS].map((c, i) => (
            <div key={i} className={`pb-4 ${c.offset}`}>
              {c.kind === "white" ? (
                <div className={`flex h-[46px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 ${c.width}`}>
                  <span className="h-[18px] w-[18px] shrink-0 rounded bg-gray-100" />
                  <span className="flex flex-1 flex-col gap-1.5">
                    <span className="h-[7px] w-full rounded-full bg-gray-100" />
                    <span className="h-[7px] w-1/2 rounded-full bg-gray-100" />
                  </span>
                </div>
              ) : (
                <div
                  className={`flex h-[44px] items-center gap-3 rounded-xl border border-[#FBE9DD] bg-[#FFF7F2] px-3 ${c.width}`}
                >
                  <span className="h-[7px] w-3/4 rounded-full bg-[#FBE3D3]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Three points */}
      <ul className="mt-5 flex flex-col gap-3.5">
        <Point
          icon={
            <span className="flex h-[19px] w-[19px] items-center justify-center rounded-full border-[1.7px] border-current">
              <IndianRupee size={11} strokeWidth={2.4} />
            </span>
          }
          text="You choose the amount"
        />
        <Point icon={<DiamondIcon symbol="plain" size={19} />} text="We pick the funds to redeem from" />
        <Point icon={<PodiumIcon />} text="Optimised for tax, exit load, and portfolio balance" />
      </ul>

      <div className="mt-6">
        <PrimaryButton tone="blue" onClick={close}>
          Continue
        </PrimaryButton>
      </div>
    </Sheet>
  );
}

function Point({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-groww-blue-tint text-groww-blue" aria-hidden>
        {icon}
      </span>
      <span className={`text-[15px] ${TEXT}`}>{text}</span>
    </li>
  );
}

/** Podium with a star on top, as in Groww's sheet. */
function PodiumIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
      <path d="M12 2.8 L13 5 L15.3 5.2 L13.5 6.7 L14.1 9 L12 7.8 L9.9 9 L10.5 6.7 L8.7 5.2 L11 5 Z" />
      <path d="M9 12 H15 V21 H9 Z M3 15 H9 V21 H3 Z M15 17 H21 V21 H15 Z" />
    </svg>
  );
}
