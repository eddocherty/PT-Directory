import { ImageResponse } from "next/og";

export const alt = "LocalPT: independent trainers, near you.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The preview card shown when a LocalPT link is shared. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f4f6fa", color: "#111214", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 52, fontWeight: 700, letterSpacing: -2 }}>
          Local
          <div style={{ display: "flex", background: "#2457c5", color: "#fff", borderRadius: 12, padding: "4px 14px", fontSize: 44 }}>PT</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Independent trainers,</div>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1, color: "#2457c5" }}>near you.</div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#5b5f66" }}>Personal trainers, Pilates instructors and small studios across the UK.</div>
        </div>
      </div>
    ),
    size,
  );
}
