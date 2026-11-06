"use client";

// Screen 5: Lower the amount. Big amount + on-screen keypad (whole rupees, no
// "." key). Inline messages: below the minimum, or not lower than now.
// The computer keyboard also works (digits and Backspace).

import { useEffect } from "react";
import { Delete } from "lucide-react";
import { getSip } from "@/data/sips";
import { currentScreen, useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { checkNewAmount, formatRupees, MAX_AMOUNT_DIGITS, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Disclaimer, ScreenHeader } from "../phone/parts";
import { PrimaryButton } from "../phone/Sheet";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"] as const;

export default function LowerAmountScreen() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const device = useDevice();
  const sip = getSip(state.sipId);
  const current = sipView(sip, state.decision, today).monthlyAmount;
  const input = state.draft.amountInput;
  const { ok, error } = checkNewAmount(input, current, sip.minAmount);
  const isTopScreen = currentScreen(state) === "lower" && !state.gr1Open;

  function press(key: string) {
    if (key === "back") return dispatch({ type: "setAmountInput", value: input.slice(0, -1) });
    if (input.length >= MAX_AMOUNT_DIGITS) return;
    if (input === "" && key === "0") return; // no leading zero
    dispatch({ type: "setAmountInput", value: input + key });
  }

  // Typing on the laptop keyboard, only while this screen is on top.
  useEffect(() => {
    if (!isTopScreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("back");
      else if (e.key === "Enter" && ok) dispatch({ type: "go", screen: "lowerConfirm" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader
        title="Enter new monthly amount"
        subtitle={`Currently ${formatRupees(current)}`}
        onBack={() => dispatch({ type: "back" })}
      />

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <p
          className="flex items-center text-[64px] font-bold leading-none tracking-tight"
          aria-label={input ? `New amount ${formatRupees(Number(input))}` : "No amount entered"}
        >
          <span className={input ? "text-gray-900" : "text-gray-300"}>
            ₹{input ? Number(input).toLocaleString("en-IN") : "0"}
          </span>
          <span className="ml-1 h-[60px] w-[3px] animate-pulse rounded-full bg-accent" aria-hidden />
        </p>
        <p className="mt-4 min-h-[22px] text-center text-[15px] font-medium text-error" role="status">
          {error ?? ""}
        </p>
        {!error && (
          <p className="text-center text-[14px] text-gray-500">
            From {formatRupees(sip.minAmount)}. Your SIP stays active.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 px-4" role="group" aria-label="Keypad">
        {KEYS.map((k) =>
          k === "" ? (
            <span key="blank" aria-hidden />
          ) : (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={k === "back" ? "Delete" : k}
              className="flex h-[64px] items-center justify-center rounded-xl text-[28px] font-semibold text-gray-900 active:bg-gray-100 hover:bg-gray-50"
            >
              {k === "back" ? <Delete size={28} /> : k}
            </button>
          ),
        )}
      </div>

      <div className="px-5 pt-3">
        <PrimaryButton disabled={!ok} onClick={() => dispatch({ type: "go", screen: "lowerConfirm" })}>
          Continue
        </PrimaryButton>
        <Disclaimer className="mt-3" />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}
