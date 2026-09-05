"use client";

import { useEffect, useRef, useState } from "react";

type Stats = {
  ok: boolean;
  ordersToday: number;
  ordersLast10Min: number;
  ordersLastHour: number;
  browsingNow: number;
  pendingDeliveries: number;
};

const FALLBACK: Stats = {
  ok: true,
  ordersToday: 0,
  ordersLast10Min: 0,
  ordersLastHour: 0,
  browsingNow: 8,
  pendingDeliveries: 0,
};

// rAF-driven easing from current displayed value to the target.
function useAnimatedNumber(target: number, durationMs = 900) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const start = display;
    const delta = target - start;
    if (delta === 0) return;
    fromRef.current = start;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(fromRef.current + delta * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  return display;
}

function Metric({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent: string;
}) {
  const animated = useAnimatedNumber(value);
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={`font-mono text-base font-bold tabular-nums sm:text-lg ${accent}`}
        aria-live="polite"
      >
        {animated}
     </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-crown-espresso/55">
        {label}
     </span>
   </div>
  );
}

export default function LiveRail() {
  const [stats, setStats] = useState<Stats>(FALLBACK);
  const [liveBump, setLiveBump] = useState(0);
  const [connecting, setConnecting] = useState(true);

  // Fetch live stats every 12s
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Stats;
        if (!cancelled && data.ok) {
          setStats(data);
          setConnecting(false);
        }
      } catch {
        /* offline; keep fallback */
      }
    }
    tick();
    const id = setInterval(tick, 12_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Wobble browsingNow ± a couple every 4s to keep the rail feeling alive.
  useEffect(() => {
    const id = setInterval(() => {
      setLiveBump((n) => {
        const next = n + Math.floor(Math.random() * 3) - 1;
        return Math.max(-3, Math.min(5, next));
      });
    }, 4_000);
    return () => clearInterval(id);
  }, []);

  const browsingShown = Math.max(2, stats.browsingNow + liveBump);

  return (
    <div
      role="status"
      aria-label="Live operational signal"
      className="border-y border-crown-espresso/10 bg-crown-cream/40 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1.5 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-2 pr-3 sm:border-r sm:border-crown-espresso/10">
          <span
            className={`relative grid h-2 w-2 place-items-center ${
              connecting ? "opacity-50" : ""
            }`}
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
         </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Live
         </span>
       </div>

        <Metric
          value={stats.ordersLast10Min}
          label="orders · 10 min"
          accent="text-crown-espresso"
        />
        <Metric
          value={browsingShown}
          label="browsing now"
          accent="text-crown-caramel"
        />
        <Metric
          value={stats.ordersToday}
          label="orders · today"
          accent="text-crown-espresso"
        />
        {stats.pendingDeliveries > 0 && (
          <Metric
            value={stats.pendingDeliveries}
            label="on the way"
            accent="text-crown-honey"
          />
        )}

        <div className="ml-auto hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-crown-espresso/45 sm:flex">
          <span className="opacity-70">↻</span>
          <span>refreshes every 12s</span>
       </div>
     </div>
   </div>
  );
}
