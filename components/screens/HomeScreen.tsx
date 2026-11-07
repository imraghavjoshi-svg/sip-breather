"use client";

// Classic Groww MF home with four working tabs: Explore / Dashboard / SIPs / Watchlist.
// The logo row scrolls away and the tabs stay pinned at the top, as in Groww.

import { useEffect, useRef } from "react";
import { useDemo } from "@/lib/demoState";
import { useDevice } from "@/lib/device";
import { BottomNav, HeaderBar, HomeTabs } from "../phone/parts";
import DashboardTab from "./DashboardTab";
import ExploreTab from "./ExploreTab";
import SipsTab from "./SipsTab";
import WatchlistTab from "./WatchlistTab";

export default function HomeScreen() {
  const { state, dispatch } = useDemo();
  const device = useDevice();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Each tab starts at the top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [state.tab]);

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* White strip behind the status bar so content scrolls under it cleanly. */}
      <div className="absolute inset-x-0 top-0 z-[5] bg-white" style={{ height: device.safeTop }} aria-hidden />

      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ paddingTop: device.safeTop }}>
        <HeaderBar onOpenGr1={() => dispatch({ type: "openGr1" })} />
        <div className="sticky z-[4]" style={{ top: 0 }}>
          <HomeTabs tab={state.tab} onTab={(tab) => dispatch({ type: "setTab", tab })} />
        </div>
        {state.tab === "explore" && <ExploreTab />}
        {state.tab === "dashboard" && <DashboardTab />}
        {state.tab === "sips" && <SipsTab />}
        {state.tab === "watchlist" && <WatchlistTab />}
      </div>

      <BottomNav />
    </div>
  );
}
