// A bordered row with an icon, in the style of classic Groww's "Choose your
// reason to cancel this SIP" rows. Used for the reasons and for the options
// in the new reason-aware answers, so every option (including "Continue to
// cancel") has the same size and weight.

import type { ComponentType, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export function OptionRow({
  Icon,
  children,
  onClick,
  chevron = false,
}: {
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  children: ReactNode;
  onClick: () => void;
  chevron?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[54px] w-full items-center gap-4 rounded-lg border border-line px-4 py-3 text-left hover:bg-[#fafafa]"
    >
      <span className="flex w-5 shrink-0 justify-center text-ink" aria-hidden>
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="flex-1 text-[14px] leading-snug text-ink">{children}</span>
      {chevron && <ChevronRight size={17} className="shrink-0 text-ink-2" aria-hidden />}
    </button>
  );
}
