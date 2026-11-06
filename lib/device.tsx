"use client";

// Exact sizes for each device, plus a React context so every screen knows
// which device it is inside (font, back-icon style, safe areas).

import { createContext, useContext } from "react";
import type { DeviceKind } from "./types";

export type DeviceSpec = {
  kind: DeviceKind;
  /** Name on the device switch. */
  label: string;
  /** Which phone is drawn. */
  model: string;
  screenWidth: number;
  screenHeight: number;
  /** Total size of the frame, including metal edge and bezel. */
  outerWidth: number;
  outerHeight: number;
  /** Space the status bar takes at the top of the screen. */
  safeTop: number;
  /** Space the home indicator / gesture bar takes at the bottom. */
  safeBottom: number;
  backStyle: "chevron" | "arrow";
  fontFamily: string;
};

const IOS_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif';
const ANDROID_FONT = 'var(--font-roboto), Roboto, "Segoe UI", system-ui, sans-serif';

// iPhone: 7px titanium + 2.5px black bezel on each side.
// Pixel: 11px dark frame on each side.
export const DEVICES: Record<DeviceKind, DeviceSpec> = {
  iphone: {
    kind: "iphone",
    label: "iOS",
    model: "iPhone Pro Max",
    screenWidth: 440,
    screenHeight: 956,
    outerWidth: 440 + 19,
    outerHeight: 956 + 19,
    safeTop: 59,
    safeBottom: 34,
    backStyle: "chevron",
    fontFamily: IOS_FONT,
  },
  pixel: {
    kind: "pixel",
    label: "Android",
    model: "Pixel 9",
    screenWidth: 412,
    screenHeight: 915,
    outerWidth: 412 + 22,
    outerHeight: 915 + 22,
    safeTop: 40,
    safeBottom: 24,
    backStyle: "arrow",
    fontFamily: ANDROID_FONT,
  },
  frameless: {
    kind: "frameless",
    label: "Frameless",
    model: "Frameless",
    screenWidth: 412,
    screenHeight: 915,
    outerWidth: 412,
    outerHeight: 915,
    safeTop: 12,
    safeBottom: 12,
    backStyle: "arrow",
    fontFamily: ANDROID_FONT,
  },
};

export const DEVICE_ORDER: DeviceKind[] = ["iphone", "pixel", "frameless"];

const DeviceContext = createContext<DeviceSpec>(DEVICES.iphone);
export const DeviceProvider = DeviceContext.Provider;
export function useDevice(): DeviceSpec {
  return useContext(DeviceContext);
}
