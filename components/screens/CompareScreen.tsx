"use client";

// NEW (green "New" tag): "Compare your options" for one SIP, classic Groww
// style. Five equal cards (Keep as is / Skip / Pause 1–3 months / Lower to
// ₹__ / Cancel) with numbers for the next 12 months worked out from real
// calendar dates (lib/compare.ts), a plain bar chart of "total put in", the
// footnote, and "Explain this" (GR-1 with the five results).
//
// No "recommended" label, no ranking: cards stay in a fixed order and Cancel
// looks like the others. Contributions only, never returns. Bars are one
// neutral grey with the value at the end (no green-good / red-bad).

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { getSip } from "@/data/sips";
import { compareOptions, instalmentsText, lowerAmountIsValid, type CompareResult } from "@/lib/compare";
import { formatDayMonth, nextInstalment } from "@/lib/dates";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { formatRupees, MAX_AMOUNT_DIGITS } from "@/lib/sip";
import { useToday } from "@/lib/today";
import type { PauseMonths } from "@/lib/types";
import { Gr1Swirl, NewTag, ScreenHeader } from "../phone/parts";

/** Neutral bar colour: one grey for every option (3:1+ against white). */
const BAR = "#7A7A7A";
const EXPLAIN_QUESTION = "Explain the differences between these options";

