"use client";

import { useEffect, useState } from "react";
import type { WardStat } from "@/lib/types";

interface WardDashboardProps {
  initialStats: WardStat[];
}

export function WardDashboard({ initialStats }: WardDashboardProps) {
  const [stats, setStats] = useState<WardStat[]>(initialStats);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/ward-stats");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setStats(data);
        }
      } catch {
        // Silently ignore
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (stats.length === 0) return null;

  const max = Math.max(...stats.map((s) => s.count), 1);
  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="border border-charcoal/10 rounded bg-white/60 px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal/40">
          Submissions by Ward
        </h3>
        <span className="text-xs text-charcoal/30">{total} total</span>
      </div>

      {/* 2-col grid on sm+, single col on mobile */}
      <div className="flex flex-col gap-2">
        {stats.map((s) => {
          const pct = Math.round((s.count / max) * 100);
          return (
            <div key={s.ward_name} className="flex items-center gap-2">
              <span className="text-[11px] text-charcoal/60 w-28 truncate shrink-0">
                {s.ward_name}
              </span>
              <div className="flex-1 bg-charcoal/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-forest-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-charcoal/50 w-5 text-right shrink-0">
                {s.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
