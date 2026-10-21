import { useEffect, useState } from "react";
import { chartColor } from "../styles/theme";

type Slice = { key: string; label: string; value: number; pct: number };

export function DonutChart({ slices, center }: { slices: Slice[]; center?: string }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setDrawn(true), 40);
    return () => window.clearTimeout(id);
  }, [slices]);

  const radius = 42;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col gap-4">
      <svg viewBox="0 0 120 120" className="mx-auto h-40 w-40" role="img" aria-label="Cost breakdown chart">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--muted)" strokeWidth="14" />
        {slices.map((slice) => {
          const length = circ * slice.pct;
          const dash = drawn ? length : 0;
          const element = (
            <circle
              key={slice.key}
              className="donut-seg"
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={chartColor(slice.key)}
              strokeWidth="14"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform="rotate(-90 60 60)"
            />
          );
          offset += length;
          return element;
        })}
        {center ? (
          <text x="60" y="64" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--foreground)">
            {center}
          </text>
        ) : null}
      </svg>
      <ul className="space-y-2.5">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center gap-2.5 text-[15px] leading-snug">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: chartColor(slice.key) }} />
            <span className="min-w-0 flex-1">{slice.label}</span>
            <span className="font-semibold tabular-nums">{Math.round(slice.pct * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Gantt({ phases, total }: { phases: { name: string; days: number; label: string }[]; total: number }) {
  return (
    <div className="space-y-2.5">
      {phases.map((phase) => (
        <div key={phase.name} className="grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-2.5">
          <span className="text-[13px] leading-tight text-muted-foreground">{phase.name}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(8, (phase.days / total) * 100)}%` }} />
          </span>
          <span className="text-right text-[13px] font-semibold tabular-nums">{phase.label}</span>
        </div>
      ))}
    </div>
  );
}
