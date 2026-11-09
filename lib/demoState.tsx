"use client";

// Everything the user does in one demo run, kept in memory only.
// Reset puts it back to the start. Nothing here is saved between visits.

import { createContext, useContext, type Dispatch } from "react";
import type {
  CancelReason,
  ChatMessage,
  Decision,
  DecisionOption,
  Entry,
  FinalChoice,
  HomeTab,
  PauseMonths,
  StepTab,
} from "./types";

/** Every screen inside the phone. Sheets sit on top of the screen below them in the stack. */
export type Screen =
  | "home" // classic Groww MF home: Explore / Dashboard / SIPs / Watchlist tabs
  | "fundSheet" // classic Groww: fund sheet (over Dashboard): Redeem / Investment details
  | "redeemAmount" // classic Groww: Redeem <fund> amount + keypad
  | "redeemSheet" // classic Groww: You are redeeming ₹X (sheet, over the amount) + our YOUR SIP card
  | "redeemDone" // Redemption placed
  | "details" // classic Groww: SIP details
  | "skipConfirm" // small confirm sheet (over the redeem sheet, SIP details or the withdraw answer)
  | "cancelReasons" // classic Groww: Choose your reason to cancel this SIP
  | "withdrawAnswer" // NEW: "Withdrawing and cancelling are different" (sheet, over the reasons)
  | "returnsAnswer" // NEW: "How SIP returns work" (sheet, over the reasons)
  | "compare" // NEW: "Compare your options" / "Your next 12 months"
  | "pause" // Pause
  | "lower" // Lower the amount
  | "lowerConfirm" // small confirm sheet (over lower)
  | "cancelConfirm" // Cancel confirm sheet
  | "done"; // Done

/** Screens drawn as bottom sheets over the screen below them. */
export const SHEETS: Screen[] = [
  "fundSheet",
  "skipConfirm",
  "cancelConfirm",
  "lowerConfirm",
  "redeemSheet",
  "withdrawAnswer",
  "returnsAnswer",
];

/**
 * "redeem": the YOUR SIP card; "returns": the "How SIP returns work" answer;
 * "compare": "Explain this" on Compare (questions carry the comparison); "other": anywhere else.
 */
export type Gr1From = "redeem" | "returns" | "compare" | "other";

/** What the user set on the Compare screen (pause length, lower amount as typed). */
export type CompareDraft = { pauseMonths: PauseMonths; lowerInput: string };
const DEFAULT_COMPARE_DRAFT: CompareDraft = { pauseMonths: 2, lowerInput: "200" };

export type DemoState = {
  /** Screens the user has opened, in order. The last one is showing. Back removes it. */
  stack: Screen[];
  /** Which top tab the home screen shows. */
  tab: HomeTab;
  sipId: string;
  /** Choices being made on the current screens, before they are confirmed. */
  draft: {
    pauseMonths: PauseMonths;
    amountInput: string;
    cancelReason?: CancelReason;
    /** "Change amount/date": which segment is showing, and the new date picked (1–28). */
    changeTab: "amount" | "date";
    newDay?: number;
  };
  /** Amount typed on the redeem keypad, e.g. "1000" or "250.5". */
  redeemInput: string;
  /** Set when the user confirms an option (one per demo run). */
  decision: Decision | null;
  /** GR-1 sheet, shown over whichever screen opened it. Closing returns there. */
  gr1Open: boolean;
  /** Where GR-1 was opened from: decides its suggested questions. */
  gr1From: Gr1From;
  /** A question GR-1 asks by itself when it opens ("Explain this" on Compare). */
  gr1Ask: string | null;
  chat: ChatMessage[];
  compare: CompareDraft;
  /** Compare was opened in this run (for the test log; cleared when a row is saved). */
  compareOpened: boolean;
  /** Dashboard view toggles: eye icon (hide ₹ amounts) and "<> XIRR" (XIRR % or returns in ₹). */
  dashboard: { amountsHidden: boolean; showReturns: boolean };
};

