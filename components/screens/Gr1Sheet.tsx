"use client";

// GR-1 assistant bottom sheet (NEW), in classic Groww's style.
// Chip "YOUR SIP", suggested questions that depend on where GR-1 was opened
// from (redeem sheet, returns answer, anywhere else), the chat, and the input.
// Under every answer: "Based on: <rule title>", the Sources line, and
// "Information only, not investment advice."
// Long answers (3+ sentences) are shown as a list of blocks with the option
// word in bold (lib/answerBlocks.ts): layout only, the words never change.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CornerDownRight, LoaderCircle, SendHorizontal, SquarePen, X } from "lucide-react";
import { getRule, SOURCES } from "@/data/rules";
import { SUGGESTED_QUESTIONS } from "@/data/golden";
import { answerBlocks } from "@/lib/answerBlocks";
import { askGr1 } from "@/lib/askClient";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { COMPARE_FALLBACK_LABEL, FALLBACK_LABEL } from "@/lib/gr1";
import { isoDay, lowerAmountIsValid } from "@/lib/compare";
import { getSip } from "@/data/sips";
import { useToday } from "@/lib/today";
import { Gr1Swirl, NewTag } from "../phone/parts";
import type { ChatMessage } from "@/lib/types";

const MAX_QUESTION_LENGTH = 300;

export default function Gr1Sheet() {
  const { state, dispatch, settings } = useDemo();
  const device = useDevice();
  const today = useToday();
  const [draft, setDraft] = useState("");
  const suggestions = SUGGESTED_QUESTIONS[state.gr1From];
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [state.chat.length, pending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // "Explain this" on Compare: GR-1 asks the question by itself when it opens.
  const autoAsked = useRef(false);
  useEffect(() => {
    if (!state.gr1Ask || autoAsked.current) return;
    autoAsked.current = true;
    const q = state.gr1Ask;
    dispatch({ type: "clearGr1Ask" });
    void ask(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gr1Ask]);

  /** Opened from Compare: send the user's two choices; the server recalculates the five results. */
  function compareRequest() {
    if (state.gr1From !== "compare") return undefined;
    const lowerAmount = Number(state.compare.lowerInput);
    if (!lowerAmountIsValid(getSip(state.sipId), lowerAmount)) return undefined;
    return { pauseMonths: state.compare.pauseMonths, lowerAmount, today: isoDay(today) };
  }

  async function ask(question: string) {
    const q = question.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!q || pending) return;
    setDraft("");
    dispatch({ type: "addChat", message: { role: "user", text: q } });
    setPending(true);
    try {
      const reply = await askGr1(q, state.sipId, settings.simulateFailure, compareRequest());
      dispatch({
        type: "addChat",
        message: {
          role: "assistant",
          text: reply.text,
          ruleIds: reply.ruleIds,
          status: reply.status,
          simulated: reply.simulated,
          notice: reply.notice,
          compareFallback: reply.compareFallback,
        },
      });
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(draft);
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close GR-1"
        tabIndex={-1}
        onClick={() => dispatch({ type: "closeGr1" })}
        className="absolute inset-0 bg-black/[0.33]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="GR-1 assistant"
        className="relative flex h-[86%] flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.18)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">
          <div className="flex items-center gap-2.5 text-ink">
            <Gr1Swirl size={24} />
            <span className="text-[20px] font-medium">GR-1</span>
            <NewTag />
          </div>
          <div className="flex items-center gap-1 text-ink-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "newChat" })}
              aria-label="New chat"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-line-soft"
            >
              <SquarePen size={21} />
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "closeGr1" })}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-line-soft"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Chip, suggestions, chat */}
        <div className="flex-1 overflow-y-auto px-4 pb-4" aria-live="polite">
          <span className="mt-1 inline-block rounded-full border border-line px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-2">
            Your SIP
          </span>
          <SuggestedQuestions questions={suggestions} onAsk={ask} disabled={pending} className="mt-3" />

          <div className="mt-5 flex flex-col gap-5">
            {state.chat.map((m, i) =>
              m.role === "user" ? (
                <p
                  key={i}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-line-soft px-4 py-2.5 text-[15px] text-ink"
                >
                  {m.text}
                </p>
              ) : (
                <AssistantMessage key={i} message={m} questions={suggestions} onAsk={ask} disabled={pending} />
              ),
            )}
            {pending && (
              <p className="flex items-center gap-2 text-[14px] text-ink-2" role="status">
                <LoaderCircle size={17} className="animate-spin text-accent-text" aria-hidden /> GR-1 is thinking…
              </p>
            )}
          </div>
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div
          className="relative shrink-0 px-4 pt-2"
          style={{
            paddingBottom: device.safeBottom + 6,
            background: "radial-gradient(ellipse at 50% 120%, rgba(0,208,156,0.16), rgba(255,255,255,0) 70%)",
          }}
        >
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-5 pr-1.5 shadow-sm focus-within:border-accent"
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_QUESTION_LENGTH}
              placeholder="Ask GR-1 about your SIP"
              aria-label="Ask GR-1 about your SIP"
              className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink caret-accent outline-none placeholder:text-ink-3"
            />
            <button
              type="submit"
              disabled={!draft.trim() || pending}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-button text-white transition-colors hover:bg-button-hover disabled:bg-button-disabled disabled:text-button-disabled-text"
            >
              <SendHorizontal size={18} />
            </button>
          </form>
          <p className="mt-1.5 text-center text-[11px] text-ink-3">Information only, not investment advice.</p>
        </div>
      </div>
    </div>
  );
}

