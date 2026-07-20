import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "./index";

afterEach(() => vi.unstubAllGlobals());

describe("Turnstile verification", () => {
  it("stays disabled when neither verification path is configured", async () => {
    await expect(verifyTurnstile(undefined, {}, "127.0.0.1")).resolves.toBe(true);
  });

  it("fails closed when a configured verification path receives no token", async () => {
    await expect(
      verifyTurnstile(undefined, { TURNSTILE_VERIFY_URL: "https://verify.example" }, "127.0.0.1"),
    ).resolves.toBe(false);
  });

  it("uses the managed verification Worker and forwards the client IP", async () => {
    const fetchMock = vi.fn(async () => Response.json({ success: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      verifyTurnstile(
        "valid-token",
        { TURNSTILE_VERIFY_URL: "https://verify.example" },
        "203.0.113.8",
      ),
    ).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://verify.example",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ token: "valid-token", remoteip: "203.0.113.8" }),
      }),
    );
  });

  it("rejects unsuccessful or unavailable verification responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ success: false })),
    );
    await expect(
      verifyTurnstile(
        "invalid-token",
        { TURNSTILE_VERIFY_URL: "https://verify.example" },
        "203.0.113.8",
      ),
    ).resolves.toBe(false);
  });
});
