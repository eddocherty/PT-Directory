"use client";

import { useState } from "react";

type Day = { day: string; pageviews: number; visitors: number };

const label = (d: string, long = false) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", long ? { weekday: "short", day: "numeric", month: "short" } : { day: "numeric", month: "short" });

/** Single-series bar chart of page views per day, with a hover tooltip. */
export function DailyChart({ daily }: { daily: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!daily.length) return null;
  const max = Math.max(1, ...daily.map((d) => Number(d.pageviews)));
  const nice = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / nice) * nice;
  const W = 800, H = 220, L = 40, B = 24, T = 8;
  const bw = (W - L) / daily.length;
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const every = Math.ceil(daily.length / 8);
  const h = hover != null ? daily[hover] : null;

  return (
    <div className="relative mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Page views per day" onMouseLeave={() => setHover(null)}>
        {[0, top / 2, top].map((v) => (
          <g key={v}>
            <line x1={L} x2={W} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">{v.toLocaleString("en-GB")}</text>
          </g>
        ))}
        {daily.map((d, i) => {
          const v = Number(d.pageviews);
          const x = L + i * bw;
          const w = Math.max(1, bw - 2);
          const barTop = y(v);
          const hgt = H - B - barTop;
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)}>
              <rect x={x} y={T} width={bw} height={H - T - B} fill="transparent" />
              {v > 0 && (
                <path
                  d={`M${x + 1},${H - B} v${-Math.max(0, hgt - Math.min(4, w / 2, hgt))} q0,${-Math.min(4, w / 2, hgt)} ${Math.min(4, w / 2)},${-Math.min(4, w / 2, hgt)} h${w - 2 * Math.min(4, w / 2)} q${Math.min(4, w / 2)},0 ${Math.min(4, w / 2)},${Math.min(4, w / 2, hgt)} V${H - B} Z`}
                  fill="var(--accent)"
                  opacity={hover == null || hover === i ? 1 : 0.45}
                />
              )}
              {i % every === 0 && (
                <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--muted)">{label(d.day)}</text>
              )}
            </g>
          );
        })}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute top-0 rounded-xl bg-ink px-3 py-2 text-xs text-paper shadow"
          style={{ left: `${((L + (hover! + 0.5) * bw) / W) * 100}%`, transform: "translateX(-50%)" }}
        >
          <p className="font-semibold">{label(h.day, true)}</p>
          <p>{Number(h.pageviews).toLocaleString("en-GB")} page views</p>
          <p>{Number(h.visitors).toLocaleString("en-GB")} visitors</p>
        </div>
      )}
    </div>
  );
}
