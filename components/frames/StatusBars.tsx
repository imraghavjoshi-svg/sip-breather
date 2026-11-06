import { BatteryFull, Signal, Wifi } from "lucide-react";

export function IosStatusBar() {
  return (
    <div className="flex h-[59px] items-center justify-between px-[38px] pt-[6px] text-[#111827]">
      <span className="w-[60px] text-center text-[17px] font-semibold tracking-tight">9:41</span>
      <span className="flex items-center gap-[6px]">
        <Signal size={17} strokeWidth={2.6} aria-hidden />
        <Wifi size={17} strokeWidth={2.6} aria-hidden />
        <BatteryFull size={24} strokeWidth={1.8} aria-hidden />
      </span>
    </div>
  );
}

export function AndroidStatusBar() {
  return (
    <div className="flex h-[40px] items-center justify-between px-[22px] text-[#111827]">
      <span className="text-[14px] font-medium">9:41</span>
      <span className="flex items-center gap-[5px]">
        <Wifi size={15} strokeWidth={2.4} aria-hidden />
        <Signal size={15} strokeWidth={2.4} aria-hidden />
        <BatteryFull size={19} strokeWidth={1.8} aria-hidden />
      </span>
    </div>
  );
}
