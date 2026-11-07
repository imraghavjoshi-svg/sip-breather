"use client";

// Lower the amount (opened by "Change amount/date" on SIP details), in classic
// Groww's style. Big amount + on-screen keypad (whole rupees, no "." key).
// Inline messages: below the minimum, or not lower than now. When reached
// from "Choose your reason to cancel", a "Cancel instead" link is shown.
// The computer keyboard also works (digits and Backspace).

import { useEffect } from "react";
import { getSip } from "@/data/sips";
import { currentScreen, inCancelPath, useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { checkNewAmount, formatRupees, MAX_AMOUNT_DIGITS, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Disclaimer, ScreenHeader } from "../phone/parts";
import { Keypad } from "../phone/Keypad";
import { PrimaryButton, TextButton } from "../phone/Sheet";

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
          className="flex h-[52px] items-center text-[44px] font-medium leading-none"
          aria-label={input ? `New amount ${formatRupees(Number(input))}` : "No amount entered"}
        >
          <span className={input ? "text-ink" : "text-ink-3"}>₹{input ? Number(input).toLocaleString("en-IN") : "0"}</span>
          <span className="ml-0.5 h-[43px] w-[2px] animate-pulse bg-button" aria-hidden />
        </p>
        <p className="mt-4 min-h-[20px] text-center text-[13px] text-loss" role="status">
          {error ?? ""}
        </p>
        {!error && (
          <p className="text-center text-[14px] text-ink-2">From {formatRupees(sip.minAmount)}. Your SIP stays active.</p>
        )}
      </div>

      <Keypad onPress={press} />

      <div className="px-4 pt-2">
        <PrimaryButton disabled={!ok} onClick={() => dispatch({ type: "go", screen: "lowerConfirm" })}>
          Continue
        </PrimaryButton>
        {inCancelPath(state) && (
          <TextButton onClick={() => dispatch({ type: "go", screen: "cancelConfirm" })}>Cancel instead</TextButton>
        )}
        <Disclaimer className={inCancelPath(state) ? "mt-1" : "mt-3"} />
        <div style={{ height: device.safeBottom + 8 }} aria-hidden />
      </div>
    </div>
  );
}
