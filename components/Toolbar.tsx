"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { ChevronRight, ClipboardList, FlaskConical, Info, RotateCcw } from "lucide-react";
import { DEVICES, DEVICE_ORDER } from "@/lib/device";
import type { DeviceKind, StepTab, Zoom } from "@/lib/types";

const STEP_TABS: { id: StepTab; label: string }[] = [
  { id: "dashboard", label: "1. Dashboard" },
  { id: "redeem", label: "2. Redeem" },
  { id: "reasons", label: "3. Cancel reasons" },
  { id: "answer", label: "4. Reason answer" },
  { id: "compare", label: "5. Compare" },
];
const ZOOMS: Zoom[] = [1, 0.9, 0.8];

type Props = {
  device: DeviceKind;
  onDevice: (d: DeviceKind) => void;
  step: StepTab | null;
  onStep: (s: StepTab) => void;
  zoom: Zoom;
  onZoom: (z: Zoom) => void;
  onReset: () => void;
  onOpenTestLog: () => void;
  onOpenAbout: () => void;
  simulateFailure: boolean;
  onSimulateFailure: (on: boolean) => void;
};

export default function Toolbar(p: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-3">
        {/* Left: logo + title */}
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Groww" width={800} height={220} priority className="h-[26px] w-auto" />
          <div className="border-l border-gray-200 pl-4 leading-tight">
            <div className="text-[15px] font-semibold text-gray-900">SIP Breather</div>
            <div className="text-[12px] text-gray-600">Concept: two better exits in classic Groww</div>
            <div className="text-[11px] text-gray-400">Concept prototype for a PM case study.</div>
          </div>
        </div>

        {/* Middle: device switch + step tabs */}
        <div className="flex flex-wrap items-center gap-4">
          <Segmented
            label="Device"
            options={DEVICE_ORDER.map((d) => ({ id: d, label: DEVICES[d].label }))}
            value={p.device}
            onChange={p.onDevice}
          />
          <nav aria-label="Demo steps" className="flex items-center gap-1">
            {STEP_TABS.map((t, i) => (
              <div key={t.id} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={14} className="text-gray-300" aria-hidden />}
                <button
                  type="button"
                  onClick={() => p.onStep(t.id)}
                  aria-current={p.step === t.id ? "step" : undefined}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    p.step === t.id ? "bg-accent-tint font-semibold text-gray-900 ring-1 ring-accent" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.label}
                </button>
              </div>
            ))}
          </nav>
        </div>

        {/* Right: zoom + actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Zoom"
            options={ZOOMS.map((z) => ({ id: z, label: `${Math.round(z * 100)}%` }))}
            value={p.zoom}
            onChange={p.onZoom}
          />
          <FailureSwitch on={p.simulateFailure} onChange={p.onSimulateFailure} />
          <ToolbarButton onClick={p.onReset} icon={<RotateCcw size={14} />} label="Reset" />
          <ToolbarButton onClick={p.onOpenTestLog} icon={<ClipboardList size={14} />} label="Test log" />
          <ToolbarButton onClick={p.onOpenAbout} icon={<Info size={14} />} label="About" />
          <a
            href="/eval"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-gray-700"
          >
            <FlaskConical size={14} aria-hidden />
            How we test the AI
          </a>
        </div>
      </div>
    </header>
  );
}

function Segmented<T extends string | number>(props: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={props.label} className="flex rounded-lg bg-gray-100 p-0.5">
      {props.options.map((o) => (
        <button
          key={String(o.id)}
          type="button"
          role="radio"
          aria-checked={props.value === o.id}
          onClick={() => props.onChange(o.id)}
          className={`whitespace-nowrap rounded-md px-3 py-1 text-[13px] font-medium transition-colors ${
            props.value === o.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ToolbarButton(props: { onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
    >
      <span aria-hidden>{props.icon}</span>
      {props.label}
    </button>
  );
}

/** Reviewer switch: when on, /api/ask skips Groq so GR-1 shows the safe fallback. Off by default. */
function FailureSwitch({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      title="When on, GR-1 skips the AI and shows the safe fallback answer"
      className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[13px] font-medium ${
        on ? "border-[#F5A524] bg-[#FFF7E8] text-gray-900" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span
        className={`relative h-4 w-7 rounded-full transition-colors ${on ? "bg-[#F5A524]" : "bg-gray-300"}`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${on ? "left-3.5" : "left-0.5"}`}
        />
      </span>
      Simulate AI failure
    </button>
  );
}
