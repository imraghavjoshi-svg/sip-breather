// Icon + one line of text, used in confirm sheets and the Done screen.

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
    <div className={`flex items-start gap-3 py-3.5 ${last ? "" : "border-b border-gray-100"}`}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
        <Icon size={17} />
      </span>
      <p className="text-[15px] leading-snug text-gray-700">{children}</p>
    </div>
  );
}
