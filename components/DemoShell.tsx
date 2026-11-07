"use client";

// The whole desktop page: toolbar on top, the phone centred below.
// Holds the page settings (device, zoom) and the demo run state (screens,
// decision, chat), which every screen reads through DemoProvider.

import { useReducer, useState, type Dispatch } from "react";
import Toolbar from "./Toolbar";
import TestLogDialog from "./TestLogDialog";
import AboutDialog from "./AboutDialog";
import DeviceFrame from "./frames/DeviceFrame";
import { PhoneOverlay, PhoneScreen } from "./PhoneApp";
import { DEVICES } from "@/lib/device";
import {
  currentScreen,
  demoReducer,
  DemoProvider,
  finalChoice,
  gr1QuestionCount,
  INITIAL_STATE,
  runEntry,
  skipsInPlace,
  stepForScreen,
  type DemoAction,
  type DemoState,
} from "@/lib/demoState";
import { addTestLogRow, type TestLogRow } from "@/lib/testLog";
import { TodayProvider, useBrowserToday } from "@/lib/today";
import type { DeviceKind, Zoom } from "@/lib/types";

export default function DemoShell() {
  const [device, setDevice] = useState<DeviceKind>("iphone");
  const [zoom, setZoom] = useState<Zoom>(1);
  const [state, rawDispatch] = useReducer(demoReducer, INITIAL_STATE);
  const [testLogOpen, setTestLogOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const today = useBrowserToday();

  const spec = DEVICES[device];

  // Same as the normal dispatch, plus: when a run finishes (a Done screen,
  // "Redemption placed", a skip confirmed on SIP details, or "Keep as is" on
  // Compare), save one Test log row.
  const dispatch: Dispatch<DemoAction> = (action) => {
    const row = finishedRunRow(state, action, device);
    rawDispatch(action);
    if (row) {
      addTestLogRow(row);
      rawDispatch({ type: "runLogged" });
    }
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
        onOpenAbout={() => setAboutOpen(true)}
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
      {aboutOpen && (
        <AboutDialog
          onClose={() => setAboutOpen(false)}
          onTry={(id) => {
            if (id === "redeem") dispatch({ type: "jumpToStep", step: "redeem" });
            else if (id === "withdraw") dispatch({ type: "jumpToStep", step: "answer" });
            else dispatch({ type: "jumpToGr1" });
            setAboutOpen(false);
          }}
        />
      )}
    </div>
  );
}

/** The Test log row for this action, if it finishes a run; otherwise null. */
function finishedRunRow(before: DemoState, action: DemoAction, device: DeviceKind): TestLogRow | null {
  const skipOnDetails =
    action.type === "confirmSkip" && skipsInPlace(before) && before.stack[before.stack.length - 2] === "details";
  const after = demoReducer(before, action);
  const reachedEnd =
    currentScreen(after) !== currentScreen(before) && ["done", "redeemDone"].includes(currentScreen(after));
  const keep = action.type === "compareChoose" && action.option === "keep";
  const choice = keep ? "keep" : skipOnDetails ? "skip" : reachedEnd ? finalChoice(after) : null;
  if (!choice) return null;

  const entry = runEntry(before);
  const row: TestLogRow = {
    time: new Date().toISOString(),
    device,
    entry,
    finalChoice: choice,
    compareOpened: before.compareOpened,
    gr1Questions: gr1QuestionCount(before),
  };
  if (entry === "cancel" && before.draft.cancelReason) row.cancelReason = before.draft.cancelReason;
  if (choice === "pause") row.pauseMonths = after.decision?.pauseMonths;
  if (choice === "lower") row.newAmount = after.decision?.newAmount;
  if (currentScreen(after) === "redeemDone") row.redeemAmount = Number(before.redeemInput);
  return row;
}
