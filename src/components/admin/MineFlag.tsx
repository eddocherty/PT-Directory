"use client";

import { useEffect } from "react";
import { MINE_FLAG } from "@/components/SiteAnalytics";

/** Mirrors the "This device is mine" switch into this browser, for Vercel's own analytics count. */
export function MineFlag({ mine }: { mine: boolean }) {
  useEffect(() => {
    try {
      if (mine) localStorage.setItem(MINE_FLAG, "1");
      else localStorage.removeItem(MINE_FLAG);
    } catch {}
  }, [mine]);
  return null;
}
