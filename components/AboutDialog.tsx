"use client";

// "About" panel from the toolbar: what is new in this concept, and three
// "Try it" links that jump straight to the new parts.

import { useEffect } from "react";
import { ArrowRight, X } from "lucide-react";

const LINKS: { id: "redeem" | "withdraw" | "gr1"; path: string; what: string }[] = [
  { id: "redeem", path: "Dashboard → fund → Redeem", what: "the YOUR SIP card" },
  { id: "withdraw", path: "SIPs → Sample Flexi Cap → Cancel SIP", what: "“Want to withdraw money”" },
  { id: "gr1", path: "SIP details → Need help", what: "GR-1" },
];

export default function AboutDialog({
  onClose,
  onTry,
}: {
  onClose: () => void;
  onTry: (id: "redeem" | "withdraw" | "gr1") => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 id="about-title" className="text-lg font-semibold text-gray-900">
            About this prototype
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-[15px] leading-relaxed text-gray-800">
            <b className="font-semibold text-gray-900">What&apos;s new in this concept:</b> When a first-time investor
            withdraws money or tries to cancel a SIP, Groww now explains what each choice means instead of only asking
            why they&apos;re leaving.
          </p>

          <p className="mt-5 text-[13px] font-semibold uppercase tracking-wide text-gray-500">Try it:</p>
          <ul className="mt-2 flex flex-col gap-2">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => onTry(l.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left hover:border-accent hover:bg-accent-tint"
                >
                  <span className="text-[14px] text-gray-700">
                    {l.path} → <b className="font-semibold text-gray-900">{l.what}</b>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-gray-500" aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-[13px] leading-relaxed text-gray-500">
            Explore, Dashboard, SIPs and Watchlist recreate classic Groww for context. New parts have a green
            &lsquo;New&rsquo; tag.
          </p>
        </div>
      </div>
    </div>
  );
}
