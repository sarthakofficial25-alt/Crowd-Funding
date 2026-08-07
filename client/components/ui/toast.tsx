"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md animate-slide-down",
        type === "success" && "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]",
        type === "error" && "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]",
        type === "info" && "border-[#4fc3f7]/30 bg-[#4fc3f7]/10 text-[#4fc3f7]"
      )}
    >
      <span>{message}</span>
      <button
        onClick={() => setVisible(false)}
        className="ml-2 text-white/40 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
