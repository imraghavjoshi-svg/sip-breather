"use client";

// Redeem step e: "Redemption placed" (no OTP screen in this demo).

import { Check } from "lucide-react";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { formatRupees2, splitRedemption } from "@/lib/redeem";
import { Disclaimer } from "../phone/parts";
import { PrimaryButton } from "../phone/Sheet";

const TEXT = "text-[#44475B]";
const MUTED = "text-[#7C7E8C]";

export default function RedeemDoneScreen() {
  const { state, dispatch } = useDemo();
  const device = useDevice();
  const parts = splitRedemption(Number(state.redeemInput));

  return (
    <div className="flex h-full flex-col bg-white" style={{ paddingTop: device.safeTop }}>
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pt-12">
        <div className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-full bg-accent-tint">
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#C6F4E8]">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-accent">
              <Check size={32} strokeWidth={3} color="white" aria-hidden />
            </div>
          </div>
        </div>

        <h1 className={`mt-7 text-center text-[26px] font-semibold tracking-tight ${TEXT}`} role="status">
          Redemption placed
        </h1>
        <p className={`mt-2 text-center text-[16px] leading-snug ${MUTED}`}>
          Money usually reaches your bank in 1–3 working days.
        </p>

        <ul className="mt-8 rounded-2xl border border-gray-200 px-5">
          {parts.map((p, i) => (
            <li
              key={p.sipId}
              className={`flex items-center justify-between gap-4 py-4 ${i < parts.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <span className={`text-[15px] leading-snug ${TEXT}`}>{p.fundName}</span>
              <span className={`shrink-0 text-[15px] font-medium ${TEXT}`}>{formatRupees2(p.amount)}</span>
            </li>
          ))}
        </ul>

        <div className="flex-1" />
        <div className="mt-6">
          <PrimaryButton tone="blue" onClick={() => dispatch({ type: "backToDashboard" })}>
            Back to Dashboard
          </PrimaryButton>
        </div>
        <Disclaimer className="mt-3" />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}
