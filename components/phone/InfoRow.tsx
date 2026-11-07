// Icon + one line of text, used in confirm sheets and the Done screens.

import type { ComponentType, ReactNode } from "react";

export function InfoRow({
  Icon,
  children,
  last = false,
}: {
  Icon: ComponentType<{ size?: number }>;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 py-3 ${last ? "" : "border-b border-line-soft"}`}>
      <span className="mt-0.5 shrink-0 text-ink-2">
        <Icon size={18} />
      </span>
      <p className="text-[14px] leading-snug text-ink-2">{children}</p>
    </div>
  );
}
