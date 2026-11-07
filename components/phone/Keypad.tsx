"use client";

// Number keypad in Groww's style. Optional "." key (redeem allows paise).

import { Delete } from "lucide-react";

export function Keypad({ onPress, allowDecimal = false }: { onPress: (key: string) => void; allowDecimal?: boolean }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", allowDecimal ? "." : "", "0", "back"];
  return (
    <div className="grid grid-cols-3 px-4" role="group" aria-label="Keypad">
      {keys.map((k) =>
        k === "" ? (
          <span key="blank" aria-hidden />
        ) : (
          <button
            key={k}
            type="button"
            onClick={() => onPress(k)}
            aria-label={k === "back" ? "Delete" : k === "." ? "Decimal point" : k}
            className="flex h-[60px] items-center justify-center rounded-xl text-[28px] font-medium text-ink hover:bg-gray-50 active:bg-gray-100"
          >
            {k === "back" ? <Delete size={28} strokeWidth={1.8} /> : k}
          </button>
        ),
      )}
    </div>
  );
}
