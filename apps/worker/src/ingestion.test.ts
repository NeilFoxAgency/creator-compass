import { describe, expect, it } from "vitest";
import {
  deterministicProfile,
  extractPage,
  ingestUserText,
  readBoundedBody,
  validatePublicUrl,
} from "./ingestion";

describe("safe URL validation", () => {
  it.each([
    "http://localhost",
    "http://127.0.0.1",
    "http://10.2.3.4",
    "http://169.254.169.254/latest",
    "http://[::1]",
    "file:///etc/passwd",
    "https://user:pass@example.com",
    "https://example.com:8443",
  ])("rejects %s", (url) => expect(() => validatePublicUrl(url)).toThrow());
  it("normalizes a public URL", () =>
    expect(validatePublicUrl("HTTPS://WWW.Example.com:443/path#x").toString()).toBe(
      "https://www.example.com/path",
    ));
});

describe("HTML extraction", () => {
  it("bounds a website body that never finishes streaming", async () => {
    const response = new Response(new ReadableStream({ pull() {} }));
    await expect(readBoundedBody(response, 10)).rejects.toThrow(/timed out/i);
  });

  it("extracts useful text without scripts, navigation, or cookie text", () => {
    const page = extractPage(
      `<html><head><title>Acme Tools</title><meta name="description" content="Tools for careful makers"></head><body><nav>Cookie settings</nav><h1>Build with confidence</h1><p>Our precision tools help home craftspeople complete safer projects.</p><script>alert(1)</script></body></html>`,
      "https://example.com",
    );
    expect(page.text).toContain("Build with confidence");
    expect(page.text).not.toContain("alert");
    expect(page.text).not.toContain("Cookie settings");
  });
  it("creates bounded evidence from provided text", () =>
    expect(ingestUserText("A".repeat(900)).evidence.length).toBeGreaterThan(1));

  it("extracts grounded beauty and local-service jobs from pasted context", () => {
    const beautyText =
      "Glossier sells physical skincare and makeup products to beauty consumers who compare shades, textures, and application techniques.";
    const beauty = deterministicProfile(
      "provided-brand.example",
      beautyText,
      ingestUserText(beautyText).evidence,
    );
    expect(beauty.brandName).toBe("Glossier");
    expect(beauty.jobsToBeDone).toEqual(
      expect.arrayContaining(["choose a skincare routine", "choose beauty products"]),
    );

    const serviceText =
      "CoolToday is a local home-services company helping homeowners with HVAC installation and urgent home repair by a local technician.";
    const service = deterministicProfile(
      "provided-brand.example",
      serviceText,
      ingestUserText(serviceText).evidence,
    );
    expect(service.jobsToBeDone).toEqual(
      expect.arrayContaining(["repair a home system", "find a trusted local provider"]),
    );
  });
});
