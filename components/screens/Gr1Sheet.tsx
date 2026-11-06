"use client";

// Screen 6: GR-1 assistant bottom sheet.
// Chip "YOUR SIP", 3 suggested questions, the chat, and the input.
// Under every answer: "Based on: <rule title>", the Sources line, and
// "Information only, not investment advice."

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CornerDownRight, LoaderPinwheel, SendHorizontal, SquarePen, X } from "lucide-react";
import { getRule, SOURCES } from "@/data/rules";
import { SUGGESTED_QUESTIONS } from "@/data/golden";
import { askGr1 } from "@/lib/askClient";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { FALLBACK_LABEL } from "@/lib/gr1";
import type { ChatMessage } from "@/lib/types";

const MAX_QUESTION_LENGTH = 300;

export default function Gr1Sheet() {
  const { state, dispatch, settings } = useDemo();
  const device = useDevice();
  const [draft, setDraft] = useState("");
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

  async function ask(question: string) {
    const q = question.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!q || pending) return;
    setDraft("");
    dispatch({ type: "addChat", message: { role: "user", text: q } });
    setPending(true);
    try {
      const reply = await askGr1(q, state.sipId, settings.simulateFailure);
      dispatch({
        type: "addChat",
        message: {
          role: "assistant",
          text: reply.text,
          ruleIds: reply.ruleIds,
          status: reply.status,
          simulated: reply.simulated,
          notice: reply.notice,
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
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="GR-1 assistant"
        className="relative flex h-[86%] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.18)]"
      >
        <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-gray-300" aria-hidden />

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3">
          <div className="flex items-center gap-2.5">
            <LoaderPinwheel size={26} className="text-gray-900" aria-hidden />
            <span className="text-[24px] font-bold tracking-tight text-gray-900">GR-1</span>
          </div>
          <div className="flex items-center gap-1 text-gray-700">
            <button
              type="button"
              onClick={() => dispatch({ type: "newChat" })}
              aria-label="New chat"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <SquarePen size={21} />
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "closeGr1" })}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Chip, suggestions, chat */}
        <div className="flex-1 overflow-y-auto px-5 pb-4" aria-live="polite">
          <span className="mt-1 inline-block rounded-full border border-gray-300 px-3.5 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-gray-600">
            Your SIP
          </span>
          <SuggestedQuestions onAsk={ask} disabled={pending} className="mt-3" />

          <div className="mt-5 flex flex-col gap-5">
            {state.chat.map((m, i) =>
              m.role === "user" ? (
                <p
                  key={i}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-gray-100 px-4 py-3 text-[16px] text-gray-900"
                >
                  {m.text}
                </p>
              ) : (
                <AssistantMessage key={i} message={m} onAsk={ask} disabled={pending} />
              ),
            )}
            {pending && (
              <p className="flex items-center gap-2 text-[15px] text-gray-500" role="status">
                <LoaderPinwheel size={18} className="animate-spin text-accent" aria-hidden /> GR-1 is thinking…
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
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-5 pr-1.5 shadow-sm focus-within:border-accent"
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={MAX_QUESTION_LENGTH}
              placeholder="Ask GR-1 about your SIP"
              aria-label="Ask GR-1 about your SIP"
              className="min-w-0 flex-1 bg-transparent py-2 text-[16px] text-gray-900 caret-accent outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!draft.trim() || pending}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-button text-white transition-colors hover:bg-button-hover disabled:bg-gray-100 disabled:text-gray-400"
            >
              <SendHorizontal size={18} />
            </button>
          </form>
          <p className="mt-1.5 text-center text-[11px] text-gray-400">Information only, not investment advice.</p>
        </div>
      </div>
    </div>
  );
}

function SuggestedQuestions({
  onAsk,
  disabled,
  className = "",
}: {
  onAsk: (q: string) => void;
  disabled: boolean;
  className?: string;
}) {
  return (
    <ul className={`flex flex-col gap-1 ${className}`}>
      {SUGGESTED_QUESTIONS.map((q) => (
        <li key={q}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAsk(q)}
            className="flex w-full items-start gap-2.5 rounded-lg py-1.5 text-left text-[16px] text-gray-800 hover:text-accent-text disabled:opacity-60"
          >
            <CornerDownRight size={16} className="mt-1 shrink-0 text-gray-400" aria-hidden />
            {q}
          </button>
        </li>
      ))}
    </ul>
  );
}

function AssistantMessage({
  message,
  onAsk,
  disabled,
}: {
  message: Extract<ChatMessage, { role: "assistant" }>;
  onAsk: (q: string) => void;
  disabled: boolean;
}) {
  const titles = message.ruleIds.map((id) => getRule(id).title);
  const showRules = message.status !== "refused" && titles.length > 0;

  return (
    <div>
      {message.simulated && (
        <p className="mb-1 w-fit rounded bg-gray-100 px-2 py-0.5 text-[12px] font-medium text-gray-500">
          AI failure simulated
        </p>
      )}
      {message.status === "fallback" && (
        <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-accent-text">{FALLBACK_LABEL}</p>
      )}
      <p
        className={message.notice ? "rounded-xl bg-gray-50 px-4 py-3 text-[15px] leading-relaxed text-gray-600" : "text-[16px] leading-relaxed text-gray-900"}
      >
        {message.text}
      </p>

      {message.status === "refused" && !message.notice && <SuggestedQuestions onAsk={onAsk} disabled={disabled} className="mt-2" />}

      {showRules && (
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="w-fit rounded-md bg-gray-100 px-2.5 py-1 text-[13px] text-gray-700">
            Based on: {titles.join(" · ")}
          </p>
          <p className="text-[13px] text-gray-500">
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
      <p className="mt-2 text-[12px] text-gray-400">Information only, not investment advice.</p>
    </div>
  );
}