export const DEFAULT_SIP_ID = "sip_flexi";
/** Amount pre-filled when the "2. Redeem" step tab is used and nothing was typed (Flexi Cap). */
const STEP_REDEEM_AMOUNT = "1000";
const DEFAULT_DRAFT: DemoState["draft"] = { pauseMonths: 1, amountInput: "", changeTab: "amount" };

export const INITIAL_STATE: DemoState = {
  stack: ["home"],
  tab: "dashboard",
  sipId: DEFAULT_SIP_ID,
  draft: DEFAULT_DRAFT,
  redeemInput: "",
  decision: null,
  gr1Open: false,
  gr1From: "other",
  gr1Ask: null,
  chat: [],
  compare: DEFAULT_COMPARE_DRAFT,
  compareOpened: false,
  dashboard: { amountsHidden: false, showReturns: false },
};

export type DemoAction =
  | { type: "setTab"; tab: HomeTab }
  | { type: "openSip"; sipId: string }
  | { type: "openFund"; sipId: string }
  | { type: "startRedeem" }
  /** "Withdraw money, keep SIP": this SIP's fund, straight to its Redeem amount screen. */
  | { type: "withdrawKeepSip" }
  /** "Need longer? Pause …" on the Skip sheet: closes it and opens Pause for the same SIP. */
  | { type: "skipToPause" }
  | { type: "go"; screen: Screen }
  | { type: "back" }
  | { type: "jumpToStep"; step: StepTab }
  /** "Try it" link in the About panel: SIP details with GR-1 open. */
  | { type: "jumpToGr1" }
  | { type: "pickReason"; reason: CancelReason }
  | { type: "setPauseMonths"; months: PauseMonths }
  | { type: "setAmountInput"; value: string }
  | { type: "setChangeTab"; tab: "amount" | "date" }
  | { type: "setNewDay"; day: number | undefined }
  | { type: "setRedeemInput"; value: string }
  | { type: "confirm"; option: DecisionOption }
  | { type: "confirmSkip" }
  | { type: "confirmRedeem" }
  | { type: "backToSip" }
  | { type: "backToDashboard" }
  | { type: "openGr1"; from?: Gr1From; ask?: string }
  | { type: "clearGr1Ask" }
  | { type: "openCompare" }
  | { type: "setComparePause"; months: PauseMonths }
  | { type: "setCompareLower"; value: string }
  /** Tapping an option card on Compare: goes to that option's existing flow ("keep" goes back). */
  | { type: "compareChoose"; option: "keep" | DecisionOption }
  /** Sent by the shell after a Test log row is saved: the next run starts fresh. */
  | { type: "runLogged" }
  | { type: "closeGr1" }
  | { type: "addChat"; message: ChatMessage }
  | { type: "newChat" }
  /** Dashboard eye icon: hide or show ₹ amounts. */
  | { type: "toggleAmounts" }
  /** Dashboard "<> XIRR": switch fund rows between XIRR % and returns in ₹. */
  | { type: "toggleReturnsView" }
  | { type: "reset" };

/** Where each toolbar step tab jumps to (always with Sample Flexi Cap). */
const STEP_STACKS: Record<StepTab, { stack: Screen[]; tab: HomeTab }> = {
  dashboard: { stack: ["home"], tab: "dashboard" },
  redeem: { stack: ["home", "redeemAmount", "redeemSheet"], tab: "dashboard" },
  reasons: { stack: ["home", "details", "cancelReasons"], tab: "sips" },
  answer: { stack: ["home", "details", "cancelReasons", "withdrawAnswer"], tab: "sips" },
  compare: { stack: ["home", "details", "compare"], tab: "sips" },
};

/** What each cancel reason opens (classic_redesign.md, screen 9). */
const REASON_SCREEN: Record<CancelReason, Screen> = {
  withdraw: "withdrawAnswer",
  returns: "returnsAnswer",
  pause: "pause",
  change: "lower",
  goal: "cancelConfirm",
  other: "cancelConfirm",
};

