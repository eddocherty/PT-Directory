"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/** Set on ed's own browsers by the admin area, so Vercel's count leaves them out too. */
export const MINE_FLAG = "lpt-mine";

function ours(): boolean {
  try {
    if (navigator.webdriver || /\bClaude\/\d/.test(navigator.userAgent)) return true;
    return localStorage.getItem(MINE_FLAG) === "1";
  } catch {
    return false;
  }
}

/** Vercel Web Analytics, minus ed's own devices, Claude's browser and automated test browsers. */
export function SiteAnalytics() {
  return <Analytics beforeSend={(e: BeforeSendEvent) => (ours() ? null : e)} />;
}
