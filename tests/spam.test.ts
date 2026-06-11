import { describe, expect, it } from "vitest";
import {
  checkLinkDensity,
  contentHash,
  isNearDuplicate,
  levenshtein,
  matchesBannedPattern,
  normalizeText,
} from "@/lib/moderation/spam";

describe("link density filter", () => {
  it("rejects 3+ links from a new account", () => {
    const spam = "check https://a.io and https://b.io and https://c.io now";
    expect(checkLinkDensity(spam, 1).spam).toBe(true);
  });

  it("rejects link-heavy short comments from new accounts", () => {
    expect(checkLinkDensity("https://sketchy.example/really-long-promo-link go", 2).spam).toBe(true);
  });

  it("allows the same content from an established account", () => {
    const spam = "check https://a.io and https://b.io and https://c.io now";
    expect(checkLinkDensity(spam, 30).spam).toBe(false);
  });

  it("allows normal comments from new accounts", () => {
    expect(checkLinkDensity("Loved this piece, especially the ending.", 0).spam).toBe(false);
  });
});

describe("near-duplicate detection", () => {
  it("hashes normalized text identically across whitespace/punctuation", () => {
    expect(contentHash("Great post!!!")).toBe(contentHash("great   post"));
  });

  it("computes Levenshtein distance", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("same", "same")).toBe(0);
  });

  it("flags near-identical long comments", () => {
    const a = "This is a wonderful article about the economics of attention and writing online for money";
    const b = "This is a wonderful article about the economics of attention and writing online for cash!";
    expect(isNearDuplicate(a, b)).toBe(true);
  });

  it("does not flag genuinely different comments", () => {
    expect(isNearDuplicate("Loved the intro.", "The conclusion felt rushed to me.")).toBe(false);
  });
});

describe("banned patterns", () => {
  it("matches case- and punctuation-insensitively", () => {
    expect(matchesBannedPattern("BUY   Followers now!!", ["buy followers"])).toBe(true);
    expect(matchesBannedPattern("organic growth tips", ["buy followers"])).toBe(false);
  });

  it("normalizes unicode-ish input", () => {
    expect(normalizeText("  Hello,   WORLD! ")).toBe("hello world");
  });
});
