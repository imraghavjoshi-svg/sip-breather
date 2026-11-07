"use client";

// "How we test the AI" (ai_rules.md section 3).
// Lists the 25 golden questions (set v3). G23 to G25 are sent with the
// default comparison for Sample Flexi Cap, like "Explain this" on Compare. "Run evaluation" sends each one through the
// same /api/ask route as the app, one at a time, about 12 seconds apart (the
// Groq limit is about 8,000 tokens a minute). If Groq says "too many
// requests", it waits and retries the same question (up to 3 times).
// The last run is saved to eval/last_run.json (locally) and shown on load.

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleCheck, CircleX, Play, Square } from "lucide-react";
import { GOLDEN, GOLDEN_SET_VERSION } from "@/data/golden";
import lastRunFile from "@/eval/last_run.json";
import { askGr1 } from "@/lib/askClient";
import { DEFAULT_COMPARE, isoDay } from "@/lib/compare";
import { PASS_BAR, scoreItem, summarize, TOTAL, TYPE_LABELS, type LastRun } from "@/lib/evalScore";
import type { EvalResult } from "@/lib/types";

const GAP_SECONDS = 12;
const RATE_LIMIT_WAIT_SECONDS = 15;
const MAX_RETRIES = 3;
const EVAL_SIP_ID = "sip_flexi";
const MODEL = "openai/gpt-oss-120b";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function EvalPage() {
  const [run, setRun] = useState<LastRun>(lastRunFile as LastRun);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [saveNote, setSaveNote] = useState("");
  const stopRef = useRef(false);

  const summary = summarize(GOLDEN, run.results);
  const resultFor = (id: string) => run.results.find((r) => r.goldenId === id);

  async function countdown(seconds: number, label: (s: number) => string) {
    for (let s = seconds; s > 0 && !stopRef.current; s--) {
      setStatus(label(s));
      await sleep(1000);
    }
  }

  async function runEvaluation() {
    setSaveNote("");
    // On the live site a run may start at most once every 10 minutes (for everyone).
    try {
      const res = await fetch("/api/eval/claim", { method: "POST" });
      const claim = (await res.json()) as { allowed: boolean; minutesLeft?: number };
      if (!claim.allowed) {
        const m = claim.minutesLeft ?? 10;
        setStatus(`Latest results shown below; you can run it again in ${m} minute${m === 1 ? "" : "s"}.`);
        return;
      }
    } catch {
      setStatus("Could not start the evaluation. Please try again in a moment.");
      return;
    }
    stopRef.current = false;
    setRunning(true);
    setSaveNote("");
    const results: EvalResult[] = [];
    setRun({ ranAt: null, model: MODEL, results: [] });

    for (let i = 0; i < GOLDEN.length && !stopRef.current; i++) {
      const item = GOLDEN[i];
      setCurrent(i);
      let reply = null;
      for (let attempt = 0; !stopRef.current; attempt++) {
        setStatus(`Question ${i + 1} of ${TOTAL}: asking GR-1…`);
        const compare = item.compare ? { ...DEFAULT_COMPARE, today: isoDay(new Date()) } : undefined;
        reply = await askGr1(item.question, EVAL_SIP_ID, false, compare);
        if (!reply.rateLimited || attempt >= MAX_RETRIES) break;
        const wait = reply.retryAfterSeconds ?? RATE_LIMIT_WAIT_SECONDS;
        await countdown(
          Math.ceil(wait),
          (s) => `Question ${i + 1} of ${TOTAL}: waiting for rate limit, retry ${attempt + 1} of ${MAX_RETRIES} in ${s}s`,
        );
      }
      if (!reply || stopRef.current) break;
      results.push(scoreItem(item, reply));
      setRun({ ranAt: null, model: MODEL, results: [...results] });
      if (i < GOLDEN.length - 1) {
        await countdown(GAP_SECONDS, (s) => `Question ${i + 2} of ${TOTAL} in ${s}s`);
      }
    }

    setCurrent(null);
    setRunning(false);
    if (stopRef.current || results.length < GOLDEN.length) {
      setStatus(`Stopped after ${results.length} of ${TOTAL} questions. Not saved.`);
      return;
    }
    const finished: LastRun = { ranAt: new Date().toISOString(), model: MODEL, goldenSet: GOLDEN_SET_VERSION, results };
    setRun(finished);
    setStatus(`Finished all ${TOTAL} questions.`);
    try {
      const res = await fetch("/api/eval/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finished),
      });
      const data = (await res.json()) as { saved: boolean; reason?: string };
      setSaveNote(data.saved ? "Saved to eval/last_run.json." : `Not saved: ${data.reason ?? "unknown reason"}`);
    } catch {
      setSaveNote("Not saved: could not reach the save route.");
    }
  }

  return (
    <main className="min-h-screen bg-[#eef0f3] pb-16">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-[14px] font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} aria-hidden /> Back to the demo
          </Link>
          <span className="text-[12px] text-gray-400">Concept prototype for a PM case study.</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6">
        <h1 className="mt-8 text-[28px] font-semibold tracking-tight text-gray-900">How we test the AI</h1>
        <div className="mt-3 grid gap-4 text-[15px] leading-relaxed text-gray-600 md:grid-cols-2">
          <p>
            GR-1 answers only from 11 written rules about how a SIP works. Every answer passes a safety check written
            in code before anyone sees it: valid format, real rules cited, no fund names, no advice, no predictions, no growth claims,
            no urgency, at most 600 characters. On &ldquo;Compare your options&rdquo;, every ₹ amount and instalment count must
            also match the app&apos;s own calculation. If an answer fails, or the AI is slow or down, the user sees the
            official rule text instead.
          </p>
          <p>
            We test it with {TOTAL} fixed questions (golden set {GOLDEN_SET_VERSION}), including tricky real
            situations, Hinglish, withdrawing and early returns, comparing options, and eight questions that ask for
            advice or a prediction. A question passes if GR-1 does what we expect (answer, refuse advice, or say it is out of
            scope) and uses the right words. The bar: <b className="text-gray-900">at least {PASS_BAR} / {TOTAL}</b>{" "}
            and <b className="text-gray-900">0 advice leaks</b>.
          </p>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile label="Passed" value={run.results.length ? `${summary.passed} / ${TOTAL}` : "–"} />
          <Tile label="Advice leaks (must be 0)" value={run.results.length ? String(summary.adviceLeaks) : "–"} />
          <Tile label="Safe fallbacks" value={run.results.length ? String(summary.fallbacks) : "–"} />
          <div
            className={`rounded-2xl border px-5 py-4 ${
              !run.ranAt ? "border-gray-200 bg-white" : summary.meetsBar ? "border-accent bg-accent-tint" : "border-[#F5C7A9] bg-[#FFF4ED]"
            }`}
          >
            <p className="text-[13px] text-gray-500">Pass bar ({PASS_BAR}/{TOTAL}, 0 leaks)</p>
            <p className="mt-1 text-[22px] font-semibold text-gray-900">
              {!run.ranAt ? (running ? "Running…" : "No full run yet") : summary.meetsBar ? "Met" : "Not met"}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[13px] text-gray-500">
          {run.ranAt
            ? `Last full run: ${new Date(run.ranAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} · model ${run.model} · golden set ${run.goldenSet ?? "v1 (20 questions)"}`
            : running
              ? "Results appear below as each question finishes."
              : "No saved run yet. Press Run evaluation."}
        </p>

        {/* Run controls */}
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4">
          {!running ? (
            <button
              type="button"
              onClick={runEvaluation}
              className="flex items-center gap-2 rounded-xl bg-button px-5 py-3 text-[19px] font-bold text-white hover:bg-button-hover"
            >
              <Play size={18} aria-hidden /> Run evaluation
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (stopRef.current = true)}
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-[16px] font-semibold text-gray-800 hover:bg-gray-50"
            >
              <Square size={16} aria-hidden /> Stop
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-gray-900" role="status" aria-live="polite">
              {status || `Sends all ${TOTAL} questions one at a time, ${GAP_SECONDS} seconds apart (about 5–6 minutes).`}
            </p>
            {running && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${(run.results.length / TOTAL) * 100}%` }}
                />
              </div>
            )}
            {saveNote && <p className="mt-1 text-[13px] text-gray-500">{saveNote}</p>}
          </div>
        </div>

        {/* Results table */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-gray-100 text-[13px] text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Question and GR-1&apos;s reply</th>
                <th className="px-4 py-3 font-medium">Expected</th>
                <th className="px-4 py-3 font-medium">GR-1 did</th>
                <th className="px-4 py-3 font-medium">Result</th>
                <th className="px-4 py-3 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {GOLDEN.map((g, i) => {
                const r = resultFor(g.id);
                const isCurrent = running && current === i && !r;
                return (
                  <tr key={g.id} className={`border-b border-gray-50 align-top ${isCurrent ? "bg-accent-tint" : ""}`}>
                    <td className="px-4 py-3 text-gray-400">{g.id}</td>
                    <td className="max-w-[420px] px-4 py-3">
                      <p className="font-medium text-gray-900">{g.question}</p>
                      {r && <p className="mt-1 line-clamp-3 text-[13px] text-gray-500" title={r.answer}>{r.answer}</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{TYPE_LABELS[g.expected]}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                      {r ? (r.type ? TYPE_LABELS[r.type] : "Safe fallback") : isCurrent ? "Asking…" : "–"}
                    </td>
                    <td className="px-4 py-3">
                      {r ? (
                        r.passed ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-accent-tint px-2.5 py-1 text-[13px] font-semibold text-accent-text">
                            <CircleCheck size={14} aria-hidden /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#FFF4ED] px-2.5 py-1 text-[13px] font-semibold text-error">
                            <CircleX size={14} aria-hidden /> Failed
                          </span>
                        )
                      ) : (
                        <span className="text-gray-300">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-gray-600">{r?.reason ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-center text-[12px] text-gray-400">Information only, not investment advice.</p>
      </div>
    </main>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
      <p className="text-[13px] text-gray-500">{label}</p>
      <p className="mt-1 text-[22px] font-semibold text-gray-900">{value}</p>
    </div>
  );
}
