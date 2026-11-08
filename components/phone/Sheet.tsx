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
  /** Show a small drag handle at the top (classic Groww sheets have none). */
  handle?: boolean;
};

export function Sheet({ label, onDismiss, children, stacked = false, handle = false }: SheetProps) {
  const device = useDevice();
  return (
    <div className="absolute inset-0 flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onDismiss}
        className={`absolute inset-0 ${stacked ? "bg-black/20" : "bg-black/[0.33]"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative max-h-[88%] overflow-y-auto rounded-t-2xl bg-white px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.18)] ${
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

/**
 * Full-width green button with white 19px bold text (meets the large-text
 * contrast rule). Disabled: classic Groww's light grey with grey text.
 */
export function PrimaryButton({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-[44px] w-full items-center justify-center rounded-lg bg-button text-[19px] font-bold text-white transition-colors hover:bg-button-hover disabled:bg-button-disabled disabled:text-button-disabled-text"
    >
      {children}
    </button>
  );
}

/** Same size and weight as PrimaryButton, outlined instead of green ("Cancel instead"). */
export function SecondaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[44px] w-full items-center justify-center rounded-lg border border-line bg-white text-[19px] font-bold text-ink hover:bg-[#fafafa]"
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
      className="mx-auto flex h-11 items-center justify-center rounded-lg px-6 text-[15px] font-medium text-ink-2 hover:bg-line-soft"
    >
      {children}
    </button>
  );
}
