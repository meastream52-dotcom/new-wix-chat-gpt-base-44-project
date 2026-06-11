import { createHash } from "crypto";

/** Pure spam heuristics — unit-tested, no DB access. */

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").replace(/[^\p{L}\p{N} ]/gu, "").trim();
}

export function contentHash(text: string): string {
  return createHash("sha256").update(normalizeText(text)).digest("hex").slice(0, 32);
}

const LINK_RE = /https?:\/\/[^\s)]+/gi;

export interface SpamVerdict {
  spam: boolean;
  reason?: string;
}

/**
 * Write-time filter for comments from young accounts: more than 2 links, or
 * links making up more than 30% of the content, is rejected outright.
 */
export function checkLinkDensity(content: string, accountAgeDays: number): SpamVerdict {
  if (accountAgeDays >= 7) return { spam: false };

  const links = content.match(LINK_RE) ?? [];
  if (links.length > 2) {
    return { spam: true, reason: "Too many links for a new account" };
  }
  const linkChars = links.reduce((sum, l) => sum + l.length, 0);
  if (content.length > 0 && linkChars / content.length > 0.3) {
    return { spam: true, reason: "Link-heavy comment from a new account" };
  }
  return { spam: false };
}

export function matchesBannedPattern(content: string, patterns: string[]): boolean {
  const normalized = normalizeText(content);
  return patterns.some((p) => p && normalized.includes(normalizeText(p)));
}

/** Iterative Levenshtein with two rows — fine for comment-sized strings. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** True when normalized texts differ by less than 10%. */
export function isNearDuplicate(a: string, b: string): boolean {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (na.length === 0 || nb.length === 0) return false;
  const maxLen = Math.max(na.length, nb.length);
  // Cheap guard: length difference alone exceeding 10% can't be a near-dup
  if (Math.abs(na.length - nb.length) / maxLen >= 0.1) return false;
  return levenshtein(na, nb) / maxLen < 0.1;
}
