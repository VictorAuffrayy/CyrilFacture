import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Cellule vide : tiret moyen U+2013, jamais de tiret cadratin (règle LNS). */
export const EMPTY = '–'

/** Search key: lowercase, accents stripped ("Région" and "region" match). */
export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Initials from a full name, e.g. "Marie Eve" -> "ME". */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

/** Deterministic color index from a string (stable avatars/tags). */
export function hashIndex(str: string, mod: number): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h % mod
}
