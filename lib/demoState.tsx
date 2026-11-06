"use client";

// Everything the user does in one demo run, kept in memory only.
// Reset puts it back to the start. Nothing here is saved between visits.

import { createContext, useContext, type Dispatch } from "react";
import type {
  CancelReason,
  ChatMessage,
  Decision,
  DecisionOption,
  HomeTab,
  OptionsEntry,
  PauseMonths,
  StepTab,
} from "./types";

/** Every screen inside the phone. Sheets sit on top of the screen below them in the stack. */
export type Screen =
  | "home" // Groww MF home: For you / Dashboard / SIPs / Watchlist tabs
  | "redeemAmount" // Groww: Enter redeem amount
  | "smartRedeem" // Groww: Smart Redeem intro (sheet, over the amount screen)
  | "redeemSummary" // Groww: Redeem ₹X from N funds
  | "redeemSheet" // Groww: You are redeeming ₹X (sheet, over the summary) + our SIP card
  | "redeemDone" // Redemption placed
  | "sipPicker" // Which SIP? (sheet, over the redeem sheet, when both SIPs are affected)
  | "details" // SIP details
  | "options" // Options sheet
  | "skipConfirm" // small confirm sheet (over options)
  | "pause" // Pause
  | "lower" // Lower the amount
  | "lowerConfirm" // small confirm sheet (over lower)
  | "cancelConfirm" // Cancel confirm sheet (over options)
  | "done"; // Done

/** Screens drawn as bottom sheets over the screen below them. */
export const SHEETS: Screen[] = ["options", "skipConfirm", "cancelConfirm", "lowerConfirm", "redeemSheet", "sipPicker", "smartRedeem"];

export type DemoState = {
  /** Screens the user has opened, in order. The last one is showing. Back removes it. */
  stack: Screen[];
  /** Which top tab the home screen shows. */
  tab: HomeTab;
  sipId: string;
  /** Choices being made on the current screens, before they are confirmed. */
  draft: { pauseMonths: PauseMonths; amountInput: string; cancelReason?: CancelReason };
  /** Amount typed on the redeem keypad, e.g. "1000" or "250.5". */
  redeemInput: string;
  /** The Smart Redeem intro sheet was shown in this run (it opens by itself only the first time). */
  smartRedeemSeen: boolean;
  /** Set when the user confirms an option (one per demo run). */
  decision: Decision | null;
  /** GR-1 sheet, shown over whichever screen opened it. Closing returns there. */
  gr1Open: boolean;
  chat: ChatMessage[];
};

export const DEFAULT_SIP_ID = "sip_flexi";
/** Amount pre-filled when the "2. Redeem" step tab is used and nothing was typed. */
const STEP_REDEEM_AMOUNT = "1000";
const DEFAULT_DRAFT: DemoState["draft"] = { pauseMonths: 1, amountInput: "" };

export const INITIAL_STATE: DemoState = {
  stack: ["home"],
  tab: "dashboard",
  sipId: DEFAULT_SIP_ID,
  draft: DEFAULT_DRAFT,
  redeemInput: "",
  smartRedeemSeen: false,
  decision: null,
  gr1Open: false,
  chat: [],
};

export type DemoAction =
  | { type: "setTab"; tab: HomeTab }
  | { type: "openSip"; sipId: string }
  | { type: "startRedeem" }
  | { type: "openSipOptions"; sipId: string }
  | { type: "pickSip"; sipId: string }
  | { type: "go"; screen: Screen }
  | { type: "back" }
  | { type: "jumpToStep"; step: StepTab }
  | { type: "setPauseMonths"; months: PauseMonths }
  | { type: "setAmountInput"; value: string }
  | { type: "setRedeemInput"; value: string }
  | { type: "toggleCancelReason"; reason: CancelReason }
  | { type: "confirm"; option: DecisionOption }
  | { type: "confirmRedeem" }
  | { type: "backToSip" }
  | { type: "backToDashboard" }
  | { type: "openGr1" }
  | { type: "closeGr1" }
  | { type: "addChat"; message: ChatMessage }
  | { type: "newChat" }
  | { type: "reset" };

