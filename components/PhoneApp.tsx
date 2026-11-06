"use client";

// Decides what the phone shows. The bottom full screen is drawn first; every
// sheet opened after it (options, confirms, the redeem sheet) is drawn above
// it in order, each with its own dim layer, so a confirm sits over the dimmed
// options sheet. GR-1 goes on top of everything and closing it returns to
// what was there.

import { SHEETS, useDemo, type Screen } from "@/lib/demoState";
import HomeScreen from "./screens/HomeScreen";
import RedeemAmountScreen from "./screens/RedeemAmountScreen";
import RedeemSummaryScreen from "./screens/RedeemSummaryScreen";
import RedeemSheet from "./screens/RedeemSheet";
import RedeemDoneScreen from "./screens/RedeemDoneScreen";
import SipPickerSheet from "./screens/SipPickerSheet";
import SmartRedeemSheet from "./screens/SmartRedeemSheet";
import SipDetails from "./screens/SipDetails";
import OptionsSheet from "./screens/OptionsSheet";
import SkipConfirmSheet from "./screens/SkipConfirmSheet";
import DoneScreen from "./screens/DoneScreen";
import PauseScreen from "./screens/PauseScreen";
import LowerAmountScreen from "./screens/LowerAmountScreen";
import LowerConfirmSheet from "./screens/LowerConfirmSheet";
import CancelConfirmSheet from "./screens/CancelConfirmSheet";
import Gr1Sheet from "./screens/Gr1Sheet";

/** Index in the stack of the full screen that is showing (sheets sit on top of it). */
function baseIndex(stack: Screen[]): number {
  for (let i = stack.length - 1; i >= 0; i--) if (!SHEETS.includes(stack[i])) return i;
  return 0;
}

export function PhoneScreen() {
  const { state } = useDemo();
  const screen = state.stack[baseIndex(state.stack)];
  switch (screen) {
    case "home":
      return <HomeScreen />;
    case "redeemAmount":
      return <RedeemAmountScreen />;
    case "redeemSummary":
      return <RedeemSummaryScreen />;
    case "redeemDone":
      return <RedeemDoneScreen />;
    case "details":
      return <SipDetails />;
    case "pause":
      return <PauseScreen />;
    case "lower":
      return <LowerAmountScreen />;
    case "done":
      return <DoneScreen />;
    default:
      return null; // sheets are drawn by PhoneOverlay
  }
}

export function PhoneOverlay() {
  const { state } = useDemo();
  const sheets = state.stack.slice(baseIndex(state.stack) + 1);

  return (
    <>
      {sheets.map((sheet, i) => (
        <SheetFor key={`${sheet}-${i}`} sheet={sheet} stacked={i > 0} />
      ))}
      {state.gr1Open && <Gr1Sheet />}
    </>
  );
}

function SheetFor({ sheet, stacked }: { sheet: Screen; stacked: boolean }) {
  switch (sheet) {
    case "redeemSheet":
      return <RedeemSheet />;
    case "sipPicker":
      return <SipPickerSheet />;
    case "smartRedeem":
      return <SmartRedeemSheet />;
    case "options":
      return <OptionsSheet stacked={stacked} />;
    case "skipConfirm":
      return <SkipConfirmSheet />;
    case "lowerConfirm":
      return <LowerConfirmSheet />;
    case "cancelConfirm":
      return <CancelConfirmSheet />;
    default:
      return null;
  }
}
