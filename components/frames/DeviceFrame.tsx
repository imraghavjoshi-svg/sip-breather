"use client";

// Draws the phone (iPhone Pro Max, Pixel 9 or Frameless) around the screen.
// Layers inside the screen, bottom to top:
//   1. children  – the app screen itself
//   2. status bar
//   3. overlay   – bottom sheets + dim layer (so they also dim the status bar)
//   4. hardware  – Dynamic Island / punch hole, home indicator / gesture bar

import type { ReactNode } from "react";
import { DEVICES, DeviceProvider } from "@/lib/device";
import type { DeviceKind } from "@/lib/types";
import { AndroidStatusBar, IosStatusBar } from "./StatusBars";

type Props = { kind: DeviceKind; children: ReactNode; overlay?: ReactNode };

export default function DeviceFrame({ kind, children, overlay }: Props) {
  const spec = DEVICES[kind];

  const screen = (
    <div
      className="phone-screen relative overflow-hidden bg-white"
      style={{
        width: spec.screenWidth,
        height: spec.screenHeight,
        fontFamily: spec.fontFamily,
        borderRadius: kind === "iphone" ? 55 : kind === "pixel" ? 36 : 28,
      }}
    >
      <div className="absolute inset-0">{children}</div>

      {kind !== "frameless" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
          {kind === "iphone" ? <IosStatusBar /> : <AndroidStatusBar />}
        </div>
      )}

      {overlay && (
        <div className="pointer-events-none absolute inset-0 z-20 [&>*]:pointer-events-auto">{overlay}</div>
      )}

      {kind === "iphone" && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-[12px] z-30 h-[34px] w-[116px] -translate-x-1/2 rounded-full bg-black" />
          <div className="pointer-events-none absolute bottom-[8px] left-1/2 z-30 h-[5px] w-[144px] -translate-x-1/2 rounded-full bg-[#111]" />
        </>
      )}
      {kind === "pixel" && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-[13px] z-30 h-[14px] w-[14px] -translate-x-1/2 rounded-full bg-[#0b0b0c] ring-2 ring-[#1d1d20]" />
          <div className="pointer-events-none absolute bottom-[9px] left-1/2 z-30 h-[4px] w-[108px] -translate-x-1/2 rounded-full bg-[#3a3a3c]" />
        </>
      )}
    </div>
  );

  return (
    <DeviceProvider value={spec}>
      <div className="relative" style={{ width: spec.outerWidth, height: spec.outerHeight }}>
        {kind === "iphone" && <IphoneShell>{screen}</IphoneShell>}
        {kind === "pixel" && <PixelShell>{screen}</PixelShell>}
        {kind === "frameless" && (
          <div className="rounded-[28px] shadow-[0_24px_60px_-12px_rgba(15,23,42,0.28),0_8px_20px_-8px_rgba(15,23,42,0.15)]">
            {screen}
          </div>
        )}
      </div>
    </DeviceProvider>
  );
}

/** Natural titanium edge (light warm grey metal) + thin black bezel + side buttons. */
function IphoneShell({ children }: { children: ReactNode }) {
  const button = "absolute w-[4px] rounded-[2px] bg-gradient-to-r from-[#a8a39b] to-[#cfcac1]";
  return (
    <>
      {/* Left: action button, volume up, volume down. Right: side button. */}
      <div className={`${button} -left-[3px] top-[176px] h-[34px]`} />
      <div className={`${button} -left-[3px] top-[236px] h-[64px]`} />
      <div className={`${button} -left-[3px] top-[316px] h-[64px]`} />
      <div className={`${button} -right-[3px] top-[268px] h-[104px]`} />
      <div
        className="absolute inset-0 rounded-[64.5px] p-[7px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.35)]"
        style={{
          background:
            "linear-gradient(145deg, #e4e0d9 0%, #c9c4bb 30%, #b7b1a7 55%, #d6d1c9 80%, #bdb7ad 100%)",
        }}
      >
        <div className="h-full w-full rounded-[57.5px] bg-black p-[2.5px]">{children}</div>
      </div>
    </>
  );
}

/** Dark frame + side buttons on the right. */
function PixelShell({ children }: { children: ReactNode }) {
  const button = "absolute -right-[3px] w-[4px] rounded-[2px] bg-[#2b2c30]";
  return (
    <>
      <div className={`${button} top-[200px] h-[64px]`} />
      <div className={`${button} top-[290px] h-[110px]`} />
      <div className="absolute inset-0 rounded-[47px] bg-[#1c1d20] p-[3px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.4)]">
        <div className="h-full w-full rounded-[44px] bg-black p-[8px]">{children}</div>
      </div>
    </>
  );
}
