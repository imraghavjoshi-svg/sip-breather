"use client";

import { useEffect, useState } from "react";
import { Download, Trash2, X } from "lucide-react";
import {
  CHOICE_LABELS,
  clearTestLog,
  ENTRY_LABELS,
  readTestLog,
  REASON_LABELS,
  testLogToCsv,
  type TestLogRow,
} from "@/lib/testLog";
import { DEVICES } from "@/lib/device";

export default function TestLogDialog({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = useState<TestLogRow[]>(() => readTestLog());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function download() {
    const blob = new Blob([testLogToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sip-breather-test-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function clear() {
    if (!window.confirm("Clear all test log rows in this browser?")) return;
    clearTestLog();
    setRows([]);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="test-log-title"
        className="flex max-h-[80vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 id="test-log-title" className="text-lg font-semibold text-gray-900">
              Test log
            </h2>
            <p className="text-[13px] text-gray-500">
              One row each time a run finishes: a Done screen, &ldquo;Redemption placed&rdquo;, or a skip on SIP details. Saved only in this browser.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No test runs yet. Rows appear here when someone finishes a run.
            </p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead className="text-gray-500">
                <tr className="border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Device</th>
                  <th className="py-2 pr-4 font-medium">Entry</th>
                  <th className="py-2 pr-4 font-medium">Cancel reason</th>
                  <th className="py-2 pr-4 font-medium">Final choice</th>
                  <th className="py-2 pr-4 font-medium">Details</th>
                  <th className="py-2 pr-4 font-medium">GR-1 questions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="whitespace-nowrap py-2 pr-4">{new Date(r.time).toLocaleString("en-IN")}</td>
                    <td className="py-2 pr-4">{DEVICES[r.device]?.label ?? r.device}</td>
                    <td className="py-2 pr-4">{ENTRY_LABELS[r.entry] ?? r.entry}</td>
                    <td className="py-2 pr-4">{r.cancelReason ? REASON_LABELS[r.cancelReason] : ""}</td>
                    <td className="py-2 pr-4">{CHOICE_LABELS[r.finalChoice] ?? r.finalChoice}</td>
                    <td className="py-2 pr-4">
                      {r.pauseMonths ? `${r.pauseMonths} month${r.pauseMonths > 1 ? "s" : ""}` : ""}
                      {r.newAmount ? `New amount ₹${r.newAmount.toLocaleString("en-IN")}` : ""}
                      {r.redeemAmount ? `Redeemed ₹${r.redeemAmount.toLocaleString("en-IN")}` : ""}
                    </td>
                    <td className="py-2 pr-4">{r.gr1Questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-3">
          <button
            type="button"
            onClick={clear}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <Trash2 size={14} aria-hidden /> Clear
          </button>
          <button
            type="button"
            onClick={download}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-accent bg-accent-tint px-3 py-1.5 text-[13px] font-semibold text-gray-900 hover:bg-[#D3F6EC] disabled:opacity-40"
          >
            <Download size={14} aria-hidden /> Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
