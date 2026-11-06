"use client";

// The whole desktop page: toolbar on top, the phone centred below.
// Holds the page settings (device, zoom) and the demo run state (screens,
// decision, chat), which every screen reads through DemoProvider.

import { useReducer, useState, type Dispatch } from "react";
import Toolbar from "./Toolbar";
import TestLogDialog from "./TestLogDialog";
import DeviceFrame from "./frames/DeviceFrame";
import { PhoneOverlay, PhoneScreen } from "./PhoneApp";
import { DEVICES } from "@/lib/device";
import {
  currentScreen,
  demoReducer,
  DemoProvider,
  gr1QuestionCount,
  INITIAL_STATE,
  optionsEntry,
  stepForScreen,
  type DemoAction,
} from "@/lib/demoState";
import { addTestLogRow, redeemLogRow, testLogRowFor } from "@/lib/testLog";
import { TodayProvider, useBrowserToday } from "@/lib/today";
import type { DeviceKind, Zoom } from "@/lib/types";

export default function DemoShell() {
  const [device, setDevice] = useState<DeviceKind>("iphone");
  const [zoom, setZoom] = useState<Zoom>(1);
  const [state, rawDispatch] = useReducer(demoReducer, INITIAL_STATE);
  const [testLogOpen, setTestLogOpen] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const today = useBrowserToday();

  const spec = DEVICES[device];

  // Same as the normal dispatch, plus: "confirm" (SIP option) and
  // "confirmRedeem" both lead to a Done screen, so each saves one Test log row
  // (device, option, entry, details, and GR-1 questions since the last Reset).
  const dispatch: Dispatch<DemoAction> = (action) => {
    if (action.type === "confirm") {
      const decision = demoReducer(state, action).decision;
      if (decision) {
        addTestLogRow(
          testLogRowFor(decision, device, optionsEntry(state), gr1QuestionCount(state), state.smartRedeemSeen),
        );
      }
    }
    if (action.type === "confirmRedeem") {
      addTestLogRow(redeemLogRow(Number(state.redeemInput), device, gr1QuestionCount(state), state.smartRedeemSeen));
    }
    rawDispatch(action);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#eef0f3]">
      <Toolbar
        device={device}
        onDevice={setDevice}
        step={stepForScreen(currentScreen(state))}
        onStep={(step) => dispatch({ type: "jumpToStep", step })}
        zoom={zoom}
        onZoom={setZoom}
        onReset={() => dispatch({ type: "reset" })}
        onOpenTestLog={() => setTestLogOpen(true)}
        simulateFailure={simulateFailure}
        onSimulateFailure={setSimulateFailure}
      />

      <main className="flex flex-1 items-start justify-center px-6 py-10">
        {/*
          Zoom without stretching: the outer box takes the scaled size so the
          page layout is right, and the phone inside is scaled evenly from its
          top-left corner. Width and height always shrink by the same amount.
        */}
        <div
          className="relative shrink-0"
          style={{ width: spec.outerWidth * zoom, height: spec.outerHeight * zoom }}
        >
          <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${zoom})` }}>
            <DemoProvider value={{ state, dispatch, settings: { simulateFailure } }}>
              <DeviceFrame
                kind={device}
                overlay={
                  today && (
                    <TodayProvider value={today}>
                      <PhoneOverlay />
                    </TodayProvider>
                  )
                }
              >
                {today && (
                  <TodayProvider value={today}>
                    <PhoneScreen />
                  </TodayProvider>
                )}
              </DeviceFrame>
            </DemoProvider>
          </div>
        </div>
      </main>

      {testLogOpen && <TestLogDialog onClose={() => setTestLogOpen(false)} />}
    </div>
  );
}
