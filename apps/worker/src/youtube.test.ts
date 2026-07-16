import { describe, expect, it } from "vitest";
import { isYouTubeQuotaFailure, normalizeYtDlpSearch, normalizeYouTubeSearch } from "./youtube";

describe("YouTube provider normalization", () => {
  it("detects quota errors", () =>
    expect(isYouTubeQuotaFailure(403, { error: { errors: [{ reason: "quotaExceeded" }] } })).toBe(
      true,
    ));
  it("normalizes official results", () =>
    expect(
      normalizeYouTubeSearch({
        items: [{ id: { channelId: "abc" }, snippet: { channelTitle: "Channel" } }],
      })[0]?.url,
    ).toContain("abc"));
  it("normalizes yt-dlp results", () =>
    expect(
      normalizeYtDlpSearch({
        channels: [{ id: "abc", title: "Channel", url: "https://youtube.com/@channel" }],
      })[0]?.provider,
    ).toBe("yt-dlp"));
});
