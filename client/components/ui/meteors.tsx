"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

interface MeteorStyle {
  id: number;
  left: string;
  delay: string;
  duration: string;
}

export function Meteors({ number = 15, className }: MeteorsProps) {
  const [meteors] = useState<MeteorStyle[]>(() =>
    Array.from({ length: number }, (_, i) => ({
      id: i,
      left: `${(i * 7 + 13) % 100}%`,
      delay: `${((i * 1.3) % 5).toFixed(1)}s`,
      duration: `${((i * 0.7) % 3 + 2).toFixed(1)}s`,
    }))
  );

  return (
    <>
      {meteors.map((m) => (
        <span
          key={m.id}
          className={cn(
            "pointer-events-none absolute top-0 left-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-full bg-white/80 shadow-[0_0_0_1px_#ffffff10]",
            "before:content-[''] before:absolute before:top-1/2 before:right-0 before:h-px before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-[#7c6cf099] before:to-transparent",
            className
          )}
          style={{
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </>
  );
}
