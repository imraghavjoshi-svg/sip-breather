// Test log: one row each time a demo run reaches a Done screen (SIP option
// confirmed, or redemption placed).
// Kept only in this browser (localStorage). Every storage call is wrapped in
// try/catch so the app keeps working if storage is blocked; in that case rows
// are kept in memory until the page is closed.

import type { CancelReason, Decision, DecisionOption, DeviceKind, OptionsEntry } from "./types";

export type TestLogRow = {
  time: string; // ISO timestamp
  device: DeviceKind;
  option: DecisionOption | "redeem";
  /** Where SIP options were reached from: redeem sheet, Cancel SIP, or Edit SIP. */
  entry?: OptionsEntry;
  pauseMonths?: 1 | 2 | 3;
  newAmount?: number;
  cancelReason?: CancelReason;
  redeemAmount?: number;
  gr1Questions: number;
  /** The Smart Redeem intro sheet was shown in this run (rows saved before 7 Nov have no value). */
  smartRedeemSeen?: boolean;
};

const STORAGE_KEY = "sipBreather.testLog.v1";
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

const CSV_COLUMNS = [
  "time",
  "device",
  "option",
  "entry",
  "pause_months",
  "new_amount",
  "cancel_reason",
  "redeem_amount",
  "gr1_questions",
  "smart_redeem_seen",
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
      r.option,
      r.entry,
      r.pauseMonths,
      r.newAmount,
      r.cancelReason,
      r.redeemAmount,
      r.gr1Questions,
      r.smartRedeemSeen === undefined ? undefined : r.smartRedeemSeen ? "yes" : "no",
    ]
      .map(csvCell)
      .join(","),
  );
  return [CSV_COLUMNS.join(","), ...lines].join("\n");
}

/** Builds the row saved when a SIP option is confirmed. */
export function testLogRowFor(
  decision: Decision,
  device: DeviceKind,
  entry: OptionsEntry,
  gr1Questions: number,
  smartRedeemSeen: boolean,
): TestLogRow {
  const row: TestLogRow = {
    time: new Date().toISOString(),
    device,
    option: decision.option,
    entry,
    gr1Questions,
    smartRedeemSeen,
  };
  if (decision.pauseMonths) row.pauseMonths = decision.pauseMonths;
  if (decision.newAmount) row.newAmount = decision.newAmount;
  if (decision.cancelReason) row.cancelReason = decision.cancelReason;
  return row;
}

/** Builds the row saved when a redemption is placed. */
export function redeemLogRow(
  amount: number,
  device: DeviceKind,
  gr1Questions: number,
  smartRedeemSeen: boolean,
): TestLogRow {
  return {
    time: new Date().toISOString(),
    device,
    option: "redeem",
    entry: "redeem",
    redeemAmount: amount,
    gr1Questions,
    smartRedeemSeen,
  };
}