/** Screens where a confirmed skip returns to the same screen (it shows "skipped" there). */
const SKIP_IN_PLACE: Screen[] = ["redeemSheet", "details"];

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "setTab":
      return { ...state, tab: action.tab };
    case "openSip":
      return { ...state, sipId: action.sipId, stack: ["home", "details"], draft: DEFAULT_DRAFT };
    case "openFund":
      return { ...state, sipId: action.sipId, stack: [...state.stack, "fundSheet"], draft: DEFAULT_DRAFT };
    case "startRedeem": {
      // The fund sheet closes behind the amount screen, so Back returns to the
      // Dashboard. A new redemption always starts with an empty amount.
      const base = currentScreen(state) === "fundSheet" ? state.stack.slice(0, -1) : state.stack;
      return { ...state, stack: [...base, "redeemAmount"], redeemInput: "" };
    }
    case "withdrawKeepSip":
      // Opened over the withdraw answer or SIP details ("Need money? Withdraw from this fund"),
      // so Back returns there. Never
      // goes through the Dashboard or the fund sheet; same fund as the SIP.
      return {
        ...state,
        stack: [...state.stack.filter((s) => s !== "fundSheet"), "redeemAmount"],
        redeemInput: "",
        gr1Open: false,
      };
    case "skipToPause": {
      // The Skip sheet closes behind Pause, so Back returns to where Skip was opened.
      const base = currentScreen(state) === "skipConfirm" ? state.stack.slice(0, -1) : state.stack;
      return { ...state, stack: [...base, "pause"], draft: { ...state.draft, pauseMonths: 1 } };
    }
    case "go":
      return { ...state, stack: [...state.stack, action.screen] };
    case "back":
      return state.stack.length > 1 ? { ...state, stack: state.stack.slice(0, -1) } : state;
    case "jumpToStep": {
      const { stack, tab } = STEP_STACKS[action.step];
      return {
        ...state,
        stack,
        tab,
        sipId: action.step === "dashboard" ? state.sipId : DEFAULT_SIP_ID,
        redeemInput: action.step === "redeem" && !state.redeemInput ? STEP_REDEEM_AMOUNT : state.redeemInput,
        draft: action.step === "answer" ? { ...DEFAULT_DRAFT, cancelReason: "withdraw" } : DEFAULT_DRAFT,
        gr1Open: false,
        compareOpened: state.compareOpened || action.step === "compare",
      };
    }
    case "jumpToGr1":
      return {
        ...state,
        stack: ["home", "details"],
        tab: "sips",
        sipId: DEFAULT_SIP_ID,
        draft: DEFAULT_DRAFT,
        gr1Open: true,
        gr1From: "other",
      };
    case "pickReason":
      return {
        ...state,
        draft: { ...DEFAULT_DRAFT, cancelReason: action.reason },
        stack: [...state.stack, REASON_SCREEN[action.reason]],
      };
    case "setPauseMonths":
      return { ...state, draft: { ...state.draft, pauseMonths: action.months } };
    case "setAmountInput":
      return { ...state, draft: { ...state.draft, amountInput: action.value } };
    case "setChangeTab":
      return { ...state, draft: { ...state.draft, changeTab: action.tab } };
    case "setNewDay":
      return { ...state, draft: { ...state.draft, newDay: action.day } };
    case "setRedeemInput":
      return { ...state, redeemInput: action.value };
    case "confirm": {
      const decision: Decision = { sipId: state.sipId, option: action.option };
      if (action.option === "pause") decision.pauseMonths = state.draft.pauseMonths;
      if (action.option === "lower") decision.newAmount = Number(state.draft.amountInput);
      if ((action.option === "lower" || action.option === "date") && state.draft.newDay) decision.newDay = state.draft.newDay;
      if (state.draft.cancelReason) decision.cancelReason = state.draft.cancelReason;
      return { ...state, decision, stack: [...state.stack, "done"], gr1Open: false };
    }
    case "confirmSkip": {
      // From the redeem sheet or SIP details: back to that screen, which now
      // shows the instalment as skipped. From Compare opened on the redeem
      // sheet: back to the redeem sheet (Compare closes). Otherwise: Done.
      const n = state.stack.length;
      if (state.stack[n - 2] === "compare" && state.stack[n - 3] === "redeemSheet") {
        return { ...state, decision: { sipId: state.sipId, option: "skip" }, stack: state.stack.slice(0, -2) };
      }
      if (!skipsInPlace(state)) return demoReducer(state, { type: "confirm", option: "skip" });
      return { ...state, decision: { sipId: state.sipId, option: "skip" }, stack: state.stack.slice(0, -1) };
    }
    case "openCompare":
      return { ...state, stack: [...state.stack, "compare"], compareOpened: true };
    case "setComparePause":
      return { ...state, compare: { ...state.compare, pauseMonths: action.months } };
    case "setCompareLower":
      return { ...state, compare: { ...state.compare, lowerInput: action.value } };
    case "compareChoose":
      switch (action.option) {
        case "keep":
          return { ...state, stack: state.stack.slice(0, -1) };
        case "skip":
          return { ...state, stack: [...state.stack, "skipConfirm"] };
        case "pause":
          return {
            ...state,
            draft: { ...state.draft, pauseMonths: state.compare.pauseMonths },
            stack: [...state.stack, "pause"],
          };
        case "lower":
          return {
            ...state,
            draft: { ...state.draft, amountInput: state.compare.lowerInput },
            stack: [...state.stack, "lower"],
          };
        case "cancel":
          return { ...state, stack: [...state.stack, "cancelConfirm"] };
      }
      return state;
    case "runLogged":
      return { ...state, compareOpened: false };
    case "confirmRedeem":
      return { ...state, stack: [...state.stack, "redeemDone"], gr1Open: false };
    case "backToSip":
      return { ...state, stack: ["home", "details"], draft: DEFAULT_DRAFT };
    case "backToDashboard":
      return { ...state, stack: ["home"], tab: "dashboard", redeemInput: "", draft: DEFAULT_DRAFT };
    case "openGr1":
      return { ...state, gr1Open: true, gr1From: action.from ?? "other", gr1Ask: action.ask ?? null };
    case "clearGr1Ask":
      return { ...state, gr1Ask: null };
    case "closeGr1":
      return { ...state, gr1Open: false };
    case "addChat":
      return { ...state, chat: [...state.chat, action.message] };
    case "newChat":
      return { ...state, chat: [] };
    case "toggleAmounts":
      return { ...state, dashboard: { ...state.dashboard, amountsHidden: !state.dashboard.amountsHidden } };
    case "toggleReturnsView":
      return { ...state, dashboard: { ...state.dashboard, showReturns: !state.dashboard.showReturns } };
    case "reset":
      return INITIAL_STATE;
  }
}

