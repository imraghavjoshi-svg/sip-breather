"use client";

// "Change amount/date" (opened from SIP details, the cancel reason "Want to
// change SIP amount/date", or Lower on Compare), in classic Groww's style.
// Two segments at the top:
//   Amount: big amount + on-screen keypad (whole rupees, no "." key). Inline
//     messages: below the minimum, or not lower than now. Laptop digits and
//     Backspace also work.
//   Date: "Choose your SIP date", a grid of dates 1–28 (current date outlined,
//     selected date filled green) and a line with the next instalment on the
//     real calendar. A new date less than 5 days away starts from the
//     following month and the next instalment on the old date stays (R12).
// Both can be changed in the same visit; Continue opens one confirm sheet
// showing both. When reached from "Choose your reason to cancel", a "Cancel
// instead" link is shown.

import { useEffect } from "react";
import { getSip } from "@/data/sips";
import { currentScreen, inCancelPath, useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { dateChangeStart, formatDayMonth, formatFullDate, nextInstalment, ordinal } from "@/lib/dates";
import { checkNewAmount, formatRupees, MAX_AMOUNT_DIGITS, sipView } from "@/lib/sip";
import { useToday } from "@/lib/today";
import { Disclaimer, ScreenHeader } from "../phone/parts";
import { Keypad } from "../phone/Keypad";
import { PrimaryButton, TextButton } from "../phone/Sheet";

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

/** Whether Continue can be pressed: something valid changed, and nothing invalid is typed. */
export function changeReady(amountInput: string, amountOk: boolean, newDay: number | undefined, currentDay: number) {
  const dateChanged = newDay !== undefined && newDay !== currentDay;
  return (amountInput === "" || amountOk) && (amountOk || dateChanged);
}

export default function LowerAmountScreen() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const device = useDevice();
  const sip = getSip(state.sipId);
  const view = sipView(sip, state.decision, today);
  const current = view.monthlyAmount;
  const currentDay = view.instalmentDay;
  const { amountInput: input, changeTab: tab, newDay } = state.draft;
  const { ok, error } = checkNewAmount(input, current, sip.minAmount);
  const ready = changeReady(input, ok, newDay, currentDay);
  const isTopScreen = currentScreen(state) === "lower" && !state.gr1Open;
  const next = () => ready && dispatch({ type: "go", screen: "lowerConfirm" });

  function press(key: string) {
    if (key === "back") return dispatch({ type: "setAmountInput", value: input.slice(0, -1) });
    if (input.length >= MAX_AMOUNT_DIGITS) return;
    if (input === "" && key === "0") return; // no leading zero
    dispatch({ type: "setAmountInput", value: input + key });
  }

  // Typing on the laptop keyboard: only on the Amount segment, while this screen is on top.
  useEffect(() => {
    if (!isTopScreen || tab !== "amount") return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("back");
      else if (e.key === "Enter") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader
        title={tab === "amount" ? "Enter new monthly amount" : "Choose your SIP date"}
        subtitle={tab === "amount" ? `Currently ${formatRupees(current)}` : `Currently the ${ordinal(currentDay)} of every month`}
        onBack={() => dispatch({ type: "back" })}
      />

      {/* Amount / Date segments, classic Groww tab style */}
      <div className="flex border-b border-line-soft px-4" role="tablist" aria-label="What to change">
        {(["amount", "date"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => dispatch({ type: "setChangeTab", tab: t })}
            className={`flex-1 border-b-[3px] pb-2.5 pt-1.5 text-[15px] transition-colors ${
              tab === t ? "border-ink font-medium text-ink" : "border-transparent text-ink-2 hover:text-ink"
            }`}
          >
            {t === "amount" ? "Amount" : "Date"}
          </button>
        ))}
      </div>

      {tab === "amount" ? (
        <>
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
        </>
      ) : (
        <DatePicker currentDay={currentDay} newDay={newDay} today={today} />
      )}

      <div className="px-4 pt-2">
        <PrimaryButton disabled={!ready} onClick={next}>
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

function DatePicker({ currentDay, newDay, today }: { currentDay: number; newDay: number | undefined; today: Date }) {
  const { dispatch } = useDemo();
  const changed = newDay !== undefined && newDay !== currentDay;
  const start = changed ? dateChangeStart(currentDay, newDay, today) : null;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-5">
      <div className="grid grid-cols-7 gap-y-2.5" role="radiogroup" aria-label="SIP date">
        {DAYS.map((d) => {
          const selected = changed && d === newDay;
          const isCurrent = d === currentDay;
          return (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={selected || (!changed && isCurrent)}
              aria-label={`${ordinal(d)}${isCurrent ? " (current date)" : ""}`}
              onClick={() => dispatch({ type: "setNewDay", day: d === currentDay ? undefined : d })}
              className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full text-[19px] transition-colors ${
                selected
                  ? "bg-button font-bold text-white"
                  : isCurrent
                    ? "border-2 border-ink text-ink"
                    : "text-ink hover:bg-line-soft"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl bg-[#F6FCF9] px-[15px] py-3 text-[14px] leading-snug text-ink-2" role="status">
        {!start ? (
          <>
            Next instalment: <b className="font-medium text-ink">{formatFullDate(nextInstalment(currentDay, today))}</b>. Tap a
            date to change it.
          </>
        ) : start.oldInstalmentStays ? (
          <>
            Your next instalment on <b className="font-medium text-ink">{formatDayMonth(start.oldInstalmentStays)}</b> stays as it
            is. The new date starts from <b className="font-medium text-ink">{formatDayMonth(start.firstOnNewDay)}</b>.
          </>
        ) : (
          <>
            Next instalment: <b className="font-medium text-ink">{formatFullDate(start.firstOnNewDay)}</b>
          </>
        )}
      </div>
      <p className="mt-2 text-[12px] text-ink-3">Dates 1 to 28 are available, so every month has your date.</p>
    </div>
  );
}
