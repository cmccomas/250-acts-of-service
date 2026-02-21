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
  fillColorLight: string;
  bulbColor: string;
  textColor: string;
  accentColor: string;
  uid: string;
  animated: boolean;
}

function SingleThermometer({
  count,
  goal,
  label,
  icon,
  fillColor,
  fillColorLight,
  bulbColor,
  textColor,
  accentColor,
  uid,
  animated,
}: SingleThermometerProps) {
  const maxDisplay = Math.max(goal, count);
  const fillPct = animated ? (maxDisplay > 0 ? Math.min(count / maxDisplay, 1) : 0) : 0;
  const goalPct = maxDisplay > 0 ? goal / maxDisplay : 1;
  const percentage = goal > 0 ? Math.round((count / goal) * 100) : 0;

  // SVG dimensions
  const svgW = 80;
  const svgH = 320;
  const tubeX = 22;
  const tubeW = 30;
  const tubeTop = 12;
  const tubeH = 220;
  const tubeR = tubeW / 2;
  const tubeCx = tubeX + tubeW / 2;

  // Bulb
  const bulbCy = tubeTop + tubeH + 30;
  const bulbR = 24;

  // Neck connecting tube to bulb
  const neckTop = tubeTop + tubeH - tubeR;
  const neckH = bulbCy - bulbR - neckTop + 8;

  const fillH = fillPct * tubeH;
  const goalLineY = tubeTop + tubeH - goalPct * tubeH;

  // Tick marks
  const ticks = [0.25, 0.5, 0.75, 1.0];

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
        {/* Always reserve badge space so both thermometers stay vertically aligned */}
        <div className="h-6 flex items-center justify-center mt-1">
          {count >= goal && (
            <span className="whitespace-nowrap bg-forest-100 text-forest-700 text-[10px] font-bold px-2 py-0.5 rounded">
              🎉 +{count - goal} beyond!
            </span>
          )}
        </div>
      </div>

      {/* SVG Thermometer */}
      <svg
        width={svgW * 1.4}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="drop-shadow-md"
        role="img"
        aria-label={`${label} thermometer: ${count} of ${goal} acts`}
      >
        <defs>
          {/* Gradient for the glass tube background */}
          <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e8e8e2" />
            <stop offset="30%" stopColor="#f8f8f4" />
            <stop offset="70%" stopColor="#f8f8f4" />
            <stop offset="100%" stopColor="#e0e0da" />
          </linearGradient>

          {/* Gradient for the fill liquid */}
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={fillColor} />
            <stop offset="40%" stopColor={fillColorLight} />
            <stop offset="100%" stopColor={fillColor} />
          </linearGradient>

          {/* Clip for tube fill */}
          <clipPath id={`${uid}-tubeClip`}>
            <rect
              x={tubeX + 1.5}
              y={tubeTop + 1.5}
              width={tubeW - 3}
              height={tubeH - 3}
              rx={tubeR - 1.5}
            />
          </clipPath>

          {/* Clip for bulb fill */}
          <clipPath id={`${uid}-bulbClip`}>
            <circle cx={tubeCx} cy={bulbCy} r={bulbR - 2} />
          </clipPath>
        </defs>

        {/* === Tube === */}
        {/* Outer tube (glass look) */}
        <rect
          x={tubeX}
          y={tubeTop}
          width={tubeW}
          height={tubeH}
          rx={tubeR}
          fill={`url(#${uid}-glass)`}
          stroke="#b0b0a8"
          strokeWidth="1.2"
        />

        {/* Tube inner shadow (left edge) */}
        <rect
          x={tubeX + 2}
          y={tubeTop + 2}
          width={3}
          height={tubeH - 4}
          rx={1.5}
          fill="rgba(0,0,0,0.04)"
        />

        {/* Fill liquid */}
        <rect
          x={tubeX + 1.5}
          y={tubeTop + tubeH - fillH}
          width={tubeW - 3}
          height={fillH}
          fill={`url(#${uid}-fill)`}
          clipPath={`url(#${uid}-tubeClip)`}
          className="transition-all duration-1000 ease-out"
        />

        {/* Liquid highlight (glass reflection on fill) */}
        {fillH > 10 && (
          <rect
            x={tubeX + tubeW - 8}
            y={tubeTop + tubeH - fillH + 2}
            width={3}
            height={fillH - 4}
            rx={1.5}
            fill="rgba(255,255,255,0.3)"
            clipPath={`url(#${uid}-tubeClip)`}
            className="transition-all duration-1000 ease-out"
          />
        )}

        {/* Tick marks */}
        {ticks.map((t) => {
          const y = tubeTop + tubeH - t * tubeH * goalPct;
          return (
            <g key={t}>
              <line
                x1={tubeX + tubeW + 2}
                y1={y}
                x2={tubeX + tubeW + 7}
                y2={y}
                stroke="#b0b0a8"
                strokeWidth="1"
              />
              <text
                x={tubeX + tubeW + 10}
                y={y + 3}
                fill="#b0b0a8"
                fontSize="7"
                fontFamily="system-ui"
              >
                {Math.round(t * goal)}
              </text>
            </g>
          );
        })}

        {/* Goal line */}
        <line
          x1={tubeX - 4}
          y1={goalLineY}
          x2={tubeX + tubeW + 4}
          y2={goalLineY}
          stroke={fillColor}
          strokeWidth="1.5"
          strokeDasharray="3 2"
          opacity="0.6"
        />

        {/* Tube glass highlight (reflection streak) */}
        <rect
          x={tubeX + 4}
          y={tubeTop + 6}
          width={2.5}
          height={tubeH - 12}
          rx={1.25}
          fill="rgba(255,255,255,0.5)"
        />

        {/* === Neck === */}
        <rect
          x={tubeX + 4}
          y={neckTop}
          width={tubeW - 8}
          height={neckH}
          fill={count > 0 ? fillColor : "#e0e0da"}
          className="transition-all duration-700"
        />
        {/* Neck glass overlay */}
        <rect
          x={tubeX + 4}
          y={neckTop}
          width={tubeW - 8}
          height={neckH}
          fill={`url(#${uid}-glass)`}
          opacity="0.2"
        />

        {/* === Bulb === */}
        {/* Outer ring */}
        <circle
          cx={tubeCx}
          cy={bulbCy}
          r={bulbR}
          fill={`url(#${uid}-glass)`}
          stroke="#b0b0a8"
          strokeWidth="1.2"
        />

        {/* Filled bulb */}
        <circle
          cx={tubeCx}
          cy={bulbCy}
          r={bulbR - 2}
          fill={count > 0 ? bulbColor : "#e0e0da"}
          className="transition-all duration-700"
        />

        {/* Bulb highlight (shine) */}
        <ellipse
          cx={tubeCx - 6}
          cy={bulbCy - 7}
          rx={5}
          ry={6}
          fill="rgba(255,255,255,0.25)"
        />
        <circle
          cx={tubeCx - 4}
          cy={bulbCy - 9}
          r={2.5}
          fill="rgba(255,255,255,0.35)"
        />

        {/* Tube border overlay (crisp edge on top) */}
        <rect
          x={tubeX}
          y={tubeTop}
          width={tubeW}
          height={tubeH}
          rx={tubeR}
          fill="none"
          stroke="#b0b0a8"
          strokeWidth="1.2"
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
          if (data && typeof data.this_side === "number") setCounts(data);
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
      {/* Headline */}
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
      <div className="flex gap-4 sm:gap-8">
        <SingleThermometer
          count={counts.this_side}
          goal={goal}
          label="This Side"
          icon="👤"
          fillColor="#1a6b38"
          fillColorLight="#2d8a4e"
          bulbColor="#1a6b38"
          textColor="#1a4d2e"
          accentColor="#4da76b"
          uid="thermo-this"
          animated={animated}
        />
        <SingleThermometer
          count={counts.other_side}
          goal={goal}
          label="Other Side"
          icon="✨"
          fillColor="#d4a017"
          fillColorLight="#e6b33e"
          bulbColor="#b8860b"
          textColor="#7a5213"
          accentColor="#e6b33e"
          uid="thermo-other"
          animated={animated}
        />
      </div>

      {/* Combined total */}
      <div className="text-center text-charcoal/40 text-xs mt-1">
        {total} total acts of service across both sides
      </div>
    </div>
  );
}
