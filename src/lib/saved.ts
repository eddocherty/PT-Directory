"use client";

import { useSyncExternalStore } from "react";

/**
 * Shortlist and recently viewed trainers, kept in the visitor's own browser (localStorage).
 * No account and nothing sent to us. If storage is blocked (private mode), lists just stay empty.
 */
export type SavedTrainer = { slug: string; name: string; city: string | null; styles: string[]; goals: string[] };

const KEYS = { shortlist: "localpt:shortlist", recent: "localpt:recent" } as const;
type ListName = keyof typeof KEYS;
const MAX = { shortlist: 50, recent: 12 };
const EMPTY: SavedTrainer[] = [];
const cache: Partial<Record<ListName, { raw: string | null; list: SavedTrainer[] }>> = {};
const listeners = new Set<() => void>();

function read(name: ListName): SavedTrainer[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEYS[name]);
  } catch {
    return EMPTY;
  }
  const hit = cache[name];
  if (hit && hit.raw === raw) return hit.list;
  let list: SavedTrainer[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) list = parsed.filter((t) => t && typeof t.slug === "string" && typeof t.name === "string");
  } catch {}
  cache[name] = { raw, list };
  return list;
}

function write(name: ListName, list: SavedTrainer[]) {
  try {
    localStorage.setItem(KEYS[name], JSON.stringify(list.slice(0, MAX[name])));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (!e.key || Object.values(KEYS).includes(e.key as (typeof KEYS)[ListName])) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSaved(name: ListName): SavedTrainer[] {
  return useSyncExternalStore(subscribe, () => read(name), () => EMPTY);
}

export function isShortlisted(list: SavedTrainer[], slug: string) {
  return list.some((t) => t.slug === slug);
}

export function toggleShortlist(t: SavedTrainer) {
  const list = read("shortlist");
  write("shortlist", isShortlisted(list, t.slug) ? list.filter((x) => x.slug !== t.slug) : [pick(t), ...list]);
}

export function removeSaved(name: ListName, slug: string) {
  write(name, read(name).filter((x) => x.slug !== slug));
}

export function clearSaved(name: ListName) {
  write(name, []);
}

export function rememberViewed(t: SavedTrainer) {
  write("recent", [pick(t), ...read("recent").filter((x) => x.slug !== t.slug)]);
}

const pick = (t: SavedTrainer): SavedTrainer => ({ slug: t.slug, name: t.name, city: t.city, styles: t.styles.slice(0, 4), goals: t.goals.slice(0, 4) });
