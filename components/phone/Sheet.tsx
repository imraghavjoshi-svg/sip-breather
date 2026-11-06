"use client";

// Bottom sheet shell + the two button styles used across the flow.

import type { ReactNode } from "react";
import { useDevice } from "@/lib/device";
import { Disclaimer } from "./parts";

type SheetProps = {
  label: string;
  onDismiss: () => void;
  children: ReactNode;
  /** Lighter dim when a sheet sits on top of another sheet. */
  stacked?: boolean;
  /** Show the small drag handle at the top (Groww's Smart Redeem sheet has none). */
  handle?: boolean;
};

export function Sheet({ label, onDismiss, children, stacked = false, handle = true }: SheetProps) {
  const device = useDevice();
  return (
    <div className="absolute inset-0 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onDismiss}
        className={`absolute inset-0 ${stacked ? "bg-black/30" : "bg-black/45"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative max-h-[88%] overflow-y-auto rounded-t-[28px] bg-white px-5 shadow-[0_-10px_30px_rgba(0,0,0,0.18)] ${
          handle ? "pt-3" : "pt-6"
        }`}
        style={{ paddingBottom: device.safeBottom + 8 }}
      >
        {handle && <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" aria-hidden />}
        {children}
        <Disclaimer className="mt-4" />
      </div>
    </div>
  );
}

const TONES = {
  // Our SIP screens.
  green: "bg-button hover:bg-button-hover disabled:bg-button-disabled",
  // Screens copied from Groww (Dashboard, Redeem). Disabled = Groww's grey.
  blue: "bg-groww-blue hover:bg-groww-blue-hover disabled:bg-[#F2F2F4] disabled:text-[#B6B8C3]",
};

/** Full-width button with white 19px bold text (meets the large-text contrast rule). */
export function PrimaryButton({
  onClick,
  children,
  disabled,
  tone = "green",
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  tone?: keyof typeof TONES;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14 w-full items-center justify-center rounded-xl text-[19px] font-bold text-white transition-colors ${TONES[tone]}`}
    >
      {children}
    </button>
  );
}

export function TextButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto flex h-12 items-center justify-center rounded-lg px-6 text-[16px] font-medium text-gray-600 hover:bg-gray-50"
    >
      {children}
    </button>
  );
}