export default function CompareScreen() {
  const { state, dispatch } = useDemo();
  const today = useToday();
  const device = useDevice();
  const sip = getSip(state.sipId);
  const { pauseMonths, lowerInput } = state.compare;
  const lowerAmount = Number(lowerInput);
  const lowerOk = lowerInput !== "" && lowerAmountIsValid(sip, lowerAmount);
  const calc = compareOptions(sip.id, { pauseMonths, lowerAmount: lowerOk ? lowerAmount : sip.minAmount }, today);
  // While the typed amount is not valid, the Lower card has no numbers and a neutral title.
  const c = {
    ...calc,
    results: calc.results.map((r) => (r.id === "lower" && !lowerOk ? { ...r, label: "Lower the amount" } : r)),
  };
  const shown = c.results.filter((r) => r.id !== "lower" || lowerOk);
  const max = Math.max(...shown.map((r) => r.totalPutIn));

  const choose = (option: CompareResult["id"]) => dispatch({ type: "compareChoose", option });

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader onBack={() => dispatch({ type: "back" })} />

      <div className="flex flex-1 flex-col overflow-y-auto px-4">
        <NewTag className="w-fit" />
        <h1 className="mt-2 text-[20px] font-medium text-ink">Your next 12 months</h1>
        <p className="mt-1 text-[14px] text-ink-2">{sip.fundName}</p>
        <p className="text-[13px] text-ink-2">
          {formatRupees(sip.monthlyAmount)} monthly · next on {formatDayMonth(nextInstalment(sip.instalmentDay, today))}
        </p>

        {/* Five equal option cards, fixed order */}
        <ul className="mt-5 flex flex-col gap-2.5">
          {c.results.map((r) => (
            <li key={r.id}>
              <OptionCard
                result={r}
                byLabel={c.byLabel}
                goal={c.goalTarget && c.goalName ? { target: c.goalTarget, name: c.goalName } : null}
                onChoose={() => choose(r.id)}
                invalid={r.id === "lower" && !lowerOk ? `Enter ₹${sip.minAmount} to ₹${sip.monthlyAmount - 1}` : null}
                extra={
                  r.id === "pause" ? (
                    <PauseSelector value={pauseMonths} onChange={(m) => dispatch({ type: "setComparePause", months: m })} />
                  ) : r.id === "lower" ? (
                    <LowerInput
                      value={lowerInput}
                      onChange={(v) => dispatch({ type: "setCompareLower", value: v })}
                      error={!lowerOk}
                    />
                  ) : null
                }
              />
            </li>
          ))}
        </ul>

        {/* Bar chart: total put in by month 12, one neutral colour, value at the end of each bar */}
        <section className="mt-6" aria-labelledby="compare-chart">
          <h2 id="compare-chart" className="text-[15px] font-medium text-ink">
            Total put in by {c.byLabel}
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5" role="list">
            {c.results.map((r) => {
              const ok = r.id !== "lower" || lowerOk;
              const pct = ok && max > 0 ? (r.totalPutIn / max) * 100 : 0;
              return (
                <li
                  key={r.id}
                  className="flex items-center gap-2"
                  title={ok ? `${r.label}: ${formatRupees(r.totalPutIn)} put in by ${c.byLabel}` : undefined}
                >
                  <span className="w-[118px] shrink-0 truncate text-[12px] text-ink-2">{r.label}</span>
                  <span className="flex min-w-0 flex-1 items-center gap-1.5 border-l border-line">
                    {ok ? (
                      <>
                        {/* Bars use at most 72% of the row so the value always fits after them. */}
                        <span
                          className="block h-4 rounded-r-[4px]"
                          style={{ width: `${pct * 0.72}%`, background: BAR }}
                          aria-hidden
                        />
                        <span className="shrink-0 text-[13px] tabular-nums text-ink">{formatRupees(r.totalPutIn)}</span>
                      </>
                    ) : (
                      <span className="pl-1.5 text-[13px] text-ink-3">–</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-4 text-[12px] leading-snug text-ink-3">
          Based only on money you put in. Doesn&apos;t include market returns, which can go up or down. Information only,
          not investment advice.
        </p>

        <button
          type="button"
          disabled={!lowerOk}
          onClick={() => dispatch({ type: "openGr1", from: "compare", ask: EXPLAIN_QUESTION })}
          className="mt-4 flex h-11 items-center justify-center gap-2 rounded-lg border border-line text-[15px] font-medium text-ink hover:bg-[#fafafa] disabled:text-ink-3"
        >
          <Gr1Swirl size={18} /> Explain this
        </button>
        <div style={{ height: device.safeBottom + 28 }} aria-hidden />
      </div>
    </div>
  );
}

function OptionCard({
  result,
  byLabel,
  goal,
  onChoose,
  extra,
  invalid,
}: {
  result: CompareResult;
  byLabel: string;
  goal: { target: number; name: string } | null;
  onChoose: () => void;
  extra: ReactNode;
  invalid: string | null;
}) {
  return (
    <div className="rounded-xl border border-line">
      <button type="button" onClick={onChoose} className="flex w-full items-start gap-3 px-[15px] py-3 text-left hover:bg-[#fafafa]">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-ink">{result.label}</span>
          {invalid ? (
            <span className="mt-1 block text-[13px] text-error">{invalid}</span>
          ) : (
            <span className="mt-1 block text-[13px] leading-relaxed text-ink-2">
              {instalmentsText(result.instalments)} in the next 12 months
              <br />
              <b className="font-medium text-ink">{formatRupees(result.totalPutIn)}</b> put in by {byLabel}
              <br />
              SIP running in {byLabel}: {result.runningAtMonth12 ? "Yes" : "No"}
              {goal && (
                <>
                  <br />
                  {formatRupees(result.totalPutIn)} of {formatRupees(goal.target)} towards {goal.name}
                </>
              )}
            </span>
          )}
        </span>
        <ChevronRight size={18} className="mt-0.5 shrink-0 text-ink-2" aria-hidden />
      </button>
      {extra && <div className="border-t border-line-soft px-[15px] py-2.5">{extra}</div>}
    </div>
  );
}

function PauseSelector({ value, onChange }: { value: PauseMonths; onChange: (m: PauseMonths) => void }) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Pause length">
      <span className="mr-1 text-[13px] text-ink-2">Pause for</span>
      {([1, 2, 3] as PauseMonths[]).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={m === value}
          onClick={() => onChange(m)}
          className={`h-8 whitespace-nowrap rounded-full border px-3 text-[13px] ${
            m === value ? "border-ink bg-line-soft font-medium text-ink" : "border-line text-ink-2 hover:bg-[#fafafa]"
          }`}
        >
          {m} {m === 1 ? "month" : "months"}
        </button>
      ))}
    </div>
  );
}

function LowerInput({ value, onChange, error }: { value: string; onChange: (v: string) => void; error: boolean }) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-ink-2">
      New monthly amount
      <span
        className={`flex h-8 items-center rounded-lg border px-2.5 text-[14px] text-ink focus-within:border-ink ${
          error ? "border-error" : "border-line"
        }`}
      >
        ₹
        <input
          value={value}
          inputMode="numeric"
          aria-label="New monthly amount in rupees"
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, MAX_AMOUNT_DIGITS))}
          className="w-14 bg-transparent pl-0.5 outline-none"
        />
      </span>
    </label>
  );
}
