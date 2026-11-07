"use client";

// Redeem amount: copy of classic Groww's screen (classic_redeem_amount,
// classic_redeem_amount_100). One fund at a time. Minimum ₹100, maximum what
// is available in this fund. "Proceed" stays grey until the amount is valid.
// The laptop keyboard also works.

import { useEffect } from "react";
import { ChevronDown, Info, Landmark, Settings } from "lucide-react";
import { getSip } from "@/data/sips";
import { currentScreen, useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { expectedTransferDate, formatDayMonthYear } from "@/lib/dates";
import { availableToRedeem, BANK_LABEL, checkRedeemAmount, pressRedeemKey } from "@/lib/redeem";
import { useToday } from "@/lib/today";
import { Disclaimer, ScreenHeader } from "../phone/parts";
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
  const today = useToday();
  const sip = getSip(state.sipId);
  const available = availableToRedeem(sip.id);
  const input = state.redeemInput;
  const { ok, error } = checkRedeemAmount(input, available);
  const redeemAll = input !== "" && Number(input) === available;
  const isTopScreen = currentScreen(state) === "redeemAmount" && !state.gr1Open;

  const press = (key: string) => dispatch({ type: "setRedeemInput", value: pressRedeemKey(input, key) });
  const next = () => ok && dispatch({ type: "go", screen: "redeemSheet" });

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
        title={`Redeem ${sip.fundName}`}
        subtitle={
          <span className="flex items-center gap-1.5">
            ₹{available.toLocaleString("en-IN")} available <Info size={13} aria-hidden />
          </span>
        }
        onBack={() => dispatch({ type: "back" })}
        right={<Settings size={22} className="shrink-0 text-ink" aria-hidden />}
      />

      <div className="flex flex-col items-center pt-[58px]">
        <p
          className="flex h-[52px] items-center text-[44px] font-medium leading-none text-ink"
          aria-label={input ? `Redeem amount ₹${displayAmount(input)}` : "No amount entered"}
        >
          ₹{input ? displayAmount(input) : ""}
          <span className="ml-0.5 h-[43px] w-[2px] animate-pulse bg-button" aria-hidden />
        </p>
        <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-[15px] text-ink-2">
          <input
            type="checkbox"
            checked={redeemAll}
            onChange={(e) => dispatch({ type: "setRedeemInput", value: e.target.checked ? String(available) : "" })}
            className="h-4 w-4 cursor-pointer accent-[#00a67e]"
          />
          Redeem All
        </label>
        <p className="mt-3 min-h-[20px] text-center text-[13px] text-loss" role="status">
          {error ?? ""}
        </p>
      </div>

      <div className="flex-1" />

      {/* Bank row: never a real bank name or account number. */}
      <div className="flex items-center gap-3.5 border-y border-line px-4 py-3">
        <span className="flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full border border-line text-ink-2" aria-hidden>
          <Landmark size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-ink">{BANK_LABEL}</p>
          <p className="mt-0.5 text-[13px] text-ink-2">
            Expected transfer by {formatDayMonthYear(expectedTransferDate(today))}
          </p>
        </div>
        <ChevronDown size={18} className="text-ink-2" aria-hidden />
      </div>

      <div className="pt-1">
        <Keypad onPress={press} allowDecimal />
      </div>

      <div className="px-4 pt-2">
        <PrimaryButton disabled={!ok} onClick={next}>
          Proceed
        </PrimaryButton>
        <Disclaimer className="mt-2" />
        <div style={{ height: device.safeBottom + 4 }} aria-hidden />
      </div>
    </div>
  );
}