export function currentScreen(state: DemoState): Screen {
  return state.stack[state.stack.length - 1];
}

/** True when the skip confirm is open over a screen that shows the skip in place. */
export function skipsInPlace(state: DemoState): boolean {
  return currentScreen(state) === "skipConfirm" && SKIP_IN_PLACE.includes(state.stack[state.stack.length - 2]);
}

/** True when this screen was reached from "Choose your reason to cancel" (shows "Cancel instead"). */
export function inCancelPath(state: DemoState): boolean {
  return state.stack.includes("cancelReasons");
}

/** Which toolbar step tab is lit for the screen that is showing. */
export function stepForScreen(screen: Screen): StepTab {
  switch (screen) {
    case "home":
    case "fundSheet":
    case "details":
      return "dashboard";
    case "redeemAmount":
    case "redeemSheet":
    case "redeemDone":
      return "redeem";
    case "cancelReasons":
      return "reasons";
    case "compare":
      return "compare";
    default:
      return "answer";
  }
}

// ---------- Test log helpers ----------

/** Where this run started: Cancel SIP, the redeem flow from the Dashboard, or SIP details. */
export function runEntry(state: DemoState): Entry {
  if (state.stack.includes("cancelReasons")) return "cancel";
  if (state.stack.includes("redeemAmount")) return "redeem";
  return "sip_details";
}

/** What a finished run ended with, read from the state after the last step. */
export function finalChoice(after: DemoState): FinalChoice | null {
  const top = currentScreen(after);
  const d = after.decision;
  if (top === "redeemDone") return d && d.sipId === after.sipId && d.option === "skip" ? "skip" : "redeem_only";
  if (top === "done" && d) return d.option;
  return null;
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