const REDEEM_STACK: Screen[] = ["home", "redeemAmount", "redeemSummary", "redeemSheet"];
const STEP_STACKS: Record<StepTab, Screen[]> = {
  dashboard: ["home"],
  redeem: REDEEM_STACK,
  options: [...REDEEM_STACK, "options"],
  cancel: [...REDEEM_STACK, "options", "cancelConfirm"],
};

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "setTab":
      return { ...state, tab: action.tab };
    case "openSip":
      return { ...state, sipId: action.sipId, stack: ["home", "details"], draft: DEFAULT_DRAFT };
    case "startRedeem":
      // A new redemption always starts with an empty amount. The Smart Redeem
      // intro opens by itself the first time in a demo run.
      return {
        ...state,
        stack: state.smartRedeemSeen
          ? [...state.stack, "redeemAmount"]
          : [...state.stack, "redeemAmount", "smartRedeem"],
        redeemInput: "",
        smartRedeemSeen: true,
      };
    case "openSipOptions":
      return { ...state, sipId: action.sipId, stack: [...state.stack, "options"], draft: DEFAULT_DRAFT };
    case "pickSip": {
      // The picker is replaced by the options sheet, so Back returns to the redeem sheet.
      const base = state.stack[state.stack.length - 1] === "sipPicker" ? state.stack.slice(0, -1) : state.stack;
      return { ...state, sipId: action.sipId, stack: [...base, "options"], draft: DEFAULT_DRAFT };
    }
    case "go":
      return {
        ...state,
        stack: [...state.stack, action.screen],
        smartRedeemSeen: state.smartRedeemSeen || action.screen === "smartRedeem",
      };
    case "back":
      return state.stack.length > 1 ? { ...state, stack: state.stack.slice(0, -1) } : state;
    case "jumpToStep": {
      const usesRedeem = action.step !== "dashboard";
      return {
        ...state,
        stack: STEP_STACKS[action.step],
        tab: "dashboard",
        sipId: usesRedeem ? DEFAULT_SIP_ID : state.sipId,
        redeemInput: usesRedeem && !state.redeemInput ? STEP_REDEEM_AMOUNT : state.redeemInput,
        gr1Open: false,
      };
    }
    case "setPauseMonths":
      return { ...state, draft: { ...state.draft, pauseMonths: action.months } };
    case "setAmountInput":
      return { ...state, draft: { ...state.draft, amountInput: action.value } };
    case "setRedeemInput":
      return { ...state, redeemInput: action.value };
    case "toggleCancelReason":
      return {
        ...state,
        draft: {
          ...state.draft,
          cancelReason: state.draft.cancelReason === action.reason ? undefined : action.reason,
        },
      };
    case "confirm": {
      const decision: Decision = { sipId: state.sipId, option: action.option };
      if (action.option === "pause") decision.pauseMonths = state.draft.pauseMonths;
      if (action.option === "lower") decision.newAmount = Number(state.draft.amountInput);
      if (action.option === "cancel" && state.draft.cancelReason) decision.cancelReason = state.draft.cancelReason;
      return { ...state, decision, stack: [...state.stack, "done"], gr1Open: false };
    }
    case "confirmRedeem":
      return { ...state, stack: [...state.stack, "redeemDone"], gr1Open: false };
    case "backToSip":
      return { ...state, stack: ["home", "details"], draft: DEFAULT_DRAFT };
    case "backToDashboard":
      return { ...state, stack: ["home"], tab: "dashboard", redeemInput: "" };
    case "openGr1":
      return { ...state, gr1Open: true };
    case "closeGr1":
      return { ...state, gr1Open: false };
    case "addChat":
      return { ...state, chat: [...state.chat, action.message] };
    case "newChat":
      return { ...state, chat: [] };
    case "reset":
      return INITIAL_STATE;
  }
}

export function currentScreen(state: DemoState): Screen {
  return state.stack[state.stack.length - 1];
}

/** Which toolbar step tab is lit for the screen that is showing. */
export function stepForScreen(screen: Screen): StepTab {
  switch (screen) {
    case "home":
    case "details":
      return "dashboard";
    case "redeemAmount":
    case "smartRedeem":
    case "redeemSummary":
    case "redeemSheet":
    case "redeemDone":
      return "redeem";
    case "cancelConfirm":
    case "done":
      return "cancel";
    default:
      return "options";
  }
}

/** Where the SIP options were reached from in this path (for the test log). */
export function optionsEntry(state: DemoState): OptionsEntry {
  if (state.stack.includes("redeemSheet")) return "redeem";
  if (state.stack.includes("options")) return "cancel";
  return "edit"; // "Edit SIP" on SIP details, straight to Lower the amount
}

/** How many questions the user asked GR-1 in this run (for the test log). */
export function gr1QuestionCount(state: DemoState): number {
  return state.chat.filter((m) => m.role === "user").length;
}

/** Reviewer settings from the toolbar. They are not part of a demo run, so Reset keeps them. */
export type ReviewSettings = { simulateFailure: boolean };

const DemoContext = createContext<{
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  settings: ReviewSettings;
} | null>(null);
export const DemoProvider = DemoContext.Provider;

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoProvider");
  return ctx;
}
