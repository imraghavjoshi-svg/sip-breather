"use client";

// Redeem step a: copy of Groww's "Enter redeem amount" (groww_redeem_amount /
// groww_redeem_min_error). The "How Smart Redeem works" banner
// opens the Smart Redeem intro sheet. The laptop keyboard also works.

import { useEffect } from "react";
import { Info } from "lucide-react";
import { currentScreen, useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { availableToRedeem, checkRedeemAmount, pressRedeemKey } from "@/lib/redeem";
import { formatRupees } from "@/lib/sip";
import { DiamondIcon, Disclaimer, ScreenHeader } from "../phone/parts";
import { Keypad } from "../phone/Keypad";
import { PrimaryButton } from "../phone/Sheet";

/** "1,000" or "1,250.5" while typing. */
function displayAmount(input: string): string {
  const [whole, decimals] = input.split(".");
  const grouped = Number(whole || "0").toLocaleString("en-IN");
  return decimals === undefined ? grouped : `${grouped}.${decimals}`;
}

export default function RedeemAmountScreen() {
  const { state, dispatch } = useDemo();
  const device = useDevice();
  const input = state.redeemInput;
  const { ok, error } = checkRedeemAmount(input);
  const isTopScreen = currentScreen(state) === "redeemAmount" && !state.gr1Open;

  const press = (key: string) => dispatch({ type: "setRedeemInput", value: pressRedeemKey(input, key) });
  const next = () => ok && dispatch({ type: "go", screen: "redeemSummary" });

  useEffect(() => {
    if (!isTopScreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (/^[0-9.]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("back");
      else if (e.key === "Enter") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader
        title="Enter redeem amount"
        subtitle={`${formatRupees(availableToRedeem())} available`}
        onBack={() => dispatch({ type: "back" })}
      />

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <p
          className="flex items-center text-[56px] font-medium leading-none tracking-tight text-[#44475B]"
          aria-label={input ? `Redeem amount ₹${displayAmount(input)}` : "No amount entered"}
        >
          <span className="mr-1 text-[44px]">₹</span>
          <span className={input ? "" : "text-[#9A9CA8]"}>{input ? displayAmount(input) : "0"}</span>
          <span className="ml-1 h-[52px] w-[2px] animate-pulse rounded-full bg-groww-blue" aria-hidden />
        </p>
        <p className="mt-4 min-h-[22px] text-center text-[15px] font-medium text-error" role="status">
          {error ?? ""}
        </p>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: "go", screen: "smartRedeem" })}
        className="mx-4 mb-2 flex items-center justify-between rounded-xl bg-groww-blue-tint px-4 py-3.5 text-left hover:bg-[#E3E8FF]"
      >
        <span className="flex items-center gap-3 text-[14px] font-medium text-groww-blue-text">
          <DiamondIcon symbol="plain" size={17} />
          How Smart Redeem works
        </span>
        <Info size={18} className="text-groww-blue-text" aria-hidden />
      </button>

      <Keypad onPress={press} allowDecimal />

      <div className="px-4 pt-3">
        <PrimaryButton tone="blue" disabled={!ok} onClick={next}>
          Continue
        </PrimaryButton>
        <Disclaimer className="mt-2" />
        <div style={{ height: device.safeBottom + 6 }} aria-hidden />
      </div>
    </div>
  );
}
