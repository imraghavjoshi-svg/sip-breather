// Test log: one row each time a demo run finishes: a Done screen (skip,
// pause, lower, cancel), "Redemption placed", or a skip confirmed on SIP
// details (which has no Done screen).
// Kept only in this browser (localStorage). Every storage call is wrapped in
// try/catch so the app keeps working if storage is blocked; in that case rows
// are kept in memory until the page is closed.
//
// Columns changed with the classic redesign (7 Nov), so rows use a new
// storage key; rows saved before that stay in the old key and are not shown.

import type { CancelReason, DeviceKind, Entry, FinalChoice, PauseMonths } from "./types";

export type TestLogRow = {
  time: string; // ISO timestamp
  device: DeviceKind;
  /** Where the run started: redeem flow, Cancel SIP, or SIP details. */
  entry: Entry;
  /** Reason picked on "Choose your reason to cancel this SIP" (cancel path only). */
  cancelReason?: CancelReason;
  /** What the run ended with. */
  finalChoice: FinalChoice;
  pauseMonths?: PauseMonths;
  newAmount?: number;
  redeemAmount?: number;
  gr1Questions: number;
};

const STORAGE_KEY = "sipBreather.testLog.v2";
let memoryRows: TestLogRow[] = [];

export function readTestLog(): TestLogRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return memoryRows;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TestLogRow[]) : memoryRows;
  } catch {
    return memoryRows;
  }
}

export function addTestLogRow(row: TestLogRow): void {
  memoryRows = [...readTestLog(), row];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryRows));
  } catch {
    // Storage blocked or full: the row stays in memory only.
  }
}

export function clearTestLog(): void {
  memoryRows = [];
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: memory is already cleared.
  }
}

export const ENTRY_LABELS: Record<Entry, string> = {
  redeem: "Redeem",
  cancel: "Cancel SIP",
  sip_details: "SIP details",
};

export const REASON_LABELS: Record<CancelReason, string> = {
  returns: "Not satisfied with returns",
  withdraw: "Want to withdraw money",
  pause: "Want to pause investing",
  change: "Want to change SIP amount/date",
  goal: "Goal is completed",
  other: "Other reason to cancel",
};

export const CHOICE_LABELS: Record<FinalChoice, string> = {
  redeem_only: "Redeem only",
  skip: "Skip",
  pause: "Pause",
  lower: "Lower",
  cancel: "Cancel",
};

const CSV_COLUMNS = [
  "time",
  "device",
  "entry",
  "cancel_reason",
  "final_choice",
  "pause_months",
  "new_amount",
  "redeem_amount",
  "gr1_questions",
] as const;

function csvCell(value: string | number | undefined): string {
  const text = value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const DEVICE_NAMES: Record<DeviceKind, string> = { iphone: "iOS", pixel: "Android", frameless: "Frameless" };

/** "2026-11-06 23:46:52" in the tester's local time (easy to sort in a spreadsheet). */
function localTime(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function testLogToCsv(rows: TestLogRow[]): string {
  const lines = rows.map((r) =>
    [
      localTime(r.time),
      DEVICE_NAMES[r.device] ?? r.device,
      r.entry,
      r.cancelReason,
      r.finalChoice,
      r.pauseMonths,
      r.newAmount,
      r.redeemAmount,
      r.gr1Questions,
    ]
      .map(csvCell)
      .join(","),
  );
  return [CSV_COLUMNS.join(","), ...lines].join("\n");
}