function SuggestedQuestions({
  questions,
  onAsk,
  disabled,
  className = "",
}: {
  questions: string[];
  onAsk: (q: string) => void;
  disabled: boolean;
  className?: string;
}) {
  return (
    <ul className={`flex flex-col gap-1 ${className}`}>
      {questions.map((q) => (
        <li key={q}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAsk(q)}
            className="flex w-full items-start gap-2.5 rounded-lg py-1.5 text-left text-[15px] text-ink hover:text-accent-text disabled:opacity-60"
          >
            <CornerDownRight size={16} className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
            {q}
          </button>
        </li>
      ))}
    </ul>
  );
}

function AssistantMessage({
  message,
  questions,
  onAsk,
  disabled,
}: {
  message: Extract<ChatMessage, { role: "assistant" }>;
  questions: string[];
  onAsk: (q: string) => void;
  disabled: boolean;
}) {
  const titles = message.ruleIds.map((id) => getRule(id).title);
  const showRules = message.status !== "refused" && titles.length > 0;
  const blocks = message.notice ? null : answerBlocks(message.text);

  return (
    <div>
      {message.simulated && (
        <p className="mb-1 w-fit rounded bg-line-soft px-2 py-0.5 text-[12px] font-medium text-ink-2">
          AI failure simulated
        </p>
      )}
      {message.status === "fallback" && (
        <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-accent-text">
          {message.compareFallback ? COMPARE_FALLBACK_LABEL : FALLBACK_LABEL}
        </p>
      )}
      {blocks ? (
        <ul className="divide-y divide-line">
          {blocks.map((b, i) => (
            <li key={i} className="py-[5px] text-[15px] leading-relaxed text-ink first:pt-0 last:pb-0">
              {b.lead}
              {b.bold && <b className="font-semibold">{b.bold}</b>}
              {b.rest}
            </li>
          ))}
        </ul>
      ) : (
        <p
          className={message.notice ? "rounded-xl bg-line-soft px-4 py-3 text-[14px] leading-relaxed text-ink-2" : "text-[15px] leading-relaxed text-ink"}
        >
          {message.text}
        </p>
      )}

      {message.status === "refused" && !message.notice && <SuggestedQuestions questions={questions} onAsk={onAsk} disabled={disabled} className="mt-2" />}

      {showRules && (
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="w-fit rounded-md bg-line-soft px-2.5 py-1 text-[13px] text-ink">
            Based on: {titles.join(" · ")}
          </p>
          <p className="text-[13px] text-ink-2">
            Sources:{" "}
            {SOURCES.map((s, i) => (
              <span key={s.url}>
                {i > 0 && " · "}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent-text underline-offset-2 hover:underline"
                >
                  {s.label}
                </a>
              </span>
            ))}
          </p>
        </div>
      )}
      <p className="mt-2 text-[12px] text-ink-3">Information only, not investment advice.</p>
    </div>
  );
}
