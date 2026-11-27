"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Cookie-free page view and contact-click tracking (first-party, stored in our own database).
 * Add data-track="website" (or instagram, phone, email, contact_button) to any link to count clicks on it.
 */
function send(body: Record<string, string | number>) {
  // Automated browsers (Playwright, Selenium, etc.) set navigator.webdriver; tell the server so they aren't counted as people.
  const json = JSON.stringify(navigator.webdriver ? { ...body, w: 1 } : body);
  try {
    if (navigator.sendBeacon?.("/api/track", new Blob([json], { type: "application/json" }))) return;
  } catch {}
  fetch("/api/track", { method: "POST", body: json, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
}

export function Tracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    // Only the first page of a visit has a meaningful external referrer.
    send({ k: "pageview", p: pathname, r: first.current ? document.referrer : "" });
    first.current = false;
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      if (!el) return;
      send({ k: "contact", p: location.pathname, d: el.getAttribute("data-track") ?? "" });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
