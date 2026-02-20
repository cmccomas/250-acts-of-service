"use client";

import { useEffect, useState } from "react";
import type { ProgressCounts } from "@/lib/types";

interface ThermometerPairProps {
  initialCounts: ProgressCounts;
  goal?: number;
}

interface SingleThermometerProps {
  count: number;
  goal: number;
  label: string;
  icon: string;
  fillColor: string;
  bulbColor: string;
  textColor: string;
  accentColor: string;
  clipId: string;
  animated: boolean;
}

function SingleThermometer({
  count,
  goal,
  label,
  icon,
  fillColor,
  bulbColor,
  textColor,
  accentColor,
  clipId,
  animated,
}: SingleThermometerProps) {
  const maxDisplay = Math.max(goal, count);
  const fillPct = animated ? (maxDisplay > 0 ? Math.min(count / maxDisplay, 1) : 0) : 0;
  const goalPct = maxDisplay > 0 ? goal / maxDisplay : 1;
  const percentage = goal > 0 ? Math.round((count / goal) * 100) : 0;

  // SVG dimensions
  const svgW = 70;
  const svgH = 310;
  const tubeX = 17;
  const tubeW = 36;
  const tubeTop = 15;
  const tubeH = 220;
  const tubeR = tubeW / 2;
  const bulbCx = tubeX + tubeW / 2;
  const bulbCy = tubeTop + tubeH + 22;
  const bulbR = 26;

  const fillH = fillPct * tubeH;
  const goalLineY = tubeTop + tubeH - goalPct * tubeH;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      <div className="text-center">
        <div className="font-serif text-lg font-bold" style={{ color: textColor }}>
          {icon} {label}
        </div>
      </div>

      {/* Count */}
      <div className="text-center relative">
        <div
          className="text-4xl font-extrabold tabular-nums"
          style={{ color: textColor }}
        >
          {count}
        </div>
        <div className="text-xs font-medium" style={{ color: accentColor }}>
          of {goal} &middot; {percentage}%
        </div>
        {count >= goal && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap bg-forest-100 text-forest-700 text-[10px] font-bold px-2 py-0.5 rounded">
            🎉 +{count - goal} beyond!
          </div>
        )}
      </div>

      {/* SVG */}
      <svg
        width={svgW * 1.6}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="drop-shadow-sm"
        role="img"
        aria-label={`${label} thermometer: ${count} of ${goal} acts`}
      >
        {/* Tube background */}
        <rect
          x={tubeX}
          y={tubeTop}
          width={tubeW}
          height={tubeH}
          rx={tubeR}
          fill="#f5f5f0"
          stroke="#a3a397"
          strokeWidth="1.5"
        />

        {/* Clip path */}
        <defs>
          <clipPath id={clipId}>
            <rect
              x={tubeX + 1}
              y={tubeTop + 1}
              width={tubeW - 2}
              height={tubeH - 2}
              rx={tubeR - 1}
            />
          </clipPath>
        </defs>

        {/* Fill */}
        <rect
          x={tubeX + 1}
          y={tubeTop + tubeH - fillH}
          width={tubeW - 2}
          height={fillH}
          fill={fillColor}
          clipPath={`url(#${clipId})`}
          className="transition-all duration-1000 ease-out"
        />

        {/* Goal line */}
        <line
          x1={tubeX - 5}
          y1={goalLineY}
          x2={tubeX + tubeW + 5}
          y2={goalLineY}
          stroke="#a3a397"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x={tubeX + tubeW + 8}
          y={goalLineY + 3.5}
          fill="#a3a397"
          fontSize="9"
          fontWeight="bold"
        >
          {goal}
        </text>

        {/* Tube border overlay */}
        <rect
          x={tubeX}
          y={tubeTop}
          width={tubeW}
          height={tubeH}
          rx={tubeR}
          fill="none"
          stroke="#a3a397"
          strokeWidth="1.5"
        />

        {/* Connection to bulb */}
        <rect
          x={tubeX + 5}
          y={tubeTop + tubeH - 2}
          width={tubeW - 10}
          height={24}
          fill={count > 0 ? fillColor : "#e8e8e0"}
          className="transition-all duration-700"
        />

        {/* Bulb */}
        <circle
          cx={bulbCx}
          cy={bulbCy}
          r={bulbR}
          fill="#f5f5f0"
          stroke="#a3a397"
          strokeWidth="1.5"
        />
        <circle
          cx={bulbCx}
          cy={bulbCy}
          r={bulbR - 2.5}
          fill={count > 0 ? bulbColor : "#e8e8e0"}
          className="transition-all duration-700"
        />
        <circle
          cx={bulbCx - 6}
          cy={bulbCy - 6}
          r={4}
          fill="rgba(255,255,255,0.3)"
        />
      </svg>
    </div>
  );
}

export function ThermometerPair({
  initialCounts,
  goal = 250,
}: ThermometerPairProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [animated, setAnimated] = useState(false);

  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/progress");
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const total = counts.this_side + counts.other_side;
  const bothReached = counts.this_side >= goal && counts.other_side >= goal;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Headline — emphasis on 250 per side */}
      <div className="text-center">
        <div className="font-serif text-charcoal/70 text-sm font-bold uppercase tracking-wider">
          250 on each side
        </div>
        {bothReached && (
          <div className="mt-1 inline-block bg-forest-100 text-forest-700 text-xs font-bold px-3 py-1 rounded">
            🎉 Both goals reached!
          </div>
        )}
      </div>

      {/* Two thermometers side by side */}
      <div className="flex gap-4 sm:gap-6">
        <SingleThermometer
          count={counts.this_side}
          goal={goal}
          label="This Side"
          icon="👤"
          fillColor="#1a6b38"
          bulbColor="#1a6b38"
          textColor="#1a4d2e"
          accentColor="#4da76b"
          clipId="tubeClipThis"
          animated={animated}
        />
        <SingleThermometer
          count={counts.other_side}
          goal={goal}
          label="Other Side"
          icon="✨"
          fillColor="#d4a017"
          bulbColor="#b8860b"
          textColor="#7a5213"
          accentColor="#e6b33e"
          clipId="tubeClipOther"
          animated={animated}
        />
      </div>

      {/* Combined total — secondary emphasis */}
      <div className="text-center text-charcoal/40 text-xs mt-1">
        {total} total acts of service across both sides
      </div>
    </div>
  );
}
